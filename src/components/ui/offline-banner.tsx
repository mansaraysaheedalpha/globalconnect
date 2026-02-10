// src/components/ui/offline-banner.tsx
"use client";

import { useNetworkStatus, ConnectionQuality } from "@/hooks/use-network-status";
import { WifiOff, Wifi, Signal, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * A non-intrusive banner that appears when the user is offline or on a slow connection.
 * Slides down from the top of the viewport and shows contextual messages.
 * Designed for African markets where connectivity is intermittent.
 */
export function OfflineBanner() {
  const { isOnline, connectionQuality, justReconnected, saveData, effectiveType } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Check for pending mutations in IndexedDB
  useEffect(() => {
    if (!isOnline) {
      checkPendingMutations().then(setPendingCount);
    }
    if (justReconnected) {
      setPendingCount(0);
    }
  }, [isOnline, justReconnected]);

  // Show/hide with a slight delay for smooth animation
  useEffect(() => {
    if (!isOnline || connectionQuality === "slow" || justReconnected) {
      setVisible(true);
    } else {
      // Small delay before hiding to let the "back online" message show
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOnline, connectionQuality, justReconnected]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-4 py-2.5 text-sm font-medium text-center transition-all duration-300 ease-in-out",
        "flex items-center justify-center gap-2",
        getBannerStyles(isOnline, connectionQuality, justReconnected)
      )}
    >
      {getBannerIcon(isOnline, connectionQuality, justReconnected)}
      <span>{getBannerMessage(isOnline, connectionQuality, justReconnected, saveData, effectiveType, pendingCount)}</span>
    </div>
  );
}

function getBannerStyles(isOnline: boolean, quality: ConnectionQuality, justReconnected: boolean): string {
  if (justReconnected) {
    return "bg-emerald-600 text-white animate-in slide-in-from-top";
  }
  if (!isOnline) {
    return "bg-amber-600 text-white animate-in slide-in-from-top";
  }
  if (quality === "slow") {
    return "bg-yellow-500 text-yellow-950 animate-in slide-in-from-top";
  }
  return "";
}

function getBannerIcon(isOnline: boolean, quality: ConnectionQuality, justReconnected: boolean) {
  if (justReconnected) return <Check className="h-4 w-4" />;
  if (!isOnline) return <WifiOff className="h-4 w-4" />;
  if (quality === "slow") return <Signal className="h-4 w-4" />;
  return <Wifi className="h-4 w-4" />;
}

function getBannerMessage(
  isOnline: boolean,
  quality: ConnectionQuality,
  justReconnected: boolean,
  saveData: boolean,
  effectiveType: string | null,
  pendingCount: number
): string {
  if (justReconnected) {
    return pendingCount > 0
      ? `Back online — syncing ${pendingCount} pending action${pendingCount > 1 ? "s" : ""}...`
      : "Back online — you're all synced up";
  }

  if (!isOnline) {
    const base = "You're offline — browsing cached data";
    return pendingCount > 0
      ? `${base} (${pendingCount} action${pendingCount > 1 ? "s" : ""} will sync when connected)`
      : base;
  }

  if (quality === "slow") {
    const typeLabel = effectiveType ? ` (${effectiveType.toUpperCase()})` : "";
    const saveLabel = saveData ? " — data saver on" : "";
    return `Slow connection${typeLabel}${saveLabel} — using cached data where possible`;
  }

  return "";
}

async function checkPendingMutations(): Promise<number> {
  try {
    if (typeof indexedDB === "undefined") return 0;
    return new Promise((resolve) => {
      const request = indexedDB.open("event_dynamics_offline", 2);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("mutationQueue")) {
          db.close();
          resolve(0);
          return;
        }
        const tx = db.transaction("mutationQueue", "readonly");
        const store = tx.objectStore("mutationQueue");
        const countReq = store.count();
        countReq.onsuccess = () => {
          db.close();
          resolve(countReq.result);
        };
        countReq.onerror = () => {
          db.close();
          resolve(0);
        };
      };
      request.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}
