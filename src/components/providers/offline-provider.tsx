// src/components/providers/offline-provider.tsx
"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { InstallPromptBanner } from "@/components/ui/install-prompt-banner";
import { onSyncEvent } from "@/lib/sync-manager";
import { getPendingMutationCount, getAllItems } from "@/lib/offline-storage";

/**
 * OfflineProvider
 *
 * Wraps the app to provide:
 * 1. Visual offline/online status banner
 * 2. Toast notifications for sync events (mutations replayed, failures)
 *
 * Place inside the ApolloProvider (needs Apollo context for sync manager).
 */
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  // Track pending counts in refs so beforeunload can read them synchronously.
  // Both mutation queue (IndexedDB mutationQueue store) and socket event queue
  // (IndexedDB syncMeta store with socket_queue_ keys) are polled asynchronously
  // and their counts cached here for the synchronous beforeunload handler.
  const pendingCountRef = useRef(0);
  const socketQueueCountRef = useRef(0);

  useEffect(() => {
    const poll = () => {
      getPendingMutationCount()
        .then((count) => { pendingCountRef.current = count; })
        .catch(() => {});

      // Read socket queue entries from IndexedDB syncMeta store
      getAllItems<{ id: string; events?: unknown[] }>("syncMeta")
        .then((items) => {
          let count = 0;
          for (const item of items) {
            if (item.id.startsWith("socket_queue_") && Array.isArray(item.events)) {
              count += item.events.length;
            }
          }
          socketQueueCountRef.current = count;
        })
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  // Warn users about unsaved offline data before closing/navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingCountRef.current > 0 || socketQueueCountRef.current > 0) {
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    // Subscribe to sync events for user-facing notifications
    const unsubscribe = onSyncEvent((event) => {
      switch (event.type) {
        case "sync_start":
          if (event.pendingCount && event.pendingCount > 0) {
            toast.info(
              `Syncing ${event.pendingCount} offline action${event.pendingCount > 1 ? "s" : ""}...`,
              { id: "sync-progress", duration: 10000 }
            );
          }
          break;

        case "sync_complete":
          if (event.completedCount && event.completedCount > 0) {
            toast.success(
              `Synced ${event.completedCount} action${event.completedCount > 1 ? "s" : ""} successfully`,
              { id: "sync-progress" }
            );
          }
          if (event.failedCount && event.failedCount > 0) {
            toast.error(
              `${event.failedCount} action${event.failedCount > 1 ? "s" : ""} failed to sync`,
              { duration: 15000 }
            );
          }
          break;

        case "mutation_failed":
          toast.error(
            `Failed to sync: ${event.mutation?.operationName || "action"}`,
            { duration: 10000 }
          );
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <OfflineBanner />
      <InstallPromptBanner />
      {children}
    </>
  );
}
