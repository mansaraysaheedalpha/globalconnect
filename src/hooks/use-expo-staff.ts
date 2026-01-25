// src/hooks/use-expo-staff.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import {
  ExpoBooth,
  BoothVideoSession,
  BoothAnalytics,
  StaffPresenceStatus,
} from "@/components/features/expo/types";

interface VideoRequest {
  sessionId: string;
  attendeeId: string;
  attendeeName: string;
  message?: string;
  requestedAt: string;
}

interface BoothVisitor {
  visitorId: string;
  visitorName: string;
  visitId: string;
  enteredAt: string;
}

interface LeadCapture {
  visitorId: string;
  visitorName: string;
  formData: Record<string, unknown>;
  capturedAt: string;
}

interface ExpoStaffState {
  booth: ExpoBooth | null;
  analytics: BoothAnalytics | null;
  pendingVideoRequests: VideoRequest[];
  activeVideoSession: BoothVideoSession | null;
  currentVisitors: BoothVisitor[];
  recentLeads: LeadCapture[];
  myStatus: StaffPresenceStatus;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseExpoStaffOptions {
  boothId: string;
  eventId: string;
  autoConnect?: boolean;
}

interface SocketResponse {
  success: boolean;
  error?: string;
  pendingRequests?: VideoRequest[];
  session?: BoothVideoSession;
  stats?: BoothAnalytics;
}

// Play notification sound for new requests
const playNotificationSound = () => {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Two-tone notification
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

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

export const useExpoStaff = ({
  boothId,
  eventId,
  autoConnect = true,
}: UseExpoStaffOptions) => {
  const [state, setState] = useState<ExpoStaffState>({
    booth: null,
    analytics: null,
    pendingVideoRequests: [],
    activeVideoSession: null,
    currentVisitors: [],
    recentLeads: [],
    myStatus: "OFFLINE",
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const boothIdRef = useRef(boothId);

  // Keep boothId ref in sync
  useEffect(() => {
    boothIdRef.current = boothId;
  }, [boothId]);

  // Initialize socket connection
  useEffect(() => {
    if (!boothId || !eventId || !token || !autoConnect) {
      return;
    }

    const realtimeUrl =
      `${process.env.NEXT_PUBLIC_REALTIME_SERVICE_URL || "http://localhost:3002"}/events`;

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { eventId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", async () => {
      console.log("[ExpoStaff] Connected to server");
      setState((prev) => ({ ...prev, isConnected: true, error: null }));

      // Auto-join as staff to receive visitor and lead events
      try {
        const response = await new Promise<{ success: boolean; pendingRequests?: VideoRequest[] }>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Join timeout")), 10000);

          newSocket.emit("expo.booth.staff.join", { boothId }, (response: { success: boolean; pendingRequests?: VideoRequest[] }) => {
            clearTimeout(timeout);
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error("Failed to join as staff"));
            }
          });
        });

        setState((prev) => ({
          ...prev,
          pendingVideoRequests: response.pendingRequests || [],
          myStatus: "ONLINE",
        }));

        console.log("[ExpoStaff] Joined as staff successfully");

        // Fetch initial analytics with visitors list and leads
        try {
          const [analyticsResponse, leadsResponse] = await Promise.all([
            new Promise<{ success: boolean; stats?: any }>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error("Analytics timeout")), 10000);

              newSocket.emit("expo.booth.analytics", { boothId }, (response: { success: boolean; stats?: any }) => {
                clearTimeout(timeout);
                if (response.success) {
                  resolve(response);
                } else {
                  reject(new Error("Failed to fetch analytics"));
                }
              });
            }),
            new Promise<{ success: boolean; leads?: LeadCapture[] }>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error("Leads timeout")), 10000);

              newSocket.emit("expo.booth.leads", { boothId, limit: 50 }, (response: { success: boolean; leads?: LeadCapture[] }) => {
                clearTimeout(timeout);
                if (response.success) {
                  resolve(response);
                } else {
                  reject(new Error("Failed to fetch leads"));
                }
              });
            }),
          ]);

          const updates: Partial<ExpoStaffState> = {};

          if (analyticsResponse.stats) {
            const stats = analyticsResponse.stats;
            const visitors = stats.visitors || [];

            updates.analytics = stats;
            updates.currentVisitors = visitors.map((v: any) => ({
              visitorId: v.userId,
              visitorName: v.userId, // Will be populated from real-time events
              visitId: v.userId,
              enteredAt: v.enteredAt,
            }));

            console.log("[ExpoStaff] Fetched initial analytics and visitors:", visitors.length);
          }

          if (leadsResponse.leads) {
            updates.recentLeads = leadsResponse.leads;
            console.log("[ExpoStaff] Fetched initial leads:", leadsResponse.leads.length);
          }

          setState((prev) => ({ ...prev, ...updates }));
        } catch (error) {
          console.error("[ExpoStaff] Failed to fetch initial data:", error);
        }
      } catch (error) {
        console.error("[ExpoStaff] Failed to join as staff:", error);
      }
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false, myStatus: "OFFLINE" }));
      console.log("[ExpoStaff] Disconnected from server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("[ExpoStaff] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Listen for new video requests
    newSocket.on(
      "expo.booth.video.requested",
      (data: VideoRequest) => {
        playNotificationSound();
        setState((prev) => ({
          ...prev,
          pendingVideoRequests: [...prev.pendingVideoRequests, data],
        }));
      }
    );

    // Listen for visitor entered
    newSocket.on(
      "expo.booth.visitor.entered",
      (data: BoothVisitor) => {
        setState((prev) => ({
          ...prev,
          currentVisitors: [...prev.currentVisitors, { ...data, enteredAt: new Date().toISOString() }],
        }));
      }
    );

    // Listen for visitor count updates
    newSocket.on(
      "expo.booth.visitors.update",
      (data: { boothId: string; visitorCount: number }) => {
        if (data.boothId === boothIdRef.current) {
          setState((prev) => ({
            ...prev,
            analytics: prev.analytics
              ? { ...prev.analytics, currentVisitors: data.visitorCount }
              : null,
          }));
        }
      }
    );

    // Listen for new leads
    newSocket.on(
      "expo.booth.lead.captured",
      (data: { visitorId: string; visitorName: string; formData: Record<string, unknown> }) => {
        playNotificationSound();
        setState((prev) => ({
          ...prev,
          recentLeads: [
            { ...data, capturedAt: new Date().toISOString() },
            ...prev.recentLeads.slice(0, 49), // Keep last 50
          ],
          analytics: prev.analytics
            ? { ...prev.analytics, totalLeads: prev.analytics.totalLeads + 1 }
            : null,
        }));
      }
    );

    // Listen for video session ended
    newSocket.on(
      "expo.booth.video.ended",
      (data: { sessionId: string }) => {
        setState((prev) => {
          if (prev.activeVideoSession?.id === data.sessionId) {
            return { ...prev, activeVideoSession: null };
          }
          return prev;
        });
      }
    );

    // Listen for chat messages (for notification count)
    newSocket.on(
      "expo.booth.chat.message",
      () => {
        setState((prev) => ({
          ...prev,
          analytics: prev.analytics
            ? { ...prev.analytics, totalChatMessages: prev.analytics.totalChatMessages + 1 }
            : null,
        }));
      }
    );

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("expo.booth.video.requested");
      newSocket.off("expo.booth.visitor.entered");
      newSocket.off("expo.booth.visitors.update");
      newSocket.off("expo.booth.lead.captured");
      newSocket.off("expo.booth.video.ended");
      newSocket.off("expo.booth.chat.message");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [boothId, eventId, token, autoConnect]);

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

  // Join booth as staff
  const joinAsStaff = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await emitWithCallback<
        SocketResponse & { pendingRequests: VideoRequest[] }
      >("expo.booth.staff.join", {
        boothId: boothIdRef.current,
      });

      setState((prev) => ({
        ...prev,
        pendingVideoRequests: response.pendingRequests || [],
        myStatus: "ONLINE",
        isLoading: false,
      }));

      // Fetch initial analytics
      await fetchAnalytics();

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join as staff";
      console.error("[ExpoStaff] Join error:", message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return false;
    }
  }, [emitWithCallback]);

  // Update status
  const updateStatus = useCallback(
    async (status: StaffPresenceStatus): Promise<boolean> => {
      try {
        await emitWithCallback("expo.booth.staff.status", {
          boothId: boothIdRef.current,
          status,
        });

        setState((prev) => ({ ...prev, myStatus: status }));
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update status";
        console.error("[ExpoStaff] Status update error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Accept video call
  const acceptVideoCall = useCallback(
    async (sessionId: string): Promise<BoothVideoSession | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await emitWithCallback<
          SocketResponse & { session: BoothVideoSession & { token: string } }
        >("expo.booth.video.accept", {
          sessionId,
        });

        // Remove from pending requests
        setState((prev) => ({
          ...prev,
          pendingVideoRequests: prev.pendingVideoRequests.filter(
            (r) => r.sessionId !== sessionId
          ),
          activeVideoSession: response.session,
          myStatus: "BUSY",
          isLoading: false,
        }));

        return response.session;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to accept video call";
        console.error("[ExpoStaff] Accept video error:", message);
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        return null;
      }
    },
    [emitWithCallback]
  );

  // Decline video call
  const declineVideoCall = useCallback(
    async (sessionId: string, reason?: string): Promise<boolean> => {
      try {
        await emitWithCallback("expo.booth.video.decline", {
          sessionId,
          reason,
        });

        setState((prev) => ({
          ...prev,
          pendingVideoRequests: prev.pendingVideoRequests.filter(
            (r) => r.sessionId !== sessionId
          ),
        }));

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to decline video call";
        console.error("[ExpoStaff] Decline video error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // End video call
  const endVideoCall = useCallback(async (): Promise<boolean> => {
    if (!state.activeVideoSession) return false;

    try {
      await emitWithCallback("expo.booth.video.end", {
        sessionId: state.activeVideoSession.id,
      });

      setState((prev) => ({
        ...prev,
        activeVideoSession: null,
        myStatus: "ONLINE",
      }));

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to end video call";
      console.error("[ExpoStaff] End video error:", message);
      setState((prev) => ({ ...prev, error: message }));
      return false;
    }
  }, [emitWithCallback, state.activeVideoSession]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async (): Promise<BoothAnalytics | null> => {
    try {
      const response = await emitWithCallback<
        SocketResponse & { stats: BoothAnalytics }
      >("expo.booth.analytics", {
        boothId: boothIdRef.current,
      });

      setState((prev) => ({
        ...prev,
        analytics: response.stats,
      }));

      return response.stats;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch analytics";
      console.error("[ExpoStaff] Fetch analytics error:", message);
      return null;
    }
  }, [emitWithCallback]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Note: Auto-join is now handled in the socket connect event handler
  // to ensure staff room is joined and initial data is fetched immediately

  // Periodic analytics refresh
  useEffect(() => {
    if (!state.isConnected || state.myStatus === "OFFLINE") return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [state.isConnected, state.myStatus, fetchAnalytics]);

  return {
    // State
    booth: state.booth,
    analytics: state.analytics,
    pendingVideoRequests: state.pendingVideoRequests,
    activeVideoSession: state.activeVideoSession,
    currentVisitors: state.currentVisitors,
    recentLeads: state.recentLeads,
    myStatus: state.myStatus,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,
    currentUserId: user?.id,

    // Actions
    joinAsStaff,
    updateStatus,
    acceptVideoCall,
    declineVideoCall,
    endVideoCall,
    fetchAnalytics,
    clearError,
  };
};
