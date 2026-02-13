// src/lib/apollo-cache-persist.ts
/**
 * Apollo Cache Persistence Layer
 *
 * Persists Apollo's InMemoryCache to IndexedDB so that cached GraphQL data
 * survives page refreshes, app restarts, and offline sessions.
 *
 * Uses a dedicated IndexedDB store (separate from the main offline-storage DB)
 * to avoid version conflicts and keep cache persistence independent.
 */

import { InMemoryCache, NormalizedCacheObject } from "@apollo/client";

const CACHE_DB_NAME = "event_dynamics_apollo_cache";
const CACHE_DB_VERSION = 1;
const CACHE_STORE_NAME = "apollo_cache";
const CACHE_KEY = "root";

// Max cache size in characters (~5MB). Beyond this, we skip persist.
const MAX_CACHE_SIZE = 5 * 1024 * 1024;

// Debounce interval for writes (avoid thrashing IndexedDB on rapid cache updates)
const WRITE_DEBOUNCE_MS = 2000;

// Periodic persistence interval (catch any missed updates)
const PERIODIC_PERSIST_MS = 30_000;

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let cacheDb: IDBDatabase | null = null;

async function openCacheDB(): Promise<IDBDatabase> {
  if (cacheDb) return cacheDb;

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      cacheDb = request.result;
      cacheDb.onversionchange = () => {
        cacheDb?.close();
        cacheDb = null;
      };
      resolve(cacheDb);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        db.createObjectStore(CACHE_STORE_NAME);
      }
    };
  });
}

/**
 * Restore cached data from IndexedDB into the Apollo InMemoryCache.
 * Call this BEFORE the Apollo Client is used (during app initialization).
 */
export async function restoreCache(cache: InMemoryCache): Promise<void> {
  try {
    // First try IndexedDB
    const db = await openCacheDB();
    const data = await new Promise<NormalizedCacheObject | null>((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE_NAME, "readonly");
      const store = tx.objectStore(CACHE_STORE_NAME);
      const request = store.get(CACHE_KEY);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    if (data) {
      cache.restore(data);
      console.info(`[ApolloCache] Restored ${Object.keys(data).length} cache entries from IndexedDB`);
      return;
    }
  } catch (error) {
    console.warn("[ApolloCache] IndexedDB restore failed, trying localStorage backup:", error);
  }

  // Fallback: try localStorage backup (set during beforeunload)
  try {
    const backup = localStorage.getItem("__apollo_cache_backup");
    if (backup) {
      const data = JSON.parse(backup) as NormalizedCacheObject;
      cache.restore(data);
      console.info(`[ApolloCache] Restored ${Object.keys(data).length} cache entries from localStorage backup`);
      localStorage.removeItem("__apollo_cache_backup");
    }
  } catch (error) {
    console.warn("[ApolloCache] localStorage restore also failed:", error);
  }
}

/**
 * Evict cache entries to bring the serialized size under MAX_CACHE_SIZE.
 *
 * Strategy: Remove entries with the oldest `__lastAccessed` metadata first,
 * falling back to non-essential types (PublicEvent, then generic keys with
 * many fields). ROOT_QUERY is never evicted.
 */
function evictToFit(data: NormalizedCacheObject): NormalizedCacheObject {
  // Types we can safely evict (ordered from least to most essential)
  const evictablePrefixes = ["PublicEvent:", "Speaker:", "Venue:", "Session:", "Event:"];
  const trimmed = { ...data };

  for (const prefix of evictablePrefixes) {
    if (JSON.stringify(trimmed).length <= MAX_CACHE_SIZE) break;

    // Collect keys matching this prefix, sorted by key (oldest IDs first as heuristic)
    const keys = Object.keys(trimmed)
      .filter((k) => k.startsWith(prefix))
      .sort();

    // Evict the first half of matching entries
    const toEvict = keys.slice(0, Math.max(1, Math.floor(keys.length / 2)));
    for (const key of toEvict) {
      delete trimmed[key];
    }
  }

  return trimmed;
}

/**
 * Persist the current Apollo InMemoryCache to IndexedDB.
 * Debounced to avoid excessive writes.
 * If the cache exceeds MAX_CACHE_SIZE, evicts non-essential entries
 * before persisting so offline data is never silently lost.
 */
export function persistCache(cache: InMemoryCache): void {
  if (writeTimer) clearTimeout(writeTimer);

  writeTimer = setTimeout(async () => {
    try {
      let data = cache.extract();
      let serialized = JSON.stringify(data);

      // Evict entries if over size limit instead of silently skipping
      if (serialized.length > MAX_CACHE_SIZE) {
        console.warn(
          `[ApolloCache] Cache size (${(serialized.length / 1024 / 1024).toFixed(1)}MB) exceeds ${(MAX_CACHE_SIZE / 1024 / 1024).toFixed(0)}MB limit, evicting non-essential entries`
        );
        data = evictToFit(data);
        serialized = JSON.stringify(data);

        // If still over limit after eviction, skip persist as last resort
        if (serialized.length > MAX_CACHE_SIZE) {
          console.warn("[ApolloCache] Still over limit after eviction, skipping persist");
          return;
        }
      }

      const db = await openCacheDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(CACHE_STORE_NAME, "readwrite");
        const store = tx.objectStore(CACHE_STORE_NAME);
        const request = store.put(data, CACHE_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn("[ApolloCache] Failed to persist cache:", error);
    }
  }, WRITE_DEBOUNCE_MS);
}

/**
 * Set up automatic cache persistence using a combination of:
 * 1. Periodic interval (catches all cache updates)
 * 2. Visibility change (persist when user leaves tab)
 * 3. Before unload (last-chance save to localStorage)
 *
 * Returns a cleanup function to stop persistence.
 */
export function setupCachePersistence(cache: InMemoryCache): () => void {
  // Periodic persistence to catch any missed updates
  const intervalId = setInterval(() => {
    persistCache(cache);
  }, PERIODIC_PERSIST_MS);

  // Persist when the tab becomes hidden (user switching away)
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      persistCache(cache);
    }
  };

  // Best-effort synchronous save before page unload
  const handleBeforeUnload = () => {
    if (writeTimer) {
      clearTimeout(writeTimer);
    }
    try {
      const data = cache.extract();
      const serialized = JSON.stringify(data);
      if (serialized.length <= MAX_CACHE_SIZE) {
        localStorage.setItem("__apollo_cache_backup", serialized);
      }
    } catch {
      // Best effort — page is closing
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("beforeunload", handleBeforeUnload);

  // Do an initial persist
  persistCache(cache);

  return () => {
    clearInterval(intervalId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("beforeunload", handleBeforeUnload);
    if (writeTimer) clearTimeout(writeTimer);
  };
}

/**
 * Clear the persisted Apollo cache from IndexedDB.
 * Call this on logout.
 */
export async function clearPersistedCache(): Promise<void> {
  try {
    const db = await openCacheDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE_NAME, "readwrite");
      const store = tx.objectStore(CACHE_STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    localStorage.removeItem("__apollo_cache_backup");
  } catch (error) {
    console.warn("[ApolloCache] Failed to clear persisted cache:", error);
  }
}
