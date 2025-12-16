// src/hooks/use-notifications.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

// Notification types
export type NotificationType =
  | "session_reminder"
  | "personal"
  | "emergency"
  | "schedule_change"
  | "achievement"
  | "dm"
  | "mention";

export type NotificationSeverity = "low" | "medium" | "high" | "critical";

export type ScheduleChangeType =
  | "time_change"
  | "room_change"
  | "cancelled"
  | "added";

// Base notification structure
export interface BaseNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// Session reminder notification
export interface SessionReminderNotification extends BaseNotification {
  type: "session_reminder";
  sessionId: string;
  sessionTitle: string;
  startsIn: number; // minutes
}

// Personal notification
export interface PersonalNotification extends BaseNotification {
  type: "personal";
}

// Emergency alert notification
export interface EmergencyNotification extends BaseNotification {
  type: "emergency";
  alertType: string;
  severity: NotificationSeverity;
}

// Schedule change notification
export interface ScheduleChangeNotification extends BaseNotification {
  type: "schedule_change";
  changeType: ScheduleChangeType;
  sessionId: string;
  sessionTitle: string;
  oldValue?: string;
  newValue?: string;
}

// Union type for all notifications
export type Notification =
  | SessionReminderNotification
  | PersonalNotification
  | EmergencyNotification
  | ScheduleChangeNotification
  | BaseNotification;

interface NotificationsState {
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  error: string | null;
  emergencyAlert: EmergencyNotification | null;
}

// Max notifications to keep in memory
const MAX_NOTIFICATIONS = 100;

export const useNotifications = (eventId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<NotificationsState>({
    isConnected: false,
    notifications: [],
    unreadCount: 0,
    error: null,
    emergencyAlert: null,
  });
  const { token, user } = useAuthStore();

  // Notification ID counter for local notifications
  const notificationIdCounter = useRef(0);

  // Generate unique notification ID
  const generateNotificationId = useCallback(() => {
    notificationIdCounter.current++;
    return `notif-${Date.now()}-${notificationIdCounter.current}`;
  }, []);

  // Add notification to state
  const addNotification = useCallback((notification: Notification) => {
    setState((prev) => {
      const newNotifications = [notification, ...prev.notifications].slice(
        0,
        MAX_NOTIFICATIONS
      );
      const unreadCount = newNotifications.filter((n) => !n.isRead).length;

      return {
        ...prev,
        notifications: newNotifications,
        unreadCount,
      };
    });
  }, []);

  // Socket connection and event handling
  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: eventId ? { eventId } : {},
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true, error: null }));

      // Join event room for event-wide notifications
      if (eventId) {
        newSocket.emit("event.join", { eventId });
      }
    });

    newSocket.on("connectionAcknowledged", () => {
      console.log("[Notifications] Connected and listening for notifications");
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false }));
    });

    // Session reminder
    newSocket.on(
      "notification.session_reminder",
      (data: {
        sessionId: string;
        sessionTitle: string;
        startsIn: number;
      }) => {
        const notification: SessionReminderNotification = {
          id: generateNotificationId(),
          type: "session_reminder",
          title: "Session Starting Soon",
          message: `"${data.sessionTitle}" starts in ${data.startsIn} minutes`,
          timestamp: new Date().toISOString(),
          isRead: false,
          actionUrl: `/attendee/events/${eventId}/sessions/${data.sessionId}`,
          sessionId: data.sessionId,
          sessionTitle: data.sessionTitle,
          startsIn: data.startsIn,
        };

        addNotification(notification);
      }
    );

    // Personal notification
    newSocket.on(
      "notification.personal",
      (data: {
        type: string;
        title: string;
        message: string;
        actionUrl?: string;
      }) => {
        const notification: PersonalNotification = {
          id: generateNotificationId(),
          type: "personal",
          title: data.title,
          message: data.message,
          timestamp: new Date().toISOString(),
          isRead: false,
          actionUrl: data.actionUrl,
        };

        addNotification(notification);
      }
    );

    // Emergency alert
    newSocket.on(
      "notification.emergency",
      (data: {
        alertType: string;
        message: string;
        severity: NotificationSeverity;
        timestamp: string;
      }) => {
        const notification: EmergencyNotification = {
          id: generateNotificationId(),
          type: "emergency",
          title: "Emergency Alert",
          message: data.message,
          timestamp: data.timestamp || new Date().toISOString(),
          isRead: false,
          alertType: data.alertType,
          severity: data.severity,
        };

        addNotification(notification);

        // Set as active emergency alert if critical or high severity
        if (data.severity === "critical" || data.severity === "high") {
          setState((prev) => ({
            ...prev,
            emergencyAlert: notification,
          }));
        }
      }
    );

    // Schedule change
    newSocket.on(
      "notification.schedule_change",
      (data: {
        changeType: ScheduleChangeType;
        sessionId: string;
        sessionTitle: string;
        oldValue?: string;
        newValue?: string;
      }) => {
        let message = `Session "${data.sessionTitle}" has been `;
        switch (data.changeType) {
          case "time_change":
            message += `rescheduled from ${data.oldValue} to ${data.newValue}`;
            break;
          case "room_change":
            message += `moved from ${data.oldValue} to ${data.newValue}`;
            break;
          case "cancelled":
            message += "cancelled";
            break;
          case "added":
            message = `New session added: "${data.sessionTitle}"`;
            break;
        }

        const notification: ScheduleChangeNotification = {
          id: generateNotificationId(),
          type: "schedule_change",
          title: "Schedule Update",
          message,
          timestamp: new Date().toISOString(),
          isRead: false,
          actionUrl: `/attendee/events/${eventId}/sessions/${data.sessionId}`,
          changeType: data.changeType,
          sessionId: data.sessionId,
          sessionTitle: data.sessionTitle,
          oldValue: data.oldValue,
          newValue: data.newValue,
        };

        addNotification(notification);
      }
    );

    // Error handling
    newSocket.on("systemError", (error: { message: string }) => {
      console.error("[Notifications] System error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Notifications] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Cleanup
    return () => {
      if (eventId) {
        newSocket.emit("event.leave", { eventId });
      }
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("disconnect");
      newSocket.off("notification.session_reminder");
      newSocket.off("notification.personal");
      newSocket.off("notification.emergency");
      newSocket.off("notification.schedule_change");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [token, user, eventId, generateNotificationId, addNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setState((prev) => {
      const updatedNotifications = prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;

      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setState((prev) => {
      const updatedNotifications = prev.notifications.filter(
        (n) => n.id !== notificationId
      );
      const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;

      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: [],
      unreadCount: 0,
    }));
  }, []);

  // Dismiss emergency alert
  const dismissEmergencyAlert = useCallback(() => {
    setState((prev) => ({
      ...prev,
      emergencyAlert: null,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type: NotificationType): Notification[] => {
      return state.notifications.filter((n) => n.type === type);
    },
    [state.notifications]
  );

  // Add local notification (for non-socket notifications)
  const addLocalNotification = useCallback(
    (
      notification: Omit<Notification, "id" | "timestamp" | "isRead">
    ): string => {
      const id = generateNotificationId();
      const fullNotification: Notification = {
        ...notification,
        id,
        timestamp: new Date().toISOString(),
        isRead: false,
      } as Notification;

      addNotification(fullNotification);
      return id;
    },
    [generateNotificationId, addNotification]
  );

  return {
    // State
    isConnected: state.isConnected,
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    error: state.error,
    emergencyAlert: state.emergencyAlert,

    // Actions
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    dismissEmergencyAlert,
    clearError,
    addLocalNotification,

    // Utilities
    getNotificationsByType,
  };
};
