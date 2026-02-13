// src/lib/sync-manager.ts
/**
 * Sync Manager
 *
 * Replays queued offline mutations when the client comes back online.
 * Uses claimMutation() for atomic claim to prevent races with the
 * service worker's background sync handler.
 *
 * Provides an event bus so the UI (OfflineProvider) can show toasts
 * for sync progress/failures.
 */

import { ApolloClient, NormalizedCacheObject, gql } from "@apollo/client";
import {
  getPendingMutations,
  claimMutation,
  updateMutationStatus,
  deleteItem,
  QueuedMutation,
} from "./offline-storage";
import { isActuallyOnline } from "./network-connectivity";

// ---------------------------------------------------------------------------
// Sync event bus
// ---------------------------------------------------------------------------

export interface SyncEvent {
  type: "sync_start" | "sync_complete" | "mutation_failed";
  pendingCount?: number;
  completedCount?: number;
  failedCount?: number;
  mutation?: QueuedMutation;
}

type SyncEventListener = (event: SyncEvent) => void;

const listeners = new Set<SyncEventListener>();

function emit(event: SyncEvent): void {
  listeners.forEach((fn) => {
    try {
      fn(event);
    } catch {
      // listener errors must not break the sync loop
    }
  });
}

/**
 * Subscribe to sync events. Returns an unsubscribe function.
 */
export function onSyncEvent(listener: SyncEventListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ---------------------------------------------------------------------------
// Replay logic
// ---------------------------------------------------------------------------

let isSyncing = false;

async function replayQueue(client: ApolloClient<NormalizedCacheObject>): Promise<void> {
  if (isSyncing) return;
  if (!isActuallyOnline()) return;

  isSyncing = true;

  try {
    const pending = await getPendingMutations();
    if (pending.length === 0) return;

    emit({ type: "sync_start", pendingCount: pending.length });

    let completedCount = 0;
    let failedCount = 0;

    for (const mutation of pending) {
      // Atomically claim — prevents the SW from processing the same mutation
      const claimed = await claimMutation(mutation.id);
      if (!claimed) continue; // already claimed by another processor

      try {
        await client.mutate({
          mutation: gql(claimed.query),
          variables: JSON.parse(claimed.variables),
          context: {
            headers: {
              "X-Idempotency-Key": claimed.idempotencyKey,
            },
          },
        });

        // Success — remove from queue
        await deleteItem("mutationQueue", claimed.id);
        completedCount++;
      } catch (err) {
        failedCount++;
        claimed.retryCount = (claimed.retryCount || 0) + 1;

        if (claimed.retryCount >= claimed.maxRetries) {
          await updateMutationStatus(claimed.id, "failed", String(err));
          emit({ type: "mutation_failed", mutation: claimed });
        } else {
          // Reset to pending for the next sync attempt
          await updateMutationStatus(claimed.id, "pending");
        }
      }
    }

    emit({
      type: "sync_complete",
      completedCount,
      failedCount,
    });
  } finally {
    isSyncing = false;
  }
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Start listening for online events and replay the mutation queue.
 * Returns a cleanup function.
 */
export function initSyncManager(
  client: ApolloClient<NormalizedCacheObject>,
): () => void {
  const handleOnline = () => {
    replayQueue(client);
  };

  window.addEventListener("online", handleOnline);

  // Also attempt a replay immediately in case we're already online with
  // mutations queued from a previous session
  replayQueue(client);

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}