import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Intervention } from '../types/intervention';

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

export const useInterventions = ({
  sessionId,
  eventId,
  enabled = true,
  apiBaseUrl = 'http://localhost:8003',
}: UseInterventionsOptions): UseInterventionsResult => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pendingIntervention, setPendingIntervention] = useState<Intervention | null>(null);
  const [interventionHistory, setInterventionHistory] = useState<Intervention[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch intervention history from API
  const fetchHistory = useCallback(async () => {
    if (!enabled || !sessionId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/v1/interventions/history/${sessionId}?limit=20`);

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
  }, [enabled, sessionId, apiBaseUrl]);

  // Approve intervention (manual mode)
  const approveIntervention = useCallback(async (interventionId: string) => {
    try {
      // In Phase 3, interventions are auto-triggered, but we can still manually trigger
      // This would be used if we implement manual approval mode in future
      const response = await fetch(`${apiBaseUrl}/api/v1/interventions/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  }, [sessionId, eventId, pendingIntervention, apiBaseUrl, fetchHistory]);

  // Dismiss intervention
  const dismissIntervention = useCallback((interventionId: string) => {
    setPendingIntervention(null);
  }, []);

  // Connect to WebSocket and listen for intervention events
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const socketConnection = io('http://localhost:3002', {
      query: { sessionId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketConnection.on('connect', () => {
      console.log('✅ Connected to intervention stream');
      setIsConnected(true);
      setError(null);
    });

    socketConnection.on('disconnect', () => {
      console.log('❌ Disconnected from intervention stream');
      setIsConnected(false);
    });

    socketConnection.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to real-time service');
      setIsConnected(false);
    });

    // Listen for intervention suggestions
    socketConnection.on('agent.intervention', (data: any) => {
      console.log('🎯 Intervention suggested:', data);

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
    });

    // Listen for intervention executed (auto-triggered)
    socketConnection.on('agent.intervention.executed', (data: any) => {
      console.log('✅ Intervention executed:', data);

      // Refresh history to show the new intervention
      fetchHistory();
    });

    setSocket(socketConnection);

    // Initial history fetch
    fetchHistory();

    return () => {
      socketConnection.disconnect();
    };
  }, [enabled, sessionId, fetchHistory]);

  return {
    pendingIntervention,
    interventionHistory,
    isConnected,
    isLoading,
    error,
    approveIntervention,
    dismissIntervention,
    refreshHistory: fetchHistory,
  };
};
