// src/app/(platform)/dashboard/events/[eventId]/page.tsx
"use client";

import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import {
  GET_EVENT_BY_ID_QUERY,
  GET_SESSIONS_BY_EVENT_QUERY,
  GET_ATTENDEES_BY_EVENT_QUERY,
} from "@/graphql/events.graphql";
import { Loader } from "lucide-react";
import {
  PageLoadingSkeleton,
  StatsCardSkeleton,
  ShimmerSkeleton,
  SessionCardSkeleton,
} from "@/components/ui/skeleton-patterns";
import { EventDetailHeader } from "../_components/event-detail-header";
import { EventDetailsCard } from "../_components/event-details-card";
import { SessionList } from "./_components/session-list";
import { AttendeeList } from "../_components/attendee-list";
import { LiveDashboard } from "./_components/live-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";
import { ErrorState, QueryErrorHandler } from "@/components/ui/error-boundary";
import { EventHistoryTimeline } from "./_components/event-history-timeline";
import { LiveAgendaContainer } from "@/components/features/agenda/live-agenda-container";
import { AgendaSession } from "@/hooks/use-agenda-updates";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  // Debug: Log URL param vs event.id
  console.log("[EventDetailPage] URL eventId from params:", eventId);

  const {
    data: eventData,
    loading: eventLoading,
    error: eventError,
    refetch: refetchEvent,
  } = useQuery(GET_EVENT_BY_ID_QUERY, {
    variables: { id: eventId },
    skip: !eventId,
  });

  const { data: sessionsData, refetch: refetchSessions } = useQuery(
    GET_SESSIONS_BY_EVENT_QUERY,
    {
      variables: { eventId },
      skip: !eventId,
    }
  );

  const { data: attendeesData } = useQuery(GET_ATTENDEES_BY_EVENT_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  if (eventLoading) {
    return (
      <div className="p-6 animate-fade-in">
        {/* Header skeleton */}
        <div className="mb-6 space-y-4">
          <ShimmerSkeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <ShimmerSkeleton className="h-6 w-20 rounded-full" />
            <ShimmerSkeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <ShimmerSkeleton className="h-10 w-96 mb-6 rounded-md" />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
            {/* Session list skeleton */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SessionCardSkeleton key={i} />
              ))}
            </div>
          </div>
          {/* Sidebar skeleton */}
          <div className="space-y-4">
            <ShimmerSkeleton className="h-64 rounded-lg" />
            <ShimmerSkeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (eventError || !eventData?.event) {
    return (
      <div className="p-6">
        <QueryErrorHandler
          error={eventError || new Error("Event not found")}
          onRetry={() => refetchEvent()}
        />
      </div>
    );
  }

  const event = eventData.event;
  const sessions = sessionsData?.sessionsByEvent || [];
  const attendees = attendeesData?.registrationsByEvent || [];

  // Debug: Compare URL eventId vs GraphQL event.id
  console.log("[EventDetailPage] Comparing IDs:", {
    urlEventId: eventId,
    graphqlEventId: event.id,
    match: eventId === event.id,
  });

  return (
    <div className="p-6">
      <EventDetailHeader event={event} refetch={refetchEvent} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="live">
            {/* --- CHANGE 1: Update grid columns from 3 to 4 --- */}
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="live">Live Dashboard</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
              {/* --- CHANGE 2: Add the missing trigger for the History tab --- */}
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="live" className="mt-6">
              <LiveDashboard eventId={event.id} />
            </TabsContent>
            <TabsContent value="agenda">
              <SessionList
                sessions={sessions}
                event={event}
                refetchSessions={refetchSessions}
              />
            </TabsContent>
            <TabsContent value="attendees">
              <AttendeeList attendees={attendees} />
            </TabsContent>
            <TabsContent value="history" className="mt-6">
              <EventHistoryTimeline eventId={event.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <EventDetailsCard event={event} />

            {/* Live Agenda Widget - Real-time schedule updates */}
            {sessions.length > 0 && (
              <LiveAgendaContainer
                eventId={event.id}
                initialSessions={sessions.map((s: any): AgendaSession => ({
                  id: s.id,
                  title: s.title,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  status: s.status === "LIVE" ? "live" : s.status === "ENDED" ? "completed" : "upcoming",
                  location: s.location || undefined,
                  speakers: s.speakers?.map((sp: any) => ({
                    id: sp.id,
                    firstName: sp.name?.split(" ")[0] || sp.firstName || "",
                    lastName: sp.name?.split(" ").slice(1).join(" ") || sp.lastName || "",
                  })) || [],
                }))}
                variant="widget"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
