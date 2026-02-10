// src/features/engagement-conductor/components/BackgroundSessionMonitor.tsx
"use client";

import { useEffect, useRef } from "react";
import { useEngagementSocket } from "../context/SocketContext";
import { useEngagementStore, AnomalyEvent } from "../store/engagement.store";
import { EngagementData, Anomaly } from "../types";

interface BackgroundSessionMonitorProps {
  sessionIds: string[];
  eventId: string;
  excludeSessionId?: string; // Skip this session (it's being handled by EngagementDashboard)
}

/**
 * Background monitor for multiple sessions
 *
 * This component subscribes to all provided sessions and updates
 * the Zustand store with engagement data and anomalies.
 * It runs in the background without rendering any UI.
 */
export const BackgroundSessionMonitor: React.FC<BackgroundSessionMonitorProps> = ({
  sessionIds,
  eventId,
  excludeSessionId,
}) => {
  const { socket, isConnected, subscribeToSession, unsubscribeFromSession } = useEngagementSocket();
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const setAnomaly = useEngagementStore((state) => state.setAnomaly);

  // Track which sessions we've subscribed to
  const subscribedRef = useRef<Set<string>>(new Set());

  // Subscribe to all sessions except the excluded one
  useEffect(() => {
    if (!socket || !isConnected) return;

    const sessionsToMonitor = sessionIds.filter((id) => id !== excludeSessionId);

    // Subscribe to new sessions
    sessionsToMonitor.forEach((sessionId) => {
      if (!subscribedRef.current.has(sessionId)) {
        console.log("[BackgroundMonitor] Subscribing to session:", sessionId);
        subscribeToSession(sessionId);
        subscribedRef.current.add(sessionId);
      }
    });

    // Unsubscribe from sessions no longer in the list
    subscribedRef.current.forEach((sessionId) => {
      if (!sessionsToMonitor.includes(sessionId)) {
        console.log("[BackgroundMonitor] Unsubscribing from session:", sessionId);
        unsubscribeFromSession(sessionId);
        subscribedRef.current.delete(sessionId);
      }
    });
  }, [socket, isConnected, sessionIds, excludeSessionId, subscribeToSession, unsubscribeFromSession]);

  // Listen for engagement updates from all monitored sessions
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleEngagementUpdate = (data: EngagementData) => {
      // Only process if it's a session we're monitoring
      if (!subscribedRef.current.has(data.sessionId)) return;

      // Update Zustand store
      const signals = data.signals || {};
      updateEngagement(data.sessionId, eventId, {
        score: data.score,
        chatActivity: signals.chat_msgs_per_min || 0,
        activeUsers: signals.active_users || 0,
        pollParticipation: signals.poll_participation || 0,
        reactions: signals.reactions_per_min || 0,
      });
    };

    const handleAnomalyDetected = (anomaly: Anomaly) => {
      // Only process if it's a session we're monitoring
      if (!subscribedRef.current.has(anomaly.sessionId)) return;

      console.log("[BackgroundMonitor] Anomaly detected:", anomaly.sessionId, anomaly.type);

      // Update Zustand store with deterministic ID based on anomaly properties
      // This prevents duplicate toasts when the same anomaly condition is re-detected
      const anomalyId = `${anomaly.sessionId}-${anomaly.type}-${anomaly.severity}`;
      setAnomaly(anomaly.sessionId, {
        id: anomalyId,
        type: anomaly.type as AnomalyEvent["type"],
        severity: anomaly.severity as AnomalyEvent["severity"],
        timestamp: new Date(anomaly.timestamp || Date.now()),
        currentEngagement: anomaly.currentEngagement,
        expectedEngagement: anomaly.expectedEngagement,
        deviation: Math.abs(anomaly.currentEngagement - anomaly.expectedEngagement),
      });
    };

    socket.on("engagement:update", handleEngagementUpdate);
    socket.on("anomaly:detected", handleAnomalyDetected);

    return () => {
      socket.off("engagement:update", handleEngagementUpdate);
      socket.off("anomaly:detected", handleAnomalyDetected);
    };
  }, [socket, isConnected, eventId, updateEngagement, setAnomaly]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscribedRef.current.forEach((sessionId) => {
        unsubscribeFromSession(sessionId);
      });
      subscribedRef.current.clear();
    };
  }, [unsubscribeFromSession]);

  // This component doesn't render anything
  return null;
};
