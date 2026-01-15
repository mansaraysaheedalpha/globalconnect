// src/components/features/heatmap/activity-indicator.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, Minus } from "lucide-react";
import { ActivityLevel, ACTIVITY_LEVEL_LABELS } from "@/types/heatmap";
import { cn } from "@/lib/utils";

interface ActivityIndicatorProps {
  level: ActivityLevel;
  showLabel?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const ACTIVITY_CONFIG: Record<
  ActivityLevel,
  { icon: React.ElementType; className: string; pulseClassName: string }
> = {
  low: {
    icon: Minus,
    className: "bg-green-500/10 text-green-600 border-green-200",
    pulseClassName: "",
  },
  medium: {
    icon: Activity,
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    pulseClassName: "",
  },
  high: {
    icon: TrendingUp,
    className: "bg-orange-500/10 text-orange-600 border-orange-200",
    pulseClassName: "animate-pulse",
  },
  critical: {
    icon: AlertTriangle,
    className: "bg-red-500/10 text-red-600 border-red-200",
    pulseClassName: "animate-pulse",
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

export function ActivityIndicator({
  level,
  showLabel = true,
  showIcon = true,
  size = "md",
  pulse = false,
}: ActivityIndicatorProps) {
  const config = ACTIVITY_CONFIG[level];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        SIZE_CONFIG[size],
        pulse && config.pulseClassName,
        "gap-1 font-medium"
      )}
    >
      {showIcon && <Icon className={ICON_SIZE[size]} />}
      {showLabel && <span>{ACTIVITY_LEVEL_LABELS[level]}</span>}
    </Badge>
  );
}

// Simple dot indicator for compact displays
interface ActivityDotProps {
  level: ActivityLevel;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const DOT_COLORS: Record<ActivityLevel, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const DOT_SIZES = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function ActivityDot({ level, size = "md", pulse = false }: ActivityDotProps) {
  return (
    <span
      className={cn(
        "rounded-full",
        DOT_COLORS[level],
        DOT_SIZES[size],
        pulse && level !== "low" && "animate-pulse"
      )}
    />
  );
}
