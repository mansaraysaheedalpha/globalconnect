// src/hooks/use-socket.ts
"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

/**
 * Hook for managing a shared socket connection.
 * Used by producer dashboard components that need to monitor multiple sessions.
 */
export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Prevent multiple connections
    if (socketRef.current?.connected) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
      setError(err.message);
      setIsConnected(false);
    });

    newSocket.on("connectionAcknowledged", () => {
      setIsConnected(true);
    });

    newSocket.on("systemError", (data: { message: string }) => {
      console.error("[Socket] System error:", data.message);
      setError(data.message);
    });

    // Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("connectionAcknowledged");
      newSocket.off("systemError");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return {
    socket,
    isConnected,
    error,
  };
};
