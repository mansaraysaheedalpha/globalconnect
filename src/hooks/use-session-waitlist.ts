// src/hooks/use-session-waitlist.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

export interface WaitlistOffer {
  title: string;
  message: string;
  join_token: string;
  expires_at: string;
}

export interface WaitlistPosition {
  position: number;
  total: number;
}

interface UseSessionWaitlistOptions {
  sessionId: string;
  /**
   * Socket instance for listening to waitlist offers
   * Pass the socket from your real-time connection
   */
  socket?: {
    on: (event: string, callback: (data: WaitlistOffer) => void) => void;
    off: (event: string) => void;
  };
  /**
   * Callback when a waitlist offer is received
   */
  onOfferReceived?: (offer: WaitlistOffer) => void;
}

export function useSessionWaitlist({
  sessionId,
  socket,
  onOfferReceived,
}: UseSessionWaitlistOptions) {
  const { token } = useAuthStore();
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [position, setPosition] = useState<WaitlistPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOffer, setCurrentOffer] = useState<WaitlistOffer | null>(null);

  /**
   * Join the session waitlist
   * NOTE: Backend endpoint POST /api/v1/sessions/{id}/waitlist needs to be implemented
   */
  const joinWaitlist = useCallback(async (): Promise<boolean> => {
    if (!token) {
      setError("Authentication required");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${baseUrl}/api/v1/sessions/${sessionId}/waitlist`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Endpoint not implemented yet
          throw new Error("Waitlist feature is not yet available");
        }
        if (response.status === 409) {
          throw new Error("You are already on the waitlist");
        }
        throw new Error(`Failed to join waitlist: ${response.statusText}`);
      }

      setIsOnWaitlist(true);
      toast.success("Joined waitlist", {
        description: "You'll be notified when a spot opens up",
      });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to join waitlist";
      setError(errorMessage);
      toast.error("Failed to join waitlist", { description: errorMessage });
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, sessionId]);

  /**
   * Leave the session waitlist
   * NOTE: Backend endpoint DELETE /api/v1/sessions/{id}/waitlist needs to be implemented
   */
  const leaveWaitlist = useCallback(async (): Promise<boolean> => {
    if (!token) {
      setError("Authentication required");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${baseUrl}/api/v1/sessions/${sessionId}/waitlist`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("You are not on the waitlist");
        }
        throw new Error(`Failed to leave waitlist: ${response.statusText}`);
      }

      setIsOnWaitlist(false);
      setPosition(null);
      toast.success("Left waitlist");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to leave waitlist";
      setError(errorMessage);
      toast.error("Failed to leave waitlist", { description: errorMessage });
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, sessionId]);

  /**
   * Get current waitlist position
   * NOTE: Backend endpoint GET /api/v1/sessions/{id}/waitlist/position needs to be implemented
   */
  const getPosition = useCallback(async (): Promise<WaitlistPosition | null> => {
    if (!token) {
      setError("Authentication required");
      return null;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${baseUrl}/api/v1/sessions/${sessionId}/waitlist/position`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setIsOnWaitlist(false);
          return null;
        }
        throw new Error("Failed to get waitlist position");
      }

      const data: WaitlistPosition = await response.json();
      setPosition(data);
      setIsOnWaitlist(true);
      return data;
    } catch (err) {
      console.error("[useSessionWaitlist] Error getting position:", err);
      return null;
    }
  }, [token, sessionId]);

  /**
   * Accept a waitlist offer and join the session
   * Uses the short-lived JWT token provided in the offer
   */
  const acceptOffer = useCallback(
    async (offer: WaitlistOffer): Promise<boolean> => {
      if (!token) {
        setError("Authentication required");
        return false;
      }

      // Check if offer has expired
      if (new Date(offer.expires_at) < new Date()) {
        toast.error("Offer expired", {
          description: "This waitlist offer has expired. You remain on the waitlist.",
        });
        setCurrentOffer(null);
        return false;
      }

      setLoading(true);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(
          `${baseUrl}/api/v1/sessions/${sessionId}/join`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              join_token: offer.join_token,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to accept offer");
        }

        setIsOnWaitlist(false);
        setCurrentOffer(null);
        toast.success("Success!", {
          description: "You've joined the session",
        });
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to accept offer";
        setError(errorMessage);
        toast.error("Failed to accept offer", { description: errorMessage });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, sessionId]
  );

  /**
   * Decline a waitlist offer
   * The user remains on the waitlist for future offers
   */
  const declineOffer = useCallback(() => {
    setCurrentOffer(null);
    toast.info("Offer declined", {
      description: "You remain on the waitlist for future openings",
    });
  }, []);

  // Listen for waitlist offers via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleWaitlistOffer = (offer: WaitlistOffer) => {
      console.log("[useSessionWaitlist] Received waitlist offer:", offer);
      setCurrentOffer(offer);
      onOfferReceived?.(offer);

      // Show a toast notification
      toast.info(offer.title, {
        description: offer.message,
        duration: 10000, // 10 seconds
        action: {
          label: "View",
          onClick: () => {
            // This will be handled by the component showing the offer modal
          },
        },
      });
    };

    socket.on("WAITLIST_OFFER", handleWaitlistOffer);

    return () => {
      socket.off("WAITLIST_OFFER");
    };
  }, [socket, onOfferReceived]);

  /**
   * Calculate time remaining on current offer
   */
  const getOfferTimeRemaining = useCallback((): number => {
    if (!currentOffer) return 0;
    const expiresAt = new Date(currentOffer.expires_at).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expiresAt - now) / 1000));
  }, [currentOffer]);

  return {
    isOnWaitlist,
    position,
    loading,
    error,
    currentOffer,
    joinWaitlist,
    leaveWaitlist,
    getPosition,
    acceptOffer,
    declineOffer,
    getOfferTimeRemaining,
  };
}
