// src/components/features/proximity/floating-proximity-widget.tsx
"use client";

import React, { useState } from "react";
import { NearbyUser, ProximityPing } from "@/types/proximity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Radar,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Bell,
  MessageCircle,
  MessageSquare,
  Send,
  X,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NearbyUsersPanel } from "./nearby-users-panel";
import { RecommendationsPanel } from "../recommendations/recommendations-panel";

interface FloatingProximityWidgetProps {
  eventId: string;
  nearbyUsers: NearbyUser[];
  receivedPings: ProximityPing[];
  isTracking: boolean;
  isConnected: boolean;
  isLoading?: boolean;
  error: string | null;
  locationPermission: "granted" | "denied" | "prompt" | "unavailable";
  onStartTracking: () => Promise<boolean>;
  onStopTracking: () => void;
  onSendPing: (userId: string, message?: string) => Promise<boolean>;
  onDismissPing: (index: number) => void;
  onStartChat?: (userId: string, userName: string) => void;
  onClearError: () => void;
  position?: "bottom-left" | "bottom-right";
  className?: string;
}

export const FloatingProximityWidget = ({
  eventId,
  nearbyUsers,
  receivedPings,
  isTracking,
  isConnected,
  isLoading = false,
  error,
  locationPermission,
  onStartTracking,
  onStopTracking,
  onSendPing,
  onDismissPing,
  onStartChat,
  onClearError,
  position = "bottom-right",
  className = "",
}: FloatingProximityWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"nearby" | "for-you">("nearby");
  const [replyingTo, setReplyingTo] = useState<{ index: number; ping: ProximityPing } | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const unreadCount = receivedPings.length;

  const handleToggleTracking = async () => {
    if (isTracking) {
      onStopTracking();
    } else {
      await onStartTracking();
    }
  };

  const handleStartReply = (index: number, ping: ProximityPing) => {
    setReplyingTo({ index, ping });
    setReplyMessage("");
  };

  const handleSendReply = async () => {
    if (!replyingTo) return;

    setIsSendingReply(true);
    const success = await onSendPing(replyingTo.ping.fromUser.id, replyMessage.trim() || undefined);
    setIsSendingReply(false);

    if (success) {
      onDismissPing(replyingTo.index);
      setReplyingTo(null);
      setReplyMessage("");
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyMessage("");
  };

  const positionClasses =
    position === "bottom-left"
      ? "bottom-4 left-4 safe-bottom"
      : "bottom-4 right-4 safe-bottom";

  const nearbyCount = nearbyUsers.length;

  return (
    <div className={cn("fixed z-40", positionClasses, className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg relative",
              isTracking && "ring-2 ring-primary ring-offset-2",
              !isConnected && "opacity-70"
            )}
            variant={isTracking ? "default" : "secondary"}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Radar className={cn("h-6 w-6", isTracking && "animate-pulse")} />
            )}
            {/* Unread pings badge - takes priority over nearby count */}
            {unreadCount > 0 ? (
              <Badge
                className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center bg-amber-500 hover:bg-amber-500 text-white animate-pulse"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            ) : (
              /* Nearby count badge - only show when no unread pings */
              isTracking && nearbyCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center"
                >
                  {nearbyCount > 99 ? "99+" : nearbyCount}
                </Badge>
              )
            )}
            {/* Tracking indicator */}
            {isTracking && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <div className="h-full flex flex-col">
            {/* Header - title only, no controls near X button */}
            <SheetHeader className="px-4 pt-3 pb-3 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Radar className="h-5 w-5" />
                Nearby Attendees
                {isConnected && (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </SheetTitle>
              <SheetDescription className="text-left">
                Discover and connect with people around you
              </SheetDescription>
            </SheetHeader>

            {/* Toggle control - separate section below header, away from X button */}
            <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
              <span className="text-sm font-medium">
                Location Tracking
              </span>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-sm font-medium",
                  isTracking ? "text-green-600" : "text-muted-foreground"
                )}>
                  {isTracking ? "On" : "Off"}
                </span>
                <Switch
                  checked={isTracking}
                  onCheckedChange={handleToggleTracking}
                  disabled={locationPermission === "denied" || locationPermission === "unavailable"}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="px-4 py-3 bg-destructive/10 border-b flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive flex-1">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearError}
                  className="h-6 px-2"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Permission denied warning */}
            {locationPermission === "denied" && (
              <div className="px-4 py-3 bg-amber-500/10 border-b flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-700">
                    Location Access Denied
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Please enable location access in your browser settings to use
                    this feature.
                  </p>
                </div>
              </div>
            )}

            {/* Geolocation unavailable */}
            {locationPermission === "unavailable" && (
              <div className="px-4 py-3 bg-muted border-b flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Location Unavailable</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your device doesn't support location services.
                  </p>
                </div>
              </div>
            )}

            {/* Tracking status indicator */}
            {isTracking && activeTab === "nearby" && (
              <div className="px-4 py-2 bg-primary/5 border-b flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-xs text-primary font-medium">
                  Actively scanning for nearby attendees
                </span>
              </div>
            )}

            {/* Tabs for Nearby / Recommendations */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "nearby" | "for-you")}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="grid w-full grid-cols-2 mx-4 mt-2 mb-0 w-[calc(100%-2rem)]">
                <TabsTrigger value="nearby" className="flex items-center gap-1.5">
                  <Radar className="h-4 w-4" />
                  Nearby
                  {isTracking && nearbyUsers.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {nearbyUsers.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="for-you" className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  For You
                </TabsTrigger>
              </TabsList>

              <TabsContent value="nearby" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=active]:flex data-[state=inactive]:hidden">
                {/* Received Pings Section */}
            {receivedPings.length > 0 && (
              <div className="border-b">
                <div className="px-4 py-2 bg-amber-500/10 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    {receivedPings.length} new ping{receivedPings.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {receivedPings.map((ping, index) => (
                    <div
                      key={`${ping.fromUser.id}-${ping.receivedAt}`}
                      className="px-4 py-3 border-b last:border-b-0 bg-background"
                    >
                      {replyingTo?.index === index ? (
                        /* Reply input mode */
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Reply to {ping.fromUser.name}</p>
                          <Input
                            placeholder="Type your reply... (optional)"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            maxLength={255}
                            autoFocus
                            className="h-9"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelReply}
                              disabled={isSendingReply}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSendReply}
                              disabled={isSendingReply}
                            >
                              {isSendingReply ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-3 w-3 mr-1" />
                                  Send
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Normal ping display */
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{ping.fromUser.name}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(ping.receivedAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 break-words">
                              {ping.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartReply(index, ping)}
                              className="h-7 px-2"
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                            {onStartChat && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  onStartChat(ping.fromUser.id, ping.fromUser.name);
                                  onDismissPing(index);
                                }}
                                className="h-7 px-2"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Chat
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDismissPing(index)}
                              className="h-7 w-7 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
                )}

                {/* Nearby Users Panel */}
                <div className="flex-1 overflow-hidden">
                  <NearbyUsersPanel
                    users={nearbyUsers}
                    isTracking={isTracking}
                    isLoading={isLoading}
                    onSendPing={onSendPing}
                    className="h-full"
                  />
                </div>

                {/* Footer with stats */}
                {isTracking && nearbyCount > 0 && (
                  <div className="px-4 py-3 border-t bg-muted/30">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {nearbyCount} attendee{nearbyCount !== 1 ? "s" : ""} within
                        100m
                      </span>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="for-you" className="flex-1 overflow-auto mt-0 p-4">
                <RecommendationsPanel
                  eventId={eventId}
                  onStartChat={onStartChat || (() => {})}
                />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
