// src/components/features/proximity/proximity-container.tsx
"use client";

import React, { useCallback, useState } from "react";
import { useProximity } from "@/hooks/use-proximity";
import { FloatingProximityWidget } from "./floating-proximity-widget";
import { PingNotificationsContainer } from "./ping-notification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

interface ProximityContainerProps {
  eventId: string;
  position?: "bottom-left" | "bottom-right";
  onReplyToPing?: (userId: string) => void;
  className?: string;
}

/**
 * Main container component for the proximity networking feature.
 * Orchestrates the floating widget and ping notifications.
 */
export const ProximityContainer = ({
  eventId,
  position = "bottom-right",
  onReplyToPing,
  className = "",
}: ProximityContainerProps) => {
  const {
    nearbyUsers,
    receivedPings,
    isTracking,
    isConnected,
    error,
    locationPermission,
    startTracking,
    stopTracking,
    sendPing,
    dismissPing,
    clearError,
  } = useProximity({ eventId });

  // State for quick reply dialog
  const [replyTarget, setReplyTarget] = useState<{ id: string; name: string } | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const handleReplyToPing = useCallback(
    (userId: string) => {
      // Find the ping sender's info from received pings
      const ping = receivedPings.find((p) => p.fromUser.id === userId);
      if (ping) {
        setReplyTarget({ id: userId, name: ping.fromUser.name });
        setReplyMessage("");
      }
      // Also call external handler if provided
      if (onReplyToPing) {
        onReplyToPing(userId);
      }
    },
    [receivedPings, onReplyToPing]
  );

  const handleSendReply = async () => {
    if (!replyTarget) return;

    setIsSendingReply(true);
    const success = await sendPing(replyTarget.id, replyMessage.trim() || undefined);
    setIsSendingReply(false);

    if (success) {
      setReplyTarget(null);
      setReplyMessage("");
    }
  };

  const handleCloseReplyDialog = () => {
    setReplyTarget(null);
    setReplyMessage("");
  };

  return (
    <>
      {/* Floating widget button with sheet */}
      <FloatingProximityWidget
        nearbyUsers={nearbyUsers}
        unreadPingCount={receivedPings.length}
        isTracking={isTracking}
        isConnected={isConnected}
        error={error}
        locationPermission={locationPermission}
        onStartTracking={startTracking}
        onStopTracking={stopTracking}
        onSendPing={sendPing}
        onClearError={clearError}
        position={position}
        className={className}
      />

      {/* Ping notifications */}
      <PingNotificationsContainer
        pings={receivedPings}
        onDismiss={dismissPing}
        onReply={handleReplyToPing}
        position="top-right"
        maxVisible={3}
      />

      {/* Quick reply dialog */}
      <Dialog open={!!replyTarget} onOpenChange={(open) => !open && handleCloseReplyDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Reply to {replyTarget?.name}
            </DialogTitle>
            <DialogDescription>
              Send a quick reply back to {replyTarget?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Hey! Nice to meet you too! (optional)"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              maxLength={255}
              className="w-full"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              {replyMessage.length}/255 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseReplyDialog}
              disabled={isSendingReply}
            >
              Cancel
            </Button>
            <Button onClick={handleSendReply} disabled={isSendingReply}>
              {isSendingReply ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * Simpler version that just shows the widget without notifications
 */
export const ProximityWidget = ({
  eventId,
  position = "bottom-right",
  className = "",
}: Omit<ProximityContainerProps, "onReplyToPing">) => {
  const {
    nearbyUsers,
    isTracking,
    isConnected,
    error,
    locationPermission,
    startTracking,
    stopTracking,
    sendPing,
    clearError,
  } = useProximity({ eventId });

  return (
    <FloatingProximityWidget
      nearbyUsers={nearbyUsers}
      isTracking={isTracking}
      isConnected={isConnected}
      error={error}
      locationPermission={locationPermission}
      onStartTracking={startTracking}
      onStopTracking={stopTracking}
      onSendPing={sendPing}
      onClearError={clearError}
      position={position}
      className={className}
    />
  );
};
