// src/hooks/use-incident-management.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/store/auth.store";
import { useIncidentStore } from "@/store/incident.store";
import type {
  Incident,
  IncidentUpdateStatus,
  UpdateIncidentPayload,
  UpdateIncidentResponse,
  JoinIncidentsResponse,
} from "@/types/incident.types";

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
      console.log("[IncidentManagement] Connected to real-time service");
      setIsConnected(true);
      setError(null);

      // Auto-join incidents stream if enabled
      if (autoJoin) {
        joinIncidentsStream();
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[IncidentManagement] Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[IncidentManagement] Connection error:", err.message);
      setError("Failed to connect to incident management service");
      setIsConnected(false);
      setIsLoading(false);
    });

    // Listen for new incidents
    newSocket.on("incident.new", (incident: Incident) => {
      console.log("[IncidentManagement] New incident received:", incident.id);
      addIncident(incident);
    });

    // Listen for incident updates
    newSocket.on("incident.updated", (incident: Incident) => {
      console.log("[IncidentManagement] Incident updated:", incident.id);
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
        (response: JoinIncidentsResponse) => {
          setIsLoading(false);

          if (response.success) {
            console.log("[IncidentManagement] Joined incidents stream");
          } else {
            console.error(
              "[IncidentManagement] Failed to join stream:",
              response.error
            );
            setError(response.error || "Failed to join incidents stream");
          }

          resolve(response);
        }
      );
    });
  }, [setError, setIsLoading]);

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
        idempotencyKey: uuidv4(),
      };

      return new Promise((resolve) => {
        socketRef.current!.emit(
          "incident.update_status",
          payload,
          (response: UpdateIncidentResponse) => {
            setIsUpdating(false);

            if (response.success) {
              console.log(
                "[IncidentManagement] Incident status updated:",
                incidentId
              );
            } else {
              setUpdateError(response.error || "Failed to update incident");
              console.error(
                "[IncidentManagement] Update failed:",
                response.error
              );
            }

            resolve(response);
          }
        );

        // Timeout handling
        setTimeout(() => {
          if (isUpdating) {
            setIsUpdating(false);
            setUpdateError("Request timed out. Please try again.");
            resolve({ success: false, error: "Request timed out" });
          }
        }, 10000);
      });
    },
    [isUpdating]
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

    // Computed
    filteredIncidents: getFilteredIncidents(),
    activeIncidentsCount: getActiveIncidentsCount(),
    criticalIncidentsCount: getCriticalIncidentsCount(),

    // Actions
    joinIncidentsStream,
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
