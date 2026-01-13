// src/hooks/use-incident-management.ts
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useIncidentStore } from "@/store/incident.store";
import type {
  Incident,
  IncidentUpdateStatus,
  UpdateIncidentPayload,
  UpdateIncidentResponse,
  JoinIncidentsResponse,
} from "@/types/incident.types";

const isDev = process.env.NODE_ENV === "development";

interface UseIncidentManagementOptions {
  autoJoin?: boolean;
}

export function useIncidentManagement(
  options: UseIncidentManagementOptions = {}
) {
  const { autoJoin = true } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [joinRetryCount, setJoinRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxJoinRetries = 3;

  const { token, user, orgId } = useAuthStore();
  const {
    incidents,
    isConnected,
    isLoading,
    error,
    filters,
    selectedIncidentId,
    setIncidents,
    addIncident,
    updateIncident,
    setIsConnected,
    setIsLoading,
    setError,
    setFilters,
    clearFilters,
    setSelectedIncidentId,
    getFilteredIncidents,
    getIncidentById,
    getActiveIncidentsCount,
    getCriticalIncidentsCount,
  } = useIncidentStore();

  // Initialize socket connection and join incidents stream
  useEffect(() => {
    if (!token || !user || !orgId) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    setIsLoading(true);

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      if (isDev) console.log("[IncidentManagement] Connected to real-time service");
      setIsConnected(true);
      setError(null);

      // Auto-join incidents stream if enabled
      if (autoJoin) {
        joinIncidentsStream();
      }
    });

    newSocket.on("disconnect", (reason) => {
      if (isDev) console.log("[IncidentManagement] Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      if (isDev) console.error("[IncidentManagement] Connection error:", err.message);
      setError("Failed to connect to incident management service");
      setIsConnected(false);
      setIsLoading(false);
    });

    // Listen for new incidents
    newSocket.on("incident.new", (incident: Incident) => {
      if (isDev) console.log("[IncidentManagement] New incident received:", incident.id);
      addIncident(incident);
    });

    // Listen for incident updates
    newSocket.on("incident.updated", (incident: Incident) => {
      if (isDev) console.log("[IncidentManagement] Incident updated:", incident.id);
      updateIncident(incident);
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("incident.new");
      newSocket.off("incident.updated");
      newSocket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [
    token,
    user,
    orgId,
    autoJoin,
    addIncident,
    updateIncident,
    setIsConnected,
    setIsLoading,
    setError,
  ]);

  // Join incidents stream to receive real-time updates
  const joinIncidentsStream = useCallback((): Promise<JoinIncidentsResponse> => {
    if (!socketRef.current?.connected) {
      const errorMsg = "Not connected to incident management service";
      setError(errorMsg);
      return Promise.resolve({ success: false, error: errorMsg });
    }

    return new Promise((resolve) => {
      socketRef.current!.emit(
        "incidents.join",
        {},
        (response: JoinIncidentsResponse & { incidents?: Incident[] }) => {
          setIsLoading(false);

          if (response.success) {
            if (isDev) console.log("[IncidentManagement] Joined incidents stream");
            setJoinRetryCount(0); // Reset retry count on success
            setError(null);

            // Load existing incidents from the response
            if (response.incidents && response.incidents.length > 0) {
              setIncidents(response.incidents);
              if (isDev) {
                console.log(
                  `[IncidentManagement] Loaded ${response.incidents.length} existing incidents`
                );
              }
            }
          } else {
            if (isDev) {
              console.error(
                "[IncidentManagement] Failed to join stream:",
                response.error
              );
            }
            setError(response.error || "Failed to join incidents stream");
          }

          resolve(response);
        }
      );
    });
  }, [setError, setIsLoading, setIncidents]);

  // Retry joining incidents stream with exponential backoff
  const retryJoinStream = useCallback(async (): Promise<JoinIncidentsResponse> => {
    if (isRetrying) {
      return { success: false, error: "Retry already in progress" };
    }

    if (joinRetryCount >= maxJoinRetries) {
      setError(`Failed to join after ${maxJoinRetries} attempts. Please refresh the page.`);
      return { success: false, error: "Max retries exceeded" };
    }

    setIsRetrying(true);
    setError(null);

    // Calculate delay with exponential backoff: 1s, 2s, 4s
    const delayMs = 1000 * Math.pow(2, joinRetryCount);

    if (isDev) {
      console.log(
        `[IncidentManagement] Retrying join (attempt ${joinRetryCount + 1}/${maxJoinRetries}) in ${delayMs}ms`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));

    setJoinRetryCount((prev: number) => prev + 1);
    const result = await joinIncidentsStream();
    setIsRetrying(false);

    return result;
  }, [isRetrying, joinRetryCount, maxJoinRetries, joinIncidentsStream]);

  // Reset retry state (useful when connection is re-established)
  const resetRetryState = useCallback(() => {
    setJoinRetryCount(0);
    setIsRetrying(false);
  }, []);

  // Update incident status
  const updateIncidentStatus = useCallback(
    async (
      incidentId: string,
      status: IncidentUpdateStatus,
      resolutionNotes?: string
    ): Promise<UpdateIncidentResponse> => {
      if (!socketRef.current?.connected) {
        const errorMsg = "Not connected to incident management service";
        setUpdateError(errorMsg);
        return { success: false, error: errorMsg };
      }

      setIsUpdating(true);
      setUpdateError(null);

      const payload: UpdateIncidentPayload = {
        incidentId,
        status,
        resolutionNotes,
        idempotencyKey: crypto.randomUUID(),
      };

      return new Promise((resolve) => {
        // Track if we've already resolved to prevent double resolution
        let hasResolved = false;
        let timeoutId: NodeJS.Timeout;

        socketRef.current!.emit(
          "incident.update_status",
          payload,
          (response: UpdateIncidentResponse) => {
            // Prevent double resolution
            if (hasResolved) return;
            hasResolved = true;

            // Clear the timeout since we got a response
            clearTimeout(timeoutId);

            setIsUpdating(false);

            if (response.success) {
              if (isDev) {
                console.log(
                  "[IncidentManagement] Incident status updated:",
                  incidentId
                );
              }
            } else {
              setUpdateError(response.error || "Failed to update incident");
              if (isDev) {
                console.error(
                  "[IncidentManagement] Update failed:",
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

          setIsUpdating(false);
          setUpdateError("Request timed out. Please try again.");
          resolve({ success: false, error: "Request timed out" });
        }, 10000);
      });
    },
    [] // No dependencies needed - uses refs and local state setters
  );

  // Acknowledge an incident
  const acknowledgeIncident = useCallback(
    (incidentId: string) =>
      updateIncidentStatus(incidentId, "ACKNOWLEDGED" as IncidentUpdateStatus),
    [updateIncidentStatus]
  );

  // Start investigating an incident
  const startInvestigation = useCallback(
    (incidentId: string) =>
      updateIncidentStatus(incidentId, "INVESTIGATING" as IncidentUpdateStatus),
    [updateIncidentStatus]
  );

  // Resolve an incident
  const resolveIncident = useCallback(
    (incidentId: string, resolutionNotes?: string) =>
      updateIncidentStatus(
        incidentId,
        "RESOLVED" as IncidentUpdateStatus,
        resolutionNotes
      ),
    [updateIncidentStatus]
  );

  // Clear update error
  const clearUpdateError = useCallback(() => {
    setUpdateError(null);
  }, []);

  // Memoize computed values to avoid recalculation on every render
  const filteredIncidents = useMemo(
    () => getFilteredIncidents(),
    [incidents, filters, getFilteredIncidents]
  );

  const activeIncidentsCount = useMemo(
    () => getActiveIncidentsCount(),
    [incidents, getActiveIncidentsCount]
  );

  const criticalIncidentsCount = useMemo(
    () => getCriticalIncidentsCount(),
    [incidents, getCriticalIncidentsCount]
  );

  return {
    // State
    incidents,
    isConnected,
    isLoading,
    error,
    filters,
    selectedIncidentId,
    isUpdating,
    updateError,
    isRetrying,
    canRetry: joinRetryCount < maxJoinRetries,

    // Computed (memoized)
    filteredIncidents,
    activeIncidentsCount,
    criticalIncidentsCount,

    // Actions
    joinIncidentsStream,
    retryJoinStream,
    resetRetryState,
    updateIncidentStatus,
    acknowledgeIncident,
    startInvestigation,
    resolveIncident,
    clearUpdateError,

    // Filter actions
    setFilters,
    clearFilters,

    // Selection actions
    setSelectedIncidentId,
    getIncidentById,

    // Data management
    setIncidents,
  };
}
