// src/hooks/use-ticket-validation.ts
"use client";

import { useState, useCallback } from "react";

export interface ValidationResult {
  isValid: boolean;
  ticketCode: string;
  validatedAt: string;
  errorReason: string | null;
}

interface UseTicketValidationOptions {
  /**
   * Internal API key for ticket validation endpoint.
   * In production, this should come from environment variables
   * and only be used in server-side or internal admin tools.
   */
  internalApiKey?: string;
}

export function useTicketValidation(options: UseTicketValidationOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setLoading(true);
      setError(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const apiKey =
          options.internalApiKey ||
          process.env.NEXT_PUBLIC_INTERNAL_API_KEY ||
          "";

        const response = await fetch(
          `${baseUrl}/api/v1/internal/tickets/validate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Internal-Api-Key": apiKey,
            },
            body: JSON.stringify({
              eventId,
              ticketCode: ticketCode.toUpperCase().trim(),
            }),
          }
        );

        if (!response.ok && response.status !== 200) {
          throw new Error(
            `Validation request failed with status ${response.status}`
          );
        }

        const result: ValidationResult = await response.json();
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
      } finally {
        setLoading(false);
      }
    },
    [options.internalApiKey]
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
