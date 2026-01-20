// src/components/features/breakout/RoomAssignmentNotice.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RoomAssignment, AssignmentStatus } from "./types";

interface RoomAssignmentNoticeProps {
  sessionId: string;
  eventId: string;
  userId: string;
  className?: string;
}

export function RoomAssignmentNotice({
  sessionId,
  eventId,
  userId,
  className,
}: RoomAssignmentNoticeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { socket, isConnected } = useSocket();
  const [assignment, setAssignment] = useState<RoomAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  // Fetch user's assignment
  useEffect(() => {
    if (!socket || !isConnected) return;

    setIsLoading(true);
    socket.emit(
      "segment.assignment.get",
      { sessionId },
      (response: { success: boolean; assignment?: RoomAssignment }) => {
        if (response.success) {
          setAssignment(response.assignment || null);
        }
        setIsLoading(false);
      }
    );
  }, [socket, isConnected, sessionId]);

  // Listen for assignment updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleAssignmentReceived = (data: {
      sessionId: string;
      assignment: { roomId: string; roomName: string; status: AssignmentStatus };
    }) => {
      if (data.sessionId === sessionId) {
        // Refresh assignment data
        socket.emit(
          "segment.assignment.get",
          { sessionId },
          (response: { success: boolean; assignment?: RoomAssignment }) => {
            if (response.success) {
              setAssignment(response.assignment || null);
            }
          }
        );
      }
    };

    const handleRoomStarted = (data: { roomId: string }) => {
      if (assignment && assignment.roomId === data.roomId) {
        // Update room status to active
        setAssignment((prev) =>
          prev
            ? {
                ...prev,
                room: { ...prev.room, status: "ACTIVE" },
              }
            : null
        );
      }
    };

    socket.on("breakout.assignment.received", handleAssignmentReceived);
    socket.on("breakout.room.started", handleRoomStarted);

    return () => {
      socket.off("breakout.assignment.received", handleAssignmentReceived);
      socket.off("breakout.room.started", handleRoomStarted);
    };
  }, [socket, isConnected, sessionId, assignment]);

  // Respond to assignment (confirm/decline)
  const handleRespond = useCallback(
    (status: "CONFIRMED" | "DECLINED") => {
      if (!socket) return;

      setIsResponding(true);
      socket.emit(
        "segment.assignment.respond",
        { sessionId, status },
        (response: { success: boolean; assignment?: RoomAssignment }) => {
          setIsResponding(false);
          if (response.success && response.assignment) {
            setAssignment(response.assignment);
          }
        }
      );
    },
    [socket, sessionId]
  );

  // Navigate to room
  const handleJoinRoom = useCallback(() => {
    if (!assignment) return;

    const isAttendee = pathname.includes("/attendee/");
    const basePath = isAttendee
      ? `/attendee/events/${eventId}/sessions/${sessionId}/breakout-rooms/${assignment.roomId}`
      : `/dashboard/events/${eventId}/sessions/${sessionId}/breakout-rooms/${assignment.roomId}`;
    router.push(basePath);
  }, [assignment, pathname, eventId, sessionId, router]);

  if (isLoading) {
    return (
      <Card className={cn("bg-muted/30", className)}>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!assignment) {
    return null;
  }

  const statusColors: Record<AssignmentStatus, string> = {
    PENDING: "bg-gray-500",
    NOTIFIED: "bg-blue-500",
    CONFIRMED: "bg-green-500",
    JOINED: "bg-green-600",
    DECLINED: "bg-red-500",
  };

  const statusLabels: Record<AssignmentStatus, string> = {
    PENDING: "Pending",
    NOTIFIED: "Please Confirm",
    CONFIRMED: "Confirmed",
    JOINED: "Joined",
    DECLINED: "Declined",
  };

  const canJoin =
    assignment.room.status === "ACTIVE" &&
    (assignment.status === "CONFIRMED" || assignment.status === "JOINED");

  const needsResponse = assignment.status === "NOTIFIED";

  return (
    <Card
      className={cn(
        "border-2",
        needsResponse ? "border-blue-500 bg-blue-500/5" : "bg-muted/30",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {needsResponse && (
              <Bell className="h-4 w-4 text-blue-500 animate-pulse" />
            )}
            Your Assigned Room
          </CardTitle>
          <Badge
            className={cn(
              "text-white",
              statusColors[assignment.status as AssignmentStatus]
            )}
          >
            {statusLabels[assignment.status as AssignmentStatus]}
          </Badge>
        </div>
        <CardDescription>
          You have been pre-assigned to a breakout room for this session.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="bg-background rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-lg">{assignment.room.name}</h4>

          {assignment.room.topic && (
            <p className="text-sm text-muted-foreground">
              {assignment.room.topic}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{assignment.room.durationMinutes} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{assignment.room._count.participants} joined</span>
            </div>
          </div>

          {assignment.room.facilitator && (
            <p className="text-sm">
              <span className="text-muted-foreground">Facilitator: </span>
              {assignment.room.facilitator.firstName}{" "}
              {assignment.room.facilitator.lastName}
            </p>
          )}

          <Badge
            variant="outline"
            className={cn(
              assignment.room.status === "ACTIVE"
                ? "border-green-500 text-green-600"
                : "border-yellow-500 text-yellow-600"
            )}
          >
            {assignment.room.status === "ACTIVE" ? "Room is Active" : "Waiting to Start"}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {needsResponse ? (
          <>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => handleRespond("CONFIRMED")}
              disabled={isResponding}
            >
              {isResponding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Confirm
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleRespond("DECLINED")}
              disabled={isResponding}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </>
        ) : canJoin ? (
          <Button className="w-full" onClick={handleJoinRoom}>
            Join Room
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : assignment.status === "CONFIRMED" ? (
          <p className="text-sm text-muted-foreground text-center w-full">
            The room will start soon. You&apos;ll be able to join when it&apos;s active.
          </p>
        ) : assignment.status === "DECLINED" ? (
          <p className="text-sm text-muted-foreground text-center w-full">
            You declined this assignment. You can still join other available rooms.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground text-center w-full">
            Waiting for organizer to notify assignments.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
