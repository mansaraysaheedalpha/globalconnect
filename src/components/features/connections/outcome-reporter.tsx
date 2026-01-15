// src/components/features/connections/outcome-reporter.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Calendar,
  Briefcase,
  Handshake,
  DollarSign,
  GraduationCap,
  Star,
  Loader2,
} from "lucide-react";

export type OutcomeType =
  | "MEETING_HELD"
  | "JOB_REFERRAL"
  | "PARTNERSHIP"
  | "SALE_DEAL"
  | "MENTORSHIP"
  | "OTHER";

interface OutcomeOption {
  type: OutcomeType;
  icon: React.ElementType;
  label: string;
  description: string;
}

const outcomeOptions: OutcomeOption[] = [
  {
    type: "MEETING_HELD",
    icon: Calendar,
    label: "Had a meeting",
    description: "Scheduled and completed a follow-up meeting",
  },
  {
    type: "JOB_REFERRAL",
    icon: Briefcase,
    label: "Job referral",
    description: "Received or gave a job referral",
  },
  {
    type: "PARTNERSHIP",
    icon: Handshake,
    label: "Partnership",
    description: "Started a business partnership or collaboration",
  },
  {
    type: "SALE_DEAL",
    icon: DollarSign,
    label: "Sale/Deal",
    description: "Closed a sale or business deal",
  },
  {
    type: "MENTORSHIP",
    icon: GraduationCap,
    label: "Mentorship",
    description: "Started a mentorship relationship",
  },
  {
    type: "OTHER",
    icon: Star,
    label: "Other",
    description: "Another positive outcome from this connection",
  },
];

export interface OutcomeData {
  outcomeType: OutcomeType;
  outcomeNotes?: string;
  meetingScheduled?: boolean;
  meetingDate?: string;
}

interface OutcomeReporterProps {
  connectionId: string;
  otherUserName: string;
  /** Controlled mode: external open state */
  open?: boolean;
  /** Controlled mode: callback when dialog wants to close */
  onOpenChange?: (open: boolean) => void;
  /** Callback when outcome is submitted (controlled mode) */
  onSubmit?: (outcome: OutcomeData) => void;
  /** Legacy callback - use onSubmit instead for controlled mode */
  onReportOutcome?: (
    connectionId: string,
    outcome: OutcomeData
  ) => Promise<void>;
}

export const OutcomeReporter = ({
  connectionId,
  otherUserName,
  open: controlledOpen,
  onOpenChange,
  onSubmit,
  onReportOutcome,
}: OutcomeReporterProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeType | null>(null);
  const [notes, setNotes] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    }
    if (!isControlled) {
      setInternalOpen(value);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOutcome) return;

    const outcomeData: OutcomeData = {
      outcomeType: selectedOutcome,
      outcomeNotes: notes || undefined,
      meetingScheduled: selectedOutcome === "MEETING_HELD",
      meetingDate: meetingDate || undefined,
    };

    setIsSubmitting(true);
    try {
      // Support both callback patterns
      if (onSubmit) {
        onSubmit(outcomeData);
      } else if (onReportOutcome) {
        await onReportOutcome(connectionId, outcomeData);
      }
      setOpen(false);
      // Reset form
      setSelectedOutcome(null);
      setNotes("");
      setMeetingDate("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {/* Only show trigger when in uncontrolled mode */}
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trophy className="h-4 w-4 mr-1" />
            Report Outcome
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Did this connection lead to something?</DialogTitle>
          <DialogDescription>
            Report the outcome of your connection with {otherUserName}. This
            helps measure networking impact and improve recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-4">
          {outcomeOptions.map(({ type, icon: Icon, label, description }) => (
            <Button
              key={type}
              variant={selectedOutcome === type ? "default" : "outline"}
              className="h-auto py-3 flex-col items-center justify-center text-center"
              onClick={() => setSelectedOutcome(type)}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-sm font-medium">{label}</span>
            </Button>
          ))}
        </div>

        {selectedOutcome === "MEETING_HELD" && (
          <div className="space-y-2">
            <Label htmlFor="meetingDate">Meeting Date (optional)</Label>
            <Input
              id="meetingDate"
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Tell us more (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any details about this outcome..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedOutcome || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Outcome"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
