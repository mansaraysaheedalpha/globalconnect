// src/hooks/use-expo.ts
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/hooks/use-toast";
import {
  ExpoHall,
  ExpoBooth,
  BoothVisit,
  BoothVideoSession,
  BoothStaffPresence,
  BoothAnalytics,
  BoothQueueInfo,
  StaffAvailability,
} from "@/components/features/expo/types";

interface ExpoState {
  hall: ExpoHall | null;
  currentBooth: ExpoBooth | null;
  currentVisit: BoothVisit | null;
  videoSession: BoothVideoSession | null;
  queueInfo: BoothQueueInfo | null;
  videoStaffAvailability: StaffAvailability | null;
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

// Play notification sound when video call is accepted
const playVideoAcceptedSound = () => {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Pleasant ascending tone to indicate call connected
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.15); // C#5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.3); // E5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch {
    // Audio not supported
  }
};

export const useExpo = ({ eventId, autoConnect = true }: UseExpoOptions) => {
  const [state, setState] = useState<ExpoState>({
    hall: null,
    currentBooth: null,
    currentVisit: null,
    videoSession: null,
    queueInfo: null,
    videoStaffAvailability: null,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const { token, user } = useAuthStore();
  const { toast } = useToast();
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
      setState((prev) => {
        // Re-join booth room if we were in one (handles reconnection)
        if (prev.currentBooth) {
          console.log("[Expo] Reconnected, re-joining booth:", prev.currentBooth.id);
          newSocket.emit("expo.booth.join", { boothId: prev.currentBooth.id });
        }
        return { ...prev, isConnected: true, error: null };
      });
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

    // Listen for visitor count updates (includes queue info)
    newSocket.on(
      "expo.booth.visitors.update",
      (data: { boothId: string; visitorCount: number; queueCount?: number; maxVisitors?: number | null }) => {
        setState((prev) => {
          if (!prev.hall) return prev;

          const updateBoothCounts = (b: ExpoBooth) =>
            b.id === data.boothId
              ? {
                  ...b,
                  _count: {
                    ...b._count,
                    visits: data.visitorCount,
                    ...(data.queueCount !== undefined && { queueEntries: data.queueCount }),
                  },
                  ...(data.maxVisitors !== undefined && { maxVisitors: data.maxVisitors }),
                }
              : b;

          return {
            ...prev,
            hall: {
              ...prev.hall,
              booths: prev.hall.booths.map(updateBoothCounts),
            },
            currentBooth:
              prev.currentBooth?.id === data.boothId
                ? updateBoothCounts(prev.currentBooth) as ExpoBooth
                : prev.currentBooth,
          };
        });
      }
    );

    // Listen for queue admission - auto-enter booth when admitted
    newSocket.on(
      "expo.booth.queue.admitted",
      (data: { boothId: string; userId: string }) => {
        if (data.userId !== user?.id) return;

        // Clear queue info and re-emit enter to actually enter the booth
        setState((prev) => ({ ...prev, queueInfo: null }));

        const attemptEntry = (retryCount = 0) => {
          newSocket.emit("expo.booth.enter", {
            boothId: data.boothId,
            eventId: eventIdRef.current,
          }, (response: SocketResponse & { booth?: ExpoBooth; visitId?: string }) => {
            if (response?.success) {
              setState((prev) => ({
                ...prev,
                currentBooth: response.booth || null,
                currentVisit: response.visitId
                  ? {
                      id: response.visitId,
                      boothId: data.boothId,
                      userId: user?.id || "",
                      eventId: eventIdRef.current,
                      enteredAt: new Date().toISOString(),
                      exitedAt: null,
                      status: "BROWSING",
                      durationSeconds: 0,
                      leadCaptured: false,
                    }
                  : null,
              }));
              toast({
                title: "You're in!",
                description: "You've been admitted to the booth.",
              });
            } else if (retryCount < 2) {
              // Retry up to 2 times
              setTimeout(() => attemptEntry(retryCount + 1), 1000);
            } else {
              // Failed after retries
              toast({
                title: "Connection issue",
                description: "Couldn't enter booth. Please try joining the queue again.",
                variant: "destructive",
              });
            }
          });
        };

        attemptEntry();
      }
    );

    // Listen for queue size updates
    newSocket.on(
      "expo.booth.queue.update",
      (data: { boothId: string; queueSize: number }) => {
        setState((prev) => {
          // Update queue info if we're queued for this booth
          const updatedQueueInfo =
            prev.queueInfo?.isQueued
              ? { ...prev.queueInfo, queueSize: data.queueSize }
              : prev.queueInfo;

          return { ...prev, queueInfo: updatedQueueInfo };
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
      console.log("[Expo] Video accepted event received:", {
        dataAttendeeId: data.attendeeId,
        userId: user?.id,
        sessionId: data.id
      });

      // Check if this event is for us - match by attendeeId OR by pending session ID
      setState((prev) => {
        const isForMe = data.attendeeId === user?.id ||
                        (prev.videoSession?.id === data.id && prev.videoSession?.status === "REQUESTED");

        if (isForMe) {
          console.log("[Expo] Video call accepted, connecting...");
          playVideoAcceptedSound();
          return {
            ...prev,
            videoSession: { ...data, token: data.attendeeToken },
          };
        }
        return prev;
      });
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
      newSocket.off("expo.booth.queue.admitted");
      newSocket.off("expo.booth.queue.update");
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

  // Enter a booth (may result in queuing if at capacity)
  const enterBooth = useCallback(
    async (boothId: string): Promise<ExpoBooth | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await emitWithCallback<
          SocketResponse & {
            visitId?: string;
            queued?: boolean;
            queuePosition?: number;
            queueSize?: number;
          }
        >("expo.booth.enter", {
          boothId,
          eventId: eventIdRef.current,
        });

        if (response.queued) {
          // User was queued instead of entering
          setState((prev) => ({
            ...prev,
            queueInfo: {
              isQueued: true,
              queuePosition: response.queuePosition || 1,
              queueSize: response.queueSize || 1,
            },
            isLoading: false,
          }));
          return response.booth || null;
        }

        // User entered successfully
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
          queueInfo: null,
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

  // Leave the queue for a booth
  const leaveQueue = useCallback(
    async (boothId: string): Promise<boolean> => {
      try {
        await emitWithCallback("expo.booth.queue.leave", { boothId });
        setState((prev) => ({ ...prev, queueInfo: null }));
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to leave queue";
        console.error("[Expo] Leave queue error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Request video call with staff
  const requestVideoCall = useCallback(
    async (boothId: string, message?: string): Promise<BoothVideoSession | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await emitWithCallback<
          SocketResponse & {
            session: BoothVideoSession;
            staffAvailability?: StaffAvailability;
          }
        >("expo.booth.video.request", {
          boothId,
          message,
        });

        setState((prev) => ({
          ...prev,
          videoSession: response.session,
          videoStaffAvailability: response.staffAvailability || null,
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

  // Capture lead - calls REST API directly to write to PostgreSQL
  const captureLead = useCallback(
    async (boothId: string, formData: Record<string, unknown>): Promise<boolean> => {
      try {
        // Get sponsorId from the booth
        const booth = state.currentBooth?.id === boothId
          ? state.currentBooth
          : state.hall?.booths.find(b => b.id === boothId);

        if (!booth?.sponsorId) {
          throw new Error("Could not find sponsor for this booth");
        }

        const eventId = eventIdRef.current;
        const apiBaseUrl = process.env.NEXT_PUBLIC_EVENT_SERVICE_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL;

        if (!apiBaseUrl) {
          throw new Error("Event service URL not configured");
        }

        // Build the lead payload matching the API schema (SponsorLeadCreate)
        const leadPayload = {
          user_id: user?.id || `anon_${Date.now()}`, // User ID from auth or anonymous
          user_name: (formData.name as string) || null,
          user_email: (formData.email as string) || null,
          user_company: (formData.company as string) || null,
          user_title: (formData.jobTitle as string) || null,
          interaction_type: "booth_contact_form",
          interaction_metadata: {
            message: (formData.message as string) || null,
            phone: (formData.phone as string) || null,
            interests: formData.interests || null,
            marketing_consent: formData.marketingConsent || false,
            booth_id: boothId,
            booth_name: booth.name,
          },
        };

        // Call the REST API directly to write to PostgreSQL
        const response = await fetch(
          `${apiBaseUrl}/api/v1/sponsors/events/${eventId}/sponsors/${booth.sponsorId}/capture-lead`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(leadPayload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to capture lead: ${response.status}`);
        }

        console.log("[Expo] Lead captured successfully via REST API");
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to submit information";
        console.error("[Expo] Capture lead error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [state.currentBooth, state.hall?.booths, token, user]
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
    queueInfo: state.queueInfo,
    videoStaffAvailability: state.videoStaffAvailability,
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
    leaveQueue,
    requestVideoCall,
    cancelVideoRequest,
    endVideoCall,
    trackResourceDownload,
    trackCtaClick,
    captureLead,
    clearError,
  };
};
