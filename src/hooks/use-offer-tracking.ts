// src/hooks/use-offer-tracking.ts
"use client";

import { useEffect, useRef, useCallback } from "react";
import { logger } from "@/lib/logger";
import { useAnalyticsTracker } from "@/lib/analytics-tracker";

interface OfferTrackingOptions {
  offerId: string;
  eventId?: string; // Event ID for proper backend routing
  placement?: string;
  price?: number;
  enabled?: boolean;
}

/**
 * Hook to track offer impressions, clicks, and purchase initiations
 *
 * Features:
 * - Automatic impression tracking when offer is visible
 * - Manual click tracking for interactions
 * - Purchase initiation tracking
 * - Batched event tracking for optimal performance
 *
 * @example
 * const { elementRef, trackViewDetailsClick, trackPurchaseClick } = useOfferTracking({
 *   offerId: offer.id,
 *   placement: "event-detail",
 *   price: offer.price,
 * });
 */
export function useOfferTracking(options: OfferTrackingOptions) {
  const { offerId, eventId, placement = "unknown", price = 0, enabled = true } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);

  // Pass eventId for proper backend routing
  const { trackOfferView, trackOfferClick: trackClick } = useAnalyticsTracker(eventId);

  // Track offer view (impression) when visible
  useEffect(() => {
    if (!enabled || !elementRef.current || hasTrackedView.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedView.current) {
          // Track view after 1 second of visibility
          const timeout = setTimeout(() => {
            try {
              trackOfferView(offerId, {
                placement,
                timestamp: new Date().toISOString(),
              });
              hasTrackedView.current = true;
              logger.info("Offer view tracked", { offerId, placement });
            } catch (error) {
              logger.error("Failed to track offer view", error, { offerId, placement });
            }
          }, 1000);

          return () => clearTimeout(timeout);
        }
      },
      {
        threshold: 0.5, // 50% visible
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [offerId, placement, enabled, trackOfferView]);

  // Track click on "View Details"
  const trackViewDetailsClick = useCallback(() => {
    if (!enabled) return;

    try {
      trackClick(offerId, {
        actionType: "VIEW_DETAILS",
        placement,
      });
      logger.info("Offer view details clicked", { offerId });
    } catch (error) {
      logger.error("Failed to track offer click", error, { offerId, actionType: "VIEW_DETAILS" });
    }
  }, [offerId, placement, enabled, trackClick]);

  // Track purchase button click
  const trackPurchaseClick = useCallback(() => {
    if (!enabled) return;

    try {
      trackClick(offerId, {
        actionType: "PURCHASE_BUTTON",
        placement,
        price,
      });
      logger.info("Offer purchase button clicked", { offerId, price });
    } catch (error) {
      logger.error("Failed to track purchase click", error, { offerId });
    }
  }, [offerId, price, placement, enabled, trackClick]);

  return {
    elementRef,
    trackViewDetailsClick,
    trackPurchaseClick,
  };
}

/**
 * Simple offer tracking (without Intersection Observer) for non-card components
 *
 * @example
 * const { trackOfferClick, trackOfferPurchaseInitiation } = useSimpleOfferTracking();
 * trackOfferClick(offerId, "ADD_TO_CART");
 * trackOfferPurchaseInitiation(offerId, 29.99);
 */
export function useSimpleOfferTracking() {
  const { trackOfferClick, trackOfferPurchase } = useAnalyticsTracker();

  const handleTrackOfferClick = useCallback(
    (offerId: string, actionType: string, context?: Record<string, any>) => {
      try {
        trackOfferClick(offerId, { actionType, ...context });
        logger.info("Offer clicked", { offerId, actionType });
      } catch (error) {
        logger.error("Failed to track offer click", error, { offerId, actionType });
      }
    },
    [trackOfferClick]
  );

  const handleTrackOfferPurchaseInitiation = useCallback(
    (offerId: string, price: number, context?: Record<string, any>) => {
      try {
        trackOfferPurchase(offerId, price, context);
        logger.info("Offer purchase tracked", { offerId, price });
      } catch (error) {
        logger.error("Failed to track purchase initiation", error, { offerId, price });
      }
    },
    [trackOfferPurchase]
  );

  return {
    trackOfferClick: handleTrackOfferClick,
    trackOfferPurchaseInitiation: handleTrackOfferPurchaseInitiation,
  };
}
