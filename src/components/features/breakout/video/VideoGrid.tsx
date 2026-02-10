// src/components/features/breakout/video/VideoGrid.tsx
"use client";

import React, { useMemo } from "react";
import { DailyParticipant } from "@daily-co/daily-js";
import { VideoTile } from "./VideoTile";
import { cn } from "@/lib/utils";

interface VideoGridProps {
  participants: DailyParticipant[];
  className?: string;
}

export function VideoGrid({ participants, className }: VideoGridProps) {
  // Find the active speaker or screen sharer
  const { speaker, others } = useMemo(() => {
    // Prioritize screen sharers
    const screenSharer = participants.find((p) => p.screen);
    if (screenSharer) {
      return {
        speaker: screenSharer,
        others: participants.filter((p) => p.session_id !== screenSharer.session_id),
      };
    }

    // Otherwise, local participant is in the sidebar, remote participants are main
    const local = participants.find((p) => p.local);
    const remotes = participants.filter((p) => !p.local);

    // If only one remote, make them the speaker
    if (remotes.length === 1) {
      return {
        speaker: remotes[0],
        others: local ? [local] : [],
      };
    }

    // Multiple remotes, use grid layout
    return {
      speaker: null,
      others: participants,
    };
  }, [participants]);

  // Calculate responsive grid classes based on participant count
  const gridClass = useMemo(() => {
    const count = speaker ? others.length : participants.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-2 sm:grid-cols-3";
    if (count <= 9) return "grid-cols-2 sm:grid-cols-3";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  }, [speaker, others.length, participants.length]);

  // Speaker + sidebar layout
  if (speaker) {
    return (
      <div className={cn("flex flex-col sm:flex-row h-full gap-2 sm:gap-3", className)}>
        {/* Main speaker/screen share - takes most of the space */}
        <div className="flex-1 min-w-0 min-h-0">
          <VideoTile
            participant={speaker}
            isLocal={speaker.local}
            isLarge
            className="w-full h-full"
          />
        </div>

        {/* Sidebar with other participants - horizontal on mobile, vertical on desktop */}
        {others.length > 0 && (
          <div
            className={cn(
              "flex-shrink-0 overflow-auto",
              // Mobile: horizontal strip at bottom
              "flex flex-row sm:flex-col gap-2",
              "h-[100px] sm:h-auto",
              // Desktop: vertical sidebar
              "sm:w-44 md:w-52 lg:w-56",
            )}
          >
            {others.map((participant) => (
              <VideoTile
                key={participant.session_id}
                participant={participant}
                isLocal={participant.local}
                className={cn(
                  // Mobile: fixed width tiles in horizontal scroll
                  "flex-shrink-0 w-[140px] sm:w-full",
                  "h-full sm:h-auto"
                )}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Grid layout for equal participants
  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-3 h-full auto-rows-fr place-items-stretch",
        gridClass,
        className
      )}
    >
      {participants.map((participant) => (
        <VideoTile
          key={participant.session_id}
          participant={participant}
          isLocal={participant.local}
        />
      ))}
    </div>
  );
}
