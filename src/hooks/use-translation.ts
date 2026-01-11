// src/hooks/use-translation.ts
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { useSubtitleStore } from "@/store/subtitle.store";
import { TranslationResponse, SupportedLanguageCode } from "@/types/subtitles";

interface TranslatedMessage {
  messageId: string;
  targetLanguage: string;
  translatedText: string;
  timestamp: number;
}

interface TranslationState {
  translations: Map<string, TranslatedMessage>;
  pendingRequests: Set<string>;
  error: string | null;
}

interface UseTranslationOptions {
  socket: Socket | null;
}

/**
 * Hook for translating chat messages via WebSocket
 *
 * @param options - Configuration options
 * @returns Translation state and controls
 */
export function useTranslation({ socket }: UseTranslationOptions) {
  const [state, setState] = useState<TranslationState>({
    translations: new Map(),
    pendingRequests: new Set(),
    error: null,
  });

  const { getEffectiveLanguage } = useSubtitleStore();

  // Cache reference for persistence across renders
  // Limit cache size to prevent memory leaks
  const MAX_CACHE_SIZE = 500;
  const cacheRef = useRef<Map<string, TranslatedMessage>>(new Map());

  // Sync state translations with cache
  useEffect(() => {
    cacheRef.current = state.translations;
  }, [state.translations]);

  /**
   * Get cache key for a translation
   */
  const getCacheKey = useCallback(
    (messageId: string, targetLanguage: string) => {
      return `${messageId}:${targetLanguage}`;
    },
    []
  );

  /**
   * Check if a translation is available in cache
   */
  const hasTranslation = useCallback(
    (messageId: string, targetLanguage?: string): boolean => {
      const lang = targetLanguage || getEffectiveLanguage();
      const key = getCacheKey(messageId, lang);
      return cacheRef.current.has(key);
    },
    [getCacheKey, getEffectiveLanguage]
  );

  /**
   * Get a translation from cache
   */
  const getTranslation = useCallback(
    (messageId: string, targetLanguage?: string): TranslatedMessage | null => {
      const lang = targetLanguage || getEffectiveLanguage();
      const key = getCacheKey(messageId, lang);
      return cacheRef.current.get(key) || null;
    },
    [getCacheKey, getEffectiveLanguage]
  );

  /**
   * Check if a translation request is pending
   */
  const isTranslating = useCallback(
    (messageId: string, targetLanguage?: string): boolean => {
      const lang = targetLanguage || getEffectiveLanguage();
      const key = getCacheKey(messageId, lang);
      return state.pendingRequests.has(key);
    },
    [getCacheKey, getEffectiveLanguage, state.pendingRequests]
  );

  /**
   * Request translation for a message
   */
  const translate = useCallback(
    async (
      messageId: string,
      targetLanguage?: string
    ): Promise<TranslatedMessage | null> => {
      if (!socket) {
        setState((prev) => ({
          ...prev,
          error: "Socket not connected",
        }));
        return null;
      }

      const lang = (targetLanguage || getEffectiveLanguage()) as SupportedLanguageCode;
      const cacheKey = getCacheKey(messageId, lang);

      // Return cached translation if available
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Skip if already pending
      if (state.pendingRequests.has(cacheKey)) {
        return null;
      }

      // Mark as pending
      setState((prev) => {
        const newPending = new Set(prev.pendingRequests);
        newPending.add(cacheKey);
        return { ...prev, pendingRequests: newPending, error: null };
      });

      return new Promise((resolve) => {
        let resolved = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        socket.emit(
          "translation.request",
          {
            messageId,
            targetLanguage: lang,
          },
          (response: TranslationResponse) => {
            // Prevent double resolution
            if (resolved) return;
            resolved = true;

            // Clear timeout since we got a response
            if (timeoutId) clearTimeout(timeoutId);

            // Remove from pending
            setState((prev) => {
              const newPending = new Set(prev.pendingRequests);
              newPending.delete(cacheKey);
              return { ...prev, pendingRequests: newPending };
            });

            if (response?.success && response.data?.translatedText) {
              const translation: TranslatedMessage = {
                messageId,
                targetLanguage: lang,
                translatedText: response.data.translatedText,
                timestamp: Date.now(),
              };

              // Add to cache with size limit
              setState((prev) => {
                const newTranslations = new Map(prev.translations);

                // Evict oldest entries if cache is full
                if (newTranslations.size >= MAX_CACHE_SIZE) {
                  const firstKey = newTranslations.keys().next().value;
                  if (firstKey) newTranslations.delete(firstKey);
                }

                newTranslations.set(cacheKey, translation);
                return { ...prev, translations: newTranslations };
              });

              resolve(translation);
            } else {
              const errorMsg = response?.error || "Translation failed";
              setState((prev) => ({ ...prev, error: errorMsg }));
              resolve(null);
            }
          }
        );

        // Timeout after 10 seconds
        timeoutId = setTimeout(() => {
          // Prevent double resolution
          if (resolved) return;
          resolved = true;

          setState((prev) => {
            if (prev.pendingRequests.has(cacheKey)) {
              const newPending = new Set(prev.pendingRequests);
              newPending.delete(cacheKey);
              return {
                ...prev,
                pendingRequests: newPending,
                error: "Translation request timed out",
              };
            }
            return prev;
          });
          resolve(null);
        }, 10000);
      });
    },
    [socket, getCacheKey, getEffectiveLanguage, state.pendingRequests]
  );

  /**
   * Translate multiple messages in batch
   */
  const translateBatch = useCallback(
    async (
      messageIds: string[],
      targetLanguage?: string
    ): Promise<Map<string, TranslatedMessage>> => {
      const results = new Map<string, TranslatedMessage>();

      // Filter out already cached translations
      const toTranslate = messageIds.filter(
        (id) => !hasTranslation(id, targetLanguage)
      );

      // Return cached results for already translated messages
      messageIds.forEach((id) => {
        const cached = getTranslation(id, targetLanguage);
        if (cached) {
          results.set(id, cached);
        }
      });

      // Translate remaining messages in parallel
      const translations = await Promise.all(
        toTranslate.map((id) => translate(id, targetLanguage))
      );

      translations.forEach((translation) => {
        if (translation) {
          results.set(translation.messageId, translation);
        }
      });

      return results;
    },
    [hasTranslation, getTranslation, translate]
  );

  /**
   * Clear translation cache
   */
  const clearCache = useCallback(() => {
    setState((prev) => ({
      ...prev,
      translations: new Map(),
    }));
    cacheRef.current.clear();
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    translations: state.translations,
    error: state.error,

    // Computed
    hasTranslation,
    getTranslation,
    isTranslating,

    // Actions
    translate,
    translateBatch,
    clearCache,
    clearError,
  };
}
