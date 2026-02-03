// src/app/(platform)/dashboard/events/[eventId]/engagement/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { EngagementDashboard } from "@/features/engagement-conductor/components/EngagementDashboard";
import { BackgroundSessionMonitor } from "@/features/engagement-conductor/components/BackgroundSessionMonitor";
import { EngagementSocketProvider } from "@/features/engagement-conductor/context/SocketContext";
import { useAuthStore } from "@/store/auth.store";
import { useEngagementStore } from "@/features/engagement-conductor/store/engagement.store";
import { GET_SESSIONS_BY_EVENT_QUERY } from "@/graphql/events.graphql";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Radio, Clock, CheckCircle, AlertTriangle, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "LIVE" | "ENDED";
  chatEnabled: boolean;
}

/**
 * Engagement Conductor Page
 *
 * Displays the AI-powered engagement conductor dashboard for real-time
 * engagement monitoring and automated intervention suggestions.
 *
 * Features:
 * - Real-time engagement monitoring for LIVE sessions
 * - Session selector with status indicators (prioritizes LIVE sessions)
 * - Background anomaly notifications
 * - Isolated data per session
 * - AI-powered intervention suggestions
 * - Agent mode control (Manual/Semi-Auto/Auto)
 */
export default function EngagementConductorPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Fetch sessions for this event with polling to detect status changes
  const { data, loading } = useQuery(GET_SESSIONS_BY_EVENT_QUERY, {
    variables: { eventId },
    pollInterval: 30000, // Refresh every 30 seconds to detect session status changes
    onCompleted: (data) => {
      const sessions: Session[] = data?.sessionsByEvent || [];

      // Auto-select first LIVE session, or first session with chat enabled
      if (!selectedSessionId) {
        const liveSession = sessions.find((s) => s.status === "LIVE");
        const chatSession = sessions.find((s) => s.chatEnabled);
        const firstSession = liveSession || chatSession || sessions[0];
        if (firstSession) {
          setSelectedSessionId(firstSession.id);
        }
      }

      // Notify when a session goes live
      const liveSessions = sessions.filter((s) => s.status === "LIVE");
      if (liveSessions.length > 0 && notificationsEnabled) {
        liveSessions.forEach((session) => {
          // Only notify once per session going live
          const notifiedKey = `notified-live-${session.id}`;
          if (!sessionStorage.getItem(notifiedKey)) {
            sessionStorage.setItem(notifiedKey, "true");
            toast.success(`Session "${session.title}" is now LIVE!`, {
              description: "Engagement monitoring is active.",
              action: {
                label: "View",
                onClick: () => setSelectedSessionId(session.id),
              },
            });
          }
        });
      }
    },
  });

  const sessions: Session[] = data?.sessionsByEvent || [];

  // Separate sessions by status
  const liveSessions = sessions.filter((s) => s.status === "LIVE");
  const upcomingSessions = sessions.filter((s) => s.status === "UPCOMING");
  const endedSessions = sessions.filter((s) => s.status === "ENDED");

  // Sort: LIVE first, then UPCOMING, then ENDED
  const sortedSessions = [...liveSessions, ...upcomingSessions, ...endedSessions];

  const sessionId = selectedSessionId || sortedSessions[0]?.id;
  const selectedSession = sessions.find((s) => s.id === sessionId);

  // Get auth token from Zustand auth store
  const authToken = useAuthStore((state) => state.token) || undefined;

  // Request browser notification permission
  useEffect(() => {
    if (notificationsEnabled && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [notificationsEnabled]);

  // Toggle notifications
  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => {
      const newValue = !prev;
      toast.info(newValue ? "Notifications enabled" : "Notifications disabled");
      return newValue;
    });
  }, []);

  // Track notified anomalies to prevent duplicates
  const notifiedAnomaliesRef = useRef<Set<string>>(new Set());

  // Get all session states from the Zustand store
  const allSessionStates = useEngagementStore((state) => state.sessions);

  // Background anomaly monitoring - watch for anomalies in ALL live sessions
  useEffect(() => {
    if (!notificationsEnabled || liveSessions.length === 0) return;

    liveSessions.forEach((session) => {
      const sessionState = allSessionStates[session.id];
      const anomaly = sessionState?.currentAnomaly;

      if (!anomaly) return;

      // Create unique key for this anomaly
      const anomalyKey = `${session.id}-${anomaly.id}-${anomaly.timestamp}`;

      // Skip if already notified or if this is the currently viewed session
      if (notifiedAnomaliesRef.current.has(anomalyKey)) return;
      if (session.id === selectedSessionId) return; // Don't notify for currently viewed session

      // Mark as notified
      notifiedAnomaliesRef.current.add(anomalyKey);

      // Clean up old notification keys (keep last 100)
      if (notifiedAnomaliesRef.current.size > 100) {
        const keysArray = Array.from(notifiedAnomaliesRef.current);
        notifiedAnomaliesRef.current = new Set(keysArray.slice(-100));
      }

      // Show toast notification based on severity
      const toastOptions = {
        description: `${anomaly.type.replace(/_/g, " ")}: Engagement at ${(anomaly.currentEngagement * 100).toFixed(0)}%`,
        action: {
          label: "View",
          onClick: () => setSelectedSessionId(session.id),
        },
        duration: anomaly.severity === "CRITICAL" ? 10000 : 6000,
      };

      if (anomaly.severity === "CRITICAL") {
        toast.error(`Critical Alert: ${session.title}`, toastOptions);
        // Also send browser notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`🚨 Critical Alert: ${session.title}`, {
            body: `${anomaly.type.replace(/_/g, " ")}: Engagement dropped to ${(anomaly.currentEngagement * 100).toFixed(0)}%`,
            icon: "/favicon.ico",
            tag: anomalyKey, // Prevent duplicate browser notifications
          });
        }
      } else {
        toast.warning(`Warning: ${session.title}`, toastOptions);
      }
    });
  }, [allSessionStates, liveSessions, selectedSessionId, notificationsEnabled]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 ml-2">
            <Radio className="h-3 w-3 mr-1 animate-pulse" />
            Live
          </Badge>
        );
      case "UPCOMING":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 ml-2">
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Badge>
        );
      case "ENDED":
        return (
          <Badge variant="outline" className="text-muted-foreground ml-2">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ended
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">No Sessions Found</h2>
          <p className="text-gray-500 mt-2">
            Create a session for this event to start monitoring engagement.
          </p>
        </div>
      </div>
    );
  }

  // Show waiting state if no live sessions
  if (liveSessions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <Clock className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">
            No Live Sessions
          </h2>
          <p className="text-yellow-600 dark:text-yellow-400 mt-2 max-w-md mx-auto">
            The Engagement Conductor will automatically start monitoring when a session goes live.
          </p>
          {upcomingSessions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                {upcomingSessions.length} upcoming session{upcomingSessions.length > 1 ? "s" : ""} scheduled
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with session selector and notification toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Session Selector - Only shows LIVE sessions */}
        <div className="flex-1">
          <label htmlFor="session-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Live Sessions ({liveSessions.length})
          </label>
          <div className="flex items-center gap-2">
            <select
              id="session-select"
              value={selectedSessionId || ""}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className={cn(
                "block w-full max-w-md rounded-md border-gray-300 dark:border-gray-700",
                "bg-white dark:bg-gray-800 shadow-sm",
                "focus:border-green-500 focus:ring-green-500 sm:text-sm",
                "pr-10"
              )}
            >
              {liveSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title} {session.chatEnabled ? "(Chat Enabled)" : ""}
                </option>
              ))}
            </select>
            {selectedSession && getStatusBadge(selectedSession.status)}
          </div>
        </div>

        {/* Notification Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleNotifications}
          className={cn(
            notificationsEnabled
              ? "border-green-500/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
              : "border-gray-300 text-gray-500"
          )}
        >
          {notificationsEnabled ? (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Notifications On
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Notifications Off
            </>
          )}
        </Button>
      </div>

      {/* Info banner for multiple live sessions */}
      {liveSessions.length > 1 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>{liveSessions.length} sessions are live.</strong> Each session is monitored
            independently. Switch between sessions to view their engagement data.
          </p>
        </div>
      )}

      {/* Engagement Dashboard with Socket Provider */}
      {sessionId && (
        <EngagementSocketProvider sessionId={sessionId} authToken={authToken}>
          {/* Background monitor for all live sessions (except the currently viewed one) */}
          <BackgroundSessionMonitor
            sessionIds={liveSessions.map((s) => s.id)}
            eventId={eventId}
            excludeSessionId={sessionId}
          />
          <EngagementDashboard
            sessionId={sessionId}
            eventId={eventId}
            enabled={true}
          />
        </EngagementSocketProvider>
      )}
    </div>
  );
}
