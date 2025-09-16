// src/components/features/events/EventCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { CalendarDays, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Event } from "./event-list/column"; // We can reuse the type

interface EventCardProps {
  event: Event;
}


export function EventCard({ event }: EventCardProps) {
  const getStatusVariant = (status: string) =>
    status === "published"
      ? "default"
      : status === "draft"
      ? "secondary"
      : "destructive";

  // A curated list of beautiful, high-quality placeholders
  const placeholders = [
    "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop", // Concert
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop", // Conference
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop", // Tech Talk
  ];

  // A simple way to pick a random placeholder based on the event name
  const placeholderUrl =
    event.imageUrl || placeholders[event.name.length % placeholders.length];

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/events/${event.id}`}>
          <AspectRatio ratio={16 / 9}>
            <Image
              src={placeholderUrl} // Use the new placeholder logic
              alt={event.name}
              className="object-cover w-full h-full"
              fill
            />
          </AspectRatio>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Badge
            variant={getStatusVariant(event.status)}
            className="capitalize"
          >
            {event.status}
          </Badge>
          <span
            className={`text-sm ${
              event.isPublic ? "text-green-500" : "text-amber-500"
            }`}
          >
            {event.isPublic ? "Public" : "Private"}
          </span>
        </div>
        <CardTitle className="text-lg font-bold leading-tight mb-2">
          <Link href={`/events/${event.id}`} className="hover:underline">
            {event.name}
          </Link>
        </CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>{format(new Date(event.startDate), "PPP")}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/40 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            {/* Placeholder for registration count */}
            <span className="font-semibold">0</span>
            <span className="text-muted-foreground ml-1">Registrations</span>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/events/${event.id}`}>Manage Event</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
