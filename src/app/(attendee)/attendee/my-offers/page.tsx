// src/app/(attendee)/attendee/my-offers/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_REGISTRATIONS_BY_EVENT_QUERY } from "@/graphql/registrations.graphql";
import { PurchasedOffersList } from "@/components/features/offers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Gift, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyOffersPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Get all events user is registered for
  const { data, loading } = useQuery(GET_REGISTRATIONS_BY_EVENT_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const registeredEvents = data?.myRegistrations || [];

  // Auto-select first event
  React.useEffect(() => {
    if (registeredEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(registeredEvents[0].event.id);
    }
  }, [registeredEvents, selectedEventId]);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            My Purchases
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your purchased offers, upgrades, and exclusive content.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : registeredEvents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No events found</h3>
            <p className="text-muted-foreground text-center max-w-xs">
              Register for an event to start purchasing exclusive offers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs
          value={selectedEventId || undefined}
          onValueChange={setSelectedEventId}
          className="w-full"
        >
          {/* Event Selection */}
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            {registeredEvents.map((registration: any) => (
              <TabsTrigger
                key={registration.event.id}
                value={registration.event.id}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {registration.event.name}
                {registration.event.status === "LIVE" && (
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    Live
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Purchases List per Event */}
          {registeredEvents.map((registration: any) => (
            <TabsContent
              key={registration.event.id}
              value={registration.event.id}
              className="mt-6"
            >
              <Card className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    {registration.event.name}
                  </CardTitle>
                  <CardDescription>
                    All your purchases for this event
                  </CardDescription>
                </CardHeader>
              </Card>

              <PurchasedOffersList eventId={registration.event.id} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
