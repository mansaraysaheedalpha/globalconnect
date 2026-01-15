// src/components/features/heatmap/heatmap-zone-card.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, MessageSquare, HelpCircle, MapPin, Users } from "lucide-react";
import { HeatmapZone, ActivityLevel } from "@/types/heatmap";
import { ActivityIndicator, ActivityDot } from "./activity-indicator";
import { cn } from "@/lib/utils";

interface HeatmapZoneCardProps {
  zone: HeatmapZone;
  maxAttendees?: number;
  onClick?: (zone: HeatmapZone) => void;
  className?: string;
}

const BORDER_COLORS: Record<ActivityLevel, string> = {
  low: "border-green-200",
  medium: "border-yellow-200",
  high: "border-orange-200",
  critical: "border-red-200",
};

const BG_COLORS: Record<ActivityLevel, string> = {
  low: "bg-green-50/30",
  medium: "bg-yellow-50/30",
  high: "bg-orange-50/30",
  critical: "bg-red-50/30",
};

const PROGRESS_COLORS: Record<ActivityLevel, string> = {
  low: "[&>div]:bg-green-500",
  medium: "[&>div]:bg-yellow-500",
  high: "[&>div]:bg-orange-500",
  critical: "[&>div]:bg-red-500",
};

export function HeatmapZoneCard({
  zone,
  maxAttendees = 100,
  onClick,
  className,
}: HeatmapZoneCardProps) {
  const occupancyPercent = Math.min(
    (zone.attendeeCount / maxAttendees) * 100,
    100
  );

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        BORDER_COLORS[zone.activityLevel],
        BG_COLORS[zone.activityLevel],
        className
      )}
      onClick={() => onClick?.(zone)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">{zone.zoneName}</h3>
          </div>
          <ActivityDot level={zone.activityLevel} pulse />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Engagement Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-4 w-4" />
              Engagement
            </span>
            <span className="font-medium">{zone.attendeeCount}</span>
          </div>
          <Progress
            value={occupancyPercent}
            className={cn("h-2", PROGRESS_COLORS[zone.activityLevel])}
          />
        </div>

        {/* Unique Engagers */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            Unique Participants
          </span>
          <span className="font-medium">{zone.uniqueEngagers}</span>
        </div>

        {/* Activity Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat: {zone.chatVelocity.toFixed(1)}/min</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Q&A: {zone.qnaVelocity.toFixed(1)}/min</span>
          </div>
        </div>

        {/* Activity Badge */}
        <ActivityIndicator level={zone.activityLevel} size="sm" />
      </CardContent>
    </Card>
  );
}
