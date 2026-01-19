// src/components/features/breakout/BreakoutRoomList.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { BreakoutRoomCard } from "./BreakoutRoomCard";
import { BreakoutRoom } from "./types";
import { Loader } from "lucide-react";

interface BreakoutRoomListProps {
  sessionId: string;
  eventId: string;
  userId?: string;
  isOrganizer?: boolean;
  onJoinRoom?: (roomId: string) => void;
  onLeaveRoom?: (roomId: string) => void;
  onStartRoom?: (roomId: string) => void;
  onCloseRoom?: (roomId: string) => void;
  onViewRoom?: (roomId: string) => void;
}

export function BreakoutRoomList({
  sessionId,
  eventId,
  userId,
  isOrganizer = false,
  onJoinRoom,
  onLeaveRoom,
  onStartRoom,
  onCloseRoom,
  onViewRoom,
}: BreakoutRoomListProps) {
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingVideoRoomId, setLoadingVideoRoomId] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();

  // Join the session socket room to receive real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !sessionId) return;

    // Join the session room to receive breakout events
    socket.emit("session.join", { sessionId });

    return () => {
      // Leave the session room when unmounting
      socket.emit("session.leave", { sessionId });
    };
  }, [socket, isConnected, sessionId]);

  // Fetch initial rooms
  useEffect(() => {
    if (!socket || !isConnected || !sessionId) return;

    setIsLoading(true);
    socket.emit(
      "breakout.rooms.list",
      { sessionId },
      (response: { success: boolean; rooms?: BreakoutRoom[]; error?: string }) => {
        setIsLoading(false);
        if (response.success && response.rooms) {
          setRooms(response.rooms);
          // Check if user is in any room
          if (userId) {
            const userRoom = response.rooms.find((r) =>
              r.participants?.some((p) => p.userId === userId && !p.leftAt)
            );
            if (userRoom) {
              setCurrentRoomId(userRoom.id);
            }
          }
        }
      }
    );
  }, [socket, isConnected, sessionId, userId]);

  // Listen for room updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRoomCreated = (room: BreakoutRoom) => {
      // Add room only if it doesn't already exist (prevent duplicates)
      setRooms((prev) => {
        if (prev.some((r) => r.id === room.id)) {
          return prev;
        }
        return [...prev, room];
      });
    };

    const handleRoomClosed = (data: { roomId: string }) => {
      setRooms((prev) => prev.filter((r) => r.id !== data.roomId));
      if (currentRoomId === data.roomId) {
        setCurrentRoomId(null);
      }
    };

    const handleRoomsUpdated = (data: {
      roomId: string;
      participantCount?: number;
      status?: string;
      startedAt?: string;
      videoRoomUrl?: string;
    }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === data.roomId
            ? {
                ...r,
                _count: {
                  participants: data.participantCount ?? r._count.participants,
                },
                status: (data.status as BreakoutRoom["status"]) ?? r.status,
                startedAt: data.startedAt ?? r.startedAt,
                videoRoomUrl: data.videoRoomUrl ?? r.videoRoomUrl,
              }
            : r
        )
      );
    };

    // Handle room started event (updates status and video URL)
    const handleRoomStarted = (data: {
      roomId: string;
      startedAt?: string;
      durationMinutes?: number;
      videoRoomUrl?: string;
    }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === data.roomId
            ? {
                ...r,
                status: "ACTIVE" as const,
                startedAt: data.startedAt ?? r.startedAt,
                videoRoomUrl: data.videoRoomUrl ?? r.videoRoomUrl,
              }
            : r
        )
      );
    };

    const handleRecalled = () => {
      setRooms([]);
      setCurrentRoomId(null);
    };

    socket.on("breakout.room.created", handleRoomCreated);
    socket.on("breakout.room.closed", handleRoomClosed);
    socket.on("breakout.rooms.updated", handleRoomsUpdated);
    socket.on("breakout.room.started", handleRoomStarted);
    socket.on("breakout.all.recalled", handleRecalled);
    socket.on("breakout.recalled", handleRecalled);

    return () => {
      socket.off("breakout.room.created", handleRoomCreated);
      socket.off("breakout.room.closed", handleRoomClosed);
      socket.off("breakout.rooms.updated", handleRoomsUpdated);
      socket.off("breakout.room.started", handleRoomStarted);
      socket.off("breakout.all.recalled", handleRecalled);
      socket.off("breakout.recalled", handleRecalled);
    };
  }, [socket, isConnected, currentRoomId]);

  const handleJoin = useCallback(
    (roomId: string) => {
      if (!socket) return;
      socket.emit(
        "breakout.room.join",
        { roomId },
        (response: { success: boolean; room?: BreakoutRoom; error?: string }) => {
          if (response.success) {
            setCurrentRoomId(roomId);
            onJoinRoom?.(roomId);
          }
        }
      );
    },
    [socket, onJoinRoom]
  );

  const handleLeave = useCallback(
    (roomId: string) => {
      if (!socket) return;
      socket.emit(
        "breakout.room.leave",
        { roomId },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            setCurrentRoomId(null);
            onLeaveRoom?.(roomId);
          }
        }
      );
    },
    [socket, onLeaveRoom]
  );

  const handleStart = useCallback(
    (roomId: string) => {
      if (!socket) return;
      socket.emit(
        "breakout.room.start",
        { roomId },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            onStartRoom?.(roomId);
          }
        }
      );
    },
    [socket, onStartRoom]
  );

  const handleClose = useCallback(
    (roomId: string) => {
      if (!socket) return;
      socket.emit(
        "breakout.room.close",
        { roomId },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            onCloseRoom?.(roomId);
          }
        }
      );
    },
    [socket, onCloseRoom]
  );

  const handleJoinVideo = useCallback(
    (roomId: string) => {
      if (!socket) return;

      setLoadingVideoRoomId(roomId);
      socket.emit(
        "breakout.room.getVideoUrl",
        { roomId },
        (response: {
          success: boolean;
          joinUrl?: string;
          videoUrl?: string;
          token?: string;
          error?: string;
        }) => {
          setLoadingVideoRoomId(null);
          if (response.success && response.joinUrl) {
            // Open video room in new tab
            window.open(response.joinUrl, "_blank", "noopener,noreferrer");
          } else {
            console.error("Failed to get video URL:", response.error);
          }
        }
      );
    },
    [socket]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No breakout rooms available</p>
        {isOrganizer && (
          <p className="text-sm mt-1">Create a room to get started</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <BreakoutRoomCard
          key={room.id}
          room={room}
          eventId={eventId}
          sessionId={sessionId}
          isOrganizer={isOrganizer}
          isInRoom={currentRoomId === room.id}
          onJoin={() => handleJoin(room.id)}
          onLeave={() => handleLeave(room.id)}
          onStart={() => handleStart(room.id)}
          onClose={() => handleClose(room.id)}
          onView={() => onViewRoom?.(room.id)}
          onJoinVideo={() => handleJoinVideo(room.id)}
          isLoadingVideo={loadingVideoRoomId === room.id}
        />
      ))}
    </div>
  );
}
