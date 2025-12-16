// src/hooks/use-speaker-availability.ts
"use client";

import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";

export interface AvailableSpeaker {
  id: string;
  organization_id: string;
  name: string;
  bio: string;
  expertise: string[];
  is_archived: boolean;
}

interface UseSpeakerAvailabilityOptions {
  organizationId: string;
}

interface FetchAvailableSpeakersParams {
  startTime: Date;
  endTime: Date;
  expertise?: string;
}

export function useSpeakerAvailability({
  organizationId,
}: UseSpeakerAvailabilityOptions) {
  const { token } = useAuthStore();
  const [speakers, setSpeakers] = useState<AvailableSpeaker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches speakers available during the specified time window.
   * This queries the REST endpoint which finds speakers NOT assigned
   * to any session overlapping with the given time range.
   */
  const fetchAvailableSpeakers = useCallback(
    async ({ startTime, endTime, expertise }: FetchAvailableSpeakersParams) => {
      if (!token) {
        setError("Authentication required");
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const params = new URLSearchParams({
          available_from: startTime.toISOString(),
          available_to: endTime.toISOString(),
        });

        if (expertise) {
          params.append("expertise", expertise);
        }

        const response = await fetch(
          `${baseUrl}/api/v1/organizations/${organizationId}/speakers/availability?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            // Endpoint might not exist yet - return empty array
            setSpeakers([]);
            return [];
          }
          throw new Error(
            `Failed to fetch available speakers: ${response.statusText}`
          );
        }

        const data: AvailableSpeaker[] = await response.json();
        setSpeakers(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch speakers";
        setError(errorMessage);
        console.error("[useSpeakerAvailability] Error:", errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [token, organizationId]
  );

  /**
   * Clears the current speakers list and error state
   */
  const reset = useCallback(() => {
    setSpeakers([]);
    setError(null);
  }, []);

  return {
    speakers,
    loading,
    error,
    fetchAvailableSpeakers,
    reset,
  };
}
