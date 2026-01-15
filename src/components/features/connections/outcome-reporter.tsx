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

interface OutcomeReporterProps {
  connectionId: string;
  otherUserName: string;
  onReportOutcome: (
    connectionId: string,
    outcome: {
      outcomeType: OutcomeType;
      outcomeNotes?: string;
      meetingScheduled?: boolean;
      meetingDate?: string;
    }
  ) => Promise<void>;
}

export const OutcomeReporter = ({
  connectionId,
  otherUserName,
  onReportOutcome,
}: OutcomeReporterProps) => {
  const [open, setOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeType | null>(null);
  const [notes, setNotes] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOutcome) return;

    setIsSubmitting(true);
    try {
      await onReportOutcome(connectionId, {
        outcomeType: selectedOutcome,
        outcomeNotes: notes || undefined,
        meetingScheduled: selectedOutcome === "MEETING_HELD",
        meetingDate: meetingDate || undefined,
      });
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trophy className="h-4 w-4 mr-1" />
          Report Outcome
        </Button>
      </DialogTrigger>
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
