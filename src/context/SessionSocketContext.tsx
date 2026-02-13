"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { useApolloClient } from '@apollo/client';
import { toast } from 'sonner';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

interface SessionSocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  isJoined: boolean;
  connectionState: ConnectionState;
  error: string | null;
  sessionId: string;
  eventId: string;
  // Session settings from server
  chatOpen: boolean;
  qaOpen: boolean;
  pollsOpen: boolean;
  reactionsOpen: boolean;
}

const SessionSocketContext = createContext<SessionSocketContextValue | null>(null);

interface SessionSocketProviderProps {
  children: ReactNode;
  sessionId: string;
  eventId: string;
  initialChatOpen?: boolean;
  initialQaOpen?: boolean;
  initialPollsOpen?: boolean;
  initialReactionsOpen?: boolean;
}

/**
 * Shared Socket Provider for Session Features (Chat, Q&A, Polls)
 *
 * Provides a SINGLE socket connection that all session hooks can use,
 * preventing multiple duplicate connections per session.
 *
 * This provider should wrap all session-related components to ensure
 * they share the same socket connection.
 */
export const SessionSocketProvider: React.FC<SessionSocketProviderProps> = ({
  children,
  sessionId,
  eventId,
  initialChatOpen = false,
  initialQaOpen = false,
  initialPollsOpen = false,
  initialReactionsOpen = false,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(initialChatOpen);
  const [qaOpen, setQaOpen] = useState(initialQaOpen);
  const [pollsOpen, setPollsOpen] = useState(initialPollsOpen);
  const [reactionsOpen, setReactionsOpen] = useState(initialReactionsOpen);

  // Track if we've already created a socket to prevent double-creation in StrictMode
  const socketCreatedRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  const { token } = useAuthStore();
  const apolloClient = useApolloClient();

  // Initialize socket connection
  useEffect(() => {
    if (!sessionId || !eventId || !token) {
      return;
    }

    // Prevent duplicate socket creation (React StrictMode safety)
    if (socketCreatedRef.current && socketRef.current?.connected) {
      console.log('[SessionSocket] Socket already exists and connected, skipping creation');
      return;
    }

    const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    console.log('[SessionSocket] Creating shared socket connection for session', sessionId);
    socketCreatedRef.current = true;
    setConnectionState('connecting');
    setError(null);

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId, eventId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('[SessionSocket] Connected');
      setIsConnected(true);
      setConnectionState('connected');
      setError(null);
    });

    newSocket.on('connectionAcknowledged', () => {
      // Join the session room
      console.log('[SessionSocket] Connection acknowledged, joining session', sessionId);
      newSocket.emit('session.join', { sessionId, eventId }, (response: {
        success: boolean;
        error?: { message: string; statusCode: number };
        session?: { chatOpen?: boolean; qaOpen?: boolean; pollsOpen?: boolean };
      }) => {
        if (response?.success === false) {
          const errorMsg = response.error?.message || 'Failed to join session';
          console.error('[SessionSocket] Failed to join session:', errorMsg);
          setError(errorMsg);
          setIsJoined(false);
          return;
        }

        console.log('[SessionSocket] Successfully joined session', sessionId);
        setIsJoined(true);
        setError(null);

        // Update session settings from server
        if (response.session) {
          if (response.session.chatOpen !== undefined) setChatOpen(response.session.chatOpen);
          if (response.session.qaOpen !== undefined) setQaOpen(response.session.qaOpen);
          if (response.session.pollsOpen !== undefined) setPollsOpen(response.session.pollsOpen);
        }
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[SessionSocket] Disconnected:', reason);
      setIsConnected(false);
      setIsJoined(false);

      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        setConnectionState('disconnected');
      } else {
        setConnectionState('reconnecting');
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('[SessionSocket] Connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
      setConnectionState('error');
    });

    newSocket.on('reconnect_attempt', () => {
      setConnectionState('reconnecting');
    });

    newSocket.on('reconnect', () => {
      console.log('[SessionSocket] Reconnected');
      setConnectionState('connected');
      setError(null);
    });

    // Listen for session settings changes
    newSocket.on('chat.status.changed', (data: { sessionId: string; isOpen: boolean }) => {
      if (data.sessionId === sessionId) {
        setChatOpen(data.isOpen);
      }
    });

    newSocket.on('qa.status.changed', (data: { sessionId: string; isOpen: boolean }) => {
      if (data.sessionId === sessionId) {
        setQaOpen(data.isOpen);
      }
    });

    newSocket.on('polls.status.changed', (data: { sessionId: string; isOpen: boolean }) => {
      if (data.sessionId === sessionId) {
        setPollsOpen(data.isOpen);
      }
    });

    newSocket.on('reactions.status.changed', (data: { sessionId: string; isOpen: boolean }) => {
      if (data.sessionId === sessionId) {
        setReactionsOpen(data.isOpen);
      }
    });

    // Listen for event/session update notifications (organizer changed times, etc.)
    newSocket.on('event.updated', (data: { eventId: string; eventName: string }) => {
      if (data.eventId === eventId) {
        toast.info('Event Updated', {
          description: `${data.eventName} details have been updated.`,
          action: {
            label: 'Refresh',
            onClick: () => apolloClient.refetchQueries({
              include: ['GetMyRegistrations', 'GetAttendeeEventDetails'],
            }),
          },
          duration: 10000,
        });
        apolloClient.refetchQueries({
          include: ['GetMyRegistrations', 'GetAttendeeEventDetails'],
        });
      }
    });

    newSocket.on('session.updated', (data: { sessionId: string; sessionTitle: string; eventId: string }) => {
      if (data.eventId === eventId) {
        toast.info('Session Updated', {
          description: `"${data.sessionTitle}" schedule has been updated.`,
          action: {
            label: 'Refresh',
            onClick: () => apolloClient.refetchQueries({
              include: ['GetAttendeeEventDetails'],
            }),
          },
          duration: 10000,
        });
        apolloClient.refetchQueries({
          include: ['GetAttendeeEventDetails'],
        });
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('[SessionSocket] Cleaning up socket connection');
      socketCreatedRef.current = false;
      socketRef.current = null;
      newSocket.emit('session.leave', { sessionId });
      newSocket.off('connect');
      newSocket.off('connectionAcknowledged');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('reconnect_attempt');
      newSocket.off('reconnect');
      newSocket.off('chat.status.changed');
      newSocket.off('qa.status.changed');
      newSocket.off('polls.status.changed');
      newSocket.off('reactions.status.changed');
      newSocket.off('event.updated');
      newSocket.off('session.updated');
      newSocket.disconnect();
    };
  }, [sessionId, eventId, token, apolloClient]);

  const value: SessionSocketContextValue = {
    socket,
    isConnected,
    isJoined,
    connectionState,
    error,
    sessionId,
    eventId,
    chatOpen,
    qaOpen,
    pollsOpen,
    reactionsOpen,
  };

  return (
    <SessionSocketContext.Provider value={value}>
      {children}
    </SessionSocketContext.Provider>
  );
};

/**
 * Hook to access the shared session socket connection.
 * Must be used within a SessionSocketProvider.
 */
export const useSessionSocket = (): SessionSocketContextValue => {
  const context = useContext(SessionSocketContext);
  if (!context) {
    throw new Error('useSessionSocket must be used within a SessionSocketProvider');
  }
  return context;
};

/**
 * Hook that safely returns the session socket context, or null if not within provider.
 * Useful for components that may or may not be wrapped in the provider.
 */
export const useSessionSocketOptional = (): SessionSocketContextValue | null => {
  return useContext(SessionSocketContext);
};
