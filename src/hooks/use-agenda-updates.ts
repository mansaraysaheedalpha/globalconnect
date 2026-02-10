// src/hooks/use-agenda-updates.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useSocketCache } from "./use-socket-cache";
import { useNetworkStatus } from "./use-network-status";

// Agenda update types
export type AgendaUpdateType = "CREATED" | "UPDATED" | "DELETED";

// Session structure in agenda
export interface AgendaSession {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  track?: string;
  speakers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  status?: "upcoming" | "live" | "completed" | "cancelled";
}

// Agenda update payload
export interface AgendaUpdate {
  id: string;
  eventId: string;
  updateType: AgendaUpdateType;
  session: AgendaSession;
  timestamp: string;
  previousValue?: Partial<AgendaSession>; // For UPDATED type
}

interface AgendaUpdatesState {
  isConnected: boolean;
  isJoined: boolean;
  sessions: AgendaSession[];
  recentUpdates: AgendaUpdate[];
  error: string | null;
}

// Max recent updates to keep
const MAX_RECENT_UPDATES = 20;

export const useAgendaUpdates = (eventId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<AgendaUpdatesState>({
    isConnected: false,
    isJoined: false,
    sessions: [],
    recentUpdates: [],
    error: null,
  });
  const { token } = useAuthStore();
  const { isOnline } = useNetworkStatus();

  // --- Agenda cache (P1.2): persist/restore sessions to IndexedDB ---
  const {
    cachedData: cachedSessions,
    cacheLoaded,
    cachedAt,
    isStale,
    persistToCache,
  } = useSocketCache<AgendaSession[]>({
    feature: "agenda",
    sessionId: eventId, // event-scoped but uses sessionId param for cache key
  });

  // Update ID counter
  const updateIdCounter = useRef(0);

  // Generate unique update ID
  const generateUpdateId = useCallback(() => {
    updateIdCounter.current++;
    return `update-${Date.now()}-${updateIdCounter.current}`;
  }, []);

  // Socket connection and event handling
  useEffect(() => {
    if (!eventId || !token) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { eventId },
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
      // Join the event room for agenda updates
      newSocket.emit(
        "event.join",
        { eventId },
        (response: { success: boolean; error?: { message: string } }) => {
          if (response?.success) {
            setState((prev) => ({ ...prev, isJoined: true }));
            console.log("[Agenda] Joined event room for agenda updates");
          } else {
            setState((prev) => ({
              ...prev,
              error: response?.error?.message || "Failed to join event room",
            }));
          }
        }
      );
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    // Agenda update received
    newSocket.on(
      "agenda.update",
      (payload: {
        eventId: string;
        updateType: AgendaUpdateType;
        session: AgendaSession;
        previousValue?: Partial<AgendaSession>;
      }) => {
        if (payload.eventId !== eventId) return;

        const update: AgendaUpdate = {
          id: generateUpdateId(),
          eventId: payload.eventId,
          updateType: payload.updateType,
          session: payload.session,
          timestamp: new Date().toISOString(),
          previousValue: payload.previousValue,
        };

        setState((prev) => {
          // Update sessions based on update type
          let newSessions = [...prev.sessions];

          switch (payload.updateType) {
            case "CREATED":
              // Add new session if not exists
              if (!newSessions.find((s) => s.id === payload.session.id)) {
                newSessions.push(payload.session);
                // Sort by start time
                newSessions.sort(
                  (a, b) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime()
                );
              }
              break;

            case "UPDATED":
              // Update existing session
              newSessions = newSessions.map((s) =>
                s.id === payload.session.id ? { ...s, ...payload.session } : s
              );
              // Re-sort if time changed
              newSessions.sort(
                (a, b) =>
                  new Date(a.startTime).getTime() -
                  new Date(b.startTime).getTime()
              );
              break;

            case "DELETED":
              // Remove session
              newSessions = newSessions.filter(
                (s) => s.id !== payload.session.id
              );
              break;
          }

          // Add to recent updates (keep last N)
          const newRecentUpdates = [update, ...prev.recentUpdates].slice(
            0,
            MAX_RECENT_UPDATES
          );

          return {
            ...prev,
            sessions: newSessions,
            recentUpdates: newRecentUpdates,
          };
        });
      }
    );

    // Error handling
    newSocket.on("systemError", (error: { message: string }) => {
      console.error("[Agenda] System error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Agenda] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Cleanup
    return () => {
      newSocket.emit("event.leave", { eventId });
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("disconnect");
      newSocket.off("agenda.update");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, token, generateUpdateId]);

  // Restore sessions from cache on mount (before socket connects)
  useEffect(() => {
    if (
      cacheLoaded &&
      cachedSessions &&
      cachedSessions.length > 0 &&
      state.sessions.length === 0 &&
      !state.isJoined
    ) {
      setState((prev) => ({
        ...prev,
        sessions: [...cachedSessions].sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ),
      }));
    }
  }, [cacheLoaded, cachedSessions, state.sessions.length, state.isJoined]);

  // Persist sessions to cache when they change (debounced)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.sessions.length === 0) return;

    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      persistToCache(state.sessions);
    }, 2000);

    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [state.sessions, persistToCache]);

  // Track if data is from cache (not yet connected to live socket)
  const isFromCache = cacheLoaded && !state.isJoined && state.sessions.length > 0;

  // Set initial sessions (from REST API)
  const setInitialSessions = useCallback((sessions: AgendaSession[]) => {
    setState((prev) => ({
      ...prev,
      sessions: [...sessions].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    }));
  }, []);

  // Get session by ID
  const getSessionById = useCallback(
    (sessionId: string): AgendaSession | undefined => {
      return state.sessions.find((s) => s.id === sessionId);
    },
    [state.sessions]
  );

  // Get sessions by track
  const getSessionsByTrack = useCallback(
    (track: string): AgendaSession[] => {
      return state.sessions.filter((s) => s.track === track);
    },
    [state.sessions]
  );

  // Get sessions by status
  const getSessionsByStatus = useCallback(
    (status: AgendaSession["status"]): AgendaSession[] => {
      return state.sessions.filter((s) => s.status === status);
    },
    [state.sessions]
  );

  // Get live sessions
  const getLiveSessions = useCallback((): AgendaSession[] => {
    const now = new Date();
    return state.sessions.filter((s) => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      return now >= start && now <= end;
    });
  }, [state.sessions]);

  // Get upcoming sessions
  const getUpcomingSessions = useCallback(
    (limit?: number): AgendaSession[] => {
      const now = new Date();
      const upcoming = state.sessions.filter(
        (s) => new Date(s.startTime) > now && s.status !== "cancelled"
      );
      return limit ? upcoming.slice(0, limit) : upcoming;
    },
    [state.sessions]
  );

  // Clear recent updates
  const clearRecentUpdates = useCallback(() => {
    setState((prev) => ({ ...prev, recentUpdates: [] }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Check if session was recently updated
  const wasRecentlyUpdated = useCallback(
    (sessionId: string, withinMs: number = 5000): boolean => {
      const now = Date.now();
      return state.recentUpdates.some(
        (u) =>
          u.session.id === sessionId &&
          now - new Date(u.timestamp).getTime() < withinMs
      );
    },
    [state.recentUpdates]
  );

  return {
    // State
    isConnected: state.isConnected,
    isJoined: state.isJoined,
    sessions: state.sessions,
    recentUpdates: state.recentUpdates,
    error: state.error,
    isOnline,

    // Cache state (P1.2)
    cachedAt,
    isStale,
    isFromCache,

    // Actions
    setInitialSessions,
    clearRecentUpdates,
    clearError,

    // Utilities
    getSessionById,
    getSessionsByTrack,
    getSessionsByStatus,
    getLiveSessions,
    getUpcomingSessions,
    wasRecentlyUpdated,
  };
};
