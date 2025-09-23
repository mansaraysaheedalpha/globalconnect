"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_ARCHIVED_EVENTS_COUNT_QUERY } from "@/graphql/events.graphql";
import { Button } from "@/components/ui/button";
import { PlusCircle, Archive, ArrowLeft } from "lucide-react";
import { CreateEventModal } from "./create-event-modal";
import { EventCard } from "./event-card";

type Event = {
  id: string;
  name: string;
  status: "draft" | "published" | "archived";
  startDate: string;
  registrationsCount: number;
};

interface EventListProps {
  events: Event[];
  totalCount: number;
  isArchivedView: boolean;
}

export const EventList = ({
  events,
  totalCount,
  isArchivedView,
}: EventListProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: archivedData } = useQuery(GET_ARCHIVED_EVENTS_COUNT_QUERY, {
    variables: { status: "archived" },
    fetchPolicy: "cache-and-network",
  });
  const archivedCount = archivedData?.eventsByOrganization?.totalCount || 0;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const pageTitle = isArchivedView ? "Archived Events" : "Events";
  const emptyStateTitle = isArchivedView
    ? "No Archived Events"
    : "No Events Yet";
  const emptyStateDescription = isArchivedView
    ? "You have no archived events."
    : "Get started by creating your first event.";

  if (events.length === 0) {
    return (
      <>
        <CreateEventModal isOpen={isModalOpen} onClose={closeModal} />
        <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg m-6">
          <h2 className="text-2xl font-semibold mb-2">{emptyStateTitle}</h2>
          <p className="text-muted-foreground mb-6">{emptyStateDescription}</p>
          {!isArchivedView && (
            <Button onClick={openModal}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Event
            </Button>
          )}
          {isArchivedView && (
            <Link href="/events">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Active Events
              </Button>
            </Link>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <CreateEventModal isOpen={isModalOpen} onClose={closeModal} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {pageTitle}{" "}
            <span className="text-lg text-muted-foreground font-normal">
              ({totalCount})
            </span>
          </h1>
          {isArchivedView ? (
            <Link href="/events">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Active Events
              </Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              {archivedCount > 0 && (
                <Link href="/events?status=archived">
                  <Button variant="secondary">
                    <Archive className="h-4 w-4 mr-2" />
                    View Archived ({archivedCount})
                  </Button>
                </Link>
              )}
              <Button onClick={openModal}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isArchivedView={isArchivedView}
            />
          ))}
        </div>
      </div>
    </>
  );
};
