// src/app/(platform)/events/_components/event-list.tsx
"use client";

import { EventPageHeader } from "./event-page-header";
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar } from "lucide-react";
import { useState } from "react";
import { CreateEventModal } from "./create-event-modal";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  PremiumCard,
} from "@/components/ui/premium-components";
import { NoEventsEmpty } from "@/components/ui/empty-states";

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
        <PageTransition className="px-4 sm:px-6 py-6">
          <NoEventsEmpty onCreateEvent={() => setIsModalOpen(true)} />
        </PageTransition>
      </>
    );
  }

  if (events.length === 0 && isArchivedView) {
    return (
      <PageTransition className="px-4 sm:px-6 py-6">
        <EventPageHeader
          pageTitle={pageTitle}
          totalCount={0}
          isArchivedView={isArchivedView}
        />
        <PremiumCard variant="glass" padding="lg" className="text-center mt-8">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No archived events</h3>
          <p className="text-sm text-muted-foreground">
            Events you archive will appear here
          </p>
        </PremiumCard>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="px-4 sm:px-6 py-6">
      <EventPageHeader
        pageTitle={pageTitle}
        totalCount={totalCount}
        isArchivedView={isArchivedView}
      />
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {events.map((event) => (
          <StaggerItem key={event.id}>
            <EventCard event={event} isArchivedView={isArchivedView} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </PageTransition>
  );
};
