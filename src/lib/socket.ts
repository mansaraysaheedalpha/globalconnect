// src/lib/socket.ts
"use client";

import { io, Socket } from "socket.io-client";
import { logger } from "./logger";

/**
 * Socket.io client for real-time communication
 * Used for: Waitlist offers, position updates, real-time notifications
 */

let socket: Socket | null = null;

/**
 * Initialize Socket.io connection
 * Call this when user logs in or needs real-time features
 */
export function initializeSocket(authToken?: string): Socket {
  // Return existing socket if already connected
  if (socket?.connected) {
    logger.info("Socket already connected, reusing connection");
    return socket;
  }

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002";

  logger.info("Initializing Socket.io connection", { url: socketUrl });

  socket = io(socketUrl, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
    auth: authToken
      ? {
          token: authToken,
        }
      : undefined,
  });

  // Connection events
  socket.on("connect", () => {
    logger.info("Socket connected", { socketId: socket?.id });
  });

  socket.on("disconnect", (reason) => {
    logger.info("Socket disconnected", { reason });
  });

  socket.on("connect_error", (error) => {
    logger.error("Socket connection error", error, {
      message: error.message,
    });
  });

  socket.on("reconnect", (attemptNumber) => {
    logger.info("Socket reconnected", { attemptNumber });
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    logger.info("Socket reconnection attempt", { attemptNumber });
  });

  socket.on("reconnect_failed", () => {
    logger.error("Socket reconnection failed", new Error("Max reconnection attempts reached"));
  });

  return socket;
}

/**
 * Get the existing socket instance
 * Returns null if not initialized
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect and cleanup socket
 * Call this on logout or when real-time features no longer needed
 */
export function disconnectSocket(): void {
  if (socket) {
    logger.info("Disconnecting socket");
    socket.disconnect();
    socket = null;
  }
}

/**
 * Join a user-specific room for personalized notifications
 * Backend emits events to: room "user:{userId}"
 */
export function joinUserRoom(userId: string): void {
  if (!socket?.connected) {
    logger.warn("Cannot join user room - socket not connected");
    return;
  }

  logger.info("Joining user room", { userId });
  socket.emit("join_room", `user:${userId}`);
}

/**
 * Leave a user-specific room
 */
export function leaveUserRoom(userId: string): void {
  if (!socket?.connected) {
    return;
  }

  logger.info("Leaving user room", { userId });
  socket.emit("leave_room", `user:${userId}`);
}

/**
 * Join a session-specific room for session waitlist updates
 * Backend emits events to: room "session:{sessionId}:waitlist"
 */
export function joinSessionWaitlistRoom(sessionId: string): void {
  if (!socket?.connected) {
    logger.warn("Cannot join session waitlist room - socket not connected");
    return;
  }

  logger.info("Joining session waitlist room", { sessionId });
  socket.emit("join_room", `session:${sessionId}:waitlist`);
}

/**
 * Leave a session waitlist room
 */
export function leaveSessionWaitlistRoom(sessionId: string): void {
  if (!socket?.connected) {
    return;
  }

  logger.info("Leaving session waitlist room", { sessionId });
  socket.emit("leave_room", `session:${sessionId}:waitlist`);
}

// Export socket instance type for typing
export type { Socket };