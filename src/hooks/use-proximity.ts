// src/hooks/use-proximity.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import {
  ProximityState,
  NearbyUser,
  ProximityPing,
  LocationCoordinates,
  RosterUpdate,
  ProximityResponse,
  isAdvancedRosterUpdate,
} from "@/types/proximity";

// Generate UUID v4 using built-in crypto API
const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Location update interval in milliseconds (10 seconds)
const LOCATION_UPDATE_INTERVAL = 10000;

// Max pings to keep in history
const MAX_PINGS_HISTORY = 10;

interface UseProximityOptions {
  eventId: string;
  autoStart?: boolean;
}

export const useProximity = ({ eventId, autoStart = false }: UseProximityOptions) => {
  const [state, setState] = useState<ProximityState>({
    nearbyUsers: [],
    receivedPings: [],
    isTracking: false,
    isConnected: false,
    isJoined: false,
    error: null,
    locationPermission: "prompt",
    lastLocation: null,
  });

  const { token, user } = useAuthStore();
  const locationWatchId = useRef<number | null>(null);
  const updateIntervalId = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<LocationCoordinates | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Check if geolocation is available (SSR safe)
  const checkGeolocationSupport = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        locationPermission: "unavailable",
        error: "Geolocation is not supported by your browser",
      }));
      return false;
    }
    return true;
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!eventId || !token) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { eventId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.warn("[Proximity] Socket connected!");
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", () => {
      console.warn("[Proximity] Connection acknowledged by server");
      setState((prev) => ({ ...prev, isJoined: true }));
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("[Proximity] Socket disconnected:", reason);
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isJoined: false,
      }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Proximity] Socket connection error:", error.message);
    });

    // Listen for roster updates (nearby users)
    newSocket.on("proximity.roster.updated", (data: RosterUpdate) => {
      if (isAdvancedRosterUpdate(data)) {
        // Advanced format from AI service includes full user details
        console.warn("[Proximity] Received advanced roster:", data.nearbyUsers.length, "nearby users");
        const nearbyUsers: NearbyUser[] = data.nearbyUsers.map((nu) => ({
          id: nu.user.id,
          name: nu.user.name,
          avatarUrl: nu.user.avatarUrl,
          distance: nu.distance,
          sharedInterests: nu.sharedInterests,
        }));
        setState((prev) => ({ ...prev, nearbyUsers }));
      } else {
        // Simple format from basic proximity search - only user IDs available
        // Backend sends this format from Redis GEO search before AI enrichment
        // Display as "Nearby Attendee" until AI service provides enriched data
        console.warn("[Proximity] Received roster update:", data.nearbyUserIds.length, "nearby users");
        const nearbyUsers: NearbyUser[] = data.nearbyUserIds.map((id, index) => ({
          id,
          name: `Nearby Attendee ${index + 1}`,
        }));
        setState((prev) => ({ ...prev, nearbyUsers }));
      }
    });

    // Listen for incoming pings
    newSocket.on(
      "proximity.ping.received",
      (data: { fromUser: { id: string; name: string }; message: string }) => {
        console.warn("[Proximity] Received ping from:", data.fromUser.name, "Message:", data.message);
        const ping: ProximityPing = {
          fromUser: data.fromUser,
          message: data.message,
          receivedAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          receivedPings: [ping, ...prev.receivedPings].slice(0, MAX_PINGS_HISTORY),
        }));
      }
    );

    // Error handling
    newSocket.on("systemError", (error: { message: string }) => {
      console.error("[Proximity] System error:", error);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Proximity] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("disconnect");
      newSocket.off("proximity.roster.updated");
      newSocket.off("proximity.ping.received");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, token]);

  // Send location update to server (uses ref to avoid stale closures)
  const sendLocationUpdate = useCallback((coords: LocationCoordinates) => {
    const currentSocket = socketRef.current;
    if (!currentSocket?.connected) {
      return;
    }

    const payload = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      idempotencyKey: generateUUID(),
    };

    console.warn("[Proximity] Sending location:", payload.latitude.toFixed(6), payload.longitude.toFixed(6));

    currentSocket.emit(
      "proximity.location.update",
      payload,
      (response: ProximityResponse) => {
        if (response?.success) {
          console.warn("[Proximity] Location sent successfully");
        } else {
          console.error("[Proximity] Location update failed:", response?.error);
        }
      }
    );

    lastLocationRef.current = coords;
    setState((prev) => ({ ...prev, lastLocation: coords }));
  }, []);

  // Handle geolocation position update
  const handlePositionUpdate = useCallback(
    (position: GeolocationPosition) => {
      const coords: LocationCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Only send update if location changed significantly (> 5 meters)
      if (lastLocationRef.current) {
        const distance = calculateDistance(
          lastLocationRef.current.latitude,
          lastLocationRef.current.longitude,
          coords.latitude,
          coords.longitude
        );
        if (distance < 5) {
          return; // Skip update if moved less than 5 meters
        }
      }

      sendLocationUpdate(coords);
    },
    [sendLocationUpdate]
  );

  // Handle geolocation error
  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    // For permission denied/unavailable, we use dedicated UI - no need for error message
    // Only set error for transient issues like timeout
    let errorMessage: string | null = null;
    let permission: ProximityState["locationPermission"] = "prompt";

    switch (error.code) {
      case error.PERMISSION_DENIED:
        permission = "denied";
        // No error message - UI shows dedicated permission denied warning
        break;
      case error.POSITION_UNAVAILABLE:
        permission = "unavailable";
        // No error message - UI shows dedicated unavailable warning
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out. Please try again.";
        break;
      default:
        errorMessage = "Failed to get location";
    }

    setState((prev) => ({
      ...prev,
      error: errorMessage,
      locationPermission: permission,
      isTracking: false,
    }));

    // Stop watching
    if (locationWatchId.current !== null) {
      navigator.geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
  }, []);

  // Start tracking location
  const startTracking = useCallback(async () => {
    if (!checkGeolocationSupport()) {
      return false;
    }

    // Reset permission state and error before trying
    // Don't preemptively block based on Permissions API - it can return stale data
    // Instead, let the actual geolocation request determine the real permission state
    setState((prev) => ({
      ...prev,
      isTracking: true,
      error: null,
      locationPermission: "prompt" // Reset to prompt, let geolocation API determine actual state
    }));

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Watch for position changes
    locationWatchId.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    // Also set up interval for regular updates even if position hasn't changed
    updateIntervalId.current = setInterval(() => {
      if (lastLocationRef.current) {
        sendLocationUpdate(lastLocationRef.current);
      }
    }, LOCATION_UPDATE_INTERVAL);

    return true;
  }, [
    checkGeolocationSupport,
    handlePositionUpdate,
    handlePositionError,
    sendLocationUpdate,
  ]);

  // Stop tracking location (SSR safe)
  const stopTracking = useCallback(() => {
    if (locationWatchId.current !== null && typeof window !== "undefined") {
      navigator.geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }

    if (updateIntervalId.current !== null) {
      clearInterval(updateIntervalId.current);
      updateIntervalId.current = null;
    }

    setState((prev) => ({
      ...prev,
      isTracking: false,
      nearbyUsers: [],
    }));
  }, []);

  // Send a ping to another user (uses ref to avoid stale closures)
  const sendPing = useCallback(
    async (targetUserId: string, message?: string): Promise<boolean> => {
      const currentSocket = socketRef.current;
      if (!currentSocket?.connected) {
        return false;
      }

      return new Promise((resolve) => {
        const payload = {
          targetUserId,
          message,
          idempotencyKey: generateUUID(),
        };

        console.warn("[Proximity] Sending ping to:", targetUserId, "Message:", message);
        currentSocket.emit("proximity.ping", payload, (response: ProximityResponse) => {
          if (response?.success) {
            console.warn("[Proximity] Ping sent successfully to:", targetUserId);
            resolve(true);
          } else {
            console.error("[Proximity] Ping failed:", response?.error);
            setState((prev) => ({
              ...prev,
              error: response?.error || "Failed to send ping",
            }));
            resolve(false);
          }
        });
      });
    },
    []
  );

  // Dismiss a ping notification
  const dismissPing = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      receivedPings: prev.receivedPings.filter((_, i) => i !== index),
    }));
  }, []);

  // Clear all pings
  const clearPings = useCallback(() => {
    setState((prev) => ({ ...prev, receivedPings: [] }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && state.isConnected && !state.isTracking) {
      startTracking();
    }
  }, [autoStart, state.isConnected, state.isTracking, startTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    // State
    nearbyUsers: state.nearbyUsers,
    receivedPings: state.receivedPings,
    isTracking: state.isTracking,
    isConnected: state.isConnected,
    error: state.error,
    locationPermission: state.locationPermission,
    lastLocation: state.lastLocation,
    currentUserId: user?.id,

    // Actions
    startTracking,
    stopTracking,
    sendPing,
    dismissPing,
    clearPings,
    clearError,
  };
};

// Haversine formula to calculate distance between two points in meters
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
