// src/hooks/use-sync-bundle.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  storeItem,
  storeItems,
  getItem,
  getAllItems,
  getLastSyncTime,
  setLastSyncTime,
  isOffline,
} from "@/lib/offline-storage";

// Types for sync bundle data
export interface SyncBundleEvent {
  id: string;
  organization_id: string;
  name: string;
  version: number;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  venue_id: string | null;
  is_public: boolean;
  is_archived: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
}

export interface SyncBundleSpeaker {
  id: string;
  organization_id: string;
  name: string;
  bio: string;
  expertise: string[];
  is_archived: boolean;
}

export interface SyncBundleSession {
  id: string;
  event_id: string;
  title: string;
  start_time: string;
  end_time: string;
  chat_enabled: boolean;
  qa_enabled: boolean;
  polls_enabled: boolean;
  chat_open: boolean;
  qa_open: boolean;
  polls_open: boolean;
  speakers: SyncBundleSpeaker[];
}

export interface SyncBundleVenue {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  is_archived: boolean;
}

export interface SyncBundle {
  event: SyncBundleEvent;
  sessions: SyncBundleSession[];
  speakers: SyncBundleSpeaker[];
  venue: SyncBundleVenue | null;
}

interface UseSyncBundleOptions {
  organizationId: string;
  eventId: string;
  /**
   * Whether to automatically sync when online status changes
   */
  autoSync?: boolean;
  /**
   * Minimum time between syncs in milliseconds (default: 5 minutes)
   */
  syncInterval?: number;
}

export function useSyncBundle({
  organizationId,
  eventId,
  autoSync = true,
  syncInterval = 5 * 60 * 1000, // 5 minutes
}: UseSyncBundleOptions) {
  const { token } = useAuthStore();
  const [bundle, setBundle] = useState<SyncBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(!isOffline());

  /**
   * Fetch sync bundle from the API
   */
  const fetchBundle = useCallback(async (): Promise<SyncBundle | null> => {
    if (!token) {
      setError("Authentication required");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${baseUrl}/api/v1/organizations/${organizationId}/events/${eventId}/sync-bundle`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Sync bundle endpoint not available");
        }
        throw new Error(`Failed to fetch sync bundle: ${response.statusText}`);
      }

      const data: SyncBundle = await response.json();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch sync bundle";
      setError(errorMessage);
      console.error("[useSyncBundle] Error:", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, organizationId, eventId]);

  /**
   * Store bundle data locally for offline access
   */
  const storeLocally = useCallback(async (data: SyncBundle): Promise<void> => {
    try {
      // Store event
      await storeItem("events", data.event);

      // Store sessions
      if (data.sessions.length > 0) {
        await storeItems("sessions", data.sessions);
      }

      // Store speakers (deduplicated)
      if (data.speakers.length > 0) {
        await storeItems("speakers", data.speakers);
      }

      // Store venue
      if (data.venue) {
        await storeItem("venues", data.venue);
      }

      // Update sync metadata
      await setLastSyncTime(data.event.id);

      console.log(
        "[useSyncBundle] Stored bundle locally for event:",
        data.event.id
      );
    } catch (err) {
      console.error("[useSyncBundle] Failed to store bundle locally:", err);
    }
  }, []);

  /**
   * Load bundle from local storage
   */
  const loadFromLocal = useCallback(async (): Promise<SyncBundle | null> => {
    try {
      const event = await getItem<SyncBundleEvent>("events", eventId);
      if (!event) return null;

      const allSessions = await getAllItems<SyncBundleSession>("sessions");
      const sessions = allSessions.filter((s) => s.event_id === eventId);

      const allSpeakers = await getAllItems<SyncBundleSpeaker>("speakers");
      // Get speaker IDs from sessions
      const speakerIds = new Set(
        sessions.flatMap((s) => s.speakers.map((sp) => sp.id))
      );
      const speakers = allSpeakers.filter((s) => speakerIds.has(s.id));

      let venue: SyncBundleVenue | null = null;
      if (event.venue_id) {
        venue = await getItem<SyncBundleVenue>("venues", event.venue_id);
      }

      return { event, sessions, speakers, venue };
    } catch (err) {
      console.error("[useSyncBundle] Failed to load from local:", err);
      return null;
    }
  }, [eventId]);

  /**
   * Sync bundle - fetch from API and store locally
   */
  const sync = useCallback(async (): Promise<boolean> => {
    if (isOffline()) {
      console.log("[useSyncBundle] Offline - skipping sync");
      // Try to load from local storage instead
      const localBundle = await loadFromLocal();
      if (localBundle) {
        setBundle(localBundle);
      }
      return false;
    }

    const data = await fetchBundle();
    if (!data) return false;

    setBundle(data);
    await storeLocally(data);
    setLastSynced(new Date());

    return true;
  }, [fetchBundle, storeLocally, loadFromLocal]);

  /**
   * Check if sync is needed based on interval
   */
  const shouldSync = useCallback(async (): Promise<boolean> => {
    const lastSync = await getLastSyncTime(eventId);
    if (!lastSync) return true;

    const timeSinceLastSync = Date.now() - lastSync;
    return timeSinceLastSync > syncInterval;
  }, [eventId, syncInterval]);

  /**
   * Smart sync - only syncs if needed based on interval
   */
  const smartSync = useCallback(async (): Promise<boolean> => {
    const needsSync = await shouldSync();
    if (!needsSync) {
      console.log("[useSyncBundle] Skipping sync - recently synced");
      // Load from local if we have no data
      if (!bundle) {
        const localBundle = await loadFromLocal();
        if (localBundle) {
          setBundle(localBundle);
        }
      }
      return false;
    }

    return sync();
  }, [shouldSync, sync, bundle, loadFromLocal]);

  /**
   * Get local version of event for conflict detection
   */
  const getLocalVersion = useCallback(async (): Promise<number> => {
    const event = await getItem<SyncBundleEvent>("events", eventId);
    return event?.version || 0;
  }, [eventId]);

  /**
   * Check if remote version is newer than local
   */
  const hasNewerVersion = useCallback(
    async (remoteVersion: number): Promise<boolean> => {
      const localVersion = await getLocalVersion();
      return remoteVersion > localVersion;
    },
    [getLocalVersion]
  );

  // Listen for online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log("[useSyncBundle] Online - triggering sync");
      setIsOnline(true);
      if (autoSync) {
        sync();
      }
    };

    const handleOffline = () => {
      console.log("[useSyncBundle] Offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [autoSync, sync]);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      // First, try to load from local storage for instant display
      const localBundle = await loadFromLocal();
      if (localBundle) {
        setBundle(localBundle);
      }

      // Then sync if online and needed
      if (!isOffline() && autoSync) {
        await smartSync();
      }
    };

    if (eventId && organizationId) {
      initialize();
    }
  }, [eventId, organizationId, autoSync, loadFromLocal, smartSync]);

  return {
    bundle,
    loading,
    error,
    lastSynced,
    isOnline,
    sync,
    smartSync,
    loadFromLocal,
    getLocalVersion,
    hasNewerVersion,
  };
}
