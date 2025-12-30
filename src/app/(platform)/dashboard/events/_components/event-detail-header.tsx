
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMutation, ApolloCache, useApolloClient } from "@apollo/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  PUBLISH_EVENT_MUTATION,
  ARCHIVE_EVENT_MUTATION,
  UPDATE_EVENT_MUTATION,
  UNPUBLISH_EVENT_MUTATION,
} from "@/graphql/events.graphql";
import { GET_EVENTS_BY_ORGANIZATION_QUERY } from "@/graphql/queries";
import { GET_PUBLIC_EVENT_DETAILS_QUERY } from "@/graphql/public.graphql";
import { GET_ARCHIVED_EVENTS_COUNT_QUERY } from "@/graphql/events.graphql";
import { useAuthStore } from "@/store/auth.store";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EditEventModal } from "./edit-event-modal";
import {
  Copy,
  ExternalLink,
  Globe,
  Edit,
  Trash2,
  Loader,
  MoreVertical,
  BookCopy,
} from "lucide-react";
import { SaveAsBlueprintModal } from "./save-as-blueprint-modal";

// --- TYPE DEFINITIONS - Now self-contained within this component ---
type Event = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  isPublic: boolean;
  status: string;
  startDate: string;
  endDate: string;
  [key: string]: any; // Allow other properties
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

// --- PROPS INTERFACE ---
interface EventDetailHeaderProps {
  event: Event;
  refetch: () => void; // refetch function from the parent's useQuery
}

export const EventDetailHeader = ({
  event,
  refetch,
}: EventDetailHeaderProps) => {
  const router = useRouter();
  const client = useApolloClient();
  const { user } = useAuthStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);

  const [updateEvent] = useMutation(UPDATE_EVENT_MUTATION);
  const [publishEvent, { loading: isPublishing }] = useMutation(
    PUBLISH_EVENT_MUTATION,
    {
      refetchQueries: [
        {
          query: GET_PUBLIC_EVENT_DETAILS_QUERY,
          variables: { eventId: event.id },
        },
      ],
      onCompleted: () => {
        toast.success("Event has been published!");
        refetch(); // Refetch the event data to update the UI
      },
      onError: (error) =>
        toast.error("Failed to publish", { description: error.message }),
    }
  );

  const [archiveEvent, { loading: isDeleting }] = useMutation(
    ARCHIVE_EVENT_MUTATION,
    {
      onCompleted: () => {
        toast.success("Event successfully deleted.");
        router.push("/dashboard/events");
        router.refresh();
      },
      onError: (error) =>
        toast.error("Failed to delete event", { description: error.message }),
      update(cache) {
        const fullEventObject = event;

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

        // --- Part 2: Add to the Archived Events List ---
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

  const updateEventInCaches = (updated: Event) => {
    const variants = [null, "archived", "published", "draft"];
    variants.forEach((status) => {
      const variables = { status };
      try {
        const existing = client.readQuery<EventsQueryData>({
          query: GET_EVENTS_BY_ORGANIZATION_QUERY,
          variables,
        });
        if (existing) {
          client.writeQuery<EventsQueryData>({
            query: GET_EVENTS_BY_ORGANIZATION_QUERY,
            variables,
            data: {
              eventsByOrganization: {
                ...existing.eventsByOrganization,
                events: existing.eventsByOrganization.events.map((e: Event) =>
                  e.id === updated.id ? { ...e, ...updated } : e
                ),
              },
            },
          });
        }
      } catch {
        // ignore cache misses
      }
    });
  };

  const [unpublishEvent, { loading: isUnpublishing }] = useMutation(
    UNPUBLISH_EVENT_MUTATION,
    {
      onCompleted: (res) => {
        toast.success("Event unpublished");
        refetch();
        updateEventInCaches(res.unpublishEvent);
      },
      onError: (error) => {
        toast.error("Failed to unpublish", { description: error.message });
      },
    }
  );

  const isOwnerOrAdmin =
    user?.id === event?.ownerId ||
    user?.role === "OWNER" ||
    user?.role === "ADMIN";
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${event?.id}`
      : "";

  const handlePublish = () => publishEvent({ variables: { id: event.id } });
  const handleDelete = () => archiveEvent({ variables: { id: event.id } });
  const handleUnpublish = () => unpublishEvent({ variables: { id: event.id } });
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public link copied to clipboard!");
  };

  return (
    <>
      <EditEventModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        event={event}
      />
      <SaveAsBlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
        eventId={event.id}
        eventName={event.name}
      />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{event.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {event.description}
          </p>
        </div>
        {isOwnerOrAdmin && (
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {/* --- Actions are now in a Dropdown Menu --- */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => setIsBlueprintModalOpen(true)}
                >
                  <BookCopy className="h-4 w-4 mr-2" />
                  Save as Blueprint
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setIsDeleteDialogOpen(true)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {isOwnerOrAdmin && (
        <Alert
          className={
            event.isPublic
              ? "border-green-500 bg-green-50"
              : "border-blue-500 bg-blue-50"
          }
        >
          <Globe
            className={event.isPublic ? "text-green-600" : "text-blue-600"}
          />
          <AlertTitle className="font-bold">
            {event.isPublic ? "This event is LIVE" : "This event is a Draft"}
          </AlertTitle>
          <AlertDescription className="flex justify-between items-center mt-2">
            {event.isPublic
              ? "Your event is public and ready for registrations."
              : "Publish this event to make it visible to the public."}
            {event.isPublic ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Link href={publicUrl} rel="noopener noreferrer">
                  <Button size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Page
                  </Button>
                </Link>
                {event.status === "published" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/40 hover:bg-destructive/10"
                    onClick={() => setIsUnpublishDialogOpen(true)}
                    disabled={isUnpublishing}
                  >
                    {isUnpublishing ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    Unpublish
                  </Button>
                )}
              </div>
            ) : (
              <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? (
                  <Loader className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  <Globe className="h-4 w-4 mr-2" />
                )}
                Publish Event
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the event.
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

      <AlertDialog
        open={isUnpublishDialogOpen}
        onOpenChange={setIsUnpublishDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the event back to draft and remove it from public discovery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnpublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnpublish}
              disabled={isUnpublishing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isUnpublishing ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Unpublishing...
                </>
              ) : (
                "Yes, unpublish"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};