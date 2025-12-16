// src/components/features/live-reactions-overlay.tsx
"use client";

import React from "react";
import { useSessionReactions } from "@/hooks/use-session-reactions";
import { FloatingReactions, FloatingReactionsCompact } from "./floating-reactions";
import { ReactionBar, ReactionFab } from "./reaction-bar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LiveReactionsOverlayProps {
  sessionId: string;
  eventId: string;
  variant?: "full" | "compact" | "fab";
  showMoodIndicator?: boolean;
  className?: string;
}

/**
 * Live reactions overlay for session engagement.
 * Shows floating emoji animations and provides a reaction bar for users to send reactions.
 */
export const LiveReactionsOverlay = ({
  sessionId,
  eventId,
  variant = "full",
  showMoodIndicator = true,
  className = "",
}: LiveReactionsOverlayProps) => {
  const {
    isConnected,
    isJoined,
    floatingEmojis,
    moodAnalytics,
    sendReaction,
    getPopularEmojis,
  } = useSessionReactions(sessionId, eventId);

  if (!isConnected || !isJoined) {
    return null; // Don't show until connected
  }

  const popularEmojis = getPopularEmojis();

  return (
    <>
      {/* Floating emoji animations */}
      {variant === "full" ? (
        <FloatingReactions emojis={floatingEmojis} />
      ) : (
        <FloatingReactionsCompact emojis={floatingEmojis} className={className} />
      )}

      {/* Mood indicator */}
      {showMoodIndicator && moodAnalytics && (
        <MoodIndicator analytics={moodAnalytics} />
      )}

      {/* Reaction bar/fab - rendered separately via position */}
    </>
  );
};

/**
 * Standalone reaction bar component to place anywhere in the UI
 */
interface LiveReactionBarProps {
  sessionId: string;
  eventId: string;
  variant?: "horizontal" | "vertical" | "compact" | "fab";
  className?: string;
}

export const LiveReactionBar = ({
  sessionId,
  eventId,
  variant = "horizontal",
  className = "",
}: LiveReactionBarProps) => {
  const {
    isConnected,
    isJoined,
    sendReaction,
    getPopularEmojis,
  } = useSessionReactions(sessionId, eventId);

  if (!isConnected || !isJoined) {
    return null;
  }

  const popularEmojis = getPopularEmojis();

  if (variant === "fab") {
    return (
      <ReactionFab
        onReaction={sendReaction}
        popularEmojis={popularEmojis}
        className={className}
      />
    );
  }

  return (
    <ReactionBar
      onReaction={sendReaction}
      popularEmojis={popularEmojis}
      variant={variant === "compact" ? "compact" : variant}
      className={className}
    />
  );
};

/**
 * Mood indicator showing current session engagement level
 */
interface MoodIndicatorProps {
  analytics: {
    dominantMood: string | null;
    engagementLevel: "low" | "medium" | "high" | "viral";
    totalReactions: number;
  };
  className?: string;
}

const MoodIndicator = ({ analytics, className = "" }: MoodIndicatorProps) => {
  const engagementColors = {
    low: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    medium: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    high: "bg-green-500/10 text-green-600 border-green-500/20",
    viral: "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse",
  };

  const engagementLabels = {
    low: "Quiet",
    medium: "Active",
    high: "Lively",
    viral: "🔥 On Fire!",
  };

  return (
    <div className={cn("fixed top-4 right-4 z-40", className)}>
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-2 px-3 py-1",
          engagementColors[analytics.engagementLevel]
        )}
      >
        {analytics.dominantMood && (
          <span className="text-lg">{analytics.dominantMood}</span>
        )}
        <span className="text-xs font-medium">
          {engagementLabels[analytics.engagementLevel]}
        </span>
        <span className="text-xs opacity-70">
          {analytics.totalReactions} reactions
        </span>
      </Badge>
    </div>
  );
};

/**
 * Combined component with both overlay and reaction bar
 */
interface LiveReactionsFullProps {
  sessionId: string;
  eventId: string;
  showMoodIndicator?: boolean;
  reactionBarPosition?: "bottom-left" | "bottom-right" | "bottom-center";
  className?: string;
}

export const LiveReactionsFull = ({
  sessionId,
  eventId,
  showMoodIndicator = true,
  reactionBarPosition = "bottom-right",
  className = "",
}: LiveReactionsFullProps) => {
  const positionClasses = {
    "bottom-left": "fixed bottom-4 left-4",
    "bottom-right": "fixed bottom-4 right-4",
    "bottom-center": "fixed bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <>
      <LiveReactionsOverlay
        sessionId={sessionId}
        eventId={eventId}
        variant="full"
        showMoodIndicator={showMoodIndicator}
        className={className}
      />
      <div className={cn("z-50", positionClasses[reactionBarPosition])}>
        <LiveReactionBar
          sessionId={sessionId}
          eventId={eventId}
          variant="fab"
        />
      </div>
    </>
  );
};
