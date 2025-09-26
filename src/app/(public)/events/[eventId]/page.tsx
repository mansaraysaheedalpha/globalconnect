// src/app/(public)/events/[eventId]/page.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_PUBLIC_EVENT_DETAILS_QUERY } from "@/graphql/public.graphql";
import { RegistrationModal } from "./_components/registration-model";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangleIcon } from "lucide-react";
import { EventHero } from "./_components/event-hero";
import { StickyRegistrationCard } from "./_components/sticky-registration-card";
import { SessionTimeline } from "./_components/session-timeline";

const PublicEventPage = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, loading, error } = useQuery(GET_PUBLIC_EVENT_DETAILS_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl p-8 space-y-8">
        <Skeleton className="h-96 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-8 w-1/4 mt-8" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.event) {
    return (
      <div className="container mx-auto text-center py-20 flex flex-col items-center">
        <AlertTriangleIcon className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <p className="text-muted-foreground">
          This event may not exist or is no longer public.
        </p>
      </div>
    );
  }

  const { event, publicSessionsByEvent: sessions } = data;

  return (
    <>
      <RegistrationModal
        eventId={event.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="bg-background">
        <EventHero name={event.name} imageUrl={event.imageUrl} />
        <div className="container mx-auto max-w-6xl py-12 md:py-16">
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10">
            {/* --- Main Content (Left Column) --- */}
            <div className="lg:col-span-2">
              <section>
                <h2 className="text-2xl font-bold border-b pb-3 mb-6">
                  About This Event
                </h2>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                  <p>{event.description || "No description provided."}</p>
                </div>
              </section>

              <section className="mt-12">
                <h2 className="text-2xl font-bold border-b pb-3 mb-6">
                  Agenda
                </h2>
                <SessionTimeline sessions={sessions} />
              </section>
            </div>

            {/* --- Sidebar (Right Column) --- */}
            <div className="lg:col-span-1">
              <StickyRegistrationCard
                startDate={event.startDate}
                venueName={event.venue?.name}
                onRegisterClick={() => setIsModalOpen(true)}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PublicEventPage;
