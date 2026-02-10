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
const DB_VERSION = 2;
const SYNC_TAG = "mutation-sync";

// ---------------------------------------------------------------------------
// IndexedDB helpers (raw — no imports possible in SW context)
// ---------------------------------------------------------------------------

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    // Do NOT handle onupgradeneeded — the main app manages schema migrations.
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
    const index = store.index("status");
    const request = index.getAll("pending");

    tx.oncomplete = () => {
      const mutations: QueuedMutation[] = request.result || [];
      mutations.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      db.close();
      resolve(mutations);
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

    const response = await fetch(apiUrl, {
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
    console.warn("[SW Sync] Network error replaying", mutation.operationName, err);
    return false;
  }
}

async function processQueue(): Promise<void> {
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
    const success = await replayMutation(mutation, apiUrl, authToken);

    if (success) {
      await deleteMutationFromDB(mutation.id);
    } else {
      mutation.retryCount = (mutation.retryCount || 0) + 1;
      mutation.lastAttemptAt = new Date().toISOString();

      if (mutation.retryCount >= mutation.maxRetries) {
        mutation.status = "failed";
        mutation.errorMessage = "Background sync: max retries exceeded";
      }
      // Otherwise stays "pending" for the next sync or main thread

      await updateMutationInDB(mutation);
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
