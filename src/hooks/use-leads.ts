// src/hooks/use-leads.ts
/**
 * Real-time leads hook with optimistic updates and guaranteed delivery.
 *
 * Key features:
 * - Zustand store integration for centralized state management
 * - Direct WebSocket event handling (no refetch on events)
 * - Optimistic updates for instant UI feedback with rollback
 * - 5-minute polling fallback (vs 30-second before)
 * - Redis Streams ensures no missed events during disconnection
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useLeadsStore } from "@/store/leads.store";
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

// Default to 5 minutes - WebSocket handles real-time, this is fallback only
const DEFAULT_POLLING_INTERVAL = 300000;

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
  autoRefreshInterval = DEFAULT_POLLING_INTERVAL,
}: UseLeadsOptions): UseLeadsReturn => {
  const { token } = useAuthStore();

  // Zustand store for centralized state management
  const store = useLeadsStore();
  const {
    leads: storeLeads,
    stats: storeStats,
    isLoading: storeIsLoading,
    isLoadingStats: storeIsLoadingStats,
    setLeads,
    setStats,
    setSponsorId,
    setLoading,
    setLoadingStats,
    handleLeadCaptured,
    handleIntentUpdated,
    handleStatsUpdated,
    optimisticUpdateLead,
    commitUpdate,
    rollbackUpdate,
  } = store;

  // Filter leads by intent level if specified
  const leads = intentLevel
    ? storeLeads.filter((l) => l.intent_level === intentLevel)
    : storeLeads;
  const stats = storeStats;
  const isLoading = storeIsLoading;
  const isLoadingStats = storeIsLoadingStats;

  // Local state for pagination (not in store)
  const [offset, setOffset] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
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

  // Stable ref for refetch to avoid WebSocket effect re-running
  const refetchRef = useRef<() => void>(() => {});

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
        setLoading(true);
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

        if (isNextPage) {
          // For pagination, append to existing leads
          setLeads([...storeLeads, ...data]);
        } else {
          // Fresh fetch - replace all leads in store
          setLeads(data);
        }
        setHasNextPage(data.length === limit);
        setOffset(isNextPage ? offset + data.length : data.length);
        setLastUpdated(new Date());
        retryCountRef.current = 0; // Reset retry count on success
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // Ignore aborted requests

        console.error("[useLeads] Fetch error:", err);
        if (!isMountedRef.current) return;
        setError(err as Error);
        setLoading(false);

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
          setIsFetchingNextPage(false);
        }
      }
    },
    [token, sponsorId, enabled, buildQueryParams, limit, offset, setLeads, setLoading, storeLeads]
  );

  // Fetch stats from PostgreSQL (single source of truth)
  const fetchStats = useCallback(async () => {
    if (!token || !sponsorId || !enabled) return;

    setLoadingStats(true);
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
        setLoadingStats(false);
      }
    }
  }, [token, sponsorId, enabled, setStats, setLoadingStats]);

  // Combined refetch - resets pagination and fetches fresh data
  const refetch = useCallback(() => {
    setOffset(0);
    fetchLeads(false);
    fetchStats();
  }, [fetchLeads, fetchStats]);

  // Keep refetchRef in sync with refetch
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  // Fetch next page
  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchLeads(true);
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchLeads]);

  // Update lead with optimistic updates
  const updateLead = useCallback(
    async (leadId: string, update: LeadUpdate): Promise<Lead> => {
      if (!token || !sponsorId) {
        throw new Error("Not authenticated");
      }

      // Apply optimistic update immediately for instant UI feedback
      optimisticUpdateLead(leadId, update);

      try {
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
          // Rollback optimistic update on failure
          rollbackUpdate(leadId);
          throw new Error(`Failed to update lead: ${response.status}`);
        }

        const updatedLead: Lead = await response.json();

        // Commit the update (removes pending flag)
        commitUpdate(leadId);

        // Refetch stats when follow_up_status changes (affects contacted/converted counts)
        if (update.follow_up_status) {
          fetchStats();
        }

        return updatedLead;
      } catch (err) {
        // Rollback on any error
        rollbackUpdate(leadId);
        throw err;
      }
    },
    [token, sponsorId, fetchStats, optimisticUpdateLead, commitUpdate, rollbackUpdate]
  );

  // Initial fetch and sponsor change handling
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled && sponsorId && token) {
      // Update sponsorId in store - this clears data if sponsor changed
      setSponsorId(sponsorId);

      // Reset local pagination state
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
  }, [enabled, sponsorId, token, intentLevel, setSponsorId]);

  // Setup polling interval as fallback (5 minutes default)
  // WebSocket handles real-time updates - this is for recovery/catch-up only
  useEffect(() => {
    if (!enabled || !sponsorId || autoRefreshInterval <= 0) return;

    refreshIntervalRef.current = setInterval(() => {
      // Only refetch if component is mounted
      // Use ref to always get latest refetch function
      if (isMountedRef.current) {
        console.log("[useLeads] Fallback polling refresh (every 5 min)");
        refetchRef.current();
      }
    }, autoRefreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [enabled, sponsorId, autoRefreshInterval]);

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

      // Join sponsor leads room - send sponsorId in payload
      socket.emit(
        "sponsor.leads.join",
        { sponsorId },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            console.log("[useLeads] Joined sponsor leads room for sponsor:", sponsorId);
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

    // Listen for new leads - direct store update (no refetch!)
    socket.on("lead.captured.new", (data: LeadCapturedEvent) => {
      console.log("[useLeads] New lead captured event:", data.id);
      playLeadNotification();

      // Direct store update - instant UI feedback without refetch
      // Redis Streams guarantees delivery, so we trust the event data
      if (isMountedRef.current) {
        handleLeadCaptured(data);
        setLastUpdated(new Date());
      }
    });

    // Listen for lead intent updates - direct store update (no refetch!)
    socket.on("lead.intent.updated", (data: LeadIntentUpdatedEvent) => {
      console.log("[useLeads] Lead intent updated event:", data.lead_id);

      // Direct store update - instant UI feedback without refetch
      if (isMountedRef.current) {
        handleIntentUpdated(data);
        setLastUpdated(new Date());
      }
    });

    // Listen for stats updates from server
    socket.on("lead.stats.updated", (data: LeadStats) => {
      console.log("[useLeads] Stats updated event");

      if (isMountedRef.current) {
        handleStatsUpdated(data);
        setLastUpdated(new Date());
      }
    });

    return () => {
      console.log("[useLeads] Cleaning up WebSocket connection");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("lead.captured.new");
      socket.off("lead.intent.updated");
      socket.off("lead.stats.updated");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, sponsorId, enabled, handleLeadCaptured, handleIntentUpdated, handleStatsUpdated]);

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
