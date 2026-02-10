// src/components/features/agenda/live-agenda-container.tsx
"use client";

import React, { useEffect } from "react";
import { useAgendaUpdates, AgendaSession } from "@/hooks/use-agenda-updates";
import { LiveAgenda, CompactAgenda } from "./live-agenda";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { StaleDataIndicator } from "@/components/ui/stale-data-indicator";

interface LiveAgendaContainerProps {
  eventId: string;
  initialSessions?: AgendaSession[];
  variant?: "full" | "compact" | "widget";
  onSessionClick?: (session: AgendaSession) => void;
  className?: string;
}

/**
 * Container component that combines agenda updates hook with UI components.
 * Provides real-time agenda updates with visual indicators.
 */
export const LiveAgendaContainer = ({
  eventId,
  initialSessions = [],
  variant = "full",
  onSessionClick,
  className = "",
}: LiveAgendaContainerProps) => {
  const {
    isConnected,
    isJoined,
    sessions,
    recentUpdates,
    setInitialSessions,
    wasRecentlyUpdated,
    isOnline,
    cachedAt,
    isStale,
    isFromCache,
  } = useAgendaUpdates(eventId);

  // Set initial sessions when provided
  useEffect(() => {
    if (initialSessions.length > 0) {
      setInitialSessions(initialSessions);
    }
  }, [initialSessions, setInitialSessions]);

  // Use hook sessions if available, otherwise use initial sessions
  const displaySessions = sessions.length > 0 ? sessions : initialSessions;

  if (variant === "compact") {
    return (
      <CompactAgenda
        sessions={displaySessions}
        eventId={eventId}
        maxItems={5}
        className={className}
      />
    );
  }

  if (variant === "widget") {
    return (
      <AgendaWidget
        eventId={eventId}
        sessions={displaySessions}
        recentUpdatesCount={recentUpdates.length}
        isConnected={isConnected}
        className={className}
      />
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Connection status indicator */}
      {isConnected && isJoined && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      )}

      {/* Stale/offline data indicator */}
      {(isFromCache || !isOnline) && displaySessions.length > 0 && (
        <StaleDataIndicator
          isStale={isStale}
          isOffline={!isOnline}
          lastFetched={cachedAt}
          className="mb-3"
        />
      )}

      <LiveAgenda
        sessions={displaySessions}
        eventId={eventId}
        recentUpdates={recentUpdates}
        wasRecentlyUpdated={wasRecentlyUpdated}
        onSessionClick={onSessionClick}
      />
    </div>
  );
};

/**
 * Floating agenda widget that can be placed on event pages
 */
interface AgendaWidgetProps {
  eventId: string;
  sessions: AgendaSession[];
  recentUpdatesCount: number;
  isConnected: boolean;
  className?: string;
}

const AgendaWidget = ({
  eventId,
  sessions,
  recentUpdatesCount,
  isConnected,
  className = "",
}: AgendaWidgetProps) => {
  const now = new Date();

  // Get live and upcoming sessions
  const liveSessions = sessions.filter((s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    return now >= start && now <= end && s.status !== "cancelled";
  });

  const upcomingSessions = sessions
    .filter(
      (s) =>
        new Date(s.startTime) > now &&
        s.status !== "cancelled"
    )
    .slice(0, 3);

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Schedule
          </span>
          <div className="flex items-center gap-2">
            {recentUpdatesCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {recentUpdatesCount} updates
              </Badge>
            )}
            {isConnected && (
              <span className="w-2 h-2 rounded-full bg-green-500" title="Live updates active" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Live sessions */}
        {liveSessions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-red-500 mb-1">LIVE NOW</p>
            {liveSessions.map((session) => (
              <div
                key={session.id}
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-md"
              >
                <p className="text-sm font-medium">{session.title}</p>
                {session.location && (
                  <p className="text-xs text-muted-foreground">
                    {session.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upcoming sessions */}
        {upcomingSessions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              COMING UP
            </p>
            <div className="space-y-1">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="text-sm py-1 border-b last:border-0"
                >
                  <p className="font-medium line-clamp-1">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(session.startTime).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {liveSessions.length === 0 && upcomingSessions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No upcoming sessions
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Agenda button with sheet for mobile/sidebar use
 */
interface AgendaSheetButtonProps {
  eventId: string;
  initialSessions?: AgendaSession[];
  className?: string;
}

export const AgendaSheetButton = ({
  eventId,
  initialSessions = [],
  className = "",
}: AgendaSheetButtonProps) => {
  const {
    isConnected,
    sessions,
    recentUpdates,
    setInitialSessions,
    wasRecentlyUpdated,
  } = useAgendaUpdates(eventId);

  useEffect(() => {
    if (initialSessions.length > 0) {
      setInitialSessions(initialSessions);
    }
  }, [initialSessions, setInitialSessions]);

  const displaySessions = sessions.length > 0 ? sessions : initialSessions;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Calendar className="h-4 w-4" />
          Schedule
          {recentUpdates.length > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
              {recentUpdates.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Schedule
            {isConnected && (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            )}
          </SheetTitle>
          <SheetDescription>
            Real-time event schedule with live updates
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
          <LiveAgenda
            sessions={displaySessions}
            eventId={eventId}
            recentUpdates={recentUpdates}
            wasRecentlyUpdated={wasRecentlyUpdated}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

/**
 * Floating schedule indicator that shows updates
 */
interface FloatingScheduleIndicatorProps {
  eventId: string;
  initialSessions?: AgendaSession[];
  className?: string;
}

export const FloatingScheduleIndicator = ({
  eventId,
  initialSessions = [],
  className = "",
}: FloatingScheduleIndicatorProps) => {
  const { isConnected, recentUpdates, sessions, setInitialSessions, isFromCache } =
    useAgendaUpdates(eventId);

  useEffect(() => {
    if (initialSessions.length > 0) {
      setInitialSessions(initialSessions);
    }
  }, [initialSessions, setInitialSessions]);

  const displaySessions = sessions.length > 0 ? sessions : initialSessions;
  const now = new Date();

  // Check for live sessions
  const hasLiveSession = displaySessions.some((s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    return now >= start && now <= end && s.status !== "cancelled";
  });

  // Show when connected OR when we have cached data to display
  if (!isConnected && !isFromCache && displaySessions.length === 0) return null;

  return (
    <div className={cn("fixed bottom-20 right-4 z-40 safe-bottom", className)}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg",
              hasLiveSession && "bg-red-500 hover:bg-red-600",
              recentUpdates.length > 0 && "animate-pulse"
            )}
          >
            <Calendar className="h-5 w-5" />
            {recentUpdates.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-yellow-500 text-xs flex items-center justify-center">
                {recentUpdates.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Schedule
            </SheetTitle>
            <SheetDescription>
              {hasLiveSession
                ? "A session is live now!"
                : "View the event schedule"}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
            <LiveAgenda
              sessions={displaySessions}
              eventId={eventId}
              recentUpdates={recentUpdates}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};
