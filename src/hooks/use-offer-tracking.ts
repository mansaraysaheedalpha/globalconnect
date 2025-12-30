// src/hooks/use-offer-tracking.ts
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { logger } from "@/lib/logger";

// GraphQL mutations for tracking offer events
const TRACK_OFFER_VIEW_MUTATION = gql`
  mutation TrackOfferView($offerId: ID!, $context: OfferViewContext!) {
    trackOfferView(offerId: $offerId, context: $context) {
      success
    }
  }
`;

const TRACK_OFFER_CLICK_MUTATION = gql`
  mutation TrackOfferClick($offerId: ID!, $actionType: String!) {
    trackOfferClick(offerId: $offerId, actionType: $actionType) {
      success
    }
  }
`;

const TRACK_OFFER_PURCHASE_INITIATION_MUTATION = gql`
  mutation TrackOfferPurchaseInitiation($offerId: ID!, $price: Float!) {
    trackOfferPurchaseInitiation(offerId: $offerId, price: $price) {
      success
    }
  }
`;

interface OfferTrackingOptions {
  offerId: string;
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
 * - Debouncing to prevent duplicate events
 */
export function useOfferTracking(options: OfferTrackingOptions) {
  const { offerId, placement = "unknown", price = 0, enabled = true } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);

  const [trackView] = useMutation(TRACK_OFFER_VIEW_MUTATION);
  const [trackClick] = useMutation(TRACK_OFFER_CLICK_MUTATION);
  const [trackPurchaseInitiation] = useMutation(TRACK_OFFER_PURCHASE_INITIATION_MUTATION);

  // Track offer view (impression) when visible
  useEffect(() => {
    if (!enabled || !elementRef.current || hasTrackedView.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedView.current) {
          // Track view after 1 second of visibility
          const timeout = setTimeout(() => {
            trackView({
              variables: {
                offerId,
                context: {
                  placement,
                  timestamp: new Date().toISOString(),
                },
              },
            }).catch((error) => {
              logger.error("Failed to track offer view", error, { offerId, placement });
            });
            hasTrackedView.current = true;
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
  }, [offerId, placement, enabled, trackView]);

  // Track click on "View Details"
  const trackViewDetailsClick = useCallback(() => {
    if (!enabled) return;

    trackClick({
      variables: {
        offerId,
        actionType: "VIEW_DETAILS",
      },
    }).catch((error) => {
      logger.error("Failed to track offer click", error, { offerId, actionType: "VIEW_DETAILS" });
    });
  }, [offerId, enabled, trackClick]);

  // Track purchase button click
  const trackPurchaseClick = useCallback(() => {
    if (!enabled) return;

    // Track both click and purchase initiation
    trackClick({
      variables: {
        offerId,
        actionType: "PURCHASE_BUTTON",
      },
    }).catch((error) => {
      logger.error("Failed to track purchase click", error, { offerId });
    });

    trackPurchaseInitiation({
      variables: {
        offerId,
        price,
      },
    }).catch((error) => {
      logger.error("Failed to track purchase initiation", error, { offerId, price });
    });
  }, [offerId, price, enabled, trackClick, trackPurchaseInitiation]);

  return {
    elementRef,
    trackViewDetailsClick,
    trackPurchaseClick,
  };
}

/**
 * Simple offer tracking (without Intersection Observer) for non-card components
 */
export function useSimpleOfferTracking() {
  const [trackClick] = useMutation(TRACK_OFFER_CLICK_MUTATION);
  const [trackPurchaseInitiation] = useMutation(TRACK_OFFER_PURCHASE_INITIATION_MUTATION);

  const trackOfferClick = useCallback(
    (offerId: string, actionType: string) => {
      trackClick({
        variables: { offerId, actionType },
      }).catch((error) => {
        logger.error("Failed to track offer click", error, { offerId, actionType });
      });
    },
    [trackClick]
  );

  const trackOfferPurchaseInitiation = useCallback(
    (offerId: string, price: number) => {
      trackPurchaseInitiation({
        variables: { offerId, price },
      }).catch((error) => {
        logger.error("Failed to track purchase initiation", error, { offerId, price });
      });
    },
    [trackPurchaseInitiation]
  );

  return {
    trackOfferClick,
    trackOfferPurchaseInitiation,
  };
}
