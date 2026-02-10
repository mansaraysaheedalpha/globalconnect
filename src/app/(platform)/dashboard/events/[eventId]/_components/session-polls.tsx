// src/app/(platform)/dashboard/events/[eventId]/_components/session-polls.tsx
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useSessionPolls,
  Poll,
  GiveawayResult,
  PrizeConfig,
  PrizeType,
  QuizGiveawayResult,
} from "@/hooks/use-session-polls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  MapPin,
  Clock,
  Mail,
  Package,
  CreditCard,
  Ticket,
  PartyPopper,
  Info,
} from "lucide-react";
import { StaleDataIndicator } from "@/components/ui/stale-data-indicator";
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
  onStatusChange?: (isOpen: boolean) => void; // Callback when polls open status changes via WebSocket
}

// Create Poll Form Component with Quiz Mode Support
function CreatePollForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (question: string, options: string[], isQuiz?: boolean, correctOptionIndex?: number) => Promise<boolean>;
  isSubmitting: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Quiz mode state
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      // Adjust correct option index if needed
      if (correctOptionIndex !== null) {
        if (index === correctOptionIndex) {
          setCorrectOptionIndex(null);
        } else if (index < correctOptionIndex) {
          setCorrectOptionIndex(correctOptionIndex - 1);
        }
      }
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

    // For quiz mode, ensure correct answer is selected
    if (isQuizMode && correctOptionIndex === null) {
      return;
    }

    const success = await onSubmit(
      question.trim(),
      validOptions,
      isQuizMode,
      isQuizMode ? correctOptionIndex ?? undefined : undefined
    );

    if (success) {
      setQuestion("");
      setOptions(["", ""]);
      setIsExpanded(false);
      setIsQuizMode(false);
      setCorrectOptionIndex(null);
    }
  };

  const validOptionsCount = options.filter((o) => o.trim()).length;
  const isValid =
    question.trim().length > 0 &&
    validOptionsCount >= 2 &&
    (!isQuizMode || correctOptionIndex !== null);

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
          {/* Quiz Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Quiz Mode</p>
                <p className="text-xs text-muted-foreground">
                  Mark a correct answer for scoring
                </p>
              </div>
            </div>
            <Switch
              checked={isQuizMode}
              onCheckedChange={(checked) => {
                setIsQuizMode(checked);
                if (!checked) setCorrectOptionIndex(null);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">
              {isQuizMode ? "Quiz Question" : "Question"}
            </Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={isQuizMode ? "Ask a quiz question..." : "Ask a question..."}
              maxLength={500}
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {question.length}/500
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              {isQuizMode ? (
                <span className="flex items-center gap-2">
                  Options ({validOptionsCount}/10)
                  <Badge variant="outline" className="text-xs font-normal">
                    Click to mark correct answer
                  </Badge>
                </span>
              ) : (
                `Options (${validOptionsCount}/10)`
              )}
            </Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  {isQuizMode && (
                    <Button
                      type="button"
                      variant={correctOptionIndex === index ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCorrectOptionIndex(index)}
                      className={cn(
                        "shrink-0 transition-all",
                        correctOptionIndex === index && "bg-green-600 hover:bg-green-700"
                      )}
                      title={correctOptionIndex === index ? "Correct answer" : "Mark as correct"}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}${isQuizMode && correctOptionIndex === index ? " (Correct)" : ""}`}
                    maxLength={200}
                    className={cn(
                      isQuizMode && correctOptionIndex === index && "border-green-500 ring-1 ring-green-500"
                    )}
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

            {isQuizMode && correctOptionIndex === null && validOptionsCount >= 2 && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Click the checkmark to mark the correct answer
              </p>
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
              ) : isQuizMode ? (
                "Create Quiz Poll"
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
  onGiveaway?: (pollId: string, winningOptionId: string, prize: string | PrizeConfig, sendEmail: boolean) => Promise<any>;
  isVoting: boolean;
  canManage: boolean;
}) {
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showGiveawayDialog, setShowGiveawayDialog] = useState(false);
  const [selectedWinningOption, setSelectedWinningOption] = useState<string | null>(null);

  // Enhanced prize state
  const [prizeTitle, setPrizeTitle] = useState("");
  const [prizeDescription, setPrizeDescription] = useState("");
  const [prizeType, setPrizeType] = useState<PrizeType>("virtual");
  const [prizeValue, setPrizeValue] = useState("");
  const [claimInstructions, setClaimInstructions] = useState("");
  const [claimLocation, setClaimLocation] = useState("");
  const [claimDeadlineHours, setClaimDeadlineHours] = useState("72");
  const [sendEmail, setSendEmail] = useState(true);

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
    if (!onGiveaway || !selectedWinningOption || !prizeTitle.trim()) return;

    setIsRunningGiveaway(true);

    // Build prize config
    const prizeConfig: PrizeConfig = {
      title: prizeTitle.trim(),
      type: prizeType,
      description: prizeDescription.trim() || undefined,
      value: prizeValue ? parseFloat(prizeValue) : undefined,
      claimInstructions: claimInstructions.trim() || undefined,
      claimLocation: prizeType === "physical" ? claimLocation.trim() || undefined : undefined,
      claimDeadlineHours: claimDeadlineHours ? parseInt(claimDeadlineHours) : undefined,
    };

    await onGiveaway(poll.id, selectedWinningOption, prizeConfig, sendEmail);

    setIsRunningGiveaway(false);
    setShowGiveawayDialog(false);

    // Reset form
    setPrizeTitle("");
    setPrizeDescription("");
    setPrizeType("virtual");
    setPrizeValue("");
    setClaimInstructions("");
    setClaimLocation("");
    setClaimDeadlineHours("72");
    setSendEmail(true);
    setSelectedWinningOption(null);
  };

  return (
    <>
      <Card className={cn(!poll.isActive && "opacity-75")}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-medium leading-tight">
                {poll.question}
              </CardTitle>
              {poll.isQuiz && (
                <Badge variant="outline" className="mt-1.5 text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  <Trophy className="h-3 w-3 mr-1" />
                  Quiz
                </Badge>
              )}
            </div>
            <Badge
              variant={poll.isActive ? "default" : "secondary"}
              className={cn(
                "shrink-0",
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
              const isCorrectAnswer = poll.isQuiz && poll.correctOptionId === option.id;
              const showCorrectAnswer = poll.isQuiz && showResults && isCorrectAnswer;

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
                    isSelected && "border-primary ring-1 ring-primary",
                    showCorrectAnswer && "border-green-500 ring-1 ring-green-500"
                  )}
                >
                  {/* Progress bar background */}
                  {showResults && (
                    <div
                      className={cn(
                        "absolute inset-0 transition-all",
                        showCorrectAnswer ? "bg-green-500/20" : isSelected ? "bg-primary/20" : "bg-muted"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      {showCorrectAnswer ? (
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                      ) : isSelected ? (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      ) : null}
                      <span className={cn(
                        "text-sm",
                        (isSelected || showCorrectAnswer) && "font-medium",
                        showCorrectAnswer && "text-green-700"
                      )}>
                        {option.text}
                        {showCorrectAnswer && (
                          <Badge variant="outline" className="ml-2 text-xs bg-green-500/10 text-green-600 border-green-500/20">
                            Correct
                          </Badge>
                        )}
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

      {/* Enhanced Giveaway Dialog */}
      <Dialog open={showGiveawayDialog} onOpenChange={setShowGiveawayDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Run a Giveaway
            </DialogTitle>
            <DialogDescription>
              Select the winning option and configure the prize. A random winner will be selected from voters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Winning Option Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Winning Option</Label>
              <div className="space-y-2">
                {poll.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedWinningOption(option.id)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-all",
                      selectedWinningOption === option.id
                        ? "border-primary ring-2 ring-primary bg-primary/5"
                        : "hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option.text}</span>
                      <Badge variant="secondary">
                        {option.voteCount || 0} votes
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Prize Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Prize Details
              </h4>

              {/* Prize Title */}
              <div className="space-y-2">
                <Label htmlFor="prizeTitle">Prize Title *</Label>
                <Input
                  id="prizeTitle"
                  value={prizeTitle}
                  onChange={(e) => setPrizeTitle(e.target.value)}
                  placeholder="e.g., Amazon Gift Card"
                  maxLength={255}
                />
              </div>

              {/* Prize Type */}
              <div className="space-y-2">
                <Label htmlFor="prizeType">Prize Type</Label>
                <Select value={prizeType} onValueChange={(v) => setPrizeType(v as PrizeType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Digital (email delivery)
                      </span>
                    </SelectItem>
                    <SelectItem value="physical">
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Physical (pickup required)
                      </span>
                    </SelectItem>
                    <SelectItem value="voucher">
                      <span className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        Voucher/Code
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prize Description */}
              <div className="space-y-2">
                <Label htmlFor="prizeDescription">Description (optional)</Label>
                <Textarea
                  id="prizeDescription"
                  value={prizeDescription}
                  onChange={(e) => setPrizeDescription(e.target.value)}
                  placeholder="Describe the prize..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Prize Value */}
              <div className="space-y-2">
                <Label htmlFor="prizeValue">Value (optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="prizeValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={prizeValue}
                    onChange={(e) => setPrizeValue(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Claim Instructions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4" />
                Claim Instructions
              </h4>

              <div className="space-y-2">
                <Label htmlFor="claimInstructions">How to Claim (optional)</Label>
                <Textarea
                  id="claimInstructions"
                  value={claimInstructions}
                  onChange={(e) => setClaimInstructions(e.target.value)}
                  placeholder="e.g., Present this email at the registration desk..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Physical Prize Location */}
              {prizeType === "physical" && (
                <div className="space-y-2">
                  <Label htmlFor="claimLocation">Pickup Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="claimLocation"
                      value={claimLocation}
                      onChange={(e) => setClaimLocation(e.target.value)}
                      placeholder="e.g., Registration Desk, Hall B"
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              {/* Claim Deadline */}
              <div className="space-y-2">
                <Label htmlFor="claimDeadline">Claim Deadline (hours)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="claimDeadline"
                    type="number"
                    min="1"
                    value={claimDeadlineHours}
                    onChange={(e) => setClaimDeadlineHours(e.target.value)}
                    placeholder="72"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Email Notification */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Send Email Notification</p>
                  <p className="text-xs text-muted-foreground">
                    Winner will receive prize details via email
                  </p>
                </div>
              </div>
              <Switch
                checked={sendEmail}
                onCheckedChange={setSendEmail}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowGiveawayDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGiveaway}
              disabled={!selectedWinningOption || !prizeTitle.trim() || isRunningGiveaway}
              className="gap-2"
            >
              {isRunningGiveaway ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Selecting Winner...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4" />
                  Pick Random Winner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Prize type icon helper
function getPrizeTypeIcon(type: PrizeType) {
  switch (type) {
    case "physical":
      return <Package className="h-4 w-4" />;
    case "virtual":
      return <CreditCard className="h-4 w-4" />;
    case "voucher":
      return <Ticket className="h-4 w-4" />;
    default:
      return <Gift className="h-4 w-4" />;
  }
}

// Prize type label helper
function getPrizeTypeLabel(type: PrizeType) {
  switch (type) {
    case "physical":
      return "Physical Prize";
    case "virtual":
      return "Digital Prize";
    case "voucher":
      return "Voucher/Code";
    default:
      return "Prize";
  }
}

// Enhanced Giveaway Winner Modal
function GiveawayWinnerModal({
  result,
  onClose,
  isCurrentUserWinner = false,
}: {
  result: GiveawayResult;
  onClose: () => void;
  isCurrentUserWinner?: boolean;
}) {
  // Use backend-computed name field
  // Priority: name > firstName+lastName > "Winner"
  const winnerName = result.winner
    ? (result.winner.name ||
       [result.winner.firstName, result.winner.lastName].filter(Boolean).join(" ") ||
       "Winner")
    : null;

  // Handle both cases: prize as string (backward compat) or prize as object (new format)
  const prizeDetails = result.prizeDetails || (typeof result.prize === 'object' ? result.prize as PrizeConfig : undefined);
  const prizeTitle = prizeDetails?.title || (typeof result.prize === 'string' ? result.prize : 'Prize');
  const prizeType = prizeDetails?.type || "virtual";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <div className="text-center py-4">
          {result.winner ? (
            <>
              {/* Celebration animation */}
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-yellow-500/10 rounded-full animate-pulse" />
                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full border-2 border-yellow-500/30">
                  <Trophy className="h-12 w-12 text-yellow-500" />
                </div>
                <PartyPopper className="absolute -top-1 -right-1 h-6 w-6 text-pink-500 animate-bounce" />
              </div>

              <h2 className="text-2xl font-bold mb-1">
                {isCurrentUserWinner ? "You Won!" : "Congratulations!"}
              </h2>

              <p className="text-lg font-semibold text-primary mb-4">
                {winnerName}
              </p>

              {/* Prize Card */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 mb-4 text-left border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getPrizeTypeIcon(prizeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg">{prizeTitle}</p>
                    <Badge variant="outline" className="mt-1">
                      {getPrizeTypeLabel(prizeType)}
                    </Badge>
                    {prizeDetails?.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {prizeDetails.description}
                      </p>
                    )}
                    {prizeDetails?.value && (
                      <p className="text-sm font-medium text-green-600 mt-1">
                        Value: ${prizeDetails.value.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Claim Instructions (shown to winner or organizer) */}
              {(isCurrentUserWinner || prizeDetails?.claimInstructions) && (
                <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    How to Claim
                  </h3>

                  {prizeDetails?.claimInstructions && (
                    <p className="text-sm text-muted-foreground">
                      {prizeDetails.claimInstructions}
                    </p>
                  )}

                  {prizeDetails?.claimLocation && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{prizeDetails.claimLocation}</span>
                    </div>
                  )}

                  {prizeDetails?.claimDeadlineHours && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Claim within {prizeDetails.claimDeadlineHours} hours</span>
                    </div>
                  )}

                  {result.emailSent && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Mail className="h-4 w-4" />
                      <span>Confirmation email sent to winner</span>
                    </div>
                  )}
                </div>
              )}

              {/* Winner email (for organizer view) */}
              {result.winner?.email && !isCurrentUserWinner && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Winner's email: <span className="font-medium">{result.winner.email}</span>
                </div>
              )}

              {/* Total eligible voters */}
              {result.totalEligibleVoters !== undefined && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Selected from {result.totalEligibleVoters} eligible {result.totalEligibleVoters === 1 ? "voter" : "voters"}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center bg-muted rounded-full">
                <Gift className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Winner</h2>
              <p className="text-muted-foreground">
                No one voted for the winning option.
              </p>
            </>
          )}
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} size="lg">
            {isCurrentUserWinner ? "Awesome!" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Quiz Giveaway Result Modal (for multi-poll quiz winners)
function QuizGiveawayResultModal({
  result,
  onClose,
}: {
  result: QuizGiveawayResult;
  onClose: () => void;
}) {
  const currentUserResult = result.currentUserResult;
  const isWinner = currentUserResult?.isWinner ?? false;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="text-center py-4">
          {isWinner ? (
            <>
              {/* Winner celebration */}
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-green-500/10 rounded-full animate-pulse" />
                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-yellow-400/20 to-green-500/20 rounded-full border-2 border-green-500/30">
                  <Trophy className="h-12 w-12 text-yellow-500" />
                </div>
                <PartyPopper className="absolute -top-1 -right-1 h-6 w-6 text-pink-500 animate-bounce" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Quiz Champion!</h2>
              <p className="text-muted-foreground mb-4">
                You qualified for the giveaway!
              </p>

              {/* Score Display */}
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 mb-4 border border-green-500/20">
                <div className="text-4xl font-bold text-green-600">
                  {currentUserResult?.score}/{currentUserResult?.totalQuestions}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.round(((currentUserResult?.score ?? 0) / (currentUserResult?.totalQuestions ?? 1)) * 100)}% correct
                </p>
                {currentUserResult?.rank && (
                  <Badge className="mt-2">Rank #{currentUserResult.rank}</Badge>
                )}
              </div>

              {/* Prize Info */}
              {currentUserResult?.prize && (
                <div className="bg-primary/5 rounded-lg p-4 text-left border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getPrizeTypeIcon(currentUserResult.prize.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{currentUserResult.prize.title}</p>
                      {currentUserResult.prize.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {currentUserResult.prize.description}
                        </p>
                      )}
                      {currentUserResult.prize.claimInstructions && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-1">How to Claim:</p>
                          <p className="text-sm">{currentUserResult.prize.claimInstructions}</p>
                          {currentUserResult.prize.claimLocation && (
                            <div className="flex items-center gap-1 text-sm mt-2">
                              <MapPin className="h-3 w-3" />
                              {currentUserResult.prize.claimLocation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Non-winner view */}
              <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center bg-muted rounded-full">
                <BarChart3 className="h-10 w-10 text-muted-foreground" />
              </div>

              <h2 className="text-xl font-semibold mb-2">Quiz Results</h2>

              {currentUserResult ? (
                <div className="bg-muted/50 rounded-xl p-4 mb-4">
                  <div className="text-3xl font-bold">
                    {currentUserResult.score}/{currentUserResult.totalQuestions}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Passing score: {result.stats.passingScore}
                  </p>
                  <p className="text-sm text-amber-600 mt-2">
                    You needed {result.stats.passingScore - currentUserResult.score} more correct answers to qualify
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">
                  You didn't participate in all quiz polls.
                </p>
              )}
            </>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{result.stats.totalPolls}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{result.stats.totalWinners}</p>
              <p className="text-xs text-muted-foreground">Winners</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{result.stats.totalParticipants}</p>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} size="lg">
            {isWinner ? "Awesome!" : "Close"}
          </Button>
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
  onStatusChange,
}: SessionPollsProps) {
  const {
    activePolls,
    closedPolls,
    polls,
    isConnected,
    isJoined,
    error,
    accessDenied,
    pollsOpen,
    latestGiveaway,
    latestQuizGiveaway,
    currentUserId,
    isCreating,
    isVoting,
    createPoll,
    submitVote,
    closePoll,
    startGiveaway,
    getUserVote,
    clearError,
    clearGiveaway,
    clearQuizGiveaway,
    isOnline,
    cachedAt,
    isStale,
    isFromCache,
  } = useSessionPolls(sessionId, eventId, initialPollsOpen);

  const [showClosedPolls, setShowClosedPolls] = useState(false);

  // Notify parent when polls open status changes via WebSocket
  React.useEffect(() => {
    if (onStatusChange && isJoined) {
      onStatusChange(pollsOpen);
    }
  }, [pollsOpen, isJoined, onStatusChange]);

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

  // Show spinner only when no cached data AND still connecting
  if ((!isConnected || !isJoined) && polls.size === 0) {
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

      {/* Stale/offline indicator */}
      {(isFromCache || !isOnline) && (
        <div className="mx-4 mt-4">
          <StaleDataIndicator
            isStale={isStale}
            isOffline={!isOnline}
            lastFetched={cachedAt}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
        <GiveawayWinnerModal
          result={latestGiveaway}
          onClose={clearGiveaway}
          isCurrentUserWinner={latestGiveaway.winner?.id === currentUserId}
        />
      )}

      {/* Quiz Giveaway Result Modal */}
      {latestQuizGiveaway && (
        <QuizGiveawayResultModal
          result={latestQuizGiveaway}
          onClose={clearQuizGiveaway}
        />
      )}
    </div>
  );
}
