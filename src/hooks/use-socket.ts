//src/hooks/use-socket.ts
"use client";

import { useSocketContext } from "@/context/socket-context";

// This hook now becomes a simple accessor for our global socket
export const useSocket = () => {
  const { socket } = useSocketContext();
  return socket;
};