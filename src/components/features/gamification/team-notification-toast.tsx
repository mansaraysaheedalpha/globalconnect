// src/components/features/gamification/team-notification-toast.tsx
"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  UserMinus,
  TrendingUp,
  TrendingDown,
  Swords,
  Trophy,
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TeamNotification, TeamNotificationType } from "@/hooks/use-team-notifications";

interface TeamNotificationToastProps {
  notification: TeamNotification | null;
  onDismiss: () => void;
  autoDismissMs?: number;
  className?: string;
}

const NOTIFICATION_CONFIG: Record<
  TeamNotificationType,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    getMessage: (data: Record<string, any>) => string;
  }
> = {
  "member.joined": {
    icon: UserPlus,
    color: "text-green-600",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50",
    getMessage: (data) =>
      `${data.member?.firstName || "Someone"} joined your team!`,
  },
  "member.left": {
    icon: UserMinus,
    color: "text-orange-600",
    bgColor: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200/50",
    getMessage: (data) =>
      `${data.member?.firstName || "Someone"} left your team`,
  },
  "rank.changed": {
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50",
    getMessage: (data) => {
      const direction = data.direction === "up" ? "rose" : "dropped";
      return `Team ${direction} to #${data.newRank}!`;
    },
  },
  "challenge.starting": {
    icon: Swords,
    color: "text-purple-600",
    bgColor: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200/50",
    getMessage: (data) =>
      `Challenge starting: ${data.challengeName || "New Challenge"}!`,
  },
  "challenge.progress": {
    icon: Zap,
    color: "text-indigo-600",
    bgColor: "from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-indigo-200/50",
    getMessage: (data) => `Challenge update for your team`,
  },
  "challenge.completed": {
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200/50",
    getMessage: (data) => {
      const rank = data.rank;
      if (rank === 1) return `Your team won the challenge!`;
      if (rank === 2) return `Your team placed 2nd!`;
      if (rank === 3) return `Your team placed 3rd!`;
      return `Challenge completed! Your team placed #${rank}`;
    },
  },
  "trivia.starting": {
    icon: Sparkles,
    color: "text-pink-600",
    bgColor: "from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200/50",
    getMessage: (data) =>
      `Trivia starting: ${data.gameName || "New Game"}!`,
  },
  "synergy.active": {
    icon: Zap,
    color: "text-cyan-600",
    bgColor: "from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 border-cyan-200/50",
    getMessage: (data) =>
      `Team synergy active! ${data.multiplier}x bonus with ${data.activeMembers} teammates`,
  },
};

const AUTO_DISMISS_MS = 6000;

export const TeamNotificationToast = ({
  notification,
  onDismiss,
  autoDismissMs = AUTO_DISMISS_MS,
  className,
}: TeamNotificationToastProps) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [notification, onDismiss, autoDismissMs]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={cn("fixed top-20 right-4 z-50 max-w-sm", className)}
        >
          <ToastContent notification={notification} onDismiss={onDismiss} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ToastContent = ({
  notification,
  onDismiss,
}: {
  notification: TeamNotification;
  onDismiss: () => void;
}) => {
  const config = NOTIFICATION_CONFIG[notification.type];
  if (!config) return null;

  const Icon = config.icon;
  // Use rank.changed: pick correct icon based on direction
  const ActualIcon =
    notification.type === "rank.changed" && notification.data.direction === "down"
      ? TrendingDown
      : Icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg bg-gradient-to-r",
        config.bgColor
      )}
    >
      <div className={cn("flex-shrink-0", config.color)}>
        <ActualIcon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium flex-1">
        {config.getMessage(notification.data)}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 flex-shrink-0"
        onClick={onDismiss}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
