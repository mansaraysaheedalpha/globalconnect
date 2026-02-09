// src/hooks/useVirtualStage.ts
"use client";

import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";

const REALTIME_BASE_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002";

interface CreateRoomOptions {
  sessionId: string;
  sessionTitle: string;
  eventId: string;
  maxParticipants?: number;
  expiryMinutes?: number;
  enableRecording?: boolean;
}

interface CreateRoomResult {
  success: boolean;
  roomName: string;
  roomUrl: string;
}

interface GetTokenOptions {
  sessionId: string;
  roomName: string;
  isSpeaker: boolean;
  broadcastOnly?: boolean;
}

interface GetTokenResult {
  success: boolean;
  token: string;
}

export function useVirtualStage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = useCallback(
    async (opts: CreateRoomOptions): Promise<CreateRoomResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${REALTIME_BASE_URL}/virtual-stage/rooms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(opts),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to create room (${res.status})`);
        }

        const data: CreateRoomResult = await res.json();
        if (!data.success) throw new Error("Failed to create room");
        return data;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getToken = useCallback(
    async (opts: GetTokenOptions): Promise<string | null> => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("[useVirtualStage] Requesting token with options:", opts);

        const authToken = useAuthStore.getState().token;
        const res = await fetch(`${REALTIME_BASE_URL}/virtual-stage/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(opts),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to get token (${res.status})`);
        }

        const data: GetTokenResult = await res.json();
        if (!data.success) throw new Error("Failed to get token");
        return data.token;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { createRoom, getToken, isLoading, error };
}
