// src/components/features/agenda/live-agenda.tsx
"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AgendaSession,
  AgendaUpdate,
  AgendaUpdateType,
} from "@/hooks/use-agenda-updates";
import {
  Clock,
  MapPin,
  Users,
  Calendar,
  AlertCircle,
  Plus,
  RefreshCw,
  Trash2,
  Play,
  CheckCircle2,
} from "lucide-react";
import { format, isToday, isTomorrow, differenceInMinutes } from "date-fns";
import Link from "next/link";

interface LiveAgendaProps {
  sessions: AgendaSession[];
  eventId: string;
  recentUpdates?: AgendaUpdate[];
  wasRecentlyUpdated?: (sessionId: string) => boolean;
  onSessionClick?: (session: AgendaSession) => void;
  className?: string;
}

/**
 * Live agenda with real-time updates
 */
export const LiveAgenda = ({
  sessions,
  eventId,
  recentUpdates = [],
  wasRecentlyUpdated,
  onSessionClick,
  className = "",
}: LiveAgendaProps) => {
  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups: Record<string, AgendaSession[]> = {};

    sessions.forEach((session) => {
      const dateKey = format(new Date(session.startTime), "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });

    // Sort sessions within each day by time
    Object.keys(groups).forEach((key) => {
      groups[key].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    return groups;
  }, [sessions]);

  const sortedDates = Object.keys(groupedSessions).sort();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Recent updates banner */}
      {recentUpdates.length > 0 && (
        <RecentUpdatesBanner updates={recentUpdates.slice(0, 3)} />
      )}

      {/* Agenda by day */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No sessions scheduled yet</p>
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date}>
            <DayHeader date={date} />
            <div className="space-y-3 mt-3">
              <AnimatePresence mode="popLayout">
                {groupedSessions[date].map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    layout
                  >
                    <SessionCard
                      session={session}
                      eventId={eventId}
                      isRecentlyUpdated={wasRecentlyUpdated?.(session.id)}
                      onClick={() => onSessionClick?.(session)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

interface DayHeaderProps {
  date: string;
}

const DayHeader = ({ date }: DayHeaderProps) => {
  const dateObj = new Date(date);
  let label = format(dateObj, "EEEE, MMMM d");

  if (isToday(dateObj)) {
    label = "Today - " + label;
  } else if (isTomorrow(dateObj)) {
    label = "Tomorrow - " + label;
  }

  return (
    <div className="flex items-center gap-3">
      <h3 className="text-lg font-semibold">{label}</h3>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};

interface SessionCardProps {
  session: AgendaSession;
  eventId: string;
  isRecentlyUpdated?: boolean;
  onClick?: () => void;
}

const SessionCard = ({
  session,
  eventId,
  isRecentlyUpdated,
  onClick,
}: SessionCardProps) => {
  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);
  const now = new Date();

  const isLive = now >= startTime && now <= endTime;
  const isPast = now > endTime;
  const isCancelled = session.status === "cancelled";
  const minutesUntilStart = differenceInMinutes(startTime, now);

  // Determine session status
  const getStatusBadge = () => {
    if (isCancelled) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Trash2 className="h-3 w-3" />
          Cancelled
        </Badge>
      );
    }
    if (isLive) {
      return (
        <Badge className="gap-1 bg-red-500 hover:bg-red-600">
          <Play className="h-3 w-3" />
          Live Now
        </Badge>
      );
    }
    if (isPast) {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    }
    if (minutesUntilStart <= 15 && minutesUntilStart > 0) {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
          <Clock className="h-3 w-3" />
          Starting in {minutesUntilStart}m
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn(
        "transition-all cursor-pointer hover:shadow-md",
        isLive && "border-red-500 shadow-red-500/20",
        isCancelled && "opacity-60",
        isRecentlyUpdated && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={cn("text-base", isCancelled && "line-through")}>
              {session.title}
            </CardTitle>
            {session.track && (
              <Badge variant="outline" className="mt-1 text-xs">
                {session.track}
              </Badge>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {session.description && (
          <CardDescription className="line-clamp-2">
            {session.description}
          </CardDescription>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {/* Time */}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
            </span>
          </div>

          {/* Location */}
          {session.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{session.location}</span>
            </div>
          )}

          {/* Speakers */}
          {session.speakers && session.speakers.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {session.speakers
                  .map((s) => `${s.firstName} ${s.lastName}`)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* View session link */}
        {!isCancelled && (
          <div className="pt-2">
            <Link
              href={`/attendee/events/${eventId}/sessions/${session.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" size="sm">
                {isLive ? "Join Session" : "View Details"}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>

      {/* Recently updated indicator */}
      {isRecentlyUpdated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-2 right-2"
        >
          <Badge variant="default" className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Updated
          </Badge>
        </motion.div>
      )}
    </Card>
  );
};

interface RecentUpdatesBannerProps {
  updates: AgendaUpdate[];
}

const RecentUpdatesBanner = ({ updates }: RecentUpdatesBannerProps) => {
  if (updates.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary/10 border border-primary/20 rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Recent Schedule Updates</span>
      </div>
      <div className="space-y-1">
        {updates.map((update) => (
          <UpdateItem key={update.id} update={update} />
        ))}
      </div>
    </motion.div>
  );
};

interface UpdateItemProps {
  update: AgendaUpdate;
}

const UpdateItem = ({ update }: UpdateItemProps) => {
  const Icon = getUpdateIcon(update.updateType);
  const message = getUpdateMessage(update);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-muted-foreground">{message}</span>
    </div>
  );
};

function getUpdateIcon(type: AgendaUpdateType) {
  switch (type) {
    case "CREATED":
      return Plus;
    case "UPDATED":
      return RefreshCw;
    case "DELETED":
      return Trash2;
    default:
      return AlertCircle;
  }
}

function getUpdateMessage(update: AgendaUpdate): string {
  const title = update.session.title;

  switch (update.updateType) {
    case "CREATED":
      return `"${title}" added to the schedule`;
    case "UPDATED":
      if (update.previousValue?.startTime !== update.session.startTime) {
        return `"${title}" time changed`;
      }
      if (update.previousValue?.location !== update.session.location) {
        return `"${title}" moved to ${update.session.location}`;
      }
      return `"${title}" updated`;
    case "DELETED":
      return `"${title}" removed from schedule`;
    default:
      return `"${title}" changed`;
  }
}

/**
 * Compact agenda for sidebar/widget
 */
interface CompactAgendaProps {
  sessions: AgendaSession[];
  eventId: string;
  maxItems?: number;
  className?: string;
}

export const CompactAgenda = ({
  sessions,
  eventId,
  maxItems = 5,
  className = "",
}: CompactAgendaProps) => {
  const now = new Date();

  // Get upcoming and live sessions
  const relevantSessions = sessions
    .filter((s) => new Date(s.endTime) >= now && s.status !== "cancelled")
    .slice(0, maxItems);

  return (
    <div className={cn("space-y-2", className)}>
      {relevantSessions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No upcoming sessions
        </p>
      ) : (
        relevantSessions.map((session) => {
          const startTime = new Date(session.startTime);
          const isLive = now >= startTime && now <= new Date(session.endTime);

          return (
            <Link
              key={session.id}
              href={`/attendee/events/${eventId}/sessions/${session.id}`}
              className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isLive && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                <span className="text-xs text-muted-foreground">
                  {format(startTime, "h:mm a")}
                </span>
              </div>
              <p className="font-medium text-sm mt-1 line-clamp-1">
                {session.title}
              </p>
              {session.location && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {session.location}
                </p>
              )}
            </Link>
          );
        })
      )}
    </div>
  );
};
