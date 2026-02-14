// Trivia game monitor - shows games with organizer controls (start, advance, end)
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Play,
  SkipForward,
  Square,
  Trophy,
  CheckCircle2,
  Clock,
  FileText,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TriviaGame {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  timePerQuestion: number;
  questions: Array<{
    id: string;
    questionText: string;
    options: string[];
    orderIndex: number;
    status: string;
  }>;
  teamScores: Array<{
    team: { id: string; name: string };
    totalScore: number;
    correctCount: number;
    speedBonuses: number;
  }>;
}

interface TriviaMonitorProps {
  games: TriviaGame[];
  onStart: (gameId: string) => void;
  onAdvance: (gameId: string) => void;
  onEnd: (gameId: string) => void;
  onDelete?: (gameId: string) => void;
}

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    icon: FileText,
  },
  ACTIVE: {
    label: "Live",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    icon: Play,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    icon: CheckCircle2,
  },
} as const;

export const TriviaMonitor = ({
  games,
  onStart,
  onAdvance,
  onEnd,
  onDelete,
}: TriviaMonitorProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pink-500" />
          Trivia Games ({games.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {games.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No trivia games created yet. Use the creator above to add one.
          </p>
        )}

        {games.map((game) => {
          const config = STATUS_CONFIG[game.status] || STATUS_CONFIG.DRAFT;
          const StatusIcon = config.icon;
          const activeQuestion = game.questions.find((q) => q.status === "ACTIVE");
          const revealedCount = game.questions.filter((q) => q.status === "REVEALED").length;

          return (
            <div
              key={game.id}
              className={cn(
                "rounded-lg border p-4 space-y-3",
                game.status === "ACTIVE" &&
                  "border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{game.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {game.questions.length} questions &middot; {game.timePerQuestion}s each
                  </p>
                </div>
                <Badge className={cn("text-[10px]", config.color)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>

              {/* Active question info */}
              {game.status === "ACTIVE" && activeQuestion && (
                <div className="p-2 rounded bg-muted/50 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">
                    Current Question ({activeQuestion.orderIndex + 1}/{game.questions.length})
                  </p>
                  <p className="font-medium">{activeQuestion.questionText}</p>
                </div>
              )}

              {/* Progress indicator */}
              {game.status === "ACTIVE" && (
                <p className="text-xs text-muted-foreground">
                  Progress: {revealedCount}/{game.questions.length} revealed
                </p>
              )}

              {/* Team scores */}
              {game.teamScores.length > 0 && (
                <div className="space-y-1">
                  {game.teamScores
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .slice(0, 5)
                    .map((ts, i) => (
                      <div key={ts.team.id} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          {i === 0 && <Trophy className="h-3 w-3 text-yellow-500" />}
                          <span className="truncate">{ts.team.name}</span>
                        </span>
                        <span className="font-semibold">
                          {ts.totalScore} pts ({ts.correctCount} correct)
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Organizer controls */}
              <div className="flex gap-2 pt-1">
                {game.status === "DRAFT" && (
                  <>
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => onStart(game.id)}
                    >
                      <Play className="h-3 w-3" />
                      Start Game
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                        onClick={() => onDelete(game.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    )}
                  </>
                )}
                {game.status === "ACTIVE" && (
                  <>
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => onAdvance(game.id)}
                    >
                      <SkipForward className="h-3 w-3" />
                      {activeQuestion ? "Reveal & Next" : "Advance"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => onEnd(game.id)}
                    >
                      <Square className="h-3 w-3" />
                      End Game
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
