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
  const [socket, setSocket] = useState<Socket | null>(null);
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

  // Check if geolocation is available
  const checkGeolocationSupport = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        locationPermission: "unavailable",
        error: "Geolocation is not supported by your browser",
      }));
      return false;
    }
    return true;
  }, []);

  // Check current permission status
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      return "prompt" as const;
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state as "granted" | "denied" | "prompt";
    } catch {
      return "prompt" as const;
    }
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

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", () => {
      setState((prev) => ({ ...prev, isJoined: true }));
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isJoined: false,
      }));
    });

    // Listen for roster updates (nearby users)
    newSocket.on("proximity.roster.updated", (data: RosterUpdate) => {
      if (isAdvancedRosterUpdate(data)) {
        // Advanced format with full user details
        const nearbyUsers: NearbyUser[] = data.nearbyUsers.map((nu) => ({
          id: nu.user.id,
          name: nu.user.name,
          avatarUrl: nu.user.avatarUrl,
          distance: nu.distance,
          sharedInterests: nu.sharedInterests,
        }));
        setState((prev) => ({ ...prev, nearbyUsers }));
      } else {
        // Simple format - just user IDs
        // We'll need to fetch user details separately or show IDs
        const nearbyUsers: NearbyUser[] = data.nearbyUserIds.map((id) => ({
          id,
          name: "Attendee", // Will be enriched by UI if needed
        }));
        setState((prev) => ({ ...prev, nearbyUsers }));
      }
    });

    // Listen for incoming pings
    newSocket.on(
      "proximity.ping.received",
      (data: { fromUser: { id: string; name: string }; message: string }) => {
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
    };
  }, [eventId, token]);

  // Send location update to server
  const sendLocationUpdate = useCallback(
    (coords: LocationCoordinates) => {
      if (!socket || !state.isConnected) {
        return;
      }

      const payload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        idempotencyKey: generateUUID(),
      };

      socket.emit(
        "proximity.location.update",
        payload,
        (response: ProximityResponse) => {
          if (!response?.success) {
            console.error("[Proximity] Location update failed:", response?.error);
          }
        }
      );

      lastLocationRef.current = coords;
      setState((prev) => ({ ...prev, lastLocation: coords }));
    },
    [socket, state.isConnected]
  );

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
    let errorMessage = "Failed to get location";
    let permission: ProximityState["locationPermission"] = "denied";

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location permission denied";
        permission = "denied";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location unavailable";
        permission = "unavailable";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out";
        break;
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

    const permission = await checkPermission();
    setState((prev) => ({ ...prev, locationPermission: permission }));

    if (permission === "denied") {
      setState((prev) => ({
        ...prev,
        error: "Location permission was denied. Please enable it in your browser settings.",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isTracking: true, error: null }));

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
    checkPermission,
    handlePositionUpdate,
    handlePositionError,
    sendLocationUpdate,
  ]);

  // Stop tracking location
  const stopTracking = useCallback(() => {
    if (locationWatchId.current !== null) {
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

  // Send a ping to another user
  const sendPing = useCallback(
    async (targetUserId: string, message?: string): Promise<boolean> => {
      if (!socket || !state.isConnected) {
        return false;
      }

      return new Promise((resolve) => {
        const payload = {
          targetUserId,
          message,
          idempotencyKey: generateUUID(),
        };

        socket.emit("proximity.ping", payload, (response: ProximityResponse) => {
          if (response?.success) {
            resolve(true);
          } else {
            setState((prev) => ({
              ...prev,
              error: response?.error || "Failed to send ping",
            }));
            resolve(false);
          }
        });
      });
    },
    [socket, state.isConnected]
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
