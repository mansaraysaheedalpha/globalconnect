//src/app/(platform)/events/page.tsx
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_EVENTS_BY_ORGANIZATION_QUERY } from "@/graphql/queries";
import { EventList } from "./_components/event-list";
import { CardSkeleton, ShimmerSkeleton } from "@/components/ui/skeleton-patterns";
import { QueryErrorHandler } from "@/components/ui/error-boundary";
import { AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const EventsPage = () => {
  const { orgId } = useAuthStore();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const isArchivedView = status === "archived";

  const { data, loading, error, refetch } = useQuery(GET_EVENTS_BY_ORGANIZATION_QUERY, {
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
      <div className="p-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <ShimmerSkeleton className="h-9 w-48" />
            <ShimmerSkeleton className="h-4 w-32" />
          </div>
          <ShimmerSkeleton className="h-10 w-36 rounded-md" />
        </div>

        {/* Filters/Tabs */}
        <div className="flex gap-2 mb-6">
          <ShimmerSkeleton className="h-9 w-24 rounded-md" />
          <ShimmerSkeleton className="h-9 w-24 rounded-md" />
          <ShimmerSkeleton className="h-9 w-24 rounded-md" />
        </div>

        {/* Event cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} hasImage lines={2} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <QueryErrorHandler
          error={error}
          onRetry={() => refetch()}
        />
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
