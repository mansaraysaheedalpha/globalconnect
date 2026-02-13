// worker/index.ts
// Custom service worker code compiled and injected into the Workbox-generated SW.
// Handles Background Sync for replaying queued GraphQL mutations even after tab close.
//
// This runs in the ServiceWorker context — no access to React, Apollo, or window APIs.
// Uses raw IndexedDB with the same DB schema as the main app's offline-storage.ts.
//
// @ts-nocheck — compiled by next-pwa's webpack, not by the project's tsconfig.

export {}; // Make this a module so `declare global` works

const DB_NAME = "event_dynamics_offline";
const SYNC_TAG = "mutation-sync";
const FETCH_TIMEOUT_MS = 30_000; // 30 seconds
const STALE_LOCK_THRESHOLD_MS = 60_000; // 60 seconds
const TOKEN_EXPIRY_BUFFER_MS = 60_000; // 60 seconds before actual expiry

// ---------------------------------------------------------------------------
// IndexedDB helpers (raw — no imports possible in SW context)
// ---------------------------------------------------------------------------

/**
 * Open the shared IndexedDB database WITHOUT specifying a version.
 * This ensures the SW always opens whatever version the main app has
 * created, even after a schema migration bumps the version number.
 *
 * If the DB doesn't exist yet (main app hasn't opened it), the
 * versionchange event fires with version 1 and we create the
 * minimum stores needed for background sync.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Omitting the version opens the current version of the DB.
    // This prevents the "version mismatch" error that occurs when
    // the main app upgrades the DB version while an old SW is still running.
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    // If the DB has never been created, handle the initial schema setup
    // so background sync can work even before the main app opens.
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("mutationQueue")) {
        const store = db.createObjectStore("mutationQueue", { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains("syncMeta")) {
        db.createObjectStore("syncMeta", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("events")) {
        db.createObjectStore("events", { keyPath: "id" });
      }
    };
  });
}

interface QueuedMutation {
  id: string;
  operationName: string;
  query: string;
  variables: string;
  status: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttemptAt: string | null;
  errorMessage: string | null;
  idempotencyKey: string;
}

async function getPendingMutations(): Promise<QueuedMutation[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("mutationQueue", "readonly");
    const store = tx.objectStore("mutationQueue");
    const statusIndex = store.index("status");

    const pending: QueuedMutation[] = [];
    const results: IDBRequest[] = [];

    // Get both "pending" and "in_flight" (for stale lock recovery)
    results.push(statusIndex.getAll("pending"));
    results.push(statusIndex.getAll("in_flight"));

    tx.oncomplete = () => {
      for (const req of results) {
        if (req.result) pending.push(...req.result);
      }
      // Filter: only process if canProcessMutation
      const processable = pending.filter(canProcessMutation);
      processable.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      db.close();
      resolve(processable);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/**
 * Deduplication guard — mirrors canProcessMutation() in offline-storage.ts.
 * Returns true if status is "pending", or if "in_flight" with a stale lock.
 */
function canProcessMutation(mutation: QueuedMutation): boolean {
  if (mutation.status === "pending") return true;
  if (mutation.status === "in_flight") {
    if (!mutation.lastAttemptAt) return true; // no timestamp = stale
    const elapsed = Date.now() - new Date(mutation.lastAttemptAt).getTime();
    return elapsed > STALE_LOCK_THRESHOLD_MS;
  }
  return false;
}

/**
 * Atomically claim a mutation for processing — mirrors claimMutation()
 * in offline-storage.ts. Reads + sets "in_flight" in a single readwrite
 * transaction so the main thread and SW can't both claim the same mutation.
 */
async function claimMutationInDB(id: string): Promise<QueuedMutation | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("mutationQueue", "readwrite");
    const store = tx.objectStore("mutationQueue");
    const getReq = store.get(id);

    let claimed: QueuedMutation | null = null;

    getReq.onsuccess = () => {
      const mutation = getReq.result as QueuedMutation | undefined;
      if (!mutation || !canProcessMutation(mutation)) {
        return; // tx completes with claimed = null
      }
      mutation.status = "in_flight";
      mutation.lastAttemptAt = new Date().toISOString();
      claimed = { ...mutation };
      store.put(mutation);
    };

    tx.oncomplete = () => {
      db.close();
      resolve(claimed);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function updateMutationInDB(mutation: QueuedMutation): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("mutationQueue", "readwrite");
    const store = tx.objectStore("mutationQueue");
    store.put(mutation);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function deleteMutationFromDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("mutationQueue", "readwrite");
    const store = tx.objectStore("mutationQueue");
    store.delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function readSyncMeta(key: string): Promise<unknown> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("syncMeta", "readonly");
    const store = tx.objectStore("syncMeta");
    const request = store.get(key);
    tx.oncomplete = () => {
      db.close();
      resolve(request.result?.value ?? null);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// ---------------------------------------------------------------------------
// Token validation (#9 — skip replay if token is expired)
// ---------------------------------------------------------------------------

async function isTokenValid(): Promise<boolean> {
  try {
    const expiry = (await readSyncMeta("bg_sync_token_expiry")) as number | null;
    if (!expiry) return false; // no expiry stored = can't validate
    // expiry is already in ms (auth.store.ts returns exp * 1000)
    return Date.now() < expiry - TOKEN_EXPIRY_BUFFER_MS;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Fetch with timeout (#8 — prevent hung connections on 2G)
// ---------------------------------------------------------------------------

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

// ---------------------------------------------------------------------------
// Mutation replay
// ---------------------------------------------------------------------------

async function replayMutation(
  mutation: QueuedMutation,
  apiUrl: string,
  authToken: string | null
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Idempotency-Key": mutation.idempotencyKey,
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetchWithTimeout(apiUrl, {
      method: "POST",
      headers,
      credentials: "include", // Send httpOnly cookies (refresh token)
      body: JSON.stringify({
        query: mutation.query,
        variables: JSON.parse(mutation.variables),
        operationName: mutation.operationName,
      }),
    });

    if (response.ok) {
      const json = await response.json();
      // GraphQL can return errors even with 200 OK
      if (json.errors?.length) {
        console.warn("[SW Sync] GraphQL errors for", mutation.operationName, json.errors);
        // Still count as "handled" — don't retry GraphQL-level errors
        return true;
      }
      return true;
    }

    // 401/403 — token expired, leave for main thread on next app open
    if (response.status === 401 || response.status === 403) {
      console.warn("[SW Sync] Auth error, deferring to main thread");
      return false;
    }

    // Other server errors
    console.warn("[SW Sync] Server error", response.status, "for", mutation.operationName);
    return false;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.warn("[SW Sync] Fetch timeout for", mutation.operationName);
    } else {
      console.warn("[SW Sync] Network error replaying", mutation.operationName, err);
    }
    return false;
  }
}

async function processQueue(): Promise<void> {
  // Check token validity before attempting any replays (#9)
  const tokenValid = await isTokenValid().catch(() => false);
  if (!tokenValid) {
    console.warn("[SW Sync] Token expired or missing, deferring to main thread");
    return;
  }

  let mutations: QueuedMutation[];
  try {
    mutations = await getPendingMutations();
  } catch {
    // IndexedDB might not be ready yet
    return;
  }

  if (mutations.length === 0) return;

  const apiUrl = (await readSyncMeta("bg_sync_api_url")) as string | null;
  const authToken = (await readSyncMeta("bg_sync_auth_token")) as string | null;

  if (!apiUrl) {
    console.warn("[SW Sync] No API URL configured, skipping background sync");
    return;
  }

  console.log(`[SW Sync] Processing ${mutations.length} queued mutation(s)`);

  for (const mutation of mutations) {
    // Atomically claim — prevents race with the main thread's sync manager
    const claimed = await claimMutationInDB(mutation.id);
    if (!claimed) continue;

    const success = await replayMutation(claimed, apiUrl, authToken);

    if (success) {
      await deleteMutationFromDB(claimed.id);
    } else {
      claimed.retryCount = (claimed.retryCount || 0) + 1;

      if (claimed.retryCount >= claimed.maxRetries) {
        claimed.status = "failed";
        claimed.errorMessage = "Background sync: max retries exceeded";
      } else {
        // Reset to pending so main thread or next sync can retry
        claimed.status = "pending";
      }

      await updateMutationInDB(claimed);
    }
  }
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

self.addEventListener("sync", ((event: SyncEvent) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(processQueue());
  }
}) as EventListener);

// Also attempt on SW activation (covers the case where sync event wasn't fired)
self.addEventListener("activate", (event) => {
  event.waitUntil(processQueue());
});

// ---------------------------------------------------------------------------
// Periodic Background Sync (P2.3)
// Silently refreshes cached event data when the device is idle + online.
// Chrome 80+ only; graceful no-op on unsupported browsers.
// ---------------------------------------------------------------------------

const PERIODIC_SYNC_TAG = "refresh-event-data";

// Fallback query — used only if the main thread hasn't stored the query in
// syncMeta yet (first install before the app opens). The main thread stores
// the authoritative copy via storeSyncMeta("bg_sync_periodic_query", ...).
const DEFAULT_PERIODIC_SYNC_QUERY = `query PeriodicSyncRefresh {
  myRegistrations {
    id status
    event { id name description startDate endDate status imageUrl venue { id name address city } }
  }
}`;

/**
 * Fetch the user's registered events from the GraphQL API and
 * store them in the events IndexedDB store for offline access.
 */
async function refreshEventData(): Promise<void> {
  // Check token validity before fetching (#9)
  const tokenValid = await isTokenValid().catch(() => false);
  if (!tokenValid) return;

  const apiUrl = (await readSyncMeta("bg_sync_api_url")) as string | null;
  const authToken = (await readSyncMeta("bg_sync_auth_token")) as string | null;

  if (!apiUrl || !authToken) return;

  // Read the query from syncMeta (stored by the main thread) — single source of truth.
  // Falls back to the hardcoded default for first-install edge case.
  const query = ((await readSyncMeta("bg_sync_periodic_query")) as string | null)
    || DEFAULT_PERIODIC_SYNC_QUERY;

  try {
    const response = await fetchWithTimeout(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      credentials: "include",
      body: JSON.stringify({
        query,
        operationName: "PeriodicSyncRefresh",
      }),
    });

    if (!response.ok) return;

    const json = await response.json();
    const events = json.data?.myRegistrations;
    if (!events || !Array.isArray(events)) return;

    // Store each event in the IndexedDB "events" store
    const db = await openDB();
    const tx = db.transaction("events", "readwrite");
    const store = tx.objectStore("events");
    for (const event of events) {
      store.put(event);
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });

    // Update sync timestamp
    const metaDb = await openDB();
    const metaTx = metaDb.transaction("syncMeta", "readwrite");
    metaTx.objectStore("syncMeta").put({
      id: "periodic_sync_last",
      key: "periodic_sync_last",
      value: Date.now(),
      updatedAt: Date.now(),
    });
    await new Promise<void>((resolve, reject) => {
      metaTx.oncomplete = () => {
        metaDb.close();
        resolve();
      };
      metaTx.onerror = () => {
        metaDb.close();
        reject(metaTx.error);
      };
    });

    console.log(`[SW PeriodicSync] Refreshed ${events.length} event(s)`);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.warn("[SW PeriodicSync] Fetch timeout during refresh");
    } else {
      console.warn("[SW PeriodicSync] Failed to refresh event data", err);
    }
  }
}

self.addEventListener("periodicsync", ((event: any) => {
  if (event.tag === PERIODIC_SYNC_TAG) {
    event.waitUntil(refreshEventData());
  }
}) as EventListener);
