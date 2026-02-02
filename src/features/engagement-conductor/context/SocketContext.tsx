"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/lib/env';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connectionState: ConnectionState;
  error: string | null;
  reconnectAttempts: number;
  subscribeToSession: (sessionId: string) => void;
  unsubscribeFromSession: (sessionId: string) => void;
  manualReconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: ReactNode;
  sessionId: string;
  authToken?: string;
}

// User-friendly error messages
function getErrorMessage(error: string): string {
  if (error.includes('CORS')) {
    return 'Connection blocked by security settings. Please contact support.';
  }
  if (error.includes('timeout')) {
    return 'Connection timed out. The server may be unavailable.';
  }
  if (error.includes('unauthorized') || error.includes('401')) {
    return 'Authentication failed. Please log in again.';
  }
  if (error.includes('forbidden') || error.includes('403')) {
    return 'Access denied. You may not have permission for this session.';
  }
  if (error.includes('websocket')) {
    return 'WebSocket connection failed. Trying alternative connection...';
  }
  return `Connection error: ${error}`;
}

/**
 * Shared Socket Provider for Engagement Conductor
 *
 * Provides a single socket connection that all engagement conductor hooks can use,
 * preventing multiple duplicate connections per session.
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Manual reconnect function for user-triggered retries
 * - Detailed connection state for UI feedback
 * - Graceful degradation with user-friendly error messages
 */
export const EngagementSocketProvider: React.FC<SocketProviderProps> = ({
  children,
  sessionId,
  authToken,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [subscribedSessions, setSubscribedSessions] = useState<Set<string>>(new Set());

  // Use ref to track subscribed sessions for reconnection without causing effect re-runs
  const subscribedSessionsRef = useRef<Set<string>>(new Set());
  subscribedSessionsRef.current = subscribedSessions;

  // Initialize socket connection
  useEffect(() => {
    if (!sessionId) return;

    // Connect to the /events namespace where EngagementConductorGateway lives
    const baseUrl = getSocketUrl();
    const socketUrl = `${baseUrl}/events`;
    console.log('[EngagementSocket] Connecting to', socketUrl);

    setConnectionState('connecting');
    setError(null);

    const socketConnection = io(socketUrl, {
      query: { sessionId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 10,
      timeout: 20000,
      auth: authToken ? { token: authToken } : undefined,
    });

    socketConnection.on('connect', () => {
      console.log('[EngagementSocket] Connected');
      setIsConnected(true);
      setConnectionState('connected');
      setError(null);
      setReconnectAttempts(0);

      // Re-subscribe to sessions after reconnect
      subscribedSessionsRef.current.forEach((sid) => {
        socketConnection.emit('agent:subscribe', { sessionId: sid });
        socketConnection.emit('subscribe:engagement', { sessionId: sid });
      });
    });

    socketConnection.on('disconnect', (reason) => {
      console.log('[EngagementSocket] Disconnected:', reason);
      setIsConnected(false);

      // Set appropriate state based on disconnect reason
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        setConnectionState('disconnected');
      } else {
        // Transport close, ping timeout, etc. - will try to reconnect
        setConnectionState('reconnecting');
      }
    });

    socketConnection.on('connect_error', (err) => {
      console.error('[EngagementSocket] Connection error:', err.message);
      setError(getErrorMessage(err.message));
      setIsConnected(false);
      setConnectionState('error');
    });

    socketConnection.on('reconnect_attempt', (attemptNumber) => {
      console.log('[EngagementSocket] Reconnection attempt', attemptNumber);
      setConnectionState('reconnecting');
      setReconnectAttempts(attemptNumber);
    });

    socketConnection.on('reconnect', (attemptNumber) => {
      console.log('[EngagementSocket] Reconnected after', attemptNumber, 'attempts');
      setConnectionState('connected');
      setReconnectAttempts(0);
      setError(null);
    });

    socketConnection.on('reconnect_failed', () => {
      console.error('[EngagementSocket] Reconnection failed after max attempts');
      setConnectionState('error');
      setError('Unable to reconnect. Please check your internet connection and try again.');
    });

    setSocket(socketConnection);

    // Cleanup on unmount
    return () => {
      console.log('[EngagementSocket] Disconnecting');
      socketConnection.disconnect();
    };
  }, [sessionId, authToken]);

  // Manual reconnect function for user-triggered retries
  const manualReconnect = useCallback(() => {
    if (!socket) {
      console.warn('[EngagementSocket] No socket to reconnect');
      return;
    }

    console.log('[EngagementSocket] Manual reconnect triggered');
    setConnectionState('connecting');
    setError(null);
    setReconnectAttempts(0);

    // Disconnect and reconnect
    socket.disconnect();
    socket.connect();
  }, [socket]);

  // Subscribe to a session's events
  const subscribeToSession = useCallback((sid: string) => {
    if (!socket?.connected) {
      console.warn('[EngagementSocket] Cannot subscribe - not connected. Will retry when connected.');
      // Still track it so we subscribe when connected
      setSubscribedSessions((prev) => new Set([...prev, sid]));
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
    if (!socket?.connected) {
      // Still remove from tracked sessions
      setSubscribedSessions((prev) => {
        const next = new Set(prev);
        next.delete(sid);
        return next;
      });
      return;
    }

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
    connectionState,
    error,
    reconnectAttempts,
    subscribeToSession,
    unsubscribeFromSession,
    manualReconnect,
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
