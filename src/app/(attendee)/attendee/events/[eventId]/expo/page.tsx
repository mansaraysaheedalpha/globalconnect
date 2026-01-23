// src/app/(attendee)/attendee/events/[eventId]/expo/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/premium-components";
import { ExpoHallView } from "@/components/features/expo";

export default function AttendeeExpoHallPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <PageTransition className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href={`/attendee/events/${eventId}`}>
            <Button variant="ghost" size="sm" className="gap-2 hover:-translate-x-1 transition-transform">
              <ArrowLeft className="h-4 w-4" />
              Back to Event
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Expo Hall</h1>
            <p className="text-sm text-muted-foreground">
              Explore sponsor booths and connect with exhibitors
            </p>
          </div>
        </div>
      </div>

      {/* Expo Hall Content */}
      <div className="flex-1 min-h-0">
        <ExpoHallView eventId={eventId} className="h-full" />
      </div>
    </PageTransition>
  );
}
