// src/lib/ab-test-tracker.ts
/**
 * A/B Test Event Tracker
 *
 * Integrates with backend A/B testing API for result tracking.
 * Batches events for efficient network usage.
 *
 * Backend API: POST /api/v1/ab-tests/track
 */

import { logger } from "@/lib/logger";

export interface ABTestEvent {
  test_id: string;              // Test identifier (e.g., "checkout_button_color")
  event_id: string;             // Event/context ID this test applies to
  session_token: string;        // Frontend session ID for tracking
  variant_id: string;           // Which variant the user saw
  event_type: "variant_view" | "goal_conversion" | "secondary_metric";
  goal_achieved: boolean;       // Whether goal was achieved (true for conversions)
  goal_value?: number;          // Optional value (e.g., revenue in cents)
  user_id?: string;             // Optional user ID (for logged-in users)
  context?: Record<string, any>; // Optional additional context
}

class ABTestTracker {
  private eventQueue: ABTestEvent[] = [];
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  private initialized = false;

  /**
   * Initialize the tracker (sets up page unload handler)
   */
  initialize() {
    if (this.initialized || typeof window === "undefined") return;

    // Send remaining events on page unload using sendBeacon
    window.addEventListener("beforeunload", () => {
      if (this.eventQueue.length > 0) {
        this.sendBeacon();
      }
    });

    this.initialized = true;
    logger.info("A/B Test Tracker initialized");
  }

  /**
   * Track a variant view (user saw a variant)
   */
  trackView(
    testId: string,
    eventId: string,
    sessionToken: string,
    variantId: string,
    userId?: string,
    context?: Record<string, any>
  ) {
    this.track({
      test_id: testId,
      event_id: eventId,
      session_token: sessionToken,
      variant_id: variantId,
      event_type: "variant_view",
      goal_achieved: false,
      user_id: userId,
      context,
    });
  }

  /**
   * Track a goal conversion (user completed the goal action)
   */
  trackConversion(
    testId: string,
    eventId: string,
    sessionToken: string,
    variantId: string,
    goalValue?: number,
    userId?: string,
    context?: Record<string, any>
  ) {
    this.track({
      test_id: testId,
      event_id: eventId,
      session_token: sessionToken,
      variant_id: variantId,
      event_type: "goal_conversion",
      goal_achieved: true,
      goal_value: goalValue,
      user_id: userId,
      context,
    });
  }

  /**
   * Track a secondary metric
   */
  trackSecondaryMetric(
    testId: string,
    eventId: string,
    sessionToken: string,
    variantId: string,
    userId?: string,
    context?: Record<string, any>
  ) {
    this.track({
      test_id: testId,
      event_id: eventId,
      session_token: sessionToken,
      variant_id: variantId,
      event_type: "secondary_metric",
      goal_achieved: false,
      user_id: userId,
      context,
    });
  }

  /**
   * Internal track method - queues event and flushes when needed
   */
  private track(event: ABTestEvent) {
    this.eventQueue.push(event);

    logger.info("A/B Test event queued", {
      test_id: event.test_id,
      variant_id: event.variant_id,
      event_type: event.event_type,
      queueSize: this.eventQueue.length,
    });

    // Flush immediately if queue reaches batch size
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (this.eventQueue.length === 1) {
      // Start timer for first event in batch
      this.scheduleFlush();
    }
  }

  /**
   * Schedule automatic flush after timeout
   */
  private scheduleFlush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, this.BATCH_TIMEOUT);
  }

  /**
   * Flush queued events to backend
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = this.eventQueue.splice(0, this.BATCH_SIZE);

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    try {
      logger.info("Flushing A/B test events", { count: eventsToSend.length });

      const response = await fetch("/api/v1/ab-tests/track", {
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
      logger.info("A/B test events sent successfully", result);
    } catch (error) {
      logger.error("Failed to send A/B test events", error, {
        eventsCount: eventsToSend.length,
        sampleEvent: eventsToSend[0],
      });

      // Re-queue failed events (at the front)
      this.eventQueue.unshift(...eventsToSend);
    }

    // If more events remain, schedule next flush
    if (this.eventQueue.length > 0) {
      this.scheduleFlush();
    }
  }

  /**
   * Send events using sendBeacon API (for page unload)
   * More reliable than fetch() during unload
   */
  private sendBeacon(): void {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = this.eventQueue.splice(0, 100); // Send up to 100 events

    try {
      const blob = new Blob([JSON.stringify({ events: eventsToSend })], {
        type: "application/json",
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/v1/ab-tests/track", blob);
        logger.info("A/B test events sent via sendBeacon", {
          count: eventsToSend.length,
        });
      } else {
        // Fallback: synchronous fetch
        fetch("/api/v1/ab-tests/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events: eventsToSend }),
          keepalive: true, // Important for requests during page unload
        });
        logger.info("A/B test events sent via keepalive fetch", {
          count: eventsToSend.length,
        });
      }
    } catch (error) {
      logger.error("Failed to send A/B test events on unload", error);
    }
  }

  /**
   * Manually flush all queued events (useful for testing)
   */
  async flushAll(): Promise<void> {
    while (this.eventQueue.length > 0) {
      await this.flush();
    }
  }
}

// Singleton instance
export const abTestTracker = new ABTestTracker();

// Auto-initialize in browser environment
if (typeof window !== "undefined") {
  abTestTracker.initialize();
}

/**
 * React Hook for tracking A/B test events
 */
export function useABTestTracker() {
  return {
    trackView: abTestTracker.trackView.bind(abTestTracker),
    trackConversion: abTestTracker.trackConversion.bind(abTestTracker),
    trackSecondaryMetric: abTestTracker.trackSecondaryMetric.bind(abTestTracker),
    flush: abTestTracker.flush.bind(abTestTracker),
  };
}