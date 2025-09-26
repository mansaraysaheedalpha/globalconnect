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
import { EventDetailHeader } from "../_components/event-detail-header";
import { EventDetailsCard } from "../_components/event-details-card";
import { SessionList } from "./_components/session-list";
import { AttendeeList } from "../_components/attendee-list";
import { LiveDashboard } from "./_components/live-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";
import { EventHistoryTimeline } from "./_components/event-history-timeline";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;

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
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (eventError || !eventData?.event) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-6">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error Loading Event</AlertTitle>
        <AlertDescription>
          {eventError?.message ||
            "The event could not be found. It may have been deleted."}
        </AlertDescription>
      </Alert>
    );
  }

  const event = eventData.event;
  const sessions = sessionsData?.sessionsByEvent || [];
  const attendees = attendeesData?.registrationsByEvent || [];

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
          </div>
        </div>
      </div>
    </div>
  );
}
