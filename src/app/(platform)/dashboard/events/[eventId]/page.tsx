"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import {
  GET_EVENT_BY_ID_QUERY,
  GET_SESSIONS_BY_EVENT_QUERY,
} from "@/graphql/events.graphql";
import { GET_REGISTRATIONS_BY_EVENT_QUERY } from "@/graphql/registrations.graphql";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionList } from "../_components/session-list";
import { AttendeeList } from "../_components/attendee-list";
import { EventDetailHeader } from "../_components/event-detail-header";
import { EventDetailsCard } from "../_components/event-details-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Wifi } from "lucide-react";
import { LiveDashboard } from "./_components/live-dashboard";

const EventDetailPage = () => {
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

  const { data: sessionsData, loading: sessionsLoading } = useQuery(
    GET_SESSIONS_BY_EVENT_QUERY,
    {
      variables: { eventId },
      skip: !eventId,
    }
  );

  const { data: registrationsData, loading: registrationsLoading } = useQuery(
    GET_REGISTRATIONS_BY_EVENT_QUERY,
    {
      variables: { eventId },
      skip: !eventId,
      fetchPolicy: "cache-and-network",
    }
  );

  if (eventLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (eventError || !eventData?.event) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600 p-6">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-2xl font-semibold">Failed to load event details</h2>
        <p className="text-sm">{eventError?.message}</p>
      </div>
    );
  }

  const { event } = eventData;
  const sessions = sessionsData?.sessionsByEvent || [];
  const attendees = registrationsData?.registrationsByEvent || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <EventDetailHeader event={event} refetch={refetchEvent} />

      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-4">
          {" "}
          {/* <-- Corrected grid columns */}
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="attendees">
            Attendees ({attendees.length})
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-red-500 animate-pulse" />
            Live View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <EventDetailsCard event={event} />
        </TabsContent>

        <TabsContent value="agenda">
          {sessionsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SessionList
              sessions={sessions}
              eventId={eventId}
              eventStartDate={event.startDate}
              eventEndDate={event.endDate}
            />
          )}
        </TabsContent>

        <TabsContent value="attendees">
          {registrationsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <AttendeeList attendees={attendees} />
          )}
        </TabsContent>

        <TabsContent value="live">
          <LiveDashboard eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventDetailPage;
