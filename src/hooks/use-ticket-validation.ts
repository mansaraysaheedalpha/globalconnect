// src/hooks/use-ticket-validation.ts
"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { CHECK_IN_TICKET_MUTATION } from "@/graphql/payments.graphql";

export interface ValidationResult {
  isValid: boolean;
  ticketCode: string;
  validatedAt: string;
  errorReason: string | null;
}

interface UseTicketValidationOptions {
  // Options kept for compatibility but no longer used for internal API key
}

export function useTicketValidation(options: UseTicketValidationOptions = {}) {
  const [lastResult, setLastResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [checkInTicket, { loading }] = useMutation(CHECK_IN_TICKET_MUTATION);

  /**
   * Validates a ticket code for a specific event.
   * This performs a one-time check-in - if the ticket is valid and not
   * already used, it will be marked as checked in.
   *
   * @param eventId - The event ID to validate against
   * @param ticketCode - The ticket code (format: XXX-XXX-XX)
   * @returns ValidationResult indicating success/failure
   */
  const validateTicket = useCallback(
    async (eventId: string, ticketCode: string): Promise<ValidationResult> => {
      setError(null);

      try {
        const { data } = await checkInTicket({
          variables: {
            input: {
              ticketCode: ticketCode.toUpperCase().trim(),
              eventId,
              location: "Organizer Dashboard", // Default location
            },
          },
        });

        const ticket = data?.checkInTicket;

        if (!ticket) {
          throw new Error("Invalid response from server");
        }

        const result: ValidationResult = {
          isValid: true,
          ticketCode: ticket.ticketCode,
          validatedAt: ticket.checkedInAt || new Date().toISOString(),
          errorReason: null,
        };

        setLastResult(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to validate ticket";
        setError(errorMessage);
        console.error("[useTicketValidation] Error:", errorMessage);

        // Return an error result
        const errorResult: ValidationResult = {
          isValid: false,
          ticketCode,
          validatedAt: new Date().toISOString(),
          errorReason: errorMessage,
        };
        setLastResult(errorResult);
        return errorResult;
      }
    },
    [checkInTicket]
  );

  /**
   * Resets the validation state
   */
  const reset = useCallback(() => {
    setLastResult(null);
    setError(null);
  }, []);

  /**
   * Validates the ticket code format (XXX-XXX-XX)
   */
  const isValidTicketFormat = useCallback((ticketCode: string): boolean => {
    const pattern = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{2}$/i;
    return pattern.test(ticketCode.trim());
  }, []);

  return {
    loading,
    lastResult,
    error,
    validateTicket,
    reset,
    isValidTicketFormat,
  };
}