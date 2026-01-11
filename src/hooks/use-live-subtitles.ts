// src/hooks/use-live-subtitles.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import { useSubtitleStore } from "@/store/subtitle.store";
import {
  SubtitleChunk,
  ActiveSubtitle,
  TranslationResponse,
} from "@/types/subtitles";

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

interface LiveSubtitlesState {
  subtitles: ActiveSubtitle[];
  isConnected: boolean;
  isPaused: boolean;
  error: string | null;
}

interface UseLiveSubtitlesOptions {
  socket: Socket | null;
  sessionId: string;
  autoTranslate?: boolean;
}

/**
 * Hook for managing live subtitle streaming with optional auto-translation
 *
 * @param options - Configuration options
 * @returns Subtitle state and controls
 */
export function useLiveSubtitles({
  socket,
  sessionId,
  autoTranslate = true,
}: UseLiveSubtitlesOptions) {
  const [state, setState] = useState<LiveSubtitlesState>({
    subtitles: [],
    isConnected: false,
    isPaused: false,
    error: null,
  });

  // Store references
  const {
    enabled,
    toggleEnabled,
    getEffectiveLanguage,
    showOriginalWithTranslation,
  } = useSubtitleStore();

  // Track active subtitle timeouts for cleanup
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Translation cache to avoid re-translating same content
  // Limit cache size to prevent memory leaks
  const MAX_CACHE_SIZE = 500;
  const translationCacheRef = useRef<Map<string, string>>(new Map());

  // Pending translations queue
  const pendingTranslationsRef = useRef<Set<string>>(new Set());

  // Refs to avoid stale closures in event handlers
  const enabledRef = useRef(enabled);
  const isPausedRef = useRef(state.isPaused);

  // Keep refs in sync with state
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    isPausedRef.current = state.isPaused;
  }, [state.isPaused]);

  /**
   * Request translation for a subtitle chunk
   */
  const requestTranslation = useCallback(
    (subtitleId: string, text: string, sourceLanguage: string) => {
      if (!socket || !autoTranslate) return;

      const targetLanguage = getEffectiveLanguage();

      // Skip if source and target are the same
      if (sourceLanguage === targetLanguage) return;

      // Check cache first
      const cacheKey = `${text}:${targetLanguage}`;
      const cached = translationCacheRef.current.get(cacheKey);

      // Evict oldest entries if cache is full
      if (translationCacheRef.current.size >= MAX_CACHE_SIZE) {
        const firstKey = translationCacheRef.current.keys().next().value;
        if (firstKey) translationCacheRef.current.delete(firstKey);
      }

      if (cached) {
        setState((prev) => ({
          ...prev,
          subtitles: prev.subtitles.map((s) =>
            s.id === subtitleId ? { ...s, translatedText: cached } : s
          ),
        }));
        return;
      }

      // Skip if already pending
      if (pendingTranslationsRef.current.has(cacheKey)) return;
      pendingTranslationsRef.current.add(cacheKey);

      // Request translation via WebSocket
      socket.emit(
        "translation.request",
        {
          messageId: subtitleId,
          targetLanguage,
          text,
          sourceLanguage,
        },
        (response: TranslationResponse) => {
          pendingTranslationsRef.current.delete(cacheKey);

          if (response?.success && response.data?.translatedText) {
            const translatedText = response.data.translatedText;

            // Cache the translation
            translationCacheRef.current.set(cacheKey, translatedText);

            // Update subtitle with translation
            setState((prev) => ({
              ...prev,
              subtitles: prev.subtitles.map((s) =>
                s.id === subtitleId ? { ...s, translatedText } : s
              ),
            }));
          }
        }
      );
    },
    [socket, autoTranslate, getEffectiveLanguage]
  );

  /**
   * Add a new subtitle to the active queue
   */
  const addSubtitle = useCallback(
    (chunk: SubtitleChunk) => {
      const id = generateUUID();
      const expiresAt = Date.now() + chunk.duration;

      const activeSubtitle: ActiveSubtitle = {
        ...chunk,
        id,
        expiresAt,
      };

      setState((prev) => ({
        ...prev,
        subtitles: [...prev.subtitles, activeSubtitle],
      }));

      // Request translation if needed
      const targetLanguage = getEffectiveLanguage();
      if (autoTranslate && chunk.language !== targetLanguage) {
        requestTranslation(id, chunk.text, chunk.language);
      }

      // Schedule removal after duration
      const timeout = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          subtitles: prev.subtitles.filter((s) => s.id !== id),
        }));
        timeoutsRef.current.delete(id);
      }, chunk.duration);

      timeoutsRef.current.set(id, timeout);
    },
    [autoTranslate, getEffectiveLanguage, requestTranslation]
  );

  /**
   * Clear all active subtitles
   */
  const clearSubtitles = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();

    setState((prev) => ({
      ...prev,
      subtitles: [],
    }));
  }, []);

  /**
   * Pause subtitle display (keep receiving but don't show new ones)
   */
  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  /**
   * Resume subtitle display
   */
  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !sessionId) return;

    const handleConnect = () => {
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    };

    const handleDisconnect = () => {
      setState((prev) => ({ ...prev, isConnected: false }));
    };

    const handleSubtitleChunk = (chunk: SubtitleChunk) => {
      // Only process subtitles for this session
      if (chunk.sessionId !== sessionId) return;

      // Only add if subtitles are enabled and not paused
      // Use refs to avoid stale closure issues
      if (enabledRef.current && !isPausedRef.current) {
        addSubtitle(chunk);
      }
    };

    const handleError = (error: { message: string }) => {
      setState((prev) => ({ ...prev, error: error.message }));
    };

    // Subscribe to events
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("subtitle.stream.chunk", handleSubtitleChunk);
    socket.on("systemError", handleError);

    // Set initial connection state
    setState((prev) => ({
      ...prev,
      isConnected: socket.connected,
    }));

    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("subtitle.stream.chunk", handleSubtitleChunk);
      socket.off("systemError", handleError);

      // Clear all timeouts
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
    // Note: enabled and isPaused are tracked via refs to avoid stale closures
  }, [socket, sessionId, addSubtitle]);

  // Clear subtitles when disabled
  useEffect(() => {
    if (!enabled) {
      clearSubtitles();
    }
  }, [enabled, clearSubtitles]);

  return {
    // State
    subtitles: state.subtitles,
    isConnected: state.isConnected,
    isPaused: state.isPaused,
    error: state.error,
    enabled,
    showOriginalWithTranslation,

    // Actions
    toggleEnabled,
    pause,
    resume,
    clearSubtitles,
    clearError,
  };
}
