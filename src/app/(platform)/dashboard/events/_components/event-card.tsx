"use client";

import Link from "next/link";
import Image from "next/image";
import { useMutation, ApolloCache } from "@apollo/client";
import { toast } from "sonner";
import {
  RESTORE_EVENT_MUTATION,
  GET_ARCHIVED_EVENTS_COUNT_QUERY,
} from "@/graphql/events.graphql";
import { GET_EVENTS_BY_ORGANIZATION_QUERY } from "@/graphql/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon, UsersIcon } from "@heroicons/react/24/outline";
import { ArchiveRestore, Loader } from "lucide-react";
import { EventCardPlaceholder } from "./event-card-placeholder";

// Type definitions for cache updates
type Event = {
  id: string;
  name: string;
  status: "draft" | "published" | "archived";
  startDate: string;
  registrationsCount: number;
  imageUrl?: string | null;
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
    onCompleted: () =>
      toast.success(`Event "${event.name}" has been restored.`),
    onError: (error) =>
      toast.error("Failed to restore event", { description: error.message }),

    // --- CHANGE: Replaced `refetchQueries` with a manual cache update for instant UI changes ---
    update(cache: ApolloCache<any>, { data: { restoreEvent } }) {
      if (!restoreEvent) return;

      // Part 1: Remove from the Archived Events List
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
                (e) => e.id !== restoreEvent.id
              ),
              totalCount: archivedData.eventsByOrganization.totalCount - 1,
            },
          },
        });
      }

      // Part 2: Manually decrement the Archived Count query
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

      // Part 3: Add to the Active Events List cache (optional but good practice)
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
              events: [restoreEvent, ...activeData.eventsByOrganization.events],
              totalCount: activeData.eventsByOrganization.totalCount + 1,
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const cardContent = (
    <div className="relative group overflow-hidden rounded-xl shadow-md h-full flex flex-col justify-between bg-card">
      {event.imageUrl ? (
        <Image
          src={event.imageUrl}
          alt={event.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      ) : (
        <EventCardPlaceholder />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="relative p-4 w-full flex justify-between items-start">
        <Badge
          variant={event.status === "published" ? "default" : "secondary"}
          className="capitalize"
        >
          {isArchivedView ? "Archived" : event.status}
        </Badge>
      </div>

      <div className="relative p-4 w-full text-white">
        <h3 className="text-lg font-bold leading-tight">{event.name}</h3>
        <div className="mt-2 space-y-2 text-sm text-neutral-300">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{event.registrationsCount} Registrations</span>
          </div>
        </div>
      </div>

      {isArchivedView && (
        <div className="relative p-4 border-t border-white/10">
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
        </div>
      )}
    </div>
  );

  return isArchivedView ? (
    <div className="h-80">{cardContent}</div>
  ) : (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="block no-underline h-80"
    >
      {cardContent}
    </Link>
  );
};
