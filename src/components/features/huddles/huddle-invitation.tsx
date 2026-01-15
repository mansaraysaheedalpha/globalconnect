// src/components/features/huddles/huddle-invitation.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { format, formatDistanceToNow, isPast, differenceInMinutes } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Clock,
  MapPin,
  HelpCircle,
  Check,
  X,
  Timer,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HuddleInvitation as HuddleInvitationType,
  formatAttendeeName,
  getAttendeeInitials,
} from "@/types/huddle";

interface HuddleInvitationProps {
  invitation: HuddleInvitationType;
  onAccept: (huddleId: string) => void;
  onDecline: (huddleId: string) => void;
  isResponding?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export const HuddleInvitation = ({
  invitation,
  onAccept,
  onDecline,
  isResponding = false,
  isDisabled = false,
  className = "",
}: HuddleInvitationProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const scheduledDate = new Date(invitation.scheduledAt);
  const isUrgent = differenceInMinutes(scheduledDate, new Date()) <= 15;
  const hasStarted = isPast(scheduledDate);
  const spotsLeft = invitation.maxParticipants - invitation.currentParticipants;

  // Update countdown every minute
  useEffect(() => {
    const updateTimeLeft = () => {
      if (hasStarted) {
        setTimeLeft("Starting now!");
      } else {
        setTimeLeft(formatDistanceToNow(scheduledDate, { addSuffix: true }));
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [scheduledDate, hasStarted]);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        isUrgent && !hasStarted && "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20",
        hasStarted && "border-green-300 bg-green-50/50 dark:bg-green-950/20",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isUrgent && !hasStarted && (
                <Badge variant="destructive" className="text-xs">
                  <Timer className="h-3 w-3 mr-1" />
                  Starting soon
                </Badge>
              )}
              {hasStarted && (
                <Badge variant="default" className="text-xs bg-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Happening now
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg line-clamp-2">
              {invitation.topic}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Problem Statement */}
        {invitation.problemStatement && (
          <div className="flex items-start gap-2 text-sm">
            <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-muted-foreground line-clamp-3">
              {invitation.problemStatement}
            </p>
          </div>
        )}

        {/* Time and Location */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {format(scheduledDate, "h:mm a")}
              </p>
              <p className="text-xs text-muted-foreground">
                {timeLeft} ({invitation.duration} min)
              </p>
            </div>
          </div>

          {invitation.locationName && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{invitation.locationName}</p>
                {invitation.locationDetails && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {invitation.locationDetails}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {invitation.currentParticipants} / {invitation.maxParticipants} joined
              </span>
            </div>
            {spotsLeft <= 2 && spotsLeft > 0 && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
              </Badge>
            )}
          </div>

          {/* Confirmed Attendees */}
          {invitation.confirmedAttendees.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {invitation.confirmedAttendees.slice(0, 4).map((attendee) => (
                  <Avatar
                    key={attendee.userId}
                    className="h-8 w-8 border-2 border-background"
                  >
                    <AvatarImage
                      src={attendee.avatarUrl || undefined}
                      alt={formatAttendeeName(attendee)}
                    />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getAttendeeInitials(attendee)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {invitation.confirmedAttendees.length > 4 && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                    +{invitation.confirmedAttendees.length - 4}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {invitation.confirmedAttendees
                  .slice(0, 2)
                  .map((a) => formatAttendeeName(a))
                  .join(", ")}
                {invitation.confirmedAttendees.length > 2 &&
                  ` +${invitation.confirmedAttendees.length - 2} more`}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onDecline(invitation.huddleId)}
          disabled={isResponding || isDisabled}
        >
          <X className="h-4 w-4 mr-2" />
          Decline
        </Button>
        <Button
          variant="default"
          className="flex-1"
          onClick={() => onAccept(invitation.huddleId)}
          disabled={isResponding || isDisabled || spotsLeft === 0}
        >
          {isResponding ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Joining...
            </>
          ) : spotsLeft === 0 ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Full
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Accept & Join
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * Floating notification-style huddle invitation
 */
interface HuddleInvitationNotificationProps {
  invitation: HuddleInvitationType;
  onAccept: (huddleId: string) => void;
  onDecline: (huddleId: string) => void;
  onDismiss: () => void;
  autoDismissMs?: number;
  className?: string;
}

export const HuddleInvitationNotification = ({
  invitation,
  onAccept,
  onDecline,
  onDismiss,
  autoDismissMs = 30000,
  className = "",
}: HuddleInvitationNotificationProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismissRef.current(), 300);
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  const handleAccept = async () => {
    setIsResponding(true);
    try {
      await onAccept(invitation.huddleId);
    } finally {
      handleDismiss();
    }
  };

  const handleDecline = async () => {
    setIsResponding(true);
    try {
      await onDecline(invitation.huddleId);
    } finally {
      handleDismiss();
    }
  };

  const scheduledDate = new Date(invitation.scheduledAt);
  const spotsLeft = invitation.maxParticipants - invitation.currentParticipants;

  return (
    <div
      className={cn(
        "bg-background border rounded-lg shadow-lg p-4 max-w-sm",
        "animate-in slide-in-from-right-full duration-300",
        isExiting && "animate-out slide-out-to-right-full duration-300",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="p-2 rounded-full bg-primary/10 shrink-0">
          <Users className="h-5 w-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm truncate">{invitation.topic}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            Join a huddle {formatDistanceToNow(scheduledDate, { addSuffix: true })}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {invitation.currentParticipants}/{invitation.maxParticipants}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {invitation.duration} min
            </span>
            {invitation.locationName && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" />
                {invitation.locationName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              disabled={isResponding}
              className="h-8"
            >
              Decline
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAccept}
              disabled={isResponding || spotsLeft === 0}
              className="h-8"
            >
              {isResponding ? "..." : "Join"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Container for multiple huddle invitation notifications
 */
interface HuddleInvitationsContainerProps {
  invitations: HuddleInvitationType[];
  onAccept: (huddleId: string) => void;
  onDecline: (huddleId: string) => void;
  onDismiss: (huddleId: string) => void;
  position?: "top-right" | "bottom-right";
  maxVisible?: number;
  className?: string;
}

export const HuddleInvitationsContainer = ({
  invitations,
  onAccept,
  onDecline,
  onDismiss,
  position = "top-right",
  maxVisible = 3,
  className = "",
}: HuddleInvitationsContainerProps) => {
  const visibleInvitations = invitations.slice(0, maxVisible);

  if (visibleInvitations.length === 0) {
    return null;
  }

  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-20 right-4",
  };

  return (
    <div
      className={cn(
        "fixed z-[100] space-y-2",
        positionClasses[position],
        className
      )}
    >
      {visibleInvitations.map((invitation) => (
        <HuddleInvitationNotification
          key={invitation.huddleId}
          invitation={invitation}
          onAccept={onAccept}
          onDecline={onDecline}
          onDismiss={() => onDismiss(invitation.huddleId)}
        />
      ))}
      {invitations.length > maxVisible && (
        <div className="text-xs text-muted-foreground text-right pr-2">
          +{invitations.length - maxVisible} more huddle invitations
        </div>
      )}
    </div>
  );
};
