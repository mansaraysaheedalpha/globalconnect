// src/components/features/heatmap/heatmap-dashboard.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Map,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useHeatmap } from "@/hooks/use-heatmap";
import { HeatmapZoneCard } from "./heatmap-zone-card";
import { ActivityIndicator, ActivityDot } from "./activity-indicator";
import { HeatmapZone, ActivityLevel } from "@/types/heatmap";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface HeatmapDashboardProps {
  eventId: string;
  venueCapacity?: number;
  onZoneClick?: (zone: HeatmapZone) => void;
}

type SortOption = "activity" | "engagement" | "name";

export function HeatmapDashboard({
  eventId,
  venueCapacity = 500,
  onZoneClick,
}: HeatmapDashboardProps) {
  const {
    zones,
    totalAttendees,
    overallActivity,
    lastUpdated,
    isConnected,
    isJoined,
    isLoading,
    error,
    joinHeatmap,
    getCriticalZones,
    clearError,
  } = useHeatmap({ eventId });

  const [sortBy, setSortBy] = useState<SortOption>("activity");
  const [filterLevel, setFilterLevel] = useState<ActivityLevel | "all">("all");

  // Sort zones
  const sortedZones = [...zones].sort((a, b) => {
    switch (sortBy) {
      case "activity":
        return b.heatScore - a.heatScore;
      case "engagement":
        return b.heatScore - a.heatScore;
      case "name":
        return a.zoneName.localeCompare(b.zoneName);
      default:
        return 0;
    }
  });

  // Filter zones
  const filteredZones =
    filterLevel === "all"
      ? sortedZones
      : sortedZones.filter((z) => z.activityLevel === filterLevel);

  // Stats by level
  const criticalZones = getCriticalZones();
  const zoneCounts = {
    low: zones.filter((z) => z.activityLevel === "low").length,
    medium: zones.filter((z) => z.activityLevel === "medium").length,
    high: zones.filter((z) => z.activityLevel === "high").length,
    critical: zones.filter((z) => z.activityLevel === "critical").length,
  };

  const occupancyPercent = Math.min(
    (totalAttendees / venueCapacity) * 100,
    100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Session Engagement
              </CardTitle>
              <CardDescription>
                Real-time engagement monitoring across all sessions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated{" "}
                  {formatDistanceToNow(new Date(lastUpdated), {
                    addSuffix: true,
                  })}
                </span>
              )}
              {isConnected ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-600 border-green-200"
                >
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-600 border-red-200"
                >
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </Badge>
              )}
              {!isJoined && isConnected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={joinHeatmap}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")}
                  />
                  Connect
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Critical Alert */}
      {criticalZones.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
              <div>
                <p className="font-medium text-red-700">
                  {criticalZones.length} session(s) with high activity
                </p>
                <p className="text-sm text-red-600">
                  {criticalZones.map((z) => z.zoneName).join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-2xl font-bold">{totalAttendees}</p>
                <p className="text-xs text-muted-foreground">
                  Total Engagement
                </p>
                <Progress value={occupancyPercent} className="h-1.5 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{zones.length}</p>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <ActivityIndicator level={overallActivity} />
                <p className="text-xs text-muted-foreground mt-1">
                  Overall Activity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <ActivityDot level="critical" />
                <span className="text-xs">{zoneCounts.critical}</span>
              </div>
              <div className="flex items-center gap-1">
                <ActivityDot level="high" />
                <span className="text-xs">{zoneCounts.high}</span>
              </div>
              <div className="flex items-center gap-1">
                <ActivityDot level="medium" />
                <span className="text-xs">{zoneCounts.medium}</span>
              </div>
              <div className="flex items-center gap-1">
                <ActivityDot level="low" />
                <span className="text-xs">{zoneCounts.low}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Session Distribution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Zone Grid */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h3 className="font-semibold">Session Activity</h3>
            <div className="flex gap-2">
              <Select
                value={filterLevel}
                onValueChange={(v) =>
                  setFilterLevel(v as ActivityLevel | "all")
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">By Activity</SelectItem>
                  <SelectItem value="engagement">By Engagement</SelectItem>
                  <SelectItem value="name">By Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredZones.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {isJoined
                  ? "Session engagement data will appear here as attendees interact."
                  : "Connect to start receiving session engagement data."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredZones.map((zone) => (
                <HeatmapZoneCard
                  key={zone.zoneId}
                  zone={zone}
                  maxAttendees={Math.ceil(venueCapacity / zones.length)}
                  onClick={onZoneClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
