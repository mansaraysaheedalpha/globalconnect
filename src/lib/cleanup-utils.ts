// src/lib/cleanup-utils.ts
/**
 * Centralized cleanup utilities for logout and user-session changes.
 * Ensures all cached data, queues, and persisted state is properly cleared
 * to prevent data leaks between users.
 */

import { clearPersistedCache } from "./apollo-cache-persist";
import { clearStore, deleteItem, getAllItems } from "./offline-storage";

/**
 * Complete cleanup on logout: clear all cached data, mutation queues,
 * socket queues, and Apollo cache.
 *
 * Fire-and-forget — errors are caught internally so logout never blocks.
 */
export async function performLogoutCleanup(): Promise<void> {
  const tasks: Promise<void>[] = [];

  // 1. Clear Apollo persisted cache (IndexedDB + localStorage backup)
  tasks.push(
    clearPersistedCache().catch((e) =>
      console.warn("[Cleanup] clearPersistedCache:", e)
    )
  );

  // 2. Clear mutation queue
  tasks.push(
    clearStore("mutationQueue").catch((e) =>
      console.warn("[Cleanup] clearStore mutationQueue:", e)
    )
  );

  // 3. Clear offline registrations / tickets
  tasks.push(
    clearStore("registrations").catch((e) =>
      console.warn("[Cleanup] clearStore registrations:", e)
    )
  );

  // 4. Clear socket queues + socket caches + sync metadata stored in syncMeta
  tasks.push(
    clearSyncMetaEntries().catch((e) =>
      console.warn("[Cleanup] clearSyncMetaEntries:", e)
    )
  );

  await Promise.allSettled(tasks);
}

/**
 * Clear socket queues, socket caches, and auth-related sync metadata
 * from the syncMeta store.
 */
async function clearSyncMetaEntries(): Promise<void> {
  // Read all items from syncMeta and selectively delete
  const all = await getAllItems<{ id: string }>("syncMeta");

  const deletions: Promise<void>[] = [];
  for (const entry of all) {
    const id = entry.id;
    if (
      id.startsWith("socket_queue_") ||
      id.startsWith("socket_cache_") ||
      id.startsWith("offline_query_") ||
      id === "bg_sync_auth_token" ||
      id === "bg_sync_token_expiry" ||
      id === "bg_sync_api_url" ||
      id === "periodic_sync_last"
    ) {
      deletions.push(deleteItem("syncMeta", id));
    }
  }

  await Promise.allSettled(deletions);
}
