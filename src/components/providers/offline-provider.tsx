// src/components/providers/offline-provider.tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { onSyncEvent } from "@/lib/sync-manager";

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
      {children}
    </>
  );
}
