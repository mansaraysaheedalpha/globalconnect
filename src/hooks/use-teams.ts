// src/hooks/use-teams.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { v4 as uuidv4 } from "uuid";

export interface TeamMember {
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  createdAt: string;
  creatorId: string;
  sessionId: string;
  members: TeamMember[];
  score?: number;
}

interface UseTeamsOptions {
  sessionId: string;
  autoConnect?: boolean;
}

interface CreateTeamResponse {
  success: boolean;
  team?: Team;
  error?: string;
}

interface JoinLeaveResponse {
  success: boolean;
  teamId?: string;
  error?: string;
}

const SOCKET_TIMEOUT = 30000;

export const useTeams = ({ sessionId, autoConnect = true }: UseTeamsOptions) => {
  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find current user's team from teams list
  const updateCurrentTeam = useCallback(
    (teamsList: Team[]) => {
      if (!user?.id) {
        setCurrentTeam(null);
        return;
      }
      const userTeam = teamsList.find((team) =>
        team.members.some((m) => m.userId === user.id)
      );
      setCurrentTeam(userTeam || null);
    },
    [user?.id]
  );

  // Create a new team (event-based response pattern)
  const createTeam = useCallback(
    async (name: string): Promise<CreateTeamResponse> => {
      if (!socketRef.current?.connected) {
        return { success: false, error: "Not connected to server" };
      }

      if (!name || name.trim().length === 0) {
        return { success: false, error: "Team name is required" };
      }

      if (name.length > 100) {
        return { success: false, error: "Team name must be 100 characters or less" };
      }

      setIsLoading(true);
      setError(null);

      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          socketRef.current?.off("team.create.response", handler);
          setIsLoading(false);
          resolve({ success: false, error: "Request timed out" });
        }, SOCKET_TIMEOUT);

        const handler = (response: CreateTeamResponse) => {
          clearTimeout(timeoutId);
          socketRef.current?.off("team.create.response", handler);
          setIsLoading(false);

          if (!response.success && response.error) {
            setError(response.error);
          }

          resolve(response);
        };

        socketRef.current!.on("team.create.response", handler);
        socketRef.current!.emit("team.create", { name: name.trim(), idempotencyKey: uuidv4() });
      });
    },
    []
  );

  // Join an existing team (event-based response pattern)
  const joinTeam = useCallback(
    async (teamId: string): Promise<JoinLeaveResponse> => {
      if (!socketRef.current?.connected) {
        return { success: false, error: "Not connected to server" };
      }

      if (!teamId) {
        return { success: false, error: "Team ID is required" };
      }

      // Check if already in a team
      if (currentTeam) {
        return { success: false, error: "You are already in a team. Leave first." };
      }

      setIsLoading(true);
      setError(null);

      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          socketRef.current?.off("team.join.response", handler);
          setIsLoading(false);
          resolve({ success: false, error: "Request timed out" });
        }, SOCKET_TIMEOUT);

        const handler = (response: JoinLeaveResponse) => {
          clearTimeout(timeoutId);
          socketRef.current?.off("team.join.response", handler);
          setIsLoading(false);

          if (!response.success && response.error) {
            setError(response.error);
          }

          resolve(response);
        };

        socketRef.current!.on("team.join.response", handler);
        socketRef.current!.emit("team.join", { teamId, idempotencyKey: uuidv4() });
      });
    },
    [currentTeam]
  );

  // Leave current team (event-based response pattern)
  const leaveTeam = useCallback(async (): Promise<JoinLeaveResponse> => {
    if (!socketRef.current?.connected) {
      return { success: false, error: "Not connected to server" };
    }

    if (!currentTeam) {
      return { success: false, error: "You are not in a team" };
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        socketRef.current?.off("team.leave.response", handler);
        setIsLoading(false);
        resolve({ success: false, error: "Request timed out" });
      }, SOCKET_TIMEOUT);

      const handler = (response: JoinLeaveResponse) => {
        clearTimeout(timeoutId);
        socketRef.current?.off("team.leave.response", handler);
        setIsLoading(false);

        if (!response.success && response.error) {
          setError(response.error);
        }

        resolve(response);
      };

      socketRef.current!.on("team.leave.response", handler);
      socketRef.current!.emit("team.leave", { teamId: currentTeam.id, idempotencyKey: uuidv4() });
    });
  }, [currentTeam]);

  // Clear error
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
      // Join the session room for receiving broadcasts
      newSocket.emit("session.join", { sessionId });
      // Fetch existing teams for this session
      newSocket.emit("teams.list");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      setError(err.message);
    });

    // Initial team list loaded from server
    newSocket.on("teams.list.response", (response: { success: boolean; teams: Team[] }) => {
      if (response.success && response.teams) {
        setTeams(response.teams);
        updateCurrentTeam(response.teams);
      }
    });

    // Team created - add to list
    newSocket.on("team.created", (team: Team) => {
      if (!team) return;
      setTeams((prev) => {
        // Prevent duplicates
        if (prev.some((t) => t.id === team.id)) {
          return prev;
        }
        const updated = [...prev, team];
        updateCurrentTeam(updated);
        return updated;
      });
    });

    // Team roster updated - update the specific team
    newSocket.on("team.roster.updated", (updatedTeam: Team) => {
      if (!updatedTeam) return;
      setTeams((prev) => {
        const updated = prev.map((t) =>
          t.id === updatedTeam.id ? updatedTeam : t
        );
        updateCurrentTeam(updated);
        return updated;
      });
    });

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("teams.list.response");
      newSocket.off("team.created");
      newSocket.off("team.roster.updated");
      newSocket.off("team.create.response");
      newSocket.off("team.join.response");
      newSocket.off("team.leave.response");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, token, autoConnect, updateCurrentTeam]);

  return {
    // State
    isConnected,
    teams,
    currentTeam,
    isLoading,
    error,
    currentUserId: user?.id,

    // Computed
    isInTeam: !!currentTeam,
    teamCount: teams.length,

    // Actions
    createTeam,
    joinTeam,
    leaveTeam,
    clearError,
  };
};
