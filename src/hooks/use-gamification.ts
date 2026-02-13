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
  TEAM_CREATED = "TEAM_CREATED",
  TEAM_JOINED = "TEAM_JOINED",
  SESSION_JOINED = "SESSION_JOINED",
  CHALLENGE_COMPLETED = "CHALLENGE_COMPLETED",
  CHALLENGE_WON_FIRST = "CHALLENGE_WON_FIRST",
  CHALLENGE_WON_SECOND = "CHALLENGE_WON_SECOND",
  CHALLENGE_WON_THIRD = "CHALLENGE_WON_THIRD",
  TRIVIA_CORRECT = "TRIVIA_CORRECT",
  TRIVIA_SPEED_BONUS = "TRIVIA_SPEED_BONUS",
  TEAM_SYNERGY_BONUS = "TEAM_SYNERGY_BONUS",
}

export const POINT_VALUES: Record<PointReason, number> = {
  [PointReason.MESSAGE_SENT]: 1,
  [PointReason.MESSAGE_REACTED]: 2,
  [PointReason.QUESTION_ASKED]: 5,
  [PointReason.QUESTION_UPVOTED]: 2,
  [PointReason.POLL_CREATED]: 10,
  [PointReason.POLL_VOTED]: 1,
  [PointReason.WAITLIST_JOINED]: 3,
  [PointReason.TEAM_CREATED]: 5,
  [PointReason.TEAM_JOINED]: 3,
  [PointReason.SESSION_JOINED]: 2,
  [PointReason.CHALLENGE_COMPLETED]: 10,
  [PointReason.CHALLENGE_WON_FIRST]: 50,
  [PointReason.CHALLENGE_WON_SECOND]: 30,
  [PointReason.CHALLENGE_WON_THIRD]: 15,
  [PointReason.TRIVIA_CORRECT]: 10,
  [PointReason.TRIVIA_SPEED_BONUS]: 5,
  [PointReason.TEAM_SYNERGY_BONUS]: 0,
};

export interface RecentPointEvent {
  id: string;
  reason: PointReason;
  points: number;
  basePoints?: number;
  streakMultiplier?: number;
  streakCount?: number;
  timestamp: number;
}

export interface Achievement {
  id: string;
  badgeName: string;
  description: string;
  icon?: string;
  category?: string;
  unlockedAt?: string;
  createdAt?: string;
}

export interface AchievementProgress {
  key: string;
  badgeName: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  current: number;
  target: number;
  percentage: number;
}

export interface StreakInfo {
  count: number;
  multiplier: number;
  active: boolean;
}

export interface UserStats {
  totalPoints: number;
  rank: number | null;
  achievementCount: number;
  totalAchievements: number;
  streak: StreakInfo;
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
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [recentPointEvents, setRecentPointEvents] = useState<RecentPointEvent[]>([]);
  const [streak, setStreak] = useState<StreakInfo>({ count: 0, multiplier: 1.0, active: false });
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Persistent cumulative counts per reason (not auto-cleared like recentPointEvents)
  const activityCountsRef = useRef<Record<string, number>>({});

  const requestLeaderboard = useCallback(() => {
    if (!socketRef.current?.connected) return;
    setIsLoadingLeaderboard(true);
    socketRef.current.emit("leaderboard.request");
  }, []);

  const requestAchievements = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("achievements.request");
  }, []);

  const requestUserStats = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("user.stats.request");
  }, []);

  const clearRecentAchievements = useCallback((achievementIds: string[]) => {
    setAchievements((prev) => prev.filter((ach) => !achievementIds.includes(ach.id)));
  }, []);

  const getReasonText = useCallback((reason: PointReason): string => {
    const labels: Record<string, string> = {
      MESSAGE_SENT: "Chat message",
      MESSAGE_REACTED: "Reaction",
      QUESTION_ASKED: "Question asked",
      QUESTION_UPVOTED: "Question upvoted",
      POLL_CREATED: "Poll created",
      POLL_VOTED: "Poll vote",
      WAITLIST_JOINED: "Joined waitlist",
      TEAM_CREATED: "Team created",
      TEAM_JOINED: "Joined team",
      SESSION_JOINED: "Joined session",
      CHALLENGE_COMPLETED: "Challenge completed",
      CHALLENGE_WON_FIRST: "Challenge 1st place",
      CHALLENGE_WON_SECOND: "Challenge 2nd place",
      CHALLENGE_WON_THIRD: "Challenge 3rd place",
      TRIVIA_CORRECT: "Trivia correct",
      TRIVIA_SPEED_BONUS: "Trivia speed bonus",
      TEAM_SYNERGY_BONUS: "Team synergy",
    };
    return labels[reason] || reason.replace(/_/g, " ").toLowerCase();
  }, []);

  const getReasonEmoji = useCallback((reason: PointReason): string => {
    const emojis: Record<string, string> = {
      MESSAGE_SENT: "💬",
      MESSAGE_REACTED: "👍",
      QUESTION_ASKED: "❓",
      QUESTION_UPVOTED: "⬆️",
      POLL_CREATED: "📊",
      POLL_VOTED: "✅",
      WAITLIST_JOINED: "⏳",
      TEAM_CREATED: "🚀",
      TEAM_JOINED: "🤜",
      SESSION_JOINED: "🧭",
      CHALLENGE_COMPLETED: "⚔️",
      CHALLENGE_WON_FIRST: "🥇",
      CHALLENGE_WON_SECOND: "🥈",
      CHALLENGE_WON_THIRD: "🥉",
      TRIVIA_CORRECT: "🧩",
      TRIVIA_SPEED_BONUS: "⚡",
      TEAM_SYNERGY_BONUS: "🤝",
    };
    return emojis[reason] || "⭐";
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize socket connection
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
      newSocket.emit("session.join", { sessionId });
    });

    newSocket.on("connectionAcknowledged", () => {
      setIsJoined(true);
      // Request initial data
      newSocket.emit("leaderboard.request");
      newSocket.emit("achievements.request");
      newSocket.emit("user.stats.request");
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
    newSocket.on("gamification.points.awarded", (data: any) => {
      if (!data) return;
      const event: RecentPointEvent = {
        id: `${Date.now()}-${Math.random()}`,
        reason: data.reason,
        points: data.points,
        basePoints: data.basePoints,
        streakMultiplier: data.streakMultiplier,
        streakCount: data.streakCount,
        timestamp: Date.now(),
      };
      setRecentPointEvents((prev) => [...prev, event]);
      setCurrentScore(data.newTotalScore || 0);

      // Track cumulative activity count per reason (persists across auto-clears)
      activityCountsRef.current[data.reason] =
        (activityCountsRef.current[data.reason] || 0) + 1;

      // Update streak from points event
      if (data.streakCount !== undefined) {
        setStreak({
          count: data.streakCount,
          multiplier: data.streakMultiplier || 1.0,
          active: data.streakCount > 0,
        });
      }

      // Auto-clear point animation after 5 seconds
      setTimeout(() => {
        setRecentPointEvents((prev) => prev.filter((e) => e.id !== event.id));
      }, 5000);
    });

    // Achievement unlocked event (private to user)
    newSocket.on("achievement.unlocked", (data: Achievement) => {
      if (!data) return;
      setAchievements((prev) => [...prev, data]);
      // Refresh achievement progress
      newSocket.emit("achievements.request");
    });

    // Achievements data response
    // NestJS emits the gateway return's `data` field directly as the event payload
    newSocket.on("achievements.data", (data: any) => {
      if (data?.achievements) {
        setAllAchievements(data.achievements);
      }
      if (data?.progress) {
        setAchievementProgress(data.progress);
      }
    });

    // User stats response
    newSocket.on("user.stats.data", (data: any) => {
      if (data) {
        setUserStats(data);
        if (data.streak) {
          setStreak(data.streak);
        }
      }
    });

    // Streak update event
    newSocket.on("gamification.streak.updated", (data: StreakInfo) => {
      if (data) {
        setStreak(data);
      }
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
      newSocket.off("achievements.data");
      newSocket.off("user.stats.data");
      newSocket.off("gamification.streak.updated");
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
    allAchievements,
    achievementProgress,
    recentPointEvents,
    streak,
    userStats,
    isLoadingLeaderboard,
    error,
    currentUserId: user?.id,

    // Actions
    requestLeaderboard,
    requestAchievements,
    requestUserStats,
    clearRecentAchievements,
    clearError,

    // Helpers
    getReasonText,
    getReasonEmoji,

    // Cumulative activity counts per reason (persists for session summary)
    activityCounts: activityCountsRef.current,
  };
};
