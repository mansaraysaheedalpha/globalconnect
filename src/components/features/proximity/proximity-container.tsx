// src/components/features/proximity/proximity-container.tsx
"use client";

import React, { useCallback } from "react";
import { useProximity } from "@/hooks/use-proximity";
import { FloatingProximityWidget } from "./floating-proximity-widget";
import { PingNotificationsContainer } from "./ping-notification";

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

  const handleReplyToPing = useCallback(
    (userId: string) => {
      if (onReplyToPing) {
        onReplyToPing(userId);
      }
    },
    [onReplyToPing]
  );

  return (
    <>
      {/* Floating widget button with sheet */}
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

      {/* Ping notifications */}
      <PingNotificationsContainer
        pings={receivedPings}
        onDismiss={dismissPing}
        onReply={onReplyToPing ? handleReplyToPing : undefined}
        position="top-right"
        maxVisible={3}
      />
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
