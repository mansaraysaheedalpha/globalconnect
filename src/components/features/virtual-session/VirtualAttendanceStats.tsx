// src/components/features/virtual-session/VirtualAttendanceStats.tsx
"use client";

import { useQuery } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  Monitor,
  Activity,
} from "lucide-react";
import { GET_EVENT_VIRTUAL_ATTENDANCE_STATS_QUERY } from "@/graphql/dashboard.graphql";
import type { EventVirtualAttendanceStats } from "@/graphql/dashboard.graphql";

interface VirtualAttendanceStatsProps {
  eventId: string;
  className?: string;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionStatsRow({
  sessionId,
  stats,
  sessionName,
}: {
  sessionId: string;
  stats: {
    totalViews: number;
    uniqueViewers: number;
    currentViewers: number;
    avgWatchDurationSeconds: number;
    peakViewers: number;
  };
  sessionName?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{sessionName || sessionId}</p>
        <p className="text-xs text-muted-foreground">
          {stats.uniqueViewers} unique viewer{stats.uniqueViewers !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-center">
          <p className="font-medium">{stats.totalViews}</p>
          <p className="text-xs text-muted-foreground">Views</p>
        </div>
        <div className="text-center">
          {stats.currentViewers > 0 ? (
            <Badge variant="default" className="bg-green-500">
              <Activity className="h-3 w-3 mr-1" />
              {stats.currentViewers} live
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
        <div className="text-center">
          <p className="font-medium">{formatDuration(stats.avgWatchDurationSeconds)}</p>
          <p className="text-xs text-muted-foreground">Avg time</p>
        </div>
      </div>
    </div>
  );
}

export function VirtualAttendanceStats({
  eventId,
  className,
}: VirtualAttendanceStatsProps) {
  const { data, loading, error } = useQuery<{
    eventVirtualAttendanceStats: EventVirtualAttendanceStats;
  }>(GET_EVENT_VIRTUAL_ATTENDANCE_STATS_QUERY, {
    variables: { eventId },
    pollInterval: 30000, // Refresh every 30 seconds for live data
  });

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Unable to load virtual attendance stats</p>
          <p className="text-xs mt-1">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const stats = data?.eventVirtualAttendanceStats;

  if (!stats) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No virtual attendance data yet</p>
          <p className="text-xs mt-1">Stats will appear once attendees start watching</p>
        </CardContent>
      </Card>
    );
  }

  const hasActivity = stats.totalViews > 0;

  return (
    <div className={className}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Views"
          value={stats.totalViews}
          subtitle="All session views"
          icon={Eye}
        />
        <StatCard
          title="Unique Viewers"
          value={stats.uniqueViewers}
          subtitle="Individual attendees"
          icon={Users}
        />
        <StatCard
          title="Watching Now"
          value={stats.currentViewers}
          subtitle={stats.currentViewers > 0 ? "Live viewers" : "No one watching"}
          icon={Activity}
        />
        <StatCard
          title="Avg Watch Time"
          value={formatDuration(stats.avgWatchDurationSeconds)}
          subtitle="Per viewing session"
          icon={Clock}
        />
      </div>

      {/* Per-Session Breakdown */}
      {hasActivity && stats.sessionStats.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Session Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.sessionStats
              .filter((s) => s.totalViews > 0)
              .map((sessionStat) => (
                <SessionStatsRow
                  key={sessionStat.sessionId}
                  sessionId={sessionStat.sessionId}
                  stats={sessionStat}
                />
              ))}
            {stats.sessionStats.every((s) => s.totalViews === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No session views recorded yet
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live indicator */}
      {stats.currentViewers > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {stats.currentViewers} attendee{stats.currentViewers !== 1 ? "s" : ""} watching live
        </div>
      )}
    </div>
  );
}

export default VirtualAttendanceStats;
