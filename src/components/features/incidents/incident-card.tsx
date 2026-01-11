// src/components/features/incidents/incident-card.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ShieldAlert,
  Heart,
  Wrench,
  Lock,
  Accessibility,
  User,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Incident,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  INCIDENT_TYPE_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_STATUS_COLORS,
} from "@/types/incident.types";
import { cn } from "@/lib/utils";

interface IncidentCardProps {
  incident: Incident;
  onClick?: (incident: Incident) => void;
  showActions?: boolean;
  onAcknowledge?: (incidentId: string) => void;
  onInvestigate?: (incidentId: string) => void;
  onResolve?: (incidentId: string) => void;
  isUpdating?: boolean;
  className?: string;
}

const INCIDENT_TYPE_ICONS: Record<IncidentType, React.ReactNode> = {
  [IncidentType.HARASSMENT]: <ShieldAlert className="h-5 w-5" />,
  [IncidentType.MEDICAL]: <Heart className="h-5 w-5" />,
  [IncidentType.TECHNICAL]: <Wrench className="h-5 w-5" />,
  [IncidentType.SECURITY]: <Lock className="h-5 w-5" />,
  [IncidentType.ACCESSIBILITY]: <Accessibility className="h-5 w-5" />,
};

export function IncidentCard({
  incident,
  onClick,
  showActions = false,
  onAcknowledge,
  onInvestigate,
  onResolve,
  isUpdating = false,
  className,
}: IncidentCardProps) {
  const severityColors = INCIDENT_SEVERITY_COLORS[incident.severity];
  const statusColors = INCIDENT_STATUS_COLORS[incident.status];

  const reporterName =
    incident.reporter.firstName && incident.reporter.lastName
      ? `${incident.reporter.firstName} ${incident.reporter.lastName}`
      : "Anonymous";

  const timeAgo = formatDistanceToNow(new Date(incident.createdAt), {
    addSuffix: true,
  });

  const isCritical = incident.severity === IncidentSeverity.CRITICAL;
  const isResolved = incident.status === IncidentStatus.RESOLVED;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md",
        isCritical && !isResolved && "border-red-300 dark:border-red-800",
        className
      )}
      onClick={() => onClick?.(incident)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                isCritical && !isResolved
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {INCIDENT_TYPE_ICONS[incident.type]}
            </div>
            <div>
              <h3 className="font-medium leading-none">
                {INCIDENT_TYPE_LABELS[incident.type]}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="outline"
              className={cn(
                "border",
                severityColors.bg,
                severityColors.text,
                severityColors.border
              )}
            >
              {INCIDENT_SEVERITY_LABELS[incident.severity]}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "border",
                statusColors.bg,
                statusColors.text,
                statusColors.border
              )}
            >
              {INCIDENT_STATUS_LABELS[incident.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {incident.details}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Reported by {reporterName}</span>
          </div>

          {onClick && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {showActions && !isResolved && (
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
            {incident.status === IncidentStatus.REPORTED && onAcknowledge && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onAcknowledge(incident.id);
                }}
                disabled={isUpdating}
              >
                Acknowledge
              </Button>
            )}
            {incident.status === IncidentStatus.ACKNOWLEDGED &&
              onInvestigate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInvestigate(incident.id);
                  }}
                  disabled={isUpdating}
                >
                  Start Investigation
                </Button>
              )}
            {(incident.status === IncidentStatus.ACKNOWLEDGED ||
              incident.status === IncidentStatus.INVESTIGATING) &&
              onResolve && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolve(incident.id);
                  }}
                  disabled={isUpdating}
                >
                  Resolve
                </Button>
              )}
          </div>
        )}

        {incident.resolutionNotes && (
          <div className="mt-4 rounded-md bg-green-50 dark:bg-green-900/20 p-3 border-t">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
              Resolution Notes
            </p>
            <p className="text-sm text-green-600 dark:text-green-300">
              {incident.resolutionNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default IncidentCard;
