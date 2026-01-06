// src/app/(platform)/dashboard/events/[eventId]/engagement/page.tsx
"use client";

import { useParams } from "next/navigation";
import { EngagementDashboard } from "@/features/engagement-conductor/components/EngagementDashboard";

/**
 * Engagement Conductor Page
 *
 * Displays the AI-powered engagement conductor dashboard for real-time
 * engagement monitoring and automated intervention suggestions.
 *
 * Features:
 * - Real-time engagement monitoring
 * - AI-powered intervention suggestions
 * - Agent mode control (Manual/Semi-Auto/Auto)
 * - Decision transparency with explainability
 * - Historical intervention tracking
 */
export default function EngagementConductorPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  // For now, we'll use the eventId as the sessionId
  // In production, you might want to select a specific session
  // or aggregate across all sessions in the event
  const sessionId = `event_${eventId}_main`;

  return (
    <div className="container mx-auto p-6">
      <EngagementDashboard
        sessionId={sessionId}
        eventId={eventId}
        enabled={true}
      />
    </div>
  );
}
