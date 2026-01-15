// src/hooks/use-session-chat.ts
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

// Message author structure
export interface MessageAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

// Parent message for replies
export interface ParentMessage {
  id: string;
  text: string;
  author: MessageAuthor;
}

// Chat message structure
export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  isEdited: boolean;
  editedAt: string | null;
  authorId: string;
  sessionId: string;
  author: MessageAuthor;
  parentMessage?: ParentMessage;
  reactionsSummary?: Record<string, number>;
}

// Response types
interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: { message: string; statusCode: number } | string;
}

// Optimistic message for immediate UI feedback
interface OptimisticMessage extends ChatMessage {
  isOptimistic?: boolean;
  optimisticId?: string;
}

interface SessionChatState {
  messages: OptimisticMessage[];
  isConnected: boolean;
  isJoined: boolean;
  error: string | null;
  accessDenied: boolean; // True when user is not registered for the event
  chatOpen: boolean; // True when chat is accepting messages (runtime state)
}

export const useSessionChat = (
  sessionId: string,
  eventId: string,
  initialChatOpen: boolean = false,
  sessionName?: string // Optional session title for heatmap display
) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SessionChatState>({
    messages: [],
    isConnected: false,
    isJoined: false,
    error: null,
    accessDenied: false,
    chatOpen: initialChatOpen,
  });
  const [isSending, setIsSending] = useState(false);
  const { token, user } = useAuthStore();
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  useEffect(() => {
    if (!sessionId || !eventId || !token) {
      return;
    }

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
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", (data: { userId: string }) => {
      // Join the session room for chat
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

        // Successfully joined - update chatOpen from server if provided
        const chatOpenFromServer = response.session?.chatOpen ?? initialChatOpen;
        setState((prev) => ({
          ...prev,
          isJoined: true,
          accessDenied: false,
          chatOpen: chatOpenFromServer,
        }));
      });
    });

    // Listen for chat history - backend sends this after session.join
    newSocket.on("chat.history", (data: { messages: ChatMessage[] }) => {
      if (data?.messages && Array.isArray(data.messages)) {
        setState((prev) => ({
          ...prev,
          messages: data.messages,
        }));
      }
    });

    newSocket.on("disconnect", (reason) => {
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    // New message received
    newSocket.on("chat.message.new", (message: ChatMessage) => {
      setState((prev) => {
        // Check if this message matches an optimistic message
        const optimisticIndex = prev.messages.findIndex(
          (m) =>
            (m as OptimisticMessage).isOptimistic &&
            m.text === message.text &&
            m.authorId === message.authorId
        );

        if (optimisticIndex !== -1) {
          // Replace optimistic message with real one
          const newMessages = [...prev.messages];
          newMessages[optimisticIndex] = message;
          return { ...prev, messages: newMessages };
        }

        // No optimistic match, just add the new message
        return { ...prev, messages: [...prev.messages, message] };
      });
    });

    // Message updated (edit or reaction)
    newSocket.on("chat.message.updated", (updatedMessage: ChatMessage) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === updatedMessage.id ? updatedMessage : msg
        ),
      }));
    });

    // Message deleted
    newSocket.on("chat.message.deleted", (data: { messageId: string }) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((msg) => msg.id !== data.messageId),
      }));
    });

    // Error handling
    newSocket.on("systemError", (error: { message: string; reason: string }) => {
      console.error("[Chat] System error:", error);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Chat] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Listen for chat status changes (open/close by organizer)
    newSocket.on("chat.status.changed", (data: { sessionId: string; isOpen: boolean; message?: string }) => {
      if (data.sessionId === sessionId) {
        setState((prev) => ({
          ...prev,
          chatOpen: data.isOpen,
        }));
      }
    });

    // Cleanup
    return () => {
      newSocket.emit("session.leave", { sessionId });
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("chat.history");
      newSocket.off("disconnect");
      newSocket.off("chat.message.new");
      newSocket.off("chat.message.updated");
      newSocket.off("chat.message.deleted");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.off("chat.status.changed");
      newSocket.disconnect();
    };
  }, [sessionId, eventId, token, initialChatOpen]);

  // Send a new message with optimistic update
  const sendMessage = useCallback(
    async (text: string, replyingToMessageId?: string): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        return false;
      }

      const trimmedText = text.trim();
      if (!trimmedText || trimmedText.length > 1000) {
        return false;
      }

      setIsSending(true);

      const optimisticId = generateUUID();
      const idempotencyKey = generateUUID();

      // Find parent message if replying
      const parentMsg = replyingToMessageId
        ? messagesRef.current.find((m) => m.id === replyingToMessageId)
        : undefined;

      // Create optimistic message for immediate UI feedback
      const optimisticMessage: OptimisticMessage = {
        id: optimisticId,
        text: trimmedText,
        timestamp: new Date().toISOString(),
        isEdited: false,
        editedAt: null,
        authorId: user?.id || "",
        sessionId,
        author: {
          id: user?.id || "",
          firstName: user?.first_name || "You",
          lastName: user?.last_name || "",
        },
        parentMessage: parentMsg
          ? {
              id: parentMsg.id,
              text: parentMsg.text,
              author: parentMsg.author,
            }
          : undefined,
        isOptimistic: true,
        optimisticId,
      };

      // Add optimistic message immediately
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, optimisticMessage],
      }));

      return new Promise((resolve) => {
        const payload: {
          sessionId: string;
          text: string;
          idempotencyKey: string;
          replyingToMessageId?: string;
          sessionName?: string;
        } = {
          sessionId,
          text: trimmedText,
          idempotencyKey,
        };

        if (replyingToMessageId) {
          payload.replyingToMessageId = replyingToMessageId;
        }

        // Include session name for proper heatmap display
        if (sessionName) {
          payload.sessionName = sessionName;
        }

        // Add timeout in case backend doesn't call callback
        let callbackCalled = false;
        const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
            setIsSending(false);
            // Mark the optimistic message as "sent" (remove optimistic flag)
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === optimisticId ? { ...m, isOptimistic: false } : m
              ),
            }));
            resolve(true);
          }
        }, 5000);

        socket.emit("chat.message.send", payload, (response: SendMessageResponse) => {
          callbackCalled = true;
          clearTimeout(timeoutId);
          setIsSending(false);

          if (response?.success) {
            resolve(true);
          } else {
            const errorMsg = typeof response?.error === "string"
              ? response.error
              : response?.error?.message || "Failed to send message";
            // Remove optimistic message on failure
            setState((prev) => ({
              ...prev,
              messages: prev.messages.filter((m) => m.id !== optimisticId),
              error: errorMsg,
            }));
            resolve(false);
          }
        });
      });
    },
    [socket, state.isJoined, sessionId, sessionName, user]
  );

  // Edit a message (with optimistic update)
  const editMessage = useCallback(
    async (messageId: string, newText: string): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        return false;
      }

      const trimmedText = newText.trim();
      if (!trimmedText || trimmedText.length > 1000) {
        return false;
      }

      // Find original message for rollback
      const originalMessage = state.messages.find((m) => m.id === messageId);
      if (!originalMessage) return false;

      // Optimistic update - update text immediately
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === messageId
            ? { ...m, text: trimmedText, isEdited: true, editedAt: new Date().toISOString() }
            : m
        ),
      }));

      return new Promise((resolve) => {
        socket.emit(
          "chat.message.edit",
          {
            messageId,
            newText: trimmedText,
            idempotencyKey: generateUUID(),
          },
          (response: SendMessageResponse) => {
            if (response?.success) {
              resolve(true);
            } else {
              // Rollback on failure
              setState((prev) => ({
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === messageId ? originalMessage : m
                ),
                error: "Failed to edit message",
              }));
              resolve(false);
            }
          }
        );
      });
    },
    [socket, state.isJoined, state.messages]
  );

  // Delete a message (with optimistic update)
  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        return false;
      }

      // Find original message for rollback
      const originalMessage = state.messages.find((m) => m.id === messageId);
      const originalIndex = state.messages.findIndex((m) => m.id === messageId);

      // Optimistic update - remove message immediately
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== messageId),
      }));

      return new Promise((resolve) => {
        socket.emit(
          "chat.message.delete",
          {
            messageId,
            idempotencyKey: generateUUID(),
          },
          (response: SendMessageResponse) => {
            if (response?.success) {
              resolve(true);
            } else {
              // Rollback on failure - add message back at original position
              if (originalMessage) {
                setState((prev) => {
                  const newMessages = [...prev.messages];
                  newMessages.splice(originalIndex, 0, originalMessage);
                  return {
                    ...prev,
                    messages: newMessages,
                    error: "Failed to delete message",
                  };
                });
              }
              resolve(false);
            }
          }
        );
      });
    },
    [socket, state.isJoined, state.messages]
  );

  // React to a message (toggle) with optimistic update
  const reactToMessage = useCallback(
    async (messageId: string, emoji: string): Promise<boolean> => {
      if (!socket || !state.isJoined || !user?.id) {
        return false;
      }

      // Find original message for rollback
      const originalMessage = state.messages.find((m) => m.id === messageId);
      if (!originalMessage) return false;

      // Optimistic update - toggle reaction immediately
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => {
          if (m.id !== messageId) return m;

          const currentReactions = m.reactionsSummary || {};
          const currentCount = currentReactions[emoji] || 0;

          // Toggle: if count > 0, decrement (assume user is removing their reaction)
          const newCount = currentCount > 0 ? currentCount - 1 : 1;

          const newReactions = { ...currentReactions };
          if (newCount === 0) {
            delete newReactions[emoji];
          } else {
            newReactions[emoji] = newCount;
          }

          return { ...m, reactionsSummary: newReactions };
        }),
      }));

      return new Promise((resolve) => {
        socket.emit(
          "chat.message.react",
          {
            messageId,
            emoji,
            idempotencyKey: generateUUID(),
          },
          (response: SendMessageResponse) => {
            if (response?.success) {
              resolve(true);
            } else {
              // Rollback on failure
              setState((prev) => ({
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === messageId ? originalMessage : m
                ),
                error: "Failed to add reaction",
              }));
              resolve(false);
            }
          }
        );
      });
    },
    [socket, state.isJoined, state.messages, user?.id]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    messages: state.messages,
    isConnected: state.isConnected,
    isJoined: state.isJoined,
    error: state.error,
    accessDenied: state.accessDenied,
    chatOpen: state.chatOpen,
    isSending,
    currentUserId: user?.id,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    clearError,
  };
};
