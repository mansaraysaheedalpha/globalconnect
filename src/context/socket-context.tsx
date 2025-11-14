//src/context/socket-context.tsx
"use client";

import { useAuthStore } from "@/store/auth.store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      const socketInstance = io(
        `${process.env.NEXT_PUBLIC_REALTIME_SERVICE_URL}/events`,
        {
          auth: { token },
        }
      );
      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [token]);

  // Use a separate effect for connection events to avoid re-binding on every render
  useEffect(() => {
    if (!socket) return;

    const onConnect = () =>
      console.log("✅ Central Socket Connected:", socket.id);
    const onDisconnect = () => console.log("🔌 Central Socket Disconnected");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected: !!socket?.connected }}
    >
      {children}
    </SocketContext.Provider>
  );
};
