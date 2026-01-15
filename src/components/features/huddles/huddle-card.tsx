// src/components/features/huddles/huddle-card.tsx
"use client";

import { format, formatDistanceToNow, isPast } from "date-fns";
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
  Play,
  CheckCircle,
  XCircle,
  Timer,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UserHuddle,
  HuddleStatus,
  getHuddleStatusLabel,
} from "@/types/huddle";

interface HuddleCardProps {
  huddle: UserHuddle;
  onLeave?: (huddleId: string) => void;
  onStart?: (huddleId: string) => void;
  onComplete?: (huddleId: string) => void;
  onCancel?: (huddleId: string) => void;
  isCreator?: boolean;
  className?: string;
}

const getStatusBadge = (status: HuddleStatus) => {
  switch (status) {
    case "FORMING":
      return (
        <Badge variant="outline" className="text-xs">
          <Timer className="h-3 w-3 mr-1" />
          {getHuddleStatusLabel(status)}
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge variant="default" className="text-xs bg-blue-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          {getHuddleStatusLabel(status)}
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="default" className="text-xs bg-green-600">
          <Play className="h-3 w-3 mr-1" />
          {getHuddleStatusLabel(status)}
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="secondary" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          {getHuddleStatusLabel(status)}
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="destructive" className="text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          {getHuddleStatusLabel(status)}
        </Badge>
      );
    default:
      return null;
  }
};

const getMyStatusBadge = (myStatus: string) => {
  switch (myStatus) {
    case "INVITED":
      return (
        <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
          Pending Response
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Joined
        </Badge>
      );
    case "DECLINED":
      return (
        <Badge variant="outline" className="text-xs text-red-600 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Declined
        </Badge>
      );
    case "ATTENDED":
      return (
        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Attended
        </Badge>
      );
    default:
      return null;
  }
};

export const HuddleCard = ({
  huddle,
  onLeave,
  onStart,
  onComplete,
  onCancel,
  isCreator = false,
  className = "",
}: HuddleCardProps) => {
  const scheduledDate = new Date(huddle.scheduledAt);
  const hasStarted = isPast(scheduledDate);
  const canLeave = huddle.status === "FORMING" || huddle.status === "CONFIRMED";
  const canStart = isCreator && huddle.status === "CONFIRMED";
  const canComplete = isCreator && huddle.status === "IN_PROGRESS";
  const canCancel = isCreator && (huddle.status === "FORMING" || huddle.status === "CONFIRMED");

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        huddle.status === "IN_PROGRESS" && "border-green-300 bg-green-50/50 dark:bg-green-950/20",
        huddle.status === "CANCELLED" && "opacity-60",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {getStatusBadge(huddle.status)}
              {getMyStatusBadge(huddle.myStatus)}
            </div>
            <CardTitle className="text-lg line-clamp-2">
              {huddle.topic}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Problem Statement */}
        {huddle.problemStatement && (
          <div className="flex items-start gap-2 text-sm">
            <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-muted-foreground line-clamp-2">
              {huddle.problemStatement}
            </p>
          </div>
        )}

        {/* Time and Location */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {format(scheduledDate, "MMM d, h:mm a")}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasStarted
                  ? "Started " + formatDistanceToNow(scheduledDate, { addSuffix: true })
                  : formatDistanceToNow(scheduledDate, { addSuffix: true })}
                {" "}({huddle.duration} min)
              </p>
            </div>
          </div>

          {huddle.locationName && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium truncate max-w-[150px]">
                  {huddle.locationName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {huddle.currentParticipants} / {huddle.maxParticipants} participants
          </span>
        </div>
      </CardContent>

      {(canLeave || canStart || canComplete || canCancel) && (
        <CardFooter className="gap-2 pt-0">
          {canLeave && onLeave && huddle.myStatus === "ACCEPTED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLeave(huddle.id)}
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>
          )}
          {canCancel && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(huddle.id)}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          {canStart && onStart && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onStart(huddle.id)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Huddle
            </Button>
          )}
          {canComplete && onComplete && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onComplete(huddle.id)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * List of user's huddles
 */
interface HuddleListProps {
  huddles: UserHuddle[];
  currentUserId?: string;
  onLeave?: (huddleId: string) => void;
  onStart?: (huddleId: string) => void;
  onComplete?: (huddleId: string) => void;
  onCancel?: (huddleId: string) => void;
  emptyMessage?: string;
  className?: string;
}

export const HuddleList = ({
  huddles,
  currentUserId,
  onLeave,
  onStart,
  onComplete,
  onCancel,
  emptyMessage = "No huddles yet",
  className = "",
}: HuddleListProps) => {
  if (huddles.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {huddles.map((huddle) => (
        <HuddleCard
          key={huddle.id}
          huddle={huddle}
          isCreator={currentUserId === huddle.createdById}
          onLeave={onLeave}
          onStart={onStart}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};
