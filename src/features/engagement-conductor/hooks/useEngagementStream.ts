import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { EngagementData, Anomaly } from '../types';
import { getSocketUrl } from '@/lib/env';

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

export const useEngagementStream = ({
  sessionId,
  enabled = true,
}: UseEngagementStreamProps): UseEngagementStreamReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentEngagement, setCurrentEngagement] = useState<number>(0);
  const [engagementHistory, setEngagementHistory] = useState<EngagementData[]>([]);
  const [latestAnomaly, setLatestAnomaly] = useState<Anomaly | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    // Connect to real-time service using environment variable
    const socketConnection = io(getSocketUrl(), {
      query: { sessionId },
      transports: ['websocket'],
    });

    socketConnection.on('connect', () => {
      console.log('✅ Connected to engagement stream');
      setIsConnected(true);
      setError(null);

      // Subscribe to engagement updates
      socketConnection.emit('subscribe:engagement', { sessionId });
    });

    socketConnection.on('disconnect', () => {
      console.log('❌ Disconnected from engagement stream');
      setIsConnected(false);
    });

    socketConnection.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(err.message);
    });

    // Listen for engagement updates (every 5 seconds)
    socketConnection.on('engagement:update', (data: EngagementData) => {
      setCurrentEngagement(data.score);
      setEngagementHistory((prev) => {
        const updated = [...prev, data];
        // Keep last 5 minutes (60 data points at 5s intervals)
        return updated.slice(-60);
      });
    });

    // Listen for anomaly detections
    socketConnection.on('anomaly:detected', (anomaly: Anomaly) => {
      setLatestAnomaly(anomaly);
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [sessionId, enabled]);

  return {
    currentEngagement,
    engagementHistory,
    latestAnomaly,
    isConnected,
    error,
  };
};
