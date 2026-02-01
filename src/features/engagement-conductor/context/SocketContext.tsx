"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/lib/env';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  subscribeToSession: (sessionId: string) => void;
  unsubscribeFromSession: (sessionId: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: ReactNode;
  sessionId: string;
  authToken?: string;
}

/**
 * Shared Socket Provider for Engagement Conductor
 *
 * Provides a single socket connection that all engagement conductor hooks can use,
 * preventing multiple duplicate connections per session.
 */
export const EngagementSocketProvider: React.FC<SocketProviderProps> = ({
  children,
  sessionId,
  authToken,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribedSessions, setSubscribedSessions] = useState<Set<string>>(new Set());

  // Initialize socket connection
  useEffect(() => {
    if (!sessionId) return;

    // Connect to the /events namespace where EngagementConductorGateway lives
    const baseUrl = getSocketUrl();
    const socketUrl = `${baseUrl}/events`;
    console.log('[EngagementSocket] Connecting to', socketUrl);

    const socketConnection = io(socketUrl, {
      query: { sessionId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: authToken ? { token: authToken } : undefined,
    });

    socketConnection.on('connect', () => {
      console.log('[EngagementSocket] Connected');
      setIsConnected(true);
      setError(null);

      // Re-subscribe to sessions after reconnect
      subscribedSessions.forEach((sid) => {
        socketConnection.emit('agent:subscribe', { sessionId: sid });
        socketConnection.emit('subscribe:engagement', { sessionId: sid });
      });
    });

    socketConnection.on('disconnect', (reason) => {
      console.log('[EngagementSocket] Disconnected:', reason);
      setIsConnected(false);
    });

    socketConnection.on('connect_error', (err) => {
      console.error('[EngagementSocket] Connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    socketConnection.on('reconnect', (attemptNumber) => {
      console.log('[EngagementSocket] Reconnected after', attemptNumber, 'attempts');
    });

    setSocket(socketConnection);

    // Cleanup on unmount
    return () => {
      console.log('[EngagementSocket] Disconnecting');
      socketConnection.disconnect();
    };
  }, [sessionId, authToken]); // Note: subscribedSessions intentionally omitted to avoid reconnect loop

  // Subscribe to a session's events
  const subscribeToSession = useCallback((sid: string) => {
    if (!socket?.connected) {
      console.warn('[EngagementSocket] Cannot subscribe - not connected');
      return;
    }

    if (subscribedSessions.has(sid)) {
      console.log('[EngagementSocket] Already subscribed to session', sid);
      return;
    }

    console.log('[EngagementSocket] Subscribing to session', sid);
    socket.emit('agent:subscribe', { sessionId: sid });
    socket.emit('subscribe:engagement', { sessionId: sid });

    setSubscribedSessions((prev) => new Set([...prev, sid]));
  }, [socket, subscribedSessions]);

  // Unsubscribe from a session's events
  const unsubscribeFromSession = useCallback((sid: string) => {
    if (!socket?.connected) return;

    console.log('[EngagementSocket] Unsubscribing from session', sid);
    socket.emit('agent:unsubscribe', { sessionId: sid });
    socket.emit('unsubscribe:engagement', { sessionId: sid });

    setSubscribedSessions((prev) => {
      const next = new Set(prev);
      next.delete(sid);
      return next;
    });
  }, [socket]);

  const value: SocketContextValue = {
    socket,
    isConnected,
    error,
    subscribeToSession,
    unsubscribeFromSession,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook to access the shared socket connection
 */
export const useEngagementSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useEngagementSocket must be used within an EngagementSocketProvider');
  }
  return context;
};
