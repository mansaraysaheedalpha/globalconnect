// src/hooks/use-suggestions.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./use-socket";

/**
 * Connection suggestion from AI - recommends connecting with another attendee
 */
export interface ConnectionSuggestion {
  type: "CONNECTION_SUGGESTION";
  targetUserId: string;
  suggestedUserId: string;
  suggestedUserName: string;
  suggestedUserAvatar?: string;
  suggestedUserTitle?: string;
  suggestedUserCompany?: string;
  reason: string;
  matchScore: number;
  sharedInterests?: string[];
  conversationStarter?: string;
  timestamp: string;
}

/**
 * Circle suggestion from AI - recommends joining a networking circle
 */
export interface CircleSuggestion {
  type: "CIRCLE_SUGGESTION";
  targetUserId: string;
  circleId: string;
  circleName: string;
  circleDescription?: string;
  reason: string;
  memberCount: number;
  timestamp: string;
}

export type Suggestion = ConnectionSuggestion | CircleSuggestion;

type SuggestionWithReadState = Suggestion & { read: boolean };

interface UseSuggestionsOptions {
  eventId: string;
  maxSuggestions?: number;
  onSuggestion?: (suggestion: Suggestion) => void;
  showToasts?: boolean;
  toastDuration?: number;
  enableSound?: boolean;
}

interface UseSuggestionsReturn {
  suggestions: Suggestion[];
  latestSuggestion: Suggestion | null;
  unreadCount: number;
  hasSuggestions: boolean;
  isConnected: boolean;
  markAsRead: (index: number) => void;
  markAllAsRead: () => void;
  dismissSuggestion: (index: number) => void;
  clearAll: () => void;
}

// Debounce time to prevent processing too many suggestions at once
const SUGGESTION_DEBOUNCE_MS = 100;

/**
 * Hook for real-time AI-powered networking suggestions via WebSocket.
 *
 * Features:
 * - Listens to WebSocket events for connection and circle suggestions
 * - Maintains a capped list of suggestions to prevent memory issues
 * - Tracks read/unread state for badge counts
 * - Optional notification sound and toast callbacks
 *
 * WebSocket Events:
 * - 'suggestion.connection' -> ConnectionSuggestion
 * - 'suggestion.circle' -> CircleSuggestion
 */
export const useSuggestions = ({
  eventId,
  maxSuggestions = 20,
  onSuggestion,
  enableSound = true,
}: UseSuggestionsOptions): UseSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<SuggestionWithReadState[]>([]);
  const [latestSuggestion, setLatestSuggestion] = useState<Suggestion | null>(null);
  const { socket, isConnected } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSuggestionsRef = useRef<Suggestion[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize notification sound (only in browser)
  useEffect(() => {
    if (typeof window !== "undefined" && enableSound) {
      audioRef.current = new Audio("/sounds/notification.mp3");
      audioRef.current.volume = 0.3;
    }
    return () => {
      audioRef.current = null;
    };
  }, [enableSound]);

  const playNotificationSound = useCallback(() => {
    if (enableSound && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (user hasn't interacted yet)
      });
    }
  }, [enableSound]);

  // Process batched suggestions (debounced)
  const processPendingSuggestions = useCallback(() => {
    if (pendingSuggestionsRef.current.length === 0) return;

    const newSuggestions = pendingSuggestionsRef.current.map((s) => ({
      ...s,
      read: false,
    }));

    setSuggestions((prev) => {
      const combined = [...newSuggestions, ...prev];
      return combined.slice(0, maxSuggestions);
    });

    // Set latest and play sound only once per batch
    const latest = pendingSuggestionsRef.current[0];
    setLatestSuggestion(latest);
    playNotificationSound();

    // Notify callback for each suggestion
    pendingSuggestionsRef.current.forEach((s) => onSuggestion?.(s));

    // Clear pending
    pendingSuggestionsRef.current = [];
  }, [maxSuggestions, onSuggestion, playNotificationSound]);

  // Queue a suggestion for processing (debounced)
  const queueSuggestion = useCallback(
    (suggestion: Suggestion) => {
      pendingSuggestionsRef.current.unshift(suggestion);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        processPendingSuggestions();
      }, SUGGESTION_DEBOUNCE_MS);
    },
    [processPendingSuggestions]
  );

  // Subscribe to WebSocket suggestion events
  useEffect(() => {
    if (!socket || !isConnected || !eventId) return;

    const handleConnectionSuggestion = (data: ConnectionSuggestion) => {
      queueSuggestion({ ...data, type: "CONNECTION_SUGGESTION" });
    };

    const handleCircleSuggestion = (data: CircleSuggestion) => {
      queueSuggestion({ ...data, type: "CIRCLE_SUGGESTION" });
    };

    socket.on("suggestion.connection", handleConnectionSuggestion);
    socket.on("suggestion.circle", handleCircleSuggestion);

    return () => {
      socket.off("suggestion.connection", handleConnectionSuggestion);
      socket.off("suggestion.circle", handleCircleSuggestion);

      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [socket, isConnected, eventId, queueSuggestion]);

  // Mark a single suggestion as read
  const markAsRead = useCallback((index: number) => {
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, read: true } : s))
    );
  }, []);

  // Mark all suggestions as read
  const markAllAsRead = useCallback(() => {
    setSuggestions((prev) => prev.map((s) => ({ ...s, read: true })));
  }, []);

  // Dismiss (remove) a single suggestion
  const dismissSuggestion = useCallback((index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all suggestions
  const clearAll = useCallback(() => {
    setSuggestions([]);
    setLatestSuggestion(null);
  }, []);

  // Strip read state from returned suggestions
  const publicSuggestions: Suggestion[] = suggestions.map(({ read, ...s }) => s as Suggestion);

  return {
    suggestions: publicSuggestions,
    latestSuggestion,
    unreadCount: suggestions.filter((s) => !s.read).length,
    hasSuggestions: suggestions.length > 0,
    isConnected,
    markAsRead,
    markAllAsRead,
    dismissSuggestion,
    clearAll,
  };
};
