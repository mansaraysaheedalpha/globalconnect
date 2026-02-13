// src/hooks/use-team-chat.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { v4 as uuidv4 } from "uuid";

export interface TeamChatMessage {
  id: string;
  teamId: string;
  text: string;
  metadata?: Record<string, any>;
  reactions: Record<string, string[]>;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface UseTeamChatOptions {
  sessionId: string;
  teamId: string;
  autoConnect?: boolean;
}

const SOCKET_TIMEOUT = 15000;

export const useTeamChat = ({
  sessionId,
  teamId,
  autoConnect = true,
}: UseTeamChatOptions) => {
  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const sendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up sending timer on unmount
  useEffect(() => {
    return () => {
      if (sendingTimerRef.current) clearTimeout(sendingTimerRef.current);
    };
  }, []);

  // ─── Actions ────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      if (!socketRef.current?.connected || !text.trim()) return;

      setIsSending(true);
      const idempotencyKey = uuidv4();

      socketRef.current.emit("team.chat.send", {
        teamId,
        text: text.trim(),
        idempotencyKey,
      });

      // Don't wait for response — the message will arrive via team.chat.message.new
      if (sendingTimerRef.current) clearTimeout(sendingTimerRef.current);
      sendingTimerRef.current = setTimeout(() => setIsSending(false), 500);
    },
    [teamId]
  );

  const toggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!socketRef.current?.connected) return;

      socketRef.current.emit("team.chat.react", {
        teamId,
        messageId,
        emoji,
        idempotencyKey: uuidv4(),
      });
    },
    [teamId]
  );

  const loadMoreHistory = useCallback(() => {
    if (!socketRef.current?.connected || isLoadingHistory || messages.length === 0) return;

    setIsLoadingHistory(true);
    const oldestMessage = messages[0];

    socketRef.current.emit("team.chat.history", {
      teamId,
      before: oldestMessage.id,
      limit: 50,
    });
  }, [teamId, isLoadingHistory, messages]);

  const clearError = useCallback(() => setError(null), []);

  // ─── Socket Connection ──────────────────────────────────────

  useEffect(() => {
    if (!sessionId || !teamId || !token || !autoConnect) return;

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      newSocket.emit("session.join", { sessionId });
      // Load initial history
      newSocket.emit("team.chat.history", { teamId, limit: 50 });
    });

    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("connect_error", (err) => setError(err.message));

    // New message broadcast
    newSocket.on("team.chat.message.new", (data: { message: TeamChatMessage }) => {
      if (!data?.message) return;
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    });

    // Message updated (reaction toggled)
    newSocket.on("team.chat.message.updated", (data: { message: TeamChatMessage }) => {
      if (!data?.message) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === data.message.id ? data.message : m))
      );
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("team.chat.message.new");
      newSocket.off("team.chat.message.updated");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, teamId, token, autoConnect]);

  // Load initial history via a one-shot emit+listen pattern
  // (NestJS @SubscribeMessage returns data as acknowledgment)
  useEffect(() => {
    if (!socketRef.current?.connected || !teamId) return;

    const handleHistory = (response: any) => {
      if (response?.success && response.messages) {
        setMessages(response.messages);
        setHasMore(response.hasMore || false);
      }
      setIsLoadingHistory(false);
    };

    // NestJS SubscribeMessage returns the value as the callback ack,
    // so we listen for the event name we emit with a callback
    socketRef.current.emit(
      "team.chat.history",
      { teamId, limit: 50 },
      handleHistory
    );
  }, [teamId, isConnected]);

  return {
    isConnected,
    messages,
    hasMore,
    isLoadingHistory,
    isSending,
    error,
    currentUserId: user?.id,

    sendMessage,
    toggleReaction,
    loadMoreHistory,
    clearError,
  };
};
