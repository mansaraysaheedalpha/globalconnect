// src/hooks/use-gamification.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  score: number;
}

export interface TeamLeaderboardEntry {
  teamId: string;
  name: string;
  score: number;
  rank: number;
  memberCount: number;
}

export enum PointReason {
  MESSAGE_SENT = "MESSAGE_SENT",
  MESSAGE_REACTED = "MESSAGE_REACTED",
  QUESTION_ASKED = "QUESTION_ASKED",
  QUESTION_UPVOTED = "QUESTION_UPVOTED",
  POLL_CREATED = "POLL_CREATED",
  POLL_VOTED = "POLL_VOTED",
  WAITLIST_JOINED = "WAITLIST_JOINED",
}

export const POINT_VALUES: Record<PointReason, number> = {
  [PointReason.MESSAGE_SENT]: 1,
  [PointReason.MESSAGE_REACTED]: 2,
  [PointReason.QUESTION_ASKED]: 5,
  [PointReason.QUESTION_UPVOTED]: 2,
  [PointReason.POLL_CREATED]: 10,
  [PointReason.POLL_VOTED]: 1,
  [PointReason.WAITLIST_JOINED]: 3,
};

export interface RecentPointEvent {
  id: string;
  reason: PointReason;
  points: number;
  timestamp: number;
}

export interface Achievement {
    id: string;
    badgeName: string;
    description: string;
    icon?: string;
    unlockedAt: string;
}

interface UseGamificationOptions {
  sessionId: string;
  autoConnect?: boolean;
}

export const useGamification = ({
  sessionId,
  autoConnect = true,
}: UseGamificationOptions) => {
  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<TeamLeaderboardEntry[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentPointEvents, setRecentPointEvents] = useState<RecentPointEvent[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLeaderboard = useCallback(() => {
    if (!socketRef.current?.connected) return;
    setIsLoadingLeaderboard(true);
    socketRef.current.emit("leaderboard.request");
  }, []);

  const clearRecentAchievements = useCallback((achievementIds: string[]) => {
    setAchievements((prev) => prev.filter((ach) => !achievementIds.includes(ach.id)));
  }, []);

  const getReasonText = useCallback((reason: PointReason): string => {
    return reason.replace(/_/g, " ").toLowerCase();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize socket connection with proper authentication
  useEffect(() => {
    if (!sessionId || !token || !autoConnect) {
      return;
    }

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
      // Join the session room for receiving broadcasts
      newSocket.emit("session.join", { sessionId });
    });

    newSocket.on("connectionAcknowledged", () => {
      setIsJoined(true);
      // Request initial leaderboard data
      newSocket.emit("leaderboard.request");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      setIsJoined(false);
    });

    newSocket.on("connect_error", (err) => {
      setError(err.message);
    });

    // Leaderboard events
    newSocket.on("leaderboard.data", (data: { topEntries: LeaderboardEntry[] }) => {
      if (data?.topEntries) {
        setLeaderboard(data.topEntries);
      }
      setIsLoadingLeaderboard(false);
    });

    newSocket.on("leaderboard.updated", (data: { topEntries: LeaderboardEntry[] }) => {
      if (data?.topEntries) {
        setLeaderboard(data.topEntries);
      }
    });

    // Team leaderboard events
    newSocket.on("team.leaderboard.updated", (data: { teamScores: TeamLeaderboardEntry[] }) => {
      if (data?.teamScores) {
        setTeamLeaderboard(data.teamScores);
      }
    });

    // Points awarded event (private to user)
    newSocket.on("gamification.points.awarded", (data: RecentPointEvent) => {
      if (!data) return;
      setRecentPointEvents((prev) => [...prev, data]);
      setCurrentScore((prev) => prev + (data.points || 0));
      // Auto-clear after 5 seconds
      setTimeout(() => {
        setRecentPointEvents((prev) => prev.filter((event) => event.id !== data.id));
      }, 5000);
    });

    // Achievement unlocked event (private to user)
    newSocket.on("achievement.unlocked", (data: Achievement) => {
      if (!data) return;
      setAchievements((prev) => [...prev, data]);
    });

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("leaderboard.data");
      newSocket.off("leaderboard.updated");
      newSocket.off("team.leaderboard.updated");
      newSocket.off("gamification.points.awarded");
      newSocket.off("achievement.unlocked");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, token, autoConnect]);

  // Update current user's rank and score from leaderboard
  useEffect(() => {
    if (!user?.id) return;
    const currentUser = leaderboard.find((entry) => entry.user.id === user.id);
    if (currentUser) {
      setCurrentRank(currentUser.rank);
      setCurrentScore(currentUser.score);
    }
  }, [leaderboard, user?.id]);

  return {
    // State
    isConnected,
    isJoined,
    leaderboard,
    teamLeaderboard,
    currentScore,
    currentRank,
    achievements,
    recentPointEvents,
    isLoadingLeaderboard,
    error,
    currentUserId: user?.id,

    // Actions
    requestLeaderboard,
    clearRecentAchievements,
    clearError,

    // Helpers
    getReasonText,
  };
};