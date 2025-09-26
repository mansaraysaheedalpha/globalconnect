// src/app/(platform)/events/_components/event-list.tsx
"use client";

import { EventPageHeader } from "./event-page-header";
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { CreateEventModal } from "./create-event-modal";

type Event = {
  id: string;
  name: string;
  status: "draft" | "published" | "archived";
  startDate: string;
  registrationsCount: number;
  imageUrl?: string | null;
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

  const pageTitle = isArchivedView ? "Archived Events" : "My Events";

  if (events.length === 0 && !isArchivedView) {
    return (
      <>
        <CreateEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center p-8 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">
            You have no events yet
          </h2>
          <p className="text-muted-foreground mb-6">
            Get started by creating your first event.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Event
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="p-6">
      <EventPageHeader
        pageTitle={pageTitle}
        totalCount={totalCount}
        isArchivedView={isArchivedView}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isArchivedView={isArchivedView}
          />
        ))}
      </div>
    </div>
  );
};
