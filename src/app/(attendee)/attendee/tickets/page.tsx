// src/app/(attendee)/attendee/tickets/page.tsx
"use client";

import { GET_MY_REGISTRATIONS_QUERY } from "@/graphql/attendee.graphql";
import { useOfflineQuery } from "@/hooks/use-offline-query";
import { StaleDataIndicator } from "@/components/ui/stale-data-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, CalendarDays, MapPin, QrCode } from "lucide-react";
import { format } from "date-fns";

type Registration = {
  id: string;
  status: string;
  ticketCode: string;
  checkedInAt: string | null;
  event: {
    id: string;
    name: string;
    startDate: string;
    venue: {
      name: string;
    } | null;
  };
};

export default function TicketsPage() {
  const { data, loading, error, isStale, isOffline, lastFetched, refetch } = useOfflineQuery(GET_MY_REGISTRATIONS_QUERY, {
    offlineKey: "my-tickets",
  });

  if (loading && !data) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Failed to load tickets</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const registrations: Registration[] = data?.myRegistrations || [];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <p className="text-muted-foreground">Your event tickets and QR codes</p>
      </div>

      <StaleDataIndicator
        isStale={isStale}
        isOffline={isOffline}
        lastFetched={lastFetched}
        onRefresh={refetch}
        className="mb-4"
      />

      {registrations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No Tickets</h3>
            <p className="text-muted-foreground mt-2">
              Register for events to get your tickets here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {registrations.map((registration) => (
            <Card key={registration.id} className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="text-base">{registration.event.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      {format(new Date(registration.event.startDate), "MMM d, yyyy")}
                    </div>
                    {registration.event.venue && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {registration.event.venue.name}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" />
                      <span className="font-mono font-semibold">{registration.ticketCode}</span>
                    </div>
                    {registration.checkedInAt ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        Checked In
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Valid</Badge>
                    )}
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <QrCode className="h-16 w-16 text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
