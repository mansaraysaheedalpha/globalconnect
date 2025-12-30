
import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

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
  [PointReason.MESSAGE_SENT]: 10,
  [PointReason.MESSAGE_REACTED]: 5,
  [PointReason.QUESTION_ASKED]: 20,
  [PointReason.QUESTION_UPVOTED]: 5,
  [PointReason.POLL_CREATED]: 15,
  [PointReason.POLL_VOTED]: 10,
  [PointReason.WAITLIST_JOINED]: 5,
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

export const useGamification = (sessionId: string, userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<
    TeamLeaderboardEntry[]
  >([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentPointEvents, setRecentPointEvents] = useState<RecentPointEvent[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const requestLeaderboard = useCallback(() => {
    setIsLoadingLeaderboard(true);
    socket?.emit("leaderboard.request");
  }, [socket]);

  const clearRecentAchievements = (achievementIds: string[]) => {
    setAchievements(prev => prev.filter(ach => !achievementIds.includes(ach.id)));
  };

  const getReasonText = (reason: PointReason): string => {
    return reason.replace(/_/g, " ").toLowerCase();
  }

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      query: { sessionId },
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to gamification socket");
      setIsConnected(true);
      newSocket.emit("join", { userId });
    });

    newSocket.on("joined", () => {
        setIsJoined(true);
    });

    newSocket.on("leaderboard.data", (data) => {
      setLeaderboard(data.topEntries);
      setIsLoadingLeaderboard(false);
    });

    newSocket.on("leaderboard.updated", (data) => {
      setLeaderboard(data.topEntries);
    });

    newSocket.on("team.leaderboard.updated", (data) => {
      setTeamLeaderboard(data.teamScores);
    });

    newSocket.on("point.event", (data: RecentPointEvent) => {
        setRecentPointEvents(prev => [...prev, data]);
        setCurrentScore(prev => prev + data.points);
        setTimeout(() => {
            setRecentPointEvents(prev => prev.filter(event => event.id !== data.id));
        }, 5000);
    });

    newSocket.on("achievement.unlocked", (data: Achievement) => {
        setAchievements(prev => [...prev, data]);
    });

    newSocket.on("disconnect", () => {
        setIsConnected(false);
        setIsJoined(false);
    })

    return () => {
      newSocket.off("connect");
      newSocket.off("joined");
      newSocket.off("leaderboard.data");
      newSocket.off("leaderboard.updated");
      newSocket.off("team.leaderboard.updated");
      newSocket.off("point.event");
      newSocket.off("achievement.unlocked");
      newSocket.off("disconnect");
      newSocket.disconnect();
    };
  }, [sessionId, userId]);

  useEffect(() => {
    const currentUser = leaderboard.find(entry => entry.user.id === userId);
    if (currentUser) {
      setCurrentRank(currentUser.rank);
      setCurrentScore(currentUser.score);
    }
  }, [leaderboard, userId]);

  return {
    isConnected,
    isJoined,
    leaderboard,
    teamLeaderboard,
    currentScore,
    currentRank,
    achievements,
    recentPointEvents,
    isLoadingLeaderboard,
    currentUserId: userId,
    requestLeaderboard,
    clearRecentAchievements,
    getReasonText,
  };
};