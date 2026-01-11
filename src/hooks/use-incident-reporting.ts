// src/hooks/use-incident-reporting.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useIncidentStore } from "@/store/incident.store";
import type {
  IncidentType,
  IncidentSeverity,
  ReportIncidentPayload,
  ReportIncidentResponse,
} from "@/types/incident.types";

interface UseIncidentReportingOptions {
  sessionId: string;
  eventId?: string;
}

interface ReportIncidentInput {
  type: IncidentType;
  severity: IncidentSeverity;
  details: string;
}

export function useIncidentReporting({
  sessionId,
  eventId,
}: UseIncidentReportingOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token, user } = useAuthStore();
  const {
    isReporting,
    reportSuccess,
    reportError,
    setIsReporting,
    setReportSuccess,
    setReportError,
    resetReportState,
  } = useIncidentStore();

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user || !sessionId) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId, eventId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    const isDev = process.env.NODE_ENV === "development";

    newSocket.on("connect", () => {
      if (isDev) console.log("[IncidentReporting] Connected to real-time service");
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", (reason) => {
      if (isDev) console.log("[IncidentReporting] Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      if (isDev) console.error("[IncidentReporting] Connection error:", err.message);
      setError("Failed to connect to incident reporting service");
      setIsConnected(false);
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [token, user, sessionId, eventId]);

  // Report an incident
  const reportIncident = useCallback(
    async (input: ReportIncidentInput): Promise<ReportIncidentResponse> => {
      if (!socketRef.current?.connected) {
        const errorMsg = "Not connected to incident reporting service";
        setReportError(errorMsg);
        return { success: false, error: errorMsg };
      }

      setIsReporting(true);
      setReportError(null);
      setReportSuccess(false);

      const payload: ReportIncidentPayload = {
        type: input.type,
        severity: input.severity,
        details: input.details,
        idempotencyKey: crypto.randomUUID(),
      };

      return new Promise((resolve) => {
        // Track if we've already resolved to prevent double resolution
        let hasResolved = false;
        let timeoutId: NodeJS.Timeout;

        socketRef.current!.emit(
          "incident.report",
          payload,
          (response: ReportIncidentResponse) => {
            // Prevent double resolution
            if (hasResolved) return;
            hasResolved = true;

            // Clear the timeout since we got a response
            clearTimeout(timeoutId);

            setIsReporting(false);

            if (response.success) {
              setReportSuccess(true);
              if (process.env.NODE_ENV === "development") {
                console.log(
                  "[IncidentReporting] Incident reported:",
                  response.incidentId
                );
              }
            } else {
              setReportError(response.error || "Failed to report incident");
              if (process.env.NODE_ENV === "development") {
                console.error(
                  "[IncidentReporting] Report failed:",
                  response.error
                );
              }
            }

            resolve(response);
          }
        );

        // Timeout handling - use local flag instead of stale closure
        timeoutId = setTimeout(() => {
          if (hasResolved) return;
          hasResolved = true;

          setIsReporting(false);
          setReportError("Request timed out. Please try again.");
          resolve({ success: false, error: "Request timed out" });
        }, 10000);
      });
    },
    [setIsReporting, setReportError, setReportSuccess]
  );

  // Reset the report state (useful after showing success message)
  const resetReport = useCallback(() => {
    resetReportState();
    setError(null);
  }, [resetReportState]);

  return {
    // Connection state
    isConnected,
    connectionError: error,

    // Report state
    isReporting,
    reportSuccess,
    reportError,

    // Actions
    reportIncident,
    resetReport,
  };
}
