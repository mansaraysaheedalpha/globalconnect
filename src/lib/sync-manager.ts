// src/lib/sync-manager.ts
/**
 * Sync Manager
 *
 * Handles replaying queued mutations when connectivity is restored.
 * Listens for online events and processes the mutation queue in FIFO order
 * with retry logic and idempotency protection.
 */

import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  getPendingMutations,
  updateMutationStatus,
  clearCompletedMutations,
  getPendingMutationCount,
  type QueuedMutation,
} from "./offline-storage";

type SyncListener = (event: SyncEvent) => void;

interface SyncEvent {
  type: "sync_start" | "sync_complete" | "sync_error" | "mutation_replayed" | "mutation_failed";
  pendingCount?: number;
  completedCount?: number;
  failedCount?: number;
  mutation?: QueuedMutation;
  error?: string;
}

let isSyncing = false;
const listeners: Set<SyncListener> = new Set();

function emit(event: SyncEvent) {
  listeners.forEach((fn) => {
    try {
      fn(event);
    } catch {
      // Don't let listener errors break the sync loop
    }
  });
}

/**
 * Subscribe to sync events (for UI updates, toasts, etc.)
 * Returns an unsubscribe function.
 */
export function onSyncEvent(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Process the mutation queue, replaying each pending mutation
 * in order against the Apollo Client.
 */
export async function processMutationQueue(
  client: ApolloClient<NormalizedCacheObject>
): Promise<{ completed: number; failed: number }> {
  if (isSyncing) return { completed: 0, failed: 0 };
  if (!navigator.onLine) return { completed: 0, failed: 0 };

  const pending = await getPendingMutations();
  if (pending.length === 0) return { completed: 0, failed: 0 };

  isSyncing = true;
  let completed = 0;
  let failed = 0;

  emit({ type: "sync_start", pendingCount: pending.length });

  for (const mutation of pending) {
    try {
      // Mark as in-flight
      await updateMutationStatus(mutation.id, "in_flight");

      // Parse the stored GraphQL document and variables
      const document = gql(mutation.query);
      const variables = JSON.parse(mutation.variables);

      // Execute the mutation
      await client.mutate({
        mutation: document,
        variables,
        context: {
          headers: {
            "X-Idempotency-Key": mutation.idempotencyKey,
          },
        },
      });

      // Mark as completed
      await updateMutationStatus(mutation.id, "completed");
      completed++;
      emit({ type: "mutation_replayed", mutation });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Check if we've exceeded max retries
      if (mutation.retryCount + 1 >= mutation.maxRetries) {
        await updateMutationStatus(mutation.id, "failed", errorMessage);
        failed++;
        emit({ type: "mutation_failed", mutation, error: errorMessage });
      } else {
        // Reset to pending for next sync cycle
        await updateMutationStatus(mutation.id, "pending", errorMessage);
      }
    }
  }

  // Clean up completed mutations
  await clearCompletedMutations();

  isSyncing = false;
  emit({ type: "sync_complete", completedCount: completed, failedCount: failed });

  return { completed, failed };
}

/**
 * Initialize the SyncManager: listen for online events and
 * automatically process the queue when connectivity returns.
 *
 * Returns a cleanup function.
 */
export function initSyncManager(
  client: ApolloClient<NormalizedCacheObject>
): () => void {
  const handleOnline = async () => {
    // Small delay to let the connection stabilize
    await new Promise((r) => setTimeout(r, 1500));
    if (navigator.onLine) {
      const count = await getPendingMutationCount();
      if (count > 0) {
        await processMutationQueue(client);
      }
    }
  };

  window.addEventListener("online", handleOnline);

  // Also try to process on initialization if we're online
  // (handles case where app was closed offline and reopened online)
  if (navigator.onLine) {
    getPendingMutationCount().then((count) => {
      if (count > 0) {
        processMutationQueue(client);
      }
    });
  }

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
