// src/app/(platform)/dashboard/events/[eventId]/_components/session-polls.tsx
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useSessionPolls, Poll, GiveawayResult } from "@/hooks/use-session-polls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Plus,
  X,
  BarChart3,
  Check,
  Trophy,
  Gift,
  Lock,
  ShieldX,
  Vote,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SessionPollsProps {
  sessionId: string;
  eventId: string;
  isOrganizer?: boolean;
  isSpeaker?: boolean;
  className?: string;
  initialPollsOpen?: boolean;
}

// Create Poll Form Component
function CreatePollForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (question: string, options: string[]) => Promise<boolean>;
  isSubmitting: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isExpanded, setIsExpanded] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      return;
    }

    const success = await onSubmit(question.trim(), validOptions);
    if (success) {
      setQuestion("");
      setOptions(["", ""]);
      setIsExpanded(false);
    }
  };

  const validOptionsCount = options.filter((o) => o.trim()).length;
  const isValid = question.trim().length > 0 && validOptionsCount >= 2;

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        variant="outline"
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Create Poll
      </Button>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Create New Poll
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              maxLength={500}
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {question.length}/500
            </p>
          </div>

          <div className="space-y-2">
            <Label>Options ({validOptionsCount}/10)</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={200}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addOption}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Option
              </Button>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Poll"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Poll Card Component
function PollCard({
  poll,
  userVotedOptionId,
  onVote,
  onClose,
  onGiveaway,
  isVoting,
  canManage,
}: {
  poll: Poll;
  userVotedOptionId: string | null;
  onVote: (pollId: string, optionId: string) => Promise<boolean>;
  onClose?: (pollId: string) => Promise<boolean>;
  onGiveaway?: (pollId: string, winningOptionId: string, prize: string) => Promise<any>;
  isVoting: boolean;
  canManage: boolean;
}) {
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showGiveawayDialog, setShowGiveawayDialog] = useState(false);
  const [selectedWinningOption, setSelectedWinningOption] = useState<string | null>(null);
  const [prize, setPrize] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isRunningGiveaway, setIsRunningGiveaway] = useState(false);

  const hasVoted = userVotedOptionId !== null;
  const showResults = hasVoted || !poll.isActive;
  const totalVotes = poll.totalVotes || 0;

  const handleVote = async (optionId: string) => {
    if (hasVoted || !poll.isActive || isVoting) return;
    await onVote(poll.id, optionId);
  };

  const handleClose = async () => {
    if (!onClose) return;
    setIsClosing(true);
    await onClose(poll.id);
    setIsClosing(false);
    setShowCloseDialog(false);
  };

  const handleGiveaway = async () => {
    if (!onGiveaway || !selectedWinningOption || !prize.trim()) return;
    setIsRunningGiveaway(true);
    await onGiveaway(poll.id, selectedWinningOption, prize.trim());
    setIsRunningGiveaway(false);
    setShowGiveawayDialog(false);
    setPrize("");
    setSelectedWinningOption(null);
  };

  return (
    <>
      <Card className={cn(!poll.isActive && "opacity-75")}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-medium leading-tight">
              {poll.question}
            </CardTitle>
            <Badge
              variant={poll.isActive ? "default" : "secondary"}
              className={cn(
                poll.isActive
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : ""
              )}
            >
              {poll.isActive ? "Active" : "Closed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Options */}
          <div className="space-y-2">
            {poll.options.map((option) => {
              const voteCount = option.voteCount || 0;
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isSelected = option.id === userVotedOptionId;

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted || !poll.isActive || isVoting}
                  className={cn(
                    "w-full relative overflow-hidden rounded-lg border p-3 text-left transition-all",
                    !showResults && poll.isActive && !hasVoted
                      ? "hover:border-primary hover:bg-primary/5 cursor-pointer"
                      : "cursor-default",
                    isSelected && "border-primary ring-1 ring-primary"
                  )}
                >
                  {/* Progress bar background */}
                  {showResults && (
                    <div
                      className={cn(
                        "absolute inset-0 transition-all",
                        isSelected ? "bg-primary/20" : "bg-muted"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <span className={cn("text-sm", isSelected && "font-medium")}>
                        {option.text}
                      </span>
                    </span>

                    {showResults && (
                      <span className="text-sm text-muted-foreground shrink-0">
                        {voteCount} ({percentage}%)
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-muted-foreground">
              {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
            </span>

            {/* Organizer Actions */}
            {canManage && (
              <div className="flex gap-2">
                {poll.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCloseDialog(true)}
                  >
                    Close Poll
                  </Button>
                )}
                {!poll.isActive && onGiveaway && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGiveawayDialog(true)}
                    className="gap-1"
                  >
                    <Gift className="h-3 w-3" />
                    Giveaway
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Close Poll Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this poll?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop accepting new votes. Attendees will still be able to see the final results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose} disabled={isClosing}>
              {isClosing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Closing...
                </>
              ) : (
                "Close Poll"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Giveaway Dialog */}
      <Dialog open={showGiveawayDialog} onOpenChange={setShowGiveawayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Run a Giveaway
            </DialogTitle>
            <DialogDescription>
              Select the winning option and enter the prize. A random winner will be selected from users who voted for that option.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Winning Option</Label>
              <div className="space-y-2">
                {poll.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedWinningOption(option.id)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-all",
                      selectedWinningOption === option.id
                        ? "border-primary ring-1 ring-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{option.text}</span>
                      <span className="text-sm text-muted-foreground">
                        {option.voteCount || 0} votes
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prize">Prize</Label>
              <Input
                id="prize"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="e.g., Amazon Gift Card $50"
                maxLength={255}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGiveawayDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGiveaway}
              disabled={!selectedWinningOption || !prize.trim() || isRunningGiveaway}
              className="gap-2"
            >
              {isRunningGiveaway ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Selecting...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4" />
                  Pick Winner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Giveaway Winner Modal
function GiveawayWinnerModal({
  result,
  onClose,
}: {
  result: GiveawayResult;
  onClose: () => void;
}) {
  const winnerName = result.winner
    ? [result.winner.firstName, result.winner.lastName].filter(Boolean).join(" ") || "Anonymous"
    : null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center py-6">
          {result.winner ? (
            <>
              <div className="relative mx-auto w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping" />
                <div className="relative flex items-center justify-center w-full h-full bg-yellow-500/10 rounded-full">
                  <Trophy className="h-10 w-10 text-yellow-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-lg font-semibold text-primary mb-1">
                {winnerName}
              </p>
              <p className="text-muted-foreground mb-4">wins</p>
              <div className="inline-block bg-primary/10 rounded-lg px-4 py-2">
                <p className="text-lg font-medium">{result.prize}</p>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-muted rounded-full">
                <Gift className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Winner</h2>
              <p className="text-muted-foreground">
                No one voted for the winning option.
              </p>
            </>
          )}
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main SessionPolls Component
export function SessionPolls({
  sessionId,
  eventId,
  isOrganizer = false,
  isSpeaker = false,
  className,
  initialPollsOpen = false,
}: SessionPollsProps) {
  const {
    activePolls,
    closedPolls,
    isConnected,
    isJoined,
    error,
    accessDenied,
    pollsOpen,
    latestGiveaway,
    isCreating,
    isVoting,
    createPoll,
    submitVote,
    closePoll,
    startGiveaway,
    getUserVote,
    clearError,
    clearGiveaway,
  } = useSessionPolls(sessionId, eventId, initialPollsOpen);

  const [showClosedPolls, setShowClosedPolls] = useState(false);

  const canCreate = isOrganizer || isSpeaker;
  const canManage = isOrganizer;

  // Access denied state
  if (accessDenied) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full p-6", className)}>
        <ShieldX className="h-12 w-12 text-destructive mb-4" />
        <h3 className="font-semibold text-lg mb-2">Access Denied</h3>
        <p className="text-muted-foreground text-center text-sm">
          You must be registered for this event to participate in polls.
        </p>
      </div>
    );
  }

  // Connecting state
  if (!isConnected || !isJoined) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full p-6", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-sm">Connecting to polls...</p>
      </div>
    );
  }

  // Polls closed state (for attendees)
  if (!pollsOpen && !canCreate) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full p-6", className)}>
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Polls Closed</h3>
        <p className="text-muted-foreground text-center text-sm">
          Waiting for the host to open polls...
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between">
          <span className="text-sm text-destructive">{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Polls closed banner (for organizers) */}
        {!pollsOpen && canCreate && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
            <Lock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-600">
              Polls are closed for attendees. You can still create polls.
            </span>
          </div>
        )}

        {/* Create Poll Form */}
        {canCreate && (
          <CreatePollForm onSubmit={createPoll} isSubmitting={isCreating} />
        )}

        {/* Active Polls */}
        {activePolls.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Active Polls ({activePolls.length})
            </h3>
            {activePolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                userVotedOptionId={getUserVote(poll.id) || null}
                onVote={submitVote}
                onClose={canManage ? closePoll : undefined}
                onGiveaway={canManage ? startGiveaway : undefined}
                isVoting={isVoting === poll.id}
                canManage={canManage}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {activePolls.length === 0 && !canCreate && (
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Active Polls</h3>
            <p className="text-muted-foreground text-center text-sm">
              Polls will appear here when the host creates them.
            </p>
          </div>
        )}

        {/* Closed Polls (Collapsible) */}
        {closedPolls.length > 0 && (
          <Collapsible open={showClosedPolls} onOpenChange={setShowClosedPolls}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-muted-foreground"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Closed Polls ({closedPolls.length})
                </span>
                {showClosedPolls ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              {closedPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  userVotedOptionId={getUserVote(poll.id) || null}
                  onVote={submitVote}
                  onClose={undefined}
                  onGiveaway={canManage ? startGiveaway : undefined}
                  isVoting={false}
                  canManage={canManage}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Giveaway Winner Modal */}
      {latestGiveaway && (
        <GiveawayWinnerModal result={latestGiveaway} onClose={clearGiveaway} />
      )}
    </div>
  );
}
