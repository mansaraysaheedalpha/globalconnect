// src/lib/analytics-tracker.ts
"use client";

import { useEffect, useCallback } from "react";
import { logger } from "./logger";

/**
 * Event types that can be tracked
 */
export type EventType =
  | "OFFER_VIEW"
  | "OFFER_PURCHASE"
  | "OFFER_CLICK"
  | "AD_IMPRESSION"
  | "AD_CLICK"
  | "WAITLIST_JOIN"
  | "WAITLIST_OFFER_ACCEPT"
  | "WAITLIST_OFFER_DECLINE";

/**
 * Entity types for tracking
 */
export type EntityType = "OFFER" | "AD" | "WAITLIST" | "SESSION";

/**
 * Tracking event structure
 */
export interface TrackingEvent {
  event_type: EventType;
  entity_type: EntityType;
  entity_id: string;
  revenue_cents?: number;
  context?: Record<string, any>;
  timestamp?: string;
}

/**
 * Analytics Tracker Class
 *
 * Batches events and sends them to the backend in bulk.
 * - Flushes when queue reaches 10 events
 * - Flushes every 30 seconds automatically
 * - Retries failed events
 * - Flushes on page unload
 */
class AnalyticsTracker {
  private eventQueue: TrackingEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;
  private isFlushing = false;

  /**
   * Initialize the tracker
   * Sets up automatic flushing and page unload handler
   */
  initialize() {
    if (this.isInitialized) {
      logger.info("Analytics Tracker already initialized");
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
   */
  track(event: TrackingEvent): void {
    if (!this.isInitialized) {
      logger.warn("Analytics Tracker not initialized, initializing now");
      this.initialize();
    }

    const eventWithTimestamp: TrackingEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    this.eventQueue.push(eventWithTimestamp);

    logger.info("Event tracked", {
      eventType: event.event_type,
      entityType: event.entity_type,
      entityId: event.entity_id,
      queueSize: this.eventQueue.length,
    });

    // Flush immediately if queue reaches 10 events
    if (this.eventQueue.length >= 10) {
      logger.info("Queue threshold reached, flushing events");
      this.flush();
    }
  }

  /**
   * Flush events to backend
   * Sends all queued events via GraphQL mutation
   */
  async flush(): Promise<void> {
    // Prevent concurrent flushes
    if (this.isFlushing) {
      logger.info("Flush already in progress, skipping");
      return;
    }

    // Nothing to flush
    if (this.eventQueue.length === 0) {
      return;
    }

    this.isFlushing = true;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      logger.info("Flushing analytics events", { count: eventsToSend.length });

      const response = await fetch("/api/v1/analytics/track", {
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

      logger.info("Analytics events tracked successfully", {
        count: eventsToSend.length,
        status: result.status,
        queued: result.queued,
      });
    } catch (error) {
      logger.error("Failed to track analytics events", error, {
        count: eventsToSend.length,
      });

      // Re-queue failed events (max 100 to prevent memory issues)
      if (this.eventQueue.length < 100) {
        this.eventQueue.unshift(...eventsToSend);
        logger.info("Re-queued failed events", {
          requeuCount: eventsToSend.length,
          totalQueueSize: this.eventQueue.length,
        });
      } else {
        logger.warn("Queue full, dropping failed events", {
          droppedCount: eventsToSend.length,
        });
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Start automatic flush interval
   * Flushes events every 30 seconds
   */
  private startFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    this.flushInterval = setInterval(() => {
      if (this.eventQueue.length > 0) {
        logger.info("Auto-flush triggered", { queueSize: this.eventQueue.length });
        this.flush();
      }
    }, 30000); // 30 seconds

    logger.info("Analytics auto-flush interval started (30s)");
  }

  /**
   * Setup page unload handler
   * Flushes remaining events when user leaves page
   */
  private setupPageUnloadHandler(): void {
    if (typeof window === "undefined") return;

    const handleUnload = () => {
      if (this.eventQueue.length > 0) {
        logger.info("Page unloading, flushing remaining events", {
          queueSize: this.eventQueue.length,
        });

        // Use sendBeacon for reliable delivery on page unload
        const eventsToSend = [...this.eventQueue];
        this.eventQueue = [];

        try {
          const blob = new Blob(
            [JSON.stringify({ events: eventsToSend })],
            { type: "application/json" }
          );

          if (navigator.sendBeacon) {
            navigator.sendBeacon("/api/v1/analytics/track", blob);
            logger.info("Events sent via sendBeacon", { count: eventsToSend.length });
          } else {
            // Fallback: synchronous fetch
            fetch("/api/v1/analytics/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ events: eventsToSend }),
              keepalive: true,
            });
          }
        } catch (error) {
          logger.error("Failed to send events on unload", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    logger.info("Page unload handlers registered");
  }

  /**
   * Destroy the tracker
   * Clears interval and flushes remaining events
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Flush remaining events
    this.flush();

    this.isInitialized = false;

    logger.info("Analytics Tracker destroyed");
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
 * React Hook for Analytics Tracking
 *
 * Provides convenient tracking methods for components
 * Automatically initializes tracker on mount
 *
 * @example
 * const { trackOfferView, trackOfferPurchase } = useAnalyticsTracker();
 *
 * // Track offer view
 * trackOfferView(offerId, { page: "event-detail" });
 *
 * // Track purchase
 * trackOfferPurchase(offerId, 29.99, { quantity: 1 });
 */
export function useAnalyticsTracker() {
  // Initialize tracker on mount
  useEffect(() => {
    analyticsTracker.initialize();

    return () => {
      // Don't destroy on unmount (tracker is singleton)
      // Only destroy on final app unmount
    };
  }, []);

  const trackOfferView = useCallback((offerId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "OFFER_VIEW",
      entity_type: "OFFER",
      entity_id: offerId,
      context,
    });
  }, []);

  const trackOfferClick = useCallback((offerId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "OFFER_CLICK",
      entity_type: "OFFER",
      entity_id: offerId,
      context,
    });
  }, []);

  const trackOfferPurchase = useCallback(
    (offerId: string, revenueAmount: number, context?: Record<string, any>) => {
      analyticsTracker.track({
        event_type: "OFFER_PURCHASE",
        entity_type: "OFFER",
        entity_id: offerId,
        revenue_cents: Math.round(revenueAmount * 100),
        context,
      });
    },
    []
  );

  const trackAdImpression = useCallback((adId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "AD_IMPRESSION",
      entity_type: "AD",
      entity_id: adId,
      context,
    });
  }, []);

  const trackAdClick = useCallback((adId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "AD_CLICK",
      entity_type: "AD",
      entity_id: adId,
      context,
    });
  }, []);

  const trackWaitlistJoin = useCallback((sessionId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "WAITLIST_JOIN",
      entity_type: "WAITLIST",
      entity_id: sessionId,
      context,
    });
  }, []);

  const trackWaitlistOfferAccept = useCallback(
    (sessionId: string, context?: Record<string, any>) => {
      analyticsTracker.track({
        event_type: "WAITLIST_OFFER_ACCEPT",
        entity_type: "WAITLIST",
        entity_id: sessionId,
        context,
      });
    },
    []
  );

  const trackWaitlistOfferDecline = useCallback(
    (sessionId: string, context?: Record<string, any>) => {
      analyticsTracker.track({
        event_type: "WAITLIST_OFFER_DECLINE",
        entity_type: "WAITLIST",
        entity_id: sessionId,
        context,
      });
    },
    []
  );

  return {
    trackOfferView,
    trackOfferClick,
    trackOfferPurchase,
    trackAdImpression,
    trackAdClick,
    trackWaitlistJoin,
    trackWaitlistOfferAccept,
    trackWaitlistOfferDecline,
  };
}

/**
 * Direct tracking functions (for non-React contexts)
 */
export const track = {
  offerView: (offerId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "OFFER_VIEW",
      entity_type: "OFFER",
      entity_id: offerId,
      context,
    });
  },

  offerClick: (offerId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "OFFER_CLICK",
      entity_type: "OFFER",
      entity_id: offerId,
      context,
    });
  },

  offerPurchase: (offerId: string, revenueAmount: number, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "OFFER_PURCHASE",
      entity_type: "OFFER",
      entity_id: offerId,
      revenue_cents: Math.round(revenueAmount * 100),
      context,
    });
  },

  adImpression: (adId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "AD_IMPRESSION",
      entity_type: "AD",
      entity_id: adId,
      context,
    });
  },

  adClick: (adId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "AD_CLICK",
      entity_type: "AD",
      entity_id: adId,
      context,
    });
  },

  waitlistJoin: (sessionId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "WAITLIST_JOIN",
      entity_type: "WAITLIST",
      entity_id: sessionId,
      context,
    });
  },

  waitlistOfferAccept: (sessionId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "WAITLIST_OFFER_ACCEPT",
      entity_type: "WAITLIST",
      entity_id: sessionId,
      context,
    });
  },

  waitlistOfferDecline: (sessionId: string, context?: Record<string, any>) => {
    analyticsTracker.track({
      event_type: "WAITLIST_OFFER_DECLINE",
      entity_type: "WAITLIST",
      entity_id: sessionId,
      context,
    });
  },
};