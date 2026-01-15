// src/hooks/use-sponsors.ts
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import {
  Lead,
  LeadCapturedPayload,
  LeadIntentUpdatePayload,
  SponsorLeadsState,
  SponsorResponse,
} from "@/types/sponsor";

// Max leads to keep in memory
const MAX_LEADS = 100;

// Timeout for socket operations (ms)
const SOCKET_TIMEOUT = 10000;

// Validate lead captured payload
function isValidLeadPayload(data: unknown): data is LeadCapturedPayload {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    d.user !== null &&
    typeof d.user === "object" &&
    typeof (d.user as Record<string, unknown>).id === "string" &&
    typeof (d.user as Record<string, unknown>).name === "string" &&
    typeof d.action === "string" &&
    typeof d.timestamp === "string"
  );
}

// Validate intent update payload
function isValidIntentPayload(data: unknown): data is LeadIntentUpdatePayload {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.leadUserId === "string" &&
    typeof d.intentScore === "number" &&
    typeof d.latestAction === "string"
  );
}

// Play notification sound for new lead
const playLeadSound = () => {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Cash register sound - ascending tones
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
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

interface UseSponsorsOptions {
  eventId: string;
  autoConnect?: boolean;
}

export const useSponsors = ({
  eventId,
  autoConnect = true,
}: UseSponsorsOptions) => {
  const [state, setState] = useState<SponsorLeadsState>({
    leads: [],
    isConnected: false,
    isJoined: false,
    isLoading: false,
    error: null,
  });

  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const eventIdRef = useRef(eventId);

  // Keep eventIdRef in sync with eventId prop
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
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    newSocket.on("connect_error", (error) => {
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Listen for new lead captures with validation
    newSocket.on("lead.captured.new", (data: unknown) => {
      if (!isValidLeadPayload(data)) {
        return; // Silently ignore invalid payloads
      }

      playLeadSound();

      const newLead: Lead = {
        userId: data.user.id,
        userName: data.user.name,
        action: data.action,
        intentScore: 10, // Initial score
        timestamp: data.timestamp,
        actions: [{ action: data.action, timestamp: data.timestamp }],
      };

      setState((prev) => {
        // Check if lead already exists
        const existingIndex = prev.leads.findIndex(
          (l) => l.userId === data.user.id
        );

        if (existingIndex >= 0) {
          // Update existing lead with new action
          const updatedLeads = [...prev.leads];
          const existing = updatedLeads[existingIndex];
          updatedLeads[existingIndex] = {
            ...existing,
            action: data.action,
            timestamp: data.timestamp,
            actions: [
              { action: data.action, timestamp: data.timestamp },
              ...existing.actions,
            ].slice(0, 10), // Keep last 10 actions
          };
          return { ...prev, leads: updatedLeads };
        }

        // Add new lead
        return {
          ...prev,
          leads: [newLead, ...prev.leads].slice(0, MAX_LEADS),
        };
      });
    });

    // Listen for intent score updates with validation
    newSocket.on("lead.intent.updated", (data: unknown) => {
      if (!isValidIntentPayload(data)) {
        return; // Silently ignore invalid payloads
      }

      setState((prev) => ({
        ...prev,
        leads: prev.leads.map((lead) =>
          lead.userId === data.leadUserId
            ? {
                ...lead,
                intentScore: data.intentScore,
                action: data.latestAction,
                actions: [
                  {
                    action: data.latestAction,
                    timestamp: new Date().toISOString(),
                  },
                  ...lead.actions,
                ].slice(0, 10),
              }
            : lead
        ),
      }));
    });

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("lead.captured.new");
      newSocket.off("lead.intent.updated");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, token, autoConnect]);

  // Join the sponsor leads stream with timeout
  const joinLeadStream = useCallback(async (): Promise<boolean> => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      setState((prev) => ({ ...prev, error: "Not connected to server" }));
      return false;
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        setState((prev) => ({ ...prev, error: "Join request timed out" }));
        resolve(false);
      }, SOCKET_TIMEOUT);

      socket.emit(
        "sponsor.leads.join",
        {},
        (response: SponsorResponse) => {
          clearTimeout(timeoutId);
          if (response?.success) {
            setState((prev) => ({ ...prev, isJoined: true, error: null }));
            resolve(true);
          } else {
            const error = response?.error || "Failed to join lead stream";
            setState((prev) => ({ ...prev, error }));
            resolve(false);
          }
        }
      );
    });
  }, []);

  // Auto-join when connected
  useEffect(() => {
    if (state.isConnected && !state.isJoined && autoConnect) {
      joinLeadStream();
    }
  }, [state.isConnected, state.isJoined, autoConnect, joinLeadStream]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Get leads by intent level
  const getLeadsByIntent = useCallback(
    (minScore: number) => {
      return state.leads.filter((lead) => lead.intentScore >= minScore);
    },
    [state.leads]
  );

  // Memoized computed values to avoid recalculating on every render
  const hotLeads = useMemo(() => {
    return [...state.leads].sort((a, b) => b.intentScore - a.intentScore);
  }, [state.leads]);

  return {
    // State
    leads: state.leads,
    isConnected: state.isConnected,
    isJoined: state.isJoined,
    isLoading: state.isLoading,
    error: state.error,

    // Computed (memoized)
    hotLeads,
    totalLeads: state.leads.length,

    // Actions
    joinLeadStream,
    getLeadsByIntent,
    clearError,
  };
};
