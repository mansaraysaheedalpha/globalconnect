// src/components/ui/stale-data-indicator.tsx
"use client";

import { Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface StaleDataIndicatorProps {
  isStale: boolean;
  isOffline: boolean;
  lastFetched: Date | null;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Compact indicator shown when displaying cached/stale data.
 * Only visible when isStale or isOffline is true.
 */
export function StaleDataIndicator({
  isStale,
  isOffline,
  lastFetched,
  onRefresh,
  className,
}: StaleDataIndicatorProps) {
  if (!isStale && !isOffline) return null;

  const timeAgo = lastFetched ? formatDistanceToNow(lastFetched, { addSuffix: true }) : null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs",
        isOffline
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <Clock className="h-3 w-3 flex-shrink-0" />
      <span>
        {isOffline ? "Offline" : "Cached data"}
        {timeAgo && ` — last updated ${timeAgo}`}
      </span>
      {onRefresh && !isOffline && (
        <button
          onClick={onRefresh}
          className="ml-auto p-0.5 rounded hover:bg-muted-foreground/10 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
