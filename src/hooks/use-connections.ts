// src/hooks/use-connections.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  Connection,
  ConnectionStrength,
  FollowUpSuggestion,
  FollowUpTone,
  ReportOutcomeDto,
  EventNetworkingStats,
  UserNetworkingStats,
  StrengthDistribution,
} from "@/types/connection";

// Get the base URL for the real-time service (without /events namespace)
const getRealtimeBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";
  // Remove /events suffix if present to get base URL
  return url.replace(/\/events$/, "");
};

interface UseConnectionsOptions {
  eventId?: string;
  autoFetch?: boolean;
}

interface UseConnectionsState {
  connections: Connection[];
  isLoading: boolean;
  error: string | null;
}

export const useConnections = ({
  eventId,
  autoFetch = true,
}: UseConnectionsOptions = {}) => {
  const [state, setState] = useState<UseConnectionsState>({
    connections: [],
    isLoading: false,
    error: null,
  });

  const { token, user } = useAuthStore();

  // Helper to make authenticated requests
  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }

      return response.json();
    },
    [token]
  );

  // Fetch connections for the current user
  const fetchConnections = useCallback(async () => {
    if (!user?.id) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const baseUrl = getRealtimeBaseUrl();
      const url = eventId
        ? `${baseUrl}/connections/user/${user.id}/event/${eventId}`
        : `${baseUrl}/connections/user/${user.id}`;

      const data = await fetchWithAuth(url);
      setState({ connections: data, isLoading: false, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch connections";
      console.error("[Connections] Fetch error:", message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, [user?.id, eventId, fetchWithAuth]);

  // Fetch a single connection by ID
  const fetchConnection = useCallback(
    async (connectionId: string): Promise<Connection | null> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        return await fetchWithAuth(`${baseUrl}/connections/${connectionId}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch connection";
        console.error("[Connections] Fetch connection error:", message);
        return null;
      }
    },
    [fetchWithAuth]
  );

  // Mark follow-up as sent
  const markFollowUpSent = useCallback(
    async (connectionId: string): Promise<boolean> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        await fetchWithAuth(`${baseUrl}/connections/${connectionId}/follow-up/sent`, {
          method: "PATCH",
        });
        // Refresh the connections list
        await fetchConnections();
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to mark follow-up sent";
        console.error("[Connections] Mark follow-up sent error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [fetchWithAuth, fetchConnections]
  );

  // Report an outcome for a connection
  const reportOutcome = useCallback(
    async (connectionId: string, outcome: ReportOutcomeDto): Promise<boolean> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        await fetchWithAuth(`${baseUrl}/connections/${connectionId}/outcome`, {
          method: "PATCH",
          body: JSON.stringify(outcome),
        });
        // Refresh the connections list
        await fetchConnections();
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to report outcome";
        console.error("[Connections] Report outcome error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [fetchWithAuth, fetchConnections]
  );

  // Get event networking stats
  const getEventStats = useCallback(
    async (statsEventId: string): Promise<EventNetworkingStats | null> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        return await fetchWithAuth(`${baseUrl}/connections/stats/event/${statsEventId}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch event stats";
        console.error("[Connections] Get event stats error:", message);
        return null;
      }
    },
    [fetchWithAuth]
  );

  // Get user networking stats
  const getUserStats = useCallback(
    async (statsUserId?: string): Promise<UserNetworkingStats | null> => {
      const userId = statsUserId || user?.id;
      if (!userId) return null;

      try {
        const baseUrl = getRealtimeBaseUrl();
        return await fetchWithAuth(`${baseUrl}/connections/stats/user/${userId}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch user stats";
        console.error("[Connections] Get user stats error:", message);
        return null;
      }
    },
    [fetchWithAuth, user?.id]
  );

  // Check if connection exists
  const connectionExists = useCallback(
    async (
      userAId: string,
      userBId: string,
      checkEventId: string
    ): Promise<boolean> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        const result = await fetchWithAuth(
          `${baseUrl}/connections/check/${userAId}/${userBId}/${checkEventId}`
        );
        return result.exists;
      } catch {
        return false;
      }
    },
    [fetchWithAuth]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // ============================================
  // Sprint 7: Strength & Follow-up Features
  // ============================================

  /**
   * Compute strength distribution from current connections.
   */
  const strengthDistribution = useMemo((): StrengthDistribution => {
    const distribution: StrengthDistribution = {
      WEAK: 0,
      MODERATE: 0,
      STRONG: 0,
    };
    state.connections.forEach((conn) => {
      if (conn.strength) {
        distribution[conn.strength]++;
      }
    });
    return distribution;
  }, [state.connections]);

  /**
   * Get connections filtered by strength level.
   */
  const fetchConnectionsByStrength = useCallback(
    async (strength?: ConnectionStrength): Promise<Connection[]> => {
      if (!user?.id) return [];

      try {
        const baseUrl = getRealtimeBaseUrl();
        const query = strength ? `?strength=${strength}` : "";
        return await fetchWithAuth(
          `${baseUrl}/connections/user/${user.id}/by-strength${query}`
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch connections";
        console.error("[Connections] Fetch by strength error:", message);
        return [];
      }
    },
    [user?.id, fetchWithAuth]
  );

  /**
   * Get connections pending follow-up.
   */
  const getPendingFollowUps = useCallback(async (): Promise<Connection[]> => {
    if (!user?.id) return [];

    try {
      const baseUrl = getRealtimeBaseUrl();
      const query = eventId ? `?eventId=${eventId}` : "";
      return await fetchWithAuth(
        `${baseUrl}/connections/user/${user.id}/pending-followup${query}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch pending follow-ups";
      console.error("[Connections] Get pending follow-ups error:", message);
      return [];
    }
  }, [user?.id, eventId, fetchWithAuth]);

  /**
   * Generate AI-powered follow-up suggestion.
   */
  const generateFollowUpSuggestion = useCallback(
    async (
      connectionId: string,
      tone: FollowUpTone = "professional",
      additionalContext?: string
    ): Promise<FollowUpSuggestion | null> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        return await fetchWithAuth(`${baseUrl}/follow-up/generate`, {
          method: "POST",
          body: JSON.stringify({
            connectionId,
            tone,
            additionalContext,
          }),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate suggestion";
        console.error("[Connections] Generate suggestion error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return null;
      }
    },
    [fetchWithAuth]
  );

  /**
   * Send a follow-up message.
   */
  const sendFollowUp = useCallback(
    async (connectionId: string, message: string): Promise<boolean> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        await fetchWithAuth(`${baseUrl}/follow-up/${connectionId}/send`, {
          method: "POST",
          body: JSON.stringify({ message }),
        });

        // Update local state optimistically
        setState((prev) => ({
          ...prev,
          connections: prev.connections.map((conn) =>
            conn.id === connectionId
              ? { ...conn, followUpSentAt: new Date().toISOString() }
              : conn
          ),
        }));

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to send follow-up";
        console.error("[Connections] Send follow-up error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [fetchWithAuth]
  );

  /**
   * Get stale connections that need nurturing.
   */
  const getStaleConnections = useCallback(
    async (staleDays = 30): Promise<Connection[]> => {
      if (!user?.id) return [];

      try {
        const baseUrl = getRealtimeBaseUrl();
        return await fetchWithAuth(
          `${baseUrl}/connections/user/${user.id}/stale?days=${staleDays}`
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch stale connections";
        console.error("[Connections] Get stale connections error:", message);
        return [];
      }
    },
    [user?.id, fetchWithAuth]
  );

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && token && user?.id) {
      fetchConnections();
    }
  }, [autoFetch, token, user?.id, fetchConnections]);

  return {
    // State
    connections: state.connections,
    isLoading: state.isLoading,
    error: state.error,
    currentUserId: user?.id,

    // Computed
    strengthDistribution,

    // Actions
    fetchConnections,
    fetchConnection,
    markFollowUpSent,
    reportOutcome,
    getEventStats,
    getUserStats,
    connectionExists,
    clearError,

    // Sprint 7: Strength & Follow-up
    fetchConnectionsByStrength,
    getPendingFollowUps,
    generateFollowUpSuggestion,
    sendFollowUp,
    getStaleConnections,
  };
};
