// src/components/features/heatmap/heatmap-zone-card.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, HelpCircle, Users, Zap } from "lucide-react";
import { HeatmapZone, ActivityLevel } from "@/types/heatmap";
import { ActivityDot } from "./activity-indicator";
import { cn } from "@/lib/utils";

interface HeatmapZoneCardProps {
  zone: HeatmapZone;
  maxAttendees?: number;
  onClick?: (zone: HeatmapZone) => void;
  className?: string;
}

const ACTIVITY_COLORS: Record<ActivityLevel, { border: string; bg: string; text: string }> = {
  low: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  medium: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  high: {
    border: "border-orange-200",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  critical: {
    border: "border-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  low: "Quiet",
  medium: "Active",
  high: "Busy",
  critical: "Peak",
};

export function HeatmapZoneCard({
  zone,
  onClick,
  className,
}: HeatmapZoneCardProps) {
  const colors = ACTIVITY_COLORS[zone.activityLevel];

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer overflow-hidden",
        colors.border,
        className
      )}
      onClick={() => onClick?.(zone)}
    >
      {/* Header with activity status */}
      <div className={cn("px-4 py-2 flex items-center justify-between", colors.bg)}>
        <h3 className="font-semibold text-sm truncate">{zone.zoneName}</h3>
        <div className="flex items-center gap-1.5">
          <ActivityDot level={zone.activityLevel} pulse />
          <span className={cn("text-xs font-medium", colors.text)}>
            {ACTIVITY_LABELS[zone.activityLevel]}
          </span>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Main stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{zone.attendeeCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Interactions
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold">{zone.uniqueEngagers}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Participants
              </p>
            </div>
          </div>
          <div className={cn("p-2 rounded-full", colors.bg)}>
            <Zap className={cn("h-5 w-5", colors.text)} />
          </div>
        </div>

        {/* Activity rates */}
        <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{zone.chatVelocity.toFixed(1)}/min</span>
          </div>
          <div className="flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{zone.qnaVelocity.toFixed(1)}/min</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Users className="h-3.5 w-3.5" />
            <span>
              {zone.uniqueEngagers > 0
                ? (zone.attendeeCount / zone.uniqueEngagers).toFixed(1)
                : "0"} avg
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
