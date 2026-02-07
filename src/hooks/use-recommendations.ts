// src/hooks/use-recommendations.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";

/**
 * User display info for recommendation cards
 * NOTE: Excludes sensitive fields like email/phone for security
 */
export interface RecommendedUser {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  linkedInUrl?: string;
  githubUsername?: string;
  twitterHandle?: string;
  industry?: string;
  goals?: string[];
}

/**
 * Single recommendation from the AI matchmaking system
 */
export interface Recommendation {
  id: string;
  userId: string;
  recommendedUserId: string;
  matchScore: number;
  reasons: string[];
  conversationStarters: string[];
  potentialValue?: string;
  generatedAt: string;
  expiresAt: string;
  viewed: boolean;
  pinged: boolean;
  connected: boolean;
  user: RecommendedUser;
}

/**
 * Recommendations response from the API
 */
interface RecommendationsResponse {
  recommendations: Recommendation[];
  total: number;
  hasMore: boolean;
  generatedAt?: string;
  expiresAt?: string;
}

/**
 * State for the recommendations hook
 */
interface UseRecommendationsState {
  recommendations: Recommendation[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  generatedAt?: Date;
  expiresAt?: Date;
}

interface UseRecommendationsOptions {
  eventId: string;
  autoFetch?: boolean;
}

// Debounce time for refresh requests (2 seconds per security requirements)
const REFRESH_DEBOUNCE_MS = 2000;

// Cache time before auto-refetch (5 minutes)
const STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Hook for fetching AI-powered networking recommendations.
 *
 * Features:
 * - Automatic fetching on mount
 * - Debounced refresh to prevent spam
 * - Optimistic UI updates for tracking actions
 * - Error handling with user-friendly messages
 *
 * Security:
 * - All API calls require authentication
 * - LLM-generated content is NOT rendered with dangerouslySetInnerHTML
 * - Sensitive user data is excluded from responses
 *
 * @param options - Hook configuration
 * @returns Recommendations state and actions
 */
export const useRecommendations = ({
  eventId,
  autoFetch = true,
}: UseRecommendationsOptions) => {
  const [state, setState] = useState<UseRecommendationsState>({
    recommendations: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    total: 0,
    hasMore: false,
  });

  const { token, user } = useAuthStore();
  const lastRefreshRef = useRef<number>(0);
  const fetchedRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);

  // Get the API base URL
  const getApiUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002";
    // Ensure we have the /events path
    return baseUrl.endsWith('/events') ? baseUrl : `${baseUrl}/events`;
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

  // Fetch recommendations from API
  const fetchRecommendations = useCallback(
    async (options: { refresh?: boolean } = {}) => {
      const { refresh = false } = options;

      if (!eventId || !user?.id) {
        return;
      }

      // Check if data is stale (for auto-refetch)
      const now = Date.now();
      if (!refresh && now - lastFetchTimeRef.current < STALE_TIME_MS && fetchedRef.current) {
        return; // Data is still fresh
      }

      // Set loading state
      if (refresh) {
        setState((prev) => ({ ...prev, isRefreshing: true, error: null }));
      } else {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
      }

      try {
        const baseUrl = getApiUrl();
        const url = refresh
          ? `${baseUrl}/${eventId}/recommendations?refresh=true`
          : `${baseUrl}/${eventId}/recommendations`;

        const data = await fetchWithAuth<RecommendationsResponse>(url);

        setState({
          recommendations: data.recommendations || [],
          isLoading: false,
          isRefreshing: false,
          error: null,
          total: data.total || 0,
          hasMore: data.hasMore || false,
          generatedAt: data.generatedAt ? new Date(data.generatedAt) : undefined,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        });

        fetchedRef.current = true;
        lastFetchTimeRef.current = now;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch recommendations";
        console.error("[Recommendations] Fetch error:", message);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: message,
        }));
      }
    },
    [eventId, user?.id, getApiUrl, fetchWithAuth]
  );

  // Refresh recommendations with debounce
  const refresh = useCallback(async () => {
    const now = Date.now();

    // Debounce: prevent refresh spam
    if (now - lastRefreshRef.current < REFRESH_DEBOUNCE_MS) {
      console.warn("[Recommendations] Refresh debounced");
      return;
    }

    lastRefreshRef.current = now;
    await fetchRecommendations({ refresh: true });
  }, [fetchRecommendations]);

  // Mark a recommendation as viewed
  const markViewed = useCallback(
    async (recommendationId: string): Promise<boolean> => {
      if (!eventId) return false;

      try {
        const baseUrl = getApiUrl();
        await fetchWithAuth(
          `${baseUrl}/${eventId}/recommendations/${recommendationId}/viewed`,
          { method: "POST" }
        );

        // Optimistic UI update
        setState((prev) => ({
          ...prev,
          recommendations: prev.recommendations.map((rec) =>
            rec.id === recommendationId ? { ...rec, viewed: true } : rec
          ),
        }));

        return true;
      } catch (error) {
        console.error("[Recommendations] Failed to mark viewed:", error);
        return false;
      }
    },
    [eventId, getApiUrl, fetchWithAuth]
  );

  // Mark a recommendation as pinged
  const markPinged = useCallback(
    async (recommendationId: string): Promise<boolean> => {
      if (!eventId) return false;

      try {
        const baseUrl = getApiUrl();
        await fetchWithAuth(
          `${baseUrl}/${eventId}/recommendations/${recommendationId}/pinged`,
          { method: "POST" }
        );

        // Optimistic UI update
        setState((prev) => ({
          ...prev,
          recommendations: prev.recommendations.map((rec) =>
            rec.id === recommendationId ? { ...rec, pinged: true } : rec
          ),
        }));

        return true;
      } catch (error) {
        console.error("[Recommendations] Failed to mark pinged:", error);
        return false;
      }
    },
    [eventId, getApiUrl, fetchWithAuth]
  );

  // Mark a recommendation as connected
  const markConnected = useCallback(
    async (recommendationId: string): Promise<boolean> => {
      if (!eventId) return false;

      try {
        const baseUrl = getApiUrl();
        await fetchWithAuth(
          `${baseUrl}/${eventId}/recommendations/${recommendationId}/connected`,
          { method: "POST" }
        );

        // Optimistic UI update
        setState((prev) => ({
          ...prev,
          recommendations: prev.recommendations.map((rec) =>
            rec.id === recommendationId ? { ...rec, connected: true } : rec
          ),
        }));

        return true;
      } catch (error) {
        console.error("[Recommendations] Failed to mark connected:", error);
        return false;
      }
    },
    [eventId, getApiUrl, fetchWithAuth]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && eventId && user?.id && token) {
      fetchRecommendations();
    }
  }, [autoFetch, eventId, user?.id, token, fetchRecommendations]);

  // Refetch when token changes (re-authentication)
  useEffect(() => {
    if (fetchedRef.current && token) {
      fetchedRef.current = false;
      fetchRecommendations();
    }
  }, [token, fetchRecommendations]);

  return {
    // State
    recommendations: state.recommendations,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    total: state.total,
    hasMore: state.hasMore,
    generatedAt: state.generatedAt,
    expiresAt: state.expiresAt,

    // Actions
    refresh,
    markViewed,
    markPinged,
    markConnected,
    clearError,

    // Helpers
    isEmpty: state.recommendations.length === 0 && !state.isLoading,
    isStale: state.expiresAt ? state.expiresAt < new Date() : false,
  };
};
