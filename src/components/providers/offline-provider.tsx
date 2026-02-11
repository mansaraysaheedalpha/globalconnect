// src/components/providers/offline-provider.tsx
"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { InstallPromptBanner } from "@/components/ui/install-prompt-banner";
import { onSyncEvent } from "@/lib/sync-manager";
import { getPendingMutationCount } from "@/lib/offline-storage";

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
  // Track pending mutation count in a ref so beforeunload can read it synchronously (#2)
  const pendingCountRef = useRef(0);

  useEffect(() => {
    // Poll pending count every 5s so the ref stays reasonably fresh
    const poll = () => {
      getPendingMutationCount()
        .then((count) => { pendingCountRef.current = count; })
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  // Warn users about unsaved offline data before closing/navigating away (#2)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Synchronous check: pending GraphQL mutations (from polled ref)
      if (pendingCountRef.current > 0) {
        e.preventDefault();
        return;
      }

      // Synchronous check: scan localStorage for socket queue entries
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("socket_queue_")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.events?.length > 0) {
                e.preventDefault();
                return;
              }
            }
          }
        }
      } catch {
        // Best effort
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
