// src/hooks/use-direct-messages.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

// Generate UUID v4 using built-in crypto API (matches existing hooks pattern)
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

// Message delivery status
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

// Direct message structure
export interface DirectMessage {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  conversationId: string;
  isDelivered: boolean;
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: string | null;
  status?: MessageStatus;
}

// Conversation with another user
export interface Conversation {
  id: string;
  recipientId: string;
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  lastMessage?: DirectMessage;
  unreadCount: number;
  updatedAt: string;
}

// User info for DM
export interface DMUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isOnline?: boolean;
}

interface DirectMessagesState {
  isConnected: boolean;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: DirectMessage[];
  error: string | null;
  isTyping: Record<string, boolean>; // conversationId -> isTyping
}

// Rate limiting config for DMs
const DM_RATE_LIMIT = {
  maxPerSecond: 2,
  burstLimit: 5,
  burstWindow: 10000, // 10 seconds
};

export const useDirectMessages = (eventId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<DirectMessagesState>({
    isConnected: false,
    conversations: [],
    activeConversation: null,
    messages: [],
    error: null,
    isTyping: {},
  });
  const { token, user } = useAuthStore();

  // Rate limiting state
  const messageTimestamps = useRef<number[]>([]);
  const burstCount = useRef(0);
  const burstWindowStart = useRef(Date.now());

  // Pending messages for optimistic updates
  const pendingMessages = useRef<Map<string, DirectMessage>>(new Map());

  // Check if sending is allowed (rate limiting)
  const canSendMessage = useCallback((): boolean => {
    const now = Date.now();

    // Reset burst window if expired
    if (now - burstWindowStart.current > DM_RATE_LIMIT.burstWindow) {
      burstCount.current = 0;
      burstWindowStart.current = now;
    }

    // Check burst limit
    if (burstCount.current >= DM_RATE_LIMIT.burstLimit) {
      return false;
    }

    // Check per-second rate
    const oneSecondAgo = now - 1000;
    const recentMessages = messageTimestamps.current.filter(
      (t) => t > oneSecondAgo
    );
    messageTimestamps.current = recentMessages;

    return recentMessages.length < DM_RATE_LIMIT.maxPerSecond;
  }, []);

  // Record a sent message for rate limiting
  const recordMessageSent = useCallback(() => {
    const now = Date.now();
    messageTimestamps.current.push(now);
    burstCount.current++;
  }, []);

  // Socket connection and event handling
  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: eventId ? { eventId } : {},
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", () => {
      // User is auto-joined to their private room (user:{userId})
      // DMs will be received there
      console.log("[DM] Connected and ready to receive DMs");

      // Fetch existing conversations on connect
      newSocket.emit(
        "dm.conversations.get",
        {},
        (response: { success: boolean; conversations?: Conversation[]; error?: string }) => {
          if (response.success && response.conversations) {
            console.log("[DM] Loaded conversations:", response.conversations.length);
            setState((prev) => ({
              ...prev,
              conversations: response.conversations || [],
            }));
          } else {
            console.error("[DM] Failed to load conversations:", response.error);
          }
        }
      );
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false }));
    });

    // Receive new DM
    newSocket.on("dm.new", (message: DirectMessage) => {
      console.log("[DM] New message received:", message.id);

      setState((prev) => {
        // Check if this is the active conversation or a temp conversation that just got created
        const isActiveConv =
          prev.activeConversation?.id === message.conversationId ||
          (prev.activeConversation?.id.startsWith("temp-") &&
            prev.activeConversation?.recipientId === (message.senderId === user?.id ? prev.activeConversation.recipientId : message.senderId));

        // Check if message already exists (prevents duplicates from optimistic updates + broadcast)
        const messageExists = prev.messages.some((m) => m.id === message.id);

        // Add message to messages list if in active conversation and not already present
        const newMessages = isActiveConv && !messageExists
          ? [...prev.messages, message]
          : prev.messages;

        // Check if conversation exists
        const existingConv = prev.conversations.find(
          (conv) => conv.id === message.conversationId
        );

        let updatedConversations: Conversation[];

        if (existingConv) {
          // Update existing conversation
          updatedConversations = prev.conversations.map((conv) => {
            if (conv.id === message.conversationId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: isActiveConv ? conv.unreadCount : conv.unreadCount + 1,
                updatedAt: message.timestamp,
              };
            }
            return conv;
          });
        } else {
          // This is a new conversation - add it (or replace temp conversation)
          const tempConv = prev.conversations.find(
            (c) => c.id.startsWith("temp-") && c.recipientId === message.senderId
          );

          if (tempConv) {
            // Replace temp conversation with real one
            updatedConversations = prev.conversations.map((conv) =>
              conv.id === tempConv.id
                ? { ...conv, id: message.conversationId, lastMessage: message }
                : conv
            );
          } else {
            // Create new conversation entry (will need recipient info from message.sender)
            const newConv: Conversation = {
              id: message.conversationId,
              recipientId: message.senderId,
              recipient: {
                id: message.senderId,
                firstName: (message as any).sender?.firstName || "User",
                lastName: (message as any).sender?.lastName || "",
              },
              lastMessage: message,
              unreadCount: 1,
              updatedAt: message.timestamp,
            };
            updatedConversations = [newConv, ...prev.conversations];
          }
        }

        // Sort conversations by most recent
        updatedConversations.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        // Update active conversation ID if it was a temp
        let updatedActiveConv = prev.activeConversation;
        if (
          prev.activeConversation?.id.startsWith("temp-") &&
          prev.activeConversation.recipientId === message.senderId
        ) {
          updatedActiveConv = { ...prev.activeConversation, id: message.conversationId };
        }

        return {
          ...prev,
          messages: newMessages,
          conversations: updatedConversations,
          activeConversation: updatedActiveConv,
        };
      });

      // Send delivery receipt if conversation is open
      if (
        state.activeConversation?.id === message.conversationId ||
        (state.activeConversation?.id.startsWith("temp-") &&
          state.activeConversation?.recipientId === message.senderId)
      ) {
        newSocket.emit("dm.delivered", {
          messageId: message.id,
          idempotencyKey: generateUUID(),
        });
      }
    });

    // Delivery receipt update (for messages we sent)
    newSocket.on(
      "dm.delivery_update",
      (data: {
        messageId: string;
        conversationId: string;
        isDelivered: boolean;
        deliveredAt: string;
      }) => {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, isDelivered: true, status: "delivered" as MessageStatus }
              : msg
          ),
        }));

        // Remove from pending
        pendingMessages.current.delete(data.messageId);
      }
    );

    // Read receipt update (for messages we sent)
    newSocket.on(
      "dm.read_update",
      (data: {
        messageId: string;
        conversationId: string;
        isRead: boolean;
        readAt: string;
      }) => {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, isRead: true, status: "read" as MessageStatus }
              : msg
          ),
        }));
      }
    );

    // Message edited
    newSocket.on("dm.message.updated", (message: DirectMessage) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === message.id ? { ...msg, ...message, isEdited: true } : msg
        ),
      }));
    });

    // Message deleted
    newSocket.on("dm.message.deleted", (data: { messageId: string }) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((msg) => msg.id !== data.messageId),
      }));
    });

    // Typing indicator (if supported by backend)
    newSocket.on(
      "dm.typing",
      (data: { conversationId: string; userId: string; isTyping: boolean }) => {
        if (data.userId !== user.id) {
          setState((prev) => ({
            ...prev,
            isTyping: {
              ...prev.isTyping,
              [data.conversationId]: data.isTyping,
            },
          }));

          // Auto-clear typing indicator after 3 seconds
          if (data.isTyping) {
            setTimeout(() => {
              setState((prev) => ({
                ...prev,
                isTyping: {
                  ...prev.isTyping,
                  [data.conversationId]: false,
                },
              }));
            }, 3000);
          }
        }
      }
    );

    // Error handling
    newSocket.on("systemError", (error: { message: string }) => {
      console.error("[DM] System error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[DM] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("disconnect");
      newSocket.off("dm.new");
      newSocket.off("dm.delivery_update");
      newSocket.off("dm.read_update");
      newSocket.off("dm.message.updated");
      newSocket.off("dm.message.deleted");
      newSocket.off("dm.typing");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [token, user, eventId]);

  // Send a direct message
  const sendMessage = useCallback(
    (
      recipientId: string,
      text: string
    ): { success: boolean; messageId?: string } => {
      if (!socketRef.current || !state.isConnected || !user) {
        console.warn("[DM] Cannot send - not connected");
        return { success: false };
      }

      // eventId is required for DMs to ensure both users are registered for the same event
      if (!eventId) {
        console.warn("[DM] Cannot send - eventId is required");
        setState((prev) => ({
          ...prev,
          error: "Event context is required to send messages.",
        }));
        return { success: false };
      }

      // Validate text
      if (!text.trim() || text.length > 2000) {
        console.warn("[DM] Invalid message text");
        return { success: false };
      }

      // Check rate limit
      if (!canSendMessage()) {
        console.warn("[DM] Rate limited");
        setState((prev) => ({
          ...prev,
          error: "Slow down! You're sending messages too quickly.",
        }));
        return { success: false };
      }

      const idempotencyKey = generateUUID();
      const optimisticId = `optimistic-${idempotencyKey}`;

      // Create optimistic message
      const optimisticMessage: DirectMessage = {
        id: optimisticId,
        text,
        timestamp: new Date().toISOString(),
        senderId: user.id,
        conversationId: "", // Will be set when server responds
        isDelivered: false,
        isRead: false,
        status: "sending",
      };

      // Add to pending
      pendingMessages.current.set(optimisticId, optimisticMessage);

      // Optimistic update
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, optimisticMessage],
        error: null,
      }));

      // Send via socket with eventId for event-scoped validation
      socketRef.current.emit(
        "dm.send",
        {
          recipientId,
          text,
          eventId,
          idempotencyKey,
        },
        (response: {
          success: boolean;
          messageId?: string;
          timestamp?: string;
          error?: string;
        }) => {
          if (response.success && response.messageId) {
            // Update optimistic message with real ID
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === optimisticId
                  ? {
                      ...msg,
                      id: response.messageId!,
                      timestamp: response.timestamp || msg.timestamp,
                      status: "sent" as MessageStatus,
                    }
                  : msg
              ),
            }));
            pendingMessages.current.delete(optimisticId);
          } else {
            // Mark as failed
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === optimisticId
                  ? { ...msg, status: "failed" as MessageStatus }
                  : msg
              ),
              error: response.error || "Failed to send message",
            }));
          }
        }
      );

      // Record for rate limiting
      recordMessageSent();

      return { success: true, messageId: optimisticId };
    },
    [state.isConnected, user, eventId, canSendMessage, recordMessageSent]
  );

  // Mark message as delivered (when opening a conversation)
  const markAsDelivered = useCallback(
    (messageId: string) => {
      if (!socketRef.current || !state.isConnected) return;

      socketRef.current.emit("dm.delivered", {
        messageId,
        idempotencyKey: generateUUID(),
      });
    },
    [state.isConnected]
  );

  // Mark message as read (when user sees it)
  const markAsRead = useCallback(
    (messageId: string) => {
      if (!socketRef.current || !state.isConnected) return;

      socketRef.current.emit("dm.read", {
        messageId,
        idempotencyKey: generateUUID(),
      });
    },
    [state.isConnected]
  );

  // Edit a message
  const editMessage = useCallback(
    (messageId: string, newText: string): boolean => {
      if (!socketRef.current || !state.isConnected) {
        return false;
      }

      if (!newText.trim() || newText.length > 2000) {
        return false;
      }

      socketRef.current.emit(
        "dm.message.edit",
        {
          messageId,
          newText,
          idempotencyKey: generateUUID(),
        },
        (response: { success: boolean; error?: string }) => {
          if (!response.success) {
            setState((prev) => ({
              ...prev,
              error: response.error || "Failed to edit message",
            }));
          }
        }
      );

      return true;
    },
    [state.isConnected]
  );

  // Delete a message
  const deleteMessage = useCallback(
    (messageId: string): boolean => {
      if (!socketRef.current || !state.isConnected) {
        return false;
      }

      socketRef.current.emit(
        "dm.message.delete",
        {
          messageId,
          idempotencyKey: generateUUID(),
        },
        (response: { success: boolean; error?: string }) => {
          if (!response.success) {
            setState((prev) => ({
              ...prev,
              error: response.error || "Failed to delete message",
            }));
          } else {
            // Optimistic removal
            setState((prev) => ({
              ...prev,
              messages: prev.messages.filter((msg) => msg.id !== messageId),
            }));
          }
        }
      );

      return true;
    },
    [state.isConnected]
  );

  // Set active conversation and fetch messages
  const setActiveConversation = useCallback(
    (conversation: Conversation | null) => {
      setState((prev) => ({
        ...prev,
        activeConversation: conversation,
        messages: [], // Clear messages when switching conversations
      }));

      // Fetch messages and mark unread when opening conversation
      if (conversation && socketRef.current) {
        // Reset unread count for this conversation
        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.map((conv) =>
            conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
          ),
        }));

        // Fetch messages for this conversation (skip for temp conversations)
        if (!conversation.id.startsWith("temp-")) {
          socketRef.current.emit(
            "dm.messages.get",
            { conversationId: conversation.id, limit: 50 },
            (response: { success: boolean; messages?: DirectMessage[]; error?: string }) => {
              if (response.success && response.messages) {
                console.log("[DM] Loaded messages:", response.messages.length);
                setState((prev) => ({
                  ...prev,
                  messages: response.messages || [],
                }));

                // Mark unread messages as read
                response.messages?.forEach((msg) => {
                  if (msg.senderId !== user?.id && !msg.isRead) {
                    socketRef.current?.emit("dm.read", {
                      messageId: msg.id,
                      idempotencyKey: generateUUID(),
                    });
                  }
                });
              } else {
                console.error("[DM] Failed to load messages:", response.error);
              }
            }
          );
        }
      }
    },
    [user]
  );

  // Load conversation messages (would typically call REST API)
  const loadMessages = useCallback(
    (conversationId: string, messages: DirectMessage[]) => {
      setState((prev) => ({
        ...prev,
        messages: messages,
      }));

      // Mark all as delivered/read
      messages.forEach((msg) => {
        if (msg.senderId !== user?.id && !msg.isRead) {
          markAsRead(msg.id);
        }
      });
    },
    [user, markAsRead]
  );

  // Add or update a conversation
  const upsertConversation = useCallback((conversation: Conversation) => {
    setState((prev) => {
      const exists = prev.conversations.find((c) => c.id === conversation.id);
      if (exists) {
        return {
          ...prev,
          conversations: prev.conversations.map((c) =>
            c.id === conversation.id ? { ...c, ...conversation } : c
          ),
        };
      }
      return {
        ...prev,
        conversations: [conversation, ...prev.conversations],
      };
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Retry failed message
  const retryMessage = useCallback(
    (messageId: string) => {
      const failedMessage = state.messages.find(
        (m) => m.id === messageId && m.status === "failed"
      );
      if (failedMessage && state.activeConversation) {
        // Remove failed message
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((m) => m.id !== messageId),
        }));
        // Resend
        sendMessage(state.activeConversation.recipientId, failedMessage.text);
      }
    },
    [state.messages, state.activeConversation, sendMessage]
  );

  // Get total unread count
  const getTotalUnreadCount = useCallback((): number => {
    return state.conversations.reduce(
      (total, conv) => total + conv.unreadCount,
      0
    );
  }, [state.conversations]);

  return {
    // State
    isConnected: state.isConnected,
    conversations: state.conversations,
    activeConversation: state.activeConversation,
    messages: state.messages,
    error: state.error,
    isTyping: state.isTyping,

    // Actions
    sendMessage,
    markAsDelivered,
    markAsRead,
    editMessage,
    deleteMessage,
    setActiveConversation,
    loadMessages,
    upsertConversation,
    clearError,
    retryMessage,

    // Utilities
    canSendMessage,
    getTotalUnreadCount,
  };
};
