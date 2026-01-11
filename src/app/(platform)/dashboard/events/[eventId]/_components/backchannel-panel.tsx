// src/app/(platform)/dashboard/events/[eventId]/_components/backchannel-panel.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  useBackchannel,
  BackchannelMessage,
  TargetableRole,
  StaffMember,
} from "@/hooks/use-backchannel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  Radio,
  Users,
  User,
  Megaphone,
  AlertCircle,
  ShieldX,
  X,
  ChevronDown,
  Eye,
  Mic,
  Shield,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// Helper to get display name
const getDisplayName = (
  author: { firstName?: string; lastName?: string } | undefined | null
): string => {
  if (!author) return "Someone";
  const firstName = author.firstName?.trim();
  const lastName = author.lastName?.trim();
  if (firstName) return firstName;
  if (lastName) return lastName;
  return "Someone";
};

// Helper to get full display name
const getFullDisplayName = (
  author: { firstName?: string; lastName?: string } | undefined | null
): string => {
  if (!author) return "Someone";
  const firstName = author.firstName?.trim();
  const lastName = author.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return fullName || "Someone";
};

// Message target types
type MessageTarget =
  | { type: "all" }
  | { type: "role"; role: TargetableRole }
  | { type: "user"; userId: string; userName: string };

// Extended message type for optimistic updates
interface ExtendedBackchannelMessage extends BackchannelMessage {
  isOptimistic?: boolean;
}

interface BackchannelPanelProps {
  sessionId: string;
  eventId: string;
  className?: string;
  staffMembers?: StaffMember[]; // Optional list of staff for whisper targeting
}

// Message bubble component
const MessageBubble = ({
  message,
  isOwn,
}: {
  message: ExtendedBackchannelMessage;
  isOwn: boolean;
}) => {
  const timestamp = new Date(message.createdAt);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  const fullTime = format(timestamp, "MMM d, yyyy 'at' h:mm a");

  const isOptimistic = message.isOptimistic;

  // Determine whisper badge styling
  const getWhisperBadge = () => {
    if (!message.isWhisper) return null;

    const target = message.whisperTarget || "Whisper";

    // Check if it's a role whisper
    if (target.startsWith("Role:")) {
      const role = target.replace("Role: ", "");
      const roleConfig: Record<string, { icon: React.ReactNode; color: string }> = {
        SPEAKER: { icon: <Mic className="h-3 w-3" />, color: "bg-purple-100 text-purple-700 border-purple-200" },
        MODERATOR: { icon: <Shield className="h-3 w-3" />, color: "bg-blue-100 text-blue-700 border-blue-200" },
        STAFF: { icon: <Users className="h-3 w-3" />, color: "bg-green-100 text-green-700 border-green-200" },
      };
      const config = roleConfig[role] || { icon: <Eye className="h-3 w-3" />, color: "bg-gray-100 text-gray-700 border-gray-200" };

      return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", config.color)}>
          {config.icon}
          {role}s only
        </span>
      );
    }

    // Direct whisper to user
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
        <Eye className="h-3 w-3" />
        {target}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "group flex flex-col gap-1 max-w-[85%]",
        isOwn ? "ml-auto items-end" : "items-start",
        isOptimistic && "opacity-70"
      )}
    >
      {/* Author name and whisper badge */}
      <div className={cn("flex items-center gap-2", isOwn && "flex-row-reverse")}>
        {!isOwn && (
          <span className="text-xs font-medium text-muted-foreground">
            {getFullDisplayName(message.sender)}
          </span>
        )}
        {getWhisperBadge()}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "px-4 py-2 rounded-2xl",
          isOwn
            ? message.isWhisper
              ? "bg-amber-500 text-white rounded-br-md"
              : "bg-primary text-primary-foreground rounded-br-md"
            : message.isWhisper
            ? "bg-amber-50 border border-amber-200 rounded-bl-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
      </div>

      {/* Timestamp */}
      <span className="text-[10px] text-muted-foreground ml-1" title={fullTime}>
        {isOptimistic ? (
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

export const BackchannelPanel = ({
  sessionId,
  eventId,
  className,
  staffMembers = [],
}: BackchannelPanelProps) => {
  const {
    messages,
    isConnected,
    isJoined,
    error,
    accessDenied,
    isSending,
    currentUserId,
    sendMessage,
    sendWhisperToUser,
    sendWhisperToRole,
    clearError,
  } = useBackchannel(sessionId, eventId);

  const [inputValue, setInputValue] = useState("");
  const [target, setTarget] = useState<MessageTarget>({ type: "all" });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    let success = false;

    switch (target.type) {
      case "all":
        success = await sendMessage(trimmedValue);
        break;
      case "role":
        success = await sendWhisperToRole(trimmedValue, target.role);
        break;
      case "user":
        success = await sendWhisperToUser(trimmedValue, target.userId, target.userName);
        break;
    }

    if (success) {
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getTargetLabel = (): string => {
    switch (target.type) {
      case "all":
        return "All Staff";
      case "role":
        return `${target.role}s`;
      case "user":
        return target.userName;
    }
  };

  const getTargetIcon = () => {
    switch (target.type) {
      case "all":
        return <Megaphone className="h-4 w-4" />;
      case "role":
        return <Users className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
    }
  };

  // Loading state
  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Staff Backchannel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p>Connecting to backchannel...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Access denied
  if (accessDenied) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Staff Backchannel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ShieldX className="h-10 w-10 mb-3 text-destructive/60" />
            <p className="font-medium text-foreground">Access Denied</p>
            <p className="text-sm text-center mt-1">
              You don&apos;t have permission to access the staff backchannel.
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
            <Radio className="h-5 w-5" />
            Staff Backchannel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p>Joining backchannel...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-amber-500" />
            Staff Backchannel
          </span>
          <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {messages.length} messages
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
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

        {/* Messages area */}
        <div ref={scrollAreaRef} className="flex-1 px-4 overflow-y-auto min-h-0">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Radio className="h-10 w-10 mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Start the staff conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === currentUserId}
                />
              ))
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 pt-2 border-t">
          {/* Target indicator */}
          {target.type !== "all" && (
            <div className="flex items-center gap-2 mb-2 px-2 py-1 text-xs text-amber-600 bg-amber-50 rounded border border-amber-200">
              <Eye className="h-3 w-3" />
              <span>
                Whisper to: <strong>{getTargetLabel()}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 ml-auto hover:bg-amber-100"
                onClick={() => setTarget({ type: "all" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            {/* Target selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "shrink-0",
                    target.type !== "all" && "border-amber-300 bg-amber-50"
                  )}
                  title={`Send to: ${getTargetLabel()}`}
                >
                  {getTargetIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Send to</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setTarget({ type: "all" })}>
                  <Megaphone className="h-4 w-4 mr-2" />
                  All Staff
                  {target.type === "all" && (
                    <span className="ml-auto text-xs text-muted-foreground">Active</span>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Whisper to Role
                </DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => setTarget({ type: "role", role: TargetableRole.SPEAKER })}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Speakers Only
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTarget({ type: "role", role: TargetableRole.MODERATOR })}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Moderators Only
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTarget({ type: "role", role: TargetableRole.STAFF })}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Staff Only
                </DropdownMenuItem>

                {staffMembers.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Whisper to Person
                    </DropdownMenuLabel>
                    {staffMembers
                      .filter((member) => member.id !== currentUserId)
                      .map((member) => (
                        <DropdownMenuItem
                          key={member.id}
                          onClick={() =>
                            setTarget({
                              type: "user",
                              userId: member.id,
                              userName: getFullDisplayName(member),
                            })
                          }
                        >
                          <User className="h-4 w-4 mr-2" />
                          {getFullDisplayName(member)}
                          {member.role && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {member.role}
                            </span>
                          )}
                        </DropdownMenuItem>
                      ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Message input */}
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                target.type === "all"
                  ? "Message all staff..."
                  : `Whisper to ${getTargetLabel()}...`
              }
              disabled={isSending}
              maxLength={2000}
              className="flex-1"
            />

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              size="icon"
              className={cn(target.type !== "all" && "bg-amber-500 hover:bg-amber-600")}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {inputValue.length}/2000
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
