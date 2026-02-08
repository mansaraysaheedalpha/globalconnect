// src/hooks/use-session-reactions.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

// Allowed emojis (must match backend ALLOWED_EMOJIS)
export const ALLOWED_EMOJIS = [
  "👍", // Approval or agreement
  "❤️", // Love or appreciation
  "🎉", // Celebration
  "💡", // Idea or suggestion
  "😂", // Laughter
  "👏", // Applause
  "🔥", // Excitement or highlight
  "🙏", // Gratitude or thanks
  "🤝", // Partnership or networking
  "🚀", // Progress or launch
  "🙌", // Support or encouragement
  "✅", // Confirmation or success
  "🎶", // Music vibes
  "🕺", // Dancing or good vibes
  "📢", // Announcements, engagement
  "📸", // Photo moments
  "🌍", // Global presence
  "🧠", // Smart insight
] as const;

export type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number];

// Reaction burst data from server
export interface ReactionBurst {
  counts: Record<string, number>;
  timestamp: number;
}

// Mood analytics data
export interface MoodAnalytics {
  sessionId: string;
  totalReactions: number;
  reactionCounts: Record<string, number>;
  dominantMood: string | null;
  moodTrend: "rising" | "stable" | "declining";
  engagementLevel: "low" | "medium" | "high" | "viral";
}

// Individual floating emoji for animation
export interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number; // 0-100 percentage
  createdAt: number;
}

interface SessionReactionsState {
  isConnected: boolean;
  isJoined: boolean;
  error: string | null;
  floatingEmojis: FloatingEmoji[];
  lastBurst: ReactionBurst | null;
  moodAnalytics: MoodAnalytics | null;
  totalReactionsSent: number;
  reactionsOpen: boolean | null;
}

// Rate limiting config
const RATE_LIMIT = {
  maxPerSecond: 3,
  burstLimit: 10,
  burstWindow: 5000, // 5 seconds
};

export const useSessionReactions = (sessionId: string, eventId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SessionReactionsState>({
    isConnected: false,
    isJoined: false,
    error: null,
    floatingEmojis: [],
    lastBurst: null,
    moodAnalytics: null,
    totalReactionsSent: 0,
    reactionsOpen: null,
  });
  const { token } = useAuthStore();

  // Rate limiting state
  const reactionTimestamps = useRef<number[]>([]);
  const burstCount = useRef(0);
  const burstWindowStart = useRef(Date.now());

  // Emoji ID counter for unique keys
  const emojiIdCounter = useRef(0);

  // Check if sending reaction is allowed (rate limiting)
  const canSendReaction = useCallback((): boolean => {
    const now = Date.now();

    // Reset burst window if expired
    if (now - burstWindowStart.current > RATE_LIMIT.burstWindow) {
      burstCount.current = 0;
      burstWindowStart.current = now;
    }

    // Check burst limit
    if (burstCount.current >= RATE_LIMIT.burstLimit) {
      return false;
    }

    // Check per-second rate
    const oneSecondAgo = now - 1000;
    const recentReactions = reactionTimestamps.current.filter(
      (t) => t > oneSecondAgo
    );
    reactionTimestamps.current = recentReactions;

    return recentReactions.length < RATE_LIMIT.maxPerSecond;
  }, []);

  // Record a sent reaction for rate limiting
  const recordReaction = useCallback(() => {
    const now = Date.now();
    reactionTimestamps.current.push(now);
    burstCount.current++;
  }, []);

  // Add floating emoji to the display
  const addFloatingEmoji = useCallback((emoji: string, count: number = 1) => {
    const newEmojis: FloatingEmoji[] = [];

    // Limit max emojis to prevent performance issues
    const maxToAdd = Math.min(count, 10);

    for (let i = 0; i < maxToAdd; i++) {
      emojiIdCounter.current++;
      newEmojis.push({
        id: `emoji-${emojiIdCounter.current}-${Date.now()}`,
        emoji,
        x: 10 + Math.random() * 80, // Random horizontal position 10-90%
        createdAt: Date.now() + i * 100, // Stagger creation
      });
    }

    setState((prev) => ({
      ...prev,
      floatingEmojis: [...prev.floatingEmojis, ...newEmojis].slice(-50), // Keep max 50
    }));
  }, []);

  // Remove expired floating emojis
  const cleanupFloatingEmojis = useCallback(() => {
    const expiryTime = 4000; // 4 seconds animation duration
    const now = Date.now();

    setState((prev) => ({
      ...prev,
      floatingEmojis: prev.floatingEmojis.filter(
        (e) => now - e.createdAt < expiryTime
      ),
    }));
  }, []);

  // Cleanup interval for floating emojis
  useEffect(() => {
    const interval = setInterval(cleanupFloatingEmojis, 1000);
    return () => clearInterval(interval);
  }, [cleanupFloatingEmojis]);

  // Socket connection and event handling
  useEffect(() => {
    if (!sessionId || !eventId || !token) {
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
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", () => {
      // Join the session room for reactions
      newSocket.emit(
        "session.join",
        { sessionId, eventId },
        (response: { success: boolean; error?: { message: string } }) => {
          if (response?.success) {
            setState((prev) => ({ ...prev, isJoined: true }));
          } else {
            setState((prev) => ({
              ...prev,
              error: response?.error?.message || "Failed to join session",
            }));
          }
        }
      );
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    // Receive reaction bursts from server (aggregated every 2 seconds)
    newSocket.on("reaction.burst", (counts: Record<string, number>) => {
      const burst: ReactionBurst = {
        counts,
        timestamp: Date.now(),
      };

      setState((prev) => ({ ...prev, lastBurst: burst }));

      // Create floating emojis for each reaction type
      Object.entries(counts).forEach(([emoji, count]) => {
        addFloatingEmoji(emoji, count);
      });
    });

    // Receive mood analytics updates
    newSocket.on("mood.analytics.updated", (analytics: MoodAnalytics) => {
      setState((prev) => ({ ...prev, moodAnalytics: analytics }));
    });

    // Receive reactions status changes (organizer open/close)
    newSocket.on("reactions.status.changed", (data: { sessionId: string; isOpen: boolean }) => {
      if (data.sessionId === sessionId) {
        setState((prev) => ({ ...prev, reactionsOpen: data.isOpen }));
      }
    });

    // Error handling
    newSocket.on("systemError", (error: { message: string }) => {
      console.error("[Reactions] System error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Reactions] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Cleanup
    return () => {
      newSocket.emit("session.leave", { sessionId });
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("disconnect");
      newSocket.off("reaction.burst");
      newSocket.off("mood.analytics.updated");
      newSocket.off("reactions.status.changed");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, eventId, token, addFloatingEmoji]);

  // Send a reaction
  const sendReaction = useCallback(
    (emoji: string): boolean => {
      if (!socketRef.current || !state.isJoined) {
        console.warn("[Reactions] Cannot send - not connected");
        return false;
      }

      // Validate emoji is allowed
      if (!ALLOWED_EMOJIS.includes(emoji as AllowedEmoji)) {
        console.warn("[Reactions] Invalid emoji:", emoji);
        return false;
      }

      // Check rate limit
      if (!canSendReaction()) {
        console.warn("[Reactions] Rate limited");
        setState((prev) => ({
          ...prev,
          error: "Slow down! Too many reactions.",
        }));
        return false;
      }

      // Send reaction (no idempotency key needed for reactions)
      socketRef.current.emit("reaction.send", { emoji });

      // Record for rate limiting
      recordReaction();

      // Optimistic UI update - show our own reaction immediately
      addFloatingEmoji(emoji, 1);

      setState((prev) => ({
        ...prev,
        totalReactionsSent: prev.totalReactionsSent + 1,
        error: null,
      }));

      return true;
    },
    [state.isJoined, canSendReaction, recordReaction, addFloatingEmoji]
  );

  // Send multiple reactions at once (for quick tap)
  const sendReactionBurst = useCallback(
    (emoji: string, count: number = 1): number => {
      let sent = 0;
      for (let i = 0; i < count; i++) {
        if (sendReaction(emoji)) {
          sent++;
        } else {
          break; // Stop if rate limited
        }
      }
      return sent;
    },
    [sendReaction]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Get reaction suggestions based on mood
  const getPopularEmojis = useCallback((): string[] => {
    if (!state.moodAnalytics?.reactionCounts) {
      return ALLOWED_EMOJIS.slice(0, 6) as string[];
    }

    // Sort by count and return top 6
    const sorted = Object.entries(state.moodAnalytics.reactionCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([emoji]) => emoji)
      .slice(0, 6);

    // Fill with defaults if not enough
    if (sorted.length < 6) {
      const remaining = ALLOWED_EMOJIS.filter(
        (e) => !sorted.includes(e)
      ).slice(0, 6 - sorted.length);
      return [...sorted, ...remaining];
    }

    return sorted;
  }, [state.moodAnalytics]);

  return {
    // State
    isConnected: state.isConnected,
    isJoined: state.isJoined,
    error: state.error,
    floatingEmojis: state.floatingEmojis,
    lastBurst: state.lastBurst,
    moodAnalytics: state.moodAnalytics,
    totalReactionsSent: state.totalReactionsSent,
    reactionsOpen: state.reactionsOpen,

    // Actions
    sendReaction,
    sendReactionBurst,
    clearError,

    // Utilities
    getPopularEmojis,
    canSendReaction,

    // Constants
    ALLOWED_EMOJIS,
  };
};
