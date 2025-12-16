// src/components/features/waitlist-offer-modal.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WaitlistOffer } from "@/hooks/use-session-waitlist";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader, Clock, PartyPopper, X } from "lucide-react";

interface WaitlistOfferModalProps {
  offer: WaitlistOffer | null;
  onAccept: (offer: WaitlistOffer) => Promise<boolean>;
  onDecline: () => void;
  isLoading?: boolean;
}

export const WaitlistOfferModal = ({
  offer,
  onAccept,
  onDecline,
  isLoading = false,
}: WaitlistOfferModalProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Calculate and update time remaining
  useEffect(() => {
    if (!offer) {
      setTimeRemaining(0);
      setIsExpired(false);
      return;
    }

    const calculateTimeRemaining = () => {
      const expiresAt = new Date(offer.expires_at).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setIsExpired(true);
      }
    };

    // Initial calculation
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [offer]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Handle accept button click
  const handleAccept = async () => {
    if (!offer || isExpired) return;
    await onAccept(offer);
  };

  // Get urgency level for styling
  const getUrgencyLevel = (): "normal" | "warning" | "critical" => {
    if (timeRemaining <= 30) return "critical";
    if (timeRemaining <= 60) return "warning";
    return "normal";
  };

  const urgency = getUrgencyLevel();

  if (!offer) return null;

  return (
    <Dialog open={!!offer} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            {offer.title}
          </DialogTitle>
          <DialogDescription>{offer.message}</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Timer Display */}
          {!isExpired ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock
                  className={`h-5 w-5 ${
                    urgency === "critical"
                      ? "text-red-500 animate-pulse"
                      : urgency === "warning"
                      ? "text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  Offer expires in
                </span>
              </div>
              <div
                className={`text-4xl font-mono font-bold ${
                  urgency === "critical"
                    ? "text-red-500"
                    : urgency === "warning"
                    ? "text-yellow-500"
                    : "text-foreground"
                }`}
              >
                {formatTime(timeRemaining)}
              </div>
              {urgency === "critical" && (
                <p className="text-sm text-red-500 mt-2 animate-pulse">
                  Hurry! Time is almost up!
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <X className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-red-500">Offer Expired</p>
              <p className="text-sm text-muted-foreground mt-1">
                This offer has expired. You remain on the waitlist for future
                openings.
              </p>
            </div>
          )}
        </div>

        {/* Progress bar for time remaining */}
        {!isExpired && (
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                urgency === "critical"
                  ? "bg-red-500"
                  : urgency === "warning"
                  ? "bg-yellow-500"
                  : "bg-primary"
              }`}
              style={{
                width: `${Math.min(100, (timeRemaining / 300) * 100)}%`, // 300 seconds = 5 minutes max
              }}
            />
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:justify-center">
          {!isExpired ? (
            <>
              <Button
                variant="outline"
                onClick={onDecline}
                disabled={isLoading}
              >
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isLoading || isExpired}
                className={
                  urgency === "critical"
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : ""
                }
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  "Accept & Join"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={onDecline}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
