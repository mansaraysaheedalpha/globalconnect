// src/app/(platform)/events/[id]/my-schedule/page.tsx
"use client";

import { use } from "react";
import { useQuery } from "@apollo/client";
import { GET_MY_SCHEDULE_QUERY } from "@/graphql/attendee.graphql";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SessionRsvpButton } from "@/components/features/sessions/SessionRsvpButton";
import { Calendar, Clock, MapPin, AlertCircle, CalendarX, Users } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ScheduleSession {
  rsvpId: string;
  rsvpStatus: string;
  rsvpAt: string;
  sessionId: string;
  title: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  speakers: string;
}

export default function MySchedulePage({ params }: PageProps) {
  const { id: eventId } = use(params);

  const { data, loading, error, refetch } = useQuery(GET_MY_SCHEDULE_QUERY, {
    variables: { eventId },
    fetchPolicy: "cache-and-network",
  });

  const sessions: ScheduleSession[] = data?.mySchedule || [];

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session) => {
    const date = format(new Date(session.startTime), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, ScheduleSession[]>);

  const sortedDates = Object.keys(groupedSessions).sort();

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading schedule</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          My Schedule
        </h1>
        <p className="text-muted-foreground mt-1">
          Sessions you've RSVPed for
        </p>
      </div>

      {/* Empty state */}
      {sessions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarX className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No sessions in your schedule</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Browse the agenda and RSVP to sessions you want to attend
            </p>
            <Button asChild>
              <Link href={`/events/${eventId}/agenda`}>Browse Agenda</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sessions by day */}
      {sortedDates.map((date) => (
        <div key={date} className="space-y-3">
          <DayHeader date={date} />
          <div className="space-y-3">
            {groupedSessions[date].map((session) => (
              <ScheduleSessionCard
                key={session.sessionId}
                session={session}
                eventId={eventId}
                onRsvpChange={() => refetch()}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface DayHeaderProps {
  date: string;
}

function DayHeader({ date }: DayHeaderProps) {
  const dateObj = new Date(date);
  let label = format(dateObj, "EEEE, MMMM d");

  if (isToday(dateObj)) {
    label = "Today - " + label;
  } else if (isTomorrow(dateObj)) {
    label = "Tomorrow - " + label;
  }

  return (
    <div className="flex items-center gap-3">
      <h2 className="text-lg font-semibold">{label}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

interface ScheduleSessionCardProps {
  session: ScheduleSession;
  eventId: string;
  onRsvpChange: () => void;
}

function ScheduleSessionCard({ session, eventId, onRsvpChange }: ScheduleSessionCardProps) {
  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);
  const isSessionPast = isPast(endTime);

  return (
    <Card className={cn(
      isSessionPast && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{session.title}</CardTitle>
            <CardDescription className="space-y-1">
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
              </div>
              {session.speakers && (
                <div className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  {session.speakers}
                </div>
              )}
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <Badge variant="secondary" className="whitespace-nowrap">
              {session.sessionType === "virtual" ? "Virtual" : "In-Person"}
            </Badge>
            <SessionRsvpButton
              sessionId={session.sessionId}
              eventId={eventId}
              isRsvped={session.rsvpStatus === "CONFIRMED"}
              size="sm"
              onRsvpChange={onRsvpChange}
            />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
