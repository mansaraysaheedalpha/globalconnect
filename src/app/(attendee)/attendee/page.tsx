// src/app/(attendee)/attendee/page.tsx
"use client";

import { useQuery } from "@apollo/client";
import { GET_MY_REGISTRATIONS_QUERY } from "@/graphql/attendee.graphql";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  MapPin,
  Clock,
  Ticket,
  ChevronRight,
  CalendarX,
  ExternalLink,
} from "lucide-react";
import { format, isPast, isFuture, isWithinInterval } from "date-fns";
import Link from "next/link";
import Image from "next/image";

type Registration = {
  id: string;
  status: string;
  ticketCode: string;
  checkedInAt: string | null;
  event: {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    imageUrl: string | null;
    venue: {
      id: string;
      name: string;
      address: string;
    } | null;
  };
};

const getEventStatus = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isFuture(start)) return "upcoming";
  if (isWithinInterval(now, { start, end })) return "live";
  return "ended";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "live":
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live Now
        </Badge>
      );
    case "upcoming":
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
          Upcoming
        </Badge>
      );
    case "ended":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Ended
        </Badge>
      );
    default:
      return null;
  }
};

const getRegistrationBadge = (status: string) => {
  switch (status) {
    case "checked_in":
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          Checked In
        </Badge>
      );
    case "confirmed":
      return (
        <Badge variant="secondary">
          Registered
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="destructive">
          Cancelled
        </Badge>
      );
    default:
      return null;
  }
};

const EventCard = ({ registration }: { registration: Registration }) => {
  const { event } = registration;
  const eventStatus = getEventStatus(event.startDate, event.endDate);
  const isLive = eventStatus === "live";

  return (
    <Link href={`/attendee/events/${event.id}`}>
      <Card className={`group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 ${isLive ? "ring-2 ring-green-500/20" : ""}`}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Event Image */}
            <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <CalendarDays className="h-12 w-12 text-primary/40" />
                </div>
              )}
              {isLive && (
                <div className="absolute top-2 left-2">
                  {getStatusBadge("live")}
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="flex-1 p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!isLive && getStatusBadge(eventStatus)}
                    {getRegistrationBadge(registration.status)}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {event.name}
                  </h3>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {format(new Date(event.startDate), "MMM d, yyyy")}
                        {event.endDate !== event.startDate && (
                          <> - {format(new Date(event.endDate), "MMM d, yyyy")}</>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{format(new Date(event.startDate), "h:mm a")}</span>
                    </div>

                    {event.venue && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{event.venue.name}</span>
                      </div>
                    )}

                    {registration.ticketCode && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Ticket className="h-4 w-4 flex-shrink-0" />
                        <span className="font-mono">{registration.ticketCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function AttendeeDashboard() {
  const { data, loading, error } = useQuery(GET_MY_REGISTRATIONS_QUERY, {
    fetchPolicy: "cache-and-network", // Always fetch fresh data while showing cached
  });

  // Only show loading skeleton if we have no data at all (first load)
  if (loading && !data) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Failed to load your events</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const registrations: Registration[] = data?.myRegistrations || [];

  // Separate into upcoming/live and past events
  const activeRegistrations = registrations.filter((r) => {
    const status = getEventStatus(r.event.startDate, r.event.endDate);
    return status === "live" || status === "upcoming";
  });

  const pastRegistrations = registrations.filter((r) => {
    const status = getEventStatus(r.event.startDate, r.event.endDate);
    return status === "ended";
  });

  // Sort: live first, then by date
  activeRegistrations.sort((a, b) => {
    const aStatus = getEventStatus(a.event.startDate, a.event.endDate);
    const bStatus = getEventStatus(b.event.startDate, b.event.endDate);
    if (aStatus === "live" && bStatus !== "live") return -1;
    if (bStatus === "live" && aStatus !== "live") return 1;
    return new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime();
  });

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Events you've registered for</p>
        </div>
        <Link href="/events">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Browse Events
          </Button>
        </Link>
      </div>

      {registrations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <CalendarX className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No Events Yet</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              You haven't registered for any events yet. Browse upcoming events to find something interesting!
            </p>
            <Link href="/events">
              <Button className="mt-4">Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active/Upcoming Events */}
          {activeRegistrations.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Upcoming & Live Events
              </h2>
              <div className="space-y-4">
                {activeRegistrations.map((registration) => (
                  <EventCard key={registration.id} registration={registration} />
                ))}
              </div>
            </section>
          )}

          {/* Past Events */}
          {pastRegistrations.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                Past Events
              </h2>
              <div className="space-y-4 opacity-75">
                {pastRegistrations.map((registration) => (
                  <EventCard key={registration.id} registration={registration} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
