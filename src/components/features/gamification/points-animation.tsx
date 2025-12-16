// src/components/features/gamification/points-animation.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RecentPointEvent, PointReason, POINT_VALUES } from "@/hooks/use-gamification";

interface PointsAnimationProps {
  events: RecentPointEvent[];
  className?: string;
}

/**
 * Displays floating "+X points" animations when user earns points
 */
export const PointsAnimation = ({
  events,
  className = "",
}: PointsAnimationProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-20 right-4 z-50",
        className
      )}
      aria-live="polite"
    >
      <AnimatePresence>
        {events.map((event) => (
          <PointsPopup key={event.id} event={event} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface PointsPopupProps {
  event: RecentPointEvent;
}

const PointsPopup = ({ event }: PointsPopupProps) => {
  const getReasonEmoji = (reason: PointReason): string => {
    const emojis: Record<PointReason, string> = {
      MESSAGE_SENT: "💬",
      MESSAGE_REACTED: "👍",
      QUESTION_ASKED: "❓",
      QUESTION_UPVOTED: "⬆️",
      POLL_CREATED: "📊",
      POLL_VOTED: "✅",
      WAITLIST_JOINED: "⏳",
    };
    return emojis[reason] || "⭐";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg mb-2",
        "bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold"
      )}
    >
      <span className="text-lg">{getReasonEmoji(event.reason)}</span>
      <span className="text-lg">+{event.points}</span>
    </motion.div>
  );
};

/**
 * Compact inline points display for headers/sidebars
 */
interface UserScoreDisplayProps {
  score: number;
  rank?: number | null;
  showRank?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const UserScoreDisplay = ({
  score,
  rank,
  showRank = true,
  size = "md",
  className = "",
}: UserScoreDisplayProps) => {
  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-1.5",
    lg: "text-lg px-4 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full bg-primary/10",
        sizeClasses[size],
        className
      )}
    >
      {/* Score */}
      <div className="flex items-center gap-1">
        <motion.span
          key={score}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="font-bold"
        >
          {score.toLocaleString()}
        </motion.span>
        <span className="text-muted-foreground">pts</span>
      </div>

      {/* Rank */}
      {showRank && rank && (
        <>
          <span className="text-muted-foreground">|</span>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">#</span>
            <span className="font-semibold">{rank}</span>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Animated score counter for dramatic reveals
 */
interface AnimatedScoreCounterProps {
  targetScore: number;
  duration?: number;
  className?: string;
}

export const AnimatedScoreCounter = ({
  targetScore,
  duration = 2000,
  className = "",
}: AnimatedScoreCounterProps) => {
  const [displayScore, setDisplayScore] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startScore = displayScore;
    const difference = targetScore - startScore;

    if (difference === 0) return;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const newScore = Math.round(startScore + difference * eased);
      setDisplayScore(newScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetScore, duration]);

  return (
    <motion.span
      key={displayScore}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.2 }}
      className={cn("font-mono font-bold", className)}
    >
      {displayScore.toLocaleString()}
    </motion.span>
  );
};
