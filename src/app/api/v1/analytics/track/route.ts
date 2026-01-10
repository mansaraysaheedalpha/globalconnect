// src/app/api/v1/analytics/track/route.ts
/**
 * Analytics Tracking API Route
 *
 * This route acts as a proxy between the frontend analytics tracker and the backend
 * analytics service. It handles:
 * - Batch event processing
 * - Event grouping by eventId for proper backend routing
 * - Fallback to GraphQL mutations for ad tracking
 * - Anonymous and authenticated user tracking
 *
 * The backend expects events to be grouped by eventId, so this route extracts
 * the eventId from each event's context and groups them accordingly.
 */
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

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

interface BackendEvent {
  event_type: string;
  entity_type: string;
  entity_id: string;
  revenue_cents: number;
  context: Record<string, unknown>;
}

// Backend URLs
const BACKEND_BASE_URL =
  process.env.EVENT_SERVICE_URL ||
  process.env.NEXT_PUBLIC_EVENT_SERVICE_URL ||
  "http://localhost:8000";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";

/**
 * Forward events to the backend REST API
 * Groups events by eventId and sends batch requests
 */
async function forwardToBackend(
  events: TrackingEvent[],
  sessionToken: string,
  authHeader?: string | null
): Promise<{ success: boolean; forwarded: number; errors: string[] }> {
  const errors: string[] = [];
  let forwarded = 0;

  // Group events by eventId from context
  const eventGroups = new Map<string, BackendEvent[]>();

  for (const event of events) {
    const eventId = (event.context?.eventId as string) || "unknown";

    if (!eventGroups.has(eventId)) {
      eventGroups.set(eventId, []);
    }

    eventGroups.get(eventId)!.push({
      event_type: event.event_type,
      entity_type: event.entity_type,
      entity_id: event.entity_id,
      revenue_cents: event.revenue_cents || 0,
      context: event.context || {},
    });
  }

  // Send batched requests to backend for each eventId
  for (const [eventId, groupedEvents] of eventGroups) {
    if (eventId === "unknown") {
      // Skip events without eventId - they'll be handled via GraphQL fallback
      continue;
    }

    try {
      const url = new URL(`${BACKEND_BASE_URL}/api/v1/analytics/track`);
      url.searchParams.set("event_id", eventId);
      url.searchParams.set("session_token", sessionToken);

      const fetchHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Forward auth header if present
      if (authHeader) {
        fetchHeaders["Authorization"] = authHeader;
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({ events: groupedEvents }),
      });

      if (response.ok) {
        forwarded += groupedEvents.length;
      } else {
        const errorText = await response.text();
        errors.push(`Backend error for event ${eventId}: ${response.status} - ${errorText}`);
        console.error(`Failed to forward events for event ${eventId}:`, errorText);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Network error for event ${eventId}: ${message}`);
      console.error(`Network error forwarding events for event ${eventId}:`, error);
    }
  }

  return {
    success: errors.length === 0,
    forwarded,
    errors,
  };
}

/**
 * Track ad impressions via GraphQL mutation (fallback)
 */
async function trackAdImpressions(
  impressions: { adId: string; context?: Record<string, unknown> }[]
): Promise<number> {
  if (impressions.length === 0) return 0;

  const impressionInputs = impressions.map((imp) => ({
    adId: imp.adId,
    context: imp.context?.sessionId as string | undefined,
    viewableDurationMs: 0,
    viewportPercentage: 100,
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
      return result.data?.trackAdImpressions?.trackedCount || 0;
    }
  } catch (error) {
    console.error("Failed to track ad impressions via GraphQL:", error);
  }

  return 0;
}

/**
 * Track ad click via GraphQL mutation (fallback)
 */
async function trackAdClick(adId: string, sessionContext?: string): Promise<boolean> {
  const mutation = `
    mutation TrackAdClick($adId: ID!, $sessionContext: String) {
      trackAdClick(adId: $adId, sessionContext: $sessionContext) {
        success
        redirectUrl
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: mutation,
        variables: { adId, sessionContext },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.data?.trackAdClick?.success || false;
    }
  } catch (error) {
    console.error("Failed to track ad click via GraphQL:", error);
  }

  return false;
}

/**
 * Generate a session token for anonymous tracking
 */
function generateSessionToken(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
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

    // Get headers for auth forwarding
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    const sessionToken = generateSessionToken();

    // Categorize events
    const eventsWithEventId: TrackingEvent[] = [];
    const adImpressions: { adId: string; context?: Record<string, unknown> }[] = [];
    const adClicks: { adId: string; context?: Record<string, unknown> }[] = [];
    const unmappedEvents: TrackingEvent[] = [];

    for (const event of events) {
      const hasEventId = Boolean(event.context?.eventId);

      if (hasEventId) {
        // Events with eventId will be forwarded to backend
        eventsWithEventId.push(event);
      } else if (event.event_type === "AD_IMPRESSION") {
        // Ad impressions without eventId - use GraphQL fallback
        adImpressions.push({ adId: event.entity_id, context: event.context });
      } else if (event.event_type === "AD_CLICK") {
        // Ad clicks without eventId - use GraphQL fallback
        adClicks.push({ adId: event.entity_id, context: event.context });
      } else {
        // Other events without eventId
        unmappedEvents.push(event);
      }
    }

    // Process results
    const results = {
      total: events.length,
      forwarded: 0,
      graphqlTracked: 0,
      unmapped: unmappedEvents.length,
      errors: [] as string[],
    };

    // Forward events with eventId to backend
    if (eventsWithEventId.length > 0) {
      const backendResult = await forwardToBackend(
        eventsWithEventId,
        sessionToken,
        authHeader
      );
      results.forwarded = backendResult.forwarded;
      results.errors.push(...backendResult.errors);
    }

    // Process ad impressions via GraphQL fallback
    if (adImpressions.length > 0) {
      const tracked = await trackAdImpressions(adImpressions);
      results.graphqlTracked += tracked;
    }

    // Process ad clicks via GraphQL fallback
    for (const click of adClicks) {
      const success = await trackAdClick(
        click.adId,
        click.context ? JSON.stringify(click.context) : undefined
      );
      if (success) results.graphqlTracked += 1;
    }

    // Log unmapped events for debugging (don't fail the request)
    if (unmappedEvents.length > 0) {
      console.warn(
        `[Analytics] ${unmappedEvents.length} events without eventId context:`,
        unmappedEvents.map((e) => ({ type: e.event_type, entity: e.entity_type }))
      );
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      status: "success",
      queued: events.length,
      processed: {
        forwarded: results.forwarded,
        graphqlTracked: results.graphqlTracked,
        unmapped: results.unmapped,
      },
      duration_ms: duration,
      ...(results.errors.length > 0 && { warnings: results.errors }),
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
