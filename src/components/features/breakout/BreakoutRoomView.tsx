// src/components/features/breakout/BreakoutRoomView.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/use-socket";
import { DailyProvider, useDailyCall } from "./video/DailyProvider";
import { VideoGrid } from "./video/VideoGrid";
import { VideoControls } from "./video/VideoControls";
import { ParticipantList } from "./ParticipantList";
import { BreakoutChat } from "./BreakoutChat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  Users,
  MessageSquare,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BreakoutRoomInfo {
  id: string;
  name: string;
  topic?: string;
  status: string;
  sessionId: string;
  durationMinutes: number;
  startedAt?: string;
  facilitatorId?: string;
  videoRoomUrl?: string;
}

interface BreakoutRoomViewProps {
  roomId: string;
  eventId: string;
  sessionId: string;
  userId: string;
  userName: string;
  isOrganizer?: boolean;
}

function BreakoutRoomContent({
  roomId,
  eventId,
  sessionId,
  userId,
  userName,
  isOrganizer,
}: BreakoutRoomViewProps) {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const {
    participants,
    isJoined,
    isJoining,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    cpuLoadState,
    error: videoError,
    joinCall,
    leaveCall,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    setReceiveVideoQuality,
  } = useDailyCall();

  const [roomInfo, setRoomInfo] = useState<BreakoutRoomInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isRoomClosed, setIsRoomClosed] = useState(false);

  // Fetch room info and join
  useEffect(() => {
    if (!socket || !isConnected) return;

    setIsLoading(true);

    // Get video URL for this room
    socket.emit(
      "breakout.room.getVideoUrl",
      { roomId },
      async (response: {
        success: boolean;
        videoUrl?: string;
        token?: string;
        joinUrl?: string;
        error?: string;
      }) => {
        if (response.success && response.videoUrl && response.token) {
          // Get room details
          socket.emit(
            "breakout.rooms.list",
            { sessionId },
            (listResponse: { success: boolean; rooms?: BreakoutRoomInfo[] }) => {
              if (listResponse.success && listResponse.rooms) {
                const room = listResponse.rooms.find((r) => r.id === roomId);
                if (room) {
                  setRoomInfo(room);
                  // Join the Daily call
                  joinCall(response.videoUrl!, response.token!, userName);
                } else {
                  setError("Room not found");
                }
              }
              setIsLoading(false);
            }
          );
        } else {
          setError(response.error || "Failed to get video room");
          setIsLoading(false);
        }
      }
    );

    // Join the breakout socket room
    socket.emit("breakout.room.join", { roomId });

    return () => {
      // Leave breakout socket room on unmount
      socket.emit("breakout.room.leave", { roomId });
    };
  }, [socket, isConnected, roomId, sessionId, userName, joinCall]);

  // Listen for room events
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRoomClosed = (data: { roomId: string }) => {
      if (data.roomId === roomId) {
        setIsRoomClosed(true);
      }
    };

    const handleTimerWarning = (data: { roomId: string; minutesRemaining: number }) => {
      if (data.roomId === roomId) {
        setTimeRemaining(data.minutesRemaining);
      }
    };

    const handleRecalled = () => {
      setIsRoomClosed(true);
    };

    socket.on("breakout.room.closed", handleRoomClosed);
    socket.on("breakout.timer.warning", handleTimerWarning);
    socket.on("breakout.recalled", handleRecalled);

    return () => {
      socket.off("breakout.room.closed", handleRoomClosed);
      socket.off("breakout.timer.warning", handleTimerWarning);
      socket.off("breakout.recalled", handleRecalled);
    };
  }, [socket, isConnected, roomId]);

  // Calculate time remaining
  useEffect(() => {
    if (!roomInfo?.startedAt || !roomInfo?.durationMinutes) return;

    const updateTimeRemaining = () => {
      const startTime = new Date(roomInfo.startedAt!).getTime();
      const endTime = startTime + roomInfo.durationMinutes * 60 * 1000;
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 60000));
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [roomInfo?.startedAt, roomInfo?.durationMinutes]);

  // Handle leaving the room
  const handleLeave = useCallback(async () => {
    await leaveCall();
    if (socket) {
      socket.emit("breakout.room.leave", { roomId });
    }
    router.back();
  }, [leaveCall, socket, roomId, router]);

  // Handle room closed - redirect back
  useEffect(() => {
    if (isRoomClosed) {
      const timer = setTimeout(() => {
        handleLeave();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isRoomClosed, handleLeave]);

  if (isLoading || isJoining) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400">
          {isJoining ? "Joining video call..." : "Loading room..."}
        </p>
      </div>
    );
  }

  if (error || videoError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-400 mb-4">{error || videoError}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (isRoomClosed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <p className="text-yellow-400 text-lg mb-2">Room has been closed</p>
        <p className="text-gray-500">Redirecting you back...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-white">
              {roomInfo?.name || "Breakout Room"}
            </h1>
            {roomInfo?.topic && (
              <p className="text-sm text-gray-400">{roomInfo.topic}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {timeRemaining !== null && (
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1.5",
                timeRemaining <= 1
                  ? "border-red-500 text-red-400"
                  : timeRemaining <= 5
                  ? "border-yellow-500 text-yellow-400"
                  : "border-gray-600 text-gray-400"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              {timeRemaining} min left
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className={cn(
              "text-gray-400",
              showParticipants && "bg-gray-800 text-white"
            )}
          >
            <Users className="w-4 h-4 mr-2" />
            {participants.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className={cn(
              "text-gray-400",
              showChat && "bg-gray-800 text-white"
            )}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 min-h-0">
            <VideoGrid participants={participants} className="h-full" />
          </div>

          {/* Controls */}
          <div className="flex justify-center mt-4">
            <VideoControls
              isMicOn={isMicOn}
              isCameraOn={isCameraOn}
              isScreenSharing={isScreenSharing}
              isChatOpen={showChat}
              cpuLoadState={cpuLoadState}
              onToggleMic={toggleMic}
              onToggleCamera={toggleCamera}
              onToggleScreenShare={toggleScreenShare}
              onToggleChat={() => setShowChat(!showChat)}
              onLeave={handleLeave}
              onSetVideoQuality={setReceiveVideoQuality}
            />
          </div>
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="w-80 flex flex-col gap-4 p-4 border-l border-gray-800 overflow-hidden">
            {showParticipants && (
              <ParticipantList
                participants={participants}
                facilitatorId={roomInfo?.facilitatorId}
                className={cn(showChat ? "h-1/2" : "flex-1")}
              />
            )}
            {showChat && (
              <BreakoutChat
                roomId={roomId}
                userId={userId}
                userName={userName}
                className={cn(showParticipants ? "h-1/2" : "flex-1")}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function BreakoutRoomView(props: BreakoutRoomViewProps) {
  return (
    <DailyProvider>
      <BreakoutRoomContent {...props} />
    </DailyProvider>
  );
}
