// src/components/features/incidents/incident-report-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShieldAlert,
  Heart,
  Wrench,
  Lock,
  Accessibility,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
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
  DialogTrigger,
  DialogFooter,
  DialogIcon,
} from "@/components/ui/dialog";
import { useIncidentReporting } from "@/hooks/use-incident-reporting";
import {
  IncidentType,
  IncidentSeverity,
  INCIDENT_TYPE_LABELS,
  INCIDENT_TYPE_DESCRIPTIONS,
  INCIDENT_SEVERITY_LABELS,
} from "@/types/incident.types";
import { cn } from "@/lib/utils";

const incidentFormSchema = z.object({
  type: z.nativeEnum(IncidentType, {
    required_error: "Please select an incident type",
  }),
  severity: z.nativeEnum(IncidentSeverity, {
    required_error: "Please select a severity level",
  }),
  details: z
    .string()
    .min(10, "Please provide at least 10 characters of detail")
    .max(2000, "Details must not exceed 2000 characters"),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface IncidentReportFormProps {
  sessionId: string;
  eventId?: string;
  trigger?: React.ReactNode;
  className?: string;
}

const INCIDENT_TYPE_ICONS: Record<IncidentType, React.ReactNode> = {
  [IncidentType.HARASSMENT]: <ShieldAlert className="h-4 w-4" />,
  [IncidentType.MEDICAL]: <Heart className="h-4 w-4" />,
  [IncidentType.TECHNICAL]: <Wrench className="h-4 w-4" />,
  [IncidentType.SECURITY]: <Lock className="h-4 w-4" />,
  [IncidentType.ACCESSIBILITY]: <Accessibility className="h-4 w-4" />,
};

export function IncidentReportForm({
  sessionId,
  eventId,
  trigger,
  className,
}: IncidentReportFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    isConnected,
    isReporting,
    reportSuccess,
    reportError,
    reportIncident,
    resetReport,
  } = useIncidentReporting({ sessionId, eventId });

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      details: "",
    },
  });

  const onSubmit = async (values: IncidentFormValues) => {
    const response = await reportIncident(values);

    if (response.success) {
      setShowSuccess(true);
      form.reset();

      // Auto-close after showing success
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
        resetReport();
      }, 3000);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      resetReport();
      setShowSuccess(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <AlertTriangle className="h-4 w-4" />
      Report Issue
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className={cn("sm:max-w-md", className)}>
        {showSuccess ? (
          <>
            <DialogIcon variant="success">
              <CheckCircle className="h-6 w-6" />
            </DialogIcon>
            <DialogHeader>
              <DialogTitle>Report Submitted</DialogTitle>
              <DialogDescription>
                Your incident report has been submitted successfully. Our team
                has been notified and will take appropriate action.
              </DialogDescription>
            </DialogHeader>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report an Issue</DialogTitle>
              <DialogDescription>
                Let us know about any issues you're experiencing. Your report
                will be reviewed by our team.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(IncidentType).map((type) => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                {INCIDENT_TYPE_ICONS[type]}
                                <span>{INCIDENT_TYPE_LABELS[type]}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.value && (
                        <FormDescription>
                          {INCIDENT_TYPE_DESCRIPTIONS[field.value]}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(IncidentSeverity).map((severity) => (
                            <SelectItem key={severity} value={severity}>
                              <div className="flex items-center gap-2">
                                <SeverityIndicator severity={severity} />
                                <span>{INCIDENT_SEVERITY_LABELS[severity]}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe the issue in detail..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Provide as much detail as possible</span>
                        <span
                          className={cn(
                            "text-xs",
                            field.value.length > 1800
                              ? "text-destructive"
                              : "text-muted-foreground"
                          )}
                        >
                          {field.value.length}/2000
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {reportError && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {reportError}
                  </div>
                )}

                {!isConnected && (
                  <div className="rounded-md bg-yellow-100 dark:bg-yellow-900/30 p-3 text-sm text-yellow-700 dark:text-yellow-400">
                    Connecting to reporting service...
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isReporting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isReporting || !isConnected}
                    className="gap-2"
                  >
                    {isReporting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isReporting ? "Submitting..." : "Submit Report"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SeverityIndicator({ severity }: { severity: IncidentSeverity }) {
  const colors: Record<IncidentSeverity, string> = {
    [IncidentSeverity.LOW]: "bg-slate-400",
    [IncidentSeverity.MEDIUM]: "bg-yellow-500",
    [IncidentSeverity.HIGH]: "bg-orange-500",
    [IncidentSeverity.CRITICAL]: "bg-red-500",
  };

  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", colors[severity])}
    />
  );
}

export default IncidentReportForm;
