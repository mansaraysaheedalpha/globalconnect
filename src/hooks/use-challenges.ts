// src/hooks/use-challenges.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { v4 as uuidv4 } from "uuid";

export interface ChallengeTemplate {
  key: string;
  name: string;
  description: string;
  type: string;
  durationMinutes: number;
  trackedReason: string;
  rewardFirst: number;
  rewardSecond: number;
  rewardThird: number;
}

export interface ChallengeTeamProgress {
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
}

export interface Challenge {
  id: string;
  sessionId: string;
  name: string;
  description?: string;
  type: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  durationMinutes: number;
  startedAt?: string;
  endedAt?: string;
  trackedReason?: string;
  rewardFirst: number;
  rewardSecond: number;
  rewardThird: number;
  progress?: ChallengeTeamProgress[];
}

export interface ChallengeProgressUpdate {
  challengeId: string;
  name: string;
  type: string;
  status: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  teams: ChallengeTeamProgress[];
}

export interface ChallengeCompletedEvent {
  challengeId: string;
  name: string;
  rankings: Array<{ rank: number; teamId: string; score: number }>;
}

interface UseChallengesOptions {
  sessionId: string;
  autoConnect?: boolean;
}

const SOCKET_TIMEOUT = 30000;

export const useChallenges = ({
  sessionId,
  autoConnect = true,
}: UseChallengesOptions) => {
  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [templates, setTemplates] = useState<ChallengeTemplate[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeProgressUpdate | null>(null);
  const [lastCompleted, setLastCompleted] = useState<ChallengeCompletedEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived: is a challenge currently active?
  const hasActiveChallenge = !!activeChallenge;

  // Time remaining for active challenge (computed from endedAt)
  const getTimeRemaining = useCallback(() => {
    if (!activeChallenge?.endedAt) return 0;
    const remaining = new Date(activeChallenge.endedAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }, [activeChallenge?.endedAt]);

  // ─── Actions ────────────────────────────────────────────────

  const requestTemplates = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("challenge.templates");
  }, []);

  const requestChallenges = useCallback((status?: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("challenge.list", status ? { status } : {});
  }, []);

  const requestProgress = useCallback((challengeId: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("challenge.progress", { challengeId });
  }, []);

  const createChallenge = useCallback(
    async (data: {
      name: string;
      description?: string;
      type: string;
      durationMinutes: number;
      trackedReason?: string;
      actionWeights?: Record<string, number>;
      rewardFirst?: number;
      rewardSecond?: number;
      rewardThird?: number;
    }) => {
      if (!socketRef.current?.connected) {
        return { success: false, error: "Not connected" };
      }

      setIsLoading(true);
      setError(null);

      return new Promise<{ success: boolean; challenge?: Challenge; error?: string }>((resolve) => {
        const timeoutId = setTimeout(() => {
          socketRef.current?.off("challenge.create.response", handler);
          setIsLoading(false);
          resolve({ success: false, error: "Request timed out" });
        }, SOCKET_TIMEOUT);

        const handler = (response: any) => {
          clearTimeout(timeoutId);
          socketRef.current?.off("challenge.create.response", handler);
          setIsLoading(false);
          if (!response.success) setError(response.error);
          resolve(response);
        };

        socketRef.current!.on("challenge.create.response", handler);
        socketRef.current!.emit("challenge.create", {
          ...data,
          idempotencyKey: uuidv4(),
        });
      });
    },
    []
  );

  const startChallenge = useCallback(
    async (challengeId: string) => {
      if (!socketRef.current?.connected) {
        return { success: false, error: "Not connected" };
      }

      setIsLoading(true);
      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        const timeoutId = setTimeout(() => {
          socketRef.current?.off("challenge.start.response", handler);
          setIsLoading(false);
          resolve({ success: false, error: "Request timed out" });
        }, SOCKET_TIMEOUT);

        const handler = (response: any) => {
          clearTimeout(timeoutId);
          socketRef.current?.off("challenge.start.response", handler);
          setIsLoading(false);
          resolve(response);
        };

        socketRef.current!.on("challenge.start.response", handler);
        socketRef.current!.emit("challenge.start", { challengeId });
      });
    },
    []
  );

  const cancelChallenge = useCallback(
    async (challengeId: string) => {
      if (!socketRef.current?.connected) {
        return { success: false, error: "Not connected" };
      }

      setIsLoading(true);
      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        const timeoutId = setTimeout(() => {
          socketRef.current?.off("challenge.cancel.response", handler);
          setIsLoading(false);
          resolve({ success: false, error: "Request timed out" });
        }, SOCKET_TIMEOUT);

        const handler = (response: any) => {
          clearTimeout(timeoutId);
          socketRef.current?.off("challenge.cancel.response", handler);
          setIsLoading(false);
          resolve(response);
        };

        socketRef.current!.on("challenge.cancel.response", handler);
        socketRef.current!.emit("challenge.cancel", { challengeId });
      });
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);
  const clearLastCompleted = useCallback(() => setLastCompleted(null), []);

  // ─── Socket Connection ──────────────────────────────────────

  useEffect(() => {
    if (!sessionId || !token || !autoConnect) return;

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
      // Fetch initial data
      newSocket.emit("challenge.templates");
      newSocket.emit("challenge.list", {});
    });

    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("connect_error", (err) => setError(err.message));

    // ─── Broadcast Events ──────────────────────────────

    // Templates loaded
    newSocket.on("challenge.templates.response", (data: any) => {
      if (data?.success && data.templates) {
        setTemplates(data.templates);
      }
    });

    // Challenge list loaded
    newSocket.on("challenge.list.response", (data: any) => {
      if (data?.success && data.challenges) {
        setChallenges(data.challenges);
      }
    });

    // New challenge created
    newSocket.on("challenge.created", (challenge: Challenge) => {
      if (!challenge) return;
      setChallenges((prev) => {
        if (prev.some((c) => c.id === challenge.id)) return prev;
        return [challenge, ...prev];
      });
    });

    // Challenge started
    newSocket.on("challenge.started", (data: any) => {
      if (!data) return;
      // Update challenge in list
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === data.challengeId ? { ...c, status: "ACTIVE", ...data } : c
        )
      );
      // Set as active challenge (fetch full progress)
      newSocket.emit("challenge.progress", { challengeId: data.challengeId });
    });

    // Progress update (debounced from server)
    newSocket.on("challenge.progress.updated", (data: ChallengeProgressUpdate) => {
      if (!data) return;
      setActiveChallenge(data);
    });

    // Progress response (on-demand)
    newSocket.on("challenge.progress.response", (data: any) => {
      if (data?.success) {
        setActiveChallenge(data);
      }
    });

    // Challenge completed
    newSocket.on("challenge.completed", (data: ChallengeCompletedEvent) => {
      if (!data) return;
      setActiveChallenge(null);
      setLastCompleted(data);
      // Update in list
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === data.challengeId ? { ...c, status: "COMPLETED" } : c
        )
      );
    });

    // Challenge cancelled
    newSocket.on("challenge.cancelled", (data: any) => {
      if (!data) return;
      setActiveChallenge(null);
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === data.challengeId ? { ...c, status: "CANCELLED" } : c
        )
      );
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("challenge.templates.response");
      newSocket.off("challenge.list.response");
      newSocket.off("challenge.created");
      newSocket.off("challenge.started");
      newSocket.off("challenge.progress.updated");
      newSocket.off("challenge.progress.response");
      newSocket.off("challenge.completed");
      newSocket.off("challenge.cancelled");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, token, autoConnect]);

  return {
    // State
    isConnected,
    templates,
    challenges,
    activeChallenge,
    lastCompleted,
    hasActiveChallenge,
    isLoading,
    error,

    // Actions
    requestTemplates,
    requestChallenges,
    requestProgress,
    createChallenge,
    startChallenge,
    cancelChallenge,
    clearError,
    clearLastCompleted,

    // Helpers
    getTimeRemaining,
  };
};
