// src/hooks/use-event-updates.ts
import { useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { useApolloClient } from "@apollo/client";

interface EventUpdatedPayload {
  eventId: string;
  eventName: string;
  startDate: string | null;
  endDate: string | null;
  message: string;
}

interface SessionUpdatedPayload {
  sessionId: string;
  sessionTitle: string;
  startTime: string | null;
  endTime: string | null;
  eventId: string;
  message: string;
}

interface UseEventUpdatesOptions {
  eventId?: string;
  onEventUpdated?: (payload: EventUpdatedPayload) => void;
  onSessionUpdated?: (payload: SessionUpdatedPayload) => void;
  autoRefetch?: boolean;
}

/**
 * Hook to listen for real-time event and session update notifications.
 * Shows toast notifications and optionally triggers Apollo cache refetch.
 *
 * @example
 * useEventUpdates({
 *   eventId: "event-123",
 *   autoRefetch: true,
 * });
 */
export function useEventUpdates({
  eventId,
  onEventUpdated,
  onSessionUpdated,
  autoRefetch = true,
}: UseEventUpdatesOptions) {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore();
  const apolloClient = useApolloClient();

  const handleEventUpdated = useCallback(
    (payload: EventUpdatedPayload) => {
      console.log("[useEventUpdates] Event updated:", payload);

      // Show toast notification
      toast.info("Event Updated", {
        description: `${payload.eventName} details have been updated. Refresh to see changes.`,
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
        duration: 10000,
      });

      // Auto-refetch queries if enabled
      if (autoRefetch) {
        apolloClient.refetchQueries({
          include: ["GetMyRegistrations", "GetAttendeeEventDetails"],
        });
      }

      // Call custom handler if provided
      if (onEventUpdated) {
        onEventUpdated(payload);
      }
    },
    [onEventUpdated, autoRefetch, apolloClient]
  );

  const handleSessionUpdated = useCallback(
    (payload: SessionUpdatedPayload) => {
      console.log("[useEventUpdates] Session updated:", payload);

      // Show toast notification
      toast.info("Session Updated", {
        description: `"${payload.sessionTitle}" has been updated. Refresh to see changes.`,
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
        duration: 10000,
      });

      // Auto-refetch queries if enabled
      if (autoRefetch) {
        apolloClient.refetchQueries({
          include: ["GetAttendeeEventDetails"],
        });
      }

      // Call custom handler if provided
      if (onSessionUpdated) {
        onSessionUpdated(payload);
      }
    },
    [onSessionUpdated, autoRefetch, apolloClient]
  );

  useEffect(() => {
    if (!eventId || !token) {
      return;
    }

    const REAL_TIME_URL =
      process.env.NEXT_PUBLIC_REAL_TIME_SERVICE_URL ||
      "https://event-management-platform-realtime-service.onrender.com";

    console.log("[useEventUpdates] Connecting to socket for event:", eventId);

    const newSocket = io(REAL_TIME_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = newSocket;

    // Join event room to receive updates
    newSocket.on("connect", () => {
      console.log("[useEventUpdates] Socket connected");
      newSocket.emit("event.join", { eventId });
    });

    // Listen for event updates
    newSocket.on("event.updated", handleEventUpdated);

    // Listen for session updates
    newSocket.on("session.updated", handleSessionUpdated);

    // Error handling
    newSocket.on("connect_error", (error) => {
      console.error("[useEventUpdates] Socket connection error:", error);
    });

    // Cleanup
    return () => {
      newSocket.emit("event.leave", { eventId });
      newSocket.off("connect");
      newSocket.off("event.updated");
      newSocket.off("session.updated");
      newSocket.off("connect_error");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, token, handleEventUpdated, handleSessionUpdated]);

  return {
    isConnected: socketRef.current?.connected ?? false,
  };
}
