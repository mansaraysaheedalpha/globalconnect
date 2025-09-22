"use client";

import React from "react";
import Link from "next/link";
import { useMutation, ApolloCache } from "@apollo/client";
import { toast } from "sonner";
import {
  RESTORE_EVENT_MUTATION,
  GET_ARCHIVED_EVENTS_COUNT_QUERY,
} from "@/graphql/events.graphql";
import {
  GET_EVENTS_BY_ORGANIZATION_QUERY,
 
} from "@/graphql/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ArchiveRestore, Loader } from "lucide-react";

type Event = {
  id: string;
  name: string;
  status: "draft" | "published" | "archived";
  startDate: string;
  registrationsCount: number;
  __typename?: string;
};

type EventsQueryData = {
  eventsByOrganization: {
    events: Event[];
    totalCount: number;
    __typename?: string;
  };
};

type EventsCountQueryData = {
  eventsByOrganization: {
    totalCount: number;
    __typename?: string;
  };
};

interface EventCardProps {
  event: Event;
  isArchivedView: boolean;
}

export const EventCard = ({ event, isArchivedView }: EventCardProps) => {
  const [restoreEvent, { loading }] = useMutation(RESTORE_EVENT_MUTATION, {
    onCompleted: () => {
      toast.success(`Event "${event.name}" has been restored.`);
    },
    onError: (error) => {
      toast.error("Failed to restore event", { description: error.message });
    },
    update(cache) {
      // Use the full 'event' prop passed to this component
      const fullEventObject = event;

      // --- Part 1: Remove from the Archived Events List ---
      const archivedQueryOptions = {
        query: GET_EVENTS_BY_ORGANIZATION_QUERY,
        variables: { status: "archived" },
      };
      const archivedData =
        cache.readQuery<EventsQueryData>(archivedQueryOptions);
      if (archivedData) {
        cache.writeQuery<EventsQueryData>({
          ...archivedQueryOptions,
          data: {
            eventsByOrganization: {
              ...archivedData.eventsByOrganization,
              events: archivedData.eventsByOrganization.events.filter(
                (e) => e.id !== fullEventObject.id
              ),
            },
          },
        });
      }

      // --- Part 2: Add to the Active Events List (if it's in the cache) ---
      const activeQueryOptions = {
        query: GET_EVENTS_BY_ORGANIZATION_QUERY,
        variables: { status: null },
      };
      const activeData = cache.readQuery<EventsQueryData>(activeQueryOptions);
      if (activeData) {
        cache.writeQuery<EventsQueryData>({
          ...activeQueryOptions,
          data: {
            eventsByOrganization: {
              ...activeData.eventsByOrganization,
              events: [
                fullEventObject,
                ...activeData.eventsByOrganization.events,
              ],
            },
          },
        });
      }

      // --- Part 3: Update the Archived Count ---
      const countQueryOptions = {
        query: GET_ARCHIVED_EVENTS_COUNT_QUERY,
        variables: { status: "archived" },
      };
      const countData =
        cache.readQuery<EventsCountQueryData>(countQueryOptions);
      if (countData) {
        cache.writeQuery<EventsCountQueryData>({
          ...countQueryOptions,
          data: {
            eventsByOrganization: {
              ...countData.eventsByOrganization,
              totalCount: countData.eventsByOrganization.totalCount - 1,
            },
          },
        });
      }
    },
  });

  const handleRestore = () => {
    restoreEvent({ variables: { id: event.id } });
  };

  const formattedDate = new Date(event.startDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cardContent = (
    <Card className="hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold pr-2">
            {event.name}
          </CardTitle>
          <Badge variant="outline" className="capitalize flex-shrink-0">
            {isArchivedView ? "Archived" : event.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{event.registrationsCount} Registrations</span>
        </div>
      </CardContent>
      {isArchivedView && (
        <CardFooter>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleRestore}
            disabled={loading}
          >
            {loading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArchiveRestore className="h-4 w-4 mr-2" />
            )}
            Restore Event
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return isArchivedView ? (
    <div>{cardContent}</div>
  ) : (
    <Link href={`/events/${event.id}`} className="no-underline h-full">
      {cardContent}
    </Link>
  );
};
