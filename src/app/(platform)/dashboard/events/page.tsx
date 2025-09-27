//src/app/(platform)/events/page.tsx
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_EVENTS_BY_ORGANIZATION_QUERY } from "@/graphql/queries";
import { EventList } from "./_components/event-list";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const EventsPage = () => {
  const { orgId } = useAuthStore();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const isArchivedView = status === "archived";

  const { data, loading, error } = useQuery(GET_EVENTS_BY_ORGANIZATION_QUERY, {
    variables: {
      limit: 10,
      offset: 0,
      sortBy: "startDate",
      sortDirection: "desc",
      status: isArchivedView ? "archived" : null,
    },
    fetchPolicy: "network-only",
  });

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <h2 className="text-2xl font-semibold mb-2">
          No Organization Selected
        </h2>
        <p className="text-muted-foreground">
          Please select an organization from the switcher to view its events.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600 p-6">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-2xl font-semibold">Failed to load events</h2>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  const events = data?.eventsByOrganization?.events || [];
  const totalCount = data?.eventsByOrganization?.totalCount || 0;

  return (
    <EventList
      events={events}
      totalCount={totalCount}
      isArchivedView={isArchivedView}
    />
  );
};

export default EventsPage;
