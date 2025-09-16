// src/app/(platform)/events/page.tsx
"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { GET_EVENTS_QUERY } from "@/graphql/events.graphql";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { EventCard } from "@/components/features/events/EventCard";
import { EventEmptyState } from "@/components/features/events/EventEmptyState";

export default function EventsPage() {
  const { data, loading, error } = useQuery(GET_EVENTS_QUERY);

  const events = data?.eventsByOrganization || [];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 bg-red-50 p-6 rounded-md">
          <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
          <p className="font-semibold">Error loading events</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }

    if (events.length === 0) {
      return <EventEmptyState />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events Dashboard</h1>
        <Button asChild>
          <Link href="/events/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      {renderContent()}
    </div>
  );
}
