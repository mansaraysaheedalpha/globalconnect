// src/components/ui/offline-banner.tsx
"use client";

import { useNetworkStatus } from "@/hooks/use-network-status";
import { getPendingMutationCount } from "@/lib/offline-storage";
import { WifiOff, Wifi, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * A non-intrusive banner that appears when the user is offline or just reconnected.
 * Slides down from the top of the viewport and shows contextual messages.
 *
 * Slow-connection handling (caching, reduced payloads) still works behind the
 * scenes via useNetworkStatus — we just don't show a visible banner for it.
 */
export function OfflineBanner() {
  const { isOnline, justReconnected } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Check for pending mutations using shared offline-storage utility
  useEffect(() => {
    if (!isOnline) {
      getPendingMutationCount().then(setPendingCount).catch(() => setPendingCount(0));
    }
    if (justReconnected) {
      setPendingCount(0);
    }
  }, [isOnline, justReconnected]);

  // Show/hide with a slight delay for smooth animation
  useEffect(() => {
    if (!isOnline || justReconnected) {
      setVisible(true);
    } else {
      // Small delay before hiding to let the "back online" message show
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOnline, justReconnected]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-4 py-2.5 text-sm font-medium text-center transition-all duration-300 ease-in-out",
        "flex items-center justify-center gap-2",
        getBannerStyles(isOnline, justReconnected)
      )}
    >
      {getBannerIcon(isOnline, justReconnected)}
      <span>{getBannerMessage(isOnline, justReconnected, pendingCount)}</span>
    </div>
  );
}

function getBannerStyles(isOnline: boolean, justReconnected: boolean): string {
  if (justReconnected) {
    return "bg-emerald-600 text-white animate-in slide-in-from-top";
  }
  if (!isOnline) {
    return "bg-amber-600 text-white animate-in slide-in-from-top";
  }
  return "";
}

function getBannerIcon(isOnline: boolean, justReconnected: boolean) {
  if (justReconnected) return <Check className="h-4 w-4" />;
  if (!isOnline) return <WifiOff className="h-4 w-4" />;
  return <Wifi className="h-4 w-4" />;
}

function getBannerMessage(
  isOnline: boolean,
  justReconnected: boolean,
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

  return "";
}
