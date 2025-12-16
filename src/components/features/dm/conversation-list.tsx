// src/components/features/dm/conversation-list.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/hooks/use-direct-messages";
import { Search, MessageSquarePlus, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

/**
 * List of DM conversations
 */
export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  searchQuery = "",
  onSearchChange,
  className = "",
}: ConversationListProps) => {
  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const fullName =
      `${conv.recipient.firstName} ${conv.recipient.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Messages</h2>
          {onNewConversation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewConversation}
              className="h-8 w-8 p-0"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        )}
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <AnimatePresence mode="popLayout">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquarePlus className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No conversations found"
                  : "No messages yet. Start a conversation!"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <ConversationItem
                  conversation={conversation}
                  isActive={activeConversationId === conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem = ({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) => {
  const { recipient, lastMessage, unreadCount, updatedAt } = conversation;
  const initials = `${recipient.firstName[0]}${recipient.lastName[0]}`.toUpperCase();

  // Format time
  const timeAgo = formatDistanceToNow(new Date(updatedAt), {
    addSuffix: false,
  });

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left",
        isActive && "bg-muted"
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-12 w-12">
          {recipient.avatar ? (
            <AvatarImage src={recipient.avatar} alt={recipient.firstName} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        {/* Online indicator - placeholder for future */}
        {/* <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" /> */}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">
            {recipient.firstName} {recipient.lastName}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {timeAgo}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p
            className={cn(
              "text-sm truncate",
              unreadCount > 0
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {lastMessage?.text || "Start a conversation"}
          </p>

          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 h-5 min-w-[20px] flex items-center justify-center px-1.5 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
};

/**
 * Compact conversation list for sidebars
 */
interface CompactConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  maxItems?: number;
  className?: string;
}

export const CompactConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  maxItems = 5,
  className = "",
}: CompactConversationListProps) => {
  const displayConversations = conversations.slice(0, maxItems);
  const remainingCount = Math.max(0, conversations.length - maxItems);

  return (
    <div className={cn("space-y-1", className)}>
      {displayConversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={cn(
            "w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors",
            activeConversationId === conversation.id && "bg-muted"
          )}
        >
          <Avatar className="h-8 w-8">
            {conversation.recipient.avatar ? (
              <AvatarImage
                src={conversation.recipient.avatar}
                alt={conversation.recipient.firstName}
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {`${conversation.recipient.firstName[0]}${conversation.recipient.lastName[0]}`}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="text-sm truncate flex-1">
            {conversation.recipient.firstName}
          </span>
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="h-5 min-w-[20px] text-xs px-1">
              {conversation.unreadCount}
            </Badge>
          )}
        </button>
      ))}

      {remainingCount > 0 && (
        <p className="text-xs text-muted-foreground text-center py-1">
          +{remainingCount} more
        </p>
      )}
    </div>
  );
};

/**
 * User selector for starting new conversations
 */
interface UserSelectorProps {
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }>;
  onSelectUser: (userId: string) => void;
  excludeIds?: string[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export const UserSelector = ({
  users,
  onSelectUser,
  excludeIds = [],
  searchQuery = "",
  onSearchChange,
  className = "",
}: UserSelectorProps) => {
  const filteredUsers = users.filter((user) => {
    if (excludeIds.includes(user.id)) return false;
    if (!searchQuery) return true;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Search */}
      {onSearchChange && (
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      {/* User List */}
      <ScrollArea className="max-h-[300px]">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <User className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.firstName} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {`${user.firstName[0]}${user.lastName[0]}`}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium">
                  {user.firstName} {user.lastName}
                </span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
