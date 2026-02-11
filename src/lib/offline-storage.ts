// src/lib/offline-storage.ts
/**
 * Offline Storage Utility
 *
 * Provides an abstraction over IndexedDB for storing event data
 * and queuing mutations for offline-first functionality.
 * Falls back to localStorage if IndexedDB is not available.
 *
 * V2: Added mutationQueue and registrations stores for offline resilience.
 */

const DB_NAME = "event_dynamics_offline";
const DB_VERSION = 2;

// ---------------------------------------------------------------------------
// localStorage fallback keys (Safari private browsing, storage pressure)
// ---------------------------------------------------------------------------
const LS_PREFIX = "__idb_fb_";
const LS_INDEX_PREFIX = `${LS_PREFIX}idx_`;

function lsItemKey(storeName: string, id: string): string {
  return `${LS_PREFIX}${storeName}_${id}`;
}

function lsIndexKey(storeName: string, indexName: string, value: unknown): string {
  return `${LS_INDEX_PREFIX}${storeName}_${indexName}_${String(value)}`;
}

/** Read an index set from localStorage. Returns array of IDs. */
function lsReadIndex(storeName: string, indexName: string, value: unknown): string[] {
  try {
    const raw = localStorage.getItem(lsIndexKey(storeName, indexName, value));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Add an ID to a localStorage index set. */
function lsAddToIndex(storeName: string, indexName: string, value: unknown, id: string): void {
  const ids = lsReadIndex(storeName, indexName, value);
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(lsIndexKey(storeName, indexName, value), JSON.stringify(ids));
  }
}

/** Remove an ID from a localStorage index set. */
function lsRemoveFromIndex(storeName: string, indexName: string, value: unknown, id: string): void {
  const ids = lsReadIndex(storeName, indexName, value).filter((i) => i !== id);
  if (ids.length > 0) {
    localStorage.setItem(lsIndexKey(storeName, indexName, value), JSON.stringify(ids));
  } else {
    localStorage.removeItem(lsIndexKey(storeName, indexName, value));
  }
}

interface StorageConfig {
  storeName: string;
  keyPath?: string;
  autoIncrement?: boolean;
  indexes?: Array<{ name: string; keyPath: string; unique?: boolean }>;
}

const STORES: Record<string, StorageConfig> = {
  events: { storeName: "events", keyPath: "id" },
  sessions: { storeName: "sessions", keyPath: "id" },
  speakers: { storeName: "speakers", keyPath: "id" },
  venues: { storeName: "venues", keyPath: "id" },
  registrations: { storeName: "registrations", keyPath: "id" },
  syncMeta: { storeName: "syncMeta", keyPath: "id" },
  mutationQueue: {
    storeName: "mutationQueue",
    keyPath: "id",
    indexes: [
      { name: "status", keyPath: "status" },
      { name: "createdAt", keyPath: "createdAt" },
    ],
  },
};

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize the IndexedDB database
 */
async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("[OfflineStorage] Failed to open database:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Handle connection closing (e.g., during version change from another tab)
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      Object.values(STORES).forEach(({ storeName, keyPath, autoIncrement, indexes }) => {
        let store: IDBObjectStore;
        if (!db.objectStoreNames.contains(storeName)) {
          store = db.createObjectStore(storeName, {
            keyPath: keyPath || "id",
            autoIncrement: autoIncrement || false,
          });
        } else {
          // Access existing store during upgrade to add indexes
          store = (event.target as IDBOpenDBRequest).transaction!.objectStore(storeName);
        }

        // Create indexes if defined
        if (indexes) {
          indexes.forEach(({ name, keyPath: idxKeyPath, unique }) => {
            if (!store.indexNames.contains(name)) {
              store.createIndex(name, idxKeyPath, { unique: unique || false });
            }
          });
        }
      });
    };
  });
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

/**
 * Store an item in IndexedDB
 */
export async function storeItem<T extends { id: string }>(
  storeName: keyof typeof STORES,
  item: T
): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    // Fallback to localStorage with index maintenance
    localStorage.setItem(lsItemKey(storeName, item.id), JSON.stringify(item));

    // Maintain indexes for mutationQueue
    if (storeName === "mutationQueue") {
      const m = item as unknown as QueuedMutation;
      const statuses: MutationStatus[] = ["pending", "in_flight", "failed", "completed"];
      for (const s of statuses) {
        if (s === m.status) {
          lsAddToIndex(storeName, "status", s, item.id);
        } else {
          lsRemoveFromIndex(storeName, "status", s, item.id);
        }
      }
    }
  }
}

/**
 * Store multiple items in IndexedDB
 */
export async function storeItems<T extends { id: string }>(
  storeName: keyof typeof STORES,
  items: T[]
): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);

      items.forEach((item) => {
        store.put(item);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    // Fallback to localStorage
    items.forEach((item) => {
      localStorage.setItem(lsItemKey(storeName, item.id), JSON.stringify(item));
    });
  }
}

/**
 * Get an item from IndexedDB
 */
export async function getItem<T>(
  storeName: keyof typeof STORES,
  id: string
): Promise<T | null> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    // Fallback to localStorage
    const raw = localStorage.getItem(lsItemKey(storeName, id));
    return raw ? JSON.parse(raw) : null;
  }
}

/**
 * Get all items from a store
 */
export async function getAllItems<T>(
  storeName: keyof typeof STORES
): Promise<T[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    // Fallback to localStorage — scan for items matching store prefix
    const prefix = lsItemKey(storeName, "");
    const items: T[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) items.push(JSON.parse(raw));
        } catch { /* skip malformed */ }
      }
    }
    return items;
  }
}

/**
 * Get all items from a store using an index
 */
export async function getItemsByIndex<T>(
  storeName: keyof typeof STORES,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback to localStorage — read from index
    const ids = lsReadIndex(storeName, indexName, value);
    const items: T[] = [];
    for (const id of ids) {
      try {
        const raw = localStorage.getItem(lsItemKey(storeName, id));
        if (raw) items.push(JSON.parse(raw));
      } catch { /* skip malformed */ }
    }
    return items;
  }
}

/**
 * Delete an item from IndexedDB
 */
export async function deleteItem(
  storeName: keyof typeof STORES,
  id: string
): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    // Fallback to localStorage with index cleanup
    localStorage.removeItem(lsItemKey(storeName, id));
    if (storeName === "mutationQueue") {
      const statuses: MutationStatus[] = ["pending", "in_flight", "failed", "completed"];
      for (const s of statuses) {
        lsRemoveFromIndex(storeName, "status", s, id);
      }
    }
  }
}

/**
 * Clear all items from a store
 */
export async function clearStore(
  storeName: keyof typeof STORES
): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[OfflineStorage] clearStore failed:", error);
  }
}

/**
 * Count items in a store, optionally filtered by index
 */
export async function countItems(
  storeName: keyof typeof STORES,
  indexName?: string,
  value?: IDBValidKey
): Promise<number> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const target = indexName ? store.index(indexName) : store;
      const request = value !== undefined ? target.count(value) : target.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return 0;
  }
}

// ============================================================
// Sync Metadata Helpers
// ============================================================

/**
 * Store sync metadata (last sync time, version, etc.)
 */
export async function storeSyncMeta(
  key: string,
  value: unknown
): Promise<void> {
  await storeItem("syncMeta", { id: key, key, value, updatedAt: Date.now() });
}

/**
 * Get sync metadata
 */
export async function getSyncMeta<T>(key: string): Promise<T | null> {
  const result = await getItem<{ id: string; key: string; value: T }>(
    "syncMeta",
    key
  );
  return result?.value || null;
}

/**
 * Check if we're currently offline
 */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

/**
 * Get the last sync timestamp for an event
 */
export async function getLastSyncTime(eventId: string): Promise<number | null> {
  return getSyncMeta<number>(`lastSync_${eventId}`);
}

/**
 * Set the last sync timestamp for an event
 */
export async function setLastSyncTime(eventId: string): Promise<void> {
  await storeSyncMeta(`lastSync_${eventId}`, Date.now());
}

// ============================================================
// Mutation Queue (for offline mutation replay)
// ============================================================

export type MutationStatus = "pending" | "in_flight" | "failed" | "completed";

export interface QueuedMutation {
  id: string;
  /** The GraphQL operation name */
  operationName: string;
  /** Serialized GraphQL DocumentNode */
  query: string;
  /** Serialized variables */
  variables: string;
  /** Current status */
  status: MutationStatus;
  /** Number of replay attempts */
  retryCount: number;
  /** Max retries before marking as failed */
  maxRetries: number;
  /** ISO timestamp when queued */
  createdAt: string;
  /** ISO timestamp of last attempt */
  lastAttemptAt: string | null;
  /** Error message if failed */
  errorMessage: string | null;
  /** Optional: optimistic response data for immediate UI feedback */
  optimisticResponse: string | null;
  /** Idempotency key to prevent duplicate submissions */
  idempotencyKey: string;
}

/**
 * Add a mutation to the offline queue
 */
export async function queueMutation(
  mutation: Omit<QueuedMutation, "status" | "retryCount" | "lastAttemptAt" | "errorMessage">
): Promise<void> {
  await storeItem("mutationQueue", {
    ...mutation,
    status: "pending" as MutationStatus,
    retryCount: 0,
    lastAttemptAt: null,
    errorMessage: null,
  });
}

/**
 * Check if a mutation can be processed (deduplication guard).
 * Returns true if status is "pending", OR if status is "in_flight" but
 * the last attempt was more than 60 seconds ago (stale lock from a crashed processor).
 */
export function canProcessMutation(mutation: QueuedMutation): boolean {
  if (mutation.status === "pending") return true;
  if (mutation.status === "in_flight") {
    if (!mutation.lastAttemptAt) return true; // no timestamp = stale
    const elapsed = Date.now() - new Date(mutation.lastAttemptAt).getTime();
    return elapsed > 60_000; // stale lock threshold: 60 s
  }
  return false;
}

/**
 * Get all processable mutations ordered by creation time.
 * Includes both "pending" and stale "in_flight" mutations for recovery.
 */
export async function getPendingMutations(): Promise<QueuedMutation[]> {
  const pending = await getItemsByIndex<QueuedMutation>("mutationQueue", "status", "pending");
  const inFlight = await getItemsByIndex<QueuedMutation>("mutationQueue", "status", "in_flight");
  const all = [...pending, ...inFlight];
  return all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Update a queued mutation's status
 */
export async function updateMutationStatus(
  id: string,
  status: MutationStatus,
  errorMessage?: string
): Promise<void> {
  const mutation = await getItem<QueuedMutation>("mutationQueue", id);
  if (!mutation) return;

  await storeItem("mutationQueue", {
    ...mutation,
    status,
    lastAttemptAt: new Date().toISOString(),
    retryCount: status === "in_flight" ? mutation.retryCount + 1 : mutation.retryCount,
    errorMessage: errorMessage || mutation.errorMessage,
  });
}

/**
 * Remove completed mutations from the queue
 */
export async function clearCompletedMutations(): Promise<void> {
  const completed = await getItemsByIndex<QueuedMutation>("mutationQueue", "status", "completed");
  for (const mutation of completed) {
    await deleteItem("mutationQueue", mutation.id);
  }
}

/**
 * Get count of pending mutations
 */
export async function getPendingMutationCount(): Promise<number> {
  return countItems("mutationQueue", "status", "pending");
}
