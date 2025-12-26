// src/app/(public)/events/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@apollo/client";
import { GET_PUBLIC_EVENTS_QUERY } from "@/graphql/public.graphql";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  AlertTriangleIcon,
  ArrowRight,
  Search,
} from "lucide-react";

type Event = {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string | null;
  venue?: {
    id: string;
    name: string;
  } | null;
};

const EventCard = ({ event }: { event: Event }) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isMultiDay = startDate.toDateString() !== endDate.toDateString();

  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedEndDate = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <div className="relative overflow-hidden rounded-xl bg-card border shadow-sm hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
              <CalendarDays className="h-12 w-12 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Date Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-foreground shadow-lg">
              {formattedDate}
              {isMultiDay && ` - ${formattedEndDate}`}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {event.name}
          </h3>

          {event.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          {event.venue && (
            <div className="mt-3 flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{event.venue.name}</span>
            </div>
          )}

          {/* Register CTA */}
          <div className="mt-4 flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span>View & Register</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const EventCardSkeleton = () => (
  <div className="rounded-xl bg-card border shadow-sm overflow-hidden">
    <Skeleton className="aspect-[4/3] sm:aspect-[16/9] w-full" />
    <div className="p-4 sm:p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const PublicEventsPage = () => {
  const { data, loading, error } = useQuery(GET_PUBLIC_EVENTS_QUERY, {
    variables: { limit: 50, offset: 0 },
  });

  const events = data?.publicEvents?.events || [];
  const totalCount = data?.publicEvents?.totalCount || 0;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-background pt-20 sm:pt-24 pb-10 sm:pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Upcoming Events
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Discover and register for exciting events happening near you.
              From conferences to workshops, find your next experience.
            </p>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 md:px-6 py-8 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 flex flex-col items-center">
            <AlertTriangleIcon className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold">Unable to load events</h2>
            <p className="text-muted-foreground mt-2">
              Please try again later.
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold">No events available</h2>
            <p className="text-muted-foreground mt-2">
              Check back soon for upcoming events.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {events.length} of {totalCount} events
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {events.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicEventsPage;
