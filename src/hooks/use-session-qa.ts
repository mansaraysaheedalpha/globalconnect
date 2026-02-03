// src/hooks/use-session-qa.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useSessionSocketOptional } from "@/context/SessionSocketContext";

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

// Question author structure (matches backend exactly)
export interface QuestionAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

// Answer structure (matches backend exactly)
export interface QuestionAnswer {
  id: string;
  createdAt: string;
  text: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Question status
export type QuestionStatus = "pending" | "approved" | "dismissed";

// Question structure based on backend documentation
export interface Question {
  id: string;
  text: string;
  isAnonymous: boolean;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  isAnswered: boolean;
  tags: string[];
  authorId: string;
  sessionId: string;
  author: QuestionAuthor;
  _count: {
    upvotes: number;
  };
  answer?: QuestionAnswer;
  // Track if current user has upvoted (for UI - not from backend)
  hasUpvoted?: boolean;
}

// Optimistic question for immediate UI feedback
interface OptimisticQuestion extends Question {
  isOptimistic?: boolean;
  optimisticId?: string;
}

// Response types
interface QAResponse {
  success: boolean;
  questionId?: string;
  error?: { message: string; statusCode: number } | string;
}

interface SessionQAState {
  questions: OptimisticQuestion[];
  isConnected: boolean;
  isJoined: boolean;
  error: string | null;
  accessDenied: boolean; // True when user is not registered for the event
  qaOpen: boolean; // True when Q&A is accepting questions (runtime state)
}

export const useSessionQA = (
  sessionId: string,
  eventId: string,
  initialQaOpen: boolean = false,
  sessionName?: string // Optional session title for heatmap display
) => {
  // Try to get shared socket from SessionSocketProvider (if available)
  const sharedSocketContext = useSessionSocketOptional();
  const usingSharedSocket = sharedSocketContext !== null;

  const [ownSocket, setOwnSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SessionQAState>({
    questions: [],
    isConnected: false,
    isJoined: false,
    error: null,
    accessDenied: false,
    qaOpen: initialQaOpen,
  });
  const [isSending, setIsSending] = useState(false);
  const { token, user } = useAuthStore();
  const questionsRef = useRef<Question[]>([]);
  const socketCreatedRef = useRef(false);

  // Determine which socket to use
  const socket = usingSharedSocket ? sharedSocketContext.socket : ownSocket;

  // Keep questionsRef in sync
  useEffect(() => {
    questionsRef.current = state.questions;
  }, [state.questions]);

  // Sync state with shared socket context if using it
  useEffect(() => {
    if (usingSharedSocket && sharedSocketContext) {
      setState((prev) => ({
        ...prev,
        isConnected: sharedSocketContext.isConnected,
        isJoined: sharedSocketContext.isJoined,
        qaOpen: sharedSocketContext.qaOpen,
        error: sharedSocketContext.error,
      }));
    }
  }, [
    usingSharedSocket,
    sharedSocketContext?.isConnected,
    sharedSocketContext?.isJoined,
    sharedSocketContext?.qaOpen,
    sharedSocketContext?.error,
  ]);

  // Create own socket ONLY if not using shared socket
  useEffect(() => {
    // Skip if using shared socket from provider
    if (usingSharedSocket) {
      console.log('[useSessionQA] Using shared socket from SessionSocketProvider');
      return;
    }

    if (!sessionId || !eventId || !token) {
      return;
    }

    // Prevent duplicate socket creation (React StrictMode safety)
    if (socketCreatedRef.current) {
      return;
    }

    console.log('[useSessionQA] Creating own socket connection (no shared provider)');
    socketCreatedRef.current = true;

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    // sessionId: for Q&A room, eventId: parent event ID for dashboard analytics
    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId, eventId }, // eventId is the parent event for analytics tracking
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setOwnSocket(newSocket);

    newSocket.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", () => {
      // Join the session room for Q&A
      // Use callback to handle registration validation response
      newSocket.emit("session.join", { sessionId, eventId }, (response: {
        success: boolean;
        error?: { message: string; statusCode: number };
        session?: { chatOpen?: boolean; qaOpen?: boolean };
      }) => {
        if (response?.success === false) {
          const errorMsg = response.error?.message || "Failed to join session";
          const isAccessDenied = response.error?.statusCode === 403;

          setState((prev) => ({
            ...prev,
            isJoined: false,
            error: isAccessDenied ? "You are not registered for this event" : errorMsg,
            accessDenied: isAccessDenied,
          }));
          return;
        }

        // Successfully joined - update qaOpen from server if provided
        const qaOpenFromServer = response.session?.qaOpen ?? initialQaOpen;
        setState((prev) => ({
          ...prev,
          isJoined: true,
          accessDenied: false,
          qaOpen: qaOpenFromServer,
        }));
      });
    });

    // Listen for Q&A history - backend sends this after session.join
    newSocket.on("qa.history", (data: { questions: Question[] }) => {
      if (data?.questions && Array.isArray(data.questions)) {
        setState((prev) => ({
          ...prev,
          questions: data.questions,
        }));
      }
    });

    newSocket.on("disconnect", (reason) => {
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    // New question received
    newSocket.on("qa.question.new", (question: Question) => {
      setState((prev) => {
        // Check if this question matches an optimistic question
        const optimisticIndex = prev.questions.findIndex(
          (q) =>
            (q as OptimisticQuestion).isOptimistic &&
            q.text === question.text &&
            q.authorId === question.authorId
        );

        if (optimisticIndex !== -1) {
          // Replace optimistic question with real one
          const newQuestions = [...prev.questions];
          newQuestions[optimisticIndex] = question;
          return { ...prev, questions: newQuestions };
        }

        // No optimistic match, just add the new question
        return { ...prev, questions: [...prev.questions, question] };
      });
    });

    // Question updated (upvote, moderation, answer, tags)
    newSocket.on("qna.question.updated", (updatedQuestion: Question) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === updatedQuestion.id ? { ...q, ...updatedQuestion } : q
        ),
      }));
    });

    // Question removed
    newSocket.on("qna.question.removed", (data: { questionId: string }) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== data.questionId),
      }));
    });

    // Error handling
    newSocket.on("systemError", (error: { message: string; reason: string }) => {
      console.error("[Q&A] System error:", error);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Q&A] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Listen for Q&A status changes (open/close by organizer)
    newSocket.on("qa.status.changed", (data: { sessionId: string; isOpen: boolean; message?: string }) => {
      if (data.sessionId === sessionId) {
        setState((prev) => ({
          ...prev,
          qaOpen: data.isOpen,
        }));
      }
    });

    // Cleanup
    return () => {
      console.log('[useSessionQA] Cleaning up own socket connection');
      socketCreatedRef.current = false;
      newSocket.emit("session.leave", { sessionId });
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("qa.history");
      newSocket.off("disconnect");
      newSocket.off("qa.question.new");
      newSocket.off("qna.question.updated");
      newSocket.off("qna.question.removed");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.off("qa.status.changed");
      newSocket.disconnect();
    };
  }, [usingSharedSocket, sessionId, eventId, token, initialQaOpen]);

  // Set up Q&A-specific event listeners when using shared socket
  useEffect(() => {
    if (!usingSharedSocket || !socket) {
      return;
    }

    console.log('[useSessionQA] Setting up Q&A listeners on shared socket');

    // Handler functions for Q&A events
    const handleQAHistory = (data: { questions: Question[] }) => {
      if (data?.questions && Array.isArray(data.questions)) {
        setState((prev) => ({
          ...prev,
          questions: data.questions,
        }));
      }
    };

    const handleNewQuestion = (question: Question) => {
      setState((prev) => {
        const optimisticIndex = prev.questions.findIndex(
          (q) =>
            (q as OptimisticQuestion).isOptimistic &&
            q.text === question.text &&
            q.authorId === question.authorId
        );

        if (optimisticIndex !== -1) {
          const newQuestions = [...prev.questions];
          newQuestions[optimisticIndex] = question;
          return { ...prev, questions: newQuestions };
        }

        return { ...prev, questions: [...prev.questions, question] };
      });
    };

    const handleQuestionUpdated = (updatedQuestion: Question) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === updatedQuestion.id ? { ...q, ...updatedQuestion } : q
        ),
      }));
    };

    const handleQuestionRemoved = (data: { questionId: string }) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== data.questionId),
      }));
    };

    const handleQAStatusChanged = (data: { sessionId: string; isOpen: boolean }) => {
      if (data.sessionId === sessionId) {
        setState((prev) => ({
          ...prev,
          qaOpen: data.isOpen,
        }));
      }
    };

    // Register listeners
    socket.on("qa.history", handleQAHistory);
    socket.on("qa.question.new", handleNewQuestion);
    socket.on("qna.question.updated", handleQuestionUpdated);
    socket.on("qna.question.removed", handleQuestionRemoved);
    socket.on("qa.status.changed", handleQAStatusChanged);

    // Cleanup
    return () => {
      console.log('[useSessionQA] Removing Q&A listeners from shared socket');
      socket.off("qa.history", handleQAHistory);
      socket.off("qa.question.new", handleNewQuestion);
      socket.off("qna.question.updated", handleQuestionUpdated);
      socket.off("qna.question.removed", handleQuestionRemoved);
      socket.off("qa.status.changed", handleQAStatusChanged);
    };
  }, [usingSharedSocket, socket, sessionId]);

  // Ask a new question with optimistic update
  const askQuestion = useCallback(
    async (text: string, isAnonymous: boolean = false): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        return false;
      }

      const trimmedText = text.trim();
      if (!trimmedText || trimmedText.length > 500) {
        return false;
      }

      setIsSending(true);

      const optimisticId = generateUUID();
      const idempotencyKey = generateUUID();

      // Create optimistic question for immediate UI feedback
      const now = new Date().toISOString();
      const optimisticQuestion: OptimisticQuestion = {
        id: optimisticId,
        text: trimmedText,
        isAnonymous,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        isAnswered: false,
        tags: [],
        authorId: user?.id || "",
        sessionId,
        author: {
          id: user?.id || "",
          firstName: isAnonymous ? "Anonymous" : (user?.first_name || "You"),
          lastName: isAnonymous ? "" : (user?.last_name || ""),
        },
        _count: { upvotes: 0 },
        isOptimistic: true,
        optimisticId,
      };

      // Add optimistic question immediately
      setState((prev) => ({
        ...prev,
        questions: [...prev.questions, optimisticQuestion],
      }));

      return new Promise((resolve) => {
        // Note: sessionId is NOT included - backend gets it from the joined session room
        const payload: {
          text: string;
          isAnonymous: boolean;
          idempotencyKey: string;
          sessionName?: string;
        } = {
          text: trimmedText,
          isAnonymous,
          idempotencyKey,
        };

        // Include session name for proper heatmap display
        if (sessionName) {
          payload.sessionName = sessionName;
        }

        // Add timeout in case backend doesn't call callback
        let callbackCalled = false;
        const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
            setIsSending(false);
            // Mark the optimistic question as "sent"
            setState((prev) => ({
              ...prev,
              questions: prev.questions.map((q) =>
                q.id === optimisticId ? { ...q, isOptimistic: false } : q
              ),
            }));
            resolve(true);
          }
        }, 5000);

        socket.emit("qa.question.ask", payload, (response: QAResponse) => {
          callbackCalled = true;
          clearTimeout(timeoutId);
          setIsSending(false);

          if (response?.success) {
            resolve(true);
          } else {
            const errorMsg =
              typeof response?.error === "string"
                ? response.error
                : response?.error?.message || "Failed to ask question";
            // Remove optimistic question on failure
            setState((prev) => ({
              ...prev,
              questions: prev.questions.filter((q) => q.id !== optimisticId),
              error: errorMsg,
            }));
            resolve(false);
          }
        });
      });
    },
    [socket, state.isJoined, sessionId, sessionName, user]
  );

  // Upvote a question (toggle) with optimistic update
  const upvoteQuestion = useCallback(
    async (questionId: string): Promise<boolean> => {
      if (!socket || !state.isJoined || !user?.id) {
        return false;
      }

      // Find original question for rollback
      const originalQuestion = state.questions.find((q) => q.id === questionId);
      if (!originalQuestion) return false;

      // Check if user is trying to upvote their own question (not allowed)
      if (originalQuestion.authorId === user.id) {
        setState((prev) => ({
          ...prev,
          error: "You cannot upvote your own question",
        }));
        return false;
      }

      // Optimistic update - toggle upvote immediately
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id !== questionId) return q;

          const hasUpvoted = q.hasUpvoted || false;
          const currentCount = q._count?.upvotes || 0;
          const newCount = hasUpvoted ? Math.max(0, currentCount - 1) : currentCount + 1;

          return {
            ...q,
            hasUpvoted: !hasUpvoted,
            _count: { ...q._count, upvotes: newCount },
          };
        }),
      }));

      return new Promise((resolve) => {
        socket.emit(
          "qna.question.upvote",
          {
            questionId,
            idempotencyKey: generateUUID(),
          },
          (response: QAResponse) => {
            if (response?.success) {
              resolve(true);
            } else {
              // Parse error message for better UX
              const errorMsg =
                typeof response?.error === "string"
                  ? response.error
                  : response?.error?.message || "Failed to upvote question";

              // Check for common error patterns
              const friendlyError = errorMsg.toLowerCase().includes("own question")
                ? "You cannot upvote your own question"
                : errorMsg;

              // Rollback on failure
              setState((prev) => ({
                ...prev,
                questions: prev.questions.map((q) =>
                  q.id === questionId ? originalQuestion : q
                ),
                error: friendlyError,
              }));
              resolve(false);
            }
          }
        );
      });
    },
    [socket, state.isJoined, state.questions, user?.id]
  );

  // Moderate a question (approve/dismiss) - for organizers
  const moderateQuestion = useCallback(
    async (questionId: string, action: "approve" | "dismiss"): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        return false;
      }

      // Find original question for rollback
      const originalQuestion = state.questions.find((q) => q.id === questionId);
      if (!originalQuestion) return false;

      const newStatus: QuestionStatus = action === "approve" ? "approved" : "dismissed";

      // Optimistic update
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, status: newStatus } : q
        ),
      }));

      return new Promise((resolve) => {
        socket.emit(
          "qna.question.moderate",
          {
            questionId,
            status: newStatus, // Backend expects "status" not "action"
            idempotencyKey: generateUUID(),
          },
          (response: QAResponse) => {
            if (response?.success) {
              resolve(true);
            } else {
              // Rollback on failure
              setState((prev) => ({
                ...prev,
                questions: prev.questions.map((q) =>
                  q.id === questionId ? originalQuestion : q
                ),
                error: `Failed to ${action} question`,
              }));
              resolve(false);
            }
          }
        );
      });
    },
    [socket, state.isJoined, state.questions]
  );

  // Answer a question - for speakers/organizers
  const answerQuestion = useCallback(
    async (questionId: string, answerText: string): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        return false;
      }

      const trimmedAnswer = answerText.trim();
      if (!trimmedAnswer) {
        return false;
      }

      // Find original question for rollback
      const originalQuestion = state.questions.find((q) => q.id === questionId);
      if (!originalQuestion) return false;

      // Optimistic update (structure matches backend exactly)
      const optimisticAnswer: QuestionAnswer = {
        id: generateUUID(),
        createdAt: new Date().toISOString(),
        text: trimmedAnswer,
        author: {
          id: user?.id || "",
          firstName: user?.first_name || "",
          lastName: user?.last_name || "",
        },
      };

      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, answer: optimisticAnswer, isAnswered: true } : q
        ),
      }));

      return new Promise((resolve) => {
        socket.emit(
          "qna.question.answer",
          {
            questionId,
            answerText: trimmedAnswer, // Backend expects "answerText" not "text"
            idempotencyKey: generateUUID(),
          },
          (response: QAResponse) => {
            if (response?.success) {
              resolve(true);
            } else {
              // Rollback on failure
              setState((prev) => ({
                ...prev,
                questions: prev.questions.map((q) =>
                  q.id === questionId ? originalQuestion : q
                ),
                error: "Failed to answer question",
              }));
              resolve(false);
            }
          }
        );
      });
    },
    [socket, state.isJoined, state.questions, user]
  );

  // Tag a question - for organizers
  const tagQuestion = useCallback(
    async (questionId: string, tags: string[]): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        return false;
      }

      // Find original question for rollback
      const originalQuestion = state.questions.find((q) => q.id === questionId);
      if (!originalQuestion) return false;

      // Optimistic update
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, tags } : q
        ),
      }));

      return new Promise((resolve) => {
        socket.emit(
          "qna.question.tag",
          {
            questionId,
            tags,
            idempotencyKey: generateUUID(),
          },
          (response: QAResponse) => {
            if (response?.success) {
              resolve(true);
            } else {
              // Rollback on failure
              setState((prev) => ({
                ...prev,
                questions: prev.questions.map((q) =>
                  q.id === questionId ? originalQuestion : q
                ),
                error: "Failed to tag question",
              }));
              resolve(false);
            }
          }
        );
      });
    },
    [socket, state.isJoined, state.questions]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Computed values
  const approvedQuestions = state.questions.filter((q) => q.status === "approved");
  const pendingQuestions = state.questions.filter((q) => q.status === "pending");
  const dismissedQuestions = state.questions.filter((q) => q.status === "dismissed");

  // Sort by upvotes (highest first)
  const sortedByUpvotes = [...state.questions].sort(
    (a, b) => (b._count?.upvotes || 0) - (a._count?.upvotes || 0)
  );

  return {
    questions: state.questions,
    approvedQuestions,
    pendingQuestions,
    dismissedQuestions,
    sortedByUpvotes,
    isConnected: state.isConnected,
    isJoined: state.isJoined,
    error: state.error,
    accessDenied: state.accessDenied,
    qaOpen: state.qaOpen,
    isSending,
    currentUserId: user?.id,
    askQuestion,
    upvoteQuestion,
    moderateQuestion,
    answerQuestion,
    tagQuestion,
    clearError,
  };
};
