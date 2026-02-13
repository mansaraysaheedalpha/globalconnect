// Active challenge real-time progress view for organizer
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Trophy, Ban, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChallengeProgressUpdate } from "@/hooks/use-challenges";

interface ActiveChallengeProps {
  activeChallenge: ChallengeProgressUpdate;
  getTimeRemaining: () => number;
  onCancel: (challengeId: string) => void;
}

export const ActiveChallenge = ({
  activeChallenge,
  getTimeRemaining,
  onCancel,
}: ActiveChallengeProps) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    setTimeRemaining(getTimeRemaining());
    const interval = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [getTimeRemaining]);

  const totalDurationSec = activeChallenge.durationMinutes * 60;
  const progressPercent =
    totalDurationSec > 0
      ? ((totalDurationSec - timeRemaining) / totalDurationSec) * 100
      : 100;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timerText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <Card className="border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Swords className="h-4 w-4 text-green-600" />
            Live: {activeChallenge.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "font-mono",
                timeRemaining < 30 && "text-red-600 animate-pulse"
              )}
            >
              <Timer className="h-3 w-3 mr-1" />
              {timerText}
            </Badge>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs"
              onClick={() => onCancel(activeChallenge.challengeId)}
            >
              <Ban className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Time progress */}
        <Progress value={progressPercent} className="h-2" />

        {/* Team rankings */}
        <div className="space-y-1.5">
          {activeChallenge.teams.map((team) => (
            <div
              key={team.teamId}
              className="flex items-center justify-between p-2 rounded-lg bg-background/50"
            >
              <div className="flex items-center gap-2">
                <RankIcon rank={team.rank} />
                <span className="text-sm font-medium truncate">
                  {team.teamName}
                </span>
              </div>
              <span className="text-sm font-bold font-mono">
                {team.score}
              </span>
            </div>
          ))}
          {activeChallenge.teams.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Waiting for teams to participate...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
  if (rank === 2) return <Trophy className="h-4 w-4 text-gray-400" />;
  if (rank === 3) return <Trophy className="h-4 w-4 text-amber-700" />;
  return (
    <span className="w-4 text-center text-xs text-muted-foreground font-semibold">
      {rank}
    </span>
  );
};
