// src/components/features/breakout/BreakoutRoomCard.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Play, X, LogIn } from "lucide-react";
import { BreakoutRoom } from "./types";

interface BreakoutRoomCardProps {
  room: BreakoutRoom;
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
  isOrganizer = false,
  isInRoom = false,
  onJoin,
  onLeave,
  onStart,
  onClose,
  onView,
}: BreakoutRoomCardProps) {
  const isFull = room._count.participants >= room.maxParticipants;
  const status = statusConfig[room.status] || statusConfig.WAITING;
  const canJoin = !isFull && room.status !== "CLOSED" && !isInRoom;

  const facilitatorName = room.facilitator
    ? `${room.facilitator.firstName || ""} ${room.facilitator.lastName || ""}`.trim() || "Unknown"
    : "No facilitator";

  return (
    <Card className={room.status === "ACTIVE" ? "border-green-500/50" : ""}>
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
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{room.durationMinutes} min</span>
          </div>
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
                <Badge variant="outline" className="flex-1 justify-center bg-green-500/10 text-green-600 border-green-500/20">
                  In Progress
                </Badge>
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onLeave}
                  className="w-full"
                >
                  Leave Room
                </Button>
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
