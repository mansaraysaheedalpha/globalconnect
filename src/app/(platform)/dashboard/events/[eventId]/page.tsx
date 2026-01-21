
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
import { TicketManagement } from "./_components/ticket-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";
import { ErrorState, QueryErrorHandler } from "@/components/ui/error-boundary";
import { EventHistoryTimeline } from "./_components/event-history-timeline";
import { LiveAgendaContainer } from "@/components/features/agenda/live-agenda-container";
import { AgendaSession } from "@/hooks/use-agenda-updates";
import { IncidentDashboard } from "@/components/features/incidents";
import LeaderboardPage from "./leaderboard/page";
import MonetizationPage from "./monetization/page";
import EngagementConductorPage from "./engagement/page";
import NetworkingAnalyticsPage from "./networking/page";
import { SponsorManagement } from "@/components/features/sponsors/sponsor-management";
import { useAuthStore } from "@/store/auth.store";
import ExpoManagementPage from "./expo/page";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { orgId } = useAuthStore();

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
      <div className="px-4 sm:px-6 py-6 animate-fade-in">
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
      <div className="px-4 sm:px-6 py-6">
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
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <EventDetailHeader event={event} refetch={refetchEvent} />

      {/* Mobile: Show key stats at top */}
      <div className="mt-4 lg:hidden">
        <EventDetailsCard event={event} />
      </div>

      <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 min-w-0">
          <Tabs defaultValue="live" className="w-full">
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="engagement">AI Conductor</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="monetization">Monetization</TabsTrigger>
              <TabsTrigger value="networking">Networking</TabsTrigger>
              <TabsTrigger value="expo">Expo Hall</TabsTrigger>
              <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
            </TabsList>
            <TabsContent value="live" className="mt-4 sm:mt-6">
              <LiveDashboard eventId={event.id} />
            </TabsContent>
            <TabsContent value="engagement" className="mt-4 sm:mt-6">
              <EngagementConductorPage />
            </TabsContent>
            <TabsContent value="agenda" className="mt-4 sm:mt-6">
              <SessionList
                sessions={sessions}
                event={event}
                refetchSessions={refetchSessions}
              />
            </TabsContent>
            <TabsContent value="attendees" className="mt-4 sm:mt-6">
              <AttendeeList attendees={attendees} />
            </TabsContent>
            <TabsContent value="tickets" className="mt-4 sm:mt-6">
              <TicketManagement eventId={event.id} />
            </TabsContent>
            <TabsContent value="history" className="mt-4 sm:mt-6">
              <EventHistoryTimeline eventId={event.id} />
            </TabsContent>
            <TabsContent value="incidents" className="mt-4 sm:mt-6">
              <IncidentDashboard eventId={event.id} />
            </TabsContent>
            <TabsContent value="leaderboard" className="mt-4 sm:mt-6">
              <LeaderboardPage />
            </TabsContent>
            <TabsContent value="monetization" className="mt-4 sm:mt-6">
              <MonetizationPage />
            </TabsContent>
            <TabsContent value="networking" className="mt-4 sm:mt-6">
              <NetworkingAnalyticsPage />
            </TabsContent>
            <TabsContent value="expo" className="mt-4 sm:mt-6">
              <ExpoManagementPage />
            </TabsContent>
            <TabsContent value="sponsors" className="mt-4 sm:mt-6">
              <SponsorManagement eventId={event.id} organizationId={orgId || ""} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop sidebar - hidden on mobile since we show stats at top */}
        <div className="hidden lg:block lg:col-span-1">
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