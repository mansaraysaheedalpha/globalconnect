// src/hooks/use-linkedin.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

const getRealtimeBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";
  return url.replace(/\/events$/, "");
};

export interface LinkedInSuggestion {
  userId: string;
  linkedInId: string;
  linkedInUrl: string;
  name: string;
  headline?: string;
  suggestedMessage: string;
}

interface UseLinkedInState {
  isConnected: boolean;
  isLoading: boolean;
  suggestions: LinkedInSuggestion[];
  error: string | null;
}

export const useLinkedIn = () => {
  const [state, setState] = useState<UseLinkedInState>({
    isConnected: false,
    isLoading: false,
    suggestions: [],
    error: null,
  });

  const { token, user } = useAuthStore();

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) throw new Error("Not authenticated");

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

  /**
   * Check if user has LinkedIn connected.
   */
  const checkStatus = useCallback(async () => {
    if (!token) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const baseUrl = getRealtimeBaseUrl();
      const data = await fetchWithAuth(`${baseUrl}/linkedin/status`);
      setState((prev) => ({
        ...prev,
        isConnected: data.isConnected,
        isLoading: false,
      }));
      return data.isConnected;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to check LinkedIn status";
      console.error("[LinkedIn] Status check error:", message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return false;
    }
  }, [token, fetchWithAuth]);

  /**
   * Initiate LinkedIn OAuth flow.
   */
  const connectLinkedIn = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const baseUrl = getRealtimeBaseUrl();
      const data = await fetchWithAuth(`${baseUrl}/linkedin/auth/init`);

      // Redirect to LinkedIn authorization page
      window.location.href = data.authUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to initiate LinkedIn connection";
      console.error("[LinkedIn] Connect error:", message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, [fetchWithAuth]);

  /**
   * Disconnect LinkedIn from account.
   */
  const disconnectLinkedIn = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const baseUrl = getRealtimeBaseUrl();
      await fetchWithAuth(`${baseUrl}/linkedin/disconnect`, { method: "DELETE" });
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to disconnect LinkedIn";
      console.error("[LinkedIn] Disconnect error:", message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return false;
    }
  }, [fetchWithAuth]);

  /**
   * Get LinkedIn connection suggestions for an event.
   */
  const getSuggestions = useCallback(
    async (eventId: string) => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        const data = await fetchWithAuth(`${baseUrl}/linkedin/suggestions/${eventId}`);
        setState((prev) => ({ ...prev, suggestions: data }));
        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get LinkedIn suggestions";
        console.error("[LinkedIn] Suggestions error:", message);
        return [];
      }
    },
    [fetchWithAuth]
  );

  /**
   * Get LinkedIn profile URL for a user.
   */
  const getProfileUrl = useCallback(
    async (userId: string): Promise<string | null> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        const data = await fetchWithAuth(`${baseUrl}/linkedin/profile/${userId}`);
        return data.linkedInUrl;
      } catch (error) {
        console.error("[LinkedIn] Profile URL error:", error);
        return null;
      }
    },
    [fetchWithAuth]
  );

  /**
   * Get suggested message for LinkedIn connection.
   */
  const getSuggestedMessage = useCallback(
    async (userName: string, eventName: string, context?: string): Promise<string> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        const params = new URLSearchParams({ userName, eventName });
        if (context) params.set("context", context);
        const data = await fetchWithAuth(`${baseUrl}/linkedin/message/suggest?${params}`);
        return data.message;
      } catch (error) {
        // Fallback message if API fails
        return `Hi ${userName}! It was great meeting you at ${eventName}. Would love to connect here on LinkedIn!`;
      }
    },
    [fetchWithAuth]
  );

  /**
   * Open LinkedIn profile in new tab.
   */
  const openLinkedInProfile = useCallback((linkedInUrl: string) => {
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  }, []);

  /**
   * Open LinkedIn connection page with pre-filled message.
   */
  const openLinkedInConnect = useCallback((linkedInUrl: string, message?: string) => {
    // LinkedIn doesn't allow pre-filled messages in connection requests via URL
    // So we just open the profile page
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  }, []);

  // Check status on mount
  useEffect(() => {
    if (token && user?.id) {
      checkStatus();
    }
  }, [token, user?.id, checkStatus]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    suggestions: state.suggestions,
    error: state.error,

    // Actions
    checkStatus,
    connectLinkedIn,
    disconnectLinkedIn,
    getSuggestions,
    getProfileUrl,
    getSuggestedMessage,
    openLinkedInProfile,
    openLinkedInConnect,
    clearError,
  };
};
