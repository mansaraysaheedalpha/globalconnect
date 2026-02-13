// src/components/features/gamification/team-chat-panel.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTeamChat, TeamChatMessage } from "@/hooks/use-team-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  Crown,
  ChevronUp,
  Smile,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TeamChatPanelProps {
  sessionId: string;
  teamId: string;
  teamName: string;
  creatorId: string;
}

const QUICK_REACTIONS = ["👍", "❤️", "🎉", "😂", "🔥", "💯"];

export const TeamChatPanel = ({
  sessionId,
  teamId,
  teamName,
  creatorId,
}: TeamChatPanelProps) => {
  const {
    isConnected,
    messages,
    hasMore,
    isLoadingHistory,
    isSending,
    currentUserId,
    sendMessage,
    toggleReaction,
    loadMoreHistory,
  } = useTeamChat({ sessionId, teamId });

  const [inputText, setInputText] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!inputText.trim() || isSending) return;
    sendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        <MessageCircle className="h-4 w-4 text-indigo-500" />
        <span className="text-sm font-semibold">{teamName} Chat</span>
        {isConnected ? (
          <Badge variant="secondary" className="text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 inline-block" />
            Live
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px]">
            <Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />
            Connecting
          </Badge>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-3"
      >
        {/* Load more */}
        {hasMore && (
          <div className="text-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreHistory}
              disabled={isLoadingHistory}
              className="text-xs"
            >
              {isLoadingHistory ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <ChevronUp className="h-3 w-3 mr-1" />
              )}
              Load older messages
            </Button>
          </div>
        )}

        {messages.length === 0 && isConnected && (
          <div className="text-center py-8">
            <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No messages yet. Say hi to your team!
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isOwn={message.author.id === currentUserId}
            isCaptain={message.author.id === creatorId}
            currentUserId={currentUserId}
            showReactions={showReactions === message.id}
            onToggleReactions={() =>
              setShowReactions(showReactions === message.id ? null : message.id)
            }
            onReact={(emoji) => {
              toggleReaction(message.id, emoji);
              setShowReactions(null);
            }}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Message your team..."
            maxLength={2000}
            disabled={!isConnected || isSending}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!inputText.trim() || !isConnected || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ChatBubble = ({
  message,
  isOwn,
  isCaptain,
  currentUserId,
  showReactions,
  onToggleReactions,
  onReact,
}: {
  message: TeamChatMessage;
  isOwn: boolean;
  isCaptain: boolean;
  currentUserId?: string;
  showReactions: boolean;
  onToggleReactions: () => void;
  onReact: (emoji: string) => void;
}) => {
  const hasReactions = Object.keys(message.reactions || {}).length > 0;

  return (
    <div className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
      <Avatar className="h-7 w-7 flex-shrink-0">
        <AvatarFallback className="text-[10px]">
          {message.author.firstName?.charAt(0)}
          {message.author.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[75%]", isOwn && "items-end")}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-medium">
            {isOwn ? "You" : `${message.author.firstName} ${message.author.lastName}`}
          </span>
          {isCaptain && <Crown className="h-3 w-3 text-yellow-500" />}
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(message.createdAt), "HH:mm")}
          </span>
        </div>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {message.text}
        </div>

        {/* Reactions */}
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {Object.entries(message.reactions || {}).map(([emoji, userIds]) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className={cn(
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors",
                (userIds as string[]).includes(currentUserId || "")
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/50 border-transparent hover:bg-muted"
              )}
            >
              <span>{emoji}</span>
              <span className="text-muted-foreground">{(userIds as string[]).length}</span>
            </button>
          ))}
          <button
            onClick={onToggleReactions}
            className="p-0.5 rounded hover:bg-muted transition-colors"
          >
            <Smile className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Quick reaction picker */}
        {showReactions && (
          <div className="flex gap-1 mt-1 p-1 rounded-lg bg-background border shadow-sm">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className="hover:bg-muted rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
