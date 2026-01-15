// src/hooks/use-follow-up.ts
"use client";

import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { Connection } from "@/types/connection";

// Get the base URL for the real-time service (without /events namespace)
const getRealtimeBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";
  // Remove /events suffix if present to get base URL
  return url.replace(/\/events$/, "");
};

export interface FollowUpEmailContent {
  subject: string;
  recipientEmail: string;
  recipientName: string;
  eventName: string;
  connections: Array<{
    connectionId: string;
    name: string;
    company?: string;
    initialContext?: string;
    suggestedMessage: string;
    profileUrl: string;
  }>;
  oneClickActions: {
    sendAllFollowUps: boolean;
    exportToLinkedIn: boolean;
  };
}

export interface FollowUpStats {
  totalScheduled: number;
  totalSent: number;
  totalOpened: number;
  totalReplied: number;
  openRate: number;
  replyRate: number;
}

interface ScheduleResult {
  scheduledCount: number;
  userCount: number;
}

interface UseFollowUpState {
  pendingFollowUps: Connection[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

export const useFollowUp = () => {
  const [state, setState] = useState<UseFollowUpState>({
    pendingFollowUps: [],
    isLoading: false,
    isSending: false,
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

  /**
   * Schedule follow-up emails for all connections at an event.
   */
  const scheduleEventFollowUps = useCallback(
    async (eventId: string, scheduledFor?: string): Promise<ScheduleResult | null> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const baseUrl = getRealtimeBaseUrl();
        const result = await fetchWithAuth(`${baseUrl}/follow-up/schedule`, {
          method: "POST",
          body: JSON.stringify({ eventId, scheduledFor }),
        });
        setState((prev) => ({ ...prev, isLoading: false }));
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to schedule follow-ups";
        console.error("[FollowUp] Schedule error:", message);
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        return null;
      }
    },
    [fetchWithAuth]
  );

  /**
   * Get follow-up email preview for a specific event.
   */
  const getFollowUpPreview = useCallback(
    async (eventId: string): Promise<FollowUpEmailContent | null> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        return await fetchWithAuth(`${baseUrl}/follow-up/preview/${eventId}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to get follow-up preview";
        console.error("[FollowUp] Preview error:", message);
        return null;
      }
    },
    [fetchWithAuth]
  );

  /**
   * Fetch pending follow-ups for the current user.
   */
  const fetchPendingFollowUps = useCallback(async () => {
    if (!user?.id) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const baseUrl = getRealtimeBaseUrl();
      const data = await fetchWithAuth(`${baseUrl}/follow-up/pending`);
      setState({ pendingFollowUps: data, isLoading: false, isSending: false, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch pending follow-ups";
      console.error("[FollowUp] Fetch pending error:", message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, [user?.id, fetchWithAuth]);

  /**
   * Send a follow-up message for a specific connection.
   */
  const sendFollowUp = useCallback(
    async (connectionId: string, message: string, subject?: string): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, isSending: true, error: null }));
        const baseUrl = getRealtimeBaseUrl();
        await fetchWithAuth(`${baseUrl}/follow-up/${connectionId}/send`, {
          method: "POST",
          body: JSON.stringify({ message, subject }),
        });
        setState((prev) => ({ ...prev, isSending: false }));
        // Remove from pending list
        setState((prev) => ({
          ...prev,
          pendingFollowUps: prev.pendingFollowUps.filter((c) => c.id !== connectionId),
        }));
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to send follow-up";
        console.error("[FollowUp] Send error:", message);
        setState((prev) => ({ ...prev, isSending: false, error: message }));
        return false;
      }
    },
    [fetchWithAuth]
  );

  /**
   * Mark a follow-up as replied (manual trigger).
   */
  const markReplied = useCallback(
    async (connectionId: string): Promise<boolean> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        await fetchWithAuth(`${baseUrl}/follow-up/${connectionId}/replied`, {
          method: "POST",
        });
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to mark as replied";
        console.error("[FollowUp] Mark replied error:", message);
        return false;
      }
    },
    [fetchWithAuth]
  );

  /**
   * Get follow-up statistics for an event.
   */
  const getFollowUpStats = useCallback(
    async (eventId: string): Promise<FollowUpStats | null> => {
      try {
        const baseUrl = getRealtimeBaseUrl();
        return await fetchWithAuth(`${baseUrl}/follow-up/stats/${eventId}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch follow-up stats";
        console.error("[FollowUp] Get stats error:", message);
        return null;
      }
    },
    [fetchWithAuth]
  );

  /**
   * Clear error state.
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    pendingFollowUps: state.pendingFollowUps,
    isLoading: state.isLoading,
    isSending: state.isSending,
    error: state.error,

    // Actions
    scheduleEventFollowUps,
    getFollowUpPreview,
    fetchPendingFollowUps,
    sendFollowUp,
    markReplied,
    getFollowUpStats,
    clearError,
  };
};
