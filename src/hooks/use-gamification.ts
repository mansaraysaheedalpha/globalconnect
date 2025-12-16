// src/hooks/use-gamification.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

// Point reason types (matches backend)
export type PointReason =
  | "MESSAGE_SENT"
  | "MESSAGE_REACTED"
  | "QUESTION_ASKED"
  | "QUESTION_UPVOTED"
  | "POLL_CREATED"
  | "POLL_VOTED"
  | "WAITLIST_JOINED";

// Point values reference
export const POINT_VALUES: Record<PointReason, number> = {
  MESSAGE_SENT: 1,
  MESSAGE_REACTED: 2,
  QUESTION_ASKED: 5,
  QUESTION_UPVOTED: 2,
  POLL_CREATED: 10,
  POLL_VOTED: 1,
  WAITLIST_JOINED: 3,
};

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  score: number;
}

// Team leaderboard entry
export interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  name: string;
  memberCount: number;
  score: number;
}

// Achievement definition
export interface Achievement {
  id: string;
  badgeName: string;
  description: string;
  unlockedAt: string;
  icon?: string;
}

// Points awarded event payload
export interface PointsAwarded {
  points: number;
  reason: PointReason;
  newTotalScore: number;
}

// Leaderboard data
export interface LeaderboardData {
  topEntries: LeaderboardEntry[];
  currentUser: {
    rank: number | null;
    score: number;
  } | null;
}

// Recent point event for displaying animations
export interface RecentPointEvent {
  id: string;
  points: number;
  reason: PointReason;
  timestamp: number;
}

interface GamificationState {
  isConnected: boolean;
  isJoined: boolean;
  error: string | null;
  leaderboard: LeaderboardData | null;
  teamLeaderboard: TeamLeaderboardEntry[] | null;
  currentScore: number;
  currentRank: number | null;
  achievements: Achievement[];
  recentPointEvents: RecentPointEvent[];
  isLoadingLeaderboard: boolean;
}

export const useGamification = (sessionId: string, eventId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<GamificationState>({
    isConnected: false,
    isJoined: false,
    error: null,
    leaderboard: null,
    teamLeaderboard: null,
    currentScore: 0,
    currentRank: null,
    achievements: [],
    recentPointEvents: [],
    isLoadingLeaderboard: false,
  });
  const { token, user } = useAuthStore();

  // Event ID counter for recent points
  const eventIdCounter = useRef(0);

  // Add a recent point event (for animations)
  const addPointEvent = useCallback((points: number, reason: PointReason) => {
    eventIdCounter.current++;
    const event: RecentPointEvent = {
      id: `point-${eventIdCounter.current}-${Date.now()}`,
      points,
      reason,
      timestamp: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      recentPointEvents: [...prev.recentPointEvents, event].slice(-10), // Keep last 10
    }));

    // Auto-remove after animation duration
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        recentPointEvents: prev.recentPointEvents.filter((e) => e.id !== event.id),
      }));
    }, 3000);
  }, []);

  // Socket connection and event handling
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

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", () => {
      // Join the session room
      newSocket.emit(
        "session.join",
        { sessionId, eventId },
        (response: { success: boolean; error?: { message: string } }) => {
          if (response?.success) {
            setState((prev) => ({ ...prev, isJoined: true }));
          } else {
            setState((prev) => ({
              ...prev,
              error: response?.error?.message || "Failed to join session",
            }));
          }
        }
      );
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    // Receive points awarded (private - sent to user room)
    newSocket.on("gamification.points.awarded", (data: PointsAwarded) => {
      console.log("[Gamification] Points awarded:", data);

      setState((prev) => ({
        ...prev,
        currentScore: data.newTotalScore,
      }));

      // Add visual event
      addPointEvent(data.points, data.reason);
    });

    // Achievement unlocked (private - sent to user room)
    newSocket.on("achievement.unlocked", (achievement: Achievement) => {
      console.log("[Gamification] Achievement unlocked:", achievement);

      setState((prev) => ({
        ...prev,
        achievements: [...prev.achievements, achievement],
      }));
    });

    // Leaderboard updated (broadcast to session room)
    newSocket.on(
      "leaderboard.updated",
      (data: { topEntries: LeaderboardEntry[] }) => {
        setState((prev) => ({
          ...prev,
          leaderboard: prev.leaderboard
            ? { ...prev.leaderboard, topEntries: data.topEntries }
            : { topEntries: data.topEntries, currentUser: null },
        }));

        // Update current user's rank if they're in the leaderboard
        const userEntry = data.topEntries.find((e) => e.user.id === user?.id);
        if (userEntry) {
          setState((prev) => ({
            ...prev,
            currentRank: userEntry.rank,
            currentScore: userEntry.score,
          }));
        }
      }
    );

    // Team leaderboard updated
    newSocket.on(
      "team.leaderboard.updated",
      (data: { teamScores: TeamLeaderboardEntry[] }) => {
        setState((prev) => ({
          ...prev,
          teamLeaderboard: data.teamScores,
        }));
      }
    );

    // Error handling
    newSocket.on("systemError", (error: { message: string }) => {
      console.error("[Gamification] System error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Gamification] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Cleanup
    return () => {
      newSocket.emit("session.leave", { sessionId });
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("disconnect");
      newSocket.off("gamification.points.awarded");
      newSocket.off("achievement.unlocked");
      newSocket.off("leaderboard.updated");
      newSocket.off("team.leaderboard.updated");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, eventId, token, user?.id, addPointEvent]);

  // Request leaderboard data
  const requestLeaderboard = useCallback(async (): Promise<LeaderboardData | null> => {
    if (!socketRef.current || !state.isJoined) {
      console.warn("[Gamification] Cannot request leaderboard - not connected");
      return null;
    }

    setState((prev) => ({ ...prev, isLoadingLeaderboard: true }));

    return new Promise((resolve) => {
      socketRef.current!.emit(
        "leaderboard.request",
        null,
        (response: {
          success: boolean;
          data?: LeaderboardData;
          error?: string;
        }) => {
          setState((prev) => ({ ...prev, isLoadingLeaderboard: false }));

          if (response?.success && response.data) {
            setState((prev) => ({
              ...prev,
              leaderboard: response.data!,
              currentRank: response.data!.currentUser?.rank || null,
              currentScore: response.data!.currentUser?.score || prev.currentScore,
            }));
            resolve(response.data);
          } else {
            console.error("[Gamification] Failed to get leaderboard:", response?.error);
            resolve(null);
          }
        }
      );
    });
  }, [state.isJoined]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Clear recent achievements (after showing them)
  const clearRecentAchievements = useCallback((achievementIds: string[]) => {
    setState((prev) => ({
      ...prev,
      achievements: prev.achievements.filter(
        (a) => !achievementIds.includes(a.id)
      ),
    }));
  }, []);

  // Get human-readable reason text
  const getReasonText = useCallback((reason: PointReason): string => {
    const reasonTexts: Record<PointReason, string> = {
      MESSAGE_SENT: "Message sent",
      MESSAGE_REACTED: "Reacted to message",
      QUESTION_ASKED: "Asked a question",
      QUESTION_UPVOTED: "Upvoted a question",
      POLL_CREATED: "Created a poll",
      POLL_VOTED: "Voted in poll",
      WAITLIST_JOINED: "Joined waitlist",
    };
    return reasonTexts[reason] || reason;
  }, []);

  return {
    // State
    isConnected: state.isConnected,
    isJoined: state.isJoined,
    error: state.error,
    leaderboard: state.leaderboard,
    teamLeaderboard: state.teamLeaderboard,
    currentScore: state.currentScore,
    currentRank: state.currentRank,
    achievements: state.achievements,
    recentPointEvents: state.recentPointEvents,
    isLoadingLeaderboard: state.isLoadingLeaderboard,
    currentUserId: user?.id,

    // Actions
    requestLeaderboard,
    clearError,
    clearRecentAchievements,

    // Utilities
    getReasonText,
    POINT_VALUES,
  };
};
