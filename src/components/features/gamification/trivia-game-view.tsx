// src/components/features/gamification/trivia-game-view.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Timer,
  Trophy,
  CheckCircle2,
  XCircle,
  Crown,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type {
  TriviaGameInfo,
  TriviaQuestion,
  RevealedQuestion,
  TriviaScore,
  TriviaGameCompleted,
} from "@/hooks/use-trivia";

interface TriviaGameViewProps {
  activeGame: TriviaGameInfo | null;
  activeQuestion: TriviaQuestion | null;
  lastRevealed: RevealedQuestion | null;
  scores: TriviaScore[];
  completedGame: TriviaGameCompleted | null;
  hasSubmitted: boolean;
  questionStartTime: number | null;
  currentUserId?: string;
  currentTeamId?: string;
  currentTeamName?: string;
  isCaptain: boolean;
  onSubmitAnswer: (gameId: string, questionId: string, teamId: string, selectedIndex: number) => void;
  onDismissCompleted: () => void;
  className?: string;
}

/**
 * Attendee-facing trivia game view.
 * Shows active questions (captain can answer), revealed results, live scores,
 * and a completion summary.
 */
export const TriviaGameView = ({
  activeGame,
  activeQuestion,
  lastRevealed,
  scores,
  completedGame,
  hasSubmitted,
  questionStartTime,
  currentUserId,
  currentTeamId,
  currentTeamName,
  isCaptain,
  onSubmitAnswer,
  onDismissCompleted,
  className,
}: TriviaGameViewProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showScores, setShowScores] = useState(false);

  // Reset selected option when new question arrives
  useEffect(() => {
    setSelectedOption(null);
  }, [activeQuestion?.id]);

  // Countdown timer per question — deps use only primitive values to avoid
  // unnecessary restarts when parent re-renders with new object references
  const timePerQuestion = activeGame?.timePerQuestion;
  const activeQuestionId = activeQuestion?.id;

  useEffect(() => {
    if (!timePerQuestion || !activeQuestionId || !questionStartTime) {
      setTimeLeft(0);
      return;
    }

    const totalMs = timePerQuestion * 1000;

    const tick = () => {
      const elapsed = Date.now() - questionStartTime;
      const remaining = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
      setTimeLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [timePerQuestion, activeQuestionId, questionStartTime]);

  const handleSubmit = useCallback(() => {
    if (
      !activeGame ||
      !activeQuestion ||
      !currentTeamId ||
      selectedOption === null ||
      hasSubmitted
    )
      return;

    onSubmitAnswer(activeGame.id, activeQuestion.id, currentTeamId, selectedOption);
  }, [activeGame, activeQuestion, currentTeamId, selectedOption, hasSubmitted, onSubmitAnswer]);

  // Nothing to show if no game active and no completed game
  if (!activeGame && !completedGame && !lastRevealed) return null;

  // ── Completed Game Summary ──
  if (completedGame) {
    const myTeamScore = completedGame.scores.find((s) => s.teamId === currentTeamId);

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4",
            className
          )}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-3" />
              <h2 className="text-xl font-bold">{completedGame.gameName}</h2>
              <p className="text-white/80 text-sm mt-1">
                Game Complete — {completedGame.totalQuestions} questions
              </p>
            </div>

            {/* Scores */}
            <div className="p-5 space-y-3">
              {completedGame.scores.map((score) => (
                <div
                  key={score.teamId}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-colors",
                    score.teamId === currentTeamId
                      ? "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
                      : "border-border/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RankMedal rank={score.rank} />
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        {score.teamName}
                        {score.teamId === currentTeamId && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            You
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {score.correctCount} correct
                        {score.speedBonuses > 0 && ` · ${score.speedBonuses} speed bonus${score.speedBonuses !== 1 ? "es" : ""}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold tabular-nums">
                    {score.totalScore}
                  </span>
                </div>
              ))}

              {completedGame.scores.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No teams participated
                </p>
              )}
            </div>

            {/* Dismiss */}
            <div className="px-5 pb-5">
              <Button className="w-full" onClick={onDismissCompleted}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Active Game View ──
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className={cn(
          "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-[420px] z-50",
          className
        )}
      >
        <div className="bg-background rounded-2xl shadow-2xl border overflow-hidden">
          {/* Game header */}
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="h-4 w-4 text-pink-500 flex-shrink-0" />
              <span className="text-sm font-semibold truncate">
                {activeGame?.name || "Trivia"}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {activeQuestion && (
                <Badge variant="outline" className="text-xs">
                  Q{activeQuestion.orderIndex + 1}/{activeQuestion.totalQuestions}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowScores(!showScores)}
              >
                {showScores ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Question area */}
          <div className="p-4 space-y-4">
            {activeQuestion && (
              <>
                {/* Timer */}
                <div className="flex items-center gap-2">
                  <Timer className={cn(
                    "h-4 w-4",
                    timeLeft <= 5 ? "text-red-500" : "text-muted-foreground"
                  )} />
                  <div className="flex-1">
                    <Progress
                      value={activeGame ? (timeLeft / activeGame.timePerQuestion) * 100 : 0}
                      className="h-1.5"
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-mono font-semibold tabular-nums w-6 text-right",
                    timeLeft <= 5 && "text-red-500 animate-pulse"
                  )}>
                    {timeLeft}s
                  </span>
                </div>

                {/* Question text */}
                <p className="text-sm font-medium leading-snug">
                  {activeQuestion.questionText}
                </p>

                {/* Options */}
                <div className="space-y-2">
                  {activeQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isDisabled = hasSubmitted || !isCaptain;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!isDisabled) setSelectedOption(idx);
                        }}
                        disabled={isDisabled}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border text-sm transition-all",
                          isSelected
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                            : "border-border/60 hover:border-border hover:bg-muted/30",
                          isDisabled && !isSelected && "opacity-50 cursor-not-allowed",
                          hasSubmitted && isSelected && "border-green-500 bg-green-50 dark:bg-green-950/20"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 border",
                            isSelected
                              ? "bg-purple-500 text-white border-purple-500"
                              : "bg-muted/50 text-muted-foreground border-border/60"
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Submit / Status */}
                {isCaptain && !hasSubmitted && (
                  <Button
                    className="w-full gap-2"
                    disabled={selectedOption === null}
                    onClick={handleSubmit}
                  >
                    <Zap className="h-4 w-4" />
                    Lock In Answer
                  </Button>
                )}

                {isCaptain && hasSubmitted && (
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium py-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Answer submitted! Waiting for reveal...
                  </div>
                )}

                {!isCaptain && (
                  <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground">
                      <Crown className="h-3 w-3 inline mr-1" />
                      Only the team captain can submit answers.
                      {hasSubmitted && " Your captain has submitted!"}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Revealed question result */}
            {!activeQuestion && lastRevealed && (
              <RevealedResult
                revealed={lastRevealed}
                currentTeamId={currentTeamId}
              />
            )}

            {/* Waiting state between questions */}
            {!activeQuestion && !lastRevealed && activeGame && (
              <div className="text-center py-6">
                <Sparkles className="h-8 w-8 mx-auto text-pink-400 animate-pulse mb-3" />
                <p className="text-sm text-muted-foreground">
                  Waiting for the next question...
                </p>
              </div>
            )}
          </div>

          {/* Scores panel (collapsible) */}
          <AnimatePresence>
            {showScores && scores.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t px-4 py-3 space-y-1.5 bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Leaderboard
                  </p>
                  {scores.map((score) => (
                    <div
                      key={score.teamId}
                      className={cn(
                        "flex items-center justify-between text-sm py-1 px-2 rounded",
                        score.teamId === currentTeamId && "bg-purple-500/10"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <RankMedal rank={score.rank} size="sm" />
                        <span className="truncate text-xs">
                          {score.teamName}
                          {score.teamId === currentTeamId && (
                            <span className="text-muted-foreground ml-1">(You)</span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs font-semibold tabular-nums">
                        {score.totalScore} pts
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Revealed Result ──
const RevealedResult = ({
  revealed,
  currentTeamId,
}: {
  revealed: RevealedQuestion;
  currentTeamId?: string;
}) => {
  const myAnswer = revealed.answers.find((a) => a.teamId === currentTeamId);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{revealed.questionText}</p>

      <div className="space-y-1.5">
        {revealed.options.map((option, idx) => {
          const isCorrect = idx === revealed.correctIndex;
          const isMyAnswer = myAnswer?.selectedIndex === idx;

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-lg text-sm border",
                isCorrect
                  ? "border-green-500/50 bg-green-50 dark:bg-green-950/20"
                  : isMyAnswer
                  ? "border-red-500/50 bg-red-50 dark:bg-red-950/20"
                  : "border-transparent bg-muted/30"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0",
                isCorrect
                  ? "bg-green-500 text-white"
                  : isMyAnswer
                  ? "bg-red-500 text-white"
                  : "bg-muted text-muted-foreground"
              )}>
                {isCorrect ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isMyAnswer ? (
                  <XCircle className="h-3 w-3" />
                ) : (
                  String.fromCharCode(65 + idx)
                )}
              </span>
              <span className={cn(isCorrect && "font-medium")}>{option}</span>
            </div>
          );
        })}
      </div>

      {/* Team answers summary */}
      {revealed.answers.length > 0 && (
        <div className="pt-2 border-t space-y-1">
          <p className="text-xs text-muted-foreground font-semibold">Team Answers:</p>
          {revealed.answers.map((answer) => (
            <div key={answer.teamId} className="flex items-center justify-between text-xs">
              <span className={cn(
                "flex items-center gap-1.5",
                answer.teamId === currentTeamId && "font-semibold"
              )}>
                {answer.isCorrect ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-400" />
                )}
                {answer.teamName}
              </span>
              <span className="text-muted-foreground">
                {(answer.responseTimeMs / 1000).toFixed(1)}s
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Rank Medal ──
const RankMedal = ({ rank, size = "md" }: { rank: number; size?: "sm" | "md" }) => {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  if (rank === 1)
    return <Trophy className={cn(iconSize, "text-yellow-500")} />;
  if (rank === 2)
    return <Trophy className={cn(iconSize, "text-gray-400")} />;
  if (rank === 3)
    return <Trophy className={cn(iconSize, "text-amber-600")} />;
  return (
    <span className={cn(
      "flex items-center justify-center text-muted-foreground font-semibold",
      size === "sm" ? "text-[10px] w-3.5" : "text-xs w-5"
    )}>
      {rank}
    </span>
  );
};
