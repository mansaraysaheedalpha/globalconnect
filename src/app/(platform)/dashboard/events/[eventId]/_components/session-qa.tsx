// src/app/(platform)/dashboard/events/[eventId]/_components/session-qa.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSessionQA, Question, QuestionStatus } from "@/hooks/use-session-qa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  HelpCircle,
  ThumbsUp,
  CheckCircle,
  XCircle,
  MessageCircle,
  AlertCircle,
  X,
  Clock,
  User,
  Filter,
  ShieldX,
  Lock,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface SessionQAProps {
  sessionId: string;
  eventId: string;
  className?: string;
  isOrganizer?: boolean;
  isSpeaker?: boolean;
  initialQaOpen?: boolean; // Initial state from GraphQL query
}

// Question card component
const QuestionCard = ({
  question,
  isOwn,
  isOrganizer,
  isSpeaker,
  onUpvote,
  onApprove,
  onDismiss,
  onAnswer,
}: {
  question: Question;
  isOwn: boolean;
  isOrganizer: boolean;
  isSpeaker: boolean;
  onUpvote: () => void;
  onApprove: () => void;
  onDismiss: () => void;
  onAnswer: () => void;
}) => {
  const timestamp = new Date(question.createdAt);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  const fullTime = format(timestamp, "MMM d, yyyy 'at' h:mm a");

  const isOptimistic = (question as any).isOptimistic;
  const canModerate = isOrganizer && question.status === "pending";
  const canAnswer = (isOrganizer || isSpeaker) && !question.answer && question.status === "approved";

  const getStatusBadge = (status: QuestionStatus) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "dismissed":
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Dismissed
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border bg-card transition-all",
        isOptimistic && "opacity-70",
        question.status === "dismissed" && "opacity-50"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {question.isAnonymous ? (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Anonymous
              {isOwn && <span className="ml-1">(You)</span>}
            </span>
          ) : (
            <span className="text-sm font-medium">
              {isOwn
                ? (question.author?.firstName || question.author?.lastName
                    ? `${question.author?.firstName || ""} ${question.author?.lastName || ""}`.trim()
                    : "You")
                : (question.author?.firstName || question.author?.lastName
                    ? `${question.author?.firstName || ""} ${question.author?.lastName || ""}`.trim()
                    : "Unknown User")}
              {isOwn && question.author?.firstName && <span className="text-muted-foreground ml-1">(You)</span>}
            </span>
          )}
          <span className="text-xs text-muted-foreground" title={fullTime}>
            {isOptimistic ? "Submitting..." : timeAgo}
          </span>
        </div>
        {(isOrganizer || isSpeaker) && getStatusBadge(question.status)}
      </div>

      {/* Question text */}
      <p className="text-sm mb-3 whitespace-pre-wrap">{question.text}</p>

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex gap-1 mb-3">
          {question.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Answer section */}
      {question.answer && (
        <div className="mt-3 p-3 rounded-md bg-primary/5 border-l-2 border-primary">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Answered by {question.answer.author?.firstName || "Speaker"}
            </span>
          </div>
          <p className="text-sm text-foreground">{question.answer.text}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <div className="flex items-center gap-2">
          {/* Upvote button - disabled for own questions */}
          <Button
            variant={question.hasUpvoted ? "default" : "outline"}
            size="sm"
            onClick={onUpvote}
            disabled={isOptimistic || isOwn}
            title={isOwn ? "You cannot upvote your own question" : "Upvote this question"}
            className={cn(
              "h-8",
              question.hasUpvoted && "bg-primary/10 text-primary hover:bg-primary/20",
              isOwn && "opacity-50 cursor-not-allowed"
            )}
          >
            <ThumbsUp className={cn("h-3.5 w-3.5 mr-1", question.hasUpvoted && "fill-current")} />
            {question._count?.upvotes || 0}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Moderation actions */}
          {canModerate && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onApprove}
                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDismiss}
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Dismiss
              </Button>
            </>
          )}

          {/* Answer button */}
          {canAnswer && (
            <Button variant="default" size="sm" onClick={onAnswer} className="h-8">
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              Answer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const SessionQA = ({
  sessionId,
  eventId,
  className,
  isOrganizer = false,
  isSpeaker = false,
  initialQaOpen = true,
}: SessionQAProps) => {
  const {
    questions,
    approvedQuestions,
    pendingQuestions,
    isConnected,
    isJoined,
    error,
    accessDenied,
    qaOpen,
    isSending,
    currentUserId,
    askQuestion,
    upvoteQuestion,
    moderateQuestion,
    answerQuestion,
    clearError,
  } = useSessionQA(sessionId, eventId, initialQaOpen);

  const [inputValue, setInputValue] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [answerDialogQuestion, setAnswerDialogQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new questions
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [questions]);

  const handleAsk = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const success = await askQuestion(trimmedValue, isAnonymous);
    if (success) {
      setInputValue("");
      setIsAnonymous(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleAnswer = async () => {
    if (!answerDialogQuestion || !answerText.trim()) return;
    const success = await answerQuestion(answerDialogQuestion.id, answerText);
    if (success) {
      setAnswerDialogQuestion(null);
      setAnswerText("");
    }
  };

  // Filter questions based on active tab and role
  const getFilteredQuestions = () => {
    // For organizers/speakers, show based on tab
    if (isOrganizer || isSpeaker) {
      switch (activeTab) {
        case "pending":
          return pendingQuestions;
        case "approved":
          return approvedQuestions;
        case "all":
        default:
          return questions;
      }
    }
    // For regular attendees, only show approved questions
    return approvedQuestions;
  };

  const filteredQuestions = getFilteredQuestions();

  // Sort by upvotes (highest first)
  const sortedQuestions = [...filteredQuestions].sort(
    (a, b) => (b._count?.upvotes || 0) - (a._count?.upvotes || 0)
  );

  // Loading state
  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Q&A
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p>Connecting to Q&A...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Access denied - user not registered for event
  if (accessDenied) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Q&A
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ShieldX className="h-10 w-10 mb-3 text-destructive/60" />
            <p className="font-medium text-foreground">Access Denied</p>
            <p className="text-sm text-center mt-1">
              You need to register for this event to access Q&A.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isJoined) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Q&A
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p>Joining session...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Q&A is closed - show waiting state for attendees (organizers can still see questions)
  const isQaClosed = !qaOpen;

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Q&A
          </span>
          <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            {qaOpen ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {approvedQuestions.length} questions
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Closed
              </>
            )}
            {(isOrganizer || isSpeaker) && pendingQuestions.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {pendingQuestions.length} pending
              </Badge>
            )}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        {/* Error banner */}
        {error && (
          <div className="mx-4 mb-2 px-3 py-2 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Tabs for organizers/speakers */}
        {(isOrganizer || isSpeaker) && (
          <div className="px-4 pb-2 flex-shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="text-xs">
                  All ({questions.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">
                  Pending ({pendingQuestions.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs">
                  Approved ({approvedQuestions.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Questions list - scrollable area */}
        <div
          ref={scrollAreaRef}
          className="flex-1 px-4 overflow-y-auto min-h-0"
        >
          <div className="space-y-3 py-4">
            {sortedQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <HelpCircle className="h-10 w-10 mb-2 opacity-50" />
                <p>No questions yet</p>
                <p className="text-sm">Be the first to ask!</p>
              </div>
            ) : (
              sortedQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isOwn={question.authorId === currentUserId}
                  isOrganizer={isOrganizer}
                  isSpeaker={isSpeaker}
                  onUpvote={() => upvoteQuestion(question.id)}
                  onApprove={() => moderateQuestion(question.id, "approve")}
                  onDismiss={() => moderateQuestion(question.id, "dismiss")}
                  onAnswer={() => {
                    setAnswerDialogQuestion(question);
                    setAnswerText("");
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Ask question input - fixed at bottom */}
        <div className="p-4 pt-2 border-t flex-shrink-0">
          {isQaClosed && !isOrganizer && !isSpeaker ? (
            <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground bg-muted/50 rounded-lg">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Waiting for host to open Q&A...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                disabled={isSending}
                maxLength={500}
                className="resize-none min-h-[80px]"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <Label htmlFor="anonymous" className="text-sm text-muted-foreground cursor-pointer">
                    Ask anonymously
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{inputValue.length}/500</span>
                  <Button
                    onClick={handleAsk}
                    disabled={!inputValue.trim() || isSending}
                    size="sm"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Ask
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Answer dialog */}
      <AlertDialog
        open={!!answerDialogQuestion}
        onOpenChange={(open) => !open && setAnswerDialogQuestion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Answer Question</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p className="font-medium text-foreground">
                  "{answerDialogQuestion?.text}"
                </p>
                <p className="text-sm">
                  Asked by{" "}
                  {answerDialogQuestion?.isAnonymous
                    ? "Anonymous"
                    : answerDialogQuestion?.author?.firstName || answerDialogQuestion?.author?.lastName
                      ? `${answerDialogQuestion?.author?.firstName || ""} ${answerDialogQuestion?.author?.lastName || ""}`.trim()
                      : "Unknown User"}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your answer..."
            className="resize-none min-h-[100px]"
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAnswer} disabled={!answerText.trim()}>
              Submit Answer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
