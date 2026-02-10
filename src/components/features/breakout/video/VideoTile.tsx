// src/components/features/breakout/video/VideoTile.tsx
"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { DailyParticipant } from "@daily-co/daily-js";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Video, VideoOff, Monitor, Pin } from "lucide-react";

interface VideoTileProps {
  participant: DailyParticipant;
  isLocal?: boolean;
  isLarge?: boolean;
  isPinned?: boolean;
  className?: string;
}

// Generate consistent color from participant name/id
function getAvatarGradient(name: string): string {
  const gradients = [
    "from-violet-600 to-indigo-600",
    "from-blue-600 to-cyan-500",
    "from-emerald-600 to-teal-500",
    "from-orange-500 to-rose-500",
    "from-pink-600 to-purple-600",
    "from-amber-500 to-orange-500",
    "from-cyan-500 to-blue-600",
    "from-rose-500 to-pink-600",
    "from-teal-500 to-emerald-600",
    "from-indigo-500 to-violet-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function VideoTile({
  participant,
  isLocal = false,
  isLarge = false,
  isPinned = false,
  className,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  // Attach video track
  useEffect(() => {
    const videoElement = videoRef.current;
    const videoTrack = participant.tracks?.video;

    if (videoElement && videoTrack?.persistentTrack) {
      const stream = new MediaStream([videoTrack.persistentTrack]);
      videoElement.srcObject = stream;
      return () => {
        if (videoElement.srcObject) {
          videoElement.srcObject = null;
        }
      };
    }
  }, [participant.tracks?.video?.persistentTrack]);

  // Attach screen share track
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
  const initials = useMemo(() => getInitials(userName), [userName]);
  const gradient = useMemo(() => getAvatarGradient(userName), [userName]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden transition-shadow duration-200",
        isLarge ? "rounded-xl sm:rounded-2xl" : "rounded-lg sm:rounded-xl",
        "bg-gray-900/80 ring-1 ring-white/[0.08]",
        isPinned && "ring-2 ring-blue-500/60",
        "hover:ring-white/20",
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
            isLocal && "transform scale-x-[-1]"
          )}
        />
      ) : !hasScreen ? (
        /* Avatar placeholder with initials and gradient */
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div
            className={cn(
              "rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
              gradient,
              isLarge
                ? "w-24 h-24 sm:w-28 sm:h-28"
                : "w-14 h-14 sm:w-18 sm:h-18"
            )}
          >
            <span
              className={cn(
                "font-semibold text-white select-none",
                isLarge ? "text-3xl sm:text-4xl" : "text-lg sm:text-xl"
              )}
            >
              {initials || "?"}
            </span>
          </div>
        </div>
      ) : null}

      {/* Small camera preview when screen sharing */}
      {hasScreen && hasVideo && (
        <div
          className={cn(
            "absolute rounded-lg sm:rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-gray-900",
            isLarge
              ? "bottom-20 right-4 w-36 h-28 sm:w-44 sm:h-32"
              : "bottom-12 right-2 w-20 h-16 sm:w-28 sm:h-20"
          )}
        >
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

      {/* Pinned indicator */}
      {isPinned && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/80 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium">
          <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="hidden sm:inline">Pinned</span>
        </div>
      )}

      {/* "You" badge for local participant */}
      {isLocal && !isPinned && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-[10px] sm:text-xs font-medium">
          You
        </div>
      )}

      {/* Participant info overlay - gradient bottom bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent",
          "transition-opacity duration-200",
          isLarge ? "p-3 sm:p-4 pt-10 sm:pt-14" : "p-2 sm:p-3 pt-8 sm:pt-10"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span
              className={cn(
                "text-white font-medium truncate",
                isLarge
                  ? "text-sm sm:text-base max-w-[200px] sm:max-w-[280px]"
                  : "text-xs sm:text-sm max-w-[100px] sm:max-w-[140px]"
              )}
            >
              {userName}
            </span>
            {hasScreen && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-medium">
                <Monitor className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Sharing</span>
              </span>
            )}
          </div>

          {/* Audio/Video status indicators */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <div
              className={cn(
                "flex items-center justify-center rounded-full",
                isLarge ? "w-6 h-6 sm:w-7 sm:h-7" : "w-5 h-5 sm:w-6 sm:h-6",
                hasAudio
                  ? "bg-white/15"
                  : "bg-red-500/80"
              )}
            >
              {hasAudio ? (
                <Mic className={cn(isLarge ? "w-3 h-3 sm:w-3.5 sm:h-3.5" : "w-2.5 h-2.5 sm:w-3 sm:h-3", "text-white")} />
              ) : (
                <MicOff className={cn(isLarge ? "w-3 h-3 sm:w-3.5 sm:h-3.5" : "w-2.5 h-2.5 sm:w-3 sm:h-3", "text-white")} />
              )}
            </div>
            <div
              className={cn(
                "flex items-center justify-center rounded-full",
                isLarge ? "w-6 h-6 sm:w-7 sm:h-7" : "w-5 h-5 sm:w-6 sm:h-6",
                hasVideo
                  ? "bg-white/15"
                  : "bg-red-500/80"
              )}
            >
              {hasVideo ? (
                <Video className={cn(isLarge ? "w-3 h-3 sm:w-3.5 sm:h-3.5" : "w-2.5 h-2.5 sm:w-3 sm:h-3", "text-white")} />
              ) : (
                <VideoOff className={cn(isLarge ? "w-3 h-3 sm:w-3.5 sm:h-3.5" : "w-2.5 h-2.5 sm:w-3 sm:h-3", "text-white")} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
