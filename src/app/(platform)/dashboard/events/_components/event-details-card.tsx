"use client";

import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from "@/components/ui/description-list";
import { Globe, Lock, Users, MapPin } from "lucide-react";

type Event = {
  id: string;
  status: string;
  isPublic: boolean;
  startDate: string;
  endDate: string;
  registrationsCount: number;
  venue?: {
    // Venue is now an optional object
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
    dateStyle: "long",
    timeStyle: "short",
  });
  const formattedEndDate = new Date(event.endDate).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList>
          <DescriptionTerm>Status</DescriptionTerm>
          <DescriptionDetails>
            <Badge className="capitalize">{event.status}</Badge>
          </DescriptionDetails>
          <DescriptionTerm>Visibility</DescriptionTerm>
          <DescriptionDetails className="flex items-center">
            {event.isPublic ? (
              <Globe className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <Lock className="h-4 w-4 mr-2 text-red-600" />
            )}
            {event.isPublic ? "Public" : "Private"}
          </DescriptionDetails>
          <DescriptionTerm>Starts</DescriptionTerm>
          <DescriptionDetails>{formattedStartDate}</DescriptionDetails>
          <DescriptionTerm>Ends</DescriptionTerm>
          <DescriptionDetails>{formattedEndDate}</DescriptionDetails>
          <DescriptionTerm>Registrations</DescriptionTerm>
          <DescriptionDetails className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            {event.registrationsCount}
          </DescriptionDetails>
          {event.venue && (
            <>
              <DescriptionTerm>Venue</DescriptionTerm>
              <DescriptionDetails>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{event.venue.name}</p>
                    {event.venue.address && (
                      <p className="text-sm text-muted-foreground">
                        {event.venue.address}
                      </p>
                    )}
                  </div>
                </div>
              </DescriptionDetails>
            </>
          )}
        </DescriptionList>
      </CardContent>
    </Card>
  );
};
