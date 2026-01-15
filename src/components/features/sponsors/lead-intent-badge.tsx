// src/components/features/sponsors/lead-intent-badge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Flame, Thermometer, Snowflake } from "lucide-react";
import { getIntentLevel, IntentLevel } from "@/types/sponsor";
import { cn } from "@/lib/utils";

interface LeadIntentBadgeProps {
  intentScore: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

const INTENT_CONFIG: Record<
  IntentLevel,
  { icon: React.ElementType; label: string; className: string }
> = {
  hot: {
    icon: Flame,
    label: "Hot",
    className: "bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20",
  },
  warm: {
    icon: Thermometer,
    label: "Warm",
    className:
      "bg-yellow-500/10 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20",
  },
  cold: {
    icon: Snowflake,
    label: "Cold",
    className:
      "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20",
  },
};

const SIZE_CONFIG = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

const ICON_SIZE = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function LeadIntentBadge({
  intentScore,
  showScore = false,
  size = "md",
}: LeadIntentBadgeProps) {
  const level = getIntentLevel(intentScore);
  const config = INTENT_CONFIG[level];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(config.className, SIZE_CONFIG[size], "gap-1 font-medium")}
    >
      <Icon className={ICON_SIZE[size]} />
      <span>{config.label}</span>
      {showScore && (
        <span className="ml-1 opacity-70">({intentScore})</span>
      )}
    </Badge>
  );
}
