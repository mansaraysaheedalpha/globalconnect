import { useState, useEffect, useCallback } from 'react';
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

  // Fetch intervention history from API
  const fetchHistory = useCallback(async () => {
    if (!enabled || !sessionId) return;

    try {
      setIsLoading(true);
      const token = useAuthStore.getState().token;
      const response = await fetch(`${effectiveApiBaseUrl}/api/v1/interventions/history/${sessionId}?limit=20`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch intervention history: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform API response to match our Intervention type
      const interventions: Intervention[] = data.interventions.map((item: any) => ({
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
    } catch (err) {
      console.error('Failed to fetch intervention history:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
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

  // Connect to WebSocket and listen for intervention events
  useEffect(() => {
    if (!enabled || !sessionId || !socket) return;

    // Subscribe to session events (uses shared socket)
    subscribeToSession(sessionId);

    // Listen for intervention suggestions
    const handleInterventionSuggested = (data: any) => {
      console.log('[useInterventions] Intervention suggested:', data);

      // Transform to our Intervention type
      const intervention: Intervention = {
        id: data.intervention_id,
        sessionId: data.session_id,
        type: data.type.replace('agent.intervention.', '').toUpperCase(),
        status: 'SUGGESTED',
        confidence: data.metadata?.confidence || 0.8,
        reasoning: data.metadata?.reason || 'Engagement intervention recommended',
        params: data.poll || data.prompt || {},
        timestamp: data.timestamp,
      };

      setPendingIntervention(intervention);
    };

    // Listen for intervention executed (auto-triggered)
    const handleInterventionExecuted = (data: any) => {
      console.log('[useInterventions] Intervention executed:', data);
      // Refresh history to show the new intervention
      fetchHistory();
    };

    socket.on('agent.intervention', handleInterventionSuggested);
    socket.on('agent.intervention.executed', handleInterventionExecuted);

    // Initial history fetch
    fetchHistory();

    return () => {
      socket.off('agent.intervention', handleInterventionSuggested);
      socket.off('agent.intervention.executed', handleInterventionExecuted);
    };
  }, [enabled, sessionId, socket, subscribeToSession, fetchHistory]);

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
