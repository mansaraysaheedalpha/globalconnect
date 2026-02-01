// src/app/(platform)/dashboard/events/[eventId]/engagement/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { EngagementDashboard } from "@/features/engagement-conductor/components/EngagementDashboard";
import { EngagementSocketProvider } from "@/features/engagement-conductor/context/SocketContext";
import { useAuthStore } from "@/store/auth.store";
import { GET_SESSIONS_BY_EVENT_QUERY } from "@/graphql/events.graphql";

interface Session {
  id: string;
  title: string;
  startTime: string;
  chatEnabled: boolean;
}

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
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Fetch sessions for this event
  const { data, loading } = useQuery(GET_SESSIONS_BY_EVENT_QUERY, {
    variables: { eventId },
    onCompleted: (data) => {
      // Auto-select first session with chat enabled
      const sessions = data?.sessionsByEvent || [];
      const chatSession = sessions.find((s: Session) => s.chatEnabled) || sessions[0];
      if (chatSession && !selectedSessionId) {
        setSelectedSessionId(chatSession.id);
      }
    },
  });

  const sessions: Session[] = data?.sessionsByEvent || [];
  const sessionId = selectedSessionId || sessions[0]?.id;

  // Get auth token from Zustand auth store
  const authToken = useAuthStore((state) => state.token) || undefined;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">No Sessions Found</h2>
          <p className="text-gray-500 mt-2">
            Create a session for this event to start monitoring engagement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {sessions.length > 1 && (
        <div className="mb-4">
          <label htmlFor="session-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Session
          </label>
          <select
            id="session-select"
            value={selectedSessionId || ""}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} {session.chatEnabled ? "(Chat)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <EngagementSocketProvider sessionId={sessionId} authToken={authToken}>
        <EngagementDashboard
          sessionId={sessionId}
          eventId={eventId}
          enabled={true}
        />
      </EngagementSocketProvider>
    </div>
  );
}
