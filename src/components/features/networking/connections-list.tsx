// src/components/features/networking/connections-list.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PremiumCard } from "@/components/ui/premium-components";
import {
  Users,
  UserPlus,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEventConnections, EventConnection } from "@/hooks/use-event-connections";
import { ConnectionCard } from "./connection-card";

interface ConnectionsListProps {
  eventId: string;
  onMessage: (userId: string, userName: string) => void;
  onViewProfile: (userId: string) => void;
  onSwitchToRecommended?: () => void;
}

/**
 * ConnectionsList displays the user's connections at an event.
 * Shows loading, empty, error, and populated states.
 *
 * Features:
 * - Fetches connections via useEventConnections hook
 * - Loading skeleton while fetching
 * - Empty state with call-to-action to find connections
 * - Error state with retry button
 * - List of ConnectionCards when connections exist
 */
export const ConnectionsList = ({
  eventId,
  onMessage,
  onViewProfile,
  onSwitchToRecommended,
}: ConnectionsListProps) => {
  const {
    connections,
    isLoading,
    error,
    total,
    isEmpty,
    hasConnections,
    refresh,
    clearError,
  } = useEventConnections({ eventId });

  // Loading state
  if (isLoading && !hasConnections) {
    return <ConnectionsListSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <ConnectionsEmptyState
        eventId={eventId}
        onSwitchToRecommended={onSwitchToRecommended}
      />
    );
  }

  // Connections list
  return (
    <div className="space-y-4">
      {/* Header with count and refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {total} {total === 1 ? "connection" : "connections"} at this event
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          aria-label="Refresh connections"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Connections grid */}
      <div className="grid gap-4">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            onMessage={onMessage}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>

      {/* Footer with count */}
      <div className="pt-4 text-center text-sm text-muted-foreground">
        Showing all {total} connections
      </div>
    </div>
  );
};

/**
 * Empty state component when user has no connections
 */
function ConnectionsEmptyState({
  eventId,
  onSwitchToRecommended,
}: {
  eventId: string;
  onSwitchToRecommended?: () => void;
}) {
  return (
    <PremiumCard variant="outline" padding="lg" className="text-center">
      <div className="p-4 w-fit mx-auto rounded-full bg-primary/10 mb-4">
        <UserPlus className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">Build Your Network</h3>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
        You haven't connected with anyone at this event yet. Check out the AI
        recommendations to find great matches!
      </p>
      <div className="flex items-center justify-center gap-3 mt-6">
        <Button variant="outline" className="gap-2" asChild>
          <Link href={`/attendee/events/${eventId}/attendees`}>
            <Search className="h-4 w-4" />
            Browse Attendees
          </Link>
        </Button>
        {onSwitchToRecommended && (
          <Button variant="premium" className="gap-2" onClick={onSwitchToRecommended}>
            <Sparkles className="h-4 w-4" />
            View AI Matches
          </Button>
        )}
      </div>
    </PremiumCard>
  );
}

/**
 * Skeleton loading state
 */
function ConnectionsListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ConnectionsList;
