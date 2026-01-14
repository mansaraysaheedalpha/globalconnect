// src/components/features/proximity/ping-notification.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { ProximityPing } from "@/types/proximity";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Bell, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PingNotificationProps {
  ping: ProximityPing;
  onDismiss: () => void;
  onReply?: (userId: string) => void;
  autoDismissMs?: number;
  className?: string;
}

export const PingNotification = ({
  ping,
  onDismiss,
  onReply,
  autoDismissMs = 8000,
  className = "",
}: PingNotificationProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const onDismissRef = useRef(onDismiss);

  // Keep ref updated without triggering effect
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismissRef.current(), 300);
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  const handleReply = () => {
    if (onReply) {
      onReply(ping.fromUser.id);
    }
    handleDismiss();
  };

  return (
    <div
      className={cn(
        "bg-background border rounded-lg shadow-lg p-4 max-w-sm",
        "animate-in slide-in-from-right-full duration-300",
        isExiting && "animate-out slide-out-to-right-full duration-300",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="p-2 rounded-full bg-primary/10 shrink-0">
          <Bell className="h-5 w-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm">{ping.fromUser.name}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1 break-words">
            {ping.message}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(ping.receivedAt), {
                addSuffix: true,
              })}
            </span>
            {onReply && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReply}
                className="h-7"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Container for multiple ping notifications
 */
interface PingNotificationsContainerProps {
  pings: ProximityPing[];
  onDismiss: (index: number) => void;
  onReply?: (userId: string) => void;
  position?: "top-right" | "bottom-right";
  maxVisible?: number;
  className?: string;
}

export const PingNotificationsContainer = ({
  pings,
  onDismiss,
  onReply,
  position = "top-right",
  maxVisible = 3,
  className = "",
}: PingNotificationsContainerProps) => {
  const visiblePings = pings.slice(0, maxVisible);

  if (visiblePings.length === 0) {
    return null;
  }

  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-20 right-4",
  };

  return (
    <div
      className={cn(
        "fixed z-[100] space-y-2",
        positionClasses[position],
        className
      )}
    >
      {visiblePings.map((ping, index) => (
        <PingNotification
          key={`${ping.fromUser.id}-${ping.receivedAt}`}
          ping={ping}
          onDismiss={() => onDismiss(index)}
          onReply={onReply}
        />
      ))}
      {pings.length > maxVisible && (
        <div className="text-xs text-muted-foreground text-right pr-2">
          +{pings.length - maxVisible} more notifications
        </div>
      )}
    </div>
  );
};
