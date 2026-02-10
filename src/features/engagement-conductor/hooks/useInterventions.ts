import { useState, useEffect, useCallback, useRef } from 'react';
import { Intervention } from '../types/intervention';
import { getAgentServiceUrl } from '@/lib/env';
import { useEngagementSocket } from '../context/SocketContext';
import { useAuthStore } from '@/store/auth.store';

interface UseInterventionsOptions {
  sessionId: string;
  eventId: string;
  enabled?: boolean;
  apiBaseUrl?: string;
}

interface UseInterventionsResult {
  pendingIntervention: Intervention | null;
  interventionHistory: Intervention[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  approveIntervention: (interventionId: string) => Promise<void>;
  dismissIntervention: (interventionId: string) => void;
  refreshHistory: () => Promise<void>;
}

/**
 * Hook for managing interventions.
 * Uses the shared socket connection from EngagementSocketProvider.
 */
export const useInterventions = ({
  sessionId,
  eventId,
  enabled = true,
  apiBaseUrl,
}: UseInterventionsOptions): UseInterventionsResult => {
  // Use environment variable for agent service URL with optional override
  const effectiveApiBaseUrl = apiBaseUrl || getAgentServiceUrl();
  const { socket, isConnected, error: socketError, subscribeToSession } = useEngagementSocket();
  const [pendingIntervention, setPendingIntervention] = useState<Intervention | null>(null);
  const [interventionHistory, setInterventionHistory] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if initial fetch has been done to prevent duplicate calls
  const hasFetchedRef = useRef(false);
  const fetchInProgressRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  // Minimum time between fetches (debounce)
  const MIN_FETCH_INTERVAL_MS = 5000;

  // Fetch intervention history from API with debouncing
  const fetchHistory = useCallback(async (force = false) => {
    if (!enabled || !sessionId) return;

    // Debounce: prevent fetching too frequently
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL_MS) {
      console.log('[useInterventions] Skipping fetch - too soon since last fetch');
      return;
    }

    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      console.log('[useInterventions] Skipping fetch - already in progress');
      return;
    }

    fetchInProgressRef.current = true;
    lastFetchTimeRef.current = now;

    try {
      setIsLoading(true);
      const token = useAuthStore.getState().token;

      // Abort fetch after 10 seconds to prevent permanent loading state
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${effectiveApiBaseUrl}/api/v1/interventions/history/${sessionId}?limit=20`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        // Don't throw on rate limit - just log and retry on next cycle
        if (response.status === 429) {
          console.warn('[useInterventions] Rate limited - will retry later');
          // Reset last fetch time to allow retry sooner (after half the debounce)
          lastFetchTimeRef.current = now - (MIN_FETCH_INTERVAL_MS / 2);
          return;
        }
        throw new Error(`Failed to fetch intervention history: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform API response to match our Intervention type
      const interventions: Intervention[] = (data.interventions || []).map((item: any) => ({
        id: item.id,
        sessionId: item.session_id,
        type: item.type,
        status: item.outcome?.success ? 'COMPLETED' : 'EXECUTED',
        confidence: item.confidence,
        reasoning: item.reasoning || '',
        params: item.metadata || {},
        timestamp: item.timestamp,
        outcome: item.outcome ? {
          success: item.outcome.success,
          engagementBefore: item.outcome.engagement_before || 0,
          engagementAfter: item.outcome.engagement_after || 0,
          delta: item.outcome.engagement_delta || 0,
          timestamp: item.timestamp,
        } : undefined,
      }));

      setInterventionHistory(interventions);
      setError(null);
      hasFetchedRef.current = true;
    } catch (err) {
      console.error('[useInterventions] Failed to fetch intervention history:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [enabled, sessionId, effectiveApiBaseUrl]);

  // Approve intervention (manual mode)
  const approveIntervention = useCallback(async (interventionId: string) => {
    try {
      // In Phase 3, interventions are auto-triggered, but we can still manually trigger
      // This would be used if we implement manual approval mode in future
      const token = useAuthStore.getState().token;
      const response = await fetch(`${effectiveApiBaseUrl}/api/v1/interventions/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          session_id: sessionId,
          event_id: eventId,
          intervention_type: pendingIntervention?.type || 'POLL',
          reason: 'Manual approval from dashboard',
          context: pendingIntervention?.params || {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve intervention');
      }

      // Clear pending and refresh history
      setPendingIntervention(null);
      await fetchHistory();
    } catch (err) {
      console.error('Failed to approve intervention:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [sessionId, eventId, pendingIntervention, effectiveApiBaseUrl, fetchHistory]);

  // Dismiss intervention
  const dismissIntervention = useCallback((interventionId: string) => {
    setPendingIntervention(null);
  }, []);

  // Initial history fetch - only run once when dependencies are ready
  useEffect(() => {
    if (!enabled || !sessionId || hasFetchedRef.current) return;

    // Delay initial fetch slightly to avoid race conditions with socket setup
    const timer = setTimeout(() => {
      fetchHistory(true); // force initial fetch
    }, 500);

    return () => clearTimeout(timer);
  }, [enabled, sessionId, fetchHistory]);

  // Connect to WebSocket and listen for intervention execution events
  // Note: Intervention suggestions are handled by useAgentState via 'agent.decision' events
  useEffect(() => {
    if (!enabled || !sessionId || !socket) return;

    // Subscribe to session events (uses shared socket)
    subscribeToSession(sessionId);

    // Listen for intervention executed events to refresh history
    const handleInterventionExecuted = (data: any) => {
      console.log('[useInterventions] Intervention executed:', data);
      // Refresh history to show the new intervention (with debounce)
      fetchHistory();
    };

    socket.on('agent.intervention.executed', handleInterventionExecuted);

    return () => {
      socket.off('agent.intervention.executed', handleInterventionExecuted);
    };
  }, [enabled, sessionId, socket, subscribeToSession, fetchHistory]);

  // Reset state when sessionId changes - ensures session data isolation
  useEffect(() => {
    hasFetchedRef.current = false;
    lastFetchTimeRef.current = 0;
    // Clear local state to prevent showing stale data from previous session
    setInterventionHistory([]);
    setPendingIntervention(null);
    setError(null);
    setIsLoading(true);
  }, [sessionId]);

  // Combine socket error with local error
  const combinedError = error || socketError;

  return {
    pendingIntervention,
    interventionHistory,
    isConnected,
    isLoading,
    error: combinedError,
    approveIntervention,
    dismissIntervention,
    refreshHistory: fetchHistory,
  };
};
