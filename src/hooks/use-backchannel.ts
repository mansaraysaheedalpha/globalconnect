// src/hooks/use-backchannel.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

// Maximum messages to keep in memory to prevent unbounded growth
const MAX_MESSAGES = 500;

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

// Targetable roles for whisper messages
export enum TargetableRole {
  SPEAKER = "SPEAKER",
  MODERATOR = "MODERATOR",
  STAFF = "STAFF",
}

// Message author structure
export interface BackchannelAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

// Backchannel message structure
export interface BackchannelMessage {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  sessionId: string;
  sender: BackchannelAuthor;
  isWhisper?: boolean;
  whisperTarget?: string;
}

// Response types
interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: { message: string; statusCode: number } | string;
}

// Optimistic message for immediate UI feedback
interface OptimisticMessage extends BackchannelMessage {
  isOptimistic?: boolean;
  optimisticId?: string;
}

// Staff member for whisper targeting
export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface BackchannelState {
  messages: OptimisticMessage[];
  isConnected: boolean;
  isJoined: boolean;
  error: string | null;
  accessDenied: boolean;
}

export const useBackchannel = (sessionId: string, eventId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<BackchannelState>({
    messages: [],
    isConnected: false,
    isJoined: false,
    error: null,
    accessDenied: false,
  });
  const [isSending, setIsSending] = useState(false);
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!sessionId || !eventId || !token) {
      return;
    }

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

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setState((prev: BackchannelState) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", () => {
      newSocket.emit("backchannel.join", {}, (response: {
        success: boolean;
        error?: { message: string; statusCode: number };
      }) => {
        if (response?.success === false) {
          const errorMsg = response.error?.message || "Failed to join backchannel";
          const isAccessDenied = response.error?.statusCode === 403;
          setState((prev: BackchannelState) => ({
            ...prev,
            isJoined: false,
            error: isAccessDenied ? "You don't have permission to access the backchannel" : errorMsg,
            accessDenied: isAccessDenied,
          }));
          return;
        }

        setState((prev: BackchannelState) => ({
          ...prev,
          isJoined: true,
          accessDenied: false,
        }));
      });
    });

    newSocket.on("backchannel.history", (data: { messages: BackchannelMessage[] }) => {
      if (data?.messages && Array.isArray(data.messages)) {
        setState((prev: BackchannelState) => ({
          ...prev,
          messages: data.messages,
        }));
      }
    });

    newSocket.on("disconnect", () => {
      setState((prev: BackchannelState) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    newSocket.on("backchannel.message.new", (message: BackchannelMessage) => {
      setState((prev: BackchannelState) => {
        const existingIndex = prev.messages.findIndex((m: OptimisticMessage) => m.id === message.id);
        if (existingIndex !== -1) {
          const newMessages = [...prev.messages];
          newMessages[existingIndex] = message;
          return { ...prev, messages: newMessages };
        }

        const optimisticIndex = prev.messages.findIndex(
          (m: OptimisticMessage) =>
            m.isOptimistic &&
            m.text === message.text &&
            m.senderId === message.senderId
        );

        if (optimisticIndex !== -1) {
          const newMessages = [...prev.messages];
          newMessages[optimisticIndex] = message;
          return { ...prev, messages: newMessages };
        }

        const newMessages = [...prev.messages, message];
        if (newMessages.length > MAX_MESSAGES) {
          return { ...prev, messages: newMessages.slice(-MAX_MESSAGES) };
        }
        return { ...prev, messages: newMessages };
      });
    });

    newSocket.on("systemError", (error: { message: string; reason: string }) => {
      console.error("[Backchannel] System error:", error);
      setState((prev: BackchannelState) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error: Error) => {
      console.error("[Backchannel] Connection error:", error.message);
      setState((prev: BackchannelState) => ({ ...prev, error: error.message }));
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("backchannel.history");
      newSocket.off("disconnect");
      newSocket.off("backchannel.message.new");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
    };
  }, [sessionId, eventId, token]);

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        return false;
      }

      const trimmedText = text.trim();
      if (!trimmedText || trimmedText.length > 2000) {
        return false;
      }

      setIsSending(true);

      const optimisticId = generateUUID();
      const idempotencyKey = generateUUID();

      const optimisticMessage: OptimisticMessage = {
        id: optimisticId,
        text: trimmedText,
        createdAt: new Date().toISOString(),
        senderId: user?.id || "",
        sessionId,
        sender: {
          id: user?.id || "",
          firstName: user?.first_name || "You",
          lastName: user?.last_name || "",
        },
        isOptimistic: true,
        optimisticId,
      };

      setState((prev: BackchannelState) => ({
        ...prev,
        messages: [...prev.messages, optimisticMessage],
      }));

      return new Promise((resolve) => {
        const payload = {
          text: trimmedText,
          idempotencyKey,
        };

        let callbackCalled = false;
        const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
            setIsSending(false);
            setState((prev: BackchannelState) => ({
              ...prev,
              messages: prev.messages.map((m: OptimisticMessage) =>
                m.id === optimisticId ? { ...m, isOptimistic: false } : m
              ),
            }));
            resolve(true);
          }
        }, 5000);

        socket.emit("backchannel.message.send", payload, (response: SendMessageResponse) => {
          callbackCalled = true;
          clearTimeout(timeoutId);
          setIsSending(false);

          if (response?.success) {
            resolve(true);
          } else {
            const errorMsg = typeof response?.error === "string"
              ? response.error
              : response?.error?.message || "Failed to send message";
            setState((prev: BackchannelState) => ({
              ...prev,
              messages: prev.messages.filter((m: OptimisticMessage) => m.id !== optimisticId),
              error: errorMsg,
            }));
            resolve(false);
          }
        });
      });
    },
    [socket, state.isJoined, sessionId, user]
  );

  const sendWhisperToUser = useCallback(
    async (text: string, targetUserId: string, targetUserName: string): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        return false;
      }

      const trimmedText = text.trim();
      if (!trimmedText || trimmedText.length > 2000) {
        return false;
      }

      setIsSending(true);

      const optimisticId = generateUUID();
      const idempotencyKey = generateUUID();

      const optimisticMessage: OptimisticMessage = {
        id: optimisticId,
        text: trimmedText,
        createdAt: new Date().toISOString(),
        senderId: user?.id || "",
        sessionId,
        sender: {
          id: user?.id || "",
          firstName: user?.first_name || "You",
          lastName: user?.last_name || "",
        },
        isWhisper: true,
        whisperTarget: `To: ${targetUserName}`,
        isOptimistic: true,
        optimisticId,
      };

      setState((prev: BackchannelState) => ({
        ...prev,
        messages: [...prev.messages, optimisticMessage],
      }));

      return new Promise((resolve) => {
        const payload = {
          text: trimmedText,
          idempotencyKey,
          targetUserId,
        };

        let callbackCalled = false;
        const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
            setIsSending(false);
            setState((prev: BackchannelState) => ({
              ...prev,
              messages: prev.messages.map((m: OptimisticMessage) =>
                m.id === optimisticId ? { ...m, isOptimistic: false } : m
              ),
            }));
            resolve(true);
          }
        }, 5000);

        socket.emit("backchannel.message.send", payload, (response: SendMessageResponse) => {
          callbackCalled = true;
          clearTimeout(timeoutId);
          setIsSending(false);

          if (response?.success) {
            resolve(true);
          } else {
            const errorMsg = typeof response?.error === "string"
              ? response.error
              : response?.error?.message || "Failed to send whisper";
            setState((prev: BackchannelState) => ({
              ...prev,
              messages: prev.messages.filter((m: OptimisticMessage) => m.id !== optimisticId),
              error: errorMsg,
            }));
            resolve(false);
          }
        });
      });
    },
    [socket, state.isJoined, sessionId, user]
  );

  const sendWhisperToRole = useCallback(
    async (text: string, targetRole: TargetableRole): Promise<boolean> => {
      if (!socket || !state.isJoined) {
        return false;
      }

      const trimmedText = text.trim();
      if (!trimmedText || trimmedText.length > 2000) {
        return false;
      }

      setIsSending(true);

      const optimisticId = generateUUID();
      const idempotencyKey = generateUUID();

      const optimisticMessage: OptimisticMessage = {
        id: optimisticId,
        text: trimmedText,
        createdAt: new Date().toISOString(),
        senderId: user?.id || "",
        sessionId,
        sender: {
          id: user?.id || "",
          firstName: user?.first_name || "You",
          lastName: user?.last_name || "",
        },
        isWhisper: true,
        whisperTarget: `Role: ${targetRole}`,
        isOptimistic: true,
        optimisticId,
      };

      setState((prev: BackchannelState) => ({
        ...prev,
        messages: [...prev.messages, optimisticMessage],
      }));

      return new Promise((resolve) => {
        const payload = {
          text: trimmedText,
          idempotencyKey,
          targetRole,
        };

        let callbackCalled = false;
        const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
            setIsSending(false);
            setState((prev: BackchannelState) => ({
              ...prev,
              messages: prev.messages.map((m: OptimisticMessage) =>
                m.id === optimisticId ? { ...m, isOptimistic: false } : m
              ),
            }));
            resolve(true);
          }
        }, 5000);

        socket.emit("backchannel.message.send", payload, (response: SendMessageResponse) => {
          callbackCalled = true;
          clearTimeout(timeoutId);
          setIsSending(false);

          if (response?.success) {
            resolve(true);
          } else {
            const errorMsg = typeof response?.error === "string"
              ? response.error
              : response?.error?.message || "Failed to send role whisper";
            setState((prev: BackchannelState) => ({
              ...prev,
              messages: prev.messages.filter((m: OptimisticMessage) => m.id !== optimisticId),
              error: errorMsg,
            }));
            resolve(false);
          }
        });
      });
    },
    [socket, state.isJoined, sessionId, user]
  );

  const clearError = useCallback(() => {
    setState((prev: BackchannelState) => ({ ...prev, error: null }));
  }, []);

  return {
    messages: state.messages,
    isConnected: state.isConnected,
    isJoined: state.isJoined,
    error: state.error,
    accessDenied: state.accessDenied,
    isSending,
    currentUserId: user?.id,
    sendMessage,
    sendWhisperToUser,
    sendWhisperToRole,
    clearError,
  };
};
