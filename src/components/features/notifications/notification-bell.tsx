// src/components/features/notifications/notification-bell.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Notification,
  NotificationType,
} from "@/hooks/use-notifications";
import {
  Bell,
  BellOff,
  Clock,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Trophy,
  X,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

/**
 * Notification bell with dropdown
 */
export const NotificationBell = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
  onClearAll,
  className = "",
}: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center"
            >
              <Badge
                variant="destructive"
                className="h-5 min-w-[20px] px-1.5 text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="h-7 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-7 text-xs text-muted-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    layout
                  >
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={() => onMarkAsRead(notification.id)}
                      onRemove={() => onRemove(notification.id)}
                      onClose={() => setIsOpen(false)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onRemove: () => void;
  onClose: () => void;
}

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onRemove,
  onClose,
}: NotificationItemProps) => {
  const Icon = getNotificationIcon(notification.type);
  const iconColorClass = getNotificationIconColor(notification);
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), {
    addSuffix: true,
  });

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead();
    }
    if (notification.actionUrl) {
      onClose();
    }
  };

  const content = (
    <div
      className={cn(
        "flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
        !notification.isRead && "bg-primary/5"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          iconColorClass
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm",
              !notification.isRead ? "font-medium" : "text-muted-foreground"
            )}
          >
            {notification.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex-shrink-0 p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {!notification.isRead && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
          {notification.actionUrl && (
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="group">
        {content}
      </Link>
    );
  }

  return <div className="group">{content}</div>;
};

// Helper functions
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "session_reminder":
      return Clock;
    case "emergency":
      return AlertTriangle;
    case "schedule_change":
      return Calendar;
    case "dm":
    case "mention":
      return MessageSquare;
    case "achievement":
      return Trophy;
    default:
      return Bell;
  }
}

function getNotificationIconColor(notification: Notification): string {
  if (notification.type === "emergency") {
    const severity = (notification as any).severity;
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      case "medium":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    }
  }

  switch (notification.type) {
    case "session_reminder":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    case "schedule_change":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
    case "achievement":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "dm":
    case "mention":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/**
 * Compact notification badge for mobile
 */
interface NotificationBadgeProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export const NotificationBadge = ({
  count,
  onClick,
  className = "",
}: NotificationBadgeProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn("relative", className)}
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-destructive text-destructive-foreground text-xs rounded-full">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
};
