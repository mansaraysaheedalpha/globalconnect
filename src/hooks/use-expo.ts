// src/hooks/use-expo.ts
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import {
  ExpoHall,
  ExpoBooth,
  BoothVisit,
  BoothVideoSession,
  BoothStaffPresence,
  BoothAnalytics,
} from "@/components/features/expo/types";

interface ExpoState {
  hall: ExpoHall | null;
  currentBooth: ExpoBooth | null;
  currentVisit: BoothVisit | null;
  videoSession: BoothVideoSession | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseExpoOptions {
  eventId: string;
  autoConnect?: boolean;
}

interface SocketResponse {
  success: boolean;
  error?: string;
  hall?: ExpoHall;
  booth?: ExpoBooth;
  visitId?: string;
  session?: BoothVideoSession;
  stats?: BoothAnalytics;
}

export const useExpo = ({ eventId, autoConnect = true }: UseExpoOptions) => {
  const [state, setState] = useState<ExpoState>({
    hall: null,
    currentBooth: null,
    currentVisit: null,
    videoSession: null,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const eventIdRef = useRef(eventId);

  // Keep eventId ref in sync
  useEffect(() => {
    eventIdRef.current = eventId;
  }, [eventId]);

  // Initialize socket connection
  useEffect(() => {
    if (!eventId || !token || !autoConnect) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { eventId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
      console.log("[Expo] Connected to server");
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false }));
      console.log("[Expo] Disconnected from server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Expo] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Listen for visitor count updates
    newSocket.on(
      "expo.booth.visitors.update",
      (data: { boothId: string; visitorCount: number }) => {
        setState((prev) => {
          if (!prev.hall) return prev;

          return {
            ...prev,
            hall: {
              ...prev.hall,
              booths: prev.hall.booths.map((b) =>
                b.id === data.boothId
                  ? { ...b, _count: { ...b._count, visits: data.visitorCount } }
                  : b
              ),
            },
            currentBooth:
              prev.currentBooth?.id === data.boothId
                ? {
                    ...prev.currentBooth,
                    _count: { ...prev.currentBooth._count, visits: data.visitorCount },
                  }
                : prev.currentBooth,
          };
        });
      }
    );

    // Listen for staff availability updates
    newSocket.on(
      "expo.booth.staff.available",
      (data: { boothId: string; staff: BoothStaffPresence[] }) => {
        setState((prev) => {
          if (!prev.hall) return prev;

          return {
            ...prev,
            hall: {
              ...prev.hall,
              booths: prev.hall.booths.map((b) =>
                b.id === data.boothId ? { ...b, staffPresence: data.staff } : b
              ),
            },
            currentBooth:
              prev.currentBooth?.id === data.boothId
                ? { ...prev.currentBooth, staffPresence: data.staff }
                : prev.currentBooth,
          };
        });
      }
    );

    // Listen for video call accepted
    newSocket.on("expo.booth.video.accepted", (data: BoothVideoSession & { attendeeToken: string }) => {
      if (data.attendeeId === user?.id) {
        setState((prev) => ({
          ...prev,
          videoSession: { ...data, token: data.attendeeToken },
        }));
      }
    });

    // Listen for video call declined
    newSocket.on(
      "expo.booth.video.declined",
      (data: { sessionId: string; reason?: string }) => {
        setState((prev) => {
          if (prev.videoSession?.id === data.sessionId) {
            return { ...prev, videoSession: null, error: data.reason || "Video request declined" };
          }
          return prev;
        });
      }
    );

    // Listen for video call ended
    newSocket.on("expo.booth.video.ended", (data: { sessionId: string }) => {
      setState((prev) => {
        if (prev.videoSession?.id === data.sessionId) {
          return { ...prev, videoSession: null };
        }
        return prev;
      });
    });

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("expo.booth.visitors.update");
      newSocket.off("expo.booth.staff.available");
      newSocket.off("expo.booth.video.accepted");
      newSocket.off("expo.booth.video.declined");
      newSocket.off("expo.booth.video.ended");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, token, autoConnect, user?.id]);

  // Helper to emit socket events with callback
  const emitWithCallback = useCallback(
    <T extends SocketResponse>(
      event: string,
      payload: Record<string, unknown>
    ): Promise<T> => {
      return new Promise((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket?.connected) {
          reject(new Error("Not connected to server"));
          return;
        }

        socket.emit(event, payload, (response: T) => {
          if (response?.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || "Unknown error"));
          }
        });
      });
    },
    []
  );

  // Enter expo hall
  const enterHall = useCallback(async (): Promise<ExpoHall | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await emitWithCallback<SocketResponse>("expo.enter", {
        eventId: eventIdRef.current,
      });

      setState((prev) => ({
        ...prev,
        hall: response.hall || null,
        isLoading: false,
      }));

      return response.hall || null;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to enter expo hall";
      console.error("[Expo] Enter hall error:", message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, [emitWithCallback]);

  // Leave expo hall
  const leaveHall = useCallback(async (): Promise<boolean> => {
    try {
      await emitWithCallback("expo.leave", {
        eventId: eventIdRef.current,
      });

      setState((prev) => ({
        ...prev,
        hall: null,
        currentBooth: null,
        currentVisit: null,
      }));

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to leave expo hall";
      console.error("[Expo] Leave hall error:", message);
      return false;
    }
  }, [emitWithCallback]);

  // Enter a booth
  const enterBooth = useCallback(
    async (boothId: string): Promise<ExpoBooth | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await emitWithCallback<
          SocketResponse & { visitId: string }
        >("expo.booth.enter", {
          boothId,
          eventId: eventIdRef.current,
        });

        setState((prev) => ({
          ...prev,
          currentBooth: response.booth || null,
          currentVisit: response.visitId
            ? {
                id: response.visitId,
                boothId,
                userId: user?.id || "",
                eventId: eventIdRef.current,
                enteredAt: new Date().toISOString(),
                exitedAt: null,
                status: "BROWSING",
                durationSeconds: 0,
                leadCaptured: false,
              }
            : null,
          isLoading: false,
        }));

        return response.booth || null;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to enter booth";
        console.error("[Expo] Enter booth error:", message);
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        return null;
      }
    },
    [emitWithCallback, user?.id]
  );

  // Leave a booth
  const leaveBooth = useCallback(async (): Promise<boolean> => {
    if (!state.currentBooth) return false;

    try {
      await emitWithCallback("expo.booth.leave", {
        boothId: state.currentBooth.id,
      });

      setState((prev) => ({
        ...prev,
        currentBooth: null,
        currentVisit: null,
      }));

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to leave booth";
      console.error("[Expo] Leave booth error:", message);
      setState((prev) => ({ ...prev, error: message }));
      return false;
    }
  }, [emitWithCallback, state.currentBooth]);

  // Request video call with staff
  const requestVideoCall = useCallback(
    async (boothId: string, message?: string): Promise<BoothVideoSession | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await emitWithCallback<
          SocketResponse & { session: BoothVideoSession }
        >("expo.booth.video.request", {
          boothId,
          message,
        });

        setState((prev) => ({
          ...prev,
          videoSession: response.session,
          isLoading: false,
        }));

        return response.session;
      } catch (error) {
        const message_error =
          error instanceof Error ? error.message : "Failed to request video call";
        console.error("[Expo] Request video error:", message_error);
        setState((prev) => ({ ...prev, isLoading: false, error: message_error }));
        return null;
      }
    },
    [emitWithCallback]
  );

  // Cancel video call request
  const cancelVideoRequest = useCallback(async (): Promise<boolean> => {
    if (!state.videoSession) return false;

    try {
      await emitWithCallback("expo.booth.video.end", {
        sessionId: state.videoSession.id,
      });

      setState((prev) => ({ ...prev, videoSession: null }));
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel video request";
      console.error("[Expo] Cancel video error:", message);
      return false;
    }
  }, [emitWithCallback, state.videoSession]);

  // End video call
  const endVideoCall = useCallback(async (): Promise<boolean> => {
    if (!state.videoSession) return false;

    try {
      await emitWithCallback("expo.booth.video.end", {
        sessionId: state.videoSession.id,
      });

      setState((prev) => ({ ...prev, videoSession: null }));
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to end video call";
      console.error("[Expo] End video error:", message);
      return false;
    }
  }, [emitWithCallback, state.videoSession]);

  // Track resource download
  const trackResourceDownload = useCallback(
    async (boothId: string, resourceId: string): Promise<boolean> => {
      try {
        await emitWithCallback("expo.booth.resource.download", {
          boothId,
          resourceId,
        });
        return true;
      } catch (error) {
        console.error("[Expo] Track download error:", error);
        return false;
      }
    },
    [emitWithCallback]
  );

  // Track CTA click
  const trackCtaClick = useCallback(
    async (boothId: string, ctaId: string): Promise<boolean> => {
      try {
        await emitWithCallback("expo.booth.cta.click", {
          boothId,
          ctaId,
        });
        return true;
      } catch (error) {
        console.error("[Expo] Track CTA error:", error);
        return false;
      }
    },
    [emitWithCallback]
  );

  // Capture lead
  const captureLead = useCallback(
    async (boothId: string, formData: Record<string, unknown>): Promise<boolean> => {
      try {
        await emitWithCallback("expo.booth.lead.capture", {
          boothId,
          formData,
        });
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to submit information";
        console.error("[Expo] Capture lead error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Computed: filtered booths by category
  const getBoothsByCategory = useMemo(() => {
    return (category: string | null) => {
      if (!state.hall) return [];
      if (!category) return state.hall.booths;
      return state.hall.booths.filter((b) => b.category === category);
    };
  }, [state.hall]);

  // Computed: booths with online staff
  const boothsWithOnlineStaff = useMemo(() => {
    if (!state.hall) return [];
    return state.hall.booths.filter((b) =>
      b.staffPresence.some((s) => s.status === "ONLINE")
    );
  }, [state.hall]);

  // Computed: categories from hall
  const categories = useMemo(() => {
    return state.hall?.categories || [];
  }, [state.hall]);

  return {
    // State
    hall: state.hall,
    booths: state.hall?.booths || [],
    currentBooth: state.currentBooth,
    currentVisit: state.currentVisit,
    videoSession: state.videoSession,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,
    currentUserId: user?.id,

    // Computed
    categories,
    boothsWithOnlineStaff,
    getBoothsByCategory,

    // Actions
    enterHall,
    leaveHall,
    enterBooth,
    leaveBooth,
    requestVideoCall,
    cancelVideoRequest,
    endVideoCall,
    trackResourceDownload,
    trackCtaClick,
    captureLead,
    clearError,
  };
};
