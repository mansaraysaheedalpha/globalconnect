// src/hooks/use-socket-cache.ts
"use client";

/**
 * useSocketCache — Reusable hook for persisting/restoring socket-delivered data
 * to IndexedDB, providing instant cache-first loading for Chat, Polls, and Q&A.
 *
 * Uses the existing `syncMeta` store from offline-storage.ts with key pattern:
 * `socket_cache_{feature}_{sessionId}`
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { storeItem, getItem, deleteItem } from "@/lib/offline-storage";

interface UseSocketCacheOptions<T> {
  /** Feature identifier: "chat", "polls", "qa" */
  feature: string;
  /** Session ID for scoping the cache */
  sessionId: string;
  /** Custom serializer for non-JSON-safe types (e.g., Maps → Arrays) */
  serialize?: (data: T) => unknown;
  /** Custom deserializer (e.g., Arrays → Maps) */
  deserialize?: (raw: unknown) => T;
  /** Max age in ms before cached data is considered stale (default: 30 minutes) */
  staleAfter?: number;
}

interface UseSocketCacheResult<T> {
  /** Cached data restored from IndexedDB, null if none */
  cachedData: T | null;
  /** Whether cache restoration has completed */
  cacheLoaded: boolean;
  /** Timestamp when data was last cached */
  cachedAt: Date | null;
  /** Whether the cached data exceeds the staleAfter threshold */
  isStale: boolean;
  /** Persist data to IndexedDB (fire-and-forget, debounced internally is caller's job) */
  persistToCache: (data: T) => void;
  /** Clear the cache for this feature/session */
  clearCache: () => void;
}

interface CachedEntry {
  id: string;
  data: unknown;
  cachedAt: number;
}

export function useSocketCache<T>(
  options: UseSocketCacheOptions<T>
): UseSocketCacheResult<T> {
  const {
    feature,
    sessionId,
    serialize,
    deserialize,
    staleAfter = 30 * 60 * 1000,
  } = options;

  const cacheKey = `socket_cache_${feature}_${sessionId}`;
  const [cachedData, setCachedData] = useState<T | null>(null);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [cachedAt, setCachedAt] = useState<Date | null>(null);
  const hasRestoredRef = useRef(false);

  // Restore from IndexedDB on mount
  useEffect(() => {
    if (hasRestoredRef.current || !sessionId) {
      if (!sessionId) setCacheLoaded(true);
      return;
    }
    hasRestoredRef.current = true;

    getItem<CachedEntry>("syncMeta", cacheKey)
      .then((entry) => {
        if (entry?.data) {
          const restored = deserialize
            ? deserialize(entry.data)
            : (entry.data as T);
          setCachedData(restored);
          setCachedAt(new Date(entry.cachedAt));
        }
      })
      .catch(() => {
        // IndexedDB not available — graceful degradation
      })
      .finally(() => setCacheLoaded(true));
  }, [cacheKey, sessionId, deserialize]);

  const isStale = cachedAt
    ? Date.now() - cachedAt.getTime() > staleAfter
    : false;

  const persistToCache = useCallback(
    (data: T) => {
      const serialized = serialize ? serialize(data) : data;
      const now = Date.now();
      storeItem("syncMeta", {
        id: cacheKey,
        data: serialized,
        cachedAt: now,
      } as CachedEntry).catch(() => {
        // Best effort
      });
      setCachedAt(new Date(now));
    },
    [cacheKey, serialize]
  );

  const clearCache = useCallback(() => {
    deleteItem("syncMeta", cacheKey).catch(() => {});
    setCachedData(null);
    setCachedAt(null);
  }, [cacheKey]);

  return {
    cachedData,
    cacheLoaded,
    cachedAt,
    isStale,
    persistToCache,
    clearCache,
  };
}
