// src/hooks/use-leads.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import {
  Lead,
  LeadStats,
  LeadUpdate,
  UseLeadsOptions,
  UseLeadsReturn,
  LeadCapturedEvent,
  LeadIntentUpdatedEvent,
} from "@/types/leads";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";
const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_SERVICE_URL || "http://localhost:3002";

// Play notification sound for new leads
const playLeadNotification = () => {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Two-tone notification for leads (different from video call)
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch {
    // Audio not supported
  }
};

export const useLeads = ({
  sponsorId,
  enabled = true,
  limit = 50,
  intentLevel,
  autoRefreshInterval = 30000,
}: UseLeadsOptions): UseLeadsReturn => {
  const { token } = useAuthStore();

  // Data state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  // Error states
  const [error, setError] = useState<Error | null>(null);
  const [statsError, setStatsError] = useState<Error | null>(null);

  // Real-time state
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const isMountedRef = useRef(true);

  // Build query params
  const buildQueryParams = useCallback(
    (customOffset?: number) => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("skip", String(customOffset ?? 0));
      if (intentLevel) params.set("intent_level", intentLevel);
      return params.toString();
    },
    [limit, intentLevel]
  );

  // Fetch leads from PostgreSQL (single source of truth)
  const fetchLeads = useCallback(
    async (isNextPage = false) => {
      if (!token || !sponsorId || !enabled) return;

      // Abort any pending request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      if (isNextPage) {
        setIsFetchingNextPage(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const queryOffset = isNextPage ? offset : 0;
        const response = await fetch(
          `${API_BASE_URL}/sponsors/sponsors/${sponsorId}/leads?${buildQueryParams(queryOffset)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch leads: ${response.status}`);
        }

        const data: Lead[] = await response.json();

        if (!isMountedRef.current) return;

        setLeads((prev) => (isNextPage ? [...prev, ...data] : data));
        setHasNextPage(data.length === limit);
        setOffset(isNextPage ? offset + data.length : data.length);
        setLastUpdated(new Date());
        retryCountRef.current = 0; // Reset retry count on success
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // Ignore aborted requests

        console.error("[useLeads] Fetch error:", err);
        if (!isMountedRef.current) return;
        setError(err as Error);

        // Implement exponential backoff retry
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const delay = Math.pow(2, retryCountRef.current) * 1000; // 2s, 4s, 8s
          setTimeout(() => {
            if (isMountedRef.current) {
              fetchLeads(isNextPage);
            }
          }, delay);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsFetchingNextPage(false);
        }
      }
    },
    [token, sponsorId, enabled, buildQueryParams, limit, offset]
  );

  // Fetch stats from PostgreSQL (single source of truth)
  const fetchStats = useCallback(async () => {
    if (!token || !sponsorId || !enabled) return;

    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${sponsorId}/leads/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data: LeadStats = await response.json();
      if (isMountedRef.current) {
        setStats(data);
      }
    } catch (err) {
      console.error("[useLeads] Stats fetch error:", err);
      if (isMountedRef.current) {
        setStatsError(err as Error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingStats(false);
      }
    }
  }, [token, sponsorId, enabled]);

  // Combined refetch - resets pagination and fetches fresh data
  const refetch = useCallback(() => {
    setOffset(0);
    fetchLeads(false);
    fetchStats();
  }, [fetchLeads, fetchStats]);

  // Fetch next page
  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchLeads(true);
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchLeads]);

  // Update lead
  const updateLead = useCallback(
    async (leadId: string, update: LeadUpdate): Promise<Lead> => {
      if (!token || !sponsorId) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${sponsorId}/leads/${leadId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(update),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update lead: ${response.status}`);
      }

      const updatedLead: Lead = await response.json();

      // Update local state immediately
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updatedLead : lead))
      );

      // Refetch stats as they may have changed
      fetchStats();

      return updatedLead;
    },
    [token, sponsorId, fetchStats]
  );

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled && sponsorId && token) {
      // Reset state for new sponsor
      setLeads([]);
      setStats(null);
      setOffset(0);
      setHasNextPage(true);
      setError(null);
      setStatsError(null);

      // Fetch fresh data
      fetchLeads(false);
      fetchStats();
    }

    return () => {
      isMountedRef.current = false;
    };
    // Intentionally excluding fetchLeads and fetchStats to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sponsorId, token, intentLevel]);

  // Setup polling interval as fallback
  useEffect(() => {
    if (!enabled || !sponsorId || autoRefreshInterval <= 0) return;

    refreshIntervalRef.current = setInterval(() => {
      // Only refetch if no pending fetch and component is mounted
      if (!isLoading && !isFetchingNextPage && isMountedRef.current) {
        console.log("[useLeads] Polling refresh");
        refetch();
      }
    }, autoRefreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [enabled, sponsorId, autoRefreshInterval, refetch, isLoading, isFetchingNextPage]);

  // Setup WebSocket connection for real-time notifications
  useEffect(() => {
    if (!token || !sponsorId || !enabled) return;

    console.log("[useLeads] Setting up WebSocket connection for sponsor:", sponsorId);

    const socket = io(`${REALTIME_URL}/events`, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[useLeads] WebSocket connected");
      if (isMountedRef.current) {
        setIsRealTimeConnected(true);
      }

      // Join sponsor leads room
      socket.emit(
        "sponsor.leads.join",
        {},
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            console.log("[useLeads] Joined sponsor leads room");
          } else {
            console.warn("[useLeads] Failed to join leads room:", response.error);
          }
        }
      );
    });

    socket.on("disconnect", (reason) => {
      console.log("[useLeads] WebSocket disconnected:", reason);
      if (isMountedRef.current) {
        setIsRealTimeConnected(false);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("[useLeads] WebSocket connection error:", error.message);
    });

    // Listen for new leads - triggers refetch from PostgreSQL
    socket.on("lead.captured.new", (data: LeadCapturedEvent) => {
      console.log("[useLeads] New lead captured event:", data.id);
      playLeadNotification();

      // Refetch from PostgreSQL to get the complete lead data
      // This ensures data consistency - PostgreSQL is the single source of truth
      if (isMountedRef.current) {
        refetch();
      }
    });

    // Listen for lead intent updates - triggers refetch
    socket.on("lead.intent.updated", (data: LeadIntentUpdatedEvent) => {
      console.log("[useLeads] Lead intent updated event:", data.lead_id);

      // Refetch to get the updated data from PostgreSQL
      if (isMountedRef.current) {
        refetch();
      }
    });

    return () => {
      console.log("[useLeads] Cleaning up WebSocket connection");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("lead.captured.new");
      socket.off("lead.intent.updated");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, sponsorId, enabled, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    leads,
    stats,
    isLoading,
    isLoadingStats,
    isFetchingNextPage,
    error,
    statsError,
    hasNextPage,
    fetchNextPage,
    refetch,
    updateLead,
    isRealTimeConnected,
    lastUpdated,
  };
};
