// src/hooks/use-session-polls.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useSessionSocketOptional } from "@/context/SessionSocketContext";
import { useSocketCache } from "./use-socket-cache";
import { useNetworkStatus } from "./use-network-status";

// Generate UUID v4 using built-in crypto API
const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ============================================
// TypeScript Interfaces
// ============================================

export interface PollCreator {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface PollOption {
  id: string;
  text: string;
  pollId: string;
  voteCount?: number;
}

export interface Poll {
  id: string;
  question: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
  creatorId: string;
  sessionId: string;
  options: PollOption[];
  totalVotes?: number;
  creator?: PollCreator;
  // Quiz mode fields
  isQuiz?: boolean;
  correctOptionId?: string; // The correct answer for quiz polls
  giveawayEnabled?: boolean;
}

export interface PollResultEnvelope {
  poll: Poll;
  userVotedForOptionId: string | null;
}

// Prize types
export type PrizeType = "physical" | "virtual" | "voucher";

// Enhanced prize configuration
export interface PrizeConfig {
  title: string;
  description?: string;
  type: PrizeType;
  value?: number;
  claimInstructions?: string;
  claimLocation?: string; // For physical prizes
  claimDeadlineHours?: number;
}

// Enhanced giveaway winner details
export interface GiveawayWinner {
  id: string;
  name?: string; // Computed name from backend (firstName + lastName or email prefix)
  firstName: string | null;
  lastName: string | null;
  email?: string; // Only sent to organizers, not in public broadcast
  optionText?: string;
}

// Enhanced giveaway result
export interface GiveawayResult {
  pollId: string;
  winner: GiveawayWinner | null;
  prize: string; // Backward compatible - simple prize string
  prizeDetails?: PrizeConfig; // Enhanced prize info from backend
  totalEligibleVoters?: number;
  emailSent?: boolean;
}

// Quiz score result for multi-poll giveaways
export interface QuizScoreResult {
  rank: number;
  userId?: string;
  attendeeId?: string;
  name: string;
  email?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  isWinner: boolean;
}

// Quiz giveaway result
export interface QuizGiveawayResult {
  sessionId: string;
  stats: {
    totalPolls: number;
    passingScore: number;
    totalWinners: number;
    totalParticipants: number;
    scoreDistribution: Record<number, number>;
  };
  currentUserResult?: {
    isWinner: boolean;
    score: number;
    totalQuestions: number;
    rank: number;
    prize?: PrizeConfig;
  };
  winners?: QuizScoreResult[];
}

// Response types
interface SocketResponse<T = void> {
  success: boolean;
  pollId?: string;
  error?: { message: string; statusCode: number } | string;
  finalStatus?: string;
  winner?: T;
}

interface PollHistoryPayload {
  polls: PollResultEnvelope[];
}

interface PollsStatusPayload {
  sessionId: string;
  isOpen: boolean;
  message: string;
}

interface SessionPollsState {
  polls: Map<string, Poll>;
  userVotes: Map<string, string>; // pollId -> optionId
  isConnected: boolean;
  isJoined: boolean;
  error: string | null;
  accessDenied: boolean;
  pollsOpen: boolean;
  latestGiveaway: GiveawayResult | null;
  latestQuizGiveaway: QuizGiveawayResult | null;
}

// Cache shape for polls — defined at module level so the serialize/deserialize
// functions below maintain stable references (avoids re-creating useCallback on every render)
interface PollsCacheData {
  polls: [string, Poll][];
  userVotes: [string, string][];
}

const serializePolls = (data: PollsCacheData): unknown => ({
  polls: data.polls,
  userVotes: data.userVotes,
});

const deserializePolls = (raw: unknown): PollsCacheData => {
  const r = raw as PollsCacheData;
  return {
    polls: r.polls || [],
    userVotes: r.userVotes || [],
  };
};

export const useSessionPolls = (
  sessionId: string,
  eventId: string,
  initialPollsOpen: boolean = false
) => {
  // Try to get shared socket from SessionSocketProvider (if available)
  const sharedSocketContext = useSessionSocketOptional();
  const usingSharedSocket = sharedSocketContext !== null;

  // --- Offline cache support ---
  const { isOnline } = useNetworkStatus();

  const {
    cachedData: cachedPolls,
    cacheLoaded,
    cachedAt,
    isStale: isCacheStale,
    persistToCache,
  } = useSocketCache<PollsCacheData>({
    feature: "polls",
    sessionId,
    serialize: serializePolls,
    deserialize: deserializePolls,
  });

  const [ownSocket, setOwnSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SessionPollsState>({
    polls: new Map(),
    userVotes: new Map(),
    isConnected: false,
    isJoined: false,
    error: null,
    accessDenied: false,
    pollsOpen: initialPollsOpen,
    latestGiveaway: null,
    latestQuizGiveaway: null,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isVoting, setIsVoting] = useState<string | null>(null); // pollId being voted on
  const [isClosing, setIsClosing] = useState<string | null>(null); // pollId being closed
  const { token, user } = useAuthStore();
  const pollsRef = useRef<Map<string, Poll>>(new Map());
  const socketCreatedRef = useRef(false);

  // Determine which socket to use
  const socket = usingSharedSocket ? sharedSocketContext.socket : ownSocket;

  // Keep pollsRef in sync
  useEffect(() => {
    pollsRef.current = state.polls;
  }, [state.polls]);

  // Sync initialPollsOpen prop changes to state (when organizer toggles via mutation)
  useEffect(() => {
    setState((prev) => ({ ...prev, pollsOpen: initialPollsOpen }));
  }, [initialPollsOpen]);

  // Restore polls from cache on mount (before socket connects)
  useEffect(() => {
    if (
      cachedPolls &&
      cachedPolls.polls.length > 0 &&
      state.polls.size === 0 &&
      !state.isJoined
    ) {
      setState((prev) => ({
        ...prev,
        polls: new Map(cachedPolls.polls),
        userVotes: new Map(cachedPolls.userVotes),
      }));
    }
  }, [cachedPolls]);

  // Sync state with shared socket context if using it
  useEffect(() => {
    if (usingSharedSocket && sharedSocketContext) {
      setState((prev) => ({
        ...prev,
        isConnected: sharedSocketContext.isConnected,
        isJoined: sharedSocketContext.isJoined,
        pollsOpen: sharedSocketContext.pollsOpen,
        error: sharedSocketContext.error,
      }));
    }
  }, [
    usingSharedSocket,
    sharedSocketContext?.isConnected,
    sharedSocketContext?.isJoined,
    sharedSocketContext?.pollsOpen,
    sharedSocketContext?.error,
  ]);

  // Create own socket ONLY if not using shared socket
  useEffect(() => {
    // Skip if using shared socket from provider
    if (usingSharedSocket) {
      console.log('[useSessionPolls] Using shared socket from SessionSocketProvider');
      return;
    }

    if (!sessionId || !eventId || !token) {
      console.log("[Polls] Missing required params", {
        sessionId,
        eventId,
        hasToken: !!token,
      });
      return;
    }

    // Prevent duplicate socket creation (React StrictMode safety)
    if (socketCreatedRef.current) {
      return;
    }

    console.log('[useSessionPolls] Creating own socket connection (no shared provider)');
    socketCreatedRef.current = true;

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId, eventId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setOwnSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("[Polls] Socket connected:", newSocket.id);
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", () => {
      console.log("[Polls] Connection acknowledged, joining session room:", sessionId);

      newSocket.emit(
        "session.join",
        { sessionId, eventId },
        (response: {
          success: boolean;
          error?: { message: string; statusCode: number };
          session?: {
            chatOpen?: boolean;
            qaOpen?: boolean;
            pollsEnabled?: boolean;
            pollsOpen?: boolean;
          };
        }) => {
          if (response?.success === false) {
            const errorMsg = response.error?.message || "Failed to join session";
            const isAccessDenied = response.error?.statusCode === 403;

            console.error("[Polls] Failed to join session:", errorMsg);
            setState((prev) => ({
              ...prev,
              isJoined: false,
              error: isAccessDenied
                ? "You are not registered for this event"
                : errorMsg,
              accessDenied: isAccessDenied,
            }));
            return;
          }

          // Successfully joined - update pollsOpen from server if provided
          const pollsOpenFromServer =
            response.session?.pollsOpen ?? initialPollsOpen;
          setState((prev) => ({
            ...prev,
            isJoined: true,
            accessDenied: false,
            pollsOpen: pollsOpenFromServer,
          }));
          console.log(
            "[Polls] Joined session room, pollsOpen:",
            pollsOpenFromServer
          );
        }
      );
    });

    // Listen for poll history - backend sends this after session.join
    newSocket.on("poll.history", (data: PollHistoryPayload) => {
      console.log("[Polls] Received poll.history event:", data);
      console.log("[Polls] Polls count:", data?.polls?.length || 0);

      if (data?.polls && Array.isArray(data.polls)) {
        const newPolls = new Map<string, Poll>();
        const newUserVotes = new Map<string, string>();

        data.polls.forEach(({ poll, userVotedForOptionId }) => {
          newPolls.set(poll.id, poll);
          if (userVotedForOptionId) {
            newUserVotes.set(poll.id, userVotedForOptionId);
          }
        });

        setState((prev) => ({
          ...prev,
          polls: newPolls,
          userVotes: newUserVotes,
        }));

        // Persist to cache for offline access
        persistToCache({
          polls: Array.from(newPolls.entries()),
          userVotes: Array.from(newUserVotes.entries()),
        });
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Polls] Socket disconnected:", reason);
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    // New poll created
    newSocket.on("poll.opened", (poll: Poll) => {
      console.log("[Polls] New poll received:", poll);
      setState((prev) => {
        const newPolls = new Map(prev.polls);
        newPolls.set(poll.id, poll);
        return { ...prev, polls: newPolls };
      });
    });

    // Poll results updated (someone voted)
    newSocket.on("poll.results.updated", (envelope: PollResultEnvelope) => {
      console.log("[Polls] Results updated for poll:", envelope.poll.id);
      setState((prev) => {
        const newPolls = new Map(prev.polls);
        newPolls.set(envelope.poll.id, envelope.poll);

        const newUserVotes = new Map(prev.userVotes);
        if (envelope.userVotedForOptionId) {
          newUserVotes.set(envelope.poll.id, envelope.userVotedForOptionId);
        }

        return { ...prev, polls: newPolls, userVotes: newUserVotes };
      });
    });

    // Poll closed
    newSocket.on("poll.closed", (envelope: PollResultEnvelope) => {
      console.log("[Polls] Poll closed:", envelope.poll.id);
      setState((prev) => {
        const newPolls = new Map(prev.polls);
        newPolls.set(envelope.poll.id, { ...envelope.poll, isActive: false });
        return { ...prev, polls: newPolls };
      });
    });

    // Giveaway winner announced
    newSocket.on("poll.giveaway.winner", (result: GiveawayResult) => {
      console.log("[Polls] Giveaway winner:", result);
      setState((prev) => ({ ...prev, latestGiveaway: result }));
    });

    // Quiz giveaway results announced
    newSocket.on("quiz.giveaway.results", (result: QuizGiveawayResult) => {
      console.log("[Polls] Quiz giveaway results:", result);
      setState((prev) => ({ ...prev, latestQuizGiveaway: result }));
    });

    // Polls status changed (open/close by organizer)
    newSocket.on("polls.status.changed", (data: PollsStatusPayload) => {
      console.log("[Polls] Status changed:", data);
      if (data.sessionId === sessionId) {
        setState((prev) => ({
          ...prev,
          pollsOpen: data.isOpen,
        }));
      }
    });

    // Error handling
    newSocket.on("systemError", (error: { message: string; reason: string }) => {
      console.error("[Polls] System error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Polls] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Cleanup
    return () => {
      console.log("[Polls] Cleaning up own socket connection");
      socketCreatedRef.current = false;
      newSocket.emit("session.leave", { sessionId });
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("poll.history");
      newSocket.off("disconnect");
      newSocket.off("poll.opened");
      newSocket.off("poll.results.updated");
      newSocket.off("poll.closed");
      newSocket.off("poll.giveaway.winner");
      newSocket.off("quiz.giveaway.results");
      newSocket.off("polls.status.changed");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
    };
  }, [usingSharedSocket, sessionId, eventId, token, initialPollsOpen]);

  // Set up Polls-specific event listeners when using shared socket
  useEffect(() => {
    if (!usingSharedSocket || !socket) {
      return;
    }

    console.log('[useSessionPolls] Setting up Polls listeners on shared socket');

    // Handler functions for Polls events
    const handlePollHistory = (data: PollHistoryPayload) => {
      if (data?.polls && Array.isArray(data.polls)) {
        const newPolls = new Map<string, Poll>();
        const newUserVotes = new Map<string, string>();

        data.polls.forEach(({ poll, userVotedForOptionId }) => {
          newPolls.set(poll.id, poll);
          if (userVotedForOptionId) {
            newUserVotes.set(poll.id, userVotedForOptionId);
          }
        });

        setState((prev) => ({
          ...prev,
          polls: newPolls,
          userVotes: newUserVotes,
        }));

        // Persist to cache for offline access
        persistToCache({
          polls: Array.from(newPolls.entries()),
          userVotes: Array.from(newUserVotes.entries()),
        });
      }
    };

    const handlePollOpened = (poll: Poll) => {
      setState((prev) => {
        const newPolls = new Map(prev.polls);
        newPolls.set(poll.id, poll);
        return { ...prev, polls: newPolls };
      });
    };

    const handlePollResultsUpdated = (envelope: PollResultEnvelope) => {
      setState((prev) => {
        const newPolls = new Map(prev.polls);
        newPolls.set(envelope.poll.id, envelope.poll);

        const newUserVotes = new Map(prev.userVotes);
        if (envelope.userVotedForOptionId) {
          newUserVotes.set(envelope.poll.id, envelope.userVotedForOptionId);
        }

        return { ...prev, polls: newPolls, userVotes: newUserVotes };
      });
    };

    const handlePollClosed = (envelope: PollResultEnvelope) => {
      setState((prev) => {
        const newPolls = new Map(prev.polls);
        newPolls.set(envelope.poll.id, { ...envelope.poll, isActive: false });
        return { ...prev, polls: newPolls };
      });
    };

    const handleGiveawayWinner = (result: GiveawayResult) => {
      setState((prev) => ({ ...prev, latestGiveaway: result }));
    };

    const handleQuizGiveawayResults = (result: QuizGiveawayResult) => {
      setState((prev) => ({ ...prev, latestQuizGiveaway: result }));
    };

    const handlePollsStatusChanged = (data: PollsStatusPayload) => {
      if (data.sessionId === sessionId) {
        setState((prev) => ({
          ...prev,
          pollsOpen: data.isOpen,
        }));
      }
    };

    // Register listeners
    socket.on("poll.history", handlePollHistory);
    socket.on("poll.opened", handlePollOpened);
    socket.on("poll.results.updated", handlePollResultsUpdated);
    socket.on("poll.closed", handlePollClosed);
    socket.on("poll.giveaway.winner", handleGiveawayWinner);
    socket.on("quiz.giveaway.results", handleQuizGiveawayResults);
    socket.on("polls.status.changed", handlePollsStatusChanged);

    // Cleanup
    return () => {
      console.log('[useSessionPolls] Removing Polls listeners from shared socket');
      socket.off("poll.history", handlePollHistory);
      socket.off("poll.opened", handlePollOpened);
      socket.off("poll.results.updated", handlePollResultsUpdated);
      socket.off("poll.closed", handlePollClosed);
      socket.off("poll.giveaway.winner", handleGiveawayWinner);
      socket.off("quiz.giveaway.results", handleQuizGiveawayResults);
      socket.off("polls.status.changed", handlePollsStatusChanged);
    };
  }, [usingSharedSocket, socket, sessionId]);

  // Create a new poll (organizer/speaker)
  // Supports quiz mode with correct answer marking
  const createPoll = useCallback(
    async (
      question: string,
      options: string[],
      isQuiz: boolean = false,
      correctOptionIndex?: number
    ): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        console.error("[Polls] Cannot create poll - not connected");
        return false;
      }

      const trimmedQuestion = question.trim();
      if (!trimmedQuestion || trimmedQuestion.length > 500) {
        setState((prev) => ({
          ...prev,
          error: "Question must be between 1 and 500 characters",
        }));
        return false;
      }

      const validOptions = options
        .map((o) => o.trim())
        .filter((o) => o.length > 0 && o.length <= 200);

      if (validOptions.length < 2) {
        setState((prev) => ({
          ...prev,
          error: "At least 2 valid options are required",
        }));
        return false;
      }

      if (validOptions.length > 10) {
        setState((prev) => ({
          ...prev,
          error: "Maximum 10 options allowed",
        }));
        return false;
      }

      // Validate quiz mode settings
      if (isQuiz && (correctOptionIndex === undefined || correctOptionIndex < 0 || correctOptionIndex >= validOptions.length)) {
        setState((prev) => ({
          ...prev,
          error: "Quiz mode requires a valid correct answer selection",
        }));
        return false;
      }

      setIsCreating(true);

      return new Promise((resolve) => {
        const payload = {
          question: trimmedQuestion,
          options: validOptions.map((text, index) => ({
            text,
            isCorrect: isQuiz && index === correctOptionIndex,
          })),
          isQuiz,
          correctOptionIndex: isQuiz ? correctOptionIndex : undefined,
          idempotencyKey: generateUUID(),
        };

        console.log("[Polls] Creating poll with payload:", payload);

        socket.emit("poll.create", payload, (response: SocketResponse) => {
          setIsCreating(false);

          if (response?.success) {
            console.log("[Polls] Poll created:", response.pollId);
            resolve(true);
          } else {
            const errorMsg =
              typeof response?.error === "string"
                ? response.error
                : response?.error?.message || "Failed to create poll";
            console.error("[Polls] Failed to create poll:", errorMsg);
            setState((prev) => ({ ...prev, error: errorMsg }));
            resolve(false);
          }
        });
      });
    },
    [socket, state.isJoined]
  );

  // Submit a vote (attendee)
  const submitVote = useCallback(
    async (pollId: string, optionId: string): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        console.error("[Polls] Cannot vote - not connected");
        return false;
      }

      // Check if already voted
      if (state.userVotes.has(pollId)) {
        setState((prev) => ({
          ...prev,
          error: "You have already voted in this poll",
        }));
        return false;
      }

      // Check if poll exists and is active
      const poll = state.polls.get(pollId);
      if (!poll || !poll.isActive) {
        setState((prev) => ({
          ...prev,
          error: "This poll is no longer active",
        }));
        return false;
      }

      setIsVoting(pollId);

      // Optimistic update
      setState((prev) => {
        const newUserVotes = new Map(prev.userVotes);
        newUserVotes.set(pollId, optionId);

        const newPolls = new Map(prev.polls);
        const existingPoll = newPolls.get(pollId);
        if (existingPoll) {
          const updatedOptions = existingPoll.options.map((opt) =>
            opt.id === optionId
              ? { ...opt, voteCount: (opt.voteCount || 0) + 1 }
              : opt
          );
          newPolls.set(pollId, {
            ...existingPoll,
            options: updatedOptions,
            totalVotes: (existingPoll.totalVotes || 0) + 1,
          });
        }

        return { ...prev, polls: newPolls, userVotes: newUserVotes };
      });

      return new Promise((resolve) => {
        const payload = {
          pollId,
          optionId,
          idempotencyKey: generateUUID(),
        };

        socket.emit(
          "poll.vote.submit",
          payload,
          (response: SocketResponse) => {
            setIsVoting(null);

            if (response?.success) {
              console.log("[Polls] Vote submitted successfully");
              resolve(true);
            } else {
              const errorMsg =
                typeof response?.error === "string"
                  ? response.error
                  : response?.error?.message || "Failed to submit vote";
              console.error("[Polls] Failed to vote:", errorMsg);

              // Rollback optimistic update
              setState((prev) => {
                const newUserVotes = new Map(prev.userVotes);
                newUserVotes.delete(pollId);

                const newPolls = new Map(prev.polls);
                const existingPoll = pollsRef.current.get(pollId);
                if (existingPoll) {
                  newPolls.set(pollId, existingPoll);
                }

                return { ...prev, polls: newPolls, userVotes: newUserVotes, error: errorMsg };
              });
              resolve(false);
            }
          }
        );
      });
    },
    [socket, state.isJoined, state.userVotes, state.polls]
  );

  // Close a poll (organizer)
  const closePoll = useCallback(
    async (pollId: string): Promise<boolean> => {
      console.log("[Polls] ═══════════════════════════════════════════════════════════");
      console.log("[Polls] CLOSE POLL CALLED");
      console.log("[Polls] Poll ID:", pollId);
      console.log("[Polls] Socket exists:", !!socket);
      console.log("[Polls] Is joined:", state.isJoined);

      if (!socket || !state.isJoined) {
        console.error("[Polls] Cannot close poll - not connected");
        return false;
      }

      const poll = state.polls.get(pollId);
      console.log("[Polls] Found poll:", poll ? "yes" : "no");
      console.log("[Polls] Poll isActive:", poll?.isActive);

      if (!poll || !poll.isActive) {
        console.error("[Polls] Poll is already closed or does not exist");
        setState((prev) => ({
          ...prev,
          error: "Poll is already closed or does not exist",
        }));
        return false;
      }

      setIsClosing(pollId);

      // Optimistic update
      setState((prev) => {
        const newPolls = new Map(prev.polls);
        const existingPoll = newPolls.get(pollId);
        if (existingPoll) {
          newPolls.set(pollId, { ...existingPoll, isActive: false });
        }
        return { ...prev, polls: newPolls };
      });

      return new Promise((resolve) => {
        const payload = {
          pollId,
          action: "close",
          idempotencyKey: generateUUID(),
        };

        console.log("[Polls] Emitting poll.manage with payload:", JSON.stringify(payload, null, 2));

        // Set a timeout in case backend doesn't respond
        let callbackCalled = false;
        const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
            console.warn("[Polls] ⚠️ TIMEOUT - Backend didn't respond to poll.manage in 5 seconds");
            setIsClosing(null);
            // Keep optimistic update since we don't know if it succeeded
            resolve(true);
          }
        }, 5000);

        socket.emit("poll.manage", payload, (response: SocketResponse) => {
          callbackCalled = true;
          clearTimeout(timeoutId);
          setIsClosing(null);

          console.log("[Polls] ═══════════════════════════════════════════════════════════");
          console.log("[Polls] poll.manage CALLBACK RECEIVED");
          console.log("[Polls] Response:", JSON.stringify(response, null, 2));
          console.log("[Polls] ═══════════════════════════════════════════════════════════");

          if (response?.success) {
            console.log("[Polls] ✅ Poll closed successfully, status:", response.finalStatus);
            resolve(true);
          } else {
            const errorMsg =
              typeof response?.error === "string"
                ? response.error
                : response?.error?.message || "Failed to close poll";
            console.error("[Polls] ❌ Failed to close poll:", errorMsg);

            // Rollback optimistic update
            setState((prev) => {
              const newPolls = new Map(prev.polls);
              const existingPoll = pollsRef.current.get(pollId);
              if (existingPoll) {
                newPolls.set(pollId, existingPoll);
              }
              return { ...prev, polls: newPolls, error: errorMsg };
            });
            resolve(false);
          }
        });
      });
    },
    [socket, state.isJoined, state.polls]
  );

  // Start a giveaway (organizer) - poll must be closed first
  const startGiveaway = useCallback(
    async (
      pollId: string,
      winningOptionId: string,
      prize: string | PrizeConfig,
      sendEmail: boolean = true
    ): Promise<GiveawayWinner | null> => {
      if (!socket || !state.isJoined) {
        console.error("[Polls] Cannot start giveaway - not connected");
        return null;
      }

      const poll = state.polls.get(pollId);
      if (!poll) {
        setState((prev) => ({
          ...prev,
          error: "Poll does not exist",
        }));
        return null;
      }

      if (poll.isActive) {
        setState((prev) => ({
          ...prev,
          error: "Poll must be closed before running a giveaway",
        }));
        return null;
      }

      // Support both simple string prize and enhanced PrizeConfig
      const prizeConfig: PrizeConfig =
        typeof prize === "string"
          ? { title: prize.trim(), type: "virtual" }
          : prize;

      if (!prizeConfig.title || prizeConfig.title.length > 255) {
        setState((prev) => ({
          ...prev,
          error: "Prize title must be between 1 and 255 characters",
        }));
        return null;
      }

      return new Promise((resolve) => {
        const payload = {
          pollId,
          winningOptionId,
          prize: prizeConfig,
          sendEmail,
          idempotencyKey: generateUUID(),
        };

        console.log("[Polls] Starting giveaway with payload:", payload);

        socket.emit(
          "poll.giveaway.start",
          payload,
          (response: SocketResponse<GiveawayWinner>) => {
            if (response?.success) {
              console.log("[Polls] Giveaway winner:", response.winner);
              resolve(response.winner || null);
            } else {
              const errorMsg =
                typeof response?.error === "string"
                  ? response.error
                  : response?.error?.message || "Failed to start giveaway";
              console.error("[Polls] Failed to start giveaway:", errorMsg);
              setState((prev) => ({ ...prev, error: errorMsg }));
              resolve(null);
            }
          }
        );
      });
    },
    [socket, state.isJoined, state.polls]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Clear giveaway result
  const clearGiveaway = useCallback(() => {
    setState((prev) => ({ ...prev, latestGiveaway: null }));
  }, []);

  // Clear quiz giveaway result
  const clearQuizGiveaway = useCallback(() => {
    setState((prev) => ({ ...prev, latestQuizGiveaway: null }));
  }, []);

  // Check if user has voted on a poll
  const hasVoted = useCallback(
    (pollId: string): boolean => {
      return state.userVotes.has(pollId);
    },
    [state.userVotes]
  );

  // Get user's vote for a poll
  const getUserVote = useCallback(
    (pollId: string): string | undefined => {
      return state.userVotes.get(pollId);
    },
    [state.userVotes]
  );

  // Debounced persist on incremental changes (votes, new polls, closes)
  useEffect(() => {
    if (!state.isJoined || state.polls.size === 0) return;

    const timer = setTimeout(() => {
      persistToCache({
        polls: Array.from(state.polls.entries()),
        userVotes: Array.from(state.userVotes.entries()),
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [state.polls, state.userVotes, state.isJoined, persistToCache]);

  // Computed values
  const pollsArray = Array.from(state.polls.values());
  const activePolls = pollsArray.filter((p) => p.isActive);
  const closedPolls = pollsArray.filter((p) => !p.isActive);

  // Sort by creation date (newest first)
  const sortedActivePolls = [...activePolls].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedClosedPolls = [...closedPolls].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    // State
    polls: state.polls,
    pollsArray,
    activePolls: sortedActivePolls,
    closedPolls: sortedClosedPolls,
    userVotes: state.userVotes,
    isConnected: state.isConnected,
    isJoined: state.isJoined,
    error: state.error,
    accessDenied: state.accessDenied,
    pollsOpen: state.pollsOpen,
    latestGiveaway: state.latestGiveaway,
    latestQuizGiveaway: state.latestQuizGiveaway,
    currentUserId: user?.id,

    // Loading states
    isCreating,
    isVoting,
    isClosing,

    // Actions
    createPoll,
    submitVote,
    closePoll,
    startGiveaway,

    // Utilities
    hasVoted,
    getUserVote,
    clearError,
    clearGiveaway,
    clearQuizGiveaway,

    // Offline/cache state
    isOnline,
    cachedAt,
    isStale: !state.isJoined && cachedPolls !== null && state.polls.size > 0 && isCacheStale,
    isFromCache: !state.isJoined && cachedPolls !== null && state.polls.size > 0,
    cacheLoaded,
  };
};
