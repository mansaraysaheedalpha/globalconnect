// src/components/features/incidents/incident-status-dialog.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import {
  ShieldAlert,
  Heart,
  Wrench,
  Lock,
  Accessibility,
  User,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Incident,
  IncidentType,
  IncidentStatus,
  IncidentUpdateStatus,
  INCIDENT_TYPE_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_STATUS_COLORS,
} from "@/types/incident.types";
import { cn } from "@/lib/utils";

const updateStatusSchema = z.object({
  status: z.nativeEnum(IncidentUpdateStatus, {
    required_error: "Please select a status",
  }),
  resolutionNotes: z
    .string()
    .max(2000, "Resolution notes must not exceed 2000 characters")
    .optional(),
});

type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;

interface IncidentStatusDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (
    incidentId: string,
    status: IncidentUpdateStatus,
    resolutionNotes?: string
  ) => Promise<{ success: boolean; error?: string }>;
  isUpdating?: boolean;
}

const INCIDENT_TYPE_ICONS: Record<IncidentType, React.ReactNode> = {
  [IncidentType.HARASSMENT]: <ShieldAlert className="h-5 w-5" />,
  [IncidentType.MEDICAL]: <Heart className="h-5 w-5" />,
  [IncidentType.TECHNICAL]: <Wrench className="h-5 w-5" />,
  [IncidentType.SECURITY]: <Lock className="h-5 w-5" />,
  [IncidentType.ACCESSIBILITY]: <Accessibility className="h-5 w-5" />,
};

const STATUS_ICONS: Record<IncidentUpdateStatus, React.ReactNode> = {
  [IncidentUpdateStatus.ACKNOWLEDGED]: <AlertCircle className="h-4 w-4" />,
  [IncidentUpdateStatus.INVESTIGATING]: <Search className="h-4 w-4" />,
  [IncidentUpdateStatus.RESOLVED]: <CheckCircle className="h-4 w-4" />,
};

export function IncidentStatusDialog({
  incident,
  open,
  onOpenChange,
  onUpdateStatus,
  isUpdating = false,
}: IncidentStatusDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      resolutionNotes: "",
    },
  });

  const selectedStatus = form.watch("status");

  const onSubmit = async (values: UpdateStatusFormValues) => {
    if (!incident) return;

    setError(null);
    const response = await onUpdateStatus(
      incident.id,
      values.status,
      values.resolutionNotes || undefined
    );

    if (response.success) {
      form.reset();
      onOpenChange(false);
    } else {
      setError(response.error || "Failed to update incident status");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setError(null);
    }
    onOpenChange(open);
  };

  if (!incident) return null;

  const severityColors = INCIDENT_SEVERITY_COLORS[incident.severity];
  const statusColors = INCIDENT_STATUS_COLORS[incident.status];

  const reporterName =
    incident.reporter.firstName && incident.reporter.lastName
      ? `${incident.reporter.firstName} ${incident.reporter.lastName}`
      : "Anonymous";

  const timeAgo = formatDistanceToNow(new Date(incident.createdAt), {
    addSuffix: true,
  });

  // Determine available status transitions
  const availableStatuses = getAvailableStatusTransitions(incident.status);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              {INCIDENT_TYPE_ICONS[incident.type]}
            </div>
            <div>
              <DialogTitle>
                {INCIDENT_TYPE_LABELS[incident.type]} Incident
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3" />
                Reported {timeAgo}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Incident details */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn(
                "border",
                severityColors.bg,
                severityColors.text,
                severityColors.border
              )}
            >
              {INCIDENT_SEVERITY_LABELS[incident.severity]} Severity
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

          <div className="rounded-lg border p-4">
            <h4 className="text-sm font-medium mb-2">Details</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {incident.details}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Reported by {reporterName}</span>
          </div>

          {incident.status !== IncidentStatus.RESOLVED && (
            <>
              <hr className="my-4" />

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Update Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                <div className="flex items-center gap-2">
                                  {STATUS_ICONS[status]}
                                  <span>
                                    {
                                      INCIDENT_STATUS_LABELS[
                                        status as IncidentStatus
                                      ]
                                    }
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedStatus === IncidentUpdateStatus.RESOLVED && (
                    <FormField
                      control={form.control}
                      name="resolutionNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resolution Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe how the incident was resolved..."
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenChange(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdating || !selectedStatus}
                      className="gap-2"
                    >
                      {isUpdating && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {isUpdating ? "Updating..." : "Update Status"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          )}

          {incident.status === IncidentStatus.RESOLVED &&
            incident.resolutionNotes && (
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Resolution Notes
                </h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {incident.resolutionNotes}
                </p>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getAvailableStatusTransitions(
  currentStatus: IncidentStatus
): IncidentUpdateStatus[] {
  switch (currentStatus) {
    case IncidentStatus.REPORTED:
      return [
        IncidentUpdateStatus.ACKNOWLEDGED,
        IncidentUpdateStatus.INVESTIGATING,
        IncidentUpdateStatus.RESOLVED,
      ];
    case IncidentStatus.ACKNOWLEDGED:
      return [
        IncidentUpdateStatus.INVESTIGATING,
        IncidentUpdateStatus.RESOLVED,
      ];
    case IncidentStatus.INVESTIGATING:
      return [IncidentUpdateStatus.RESOLVED];
    case IncidentStatus.RESOLVED:
      return [];
    default:
      return [];
  }
}

export default IncidentStatusDialog;
