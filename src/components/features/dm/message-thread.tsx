// src/components/features/dm/message-thread.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DirectMessage,
  Conversation,
  MessageStatus,
} from "@/hooks/use-direct-messages";
import {
  Send,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Pencil,
  Trash2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

interface MessageThreadProps {
  conversation: Conversation;
  messages: DirectMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  onEditMessage?: (messageId: string, newText: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onRetryMessage?: (messageId: string) => void;
  onBack?: () => void;
  isTyping?: boolean;
  className?: string;
}

/**
 * DM message thread/conversation view
 */
export const MessageThread = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onRetryMessage,
  onBack,
  isTyping = false,
  className = "",
}: MessageThreadProps) => {
  const [inputValue, setInputValue] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation.id]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartEdit = (message: DirectMessage) => {
    setEditingMessageId(message.id);
    setEditText(message.text);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editText.trim() && onEditMessage) {
      onEditMessage(editingMessageId, editText.trim());
    }
    setEditingMessageId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  const { recipient } = conversation;
  const recipientInitials = `${recipient.firstName[0]}${recipient.lastName[0]}`.toUpperCase();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          {recipient.avatar ? (
            <AvatarImage src={recipient.avatar} alt={recipient.firstName} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary">
              {recipientInitials}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="font-medium">
            {recipient.firstName} {recipient.lastName}
          </h3>
          {isTyping && (
            <p className="text-xs text-muted-foreground animate-pulse">
              typing...
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <AnimatePresence mode="popLayout">
          {groupedMessages.map((group, groupIndex) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 text-xs text-muted-foreground bg-muted rounded-full">
                  {formatDateSeparator(group.date)}
                </span>
              </div>

              {/* Messages in group */}
              {group.messages.map((message, msgIndex) => {
                const isOwnMessage = message.senderId === currentUserId;
                const showAvatar =
                  !isOwnMessage &&
                  (msgIndex === 0 ||
                    group.messages[msgIndex - 1]?.senderId === currentUserId);

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "flex mb-1",
                      isOwnMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    {/* Avatar for received messages */}
                    {!isOwnMessage && (
                      <div className="w-8 mr-2 flex-shrink-0">
                        {showAvatar && (
                          <Avatar className="h-8 w-8">
                            {recipient.avatar ? (
                              <AvatarImage
                                src={recipient.avatar}
                                alt={recipient.firstName}
                              />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {recipientInitials}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        )}
                      </div>
                    )}

                    {/* Message bubble */}
                    <MessageBubble
                      message={message}
                      isOwn={isOwnMessage}
                      onEdit={
                        isOwnMessage ? () => handleStartEdit(message) : undefined
                      }
                      onDelete={
                        isOwnMessage && onDeleteMessage
                          ? () => onDeleteMessage(message.id)
                          : undefined
                      }
                      onRetry={
                        message.status === "failed" && onRetryMessage
                          ? () => onRetryMessage(message.id)
                          : undefined
                      }
                    />
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 pl-10"
          >
            <div className="flex gap-1 px-3 py-2 bg-muted rounded-lg">
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
              <span
                className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <span
                className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </motion.div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={2000}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMessageId} onOpenChange={() => handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Edit your message..."
            maxLength={2000}
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editText.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface MessageBubbleProps {
  message: DirectMessage;
  isOwn: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onRetry?: () => void;
}

const MessageBubble = ({
  message,
  isOwn,
  onEdit,
  onDelete,
  onRetry,
}: MessageBubbleProps) => {
  const time = format(new Date(message.timestamp), "HH:mm");

  return (
    <div
      className={cn(
        "group relative max-w-[75%] px-3 py-2 rounded-lg",
        isOwn
          ? "bg-primary text-primary-foreground rounded-br-sm"
          : "bg-muted rounded-bl-sm"
      )}
    >
      {/* Message text */}
      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>

      {/* Footer: time + status */}
      <div
        className={cn(
          "flex items-center gap-1 mt-1",
          isOwn ? "justify-end" : "justify-start"
        )}
      >
        {message.isEdited && (
          <span className="text-xs opacity-60">edited</span>
        )}
        <span className="text-xs opacity-60">{time}</span>
        {isOwn && <MessageStatusIcon status={message.status} />}
      </div>

      {/* Actions menu */}
      {(onEdit || onDelete || onRetry) && (
        <div
          className={cn(
            "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isOwn ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"
          )}
        >
          {message.status === "failed" && onRetry ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-7 px-2 text-destructive"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"}>
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
};

const MessageStatusIcon = ({ status }: { status?: MessageStatus }) => {
  switch (status) {
    case "sending":
      return <Clock className="h-3 w-3 opacity-60" />;
    case "sent":
      return <Check className="h-3 w-3 opacity-60" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 opacity-60" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-blue-400" />;
    case "failed":
      return <AlertCircle className="h-3 w-3 text-destructive" />;
    default:
      return <Check className="h-3 w-3 opacity-60" />;
  }
};

// Helper functions
interface MessageGroup {
  date: string;
  messages: DirectMessage[];
}

function groupMessagesByDate(messages: DirectMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let currentGroup: MessageGroup | null = null;

  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp);
    const dateKey = format(messageDate, "yyyy-MM-dd");

    if (!currentGroup || currentGroup.date !== dateKey) {
      currentGroup = { date: dateKey, messages: [] };
      groups.push(currentGroup);
    }

    currentGroup.messages.push(message);
  });

  return groups;
}

function formatDateSeparator(dateString: string): string {
  const date = new Date(dateString);

  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  return format(date, "MMMM d, yyyy");
}

/**
 * Empty state when no conversation is selected
 */
export const EmptyConversationState = ({
  className = "",
}: {
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full text-center p-8",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Send className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-medium mb-2">Your Messages</h3>
      <p className="text-muted-foreground text-sm max-w-[250px]">
        Select a conversation from the list or start a new one to begin
        messaging.
      </p>
    </div>
  );
};
