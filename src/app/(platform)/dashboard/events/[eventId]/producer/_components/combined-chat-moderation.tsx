// src/app/(platform)/dashboard/events/[eventId]/producer/_components/combined-chat-moderation.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
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
  MessageSquare,
  MoreVertical,
  Trash2,
  Filter,
  Search,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  chatEnabled?: boolean;
  chatOpen?: boolean;
};

type ChatMessage = {
  id: string;
  sessionId: string;
  sessionName?: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  isDeleted?: boolean;
};

interface CombinedChatModerationProps {
  sessions: Session[];
  eventId: string;
}

export const CombinedChatModeration = ({ sessions, eventId }: CombinedChatModerationProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();

  // Get chat-enabled sessions
  const chatSessions = sessions.filter((s) => s.chatEnabled !== false);

  // Determine which sessions are live
  const now = new Date();
  const liveSessions = chatSessions.filter((s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    return now >= start && now <= end;
  });

  // Join all session chat rooms
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join all session rooms for chat monitoring
    chatSessions.forEach((session) => {
      socket.emit("chat:join", { sessionId: session.id, eventId });
    });

    // Listen for new messages
    const handleNewMessage = (message: ChatMessage) => {
      const session = chatSessions.find((s) => s.id === message.sessionId);
      setMessages((prev) => [
        ...prev,
        { ...message, sessionName: session?.title || "Unknown Session" },
      ].slice(-500)); // Keep last 500 messages
    };

    // Listen for message deletions
    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId ? { ...m, isDeleted: true } : m
        )
      );
    };

    socket.on("chat:message", handleNewMessage);
    socket.on("chat:message:deleted", handleMessageDeleted);

    return () => {
      socket.off("chat:message", handleNewMessage);
      socket.off("chat:message:deleted", handleMessageDeleted);
      // Leave rooms
      chatSessions.forEach((session) => {
        socket.emit("chat:leave", { sessionId: session.id });
      });
    };
  }, [socket, isConnected, chatSessions, eventId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle delete message
  const handleDeleteMessage = (message: ChatMessage) => {
    if (!socket) return;
    socket.emit("chat:delete", {
      sessionId: message.sessionId,
      messageId: message.id,
      eventId,
    });
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (m.isDeleted) return false;
    if (selectedSession !== "all" && m.sessionId !== selectedSession) return false;
    if (searchQuery && !m.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
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
    const index = chatSessions.findIndex((s) => s.id === sessionId);
    return colors[index % colors.length];
  };

  const isSessionLive = (sessionId: string) => {
    return liveSessions.some((s) => s.id === sessionId);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Combined Chat Stream
            {liveSessions.length > 0 && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                <Radio className="h-3 w-3 mr-1 animate-pulse" />
                {liveSessions.length} Live
              </Badge>
            )}
          </CardTitle>
          <Badge variant="outline">{filteredMessages.length} messages</Badge>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by session" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {chatSessions.map((session) => (
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
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-4" ref={scrollRef}>
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50 animate-pulse" />
              <p>Connecting to chat service...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm">Messages will appear here as attendees chat</p>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors hover:bg-muted/50",
                    message.isDeleted && "opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getSessionColor(message.sessionId))}
                        >
                          {isSessionLive(message.sessionId) && (
                            <span className="h-1.5 w-1.5 rounded-full bg-current mr-1 animate-pulse" />
                          )}
                          {message.sessionName}
                        </Badge>
                        <span className="font-medium text-sm">{message.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.timestamp), "h:mm:ss a")}
                        </span>
                      </div>
                      <p className={cn("mt-1 text-sm", message.isDeleted && "line-through")}>
                        {message.content}
                      </p>
                    </div>
                    {!message.isDeleted && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteMessage(message)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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
