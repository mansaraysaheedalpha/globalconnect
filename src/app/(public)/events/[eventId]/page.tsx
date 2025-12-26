// src/app/(public)/events/[eventId]/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_PUBLIC_EVENT_DETAILS_QUERY } from "@/graphql/public.graphql";
import { GET_EVENT_TICKET_TYPES_QUERY } from "@/graphql/payments.graphql";
import { RegistrationModal } from "./_components/registration-model";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangleIcon, Info } from "lucide-react";
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

  // Fetch ticket types for pricing info
  const { data: ticketData, loading: ticketLoading } = useQuery(
    GET_EVENT_TICKET_TYPES_QUERY,
    {
      variables: { eventId },
      skip: !eventId,
    }
  );

  // Calculate ticket price info
  const ticketInfo = useMemo(() => {
    const ticketTypes = ticketData?.eventTicketTypes;
    if (!ticketTypes || ticketTypes.length === 0) return null;

    const prices = ticketTypes
      .filter((t: { isOnSale: boolean }) => t.isOnSale)
      .map((t: { price: { amount: number; currency: string } }) => t.price.amount);

    if (prices.length === 0) return null;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const currency = ticketTypes[0]?.price?.currency || 'USD';
    const allFree = prices.every((p: number) => p === 0);

    return {
      minPrice,
      maxPrice,
      currency,
      hasMultipleTiers: ticketTypes.length > 1,
      allFree,
    };
  }, [ticketData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Skeleton */}
        <Skeleton className="h-[70vh] w-full" />

        {/* Content Skeleton */}
        <div className="container mx-auto max-w-6xl px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-8 w-32 mt-8" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-80 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Event Not Found</h2>
            <p className="text-muted-foreground mt-2">
              This event may not exist, is no longer public, or has been removed.
            </p>
          </CardContent>
        </Card>
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

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <EventHero
          name={event.name}
          imageUrl={event.imageUrl}
          startDate={event.startDate}
          endDate={event.endDate}
          venueName={event.venue?.name}
        />

        {/* Main Content */}
        <div className="container mx-auto max-w-6xl px-4 md:px-6 py-10 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-10">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* About Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h2 className="text-2xl font-bold">About This Event</h2>
                </div>
                <Card>
                  <CardContent className="p-6">
                    {event.description ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {event.description}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Info className="h-5 w-5" />
                        <p>No description provided for this event.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* Agenda Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h2 className="text-2xl font-bold">Event Agenda</h2>
                </div>
                <SessionTimeline sessions={sessions} />
              </section>
            </div>

            {/* Right Column - Registration Card */}
            <div className="lg:col-span-1">
              <StickyRegistrationCard
                eventId={event.id}
                startDate={event.startDate}
                endDate={event.endDate}
                venueName={event.venue?.name}
                onRegisterClick={() => setIsModalOpen(true)}
                ticketInfo={ticketInfo}
                isLoadingTickets={ticketLoading}
              />
            </div>
          </div>
        </div>

        {/* Bottom padding for mobile fixed button */}
        <div className="h-24 lg:hidden" />
      </div>
    </>
  );
};

export default PublicEventPage;
