// src/hooks/use-event-prefetch.ts
//
// Prefetches event assets (images, attendee data) into browser/service worker cache
// when the attendee event page loads online. This ensures the event is browsable
// offline even if the user hasn't visited every section.

import { useEffect, useRef } from "react";
import { storeSyncMeta, getSyncMeta } from "@/lib/offline-storage";

const PREFETCH_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours

interface PrefetchOptions {
  eventId: string;
  /** Event hero image URL */
  eventImageUrl?: string | null;
  /** Attendee avatar URLs (from event attendees query) */
  attendeeImageUrls?: string[];
  /** Whether the event data has loaded */
  enabled: boolean;
}

/**
 * Preloads event images into the browser cache.
 * The Workbox service worker (CacheFirst for images) will intercept
 * these fetches and store them, making them available offline.
 */
function prefetchImages(urls: string[]): void {
  const validUrls = urls.filter((u) => u && u.startsWith("http"));
  if (validUrls.length === 0) return;

  for (const url of validUrls) {
    // Use <link rel="prefetch"> for non-blocking background fetch
    // Falls back to fetch() if prefetch links aren't supported
    if (typeof document !== "undefined") {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "image";
      link.href = url;
      // Remove after load to avoid DOM buildup
      link.onload = () => link.remove();
      link.onerror = () => link.remove();
      document.head.appendChild(link);
    }
  }
}

/**
 * Hook to prefetch event assets when the event page loads.
 * Respects a cooldown period to avoid excessive fetching.
 */
export function useEventPrefetch({
  eventId,
  eventImageUrl,
  attendeeImageUrls,
  enabled,
}: PrefetchOptions): void {
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !eventId || prefetchedRef.current) return;
    if (!navigator.onLine) return; // Don't prefetch when offline

    const run = async () => {
      // Check cooldown — skip if recently prefetched
      const lastPrefetch = await getSyncMeta<number>(`prefetch_${eventId}`);
      if (lastPrefetch && Date.now() - lastPrefetch < PREFETCH_COOLDOWN_MS) {
        return;
      }

      prefetchedRef.current = true;

      // Collect all image URLs to prefetch
      const urls: string[] = [];
      if (eventImageUrl) urls.push(eventImageUrl);
      if (attendeeImageUrls) urls.push(...attendeeImageUrls);

      if (urls.length > 0) {
        prefetchImages(urls);
      }

      // Record prefetch timestamp
      await storeSyncMeta(`prefetch_${eventId}`, Date.now());
    };

    run();
  }, [enabled, eventId, eventImageUrl, attendeeImageUrls]);
}
