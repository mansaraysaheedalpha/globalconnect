// src/hooks/use-session-chat.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useSessionSocketOptional } from "@/context/SessionSocketContext";
import { useSocketCache } from "./use-socket-cache";
import { useNetworkStatus } from "./use-network-status";
import {
  queueSocketEvent,
  getPendingSocketEvents,
  removeSocketEvent,
  QueuedSocketEvent,
} from "@/lib/socket-event-queue";

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
  isPending?: boolean; // true = queued offline, waiting for reconnect
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
  // Try to get shared socket from SessionSocketProvider (if available)
  const sharedSocketContext = useSessionSocketOptional();
  const usingSharedSocket = sharedSocketContext !== null;
  const { isOnline } = useNetworkStatus();

  // IndexedDB cache for instant loading before socket connects
  const {
    cachedData: cachedMessages,
    cacheLoaded,
    cachedAt,
    isStale: isCacheStale,
    persistToCache,
  } = useSocketCache<ChatMessage[]>({
    feature: "chat",
    sessionId,
    maxItems: 200,
  });

  const [ownSocket, setOwnSocket] = useState<Socket | null>(null);
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
  const socketCreatedRef = useRef(false);

  // Determine which socket to use
  const socket = usingSharedSocket ? sharedSocketContext.socket : ownSocket;

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  // Restore cached messages on mount (before socket connects)
  useEffect(() => {
    if (cachedMessages && cachedMessages.length > 0 && state.messages.length === 0 && !state.isJoined) {
      setState((prev) => ({ ...prev, messages: cachedMessages }));
    }
  }, [cachedMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced persist to IndexedDB when messages change (live data)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.messages.length > 0 && state.isJoined) {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
      persistTimerRef.current = setTimeout(() => {
        const confirmed = state.messages.filter((m) => !(m as OptimisticMessage).isOptimistic);
        persistToCache(confirmed);
      }, 2000);
    }
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [state.messages, state.isJoined, persistToCache]);

  // Sync state with shared socket context if using it
  useEffect(() => {
    if (usingSharedSocket && sharedSocketContext) {
      setState((prev) => ({
        ...prev,
        isConnected: sharedSocketContext.isConnected,
        isJoined: sharedSocketContext.isJoined,
        chatOpen: sharedSocketContext.chatOpen,
        error: sharedSocketContext.error,
      }));
    }
  }, [
    usingSharedSocket,
    sharedSocketContext?.isConnected,
    sharedSocketContext?.isJoined,
    sharedSocketContext?.chatOpen,
    sharedSocketContext?.error,
  ]);

  // Create own socket ONLY if not using shared socket
  useEffect(() => {
    // Skip if using shared socket from provider
    if (usingSharedSocket) {
      console.log('[useSessionChat] Using shared socket from SessionSocketProvider');
      return;
    }

    if (!sessionId || !eventId || !token) {
      return;
    }

    // Prevent duplicate socket creation (React StrictMode safety)
    if (socketCreatedRef.current) {
      return;
    }

    console.log('[useSessionChat] Creating own socket connection (no shared provider)');
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
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", () => {
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
        persistToCache(data.messages);
      }
    });

    newSocket.on("disconnect", (reason) => {
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    // New message received
    newSocket.on("chat.message.new", (message: ChatMessage) => {
      setState((prev) => {
        // First check: Does this message already exist by ID? (prevents duplicates)
        const existingById = prev.messages.find((m) => m.id === message.id);
        if (existingById) {
          // Message already exists - update it with the server version
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === message.id ? message : m
            ),
          };
        }

        // Second check: Find optimistic message to replace
        // Match by text + authorId + optimisticId still present (was locally created)
        const optimisticIndex = prev.messages.findIndex(
          (m) =>
            (m as OptimisticMessage).optimisticId && // Has an optimistic ID
            m.text === message.text &&
            m.authorId === message.authorId
        );

        if (optimisticIndex !== -1) {
          // Replace optimistic message with real one
          const newMessages = [...prev.messages];
          newMessages[optimisticIndex] = message;
          return { ...prev, messages: newMessages };
        }

        // Third check: Prevent duplicate by checking for same text + author + recent timestamp
        // This handles race conditions where optimistic message was modified
        const isDuplicate = prev.messages.some(
          (m) =>
            m.text === message.text &&
            m.authorId === message.authorId &&
            Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000
        );

        if (isDuplicate) {
          // Already have this message (duplicate broadcast or race condition)
          return prev;
        }

        // No match found, add as new message
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
      console.log('[useSessionChat] Cleaning up own socket connection');
      socketCreatedRef.current = false;
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
  }, [usingSharedSocket, sessionId, eventId, token, initialChatOpen]);

  // Set up chat-specific event listeners when using shared socket
  // (When using own socket, listeners are set up in the socket creation effect above)
  useEffect(() => {
    if (!usingSharedSocket || !socket) {
      return;
    }

    console.log('[useSessionChat] Setting up chat listeners on shared socket');

    // Handler functions for chat events
    const handleChatHistory = (data: { messages: ChatMessage[] }) => {
      if (data?.messages && Array.isArray(data.messages)) {
        setState((prev) => ({
          ...prev,
          messages: data.messages,
        }));
        persistToCache(data.messages);
      }
    };

    const handleNewMessage = (message: ChatMessage) => {
      setState((prev) => {
        // First check: Does this message already exist by ID? (prevents duplicates)
        const existingById = prev.messages.find((m) => m.id === message.id);
        if (existingById) {
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === message.id ? message : m
            ),
          };
        }

        // Second check: Find optimistic message to replace
        const optimisticIndex = prev.messages.findIndex(
          (m) =>
            (m as OptimisticMessage).optimisticId &&
            m.text === message.text &&
            m.authorId === message.authorId
        );

        if (optimisticIndex !== -1) {
          const newMessages = [...prev.messages];
          newMessages[optimisticIndex] = message;
          return { ...prev, messages: newMessages };
        }

        // Third check: Prevent duplicate by timestamp proximity
        const isDuplicate = prev.messages.some(
          (m) =>
            m.text === message.text &&
            m.authorId === message.authorId &&
            Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000
        );

        if (isDuplicate) {
          return prev;
        }

        return { ...prev, messages: [...prev.messages, message] };
      });
    };

    const handleMessageUpdated = (updatedMessage: ChatMessage) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === updatedMessage.id ? updatedMessage : msg
        ),
      }));
    };

    const handleMessageDeleted = (data: { messageId: string }) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((msg) => msg.id !== data.messageId),
      }));
    };

    const handleChatStatusChanged = (data: { sessionId: string; isOpen: boolean }) => {
      if (data.sessionId === sessionId) {
        setState((prev) => ({
          ...prev,
          chatOpen: data.isOpen,
        }));
      }
    };

    // Register listeners
    socket.on("chat.history", handleChatHistory);
    socket.on("chat.message.new", handleNewMessage);
    socket.on("chat.message.updated", handleMessageUpdated);
    socket.on("chat.message.deleted", handleMessageDeleted);
    socket.on("chat.status.changed", handleChatStatusChanged);

    // Cleanup
    return () => {
      console.log('[useSessionChat] Removing chat listeners from shared socket');
      socket.off("chat.history", handleChatHistory);
      socket.off("chat.message.new", handleNewMessage);
      socket.off("chat.message.updated", handleMessageUpdated);
      socket.off("chat.message.deleted", handleMessageDeleted);
      socket.off("chat.status.changed", handleChatStatusChanged);
    };
  }, [usingSharedSocket, socket, sessionId]);

  // Emit a single chat message via socket (used for both live sends and queue drain)
  const emitChatMessage = useCallback(
    (
      sock: Socket,
      payload: { sessionId: string; text: string; idempotencyKey: string; replyingToMessageId?: string; sessionName?: string },
      optimisticId: string
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        let callbackCalled = false;
        const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
            setIsSending(false);
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === optimisticId ? { ...m, isOptimistic: false, isPending: false } : m
              ),
            }));
            resolve(true);
          }
        }, 5000);

        sock.emit("chat.message.send", payload, (response: SendMessageResponse) => {
          callbackCalled = true;
          clearTimeout(timeoutId);
          setIsSending(false);

          if (response?.success) {
            if (response.messageId) {
              setState((prev) => ({
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === optimisticId
                    ? { ...m, id: response.messageId!, optimisticId: undefined, isOptimistic: false, isPending: false }
                    : m
                ),
              }));
            }
            resolve(true);
          } else {
            const errorMsg = typeof response?.error === "string"
              ? response.error
              : response?.error?.message || "Failed to send message";
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
    []
  );

  // Drain offline queue after socket joins — replay pending messages
  const drainPendingQueue = useCallback(
    async (sock: Socket) => {
      const pending = await getPendingSocketEvents("chat", sessionId);
      if (pending.length === 0) return;

      for (const queued of pending) {
        // Mark the optimistic message as "sending" (no longer just pending)
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === queued.optimisticId ? { ...m, isPending: false } : m
          ),
        }));

        const payload = queued.payload as {
          sessionId: string; text: string; idempotencyKey: string;
          replyingToMessageId?: string; sessionName?: string;
        };

        await emitChatMessage(sock, payload, queued.optimisticId);
        await removeSocketEvent("chat", sessionId, queued.id);
      }
    },
    [sessionId, emitChatMessage]
  );

  // Send a new message with optimistic update (works online and offline)
  const sendMessage = useCallback(
    async (text: string, replyingToMessageId?: string): Promise<boolean> => {
      const trimmedText = text.trim();
      if (!trimmedText || trimmedText.length > 1000) {
        return false;
      }

      const isOffline = !socket || !state.isJoined;

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
        isPending: isOffline,
      };

      // Add optimistic message immediately
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, optimisticMessage],
      }));

      const payload: {
        sessionId: string; text: string; idempotencyKey: string;
        replyingToMessageId?: string; sessionName?: string;
      } = { sessionId, text: trimmedText, idempotencyKey };

      if (replyingToMessageId) payload.replyingToMessageId = replyingToMessageId;
      if (sessionName) payload.sessionName = sessionName;

      // Offline: queue for later, return immediately
      if (isOffline) {
        setIsSending(false);
        await queueSocketEvent("chat", sessionId, {
          id: generateUUID(),
          event: "chat.message.send",
          payload,
          sessionId,
          idempotencyKey,
          optimisticId,
          createdAt: new Date().toISOString(),
        });
        return true;
      }

      // Online: emit immediately
      return emitChatMessage(socket!, payload, optimisticId);
    },
    [socket, state.isJoined, sessionId, sessionName, user, emitChatMessage]
  );

  // Drain offline queue when socket joins (works for both own-socket and shared-socket)
  const hasDrainedRef = useRef(false);
  useEffect(() => {
    if (state.isJoined && socket) {
      if (!hasDrainedRef.current) {
        hasDrainedRef.current = true;
        drainPendingQueue(socket);
      }
    } else {
      // Reset when disconnected so we drain again on next join
      hasDrainedRef.current = false;
    }
  }, [state.isJoined, socket, drainPendingQueue]);

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

  const isFromCache = !state.isJoined && cachedMessages !== null && state.messages.length > 0;

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
    // Offline/cache state
    isOnline,
    cachedAt,
    isStale: isFromCache && isCacheStale,
    isFromCache,
    cacheLoaded,
  };
};
