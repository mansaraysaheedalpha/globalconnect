// src/components/features/proximity/nearby-users-panel.tsx
"use client";

import React, { useState } from "react";
import { NearbyUser } from "@/types/proximity";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Users,
  MapPin,
  Send,
  Loader2,
  MapPinOff,
  Sparkles,
} from "lucide-react";

interface NearbyUsersPanelProps {
  users: NearbyUser[];
  isTracking: boolean;
  isLoading?: boolean;
  onSendPing: (userId: string, message?: string) => Promise<boolean>;
  className?: string;
}

export const NearbyUsersPanel = ({
  users,
  isTracking,
  isLoading = false,
  onSendPing,
  className = "",
}: NearbyUsersPanelProps) => {
  const [pingingUserId, setPingingUserId] = useState<string | null>(null);
  const [showPingDialog, setShowPingDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [pingMessage, setPingMessage] = useState("");
  const [sendingPing, setSendingPing] = useState(false);

  const handlePingClick = (user: NearbyUser) => {
    setSelectedUser(user);
    setPingMessage("");
    setShowPingDialog(true);
  };

  const handleSendPing = async () => {
    if (!selectedUser) return;

    setSendingPing(true);
    setPingingUserId(selectedUser.id);

    const success = await onSendPing(
      selectedUser.id,
      pingMessage.trim() || undefined
    );

    setSendingPing(false);
    setPingingUserId(null);

    if (success) {
      setShowPingDialog(false);
      setSelectedUser(null);
      setPingMessage("");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return null;
    if (meters < 10) return "Very close";
    if (meters < 50) return `${Math.round(meters)}m away`;
    return `~${Math.round(meters)}m away`;
  };

  // Not tracking state
  if (!isTracking) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-6 text-center", className)}>
        <div className="p-3 rounded-full bg-muted mb-3">
          <MapPinOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h4 className="font-medium text-foreground">Location Tracking Off</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Enable location tracking to discover nearby attendees
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-6", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Finding nearby attendees...</p>
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-6 text-center", className)}>
        <div className="p-3 rounded-full bg-muted mb-3">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h4 className="font-medium text-foreground">No One Nearby</h4>
        <p className="text-sm text-muted-foreground mt-1">
          We'll notify you when other attendees are within range
        </p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className={cn("h-full", className)}>
        <div className="p-2 space-y-1">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {user.distance && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {formatDistance(user.distance)}
                    </span>
                  )}
                </div>
                {/* Shared interests */}
                {user.sharedInterests && user.sharedInterests.length > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    {user.sharedInterests.slice(0, 2).map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {interest}
                      </Badge>
                    ))}
                    {user.sharedInterests.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{user.sharedInterests.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Ping Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePingClick(user)}
                disabled={pingingUserId === user.id}
                className="shrink-0"
              >
                {pingingUserId === user.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Ping
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Ping Dialog */}
      <Dialog open={showPingDialog} onOpenChange={setShowPingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send a Ping
            </DialogTitle>
            <DialogDescription>
              Send a quick hello to {selectedUser?.name}. They'll see your name
              and message.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Hey! Want to connect? (optional)"
              value={pingMessage}
              onChange={(e) => setPingMessage(e.target.value)}
              maxLength={255}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {pingMessage.length}/255 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPingDialog(false)}
              disabled={sendingPing}
            >
              Cancel
            </Button>
            <Button onClick={handleSendPing} disabled={sendingPing}>
              {sendingPing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Ping
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * Compact version for inline display
 */
interface CompactNearbyListProps {
  users: NearbyUser[];
  maxVisible?: number;
  onViewAll?: () => void;
  className?: string;
}

export const CompactNearbyList = ({
  users,
  maxVisible = 3,
  onViewAll,
  className = "",
}: CompactNearbyListProps) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <Avatar
            key={user.id}
            className="h-8 w-8 border-2 border-background"
          >
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {remainingCount > 0 && (
        <span className="text-sm text-muted-foreground">
          +{remainingCount} more
        </span>
      )}
      {onViewAll && (
        <Button variant="link" size="sm" onClick={onViewAll} className="p-0 h-auto">
          View all
        </Button>
      )}
    </div>
  );
};
