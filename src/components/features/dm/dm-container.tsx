// src/components/features/dm/dm-container.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDirectMessages, Conversation } from "@/hooks/use-direct-messages";
import { ConversationList, UserSelector } from "./conversation-list";
import { MessageThread, EmptyConversationState } from "./message-thread";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus } from "lucide-react";

interface DMContainerProps {
  eventId?: string;
  availableUsers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }>;
  className?: string;
}

/**
 * Full DM container with conversation list and message thread
 */
export const DMContainer = ({
  eventId,
  availableUsers = [],
  className = "",
}: DMContainerProps) => {
  const { user } = useAuthStore();
  const {
    isConnected,
    conversations,
    activeConversation,
    messages,
    isTyping,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    setActiveConversation,
    retryMessage,
    clearError,
    getTotalUnreadCount,
  } = useDirectMessages(eventId);

  const [showNewConversation, setShowNewConversation] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Filter out current user from available users
  const filteredUsers = availableUsers.filter((u) => u.id !== user?.id);

  // Get existing conversation partner IDs to exclude
  const existingPartnerIds = conversations.map((c) => c.recipientId);

  const handleSelectUser = (userId: string) => {
    const selectedUser = availableUsers.find((u) => u.id === userId);
    if (!selectedUser) return;

    // Check if conversation already exists
    const existingConv = conversations.find((c) => c.recipientId === userId);
    if (existingConv) {
      setActiveConversation(existingConv);
    } else {
      // Create a temporary conversation object
      const newConv: Conversation = {
        id: `temp-${userId}`,
        recipientId: userId,
        recipient: {
          id: selectedUser.id,
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          avatar: selectedUser.avatar,
        },
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setActiveConversation(newConv);
    }

    setShowNewConversation(false);
    setUserSearchQuery("");
  };

  const handleSendMessage = (text: string) => {
    if (!activeConversation) return;
    sendMessage(activeConversation.recipientId, text);
  };

  if (!user) return null;

  return (
    <div className={cn("flex h-full", className)}>
      {/* Conversation List - Hidden on mobile when conversation is active */}
      <div
        className={cn(
          "w-full md:w-80 border-r flex flex-col",
          activeConversation && "hidden md:flex"
        )}
      >
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          onSelectConversation={setActiveConversation}
          onNewConversation={() => setShowNewConversation(true)}
          className="h-full"
        />
      </div>

      {/* Message Thread */}
      <div
        className={cn(
          "flex-1",
          !activeConversation && "hidden md:flex"
        )}
      >
        {activeConversation ? (
          <MessageThread
            conversation={activeConversation}
            messages={messages}
            currentUserId={user.id}
            onSendMessage={handleSendMessage}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            onRetryMessage={retryMessage}
            onBack={() => setActiveConversation(null)}
            isTyping={isTyping[activeConversation.id]}
            className="h-full"
          />
        ) : (
          <EmptyConversationState className="h-full" />
        )}
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <UserSelector
            users={filteredUsers}
            onSelectUser={handleSelectUser}
            excludeIds={existingPartnerIds}
            searchQuery={userSearchQuery}
            onSearchChange={setUserSearchQuery}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Floating DM button with sheet panel
 */
interface FloatingDMButtonProps {
  eventId?: string;
  availableUsers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }>;
  position?: "bottom-left" | "bottom-right";
  className?: string;
}

export const FloatingDMButton = ({
  eventId,
  availableUsers = [],
  position = "bottom-left",
  className = "",
}: FloatingDMButtonProps) => {
  const { user } = useAuthStore();
  const {
    isConnected,
    conversations,
    activeConversation,
    messages,
    isTyping,
    sendMessage,
    editMessage,
    deleteMessage,
    setActiveConversation,
    retryMessage,
    getTotalUnreadCount,
  } = useDirectMessages(eventId);

  const [isOpen, setIsOpen] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const unreadCount = getTotalUnreadCount();
  const filteredUsers = availableUsers.filter((u) => u.id !== user?.id);
  const existingPartnerIds = conversations.map((c) => c.recipientId);

  // Handle opening chat with a specific user (from proximity or other features)
  const handleStartChatWith = useCallback((userId: string, userName: string) => {
    // Check if user exists in availableUsers
    const selectedUser = availableUsers.find((u) => u.id === userId);

    // Check if conversation already exists
    const existingConv = conversations.find((c) => c.recipientId === userId);

    if (existingConv) {
      setActiveConversation(existingConv);
    } else {
      // Create a temporary conversation
      const nameParts = userName.split(" ");
      const newConv: Conversation = {
        id: `temp-${userId}`,
        recipientId: userId,
        recipient: {
          id: userId,
          firstName: selectedUser?.firstName || nameParts[0] || userName,
          lastName: selectedUser?.lastName || nameParts.slice(1).join(" ") || "",
          avatar: selectedUser?.avatar,
        },
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setActiveConversation(newConv);
    }

    // Open the sheet
    setIsOpen(true);
  }, [availableUsers, conversations, setActiveConversation]);

  // Listen for custom event to start chat from other components (e.g., proximity)
  useEffect(() => {
    const handleEvent = (e: CustomEvent<{ userId: string; userName: string }>) => {
      handleStartChatWith(e.detail.userId, e.detail.userName);
    };

    window.addEventListener("start-dm-chat", handleEvent as EventListener);
    return () => window.removeEventListener("start-dm-chat", handleEvent as EventListener);
  }, [handleStartChatWith]);

  const handleSelectUser = (userId: string) => {
    const selectedUser = availableUsers.find((u) => u.id === userId);
    if (!selectedUser) return;

    const existingConv = conversations.find((c) => c.recipientId === userId);
    if (existingConv) {
      setActiveConversation(existingConv);
    } else {
      const newConv: Conversation = {
        id: `temp-${userId}`,
        recipientId: userId,
        recipient: {
          id: selectedUser.id,
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          avatar: selectedUser.avatar,
        },
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setActiveConversation(newConv);
    }

    setShowNewConversation(false);
    setUserSearchQuery("");
  };

  const handleSendMessage = (text: string) => {
    if (!activeConversation) return;
    sendMessage(activeConversation.recipientId, text);
  };

  if (!user) return null;

  const positionClasses =
    position === "bottom-left"
      ? "bottom-4 left-4 safe-bottom"
      : "bottom-4 right-4 safe-bottom";

  return (
    <>
      <div className={cn("fixed z-40", positionClasses, className)}>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full shadow-lg",
                !isConnected && "opacity-70"
              )}
            >
              <MessageSquare className="h-6 w-6" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-xl p-0">
            <div className="h-full flex flex-col">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Messages
                    {isConnected && (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewConversation(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 flex overflow-hidden">
                {/* Conversation List */}
                {!activeConversation ? (
                  <ConversationList
                    conversations={conversations}
                    onSelectConversation={setActiveConversation}
                    className="flex-1"
                  />
                ) : (
                  /* Message Thread */
                  <MessageThread
                    conversation={activeConversation}
                    messages={messages}
                    currentUserId={user.id}
                    onSendMessage={handleSendMessage}
                    onEditMessage={editMessage}
                    onDeleteMessage={deleteMessage}
                    onRetryMessage={retryMessage}
                    onBack={() => setActiveConversation(null)}
                    isTyping={isTyping[activeConversation.id]}
                    className="flex-1"
                  />
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <UserSelector
            users={filteredUsers}
            onSelectUser={handleSelectUser}
            excludeIds={existingPartnerIds}
            searchQuery={userSearchQuery}
            onSearchChange={setUserSearchQuery}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * DM button for header/navbar integration
 */
interface HeaderDMButtonProps {
  eventId?: string;
  availableUsers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }>;
  className?: string;
}

export const HeaderDMButton = ({
  eventId,
  availableUsers = [],
  className = "",
}: HeaderDMButtonProps) => {
  const { user } = useAuthStore();
  const {
    isConnected,
    conversations,
    activeConversation,
    messages,
    isTyping,
    sendMessage,
    editMessage,
    deleteMessage,
    setActiveConversation,
    retryMessage,
    getTotalUnreadCount,
  } = useDirectMessages(eventId);

  const [showNewConversation, setShowNewConversation] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const unreadCount = getTotalUnreadCount();
  const filteredUsers = availableUsers.filter((u) => u.id !== user?.id);
  const existingPartnerIds = conversations.map((c) => c.recipientId);

  const handleSelectUser = (userId: string) => {
    const selectedUser = availableUsers.find((u) => u.id === userId);
    if (!selectedUser) return;

    const existingConv = conversations.find((c) => c.recipientId === userId);
    if (existingConv) {
      setActiveConversation(existingConv);
    } else {
      const newConv: Conversation = {
        id: `temp-${userId}`,
        recipientId: userId,
        recipient: {
          id: selectedUser.id,
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          avatar: selectedUser.avatar,
        },
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setActiveConversation(newConv);
    }

    setShowNewConversation(false);
    setUserSearchQuery("");
  };

  const handleSendMessage = (text: string) => {
    if (!activeConversation) return;
    sendMessage(activeConversation.recipientId, text);
  };

  if (!user) return null;

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative", className)}
          >
            <MessageSquare className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-xs flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                  {isConnected && (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewConversation(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 flex flex-col overflow-hidden">
              {!activeConversation ? (
                <ConversationList
                  conversations={conversations}
                  onSelectConversation={setActiveConversation}
                  className="flex-1"
                />
              ) : (
                <MessageThread
                  conversation={activeConversation}
                  messages={messages}
                  currentUserId={user.id}
                  onSendMessage={handleSendMessage}
                  onEditMessage={editMessage}
                  onDeleteMessage={deleteMessage}
                  onRetryMessage={retryMessage}
                  onBack={() => setActiveConversation(null)}
                  isTyping={isTyping[activeConversation.id]}
                  className="flex-1"
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <UserSelector
            users={filteredUsers}
            onSelectUser={handleSelectUser}
            excludeIds={existingPartnerIds}
            searchQuery={userSearchQuery}
            onSearchChange={setUserSearchQuery}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
