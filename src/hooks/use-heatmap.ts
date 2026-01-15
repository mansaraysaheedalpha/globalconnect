// src/hooks/use-heatmap.ts
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import {
  HeatmapState,
  HeatmapData,
  HeatmapServerData,
  HeatmapZone,
  HeatmapResponse,
  getActivityLevel,
  ActivityLevel,
} from "@/types/heatmap";

// Timeout for socket operations (ms)
const SOCKET_TIMEOUT = 10000;

// Validate heatmap server data
function isValidHeatmapData(data: unknown): data is HeatmapServerData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    d.sessionHeat !== null &&
    typeof d.sessionHeat === "object" &&
    typeof d.updatedAt === "string"
  );
}

interface UseHeatmapOptions {
  eventId: string;
  autoConnect?: boolean;
}

export const useHeatmap = ({
  eventId,
  autoConnect = true,
}: UseHeatmapOptions) => {
  const [state, setState] = useState<HeatmapState>({
    data: null,
    isConnected: false,
    isJoined: false,
    isLoading: false,
    error: null,
  });

  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const eventIdRef = useRef(eventId);

  // Keep eventIdRef in sync with eventId prop
  useEffect(() => {
    eventIdRef.current = eventId;
  }, [eventId]);

  // Process raw server data into frontend-friendly format
  const processHeatmapData = useCallback(
    (serverData: HeatmapServerData): HeatmapData => {
      const sessionHeat = serverData.sessionHeat || {};
      const zones: HeatmapZone[] = Object.entries(sessionHeat).map(
        ([sessionId, data]) => {
          // Safe access with defaults
          const heat = data?.heat ?? 0;
          const chatVelocity = data?.chatVelocity ?? 0;
          const qnaVelocity = data?.qnaVelocity ?? 0;

          return {
            zoneId: sessionId,
            zoneName: `Session ${sessionId?.slice(0, 8) || "Unknown"}`,
            activityLevel: getActivityLevel(heat),
            attendeeCount: Math.round(heat),
            heatScore: heat,
            chatVelocity,
            qnaVelocity,
          };
        }
      );

      // Calculate overall activity
      const totalHeat = zones.reduce((sum, z) => sum + z.heatScore, 0);
      const avgHeat = zones.length > 0 ? totalHeat / zones.length : 0;
      const overallActivityLevel = getActivityLevel(avgHeat);

      return {
        zones: zones.sort((a, b) => b.heatScore - a.heatScore),
        totalAttendees: zones.reduce((sum, z) => sum + z.attendeeCount, 0),
        overallActivityLevel,
        updatedAt: serverData.updatedAt,
      };
    },
    []
  );

  // Initialize socket connection
  useEffect(() => {
    if (!eventId || !token || !autoConnect) {
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
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    newSocket.on("connect_error", (error) => {
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Listen for heatmap updates with validation
    newSocket.on("heatmap.updated", (serverData: unknown) => {
      if (!isValidHeatmapData(serverData)) {
        return; // Silently ignore invalid payloads
      }
      const processedData = processHeatmapData(serverData);
      setState((prev) => ({
        ...prev,
        data: processedData,
        isLoading: false,
      }));
    });

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("heatmap.updated");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, token, autoConnect, processHeatmapData]);

  // Join the heatmap room with timeout
  const joinHeatmap = useCallback(async (): Promise<boolean> => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      setState((prev) => ({ ...prev, error: "Not connected to server" }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          error: "Join request timed out",
          isLoading: false,
        }));
        resolve(false);
      }, SOCKET_TIMEOUT);

      socket.emit("heatmap.join", {}, (response: HeatmapResponse) => {
        clearTimeout(timeoutId);
        if (response?.success) {
          setState((prev) => ({
            ...prev,
            isJoined: true,
            error: null,
          }));
          resolve(true);
        } else {
          const error = response?.error || "Failed to join heatmap";
          setState((prev) => ({
            ...prev,
            error,
            isLoading: false,
          }));
          resolve(false);
        }
      });
    });
  }, []);

  // Auto-join when connected
  useEffect(() => {
    if (state.isConnected && !state.isJoined && autoConnect) {
      joinHeatmap();
    }
  }, [state.isConnected, state.isJoined, autoConnect, joinHeatmap]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Get zones by activity level
  const getZonesByActivity = useCallback(
    (level: ActivityLevel) => {
      return state.data?.zones.filter((z) => z.activityLevel === level) || [];
    },
    [state.data]
  );

  // Get critical zones (high activity)
  const getCriticalZones = useCallback(() => {
    return (
      state.data?.zones.filter(
        (z) => z.activityLevel === "critical" || z.activityLevel === "high"
      ) || []
    );
  }, [state.data]);

  return {
    // State
    data: state.data,
    isConnected: state.isConnected,
    isJoined: state.isJoined,
    isLoading: state.isLoading,
    error: state.error,

    // Computed
    zones: state.data?.zones || [],
    totalAttendees: state.data?.totalAttendees || 0,
    overallActivity: state.data?.overallActivityLevel || "low",
    lastUpdated: state.data?.updatedAt,

    // Actions
    joinHeatmap,
    getZonesByActivity,
    getCriticalZones,
    clearError,
  };
};
