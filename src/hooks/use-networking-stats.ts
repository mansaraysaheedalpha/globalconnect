// src/hooks/use-networking-stats.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

const getRealtimeBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";
  return url.replace(/\/events$/, "");
};

export interface OutcomeBreakdown {
  type: string;
  count: number;
  percentage: number;
}

export interface ConnectionTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
}

export interface TopConnector {
  userId: string;
  name: string;
  email: string;
  connectionCount: number;
  followUpRate: number;
}

export interface NetworkNode {
  id: string;
  name: string;
  email: string;
  connectionCount: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  connectionId: string;
  hasOutcome: boolean;
}

export interface ConnectionNetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface TimeSeriesDataPoint {
  date: string;
  connections: number;
  followUps: number;
  outcomes: number;
}

export interface EventAnalytics {
  totalConnections: number;
  uniqueNetworkers: number;
  averageConnectionsPerAttendee: number;
  followUpsSent: number;
  followUpsOpened: number;
  followUpsReplied: number;
  followUpSentRate: number;
  followUpOpenRate: number;
  followUpReplyRate: number;
  meetingsScheduled: number;
  reportedOutcomes: number;
  outcomeRate: number;
  outcomeBreakdown: OutcomeBreakdown[];
  connectionsByType: ConnectionTypeBreakdown[];
  topConnectors: TopConnector[];
  dailyActivity: TimeSeriesDataPoint[];
  networkingScore: number;
}

export interface UserAnalytics {
  totalConnections: number;
  totalEvents: number;
  followUpsSent: number;
  followUpRate: number;
  outcomesReported: number;
  outcomeRate: number;
  outcomeBreakdown: OutcomeBreakdown[];
  connectionsByEvent: Array<{
    eventId: string;
    eventName: string;
    connectionCount: number;
    date: string;
  }>;
  recentConnections: Array<{
    id: string;
    otherUserName: string;
    otherUserEmail: string;
    eventName: string;
    connectedAt: string;
    hasFollowUp: boolean;
    hasOutcome: boolean;
  }>;
}

interface UseNetworkingStatsState {
  eventAnalytics: EventAnalytics | null;
  userAnalytics: UserAnalytics | null;
  connectionGraph: ConnectionNetworkGraph | null;
  isLoading: boolean;
  error: string | null;
}

export const useNetworkingStats = (eventId?: string) => {
  const [state, setState] = useState<UseNetworkingStatsState>({
    eventAnalytics: null,
    userAnalytics: null,
    connectionGraph: null,
    isLoading: false,
    error: null,
  });

  const { token } = useAuthStore();

  const fetchWithAuth = useCallback(
    async (url: string) => {
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  const fetchEventAnalytics = useCallback(
    async (eventIdParam: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const baseUrl = getRealtimeBaseUrl();
        const data = await fetchWithAuth(`${baseUrl}/analytics/event/${eventIdParam}`);
        setState((prev) => ({
          ...prev,
          eventAnalytics: data,
          isLoading: false,
        }));
        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch event analytics";
        console.error("[NetworkingStats] Event analytics error:", message);
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        return null;
      }
    },
    [fetchWithAuth]
  );

  const fetchConnectionGraph = useCallback(
    async (eventIdParam: string) => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        const data = await fetchWithAuth(`${baseUrl}/analytics/event/${eventIdParam}/graph`);
        setState((prev) => ({ ...prev, connectionGraph: data }));
        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch connection graph";
        console.error("[NetworkingStats] Connection graph error:", message);
        return null;
      }
    },
    [fetchWithAuth]
  );

  const fetchUserAnalytics = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const baseUrl = getRealtimeBaseUrl();
      const data = await fetchWithAuth(`${baseUrl}/analytics/user/me`);
      setState((prev) => ({
        ...prev,
        userAnalytics: data,
        isLoading: false,
      }));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch user analytics";
      console.error("[NetworkingStats] User analytics error:", message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, [fetchWithAuth]);

  const fetchOutcomeBreakdown = useCallback(
    async (eventIdParam: string): Promise<OutcomeBreakdown[] | null> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        return await fetchWithAuth(`${baseUrl}/analytics/event/${eventIdParam}/outcomes`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch outcome breakdown";
        console.error("[NetworkingStats] Outcome breakdown error:", message);
        return null;
      }
    },
    [fetchWithAuth]
  );

  // Auto-fetch event analytics if eventId is provided
  useEffect(() => {
    if (eventId && token) {
      fetchEventAnalytics(eventId);
      fetchConnectionGraph(eventId);
    }
  }, [eventId, token, fetchEventAnalytics, fetchConnectionGraph]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    eventAnalytics: state.eventAnalytics,
    userAnalytics: state.userAnalytics,
    connectionGraph: state.connectionGraph,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    fetchEventAnalytics,
    fetchConnectionGraph,
    fetchUserAnalytics,
    fetchOutcomeBreakdown,
    clearError,
  };
};
