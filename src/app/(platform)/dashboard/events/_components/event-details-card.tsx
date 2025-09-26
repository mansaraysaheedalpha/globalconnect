// src/app/(platform)/dashboard/events/_components/event-details-card.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from "@/components/ui/description-list";
import { Globe, Lock, Users, MapPin, CalendarDays, Ticket } from "lucide-react";

type Event = {
  id: string;
  status: string;
  isPublic: boolean;
  startDate: string;
  endDate: string;
  registrationsCount: number;
  venue?: {
    id: string;
    name: string;
    address?: string | null;
  } | null;
};

interface EventDetailsCardProps {
  event: Event;
}

export const EventDetailsCard = ({ event }: EventDetailsCardProps) => {
  const formattedStartDate = new Date(event.startDate).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const getStatusVariant = () => {
    if (event.status === "published") return "default";
    if (event.status === "archived") return "destructive";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status & Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Registrations</p>
            <p className="text-2xl font-bold">{event.registrationsCount}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Tickets Sold</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        {/* Details List */}
        <DescriptionList>
          <DescriptionTerm>Status</DescriptionTerm>
          <DescriptionDetails>
            <Badge variant={getStatusVariant()} className="capitalize">
              {event.status}
            </Badge>
          </DescriptionDetails>

          <DescriptionTerm>Visibility</DescriptionTerm>
          <DescriptionDetails className="flex items-center gap-2">
            {event.isPublic ? (
              <Globe className="h-4 w-4 text-green-500" />
            ) : (
              <Lock className="h-4 w-4 text-red-500" />
            )}
            <span>{event.isPublic ? "Public" : "Private"}</span>
          </DescriptionDetails>

          <DescriptionTerm>Date</DescriptionTerm>
          <DescriptionDetails className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{formattedStartDate}</span>
          </DescriptionDetails>

          {event.venue && (
            <>
              <DescriptionTerm>Venue</DescriptionTerm>
              <DescriptionDetails className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">{event.venue.name}</p>
                  {event.venue.address && (
                    <p className="text-sm text-muted-foreground">
                      {event.venue.address}
                    </p>
                  )}
                </div>
              </DescriptionDetails>
            </>
          )}
        </DescriptionList>
      </CardContent>
    </Card>
  );
};
