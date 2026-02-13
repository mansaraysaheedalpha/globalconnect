// src/components/features/gamification/challenge-card.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Swords, Clock, Trophy, Play, Ban, CheckCircle2, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Challenge } from "@/hooks/use-challenges";

interface ChallengeCardProps {
  challenge: Challenge;
  isOrganizer?: boolean;
  onStart?: (challengeId: string) => void;
  onCancel?: (challengeId: string) => void;
  className?: string;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    icon: Clock,
  },
  ACTIVE: {
    label: "Active",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    icon: Timer,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    icon: Ban,
  },
} as const;

const TYPE_LABELS: Record<string, string> = {
  CHAT_BLITZ: "Chat Blitz",
  POLL_RUSH: "Poll Rush",
  QA_SPRINT: "Q&A Sprint",
  POINTS_RACE: "Points Race",
  MULTI_ACTION: "Multi-Action",
  CUSTOM: "Custom",
};

export const ChallengeCard = ({
  challenge,
  isOrganizer = false,
  onStart,
  onCancel,
  className,
}: ChallengeCardProps) => {
  const statusConfig = STATUS_CONFIG[challenge.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-3",
        challenge.status === "ACTIVE" &&
          "border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Swords className="h-4 w-4 text-purple-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{challenge.name}</p>
            <p className="text-xs text-muted-foreground">
              {TYPE_LABELS[challenge.type] || challenge.type} &middot;{" "}
              {challenge.durationMinutes} min
            </p>
          </div>
        </div>
        <Badge className={cn("text-[10px] flex-shrink-0", statusConfig.color)}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Description */}
      {challenge.description && (
        <p className="text-xs text-muted-foreground">{challenge.description}</p>
      )}

      {/* Rewards */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <Trophy className="h-3 w-3 text-yellow-500" />
          <span className="text-muted-foreground">
            1st: {challenge.rewardFirst}
          </span>
        </div>
        <span className="text-muted-foreground">
          2nd: {challenge.rewardSecond}
        </span>
        <span className="text-muted-foreground">
          3rd: {challenge.rewardThird}
        </span>
      </div>

      {/* Completed rankings */}
      {challenge.status === "COMPLETED" && challenge.progress && challenge.progress.length > 0 && (
        <div className="space-y-1 pt-1 border-t">
          <p className="text-xs font-medium text-muted-foreground">Results</p>
          {challenge.progress
            .sort((a, b) => a.rank - b.rank)
            .slice(0, 3)
            .map((team) => (
              <div key={team.teamId} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  {team.rank === 1 && <Trophy className="h-3 w-3 text-yellow-500" />}
                  {team.rank === 2 && <Trophy className="h-3 w-3 text-gray-400" />}
                  {team.rank === 3 && <Trophy className="h-3 w-3 text-amber-700" />}
                  <span className="truncate">{team.teamName}</span>
                </span>
                <span className="font-semibold">{team.score} pts</span>
              </div>
            ))}
        </div>
      )}

      {/* Organizer actions */}
      {isOrganizer && (
        <div className="flex gap-2 pt-1">
          {challenge.status === "PENDING" && onStart && (
            <Button
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onStart(challenge.id)}
            >
              <Play className="h-3 w-3" />
              Start
            </Button>
          )}
          {(challenge.status === "PENDING" || challenge.status === "ACTIVE") && onCancel && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => onCancel(challenge.id)}
            >
              <Ban className="h-3 w-3" />
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
