// src/hooks/use-session-qa.ts
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

export const useSessionQA = (sessionId: string, eventId: string, initialQaOpen: boolean = false) => {
  const [socket, setSocket] = useState<Socket | null>(null);
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

  // Keep questionsRef in sync
  useEffect(() => {
    questionsRef.current = state.questions;
  }, [state.questions]);

  useEffect(() => {
    if (!sessionId || !eventId || !token) {
      console.log("[Q&A] Missing required params", { sessionId, eventId, hasToken: !!token });
      return;
    }

    console.log("[Q&A] Initializing socket connection for session:", sessionId);

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    // sessionId: for Q&A room, eventId: parent event ID for dashboard analytics
    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId, eventId }, // eventId is the parent event for analytics tracking
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("[Q&A] Socket connected:", newSocket.id);
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", (data: { userId: string }) => {
      console.log("[Q&A] Connection acknowledged, userId:", data.userId);

      // Join the session room for Q&A
      console.log("[Q&A] Joining session room:", sessionId);

      // Use callback to handle registration validation response
      newSocket.emit("session.join", { sessionId, eventId }, (response: {
        success: boolean;
        error?: { message: string; statusCode: number };
        session?: { chatOpen?: boolean; qaOpen?: boolean };
      }) => {
        if (response?.success === false) {
          const errorMsg = response.error?.message || "Failed to join session";
          const isAccessDenied = response.error?.statusCode === 403;

          console.error("[Q&A] Failed to join session:", errorMsg);
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
        console.log("[Q&A] Joined session room, qaOpen:", qaOpenFromServer);
      });
    });

    // Listen for Q&A history - backend sends this after session.join
    newSocket.on("qa.history", (data: { questions: Question[] }) => {
      console.log("[Q&A] ✅ Received qa.history event:", data);
      console.log("[Q&A] Questions count:", data?.questions?.length || 0);
      if (data?.questions && Array.isArray(data.questions)) {
        setState((prev) => ({
          ...prev,
          questions: data.questions,
        }));
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Q&A] Socket disconnected:", reason);
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    // New question received
    newSocket.on("qa.question.new", (question: Question) => {
      console.log("[Q&A] New question received:", question);
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
          console.log("[Q&A] Replaced optimistic question with server question");
          return { ...prev, questions: newQuestions };
        }

        // No optimistic match, just add the new question
        return { ...prev, questions: [...prev.questions, question] };
      });
    });

    // Question updated (upvote, moderation, answer, tags)
    newSocket.on("qna.question.updated", (updatedQuestion: Question) => {
      console.log("[Q&A] Question updated:", updatedQuestion);
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === updatedQuestion.id ? { ...q, ...updatedQuestion } : q
        ),
      }));
    });

    // Question removed
    newSocket.on("qna.question.removed", (data: { questionId: string }) => {
      console.log("[Q&A] Question removed:", data.questionId);
      setState((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== data.questionId),
      }));
    });

    // Error handling
    newSocket.on("systemError", (error: { message: string; reason: string }) => {
      console.error("[Q&A] System error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Q&A] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Listen for Q&A status changes (open/close by organizer)
    newSocket.on("qa.status.changed", (data: { sessionId: string; isOpen: boolean; message?: string }) => {
      console.log("[Q&A] Status changed:", data);
      if (data.sessionId === sessionId) {
        setState((prev) => ({
          ...prev,
          qaOpen: data.isOpen,
        }));
      }
    });

    // Cleanup
    return () => {
      console.log("[Q&A] Cleaning up socket connection");
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
  }, [sessionId, eventId, token, initialQaOpen]);

  // Ask a new question with optimistic update
  const askQuestion = useCallback(
    async (text: string, isAnonymous: boolean = false): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        console.error("[Q&A] Cannot ask question - not connected");
        return false;
      }

      const trimmedText = text.trim();
      if (!trimmedText || trimmedText.length > 500) {
        console.error("[Q&A] Invalid question text");
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

      console.log("[Q&A] Added optimistic question, sending to server...");

      return new Promise((resolve) => {
        // Note: sessionId is NOT included - backend gets it from the joined session room
        const payload = {
          text: trimmedText,
          isAnonymous,
          idempotencyKey,
        };

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
            console.error("[Q&A] Failed to ask question:", errorMsg);
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
    [socket, state.isJoined, sessionId, user]
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
