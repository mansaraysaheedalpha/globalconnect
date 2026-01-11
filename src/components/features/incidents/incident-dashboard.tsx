// src/components/features/incidents/incident-dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Filter,
  X,
  Wifi,
  WifiOff,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IncidentCard } from "./incident-card";
import { IncidentStatusDialog } from "./incident-status-dialog";
import { useIncidentManagement } from "@/hooks/use-incident-management";
import {
  Incident,
  IncidentStatus,
  IncidentSeverity,
  IncidentType,
  IncidentUpdateStatus,
  INCIDENT_STATUS_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_TYPE_LABELS,
} from "@/types/incident.types";
import { cn } from "@/lib/utils";

interface IncidentDashboardProps {
  eventId?: string;
  className?: string;
}

export function IncidentDashboard({
  eventId,
  className,
}: IncidentDashboardProps) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const {
    isConnected,
    isLoading,
    error,
    filters,
    filteredIncidents,
    activeIncidentsCount,
    criticalIncidentsCount,
    isUpdating,
    updateError,
    updateIncidentStatus,
    acknowledgeIncident,
    startInvestigation,
    resolveIncident,
    setFilters,
    clearFilters,
    clearUpdateError,
  } = useIncidentManagement();

  // Filter incidents by event if provided
  const displayedIncidents = eventId
    ? filteredIncidents.filter((i) => i.eventId === eventId)
    : filteredIncidents;

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (
    incidentId: string,
    status: IncidentUpdateStatus,
    resolutionNotes?: string
  ) => {
    const result = await updateIncidentStatus(incidentId, status, resolutionNotes);
    if (result.success) {
      // Update selected incident to reflect changes
      const updated = filteredIncidents.find((i) => i.id === incidentId);
      if (updated) {
        setSelectedIncident(updated);
      }
    }
    return result;
  };

  const handleStatusFilterChange = (value: string) => {
    if (value === "all") {
      setFilters({ status: undefined });
    } else {
      setFilters({ status: [value as IncidentStatus] });
    }
  };

  const handleSeverityFilterChange = (value: string) => {
    if (value === "all") {
      setFilters({ severity: undefined });
    } else {
      setFilters({ severity: [value as IncidentSeverity] });
    }
  };

  const handleTypeFilterChange = (value: string) => {
    if (value === "all") {
      setFilters({ type: undefined });
    } else {
      setFilters({ type: [value as IncidentType] });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ searchQuery: e.target.value });
  };

  const hasActiveFilters =
    filters.status ||
    filters.severity ||
    filters.type ||
    filters.searchQuery;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          <div>
            <h2 className="text-lg font-semibold">Incident Management</h2>
            <p className="text-sm text-muted-foreground">
              Monitor and respond to reported incidents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status */}
          <Badge
            variant="outline"
            className={cn(
              "gap-1",
              isConnected
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-accent")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0">
                !
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatsCard
          title="Total Incidents"
          value={displayedIncidents.length}
          variant="default"
        />
        <StatsCard
          title="Active"
          value={activeIncidentsCount}
          variant="warning"
        />
        <StatsCard
          title="Critical"
          value={criticalIncidentsCount}
          variant="critical"
        />
        <StatsCard
          title="Resolved"
          value={
            displayedIncidents.filter((i) => i.status === IncidentStatus.RESOLVED)
              .length
          }
          variant="success"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search incidents..."
                    value={filters.searchQuery || ""}
                    onChange={handleSearchChange}
                    className="pl-9"
                  />
                </div>
              </div>

              <Select
                value={filters.status?.[0] || "all"}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(IncidentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {INCIDENT_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.severity?.[0] || "all"}
                onValueChange={handleSeverityFilterChange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  {Object.values(IncidentSeverity).map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {INCIDENT_SEVERITY_LABELS[severity]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.type?.[0] || "all"}
                onValueChange={handleTypeFilterChange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.values(IncidentType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {INCIDENT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error display */}
      {(error || updateError) && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <span>{error || updateError}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearUpdateError()}
            className="h-auto p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Incidents list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : displayedIncidents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg mb-1">No incidents found</h3>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "No incidents have been reported yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {displayedIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onClick={handleIncidentClick}
                showActions
                onAcknowledge={acknowledgeIncident}
                onInvestigate={startInvestigation}
                onResolve={(id) => {
                  setSelectedIncident(incident);
                  setIsDialogOpen(true);
                }}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Status update dialog */}
      <IncidentStatusDialog
        incident={selectedIncident}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdating}
      />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  variant: "default" | "warning" | "critical" | "success";
}

function StatsCard({ title, value, variant }: StatsCardProps) {
  const variants = {
    default: "bg-muted",
    warning: "bg-yellow-100 dark:bg-yellow-900/30",
    critical: "bg-red-100 dark:bg-red-900/30",
    success: "bg-green-100 dark:bg-green-900/30",
  };

  const textVariants = {
    default: "text-foreground",
    warning: "text-yellow-700 dark:text-yellow-400",
    critical: "text-red-700 dark:text-red-400",
    success: "text-green-700 dark:text-green-400",
  };

  return (
    <Card className={cn("border-0", variants[variant])}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", textVariants[variant])}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export default IncidentDashboard;
