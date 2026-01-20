// src/components/features/breakout/BreakoutRoomCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Play, X, LogIn, Video, Timer } from "lucide-react";
import { BreakoutRoom } from "./types";
import { cn } from "@/lib/utils";

interface BreakoutRoomCardProps {
  room: BreakoutRoom;
  eventId: string;
  sessionId: string;
  isOrganizer?: boolean;
  isInRoom?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
  onStart?: () => void;
  onClose?: () => void;
  onView?: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  WAITING: { label: "Waiting", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  ACTIVE: { label: "Active", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  CLOSING: { label: "Closing Soon", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  CLOSED: { label: "Closed", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
};

export function BreakoutRoomCard({
  room,
  eventId,
  sessionId,
  isOrganizer = false,
  isInRoom = false,
  onJoin,
  onLeave,
  onStart,
  onClose,
  onView,
}: BreakoutRoomCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number } | null>(null);

  // Calculate and update time remaining for active rooms
  useEffect(() => {
    if (room.status !== "ACTIVE" || !room.startedAt) {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const startTime = new Date(room.startedAt!).getTime();
      const endTime = startTime + room.durationMinutes * 60 * 1000;
      const now = Date.now();
      const remainingMs = Math.max(0, endTime - now);
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      setTimeRemaining({ minutes, seconds });
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [room.status, room.startedAt, room.durationMinutes]);

  const isFull = room._count.participants >= room.maxParticipants;
  const status = statusConfig[room.status] || statusConfig.WAITING;
  const canJoin = !isFull && room.status !== "CLOSED" && !isInRoom;
  const isTimeLow = timeRemaining !== null && timeRemaining.minutes < 5;
  const isTimeCritical = timeRemaining !== null && timeRemaining.minutes < 1;

  // Navigate to embedded video room
  const handleJoinVideoRoom = () => {
    // Determine base path based on current route
    const isAttendee = pathname.includes("/attendee/");
    const basePath = isAttendee
      ? `/attendee/events/${eventId}/sessions/${sessionId}/breakout-rooms/${room.id}`
      : `/dashboard/events/${eventId}/sessions/${sessionId}/breakout-rooms/${room.id}`;
    router.push(basePath);
  };

  const facilitatorName = room.facilitator
    ? `${room.facilitator.firstName || ""} ${room.facilitator.lastName || ""}`.trim() || "Unknown"
    : "No facilitator";

  return (
    <Card className={cn(
      room.status === "ACTIVE" && "border-green-500/50",
      isTimeCritical && "border-red-500/50 animate-pulse",
      isTimeLow && !isTimeCritical && "border-yellow-500/50"
    )}>
      {/* Time warning banner */}
      {isTimeCritical && (
        <div className="bg-red-500/20 text-red-500 text-xs font-medium py-1.5 px-3 text-center border-b border-red-500/30">
          Room closing in less than 1 minute!
        </div>
      )}
      {isTimeLow && !isTimeCritical && (
        <div className="bg-yellow-500/20 text-yellow-600 text-xs font-medium py-1.5 px-3 text-center border-b border-yellow-500/30">
          Less than 5 minutes remaining
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate">{room.name}</CardTitle>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>
        {room.topic && (
          <p className="text-sm text-muted-foreground line-clamp-2">{room.topic}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {room._count.participants}/{room.maxParticipants}
            </span>
            {isFull && <Badge variant="secondary" className="text-xs">Full</Badge>}
          </div>
          {timeRemaining !== null ? (
            <div className={cn(
              "flex items-center gap-2 font-medium",
              isTimeCritical ? "text-red-500" : isTimeLow ? "text-yellow-500" : "text-green-500"
            )}>
              <Timer className={cn("h-4 w-4", isTimeCritical && "animate-pulse")} />
              <span>
                {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')} left
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{room.durationMinutes} min</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Facilitator: {facilitatorName}
        </p>

        <div className="flex gap-2">
          {isOrganizer ? (
            <>
              {room.status === "WAITING" && (
                <Button size="sm" onClick={onStart} className="flex-1">
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              {room.status === "ACTIVE" && (
                room.videoRoomUrl ? (
                  <Button
                    size="sm"
                    onClick={handleJoinVideoRoom}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Enter Room
                  </Button>
                ) : (
                  <Badge variant="outline" className="flex-1 justify-center bg-green-500/10 text-green-600 border-green-500/20">
                    In Progress
                  </Badge>
                )
              )}
              {room.status !== "CLOSED" && (
                <Button size="sm" variant="destructive" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <>
              {isInRoom ? (
                <div className="flex gap-2 w-full">
                  {room.status === "ACTIVE" && room.videoRoomUrl && (
                    <Button
                      size="sm"
                      onClick={handleJoinVideoRoom}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Enter Room
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onLeave}
                    className={room.status === "ACTIVE" && room.videoRoomUrl ? "" : "w-full"}
                  >
                    Leave
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={onJoin}
                  disabled={!canJoin}
                  className="w-full"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  {isFull ? "Room Full" : "Join Room"}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
