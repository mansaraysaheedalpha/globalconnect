// src/components/features/sessions/SessionRsvpButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, Users, X } from "lucide-react";
import {
  RSVP_TO_SESSION_MUTATION,
  CANCEL_SESSION_RSVP_MUTATION,
} from "@/graphql/attendee.graphql";
import { cn } from "@/lib/utils";

export interface SessionRsvpButtonProps {
  sessionId: string;
  eventId?: string;
  isRsvped?: boolean;
  currentCapacity?: number;
  maxCapacity?: number | null;
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  onRsvpChange?: (isRsvped: boolean) => void;
}

export function SessionRsvpButton({
  sessionId,
  eventId,
  isRsvped: initialIsRsvped = false,
  currentCapacity = 0,
  maxCapacity = null,
  className,
  variant = "default",
  size = "default",
  onRsvpChange,
}: SessionRsvpButtonProps) {
  const [isRsvped, setIsRsvped] = useState(initialIsRsvped);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { toast } = useToast();

  // Sync state with prop changes (fix state synchronization bug)
  useEffect(() => {
    setIsRsvped(initialIsRsvped);
  }, [initialIsRsvped]);

  const [rsvpToSession, { loading: rsvpLoading }] = useMutation(
    RSVP_TO_SESSION_MUTATION,
    {
      optimisticResponse: {
        rsvpToSession: {
          __typename: 'RsvpToSessionResponse',
          success: true,
          message: 'Successfully RSVPed',
          rsvp: {
            __typename: 'SessionRsvpType',
            id: `temp-${Date.now()}`,
            sessionId,
            userId: '', // Will be filled by server
            eventId: eventId || '',
            status: 'CONFIRMED',
            rsvpAt: new Date().toISOString(),
          },
        },
      },
      onCompleted: (data) => {
        if (data.rsvpToSession.success) {
          setIsRsvped(true);
          onRsvpChange?.(true);
          toast({
            title: "RSVP confirmed",
            description: data.rsvpToSession.message || "You're booked for this session!",
          });
        } else {
          toast({
            title: "Unable to RSVP",
            description: data.rsvpToSession.message || "Session may be full. Try joining the waitlist.",
            variant: "destructive",
          });
        }
      },
      onError: (error) => {
        toast({
          title: "RSVP failed",
          description: error.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      },
      update: (cache, { data }) => {
        if (!data?.rsvpToSession?.success) return;

        // Update session capacity in cache
        cache.modify({
          id: cache.identify({ __typename: 'Session', id: sessionId }),
          fields: {
            rsvpCount: (prev = 0) => prev + 1,
            rsvpAvailableSpots: (prev = 0) => Math.max(0, prev - 1),
            isSessionFull: (_, { readField }) => {
              const maxParticipants = readField('maxParticipants') as number | null;
              const currentCount = (readField('rsvpCount') as number || 0) + 1;
              return maxParticipants != null && currentCount >= maxParticipants;
            },
          },
        });

        // Update My Schedule query cache if eventId is provided
        if (eventId && data.rsvpToSession.rsvp) {
          const myScheduleQuery = {
            query: gql`
              query GetMySchedule($eventId: ID!) {
                mySchedule(eventId: $eventId) {
                  rsvpId
                  rsvpStatus
                  rsvpAt
                  sessionId
                  title
                  startTime
                  endTime
                  sessionType
                  speakers
                }
              }
            `,
            variables: { eventId },
          };

          try {
            const existingData = cache.readQuery(myScheduleQuery);
            if (existingData?.mySchedule) {
              // Add new RSVP to the schedule (will be fully populated on next fetch)
              cache.writeQuery({
                ...myScheduleQuery,
                data: {
                  mySchedule: [
                    ...existingData.mySchedule,
                    {
                      __typename: 'ScheduleItem',
                      rsvpId: data.rsvpToSession.rsvp.id,
                      rsvpStatus: data.rsvpToSession.rsvp.status,
                      rsvpAt: data.rsvpToSession.rsvp.rsvpAt,
                      sessionId: data.rsvpToSession.rsvp.sessionId,
                      title: '', // Will be populated on refetch
                      startTime: '',
                      endTime: '',
                      sessionType: '',
                      speakers: '',
                    },
                  ],
                },
              });
            }
          } catch {
            // Query not in cache yet - no action needed
          }
        }
      },
    }
  );

  const [cancelRsvp, { loading: cancelLoading }] = useMutation(
    CANCEL_SESSION_RSVP_MUTATION,
    {
      optimisticResponse: {
        cancelSessionRsvp: {
          __typename: 'CancelSessionRsvpResponse',
          success: true,
          message: 'RSVP cancelled successfully',
        },
      },
      onCompleted: (data) => {
        if (data.cancelSessionRsvp.success) {
          setIsRsvped(false);
          onRsvpChange?.(false);
          toast({
            title: "RSVP cancelled",
            description: "Your spot has been freed for others.",
          });
        }
      },
      onError: (error) => {
        toast({
          title: "Cancellation failed",
          description: error.message,
          variant: "destructive",
        });
      },
      update: (cache, { data }) => {
        if (!data?.cancelSessionRsvp?.success) return;

        // Update session capacity in cache
        cache.modify({
          id: cache.identify({ __typename: 'Session', id: sessionId }),
          fields: {
            rsvpCount: (prev = 0) => Math.max(0, prev - 1),
            rsvpAvailableSpots: (prev = 0) => prev + 1,
            isSessionFull: () => false, // Always false after cancellation (spot freed)
          },
        });

        // Remove from My Schedule query cache if eventId is provided
        if (eventId) {
          const myScheduleQuery = {
            query: gql`
              query GetMySchedule($eventId: ID!) {
                mySchedule(eventId: $eventId) {
                  rsvpId
                  rsvpStatus
                  rsvpAt
                  sessionId
                  title
                  startTime
                  endTime
                  sessionType
                  speakers
                }
              }
            `,
            variables: { eventId },
          };

          try {
            const existingData = cache.readQuery(myScheduleQuery);
            if (existingData?.mySchedule) {
              // Remove cancelled session from schedule
              cache.writeQuery({
                ...myScheduleQuery,
                data: {
                  mySchedule: existingData.mySchedule.filter(
                    (item: any) => item.sessionId !== sessionId
                  ),
                },
              });
            }
          } catch {
            // Query not in cache yet - no action needed
          }
        }
      },
    }
  );

  const handleRsvp = async () => {
    if (isRsvped) {
      setShowCancelConfirm(true);
    } else {
      await rsvpToSession({
        variables: {
          input: {
            sessionId,
          },
        },
      });
    }
  };

  const handleCancelConfirm = async () => {
    setShowCancelConfirm(false);
    await cancelRsvp({
      variables: {
        input: {
          sessionId,
        },
      },
    });
  };

  const isFull = maxCapacity != null && currentCapacity >= maxCapacity;
  const isLoading = rsvpLoading || cancelLoading;

  // Calculate capacity display
  const capacityText = maxCapacity != null
    ? `${currentCapacity}/${maxCapacity} seats`
    : `${currentCapacity} attending`;

  return (
    <>
      <div className={cn("flex flex-col gap-1", className)}>
        <Button
          variant={isRsvped ? "secondary" : variant}
          size={size}
          onClick={handleRsvp}
          disabled={isLoading || (!isRsvped && isFull)}
          className={cn(
            isRsvped && "border-green-500/50 bg-green-50 hover:bg-green-100 text-green-700"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isRsvped ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : isFull ? (
            <X className="h-4 w-4 mr-2" />
          ) : (
            <Users className="h-4 w-4 mr-2" />
          )}
          {isLoading
            ? "Processing..."
            : isRsvped
              ? "RSVPed"
              : isFull
                ? "Full"
                : "RSVP"}
        </Button>

        {/* Capacity indicator */}
        {maxCapacity != null && (
          <p className={cn(
            "text-xs text-center",
            isFull ? "text-red-600" : isRsvped ? "text-green-600" : "text-muted-foreground"
          )}>
            {capacityText}
          </p>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel RSVP?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your RSVP for this session? This will
              free up your spot for other attendees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep RSVP</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel RSVP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
