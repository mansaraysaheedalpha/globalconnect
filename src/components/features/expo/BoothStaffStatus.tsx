// src/components/features/expo/BoothStaffStatus.tsx
"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BoothStaffPresence, StaffPresenceStatus } from "./types";

export interface BoothStaffStatusProps {
  staff: BoothStaffPresence[];
  className?: string;
  showNames?: boolean;
  maxVisible?: number;
}

const STATUS_CONFIG: Record<
  StaffPresenceStatus,
  { color: string; bgColor: string; label: string }
> = {
  ONLINE: {
    color: "bg-green-500",
    bgColor: "ring-green-500/20",
    label: "Online",
  },
  AWAY: {
    color: "bg-yellow-500",
    bgColor: "ring-yellow-500/20",
    label: "Away",
  },
  BUSY: {
    color: "bg-red-500",
    bgColor: "ring-red-500/20",
    label: "Busy",
  },
  OFFLINE: {
    color: "bg-gray-400",
    bgColor: "ring-gray-400/20",
    label: "Offline",
  },
};

export function BoothStaffStatus({
  staff,
  className,
  showNames = true,
  maxVisible = 5,
}: BoothStaffStatusProps) {
  // Sort by status: online first, then away, busy, offline
  const sortedStaff = [...staff].sort((a, b) => {
    const statusOrder: Record<StaffPresenceStatus, number> = {
      ONLINE: 0,
      AWAY: 1,
      BUSY: 2,
      OFFLINE: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const visibleStaff = sortedStaff.slice(0, maxVisible);
  const hiddenCount = Math.max(0, staff.length - maxVisible);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (staff.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No staff available
      </div>
    );
  }

  const onlineCount = staff.filter((s) => s.status === "ONLINE").length;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Status summary */}
      <div className="text-sm text-muted-foreground">
        {onlineCount > 0 ? (
          <span className="text-green-600 font-medium">
            {onlineCount} staff member{onlineCount !== 1 ? "s" : ""} online
          </span>
        ) : (
          <span>No staff currently online</span>
        )}
      </div>

      {/* Staff avatars */}
      <TooltipProvider>
        <div className="flex items-center gap-2 flex-wrap">
          {visibleStaff.map((member) => {
            const statusConfig = STATUS_CONFIG[member.status];

            return (
              <Tooltip key={member.staffId}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative",
                      showNames && "flex items-center gap-2"
                    )}
                  >
                    <div className="relative">
                      <Avatar
                        className={cn(
                          "h-10 w-10 ring-2",
                          statusConfig.bgColor
                        )}
                      >
                        <AvatarImage src={member.staffAvatarUrl || undefined} />
                        <AvatarFallback className="text-sm">
                          {getInitials(member.staffName)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status indicator */}
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                          statusConfig.color
                        )}
                      />
                    </div>
                    {showNames && (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {member.staffName}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            member.status === "ONLINE"
                              ? "text-green-600"
                              : "text-muted-foreground"
                          )}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {member.staffName} - {statusConfig.label}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {hiddenCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  +{hiddenCount}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hiddenCount} more staff members</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}

// Compact version for cards
export function BoothStaffStatusCompact({
  staff,
  className,
}: {
  staff: BoothStaffPresence[];
  className?: string;
}) {
  const onlineStaff = staff.filter((s) => s.status === "ONLINE");

  if (onlineStaff.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1", className)}>
            <div className="flex -space-x-2">
              {onlineStaff.slice(0, 3).map((member) => (
                <Avatar key={member.staffId} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.staffAvatarUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {member.staffName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {onlineStaff.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{onlineStaff.length - 3}
              </span>
            )}
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{onlineStaff.length} staff online</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
