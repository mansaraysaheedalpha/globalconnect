// src/lib/analytics-tracker.ts
/**
 * Analytics Tracker
 *
 * Client-side analytics tracking with batching and reliable delivery.
 * Events are buffered and sent in batches for efficiency.
 *
 * IMPORTANT: Always include eventId in the context for proper backend routing.
 * Events without eventId will fall back to GraphQL mutations (less efficient).
 */
"use client";

import { useEffect, useCallback } from "react";
import { logger } from "./logger";

/**
 * Event types that can be tracked
 */
export type EventType =
  | "OFFER_VIEW"
  | "OFFER_CLICK"
  | "OFFER_ADD_TO_CART"
  | "OFFER_PURCHASE"
  | "AD_IMPRESSION"
  | "AD_VIEWABLE_IMPRESSION"
  | "AD_CLICK"
  | "WAITLIST_JOIN"
  | "WAITLIST_OFFER_ACCEPT"
  | "WAITLIST_OFFER_DECLINE";

/**
 * Entity types for tracking
 */
export type EntityType = "OFFER" | "AD" | "WAITLIST" | "SESSION";

/**
 * Base context that should always be included
 */
export interface TrackingContext {
  eventId: string; // Required: The event (conference/meetup) ID
  sessionId?: string; // Optional: Session within the event
  page?: string; // Optional: Page where event occurred
  [key: string]: unknown; // Additional custom context
}

/**
 * Tracking event structure
 */
export interface TrackingEvent {
  event_type: EventType;
  entity_type: EntityType;
  entity_id: string;
  revenue_cents?: number;
  context?: TrackingContext;
  timestamp?: string;
}

/**
 * Analytics Tracker Class
 *
 * Batches events and sends them to the backend in bulk.
 * - Flushes when queue reaches 10 events
 * - Flushes every 30 seconds automatically
 * - Retries failed events (up to 100 in queue)
 * - Flushes on page unload using sendBeacon
 */
class AnalyticsTracker {
  private eventQueue: TrackingEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;
  private isFlushing = false;
  private readonly trackingEndpoint = "/api/v1/analytics/track";
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL_MS = 30000;
  private readonly MAX_QUEUE_SIZE = 100;

  /**
   * Initialize the tracker
   * Sets up automatic flushing and page unload handler
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    this.startFlushInterval();
    this.setupPageUnloadHandler();

    logger.info("Analytics Tracker initialized");
  }

  /**
   * Track an event
   * Adds event to queue and flushes if threshold reached
   *
   * @param event - The tracking event to record
   */
  track(event: TrackingEvent): void {
    if (!this.isInitialized) {
      this.initialize();
    }

    // Warn if eventId is missing (affects backend routing)
    if (!event.context?.eventId) {
      logger.warn("Analytics event missing eventId in context", {
        eventType: event.event_type,
        entityType: event.entity_type,
      });
    }

    const eventWithTimestamp: TrackingEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    this.eventQueue.push(eventWithTimestamp);

    logger.debug("Event tracked", {
      eventType: event.event_type,
      entityType: event.entity_type,
      entityId: event.entity_id,
      hasEventId: Boolean(event.context?.eventId),
      queueSize: this.eventQueue.length,
    });

    // Flush immediately if queue reaches threshold
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Flush events to backend
   * Sends all queued events to the analytics API
   */
  async flush(): Promise<void> {
    // Prevent concurrent flushes
    if (this.isFlushing || this.eventQueue.length === 0) {
      return;
    }

    this.isFlushing = true;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(this.trackingEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events: eventsToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      logger.info("Analytics events sent", {
        sent: eventsToSend.length,
        processed: result.processed,
      });
    } catch (error) {
      logger.error("Failed to send analytics events", error);

      // Re-queue failed events (up to max queue size)
      if (this.eventQueue.length < this.MAX_QUEUE_SIZE) {
        const spaceAvailable = this.MAX_QUEUE_SIZE - this.eventQueue.length;
        const eventsToRequeue = eventsToSend.slice(0, spaceAvailable);
        this.eventQueue.unshift(...eventsToRequeue);

        if (eventsToSend.length > spaceAvailable) {
          logger.warn("Dropped events due to queue limit", {
            dropped: eventsToSend.length - spaceAvailable,
          });
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Start automatic flush interval
   */
  private startFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    this.flushInterval = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Setup page unload handler
   * Uses sendBeacon for reliable delivery when user leaves
   */
  private setupPageUnloadHandler(): void {
    if (typeof window === "undefined") return;

    const handleUnload = () => {
      if (this.eventQueue.length === 0) return;

      const eventsToSend = [...this.eventQueue];
      this.eventQueue = [];

      try {
        const blob = new Blob([JSON.stringify({ events: eventsToSend })], {
          type: "application/json",
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon(this.trackingEndpoint, blob);
        } else {
          // Fallback for browsers without sendBeacon
          fetch(this.trackingEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ events: eventsToSend }),
            keepalive: true,
          });
        }
      } catch (error) {
        logger.error("Failed to send events on unload", error);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);
  }

  /**
   * Destroy the tracker
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    this.flush();
    this.isInitialized = false;
  }

  /**
   * Get current queue size (for debugging)
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }
}

// Singleton instance
export const analyticsTracker = new AnalyticsTracker();

/**
 * Helper to create context with eventId
 * Use this to ensure eventId is always included
 */
export function createContext(
  eventId: string,
  additionalContext?: Omit<TrackingContext, "eventId">
): TrackingContext {
  return {
    eventId,
    ...additionalContext,
  };
}

/**
 * React Hook for Analytics Tracking
 *
 * Provides convenient tracking methods for components.
 * All methods require eventId for proper backend routing.
 *
 * @param eventId - The event (conference/meetup) ID for all tracked events
 *
 * @example
 * const { trackOfferView, trackAdImpression } = useAnalyticsTracker("event-123");
 *
 * // Track offer view
 * trackOfferView(offerId, { sessionId: "session-456" });
 *
 * // Track ad impression
 * trackAdImpression(adId);
 */
export function useAnalyticsTracker(eventId?: string) {
  // Initialize tracker on mount
  useEffect(() => {
    analyticsTracker.initialize();
  }, []);

  // Helper to build context with eventId
  const buildContext = useCallback(
    (additionalContext?: Record<string, unknown>): TrackingContext | undefined => {
      if (!eventId) return additionalContext as TrackingContext | undefined;
      return {
        eventId,
        ...additionalContext,
      };
    },
    [eventId]
  );

  const trackOfferView = useCallback(
    (offerId: string, context?: Record<string, unknown>) => {
      analyticsTracker.track({
        event_type: "OFFER_VIEW",
        entity_type: "OFFER",
        entity_id: offerId,
        context: buildContext(context),
      });
    },
    [buildContext]
  );

  const trackOfferClick = useCallback(
    (offerId: string, context?: Record<string, unknown>) => {
      analyticsTracker.track({
        event_type: "OFFER_CLICK",
        entity_type: "OFFER",
        entity_id: offerId,
        context: buildContext(context),
      });
    },
    [buildContext]
  );

  const trackOfferAddToCart = useCallback(
    (offerId: string, context?: Record<string, unknown>) => {
      analyticsTracker.track({
        event_type: "OFFER_ADD_TO_CART",
        entity_type: "OFFER",
        entity_id: offerId,
        context: buildContext(context),
      });
    },
    [buildContext]
  );

  const trackOfferPurchase = useCallback(
    (offerId: string, revenueAmount: number, context?: Record<string, unknown>) => {
      analyticsTracker.track({
        event_type: "OFFER_PURCHASE",
        entity_type: "OFFER",
        entity_id: offerId,
        revenue_cents: Math.round(revenueAmount * 100),
        context: buildContext(context),
      });
    },
    [buildContext]
  );

  const trackAdImpression = useCallback(
    (adId: string, context?: Record<string, unknown>) => {
      analyticsTracker.track({
        event_type: "AD_IMPRESSION",
        entity_type: "AD",
        entity_id: adId,
        context: buildContext(context),
      });
    },
    [buildContext]
  );

  const trackAdViewableImpression = useCallback(
    (adId: string, context?: Record<string, unknown>) => {
      analyticsTracker.track({
        event_type: "AD_VIEWABLE_IMPRESSION",
        entity_type: "AD",
        entity_id: adId,
        context: buildContext(context),
      });
    },
    [buildContext]
  );

  const trackAdClick = useCallback(
    (adId: string, context?: Record<string, unknown>) => {
      analyticsTracker.track({
        event_type: "AD_CLICK",
        entity_type: "AD",
        entity_id: adId,
        context: buildContext(context),
      });
    },
    [buildContext]
  );

  const trackWaitlistJoin = useCallback(
    (sessionId: string, context?: Record<string, unknown>) => {
      analyticsTracker.track({
        event_type: "WAITLIST_JOIN",
        entity_type: "WAITLIST",
        entity_id: sessionId,
        context: buildContext(context),
      });
    },
    [buildContext]
  );

  const trackWaitlistOfferAccept = useCallback(
    (sessionId: string, context?: Record<string, unknown>) => {
      analyticsTracker.track({
        event_type: "WAITLIST_OFFER_ACCEPT",
        entity_type: "WAITLIST",
        entity_id: sessionId,
        context: buildContext(context),
      });
    },
    [buildContext]
  );

  const trackWaitlistOfferDecline = useCallback(
    (sessionId: string, context?: Record<string, unknown>) => {
      analyticsTracker.track({
        event_type: "WAITLIST_OFFER_DECLINE",
        entity_type: "WAITLIST",
        entity_id: sessionId,
        context: buildContext(context),
      });
    },
    [buildContext]
  );

  return {
    trackOfferView,
    trackOfferClick,
    trackOfferAddToCart,
    trackOfferPurchase,
    trackAdImpression,
    trackAdViewableImpression,
    trackAdClick,
    trackWaitlistJoin,
    trackWaitlistOfferAccept,
    trackWaitlistOfferDecline,
  };
}

/**
 * Direct tracking functions (for non-React contexts)
 *
 * IMPORTANT: Always include eventId in the context parameter
 *
 * @example
 * track.adImpression("ad-123", { eventId: "event-456" });
 */
export const track = {
  offerView: (offerId: string, context?: TrackingContext) => {
    analyticsTracker.track({
      event_type: "OFFER_VIEW",
      entity_type: "OFFER",
      entity_id: offerId,
      context,
    });
  },

  offerClick: (offerId: string, context?: TrackingContext) => {
    analyticsTracker.track({
      event_type: "OFFER_CLICK",
      entity_type: "OFFER",
      entity_id: offerId,
      context,
    });
  },

  offerAddToCart: (offerId: string, context?: TrackingContext) => {
    analyticsTracker.track({
      event_type: "OFFER_ADD_TO_CART",
      entity_type: "OFFER",
      entity_id: offerId,
      context,
    });
  },

  offerPurchase: (offerId: string, revenueAmount: number, context?: TrackingContext) => {
    analyticsTracker.track({
      event_type: "OFFER_PURCHASE",
      entity_type: "OFFER",
      entity_id: offerId,
      revenue_cents: Math.round(revenueAmount * 100),
      context,
    });
  },

  adImpression: (adId: string, context?: TrackingContext) => {
    analyticsTracker.track({
      event_type: "AD_IMPRESSION",
      entity_type: "AD",
      entity_id: adId,
      context,
    });
  },

  adViewableImpression: (adId: string, context?: TrackingContext) => {
    analyticsTracker.track({
      event_type: "AD_VIEWABLE_IMPRESSION",
      entity_type: "AD",
      entity_id: adId,
      context,
    });
  },

  adClick: (adId: string, context?: TrackingContext) => {
    analyticsTracker.track({
      event_type: "AD_CLICK",
      entity_type: "AD",
      entity_id: adId,
      context,
    });
  },

  waitlistJoin: (sessionId: string, context?: TrackingContext) => {
    analyticsTracker.track({
      event_type: "WAITLIST_JOIN",
      entity_type: "WAITLIST",
      entity_id: sessionId,
      context,
    });
  },

  waitlistOfferAccept: (sessionId: string, context?: TrackingContext) => {
    analyticsTracker.track({
      event_type: "WAITLIST_OFFER_ACCEPT",
      entity_type: "WAITLIST",
      entity_id: sessionId,
      context,
    });
  },

  waitlistOfferDecline: (sessionId: string, context?: TrackingContext) => {
    analyticsTracker.track({
      event_type: "WAITLIST_OFFER_DECLINE",
      entity_type: "WAITLIST",
      entity_id: sessionId,
      context,
    });
  },
};
