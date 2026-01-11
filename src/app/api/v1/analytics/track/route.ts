// src/app/api/v1/analytics/track/route.ts
/**
 * Analytics Tracking API Route
 *
 * This route handles analytics event tracking from the frontend.
 * Events are processed via GraphQL mutations for ad tracking.
 * Other events are logged for future implementation.
 */
import { NextRequest, NextResponse } from "next/server";

// Types
interface TrackingEvent {
  event_type: string;
  entity_type: string;
  entity_id: string;
  revenue_cents?: number;
  context?: Record<string, unknown>;
  timestamp?: string;
}

interface TrackingPayload {
  events: TrackingEvent[];
}

// GraphQL URL
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";

/**
 * Track ad impressions via GraphQL mutation
 */
async function trackAdImpressions(
  impressions: { adId: string; context?: Record<string, unknown> }[]
): Promise<number> {
  if (impressions.length === 0) return 0;

  const impressionInputs = impressions.map((imp) => ({
    adId: imp.adId,
    context: imp.context?.sessionId as string | undefined,
    viewableDurationMs: (imp.context?.viewable_duration_ms as number) || 0,
    viewportPercentage: (imp.context?.viewport_percentage as number) || 100,
  }));

  const mutation = `
    mutation TrackAdImpressions($impressions: [AdImpressionInput!]!) {
      trackAdImpressions(impressions: $impressions) {
        success
        trackedCount
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: mutation,
        variables: { impressions: impressionInputs },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.errors) {
        console.error("[Analytics] GraphQL errors tracking impressions:", result.errors);
        return 0;
      }
      return result.data?.trackAdImpressions?.trackedCount || 0;
    } else {
      console.error("[Analytics] Failed to track impressions:", response.status);
    }
  } catch (error) {
    console.error("[Analytics] Error tracking ad impressions:", error);
  }

  return 0;
}

/**
 * Track ad click via GraphQL mutation
 */
async function trackAdClick(adId: string, sessionContext?: string): Promise<boolean> {
  console.log(`[Analytics] Tracking click for ad: ${adId}`);

  const mutation = `
    mutation TrackAdClick($adId: ID!, $sessionContext: String) {
      trackAdClick(adId: $adId, sessionContext: $sessionContext) {
        success
        redirectUrl
      }
    }
  `;

  try {
    console.log(`[Analytics] Calling GraphQL at: ${GRAPHQL_URL}`);
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: mutation,
        variables: { adId, sessionContext },
      }),
    });

    console.log(`[Analytics] GraphQL response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log(`[Analytics] GraphQL result:`, JSON.stringify(result));

      if (result.errors) {
        console.error("[Analytics] GraphQL errors tracking click:", result.errors);
        return false;
      }
      const success = result.data?.trackAdClick?.success || false;
      console.log(`[Analytics] Click tracking success: ${success}`);
      return success;
    } else {
      const errorText = await response.text();
      console.error(`[Analytics] GraphQL request failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("[Analytics] Error tracking ad click:", error);
  }

  return false;
}

/**
 * Main POST handler for analytics tracking
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const payload: TrackingPayload = await request.json();
    const { events } = payload;

    // Validate payload
    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Invalid payload: events array required" },
        { status: 400 }
      );
    }

    if (events.length === 0) {
      return NextResponse.json({
        status: "success",
        queued: 0,
        message: "No events to process",
      });
    }

    if (events.length > 100) {
      return NextResponse.json(
        { error: "Too many events: maximum 100 events per request" },
        { status: 400 }
      );
    }

    // Categorize events
    const adImpressions: { adId: string; context?: Record<string, unknown> }[] = [];
    const adClicks: { adId: string; context?: Record<string, unknown> }[] = [];
    const otherEvents: TrackingEvent[] = [];

    for (const event of events) {
      if (event.event_type === "AD_IMPRESSION" || event.event_type === "AD_VIEWABLE_IMPRESSION") {
        adImpressions.push({ adId: event.entity_id, context: event.context });
      } else if (event.event_type === "AD_CLICK") {
        adClicks.push({ adId: event.entity_id, context: event.context });
      } else {
        // Other events (offers, waitlist) - log for now
        otherEvents.push(event);
      }
    }

    // Process results
    const results = {
      total: events.length,
      tracked: 0,
      other: otherEvents.length,
    };

    // Process ad impressions via GraphQL
    if (adImpressions.length > 0) {
      const tracked = await trackAdImpressions(adImpressions);
      results.tracked += tracked;
    }

    // Process ad clicks via GraphQL
    console.log(`[Analytics] Processing ${adClicks.length} ad clicks`);
    for (const click of adClicks) {
      console.log(`[Analytics] Processing click for ad: ${click.adId}`, click.context);
      const success = await trackAdClick(
        click.adId,
        click.context ? JSON.stringify(click.context) : undefined
      );
      console.log(`[Analytics] Click result for ${click.adId}: ${success}`);
      if (success) results.tracked += 1;
    }

    // Log other events for debugging (offers, waitlist events)
    if (otherEvents.length > 0) {
      console.log(
        `[Analytics] ${otherEvents.length} non-ad events received:`,
        otherEvents.map((e) => `${e.event_type}:${e.entity_type}`).join(", ")
      );
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      status: "success",
      queued: events.length,
      processed: {
        adTracked: results.tracked,
        other: results.other,
      },
      duration_ms: duration,
    });
  } catch (error) {
    console.error("[Analytics] Tracking error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        status: "error",
        error: "Failed to process analytics events",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
