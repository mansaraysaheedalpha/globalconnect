// src/components/features/breakout/video/VideoTile.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { DailyParticipant } from "@daily-co/daily-js";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Video, VideoOff, Monitor, User } from "lucide-react";

interface VideoTileProps {
  participant: DailyParticipant;
  isLocal?: boolean;
  isLarge?: boolean;
  className?: string;
}

export function VideoTile({ participant, isLocal = false, isLarge = false, className }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  // Attach video track with proper cleanup
  // Note: Audio is handled globally by DailyProvider via track-started/track-stopped events
  useEffect(() => {
    const videoElement = videoRef.current;
    const videoTrack = participant.tracks?.video;

    if (videoElement && videoTrack?.persistentTrack) {
      const stream = new MediaStream([videoTrack.persistentTrack]);
      videoElement.srcObject = stream;

      // Cleanup function to properly dispose MediaStream
      return () => {
        if (videoElement.srcObject) {
          videoElement.srcObject = null;
        }
      };
    }
  }, [participant.tracks?.video?.persistentTrack]);

  // Attach screen share track with proper cleanup
  useEffect(() => {
    const screenElement = screenRef.current;
    const screenTrack = participant.tracks?.screenVideo;

    if (screenElement && screenTrack?.persistentTrack) {
      const stream = new MediaStream([screenTrack.persistentTrack]);
      screenElement.srcObject = stream;

      return () => {
        if (screenElement.srcObject) {
          screenElement.srcObject = null;
        }
      };
    }
  }, [participant.tracks?.screenVideo?.persistentTrack]);

  const hasVideo = participant.video;
  const hasAudio = participant.audio;
  const hasScreen = participant.screen;
  const userName = participant.user_name || (isLocal ? "You" : "Participant");

  return (
    <div
      className={cn(
        "relative bg-gray-900 rounded-lg overflow-hidden",
        isLarge ? "aspect-video" : "aspect-video",
        className
      )}
    >
      {/* Screen share (takes priority) */}
      {hasScreen && (
        <video
          ref={screenRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />
      )}

      {/* Camera video */}
      {hasVideo && !hasScreen ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            isLocal && "transform scale-x-[-1]" // Mirror local video
          )}
        />
      ) : !hasScreen ? (
        // Avatar placeholder when video is off
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
        </div>
      ) : null}

      {/* Small camera preview when screen sharing */}
      {hasScreen && hasVideo && (
        <div className="absolute bottom-16 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={cn(
              "w-full h-full object-cover",
              isLocal && "transform scale-x-[-1]"
            )}
          />
        </div>
      )}

      {/* Participant info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium truncate max-w-[150px]">
              {userName}
              {isLocal && " (You)"}
            </span>
            {hasScreen && (
              <span className="flex items-center gap-1 text-green-400 text-xs">
                <Monitor className="w-3 h-3" />
                Sharing
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasAudio ? (
              <Mic className="w-4 h-4 text-white" />
            ) : (
              <MicOff className="w-4 h-4 text-red-500" />
            )}
            {hasVideo ? (
              <Video className="w-4 h-4 text-white" />
            ) : (
              <VideoOff className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
