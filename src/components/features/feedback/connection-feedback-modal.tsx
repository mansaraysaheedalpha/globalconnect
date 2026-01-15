// src/components/features/feedback/connection-feedback-modal.tsx
"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, Loader2, CheckCircle2, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Connection {
  id: string;
  otherUserId: string;
  otherUserName: string;
  eventId: string;
  connectedAt: string;
}

export interface ConnectionFeedbackData {
  connectionId: string;
  rating: number;
  wasValuable?: boolean;
  willFollowUp?: boolean;
  wouldRecommend?: boolean;
  positiveFactors?: string[];
  negativeFactors?: string[];
  comments?: string;
}

interface ConnectionFeedbackModalProps {
  connection: Connection;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: ConnectionFeedbackData) => Promise<void>;
}

const POSITIVE_FACTORS = [
  { id: "shared_interests", label: "Shared interests" },
  { id: "goal_alignment", label: "Aligned goals" },
  { id: "good_conversation", label: "Great conversation" },
  { id: "valuable_insights", label: "Valuable insights" },
  { id: "potential_collaboration", label: "Potential collaboration" },
  { id: "career_opportunity", label: "Career opportunity" },
] as const;

const NEGATIVE_FACTORS = [
  { id: "not_relevant", label: "Not relevant to my goals" },
  { id: "wrong_industry", label: "Different industry" },
  { id: "awkward_interaction", label: "Awkward interaction" },
  { id: "no_common_ground", label: "No common ground" },
  { id: "already_knew", label: "Already knew them" },
] as const;

/**
 * ConnectionFeedbackModal collects user feedback on a networking connection.
 *
 * Features:
 * - Star rating (1-5)
 * - Yes/No questions for valuable, follow-up, recommend
 * - Factor selection (positive/negative based on rating)
 * - Optional comments
 *
 * Accessibility:
 * - Keyboard navigable
 * - ARIA labels for interactive elements
 * - Focus management
 */
export const ConnectionFeedbackModal = ({
  connection,
  isOpen,
  onClose,
  onSubmit,
}: ConnectionFeedbackModalProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [wasValuable, setWasValuable] = useState<boolean | null>(null);
  const [willFollowUp, setWillFollowUp] = useState<boolean | null>(null);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we should show positive or negative factors
  const showPositiveFactors = rating >= 4;
  const showNegativeFactors = rating > 0 && rating <= 2;
  const factors = showPositiveFactors
    ? POSITIVE_FACTORS
    : showNegativeFactors
      ? NEGATIVE_FACTORS
      : [];

  // Reset form when connection changes
  React.useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredRating(0);
      setWasValuable(null);
      setWillFollowUp(null);
      setWouldRecommend(null);
      setSelectedFactors([]);
      setComments("");
      setIsSubmitted(false);
      setError(null);
    }
  }, [isOpen, connection.id]);

  // Handle factor toggle
  const toggleFactor = useCallback((factorId: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factorId)
        ? prev.filter((f) => f !== factorId)
        : [...prev, factorId]
    );
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const feedbackData: ConnectionFeedbackData = {
        connectionId: connection.id,
        rating,
        wasValuable: wasValuable ?? undefined,
        willFollowUp: willFollowUp ?? undefined,
        wouldRecommend: wouldRecommend ?? undefined,
        positiveFactors: showPositiveFactors ? selectedFactors : undefined,
        negativeFactors: showNegativeFactors ? selectedFactors : undefined,
        comments: comments.trim() || undefined,
      };

      await onSubmit(feedbackData);
      setIsSubmitted(true);

      // Close after success animation
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("[Feedback] Submit failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    connection.id,
    rating,
    wasValuable,
    willFollowUp,
    wouldRecommend,
    selectedFactors,
    comments,
    showPositiveFactors,
    showNegativeFactors,
    onSubmit,
    onClose,
  ]);

  // Success state
  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Thank You!</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Your feedback helps us improve recommendations for everyone.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How was your connection?</DialogTitle>
          <DialogDescription>
            Tell us about your interaction with {connection.otherUserName}
          </DialogDescription>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Overall Experience</Label>
            <div
              className="flex items-center gap-1"
              role="radiogroup"
              aria-label="Rating"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                  aria-pressed={rating === star}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoveredRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  <>
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Great"}
                    {rating === 5 && "Excellent"}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Quick Questions - Show after rating */}
          {rating > 0 && (
            <>
              {/* Was it valuable? */}
              <div className="space-y-2">
                <Label>Was this connection valuable to you?</Label>
                <div className="flex gap-3">
                  <Button
                    variant={wasValuable === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWasValuable(true)}
                    className="flex-1"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Yes
                  </Button>
                  <Button
                    variant={wasValuable === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWasValuable(false)}
                    className="flex-1"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    No
                  </Button>
                </div>
              </div>

              {/* Will you follow up? */}
              <div className="space-y-2">
                <Label>Will you follow up with this person?</Label>
                <RadioGroup
                  value={
                    willFollowUp === null ? "" : willFollowUp ? "yes" : "no"
                  }
                  onValueChange={(v: string) => setWillFollowUp(v === "yes")}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="followup-yes" />
                      <Label htmlFor="followup-yes" className="font-normal">
                        Yes, definitely
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="followup-no" />
                      <Label htmlFor="followup-no" className="font-normal">
                        Probably not
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Factors - contextual based on rating */}
              {factors.length > 0 && (
                <div className="space-y-2">
                  <Label>
                    {showPositiveFactors
                      ? "What made it great?"
                      : "What could have been better?"}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {factors.map((factor) => (
                      <Button
                        key={factor.id}
                        variant={
                          selectedFactors.includes(factor.id)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleFactor(factor.id)}
                        className={cn(
                          "h-auto py-1.5 px-3",
                          selectedFactors.includes(factor.id) &&
                            showPositiveFactors &&
                            "bg-green-600 hover:bg-green-700",
                          selectedFactors.includes(factor.id) &&
                            showNegativeFactors &&
                            "bg-orange-600 hover:bg-orange-700"
                        )}
                      >
                        {factor.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="space-y-2">
                <Label htmlFor="comments">
                  Additional comments{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Share any other thoughts about this connection..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {comments.length}/500
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionFeedbackModal;
