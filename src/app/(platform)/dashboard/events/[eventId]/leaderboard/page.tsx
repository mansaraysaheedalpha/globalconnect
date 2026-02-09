
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GET_SESSIONS_BY_EVENT_QUERY } from "@/graphql/events.graphql";
import { Leaderboard, TeamLeaderboard } from "./leaderboard";
import { Radio, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  status: "UPCOMING" | "LIVE" | "ENDED";
  chatEnabled: boolean;
}

const LeaderboardPage = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { data, loading } = useQuery(GET_SESSIONS_BY_EVENT_QUERY, {
    variables: { eventId },
    onCompleted: (data) => {
      const sessions: Session[] = data?.sessionsByEvent || [];
      if (!selectedSessionId && sessions.length > 0) {
        const liveSession = sessions.find((s) => s.status === "LIVE");
        const chatSession = sessions.find((s) => s.chatEnabled);
        const firstSession = liveSession || chatSession || sessions[0];
        if (firstSession) {
          setSelectedSessionId(firstSession.id);
        }
      }
    },
  });

  const sessions: Session[] = data?.sessionsByEvent || [];

  // Sort: LIVE first, then UPCOMING, then ENDED
  const sortedSessions = [
    ...sessions.filter((s) => s.status === "LIVE"),
    ...sessions.filter((s) => s.status === "UPCOMING"),
    ...sessions.filter((s) => s.status === "ENDED"),
  ];

  const sessionId = selectedSessionId || sortedSessions[0]?.id;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No sessions found for this event.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 ml-2">
            <Radio className="h-3 w-3 mr-1 animate-pulse" />
            Live
          </Badge>
        );
      case "UPCOMING":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 ml-2">
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Badge>
        );
      case "ENDED":
        return (
          <Badge variant="outline" className="text-muted-foreground ml-2">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ended
          </Badge>
        );
      default:
        return null;
    }
  };

  const selectedSession = sessions.find((s) => s.id === sessionId);

  return (
    <div className="space-y-4">
      {/* Session Selector */}
      {sortedSessions.length > 1 && (
        <div className="flex items-center gap-2">
          <label htmlFor="leaderboard-session-select" className="text-sm font-medium text-muted-foreground">
            Session:
          </label>
          <select
            id="leaderboard-session-select"
            value={sessionId || ""}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className={cn(
              "rounded-md border border-gray-300 dark:border-gray-700",
              "bg-white dark:bg-gray-800 shadow-sm",
              "focus:border-primary focus:ring-primary text-sm",
              "px-3 py-1.5"
            )}
          >
            {sortedSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title}
              </option>
            ))}
          </select>
          {selectedSession && getStatusBadge(selectedSession.status)}
        </div>
      )}

      {sessionId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Leaderboard sessionId={sessionId} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Team Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamLeaderboard sessionId={sessionId} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;
