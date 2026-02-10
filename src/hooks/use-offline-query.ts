// src/hooks/use-offline-query.ts
"use client";

/**
 * useOfflineQuery - Offline-aware wrapper around Apollo's useQuery
 *
 * Provides seamless offline data access:
 * - When online: Fetches from network, stores in IndexedDB for offline use
 * - When offline: Serves from IndexedDB cache, shows stale indicator
 * - When reconnecting: Automatically refetches fresh data
 *
 * Usage:
 *   const { data, loading, isStale, isOffline } = useOfflineQuery(
 *     GET_ATTENDEE_EVENT_DETAILS_QUERY,
 *     { variables: { eventId }, offlineKey: `event-${eventId}` }
 *   );
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  useQuery,
  DocumentNode,
  TypedDocumentNode,
  OperationVariables,
  QueryHookOptions,
  ApolloError,
} from "@apollo/client";
import { useNetworkStatus } from "./use-network-status";
import { storeItem, getItem } from "@/lib/offline-storage";

interface OfflineQueryOptions<TData, TVariables extends OperationVariables>
  extends Omit<QueryHookOptions<TData, TVariables>, "fetchPolicy"> {
  /**
   * Unique key for IndexedDB storage. Use a pattern like "event-{id}" or "sessions-{eventId}".
   * Data is stored/retrieved from the "syncMeta" store under this key.
   */
  offlineKey: string;
  /**
   * Max age in ms before cached data is considered stale (default: 10 minutes).
   * Stale data is still returned but `isStale` will be true.
   */
  staleAfter?: number;
}

interface OfflineQueryResult<TData> {
  data: TData | undefined;
  loading: boolean;
  error: ApolloError | undefined;
  /** Whether the data is from a previous offline cache (may be outdated) */
  isStale: boolean;
  /** Whether we're currently offline */
  isOffline: boolean;
  /** When the cached data was last successfully fetched from the server */
  lastFetched: Date | null;
  /** Manually trigger a refetch (only works when online) */
  refetch: () => void;
}

interface CachedQueryData<TData> {
  id: string;
  data: TData;
  fetchedAt: number;
}

export function useOfflineQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options: OfflineQueryOptions<TData, TVariables>
): OfflineQueryResult<TData> {
  const { offlineKey, staleAfter = 10 * 60 * 1000, ...queryOptions } = options;
  const { isOnline, justReconnected } = useNetworkStatus();
  const [cachedData, setCachedData] = useState<TData | undefined>(undefined);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const hasRestoredCache = useRef(false);

  // Apollo query with appropriate fetch policy
  const {
    data: networkData,
    loading,
    error,
    refetch,
  } = useQuery<TData, TVariables>(query, {
    ...queryOptions,
    // When offline, try cache-only; when online, fetch from network
    fetchPolicy: isOnline ? "cache-and-network" : "cache-only",
    // Don't throw errors when offline
    errorPolicy: "all",
  });

  // Restore from IndexedDB on mount (before network data arrives)
  useEffect(() => {
    if (hasRestoredCache.current) return;
    hasRestoredCache.current = true;
    let cancelled = false;

    getItem<CachedQueryData<TData>>("syncMeta", `offline_query_${offlineKey}`)
      .then((cached) => {
        if (cancelled) return;
        if (cached?.data) {
          setCachedData(cached.data);
          setLastFetched(new Date(cached.fetchedAt));

          const age = Date.now() - cached.fetchedAt;
          setIsStale(age > staleAfter);
        }
      })
      .catch(() => {
        // IndexedDB not available, that's fine
      });

    return () => { cancelled = true; };
  }, [offlineKey, staleAfter]);

  // Persist network data to IndexedDB whenever we get fresh data
  useEffect(() => {
    if (networkData && isOnline) {
      const now = Date.now();
      setCachedData(networkData);
      setLastFetched(new Date(now));
      setIsStale(false);

      // Persist to IndexedDB for offline access
      storeItem<CachedQueryData<TData>>("syncMeta", {
        id: `offline_query_${offlineKey}`,
        data: networkData,
        fetchedAt: now,
      }).catch(() => {
        // Best effort
      });
    }
  }, [networkData, isOnline, offlineKey]);

  // Auto-refetch when coming back online
  useEffect(() => {
    if (justReconnected) {
      refetch();
    }
  }, [justReconnected, refetch]);

  // Mark as stale when offline
  useEffect(() => {
    if (!isOnline && cachedData && lastFetched) {
      const age = Date.now() - lastFetched.getTime();
      setIsStale(age > staleAfter);
    }
  }, [isOnline, cachedData, lastFetched, staleAfter]);

  // Use network data if available, otherwise fall back to IndexedDB cache
  const resolvedData = networkData || cachedData;

  const handleRefetch = useCallback(() => {
    if (isOnline) {
      refetch();
    }
  }, [isOnline, refetch]);

  return {
    data: resolvedData,
    loading: loading && !resolvedData, // Don't show loading if we have cached data
    error: isOnline ? error : undefined, // Suppress errors when offline
    isStale,
    isOffline: !isOnline,
    lastFetched,
    refetch: handleRefetch,
  };
}
