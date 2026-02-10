// src/hooks/use-network-status.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type ConnectionQuality = "good" | "slow" | "offline";

interface NetworkStatus {
  /** Whether the browser reports being online */
  isOnline: boolean;
  /** Estimated connection quality based on Network Information API */
  connectionQuality: ConnectionQuality;
  /** Effective connection type from Network Information API (4g, 3g, 2g, slow-2g) */
  effectiveType: string | null;
  /** Estimated downlink speed in Mbps */
  downlink: number | null;
  /** Whether the user is on a metered/save-data connection */
  saveData: boolean;
  /** Timestamp of the last connectivity change */
  lastChanged: number;
  /** Whether we just came back online (true for 5 seconds after reconnection) */
  justReconnected: boolean;
}

// Extend Navigator for Network Information API (not in all browsers)
interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  saveData: boolean;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

function getConnection(): NetworkInformation | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as NavigatorWithConnection;
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

function getConnectionQuality(connection: NetworkInformation | null, isOnline: boolean): ConnectionQuality {
  if (!isOnline) return "offline";
  if (!connection) return "good"; // Can't determine, assume good

  const { effectiveType, downlink } = connection;

  // slow-2g or 2g = slow; 3g with low downlink = slow
  if (effectiveType === "slow-2g" || effectiveType === "2g") return "slow";
  if (effectiveType === "3g" && downlink < 1) return "slow";

  return "good";
}

/**
 * Hook that provides comprehensive network status awareness.
 * Uses both the online/offline events and the Network Information API
 * to give components granular connectivity information.
 *
 * Particularly useful for African markets where connections may be
 * intermittent, slow, or metered.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    const connection = getConnection();
    return {
      isOnline: online,
      connectionQuality: getConnectionQuality(connection, online),
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      saveData: connection?.saveData || false,
      lastChanged: Date.now(),
      justReconnected: false,
    };
  });

  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOfflineRef = useRef(!status.isOnline);

  const updateFromConnection = useCallback(() => {
    const connection = getConnection();
    const online = navigator.onLine;
    setStatus((prev) => ({
      ...prev,
      isOnline: online,
      connectionQuality: getConnectionQuality(connection, online),
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      saveData: connection?.saveData || false,
    }));
  }, []);

  const handleOnline = useCallback(() => {
    const connection = getConnection();
    const wasOffline = wasOfflineRef.current;
    wasOfflineRef.current = false;

    setStatus((prev) => ({
      ...prev,
      isOnline: true,
      connectionQuality: getConnectionQuality(connection, true),
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      lastChanged: Date.now(),
      justReconnected: wasOffline,
    }));

    // Clear justReconnected after 5 seconds
    if (wasOffline) {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        setStatus((prev) => ({ ...prev, justReconnected: false }));
      }, 5000);
    }
  }, []);

  const handleOffline = useCallback(() => {
    wasOfflineRef.current = true;
    setStatus((prev) => ({
      ...prev,
      isOnline: false,
      connectionQuality: "offline",
      lastChanged: Date.now(),
      justReconnected: false,
    }));
  }, []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const connection = getConnection();
    if (connection) {
      connection.addEventListener("change", updateFromConnection);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener("change", updateFromConnection);
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [handleOnline, handleOffline, updateFromConnection]);

  return status;
}
