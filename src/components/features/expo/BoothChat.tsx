// src/components/features/expo/BoothChat.tsx
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Send, Loader2, ChevronUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBoothChat } from "@/hooks/use-booth-chat";

export interface BoothChatProps {
  boothId: string;
  eventId: string;
  className?: string;
}

export function BoothChat({ boothId, eventId, className }: BoothChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    hasMore,
    isConnected,
    isLoading,
    isSending,
    error,
    currentUserId,
    sendMessage,
    loadMore,
    clearError,
  } = useBoothChat({ boothId, eventId });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle send message
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput("");
      inputRef.current?.focus();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="m-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex-1">{error}</AlertDescription>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </Alert>
      )}

      {/* Connection status */}
      {!isConnected && (
        <div className="p-2 bg-yellow-50 text-yellow-800 text-sm text-center border-b">
          Connecting to chat...
        </div>
      )}

      {/* Load more button */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={loadMore}
          disabled={isLoading}
          className="mx-auto my-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ChevronUp className="h-4 w-4 mr-2" />
          )}
          Load earlier messages
        </Button>
      )}

      {/* Messages area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const showAvatar =
                index === 0 ||
                messages[index - 1].senderId !== message.senderId;

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isOwn ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  {showAvatar ? (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.senderAvatarUrl || undefined} />
                      <AvatarFallback
                        className={cn(
                          message.isStaff
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {getInitials(message.senderName)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8 flex-shrink-0" />
                  )}

                  {/* Message content */}
                  <div
                    className={cn(
                      "flex flex-col max-w-[70%]",
                      isOwn ? "items-end" : "items-start"
                    )}
                  >
                    {showAvatar && (
                      <div
                        className={cn(
                          "flex items-center gap-2 mb-1",
                          isOwn ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <span className="text-sm font-medium">
                          {message.senderName}
                        </span>
                        {message.isStaff && (
                          <Badge variant="secondary" className="text-xs">
                            Staff
                          </Badge>
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        "rounded-lg px-3 py-2",
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : message.isStaff
                          ? "bg-blue-50 text-blue-900 border border-blue-200"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    </div>

                    <span className="text-xs text-muted-foreground mt-1">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t bg-background flex gap-2"
      >
        <Input
          ref={inputRef}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected || isSending}
          maxLength={2000}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!isConnected || isSending || !messageInput.trim()}
          size="icon"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
