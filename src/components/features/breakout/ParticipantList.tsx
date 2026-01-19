// src/components/features/breakout/ParticipantList.tsx
"use client";

import React from "react";
import { DailyParticipant } from "@daily-co/daily-js";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, VideoOff, Monitor, Crown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantListProps {
  participants: DailyParticipant[];
  facilitatorId?: string;
  className?: string;
}

export function ParticipantList({ participants, facilitatorId, className }: ParticipantListProps) {
  // Sort participants: facilitator first, then local, then others
  const sortedParticipants = [...participants].sort((a, b) => {
    // Check if participant is facilitator (by matching user_id or user_name contains facilitator info)
    const aIsFacilitator = a.user_id === facilitatorId;
    const bIsFacilitator = b.user_id === facilitatorId;

    if (aIsFacilitator && !bIsFacilitator) return -1;
    if (!aIsFacilitator && bIsFacilitator) return 1;
    if (a.local && !b.local) return -1;
    if (!a.local && b.local) return 1;
    return 0;
  });

  return (
    <div className={cn("bg-gray-900 rounded-lg border border-gray-800", className)}>
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <User className="w-4 h-4" />
          Participants ({participants.length})
        </h3>
      </div>
      <ScrollArea className="h-[calc(100%-48px)]">
        <div className="p-2 space-y-1">
          {sortedParticipants.map((participant) => {
            const isFacilitator = participant.user_id === facilitatorId;
            const userName = participant.user_name || "Participant";
            const initials = userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={participant.session_id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg",
                  "hover:bg-gray-800/50 transition-colors"
                )}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white truncate">
                      {userName}
                    </span>
                    {participant.local && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        You
                      </Badge>
                    )}
                    {isFacilitator && (
                      <Crown className="w-3.5 h-3.5 text-yellow-500" />
                    )}
                  </div>
                  {participant.screen && (
                    <div className="flex items-center gap-1 text-green-400 text-xs mt-0.5">
                      <Monitor className="w-3 h-3" />
                      <span>Sharing screen</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {participant.audio ? (
                    <Mic className="w-4 h-4 text-gray-400" />
                  ) : (
                    <MicOff className="w-4 h-4 text-red-500" />
                  )}
                  {participant.video ? (
                    <Video className="w-4 h-4 text-gray-400" />
                  ) : (
                    <VideoOff className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
