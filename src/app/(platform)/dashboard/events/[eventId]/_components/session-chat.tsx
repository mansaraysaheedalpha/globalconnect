// src/app/(platform)/dashboard/events/[eventId]/_components/session-chat.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSessionChat, ChatMessage } from "@/hooks/use-session-chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { StaleDataIndicator } from "@/components/ui/stale-data-indicator";
import {
  Send,
  Loader2,
  Pencil,
  Trash2,
  Reply,
  X,
  MessageSquare,
  Smile,
  AlertCircle,
  ShieldX,
  Lock,
  WifiOff,
  Clock,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// Common emoji reactions
const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👏"];

// Helper to get display name with proper fallbacks
const getDisplayName = (author: { firstName?: string; lastName?: string } | undefined | null): string => {
  if (!author) return "Someone";
  const firstName = author.firstName?.trim();
  const lastName = author.lastName?.trim();
  if (firstName) return firstName;
  if (lastName) return lastName;
  return "Someone";
};

// Helper to get full display name (first + last)
const getFullDisplayName = (author: { firstName?: string; lastName?: string } | undefined | null): string => {
  if (!author) return "Someone";
  const firstName = author.firstName?.trim();
  const lastName = author.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return fullName || "Someone";
};

interface SessionChatProps {
  sessionId: string;
  eventId: string;
  sessionName?: string; // Session title for heatmap display (e.g., "Opening Keynote")
  className?: string;
  initialChatOpen?: boolean; // Initial state from GraphQL query
  isOrganizer?: boolean; // Organizers can send messages even when chat is closed
  onStatusChange?: (isOpen: boolean) => void; // Callback when chat open status changes via WebSocket
}

// Extended message type to handle optimistic messages
interface ExtendedChatMessage extends ChatMessage {
  isOptimistic?: boolean;
  isPending?: boolean;
}

// Message bubble component
const MessageBubble = ({
  message,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onReact,
}: {
  message: ExtendedChatMessage;
  isOwn: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const timestamp = new Date(message.timestamp);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  const fullTime = format(timestamp, "MMM d, yyyy 'at' h:mm a");

  const isOptimistic = message.isOptimistic;
  const isPending = message.isPending;

  return (
    <div
      className={cn(
        "group flex flex-col gap-1 max-w-[85%]",
        isOwn ? "ml-auto items-end" : "items-start",
        isOptimistic && "opacity-70"
      )}
    >
      {/* Reply reference */}
      {message.parentMessage && (
        <div
          className={cn(
            "text-xs px-3 py-1.5 rounded-lg bg-muted/50 border-l-2",
            isOwn ? "border-primary/50" : "border-muted-foreground/50"
          )}
        >
          <span className="font-medium text-muted-foreground">
            Replying to {getDisplayName(message.parentMessage.author)}
          </span>
          <p className="text-muted-foreground truncate max-w-[200px]">
            {message.parentMessage.text}
          </p>
        </div>
      )}

      {/* Author name (for others' messages) */}
      {!isOwn && (
        <span className="text-xs font-medium text-muted-foreground ml-1">
          {getFullDisplayName(message.author)}
        </span>
      )}

      {/* Message content with inline actions */}
      <div
        className={cn(
          "relative flex items-start gap-2",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div
          className={cn(
            "px-4 py-2 rounded-2xl",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted rounded-bl-md"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          {message.isEdited && (
            <span className="text-[10px] opacity-70 ml-1">(edited)</span>
          )}
        </div>

        {/* Inline action buttons - always visible beside message */}
        {!isOptimistic && (
          <div
            className={cn(
              "flex items-center gap-0.5 py-1",
              isOwn ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={onReply}
              title="Reply"
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>

            <DropdownMenu open={showReactions} onOpenChange={setShowReactions}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Add reaction"
                >
                  <Smile className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"} className="p-1 min-w-0">
                <div className="flex gap-1">
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact(emoji);
                        setShowReactions(false);
                      }}
                      className="hover:scale-125 transition-transform p-1.5 hover:bg-muted rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {isOwn && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={onEdit}
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={onDelete}
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Reactions summary */}
      {message.reactionsSummary && Object.keys(message.reactionsSummary).length > 0 && (
        <div className="flex gap-1 mt-1">
          {Object.entries(message.reactionsSummary).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-muted text-xs hover:bg-muted/80"
            >
              <span>{emoji}</span>
              <span className="text-muted-foreground">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <span className="text-[10px] text-muted-foreground ml-1" title={fullTime}>
        {isPending ? (
          <span className="flex items-center gap-1">
            <Clock className="h-2 w-2" />
            Queued
          </span>
        ) : isOptimistic ? (
          <span className="flex items-center gap-1">
            <Loader2 className="h-2 w-2 animate-spin" />
            Sending...
          </span>
        ) : (
          timeAgo
        )}
      </span>
    </div>
  );
};

export const SessionChat = ({ sessionId, eventId, sessionName, className, initialChatOpen = true, isOrganizer = false, onStatusChange }: SessionChatProps) => {
  const {
    messages,
    isConnected,
    isJoined,
    error,
    accessDenied,
    chatOpen,
    isSending,
    currentUserId,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    clearError,
    isOnline,
    cachedAt,
    isStale,
    isFromCache,
  } = useSessionChat(sessionId, eventId, initialChatOpen, sessionName);

  // Notify parent when chat open status changes via WebSocket
  useEffect(() => {
    if (onStatusChange && isJoined) {
      onStatusChange(chatOpen);
    }
  }, [chatOpen, isJoined, onStatusChange]);

  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState<ChatMessage | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when replying or editing
  useEffect(() => {
    if (replyingTo || editingMessage) {
      inputRef.current?.focus();
    }
  }, [replyingTo, editingMessage]);

  // Set input value when editing
  useEffect(() => {
    if (editingMessage) {
      setInputValue(editingMessage.text);
    }
  }, [editingMessage]);

  const handleSend = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    if (editingMessage) {
      // Edit existing message
      const success = await editMessage(editingMessage.id, trimmedValue);
      if (success) {
        setEditingMessage(null);
        setInputValue("");
      }
    } else {
      // Send new message
      const success = await sendMessage(trimmedValue, replyingTo?.id);
      if (success) {
        setReplyingTo(null);
        setInputValue("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setReplyingTo(null);
      setEditingMessage(null);
      setInputValue("");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmMessage) return;
    await deleteMessage(deleteConfirmMessage.id);
    setDeleteConfirmMessage(null);
  };

  const cancelReplyOrEdit = () => {
    setReplyingTo(null);
    setEditingMessage(null);
    setInputValue("");
  };

  // Access denied - user not registered for event
  if (accessDenied) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Session Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ShieldX className="h-10 w-10 mb-3 text-destructive/60" />
            <p className="font-medium text-foreground">Access Denied</p>
            <p className="text-sm text-center mt-1">
              You need to register for this event to access the chat.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show spinner only when no cached data AND still connecting
  if ((!isConnected || !isJoined) && messages.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Session Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p>{!isConnected ? "Connecting to chat..." : "Joining session..."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Chat is closed - show waiting state for attendees
  const isChatClosed = !chatOpen;

  return (
    <div className={cn("flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="pb-3 pt-4 px-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold">
            <MessageSquare className="h-5 w-5" />
            Session Chat
          </span>
          <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            {chatOpen ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {messages.length} messages
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Closed
              </>
            )}
          </span>
        </div>
      </div>

      {/* Stale/offline indicator */}
      {(isFromCache || !isOnline) && (
        <div className="px-4 flex-shrink-0">
          <StaleDataIndicator
            isStale={isStale}
            isOffline={!isOnline}
            lastFetched={cachedAt}
          />
        </div>
      )}

      {/* Content area - relative container for absolute positioning */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Error banner */}
        {error && (
          <div className="mx-4 mb-2 px-3 py-2 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center justify-between flex-shrink-0">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Messages area - scrollable */}
        <div
          ref={scrollAreaRef}
          className="flex-1 px-4 overflow-y-auto"
          style={{ minHeight: 0 }}
        >
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Be the first to say something!</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.authorId === currentUserId}
                  onReply={() => setReplyingTo(message)}
                  onEdit={() => setEditingMessage(message)}
                  onDelete={() => setDeleteConfirmMessage(message)}
                  onReact={(emoji) => reactToMessage(message.id, emoji)}
                />
              ))
            )}
          </div>
        </div>

        {/* Reply/Edit indicator */}
        {(replyingTo || editingMessage) && (
          <div className="mx-4 px-3 py-2 bg-muted rounded-t-lg border-b flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm">
              {replyingTo ? (
                <>
                  <Reply className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Replying to</span>
                  <span className="font-medium">{getDisplayName(replyingTo.author)}</span>
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Editing message</span>
                </>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={cancelReplyOrEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 pt-2 border-t flex-shrink-0">
          {isChatClosed && !isOrganizer ? (
            <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground bg-muted/50 rounded-lg">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Waiting for host to open chat...</span>
            </div>
          ) : (
            <>
              {!isOnline && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1 text-xs text-amber-500 bg-amber-500/10 rounded">
                  <WifiOff className="h-3 w-3" />
                  <span>You&apos;re offline — messages will be sent when you reconnect</span>
                </div>
              )}
              {isChatClosed && isOrganizer && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1 text-xs text-amber-600 bg-amber-50 rounded">
                  <Lock className="h-3 w-3" />
                  <span>Chat is closed for attendees. Only you can send messages.</span>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    editingMessage
                      ? "Edit your message..."
                      : replyingTo
                      ? `Reply to ${getDisplayName(replyingTo.author)}...`
                      : !isOnline
                      ? "Type a message (will send when online)..."
                      : "Type a message..."
                  }
                  disabled={isSending}
                  maxLength={1000}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isSending}
                  size="icon"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {inputValue.length}/1000
              </p>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteConfirmMessage}
        onOpenChange={(open) => !open && setDeleteConfirmMessage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The message will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
