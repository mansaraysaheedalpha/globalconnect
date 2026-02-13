// src/hooks/use-team-notifications.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

export type TeamNotificationType =
  | "member.joined"
  | "member.left"
  | "rank.changed"
  | "challenge.starting"
  | "challenge.progress"
  | "challenge.completed"
  | "trivia.starting"
  | "synergy.active";

export interface TeamNotification {
  id: string;
  type: TeamNotificationType;
  teamId: string;
  timestamp: string;
  data: Record<string, any>;
}

interface UseTeamNotificationsOptions {
  sessionId: string;
  teamId?: string;
  autoConnect?: boolean;
}

const MAX_NOTIFICATIONS = 20;

export const useTeamNotifications = ({
  sessionId,
  teamId,
  autoConnect = true,
}: UseTeamNotificationsOptions) => {
  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<TeamNotification[]>([]);
  const [latestNotification, setLatestNotification] = useState<TeamNotification | null>(null);

  const addNotification = useCallback((type: TeamNotificationType, data: any) => {
    const notification: TeamNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      teamId: data.teamId || "",
      timestamp: data.timestamp || new Date().toISOString(),
      data,
    };

    setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
    setLatestNotification(notification);
  }, []);

  const dismissLatest = useCallback(() => {
    setLatestNotification(null);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setLatestNotification(null);
  }, []);

  useEffect(() => {
    if (!sessionId || !token || !autoConnect) return;

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("session.join", { sessionId });
    });

    newSocket.on("disconnect", () => setIsConnected(false));

    // Team notification events
    const notificationEvents: Array<{ event: string; type: TeamNotificationType }> = [
      { event: "team.notification.member.joined", type: "member.joined" },
      { event: "team.notification.member.left", type: "member.left" },
      { event: "team.notification.rank.changed", type: "rank.changed" },
      { event: "team.notification.challenge.starting", type: "challenge.starting" },
      { event: "team.notification.challenge.progress", type: "challenge.progress" },
      { event: "team.notification.challenge.completed", type: "challenge.completed" },
      { event: "team.notification.trivia.starting", type: "trivia.starting" },
      { event: "team.notification.synergy.active", type: "synergy.active" },
    ];

    for (const { event, type } of notificationEvents) {
      newSocket.on(event, (data: any) => {
        if (!data) return;
        addNotification(type, data);
      });
    }

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      for (const { event } of notificationEvents) {
        newSocket.off(event);
      }
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, token, autoConnect, addNotification]);

  return {
    isConnected,
    notifications,
    latestNotification,
    dismissLatest,
    clearAll,
    unreadCount: notifications.length,
  };
};
