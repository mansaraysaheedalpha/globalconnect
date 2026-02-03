import { useEffect, useState, useCallback, useMemo } from 'react';
import { EngagementData, Anomaly } from '../types';
import { useEngagementSocket } from '../context/SocketContext';
import { useEngagementStore, EngagementDataPoint, AnomalyEvent } from '../store/engagement.store';

interface UseEngagementStreamProps {
  sessionId: string;
  eventId: string;
  enabled?: boolean;
}

interface UseEngagementStreamReturn {
  currentEngagement: number;
  engagementHistory: EngagementData[];
  latestAnomaly: Anomaly | null;
  isConnected: boolean;
  error: string | null;
  totalDataPoints: number;
  sessionDuration: number;
}

/**
 * Hook for streaming real-time engagement data.
 * Uses the shared socket connection from EngagementSocketProvider.
 *
 * State is persisted to Zustand store (localStorage) so data survives:
 * - Tab switches within the event page
 * - Page refreshes
 * - Navigation away and back
 */
export const useEngagementStream = ({
  sessionId,
  eventId,
  enabled = true,
}: UseEngagementStreamProps): UseEngagementStreamReturn => {
  const { socket, isConnected, error, subscribeToSession } = useEngagementSocket();

  // Get persisted state from Zustand store
  const sessionState = useEngagementStore((state) => state.sessions[sessionId]);
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const setAnomaly = useEngagementStore((state) => state.setAnomaly);
  const setActiveSession = useEngagementStore((state) => state.setActiveSession);

  // Local state for latest anomaly (for UI display)
  const [latestAnomaly, setLatestAnomalyLocal] = useState<Anomaly | null>(null);

  // Set this as the active session and reset local state when sessionId changes
  // This ensures session data isolation when switching between sessions
  useEffect(() => {
    if (sessionId) {
      setActiveSession(sessionId);
      // Clear local anomaly state to prevent showing stale data from previous session
      setLatestAnomalyLocal(null);
    }
  }, [sessionId, setActiveSession]);

  // Load initial anomaly from store
  useEffect(() => {
    if (sessionState?.currentAnomaly) {
      const anomaly = sessionState.currentAnomaly;
      setLatestAnomalyLocal({
        sessionId,
        type: anomaly.type,
        severity: anomaly.severity,
        anomalyScore: 0.7, // Default score (not stored)
        currentEngagement: anomaly.currentEngagement,
        expectedEngagement: anomaly.expectedEngagement,
        deviation: anomaly.deviation,
        signals: {
          chat_msgs_per_min: 0,
          poll_participation: 0,
          active_users: 0,
          reactions_per_min: 0,
          user_leave_rate: 0,
        },
        timestamp: anomaly.timestamp instanceof Date
          ? anomaly.timestamp.toISOString()
          : String(anomaly.timestamp),
      });
    }
  }, [sessionState?.currentAnomaly, sessionId]);

  useEffect(() => {
    if (!enabled || !sessionId || !socket) return;

    // Subscribe to session events
    subscribeToSession(sessionId);

    // Listen for engagement updates (every 5 seconds)
    const handleEngagementUpdate = (data: EngagementData) => {
      // Save to Zustand store for persistence
      // Data comes with signals as nested object
      const signals = data.signals || {};
      updateEngagement(sessionId, eventId, {
        score: data.score,
        chatActivity: signals.chat_msgs_per_min || 0,
        activeUsers: signals.active_users || 0,
        pollParticipation: signals.poll_participation || 0,
        reactions: signals.reactions_per_min || 0,
      });
    };

    // Listen for anomaly detections
    const handleAnomalyDetected = (anomaly: Anomaly) => {
      setLatestAnomalyLocal(anomaly);

      // Save to Zustand store
      setAnomaly(sessionId, {
        id: `anomaly-${Date.now()}`,
        type: anomaly.type as AnomalyEvent['type'],
        severity: anomaly.severity as AnomalyEvent['severity'],
        timestamp: new Date(anomaly.timestamp || Date.now()),
        currentEngagement: anomaly.currentEngagement,
        expectedEngagement: anomaly.expectedEngagement,
        deviation: Math.abs(anomaly.currentEngagement - anomaly.expectedEngagement),
      });
    };

    socket.on('engagement:update', handleEngagementUpdate);
    socket.on('anomaly:detected', handleAnomalyDetected);

    return () => {
      socket.off('engagement:update', handleEngagementUpdate);
      socket.off('anomaly:detected', handleAnomalyDetected);
      // Note: Don't unsubscribe here - other hooks may still be using the session
    };
  }, [sessionId, eventId, enabled, socket, subscribeToSession, updateEngagement, setAnomaly]);

  // Convert stored data points to EngagementData format for backwards compatibility
  const engagementHistory: EngagementData[] = useMemo(() => {
    if (!sessionState?.dataPoints) return [];

    return sessionState.dataPoints.map((dp: EngagementDataPoint) => ({
      score: dp.score,
      timestamp: dp.timestamp instanceof Date ? dp.timestamp.toISOString() : String(dp.timestamp),
      sessionId,
      eventId,
      signals: {
        chat_msgs_per_min: dp.chatActivity,
        active_users: dp.activeUsers,
        poll_participation: dp.pollParticipation,
        reactions_per_min: dp.reactions,
        user_leave_rate: 0, // Not tracked in data points
      },
    }));
  }, [sessionState?.dataPoints, sessionId, eventId]);

  return {
    currentEngagement: sessionState?.currentScore || 0,
    engagementHistory,
    latestAnomaly,
    isConnected,
    error,
    totalDataPoints: sessionState?.totalDataPoints || 0,
    sessionDuration: sessionState?.sessionDuration || 0,
  };
};
