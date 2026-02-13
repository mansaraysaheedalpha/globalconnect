// src/components/features/gamification/challenge-overlay.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Timer, Trophy, Swords, X, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChallengeProgressUpdate } from "@/hooks/use-challenges";

interface ChallengeOverlayProps {
  activeChallenge: ChallengeProgressUpdate | null;
  currentTeamId?: string;
  getTimeRemaining: () => number;
  className?: string;
}

/**
 * Compact overlay that shows during active challenges.
 * Sits at the top of the screen with a progress bar, timer, and team rankings.
 */
export const ChallengeOverlay = ({
  activeChallenge,
  currentTeamId,
  getTimeRemaining,
  className,
}: ChallengeOverlayProps) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Update countdown every second
  useEffect(() => {
    if (!activeChallenge) return;
    setTimeRemaining(getTimeRemaining());
    const interval = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeChallenge, getTimeRemaining]);

  if (!activeChallenge) return null;

  const totalDurationSec = activeChallenge.durationMinutes * 60;
  const progressPercent =
    totalDurationSec > 0
      ? ((totalDurationSec - timeRemaining) / totalDurationSec) * 100
      : 100;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timerText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const currentTeam = activeChallenge.teams.find(
    (t) => t.teamId === currentTeamId
  );
  const topTeam = activeChallenge.teams[0];
  const isWinning = currentTeam && topTeam && currentTeam.teamId === topTeam.teamId;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ type: "spring", damping: 20 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          className
        )}
      >
        {/* Compact bar */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
          <div className="max-w-5xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Swords className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-semibold truncate">
                  {activeChallenge.name}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Current team rank */}
                {currentTeam && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      isWinning
                        ? "bg-yellow-400/20 text-yellow-200 border-yellow-400/30"
                        : "bg-white/10 text-white/90 border-white/20"
                    )}
                  >
                    #{currentTeam.rank} ({currentTeam.score} pts)
                  </Badge>
                )}

                {/* Timer */}
                <div className="flex items-center gap-1 text-sm font-mono">
                  <Timer className="h-3.5 w-3.5" />
                  <span className={cn(timeRemaining < 30 && "text-red-300 animate-pulse")}>
                    {timerText}
                  </span>
                </div>

                {/* Expand/collapse */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Time progress bar */}
            <div className="mt-1.5">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/60 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Expanded: Team rankings */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="max-w-5xl mx-auto px-4 pb-3 border-t border-white/10 pt-2">
                  <div className="space-y-1">
                    {activeChallenge.teams.map((team) => (
                      <div
                        key={team.teamId}
                        className={cn(
                          "flex items-center justify-between text-sm py-1 px-2 rounded",
                          team.teamId === currentTeamId && "bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <RankBadge rank={team.rank} />
                          <span className="truncate">
                            {team.teamName}
                            {team.teamId === currentTeamId && (
                              <span className="text-xs text-white/60 ml-1">(You)</span>
                            )}
                          </span>
                        </div>
                        <span className="font-mono font-semibold">
                          {team.score}
                        </span>
                      </div>
                    ))}
                    {activeChallenge.teams.length === 0 && (
                      <p className="text-xs text-white/60 text-center py-2">
                        No teams competing yet
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy className="h-3.5 w-3.5 text-yellow-300" />;
  if (rank === 2) return <Trophy className="h-3.5 w-3.5 text-gray-300" />;
  if (rank === 3) return <Trophy className="h-3.5 w-3.5 text-amber-600" />;
  return (
    <span className="w-3.5 text-center text-xs text-white/60">{rank}</span>
  );
};
