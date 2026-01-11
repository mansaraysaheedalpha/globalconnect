// src/app/(platform)/dashboard/page.tsx
"use client";

import { useAuthStore } from "@/store/auth.store";
import { useQuery } from "@apollo/client";
import { GET_EVENTS_BY_ORGANIZATION_QUERY } from "@/graphql/queries";
import {
  GET_DASHBOARD_DATA_QUERY,
  type DashboardData,
} from "@/graphql/dashboard.graphql";
import {
  PageTransition,
  SectionHeader,
  StaggerContainer,
  StaggerItem,
  PremiumCard,
} from "@/components/ui/premium-components";
import { MiniStatsGrid } from "@/components/ui/charts";
import { CardSkeleton, ShimmerSkeleton } from "@/components/ui/skeleton-patterns";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user, orgId } = useAuthStore();

  // Fetch events
  const { data: eventsData, loading: eventsLoading } = useQuery(
    GET_EVENTS_BY_ORGANIZATION_QUERY,
    {
      variables: {
        limit: 5,
        offset: 0,
        sortBy: "startDate",
        sortDirection: "desc",
      },
      skip: !orgId,
    }
  );

  // Fetch dashboard stats from real API
  const { data: dashboardData, loading: dashboardLoading } = useQuery<DashboardData>(
    GET_DASHBOARD_DATA_QUERY,
    {
      skip: !orgId,
    }
  );


  const events = eventsData?.eventsByOrganization?.events || [];
  const totalEvents = eventsData?.eventsByOrganization?.totalCount || 0;

  // Extract dashboard data with fallbacks (shows 0 when API not ready)
  const dashboardStats = dashboardData?.organizationDashboardStats;

  // Build stats array from real API data
  const stats = [
    {
      label: "Total Events",
      value: totalEvents,
      change: dashboardStats?.totalEventsChange ?? 0,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: "Total Attendees",
      value: dashboardStats?.totalAttendees ?? 0,
      change: dashboardStats?.totalAttendeesChange ?? 0,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Avg. Engagement",
      value: dashboardStats?.avgEngagementRate
        ? `${Math.round(dashboardStats.avgEngagementRate)}%`
        : "0%",
      change: dashboardStats?.avgEngagementChange ?? 0,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Active Sessions",
      value: dashboardStats?.activeSessions ?? 0,
      change: dashboardStats?.activeSessionsChange ?? 0,
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  const loading = eventsLoading || dashboardLoading;

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6 space-y-6">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-9 w-64" />
          <ShimmerSkeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} lines={2} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
            Welcome back, {user?.first_name || "Organizer"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your events today.
          </p>
        </div>
        <Link href="/dashboard/events" className="flex-shrink-0">
          <Button variant="premium" size="lg" className="w-full sm:w-auto h-11 sm:h-12">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <MiniStatsGrid items={stats} columns={4} />

      {/* Upcoming Events */}
      <div>
        <SectionHeader
          title="Upcoming Events"
          subtitle="Your next scheduled events"
          action={
            <Link href="/dashboard/events">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          }
        />
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.length > 0 ? (
            events.slice(0, 3).map((event: any) => (
              <StaggerItem key={event.id}>
                <Link href={`/dashboard/events/${event.id}`}>
                  <PremiumCard
                    variant="elevated"
                    padding="none"
                    hover="lift"
                    className="overflow-hidden group"
                  >
                    {/* Event Image */}
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                      {event.coverImage && (
                        <img
                          src={event.coverImage}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                          {event.status || "Draft"}
                        </span>
                      </div>
                    </div>
                    {/* Event Details */}
                    <div className="p-4">
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {event.name}
                      </h3>
                      <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {event.startDate
                            ? format(new Date(event.startDate), "MMM d, yyyy")
                            : "Date TBD"}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="line-clamp-1">
                            {event.venue?.name || event.location || "Location TBD"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </Link>
              </StaggerItem>
            ))
          ) : (
            <StaggerItem className="col-span-full">
              <PremiumCard variant="glass" padding="lg" className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No events yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first event to get started
                </p>
                <Link href="/dashboard/events">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              </PremiumCard>
            </StaggerItem>
          )}
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}
