import { useEffect, useState, useCallback } from 'react';
import { EngagementData, Anomaly } from '../types';
import { useEngagementSocket } from '../context/SocketContext';

interface UseEngagementStreamProps {
  sessionId: string;
  enabled?: boolean;
}

interface UseEngagementStreamReturn {
  currentEngagement: number;
  engagementHistory: EngagementData[];
  latestAnomaly: Anomaly | null;
  isConnected: boolean;
  error: string | null;
}

/**
 * Hook for streaming real-time engagement data.
 * Uses the shared socket connection from EngagementSocketProvider.
 */
export const useEngagementStream = ({
  sessionId,
  enabled = true,
}: UseEngagementStreamProps): UseEngagementStreamReturn => {
  const { socket, isConnected, error, subscribeToSession, unsubscribeFromSession } = useEngagementSocket();
  const [currentEngagement, setCurrentEngagement] = useState<number>(0);
  const [engagementHistory, setEngagementHistory] = useState<EngagementData[]>([]);
  const [latestAnomaly, setLatestAnomaly] = useState<Anomaly | null>(null);

  useEffect(() => {
    if (!enabled || !sessionId || !socket) return;

    // Subscribe to session events
    subscribeToSession(sessionId);

    // Listen for engagement updates (every 5 seconds)
    const handleEngagementUpdate = (data: EngagementData) => {
      setCurrentEngagement(data.score);
      setEngagementHistory((prev) => {
        const updated = [...prev, data];
        // Keep last 5 minutes (60 data points at 5s intervals)
        return updated.slice(-60);
      });
    };

    // Listen for anomaly detections
    const handleAnomalyDetected = (anomaly: Anomaly) => {
      setLatestAnomaly(anomaly);
    };

    socket.on('engagement:update', handleEngagementUpdate);
    socket.on('anomaly:detected', handleAnomalyDetected);

    return () => {
      socket.off('engagement:update', handleEngagementUpdate);
      socket.off('anomaly:detected', handleAnomalyDetected);
      // Note: Don't unsubscribe here - other hooks may still be using the session
    };
  }, [sessionId, enabled, socket, subscribeToSession]);

  return {
    currentEngagement,
    engagementHistory,
    latestAnomaly,
    isConnected,
    error,
  };
};
