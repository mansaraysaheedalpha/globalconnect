// src/components/features/notifications/notifications-container.tsx
"use client";

import React from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationBell } from "./notification-bell";
import { EmergencyAlertBanner } from "./emergency-alert";
import { cn } from "@/lib/utils";

interface NotificationsContainerProps {
  eventId?: string; // Optional - for event-specific notifications
  className?: string;
}

/**
 * Container component that combines the notifications hook with UI components.
 * Use in layouts/pages to provide notifications functionality.
 */
export const NotificationsContainer = ({
  eventId,
  className = "",
}: NotificationsContainerProps) => {
  const {
    notifications,
    unreadCount,
    emergencyAlert,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    dismissEmergencyAlert,
  } = useNotifications(eventId);

  return (
    <>
      {/* Emergency Alert Banner - shows at top of screen */}
      {emergencyAlert && (
        <EmergencyAlertBanner
          alert={emergencyAlert}
          onDismiss={dismissEmergencyAlert}
        />
      )}

      {/* Notification Bell */}
      <NotificationBell
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onRemove={removeNotification}
        onClearAll={clearAllNotifications}
        className={className}
      />
    </>
  );
};

/**
 * Header integration - just the bell without emergency banner
 * (emergency banner should be rendered at layout level)
 */
export const NotificationBellOnly = ({
  eventId,
  className = "",
}: NotificationsContainerProps) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications(eventId);

  return (
    <NotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onRemove={removeNotification}
      onClearAll={clearAllNotifications}
      className={className}
    />
  );
};

/**
 * Emergency alert only - for layout-level rendering
 */
export const EmergencyAlertOnly = ({ eventId }: { eventId?: string }) => {
  const { emergencyAlert, dismissEmergencyAlert } = useNotifications(eventId);

  if (!emergencyAlert) return null;

  return (
    <EmergencyAlertBanner
      alert={emergencyAlert}
      onDismiss={dismissEmergencyAlert}
    />
  );
};
