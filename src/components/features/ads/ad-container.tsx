// src/components/features/ads/ad-container.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_ADS_FOR_CONTEXT_QUERY,
  TRACK_AD_IMPRESSIONS_MUTATION,
} from "@/graphql/monetization.graphql";
import { BannerAd, Ad } from "./banner-ad";
import { VideoAd } from "./video-ad";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { safeStorage } from "@/lib/safe-storage";

interface ImpressionData {
  adId: string;
  context: string;
  viewable_duration_ms: number;
  viewport_percentage: number;
}

interface AdContainerProps {
  eventId: string;
  sessionId?: string;
  placement: "CHECKOUT" | "EMAIL" | "EVENT_HERO" | "IN_EVENT" | "POST_PURCHASE" | "SESSION_BREAK" | "SIDEBAR";
  limit?: number;
  rotationInterval?: number; // Milliseconds, default 30000 (30 seconds)
  className?: string;
  showSponsorLabel?: boolean;
}

export const AdContainer = ({
  eventId,
  sessionId,
  placement,
  limit = 1,
  rotationInterval = 30000,
  className = "",
  showSponsorLabel = true,
}: AdContainerProps) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [impressionQueue, setImpressionQueue] = useState<ImpressionData[]>([]);
  const impressionQueueRef = useRef<ImpressionData[]>([]);
  const flushTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Generate or retrieve session token for frequency capping
  const [sessionToken] = useState(() => {
    const stored = safeStorage.getItem("ad_session_token");
    if (stored) return stored;

    const newToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    safeStorage.setItem("ad_session_token", newToken);
    logger.info("Generated new ad session token", { sessionToken: newToken });
    return newToken;
  });

  // Fetch ads for context
  const { data, loading, error } = useQuery(GET_ADS_FOR_CONTEXT_QUERY, {
    variables: {
      eventId,
      sessionId,
      placement,
      limit: limit * 3, // Fetch more for rotation
    },
    context: {
      headers: {
        "X-Session-Token": sessionToken,
      },
    },
    fetchPolicy: "cache-and-network",
    onError: (err) => {
      logger.error("Failed to load ads", err, {
        eventId,
        sessionId,
        placement,
        sessionToken
      });
    },
  });

  // Track impressions mutation
  const [trackImpressions] = useMutation(TRACK_AD_IMPRESSIONS_MUTATION, {
    onError: (error) => {
      logger.error("Failed to track ad impressions", error, {
        eventId,
        placement,
        sessionToken,
      });
    },
  });

  const ads: Ad[] = data?.adsForContext || [];

  // Rotate ads automatically
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [ads.length, rotationInterval]);

  // Flush impression queue periodically (every 10 impressions or 30 seconds)
  const flushImpressions = useCallback(async () => {
    if (impressionQueueRef.current.length === 0) return;

    const impressionsToSend = [...impressionQueueRef.current];
    impressionQueueRef.current = [];
    setImpressionQueue([]);

    try {
      await trackImpressions({
        variables: {
          impressions: impressionsToSend.map((imp) => ({
            adId: imp.adId,
            context: imp.context,
            viewableDurationMs: imp.viewable_duration_ms,
            viewportPercentage: imp.viewport_percentage,
          })),
        },
      });
      logger.info("Successfully tracked ad impressions", {
        count: impressionsToSend.length,
        eventId,
        placement,
      });
    } catch (error) {
      logger.error("Failed to send impression batch", error, {
        count: impressionsToSend.length,
        eventId,
        placement,
        impressions: impressionsToSend,
      });
    }
  }, [trackImpressions]);

  // Set up flush timer
  useEffect(() => {
    flushTimerRef.current = setInterval(() => {
      flushImpressions();
    }, 30000); // Flush every 30 seconds

    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
      }
      // Flush remaining impressions on unmount
      flushImpressions();
    };
  }, [flushImpressions]);

  // Handle impression tracking
  const handleImpression = useCallback((
    adId: string,
    viewableData: { viewable_duration_ms: number; viewport_percentage: number }
  ) => {
    const newImpression: ImpressionData = {
      adId,
      context: window.location.pathname,
      viewable_duration_ms: viewableData.viewable_duration_ms,
      viewport_percentage: viewableData.viewport_percentage,
    };

    impressionQueueRef.current.push(newImpression);
    setImpressionQueue((prev) => [...prev, newImpression]);

    // Flush if queue reaches 10 impressions
    if (impressionQueueRef.current.length >= 10) {
      flushImpressions();
    }
  }, [flushImpressions]);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="w-full aspect-[16/3]" />
      </div>
    );
  }

  if (error || ads.length === 0) {
    return null; // Silently hide if no ads available
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div className={cn("relative", className)}>
      {currentAd.contentType === "VIDEO" ? (
        <VideoAd
          ad={currentAd}
          eventId={eventId}
          onImpression={handleImpression}
          showSponsorLabel={showSponsorLabel}
          autoPlay={false}
        />
      ) : (
        <BannerAd
          ad={currentAd}
          eventId={eventId}
          onImpression={handleImpression}
          showSponsorLabel={showSponsorLabel}
        />
      )}

      {/* Rotation indicator */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
          {ads.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === currentAdIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/70"
              )}
              onClick={() => setCurrentAdIndex(index)}
              aria-label={`View ad ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
