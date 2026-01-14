// src/components/features/proximity/floating-proximity-widget.tsx
"use client";

import React from "react";
import { NearbyUser } from "@/types/proximity";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import {
  Radar,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { NearbyUsersPanel } from "./nearby-users-panel";

interface FloatingProximityWidgetProps {
  nearbyUsers: NearbyUser[];
  unreadPingCount?: number;
  isTracking: boolean;
  isConnected: boolean;
  isLoading?: boolean;
  error: string | null;
  locationPermission: "granted" | "denied" | "prompt" | "unavailable";
  onStartTracking: () => Promise<boolean>;
  onStopTracking: () => void;
  onSendPing: (userId: string, message?: string) => Promise<boolean>;
  onClearError: () => void;
  position?: "bottom-left" | "bottom-right";
  className?: string;
}

export const FloatingProximityWidget = ({
  nearbyUsers,
  isTracking,
  isConnected,
  isLoading = false,
  error,
  locationPermission,
  onStartTracking,
  onStopTracking,
  onSendPing,
  onClearError,
  position = "bottom-right",
  className = "",
}: FloatingProximityWidgetProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Count of unread pings (resets when sheet is opened)
  const unreadCount = unreadPingCount ?? 0;

  const handleToggleTracking = async () => {
    if (isTracking) {
      onStopTracking();
    } else {
      await onStartTracking();
    }
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
            {isTracking && (
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
