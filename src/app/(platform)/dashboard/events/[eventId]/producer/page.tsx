// src/app/(platform)/dashboard/events/[eventId]/producer/page.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_EVENT_BY_ID_QUERY, GET_SESSIONS_BY_EVENT_QUERY } from "@/graphql/events.graphql";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  Monitor,
  MessageSquare,
  HelpCircle,
  Radio,
  ArrowLeft,
  RefreshCw,
  Users,
  Eye,
  DoorOpen,
} from "lucide-react";
import Link from "next/link";
import { SessionControlGrid } from "./_components/session-control-grid";
import { CombinedChatModeration } from "./_components/combined-chat-moderation";
import { CombinedQAModeration } from "./_components/combined-qa-moderation";
import { BreakoutRoomsControl } from "./_components/breakout-rooms-control";

type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status?: string;
  chatEnabled?: boolean;
  qaEnabled?: boolean;
  pollsEnabled?: boolean;
  chatOpen?: boolean;
  qaOpen?: boolean;
  pollsOpen?: boolean;
  sessionType?: string;
  streamingUrl?: string;
  speakers: { id: string; name: string }[];
};

type Event = {
  id: string;
  name: string;
  organizationId: string;
  eventType?: string;
  status?: string;
};

export default function ProducerDashboardPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch event details
  const { data: eventData, loading: eventLoading } = useQuery(GET_EVENT_BY_ID_QUERY, {
    variables: { id: eventId },
    skip: !eventId,
  });

  // Fetch sessions with polling for real-time updates
  const { data: sessionsData, loading: sessionsLoading, refetch: refetchSessions } = useQuery(
    GET_SESSIONS_BY_EVENT_QUERY,
    {
      variables: { eventId },
      skip: !eventId,
      pollInterval: 10000, // Refresh every 10 seconds
    }
  );

  const event: Event | undefined = eventData?.event;
  const sessions: Session[] = sessionsData?.sessionsByEvent || [];

  // Categorize sessions by status
  const now = new Date();
  const liveSessions = sessions.filter((s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    return now >= start && now <= end;
  });
  const upcomingSessions = sessions.filter((s) => new Date(s.startTime) > now);
  const endedSessions = sessions.filter((s) => new Date(s.endTime) < now);

  if (eventLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Event not found</p>
        <Link href="/dashboard/events">
          <Button variant="link">Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/events/${eventId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Producer Dashboard</h1>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                <Radio className="h-3 w-3 mr-1 animate-pulse" />
                LIVE CONTROL
              </Badge>
            </div>
            <p className="text-muted-foreground">{event.name}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetchSessions()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card className={liveSessions.length > 0 ? "border-green-500/50 bg-green-500/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Now</CardTitle>
            <Radio className={`h-4 w-4 ${liveSessions.length > 0 ? "text-green-500 animate-pulse" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${liveSessions.length > 0 ? "text-green-600" : ""}`}>
              {liveSessions.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endedSessions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Session Control
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Moderation
          </TabsTrigger>
          <TabsTrigger value="qa" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Q&A Moderation
          </TabsTrigger>
          <TabsTrigger value="breakout" className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4" />
            Breakout Rooms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SessionControlGrid
            sessions={sessions}
            eventId={eventId}
            liveSessions={liveSessions}
            upcomingSessions={upcomingSessions}
            endedSessions={endedSessions}
          />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <CombinedChatModeration sessions={sessions} eventId={eventId} />
        </TabsContent>

        <TabsContent value="qa" className="space-y-4">
          <CombinedQAModeration sessions={sessions} eventId={eventId} />
        </TabsContent>

        <TabsContent value="breakout" className="space-y-4">
          <BreakoutRoomsControl sessions={sessions} eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
