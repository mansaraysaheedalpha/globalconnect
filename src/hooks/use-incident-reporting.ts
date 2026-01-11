// src/hooks/use-incident-reporting.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
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

    newSocket.on("connect", () => {
      console.log("[IncidentReporting] Connected to real-time service");
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[IncidentReporting] Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[IncidentReporting] Connection error:", err.message);
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
        idempotencyKey: uuidv4(),
      };

      return new Promise((resolve) => {
        socketRef.current!.emit(
          "incident.report",
          payload,
          (response: ReportIncidentResponse) => {
            setIsReporting(false);

            if (response.success) {
              setReportSuccess(true);
              console.log(
                "[IncidentReporting] Incident reported:",
                response.incidentId
              );
            } else {
              setReportError(response.error || "Failed to report incident");
              console.error(
                "[IncidentReporting] Report failed:",
                response.error
              );
            }

            resolve(response);
          }
        );

        // Timeout handling
        setTimeout(() => {
          if (isReporting) {
            setIsReporting(false);
            setReportError("Request timed out. Please try again.");
            resolve({ success: false, error: "Request timed out" });
          }
        }, 10000);
      });
    },
    [isReporting, setIsReporting, setReportError, setReportSuccess]
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
