// src/hooks/use-booth-chat.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { BoothChatMessage } from "@/components/features/expo/types";

interface BoothChatState {
  messages: BoothChatMessage[];
  hasMore: boolean;
  nextCursor: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

interface UseBoothChatOptions {
  boothId: string;
  eventId: string;
  autoConnect?: boolean;
}

interface SocketResponse {
  success: boolean;
  error?: string;
  messages?: BoothChatMessage[];
  message?: BoothChatMessage;
  hasMore?: boolean;
  nextCursor?: string | null;
}

// Play notification sound for new messages
const playMessageSound = () => {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.15
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch {
    // Audio not supported or blocked
  }
};

export const useBoothChat = ({
  boothId,
  eventId,
  autoConnect = true,
}: UseBoothChatOptions) => {
  const [state, setState] = useState<BoothChatState>({
    messages: [],
    hasMore: false,
    nextCursor: null,
    isConnected: false,
    isLoading: false,
    isSending: false,
    error: null,
  });

  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const boothIdRef = useRef(boothId);

  // Keep boothId ref in sync
  useEffect(() => {
    boothIdRef.current = boothId;
  }, [boothId]);

  // Initialize socket connection
  useEffect(() => {
    if (!boothId || !eventId || !token || !autoConnect) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { eventId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
      console.log("[BoothChat] Connected to server");

      // Join booth chat room
      newSocket.emit(
        "expo.booth.chat.join",
        { boothId },
        (response: SocketResponse) => {
          if (!response.success) {
            console.error("[BoothChat] Join failed:", response.error);
          }
        }
      );
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false }));
      console.log("[BoothChat] Disconnected from server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("[BoothChat] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Listen for new chat messages
    newSocket.on("expo.booth.chat.message", (message: BoothChatMessage) => {
      // Only handle messages for our booth
      if (message.boothId !== boothIdRef.current) return;

      // Don't notify for our own messages
      if (message.senderId !== user?.id) {
        playMessageSound();
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
    });

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("expo.booth.chat.message");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [boothId, eventId, token, autoConnect, user?.id]);

  // Helper to emit socket events with callback
  const emitWithCallback = useCallback(
    <T extends SocketResponse>(
      event: string,
      payload: Record<string, unknown>
    ): Promise<T> => {
      return new Promise((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket?.connected) {
          reject(new Error("Not connected to server"));
          return;
        }

        socket.emit(event, payload, (response: T) => {
          if (response?.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || "Unknown error"));
          }
        });
      });
    },
    []
  );

  // Load chat history
  const loadHistory = useCallback(
    async (cursor?: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await emitWithCallback<SocketResponse>(
          "expo.booth.chat.history",
          {
            boothId: boothIdRef.current,
            limit: 50,
            cursor,
          }
        );

        setState((prev) => ({
          ...prev,
          messages: cursor
            ? [...(response.messages || []), ...prev.messages]
            : response.messages || [],
          hasMore: response.hasMore || false,
          nextCursor: response.nextCursor || null,
          isLoading: false,
        }));

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load chat history";
        console.error("[BoothChat] Load history error:", message);
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Load more messages
  const loadMore = useCallback(async (): Promise<boolean> => {
    if (!state.hasMore || !state.nextCursor || state.isLoading) {
      return false;
    }
    return loadHistory(state.nextCursor);
  }, [loadHistory, state.hasMore, state.nextCursor, state.isLoading]);

  // Send a message
  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text.trim()) return false;

      setState((prev) => ({ ...prev, isSending: true, error: null }));

      try {
        await emitWithCallback("expo.booth.chat.send", {
          boothId: boothIdRef.current,
          text: text.trim(),
        });

        setState((prev) => ({ ...prev, isSending: false }));
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to send message";
        console.error("[BoothChat] Send message error:", message);
        setState((prev) => ({ ...prev, isSending: false, error: message }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Load history when connected
  useEffect(() => {
    if (state.isConnected && state.messages.length === 0) {
      loadHistory();
    }
  }, [state.isConnected, state.messages.length, loadHistory]);

  return {
    // State
    messages: state.messages,
    hasMore: state.hasMore,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    isSending: state.isSending,
    error: state.error,
    currentUserId: user?.id,

    // Actions
    sendMessage,
    loadMore,
    loadHistory,
    clearError,
  };
};
