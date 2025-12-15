// src/hooks/use-session-polls.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

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
}

export interface PollResultEnvelope {
  poll: Poll;
  userVotedForOptionId: string | null;
}

export interface GiveawayResult {
  pollId: string;
  winner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  prize: string;
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
}

export const useSessionPolls = (
  sessionId: string,
  eventId: string,
  initialPollsOpen: boolean = false
) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SessionPollsState>({
    polls: new Map(),
    userVotes: new Map(),
    isConnected: false,
    isJoined: false,
    error: null,
    accessDenied: false,
    pollsOpen: initialPollsOpen,
    latestGiveaway: null,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isVoting, setIsVoting] = useState<string | null>(null); // pollId being voted on
  const [isClosing, setIsClosing] = useState<string | null>(null); // pollId being closed
  const { token, user } = useAuthStore();
  const pollsRef = useRef<Map<string, Poll>>(new Map());

  // Keep pollsRef in sync
  useEffect(() => {
    pollsRef.current = state.polls;
  }, [state.polls]);

  useEffect(() => {
    if (!sessionId || !eventId || !token) {
      console.log("[Polls] Missing required params", {
        sessionId,
        eventId,
        hasToken: !!token,
      });
      return;
    }

    console.log("[Polls] Initializing socket connection for session:", sessionId);

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId, eventId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("[Polls] Socket connected:", newSocket.id);
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", (data: { userId: string }) => {
      console.log("[Polls] Connection acknowledged, userId:", data.userId);

      // Join the session room for polls
      console.log("[Polls] Joining session room:", sessionId);

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
      console.log("[Polls] Cleaning up socket connection");
      newSocket.emit("session.leave", { sessionId });
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("poll.history");
      newSocket.off("disconnect");
      newSocket.off("poll.opened");
      newSocket.off("poll.results.updated");
      newSocket.off("poll.closed");
      newSocket.off("poll.giveaway.winner");
      newSocket.off("polls.status.changed");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
    };
  }, [sessionId, eventId, token, initialPollsOpen]);

  // Create a new poll (organizer/speaker)
  const createPoll = useCallback(
    async (question: string, options: string[]): Promise<boolean> => {
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

      setIsCreating(true);

      return new Promise((resolve) => {
        const payload = {
          question: trimmedQuestion,
          options: validOptions.map((text) => ({ text })),
          idempotencyKey: generateUUID(),
        };

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
      if (!socket || !state.isJoined) {
        console.error("[Polls] Cannot close poll - not connected");
        return false;
      }

      const poll = state.polls.get(pollId);
      if (!poll || !poll.isActive) {
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

        socket.emit("poll.manage", payload, (response: SocketResponse) => {
          setIsClosing(null);

          if (response?.success) {
            console.log("[Polls] Poll closed, status:", response.finalStatus);
            resolve(true);
          } else {
            const errorMsg =
              typeof response?.error === "string"
                ? response.error
                : response?.error?.message || "Failed to close poll";
            console.error("[Polls] Failed to close poll:", errorMsg);

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
      prize: string
    ): Promise<GiveawayResult["winner"]> => {
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

      const trimmedPrize = prize.trim();
      if (!trimmedPrize || trimmedPrize.length > 255) {
        setState((prev) => ({
          ...prev,
          error: "Prize must be between 1 and 255 characters",
        }));
        return null;
      }

      return new Promise((resolve) => {
        const payload = {
          pollId,
          winningOptionId,
          prize: trimmedPrize,
          idempotencyKey: generateUUID(),
        };

        socket.emit(
          "poll.giveaway.start",
          payload,
          (response: SocketResponse<GiveawayResult["winner"]>) => {
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
  };
};
