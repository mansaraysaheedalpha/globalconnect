// src/hooks/use-huddles.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import {
  HuddleInvitation,
  UserHuddle,
  Huddle,
  HuddleParticipantJoined,
  HuddleParticipantLeft,
  HuddleConfirmed,
  HuddleCancelled,
  HuddleResponseError,
  HuddleType,
} from "@/types/huddle";

// Generate UUID v4 using built-in crypto API
const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Max invitations to keep in memory
const MAX_INVITATIONS = 10;

// Play notification sound for huddle invitation
const playHuddleSound = () => {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Pleasant two-tone notification
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.15); // G5

    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.4
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch {
    // Audio not supported or blocked
  }
};

interface HuddlesState {
  invitations: HuddleInvitation[];
  myHuddles: UserHuddle[];
  activeHuddles: Huddle[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  respondingTo: string | null; // huddleId currently responding to
}

interface UseHuddlesOptions {
  eventId: string;
  autoConnect?: boolean;
}

interface CreateHuddleParams {
  topic: string;
  problemStatement?: string;
  description?: string;
  sessionId?: string;
  locationName?: string;
  locationDetails?: string;
  scheduledAt: string | Date;
  duration?: number;
  huddleType?: HuddleType;
  minParticipants?: number;
  maxParticipants?: number;
}

interface SocketResponse {
  success: boolean;
  error?: string;
  huddleId?: string;
  huddles?: Huddle[];
  invited?: string[];
  alreadyInvited?: string[];
}

export const useHuddles = ({
  eventId,
  autoConnect = true,
}: UseHuddlesOptions) => {
  const [state, setState] = useState<HuddlesState>({
    invitations: [],
    myHuddles: [],
    activeHuddles: [],
    isConnected: false,
    isLoading: false,
    error: null,
    respondingTo: null,
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
      console.log("[Huddles] Connected to server");
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false }));
      console.log("[Huddles] Disconnected from server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Huddles] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Listen for huddle invitations
    newSocket.on("huddle.invitation", (data: HuddleInvitation) => {
      playHuddleSound();
      setState((prev) => ({
        ...prev,
        invitations: [data, ...prev.invitations].slice(0, MAX_INVITATIONS),
      }));
    });

    // Listen for participant joined
    newSocket.on("huddle.participant_joined", (data: HuddleParticipantJoined) => {
      setState((prev) => ({
        ...prev,
        myHuddles: prev.myHuddles.map((h) =>
          h.id === data.huddleId
            ? { ...h, currentParticipants: data.totalConfirmed }
            : h
        ),
        activeHuddles: prev.activeHuddles.map((h) =>
          h.id === data.huddleId
            ? { ...h, currentParticipants: data.totalConfirmed }
            : h
        ),
      }));
    });

    // Listen for participant left
    newSocket.on("huddle.participant_left", (data: HuddleParticipantLeft) => {
      setState((prev) => ({
        ...prev,
        myHuddles: prev.myHuddles.map((h) =>
          h.id === data.huddleId
            ? { ...h, currentParticipants: data.totalConfirmed }
            : h
        ),
        activeHuddles: prev.activeHuddles.map((h) =>
          h.id === data.huddleId
            ? { ...h, currentParticipants: data.totalConfirmed }
            : h
        ),
      }));
    });

    // Listen for huddle confirmed
    newSocket.on("huddle.confirmed", (data: HuddleConfirmed) => {
      setState((prev) => ({
        ...prev,
        myHuddles: prev.myHuddles.map((h) =>
          h.id === data.huddleId ? { ...h, status: "CONFIRMED" } : h
        ),
        activeHuddles: prev.activeHuddles.map((h) =>
          h.id === data.huddleId ? { ...h, status: "CONFIRMED" } : h
        ),
      }));
    });

    // Listen for huddle started
    newSocket.on("huddle.started", (data: { huddleId: string }) => {
      setState((prev) => ({
        ...prev,
        myHuddles: prev.myHuddles.map((h) =>
          h.id === data.huddleId ? { ...h, status: "IN_PROGRESS" } : h
        ),
      }));
    });

    // Listen for huddle completed
    newSocket.on("huddle.completed", (data: { huddleId: string }) => {
      setState((prev) => ({
        ...prev,
        myHuddles: prev.myHuddles.map((h) =>
          h.id === data.huddleId ? { ...h, status: "COMPLETED" } : h
        ),
        activeHuddles: prev.activeHuddles.filter((h) => h.id !== data.huddleId),
      }));
    });

    // Listen for huddle cancelled
    newSocket.on("huddle.cancelled", (data: HuddleCancelled) => {
      setState((prev) => ({
        ...prev,
        invitations: prev.invitations.filter((i) => i.huddleId !== data.huddleId),
        myHuddles: prev.myHuddles.map((h) =>
          h.id === data.huddleId ? { ...h, status: "CANCELLED" } : h
        ),
        activeHuddles: prev.activeHuddles.filter((h) => h.id !== data.huddleId),
      }));
    });

    // Listen for response errors (e.g., huddle full)
    newSocket.on("huddle.response_error", (data: HuddleResponseError) => {
      console.error("[Huddles] Response error:", data);
      setState((prev) => ({
        ...prev,
        error: data.message || data.error,
        respondingTo: null,
      }));
    });

    // Listen for new huddle created (for event-wide broadcast)
    newSocket.on(
      "huddle.created",
      (data: Omit<Huddle, "id"> & { huddleId: string }) => {
        const newHuddle: Huddle = {
          ...data,
          id: data.huddleId,
          status: "FORMING",
        } as Huddle;

        setState((prev) => ({
          ...prev,
          activeHuddles: [newHuddle, ...prev.activeHuddles],
        }));
      }
    );

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("huddle.invitation");
      newSocket.off("huddle.participant_joined");
      newSocket.off("huddle.participant_left");
      newSocket.off("huddle.confirmed");
      newSocket.off("huddle.started");
      newSocket.off("huddle.completed");
      newSocket.off("huddle.cancelled");
      newSocket.off("huddle.response_error");
      newSocket.off("huddle.created");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, token, autoConnect]);

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

  // Create a new huddle
  const createHuddle = useCallback(
    async (params: CreateHuddleParams): Promise<string | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await emitWithCallback<SocketResponse>("huddle.create", {
          ...params,
          eventId: eventIdRef.current,
          scheduledAt:
            params.scheduledAt instanceof Date
              ? params.scheduledAt.toISOString()
              : params.scheduledAt,
          idempotencyKey: generateUUID(),
        });

        setState((prev) => ({ ...prev, isLoading: false }));
        return response.huddleId || null;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create huddle";
        console.error("[Huddles] Create error:", message);
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        return null;
      }
    },
    [emitWithCallback]
  );

  // Accept a huddle invitation
  const acceptInvitation = useCallback(
    async (huddleId: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, respondingTo: huddleId }));

      try {
        await emitWithCallback("huddle.respond", {
          huddleId,
          response: "accept",
        });

        // Remove from invitations and update local state
        setState((prev) => ({
          ...prev,
          invitations: prev.invitations.filter((i) => i.huddleId !== huddleId),
          respondingTo: null,
        }));

        // Fetch updated user huddles
        await fetchMyHuddles();
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to accept invitation";
        console.error("[Huddles] Accept error:", message);
        setState((prev) => ({
          ...prev,
          error: message,
          respondingTo: null,
        }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Decline a huddle invitation
  const declineInvitation = useCallback(
    async (huddleId: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, respondingTo: huddleId }));

      try {
        await emitWithCallback("huddle.respond", {
          huddleId,
          response: "decline",
        });

        setState((prev) => ({
          ...prev,
          invitations: prev.invitations.filter((i) => i.huddleId !== huddleId),
          respondingTo: null,
        }));

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to decline invitation";
        console.error("[Huddles] Decline error:", message);
        setState((prev) => ({
          ...prev,
          error: message,
          respondingTo: null,
        }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Leave a huddle
  const leaveHuddle = useCallback(
    async (huddleId: string): Promise<boolean> => {
      try {
        await emitWithCallback("huddle.leave", { huddleId });

        setState((prev) => ({
          ...prev,
          myHuddles: prev.myHuddles.filter((h) => h.id !== huddleId),
        }));

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to leave huddle";
        console.error("[Huddles] Leave error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Invite users to a huddle
  const inviteUsers = useCallback(
    async (
      huddleId: string,
      userIds: string[]
    ): Promise<{ invited: string[]; alreadyInvited: string[] } | null> => {
      try {
        const response = await emitWithCallback<SocketResponse>("huddle.invite", {
          huddleId,
          userIds,
        });

        return {
          invited: response.invited || [],
          alreadyInvited: response.alreadyInvited || [],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to invite users";
        console.error("[Huddles] Invite error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return null;
      }
    },
    [emitWithCallback]
  );

  // Start a huddle (creator only)
  const startHuddle = useCallback(
    async (huddleId: string): Promise<boolean> => {
      try {
        await emitWithCallback("huddle.start", { huddleId });
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to start huddle";
        console.error("[Huddles] Start error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Complete a huddle (creator only)
  const completeHuddle = useCallback(
    async (huddleId: string): Promise<boolean> => {
      try {
        await emitWithCallback("huddle.complete", { huddleId });
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to complete huddle";
        console.error("[Huddles] Complete error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Cancel a huddle (creator only)
  const cancelHuddle = useCallback(
    async (huddleId: string, reason?: string): Promise<boolean> => {
      try {
        await emitWithCallback("huddle.cancel", { huddleId, reason });
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to cancel huddle";
        console.error("[Huddles] Cancel error:", message);
        setState((prev) => ({ ...prev, error: message }));
        return false;
      }
    },
    [emitWithCallback]
  );

  // Fetch active huddles for the event
  const fetchActiveHuddles = useCallback(async (): Promise<void> => {
    try {
      const response = await emitWithCallback<
        SocketResponse & { huddles: Huddle[] }
      >("huddle.list", {
        eventId: eventIdRef.current,
      });

      setState((prev) => ({
        ...prev,
        activeHuddles: response.huddles || [],
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch huddles";
      console.error("[Huddles] Fetch active error:", message);
    }
  }, [emitWithCallback]);

  // Fetch user's huddles
  const fetchMyHuddles = useCallback(async (): Promise<void> => {
    try {
      const response = await emitWithCallback<
        SocketResponse & { huddles: UserHuddle[] }
      >("huddle.my", {
        eventId: eventIdRef.current,
      });

      setState((prev) => ({
        ...prev,
        myHuddles: response.huddles || [],
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch my huddles";
      console.error("[Huddles] Fetch my error:", message);
    }
  }, [emitWithCallback]);

  // Dismiss an invitation
  const dismissInvitation = useCallback((huddleId: string) => {
    setState((prev) => ({
      ...prev,
      invitations: prev.invitations.filter((i) => i.huddleId !== huddleId),
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Fetch initial data when connected
  useEffect(() => {
    if (state.isConnected) {
      fetchMyHuddles();
      fetchActiveHuddles();
    }
  }, [state.isConnected, fetchMyHuddles, fetchActiveHuddles]);

  return {
    // State
    invitations: state.invitations,
    myHuddles: state.myHuddles,
    activeHuddles: state.activeHuddles,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,
    respondingTo: state.respondingTo,
    currentUserId: user?.id,

    // Actions
    createHuddle,
    acceptInvitation,
    declineInvitation,
    leaveHuddle,
    inviteUsers,
    startHuddle,
    completeHuddle,
    cancelHuddle,
    fetchActiveHuddles,
    fetchMyHuddles,
    dismissInvitation,
    clearError,
  };
};
