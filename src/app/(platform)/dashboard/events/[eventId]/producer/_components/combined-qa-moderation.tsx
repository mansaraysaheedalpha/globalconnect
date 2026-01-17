// src/app/(platform)/dashboard/events/[eventId]/producer/_components/combined-qa-moderation.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/hooks/use-socket";
import { format } from "date-fns";
import {
  HelpCircle,
  MoreVertical,
  Trash2,
  CheckCircle,
  Filter,
  Search,
  Radio,
  ThumbsUp,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  qaEnabled?: boolean;
  qaOpen?: boolean;
};

type Question = {
  id: string;
  sessionId: string;
  sessionName?: string;
  text: string;
  isAnonymous: boolean;
  status: "pending" | "approved" | "dismissed";
  createdAt: string;
  updatedAt: string;
  isAnswered: boolean;
  isHidden?: boolean;
  tags: string[];
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    upvotes: number;
  };
  answer?: {
    id: string;
    text: string;
    createdAt: string;
  };
};

interface CombinedQAModerationProps {
  sessions: Session[];
  eventId: string;
}

export const CombinedQAModeration = ({ sessions, eventId }: CombinedQAModerationProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unanswered" | "answered">("all");
  const { socket, isConnected } = useSocket();

  // Get Q&A-enabled sessions
  const qaSessions = sessions.filter((s) => s.qaEnabled !== false);

  // Determine which sessions are live
  const now = new Date();
  const liveSessions = qaSessions.filter((s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    return now >= start && now <= end;
  });

  // Join all session Q&A rooms
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Wait for connection acknowledgement then join sessions
    const handleConnectionAck = () => {
      qaSessions.forEach((session) => {
        socket.emit("session.join", { sessionId: session.id, eventId }, (response: { success: boolean; error?: { message: string } }) => {
          if (!response?.success) {
            console.warn(`Failed to join session ${session.id}:`, response?.error?.message);
          }
        });
      });
    };

    // Listen for Q&A history (sent after session.join)
    const handleQAHistory = (data: { questions: Question[] }) => {
      if (data?.questions && Array.isArray(data.questions)) {
        const enrichedQuestions = data.questions.map((q) => {
          const session = qaSessions.find((s) => s.id === q.sessionId);
          return { ...q, sessionName: session?.title || "Unknown Session" };
        });
        setQuestions((prev) => {
          // Merge avoiding duplicates
          const existingIds = new Set(prev.map((q) => q.id));
          const newQuestions = enrichedQuestions.filter((q) => !existingIds.has(q.id));
          return [...newQuestions, ...prev];
        });
      }
    };

    // Listen for new questions
    const handleNewQuestion = (question: Question) => {
      const session = qaSessions.find((s) => s.id === question.sessionId);
      setQuestions((prev) => {
        // Avoid duplicates
        if (prev.some((q) => q.id === question.id)) return prev;
        return [
          { ...question, sessionName: session?.title || "Unknown Session" },
          ...prev,
        ];
      });
    };

    // Listen for question updates (upvotes, answered, etc.)
    const handleQuestionUpdate = (updated: Question) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === updated.id ? { ...q, ...updated } : q))
      );
    };

    // Listen for question deletions
    const handleQuestionDeleted = (data: { questionId: string }) => {
      setQuestions((prev) => prev.filter((q) => q.id !== data.questionId));
    };

    socket.on("connectionAcknowledged", handleConnectionAck);
    socket.on("qa.history", handleQAHistory);
    socket.on("qa.question.new", handleNewQuestion);
    socket.on("qna.question.updated", handleQuestionUpdate);
    socket.on("qna.question.removed", handleQuestionDeleted);

    // If already connected, join immediately
    if (isConnected) {
      handleConnectionAck();
    }

    return () => {
      socket.off("connectionAcknowledged", handleConnectionAck);
      socket.off("qa.history", handleQAHistory);
      socket.off("qa.question.new", handleNewQuestion);
      socket.off("qna.question.updated", handleQuestionUpdate);
      socket.off("qna.question.removed", handleQuestionDeleted);
      // Leave rooms
      qaSessions.forEach((session) => {
        socket.emit("session.leave", { sessionId: session.id });
      });
    };
  }, [socket, isConnected, qaSessions, eventId]);

  // Handle mark as answered
  const handleMarkAnswered = (question: Question) => {
    if (!socket) return;
    socket.emit("qa:answer", {
      sessionId: question.sessionId,
      questionId: question.id,
      eventId,
    });
  };

  // Handle hide/show question
  const handleToggleVisibility = (question: Question) => {
    if (!socket) return;
    socket.emit("qa:toggle-visibility", {
      sessionId: question.sessionId,
      questionId: question.id,
      hidden: !question.isHidden,
      eventId,
    });
  };

  // Handle delete question
  const handleDeleteQuestion = (question: Question) => {
    if (!socket) return;
    socket.emit("qa:delete", {
      sessionId: question.sessionId,
      questionId: question.id,
      eventId,
    });
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (selectedSession !== "all" && q.sessionId !== selectedSession) return false;
    if (searchQuery && !q.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus === "unanswered" && q.isAnswered) return false;
    if (filterStatus === "answered" && !q.isAnswered) return false;
    return true;
  });

  // Sort by upvotes (descending), then by createdAt (newest first)
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    const aUpvotes = a._count?.upvotes || 0;
    const bUpvotes = b._count?.upvotes || 0;
    if (bUpvotes !== aUpvotes) return bUpvotes - aUpvotes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Get session color for visual distinction
  const getSessionColor = (sessionId: string) => {
    const colors = [
      "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "bg-green-500/10 text-green-600 border-green-500/20",
      "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "bg-pink-500/10 text-pink-600 border-pink-500/20",
      "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    ];
    const index = qaSessions.findIndex((s) => s.id === sessionId);
    return colors[index % colors.length];
  };

  const isSessionLive = (sessionId: string) => {
    return liveSessions.some((s) => s.id === sessionId);
  };

  const unansweredCount = questions.filter((q) => !q.isAnswered && !q.isHidden).length;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Combined Q&A Queue
            {liveSessions.length > 0 && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                <Radio className="h-3 w-3 mr-1 animate-pulse" />
                {liveSessions.length} Live
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {unansweredCount > 0 && (
              <Badge variant="destructive">{unansweredCount} unanswered</Badge>
            )}
            <Badge variant="outline">{sortedQuestions.length} total</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Session" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {qaSessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  <div className="flex items-center gap-2">
                    {isSessionLive(session.id) && (
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                    <span className="truncate">{session.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unanswered">Unanswered</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-4">
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <HelpCircle className="h-12 w-12 mb-4 opacity-50 animate-pulse" />
              <p>Connecting to Q&A service...</p>
            </div>
          ) : sortedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              <HelpCircle className="h-12 w-12 mb-4 opacity-50" />
              <p>No questions yet</p>
              <p className="text-sm">Questions will appear here as attendees submit them</p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {sortedQuestions.map((question) => (
                <div
                  key={question.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    question.isAnswered && "bg-green-500/5 border-green-500/20",
                    question.isHidden && "opacity-50",
                    !question.isAnswered && !question.isHidden && "hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getSessionColor(question.sessionId))}
                        >
                          {isSessionLive(question.sessionId) && (
                            <span className="h-1.5 w-1.5 rounded-full bg-current mr-1 animate-pulse" />
                          )}
                          {question.sessionName}
                        </Badge>
                        {question.isAnswered && (
                          <Badge className="bg-green-500 text-white text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Answered
                          </Badge>
                        )}
                        {question.isHidden && (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                        {question.isAnonymous && (
                          <Badge variant="outline" className="text-xs">Anonymous</Badge>
                        )}
                      </div>
                      <p className="text-sm">{question.text}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          {question.isAnonymous
                            ? "Anonymous"
                            : `${question.author?.firstName || ""} ${question.author?.lastName || ""}`.trim() || "Unknown"}
                        </span>
                        <span>{format(new Date(question.createdAt), "h:mm a")}</span>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{question._count?.upvotes || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!question.isAnswered && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAnswered(question)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-500/10"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Answer
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleVisibility(question)}>
                            {question.isHidden ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show Question
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide Question
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteQuestion(question)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
