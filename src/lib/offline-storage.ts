// src/lib/offline-storage.ts
/**
 * Offline Storage Utility
 *
 * Provides a simple abstraction over IndexedDB for storing event data
 * for offline-first functionality. Falls back to localStorage if IndexedDB
 * is not available.
 */

const DB_NAME = "event_dynamics_offline";
const DB_VERSION = 1;

interface StorageConfig {
  storeName: string;
  keyPath?: string;
}

const STORES: Record<string, StorageConfig> = {
  events: { storeName: "events", keyPath: "id" },
  sessions: { storeName: "sessions", keyPath: "id" },
  speakers: { storeName: "speakers", keyPath: "id" },
  venues: { storeName: "venues", keyPath: "id" },
  syncMeta: { storeName: "syncMeta", keyPath: "id" },
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
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      Object.values(STORES).forEach(({ storeName, keyPath }) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: keyPath || "id" });
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
    // Fallback to localStorage
    const key = `${storeName}_${item.id}`;
    localStorage.setItem(key, JSON.stringify(item));
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
      const key = `${storeName}_${item.id}`;
      localStorage.setItem(key, JSON.stringify(item));
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
    const key = `${storeName}_${id}`;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
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
    // Fallback to localStorage - limited support
    console.warn("[OfflineStorage] getAllItems fallback not fully supported");
    return [];
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
    // Fallback to localStorage
    const key = `${storeName}_${id}`;
    localStorage.removeItem(key);
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
