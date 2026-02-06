// src/hooks/use-event-connections.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";

/**
 * User info for a connection made via AI recommendations
 * NOTE: Excludes sensitive fields like email/phone for security
 */
export interface EventConnectedUser {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  linkedInUrl?: string;
  githubUsername?: string;
  twitterHandle?: string;
}

/**
 * Single connection from recommendations - represents a user you've connected with at an event
 */
export interface EventConnection {
  id: string;
  connectedUserId: string;
  connectedAt: string;
  matchScore: number;
  reasons: string[];
  user: EventConnectedUser;
}

/**
 * Response from recommendations connections API
 */
interface EventConnectionsResponse {
  connections: EventConnection[];
  total: number;
}

/**
 * State for the event connections hook
 */
interface UseEventConnectionsState {
  connections: EventConnection[];
  isLoading: boolean;
  error: string | null;
  total: number;
}

interface UseEventConnectionsOptions {
  eventId: string;
  autoFetch?: boolean;
  limit?: number;
}

// Cache time before auto-refetch (2 minutes)
const STALE_TIME_MS = 2 * 60 * 1000;

/**
 * Hook for fetching user's connections at an event (via AI recommendations).
 *
 * This hook fetches connections that were made through the AI recommendation
 * system - when a user clicks "Chat" on a recommendation card, the connection
 * is tracked and shows up here.
 *
 * Features:
 * - Automatic fetching on mount
 * - Refresh capability
 * - Error handling with user-friendly messages
 *
 * Security:
 * - All API calls require authentication
 * - Sensitive user data is excluded from responses
 *
 * @param options - Hook configuration
 * @returns Connections state and actions
 */
export const useEventConnections = ({
  eventId,
  autoFetch = true,
  limit = 50,
}: UseEventConnectionsOptions) => {
  const [state, setState] = useState<UseEventConnectionsState>({
    connections: [],
    isLoading: false,
    error: null,
    total: 0,
  });

  const { token, user } = useAuthStore();
  const fetchedRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);

  // Get the API base URL
  const getApiUrl = useCallback(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002";
    // Ensure we have the /events path
    return baseUrl.endsWith("/events") ? baseUrl : `${baseUrl}/events`;
  }, []);

  // Fetch with authentication
  const fetchWithAuth = useCallback(
    async <T>(url: string, options: RequestInit = {}): Promise<T> => {
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
        throw new Error(
          errorData.message || `Request failed: ${response.status}`
        );
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    },
    [token]
  );

  // Fetch connections from API
  const fetchConnections = useCallback(async () => {
    if (!eventId || !user?.id) {
      return;
    }

    // Check if data is still fresh
    const now = Date.now();
    if (now - lastFetchTimeRef.current < STALE_TIME_MS && fetchedRef.current) {
      return; // Data is still fresh
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const baseUrl = getApiUrl();
      const url = `${baseUrl}/${eventId}/recommendations/connections?limit=${limit}`;

      const data = await fetchWithAuth<EventConnectionsResponse>(url);

      setState({
        connections: data.connections || [],
        isLoading: false,
        error: null,
        total: data.total || 0,
      });

      fetchedRef.current = true;
      lastFetchTimeRef.current = now;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch connections";
      console.error("[EventConnections] Fetch error:", message);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [eventId, user?.id, getApiUrl, fetchWithAuth, limit]);

  // Refresh connections (force refetch)
  const refresh = useCallback(async () => {
    fetchedRef.current = false;
    lastFetchTimeRef.current = 0;
    await fetchConnections();
  }, [fetchConnections]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && eventId && user?.id && token) {
      fetchConnections();
    }
  }, [autoFetch, eventId, user?.id, token, fetchConnections]);

  // Refetch when token changes (re-authentication)
  useEffect(() => {
    if (fetchedRef.current && token) {
      fetchedRef.current = false;
      fetchConnections();
    }
  }, [token, fetchConnections]);

  return {
    // State
    connections: state.connections,
    isLoading: state.isLoading,
    error: state.error,
    total: state.total,

    // Actions
    refresh,
    clearError,

    // Helpers
    isEmpty: state.connections.length === 0 && !state.isLoading,
    hasConnections: state.connections.length > 0,
  };
};
