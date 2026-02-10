// src/components/features/gamification/session-summary.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Flame,
  Crown,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatedScoreCounter } from "./points-animation";
import type { Achievement, StreakInfo } from "@/hooks/use-gamification";

interface SessionSummaryProps {
  open: boolean;
  onClose: () => void;
  sessionTitle: string;
  totalPoints: number;
  rank: number | null;
  totalParticipants?: number;
  achievements: Achievement[];
  streak: StreakInfo;
  stats: {
    messagesSent: number;
    questionsAsked: number;
    pollsVoted: number;
  };
}

/**
 * Full-screen session end summary showing the attendee's gamification results.
 * Displayed when a live session transitions to ENDED status.
 */
export const SessionSummary = ({
  open,
  onClose,
  sessionTitle,
  totalPoints,
  rank,
  totalParticipants,
  achievements,
  streak,
  stats,
}: SessionSummaryProps) => {
  const percentile = rank && totalParticipants && totalParticipants > 1
    ? Math.round(((totalParticipants - rank) / (totalParticipants - 1)) * 100)
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 pb-8 text-primary-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm font-medium opacity-80 mb-1">Session Complete</p>
            <h2 className="text-xl font-bold truncate">{sessionTitle}</h2>
          </motion.div>
        </div>

        {/* Score section */}
        <div className="-mt-4 mx-4 mb-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
            className="bg-background rounded-xl shadow-lg border p-5 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground font-medium">Points Earned</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              <AnimatedScoreCounter targetScore={totalPoints} duration={1500} />
            </div>
            {rank && (
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  <Crown className="h-3 w-3 mr-1" />
                  Rank #{rank}
                </Badge>
                {percentile !== null && percentile >= 50 && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-sm">
                    Top {100 - percentile}%
                  </Badge>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Activity stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-4 mb-4"
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Your Activity</h3>
          <div className="grid grid-cols-3 gap-2">
            <StatCard
              icon={<MessageSquare className="h-4 w-4 text-indigo-500" />}
              value={stats.messagesSent}
              label="Messages"
            />
            <StatCard
              icon={<HelpCircle className="h-4 w-4 text-blue-500" />}
              value={stats.questionsAsked}
              label="Questions"
            />
            <StatCard
              icon={<BarChart3 className="h-4 w-4 text-purple-500" />}
              value={stats.pollsVoted}
              label="Polls Voted"
            />
          </div>
        </motion.div>

        {/* Streak info */}
        {streak.count > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="px-4 mb-4"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">
                Best streak: {streak.count} windows ({streak.multiplier}x multiplier)
              </span>
            </div>
          </motion.div>
        )}

        {/* Achievements unlocked */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="px-4 mb-4"
          >
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Achievements Unlocked
            </h3>
            <div className="flex flex-wrap gap-2">
              {achievements.map((a) => (
                <Badge
                  key={a.id}
                  className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20"
                >
                  {a.icon && <span className="mr-1">{a.icon}</span>}
                  {a.badgeName}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="px-4 pb-4">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
    {icon}
    <span className="text-lg font-bold">{value}</span>
    <span className="text-[11px] text-muted-foreground">{label}</span>
  </div>
);
