"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, ApolloCache } from "@apollo/client";
import { toast } from "sonner";

import {
  GET_EVENT_BY_ID_QUERY,
  ARCHIVE_EVENT_MUTATION,
  GET_ARCHIVED_EVENTS_COUNT_QUERY,
  GET_SESSIONS_BY_EVENT_QUERY
} from "@/graphql/events.graphql";
import {
  GET_EVENTS_BY_ORGANIZATION_QUERY
} from "@/graphql/queries";

import { useAuthStore } from "@/store/auth.store";
import { EditEventModal } from "../_components/edit-event-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from "@/components/ui/description-list";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AlertTriangle,
  Calendar,
  Users,
  Globe,
  Lock,
  Edit,
  Trash2,
  Loader,
} from "lucide-react";
import { SessionList } from "../_components/session-list";

// --- TYPE DEFINITIONS for type safety ---
type Event = {
  id: string;
  [key: string]: any; // Allow for other event properties
  __typename?: string;
};

type EventsQueryData = {
  eventsByOrganization: {
    __typename?: string;
    events: Event[];
    totalCount: number;
  };
};

type EventsCountQueryData = {
  eventsByOrganization: {
    __typename?: string;
    totalCount: number;
  };
};

const EventDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { user } = useAuthStore();

  const { data, loading, error } = useQuery(GET_EVENT_BY_ID_QUERY, {
    variables: { id: eventId },
    skip: !eventId,
  });

  // --- NEW: Query for the event's sessions ---
  const {
    data: sessionsData,
    loading: sessionsLoading,
    error: sessionsError,
  } = useQuery(GET_SESSIONS_BY_EVENT_QUERY, {
    variables: { eventId: eventId },
    skip: !eventId,
  });

  const [archiveEvent, { loading: isDeleting }] = useMutation(
    ARCHIVE_EVENT_MUTATION,
    {
      onCompleted: () => {
        toast.success("Event successfully deleted.");
        router.push("/events");
        router.refresh(); // Force a server-side data refresh
      },
      onError: (error) => {
        toast.error("Failed to delete event", { description: error.message });
      },
      update(cache) {
        // Use the full event object from the page's main query, not the mutation response
        const fullEventObject = data?.event;
        if (!fullEventObject) return;

        // --- Part 1: Remove from the Active Events List ---
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
                events: activeData.eventsByOrganization.events.filter(
                  (e) => e.id !== fullEventObject.id
                ),
              },
            },
          });
        }

        // --- Part 2: Add the FULL event object to the Archived Events List ---
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
                events: [
                  fullEventObject,
                  ...archivedData.eventsByOrganization.events,
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
                totalCount: countData.eventsByOrganization.totalCount + 1,
              },
            },
          });
        }
      },
    }
  );

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600 p-6">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-2xl font-semibold">Failed to load event details</h2>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <h2 className="text-2xl font-semibold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground">
          This event may have been deleted or you may not have permission to
          view it.
        </p>
      </div>
    );
  }

  const { event } = data;
  const isOwner = user?.id === event.ownerId;
  const handleDelete = () => {
    archiveEvent({ variables: { id: event.id } });
  };

  const formattedStartDate = new Date(event.startDate).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const formattedEndDate = new Date(event.endDate).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });


   const sessions = sessionsData?.sessionsByEvent || [];

  return (
    <>
      {event && (
        <EditEventModal
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          event={event}
        />
      )}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{event.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {event.description}
            </p>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200">
          <DescriptionList>
            <DescriptionTerm>Status</DescriptionTerm>
            <DescriptionDetails>
              <Badge className="capitalize">{event.status}</Badge>
            </DescriptionDetails>
            <DescriptionTerm>Visibility</DescriptionTerm>
            <DescriptionDetails className="flex items-center">
              {event.isPublic ? (
                <Globe className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 mr-2 text-red-600" />
              )}
              {event.isPublic ? "Public" : "Private"}
            </DescriptionDetails>
            <DescriptionTerm>Starts</DescriptionTerm>
            <DescriptionDetails>{formattedStartDate}</DescriptionDetails>
            <DescriptionTerm>Ends</DescriptionTerm>
            <DescriptionDetails>{formattedEndDate}</DescriptionDetails>
            <DescriptionTerm>Registrations</DescriptionTerm>
            <DescriptionDetails className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {event.registrationsCount}
            </DescriptionDetails>
          </DescriptionList>
        </div>
        {sessionsLoading ? (
          <Skeleton className="h-48 w-full mt-8" />
        ) : sessionsError ? (
          <div className="text-center text-red-500 mt-8">
            Failed to load sessions.
          </div>
        ) : (
          <SessionList
            sessions={sessions}
            eventId={eventId}
            eventStartDate={event.startDate}
            eventEndDate={event.endDate}
          />
        )}
      </div>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will archive the event. You can restore it later, but
              it will be hidden from public view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, delete event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
const EventDetailSkeleton = () => (
  <div className="p-6 max-w-4xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <div>
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-6 w-96 mt-4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
    <div className="border-t border-gray-200 space-y-4 pt-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  </div>
);

export default EventDetailPage;
