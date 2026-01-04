// src/components/features/waitlist/waitlist-analytics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@apollo/client";
import { GET_EVENT_WAITLIST_ANALYTICS_QUERY } from "@/graphql/monetization.graphql";
import { Loader2, Users, Clock, TrendingUp, CheckCircle, XCircle, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface WaitlistAnalyticsProps {
  eventId: string;
}

interface SessionWaitlistStats {
  sessionId: string;
  sessionTitle: string;
  waitlistCount: number;
  offersIssued: number;
  acceptanceRate: number;
}

interface WaitlistAnalyticsData {
  totalWaitlistEntries: number;
  activeWaitlistCount: number;
  totalOffersIssued: number;
  totalOffersAccepted: number;
  totalOffersDeclined: number;
  totalOffersExpired: number;
  acceptanceRate: number;
  averageWaitTimeMinutes: number;
  bySession: SessionWaitlistStats[];
}

export function WaitlistAnalytics({ eventId }: WaitlistAnalyticsProps) {
  const { data, loading, error } = useQuery(GET_EVENT_WAITLIST_ANALYTICS_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Waitlist Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.eventWaitlistAnalytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Waitlist Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Unable to load analytics data. Backend endpoint may not be implemented yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const analytics: WaitlistAnalyticsData = data.eventWaitlistAnalytics;

  return (
    <div className="space-y-4">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Waitlist Entries */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{analytics.totalWaitlistEntries}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Waitlist Count */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currently Waiting</p>
                <p className="text-2xl font-bold">{analytics.activeWaitlistCount}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers Issued */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offers Issued</p>
                <p className="text-2xl font-bold">{analytics.totalOffersIssued}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acceptance Rate</p>
                <p className="text-2xl font-bold">{(analytics.acceptanceRate * 100).toFixed(1)}%</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Offer Conversion Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Acceptance Rate Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Accepted</span>
                <span className="text-muted-foreground">
                  {analytics.totalOffersAccepted} / {analytics.totalOffersIssued}
                </span>
              </div>
              <Progress
                value={analytics.totalOffersIssued > 0 ? (analytics.totalOffersAccepted / analytics.totalOffersIssued) * 100 : 0}
                className="h-2"
              />
            </div>

            {/* Offer Breakdown */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                <span className="text-sm font-medium">Accepted</span>
                <span className="text-lg font-bold text-green-600">{analytics.totalOffersAccepted}</span>
              </div>

              <div className="flex flex-col items-center p-3 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500 mb-1" />
                <span className="text-sm font-medium">Declined</span>
                <span className="text-lg font-bold text-red-600">{analytics.totalOffersDeclined}</span>
              </div>

              <div className="flex flex-col items-center p-3 rounded-lg bg-gray-500/10">
                <Timer className="h-5 w-5 text-gray-500 mb-1" />
                <span className="text-sm font-medium">Expired</span>
                <span className="text-lg font-bold text-gray-600">{analytics.totalOffersExpired}</span>
              </div>
            </div>

            {/* Average Wait Time */}
            {analytics.averageWaitTimeMinutes > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Average Wait Time</span>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {analytics.averageWaitTimeMinutes} min
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per-Session Breakdown */}
      {analytics.bySession && analytics.bySession.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Waitlist by Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.bySession.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{session.sessionTitle}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {session.waitlistCount} waiting
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {session.offersIssued} offers
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={session.acceptanceRate >= 0.7 ? "default" : session.acceptanceRate >= 0.4 ? "secondary" : "outline"}
                  >
                    {(session.acceptanceRate * 100).toFixed(0)}% accepted
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
