// src/app/(platform)/dashboard/events/[eventId]/networking/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useNetworkingStats } from "@/hooks/use-networking-stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Mail,
  MailOpen,
  MessageSquare,
  Calendar,
  Trophy,
  TrendingUp,
  Star,
  Briefcase,
  Handshake,
  DollarSign,
  GraduationCap,
} from "lucide-react";
import { NetworkGraph } from "@/components/features/connections/network-graph";

const outcomeIcons: Record<string, React.ElementType> = {
  MEETING_HELD: Calendar,
  JOB_REFERRAL: Briefcase,
  PARTNERSHIP: Handshake,
  SALE_DEAL: DollarSign,
  MENTORSHIP: GraduationCap,
  OTHER: Star,
};

const outcomeLabels: Record<string, string> = {
  MEETING_HELD: "Meetings",
  JOB_REFERRAL: "Job Referrals",
  PARTNERSHIP: "Partnerships",
  SALE_DEAL: "Sales/Deals",
  MENTORSHIP: "Mentorships",
  OTHER: "Other",
};

export default function NetworkingAnalyticsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { eventAnalytics, connectionGraph, isLoading, error } =
    useNetworkingStats(eventId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="py-6 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!eventAnalytics) {
    return (
      <div className="p-6">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No Networking Data</h3>
            <p className="text-muted-foreground mt-2">
              Networking analytics will appear here once attendees start
              connecting at your event.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Networking Analytics</h1>
        <p className="text-muted-foreground">
          Track connections, follow-ups, and outcomes from your event
        </p>
      </div>

      {/* Networking Score */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Networking Score
              </p>
              <p className="text-4xl font-bold">{eventAnalytics.networkingScore}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on connections, follow-ups, and outcomes
              </p>
            </div>
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="h-12 w-12 text-primary" />
            </div>
          </div>
          <Progress value={eventAnalytics.networkingScore} className="mt-4" />
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {eventAnalytics.totalConnections}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total Connections
            </p>
            <p className="text-xs text-muted-foreground">
              {eventAnalytics.uniqueNetworkers} unique networkers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {eventAnalytics.followUpsSent}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Follow-ups Sent</p>
            <p className="text-xs text-muted-foreground">
              {eventAnalytics.followUpSentRate.toFixed(1)}% send rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {eventAnalytics.meetingsScheduled}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Meetings Scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">
                {eventAnalytics.reportedOutcomes}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reported Outcomes
            </p>
            <p className="text-xs text-muted-foreground">
              {eventAnalytics.outcomeRate.toFixed(1)}% outcome rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Follow-up Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Follow-up Funnel
          </CardTitle>
          <CardDescription>
            Track the journey from connection to engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Follow-ups Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{eventAnalytics.followUpsSent}</span>
                <Badge variant="secondary">
                  {eventAnalytics.followUpSentRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={eventAnalytics.followUpSentRate} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MailOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Follow-ups Opened</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{eventAnalytics.followUpsOpened}</span>
                <Badge variant="secondary">
                  {eventAnalytics.followUpOpenRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={eventAnalytics.followUpOpenRate} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Follow-ups Replied</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{eventAnalytics.followUpsReplied}</span>
                <Badge variant="secondary">
                  {eventAnalytics.followUpReplyRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={eventAnalytics.followUpReplyRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outcome Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Outcome Types
            </CardTitle>
            <CardDescription>
              Breakdown of reported networking outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventAnalytics.outcomeBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No outcomes reported yet
              </p>
            ) : (
              <div className="space-y-3">
                {eventAnalytics.outcomeBreakdown.map((outcome) => {
                  const Icon = outcomeIcons[outcome.type] || Star;
                  return (
                    <div
                      key={outcome.type}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {outcomeLabels[outcome.type] || outcome.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{outcome.count}</span>
                        <Badge variant="outline">
                          {outcome.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Connectors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Connectors
            </CardTitle>
            <CardDescription>
              Most active networkers at your event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventAnalytics.topConnectors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No connections yet
              </p>
            ) : (
              <div className="space-y-3">
                {eventAnalytics.topConnectors.slice(0, 5).map((connector, index) => (
                  <div
                    key={connector.userId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {connector.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{connector.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {connector.followUpRate.toFixed(0)}% follow-up rate
                        </p>
                      </div>
                    </div>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      {connector.connectionCount} connections
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connection Types */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Sources</CardTitle>
          <CardDescription>How attendees are connecting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {eventAnalytics.connectionsByType.map((type) => (
              <div
                key={type.type}
                className="text-center p-4 rounded-lg bg-muted/50"
              >
                <p className="text-2xl font-bold">{type.count}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {type.type.replace(/_/g, " ").toLowerCase()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {type.percentage.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Graph Visualization */}
      {connectionGraph && connectionGraph.nodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Network</CardTitle>
            <CardDescription>
              {connectionGraph.nodes.length} networkers with{" "}
              {connectionGraph.edges.length} connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NetworkGraph
              nodes={connectionGraph.nodes}
              edges={connectionGraph.edges}
              className="border rounded-lg"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
