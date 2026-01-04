// src/app/(platform)/dashboard/events/[eventId]/monetization/waitlist.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_SESSIONS_BY_EVENT_QUERY } from "@/graphql/events.graphql";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WaitlistAnalytics } from "@/components/features/waitlist/waitlist-analytics";
import { WaitlistCapacityManager } from "@/components/features/waitlist/waitlist-capacity-manager";
import { WaitlistManagementTable } from "@/components/features/waitlist/waitlist-management-table";
import { Loader2, ListChecks, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Session {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export const Waitlist = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const { data, loading, error } = useQuery(GET_SESSIONS_BY_EVENT_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Waitlist Management
          </CardTitle>
          <CardDescription>
            Manage session capacity and waitlists for your event
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Waitlist Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500 py-8">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load sessions. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sessions: Session[] = data?.sessionsByEvent || [];

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Waitlist Management
          </CardTitle>
          <CardDescription>
            Manage session capacity and waitlists for your event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ListChecks className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create sessions for your event to start managing waitlists and capacity.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Auto-select first session if none selected
  const effectiveSessionId = selectedSessionId || sessions[0]?.id;
  const selectedSession = sessions.find((s) => s.id === effectiveSessionId);

  // Guard against missing session (edge case)
  if (!effectiveSessionId || !selectedSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Waitlist Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Session Not Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              The selected session could not be found. Please select a different session.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Session Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Waitlist Management
          </CardTitle>
          <CardDescription>
            Manage session capacity, view waitlists, and send offers to attendees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Session</label>
            <Select
              value={effectiveSessionId}
              onValueChange={setSelectedSessionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="management" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Waitlist Management Tab */}
        <TabsContent value="management" className="space-y-4">
          <WaitlistManagementTable
            sessionId={effectiveSessionId}
            sessionTitle={selectedSession?.title}
          />
        </TabsContent>

        {/* Capacity Management Tab */}
        <TabsContent value="capacity" className="space-y-4">
          <WaitlistCapacityManager
            sessionId={effectiveSessionId}
            sessionTitle={selectedSession?.title}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <WaitlistAnalytics eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
