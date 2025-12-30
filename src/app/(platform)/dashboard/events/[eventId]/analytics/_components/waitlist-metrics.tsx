// src/app/(platform)/dashboard/events/[eventId]/analytics/_components/waitlist-metrics.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Clock, TrendingUp, CheckCircle } from "lucide-react";

interface WaitlistData {
  totalJoins: number;
  offersIssued: number;
  acceptanceRate: number;
  averageWaitTimeMinutes: number;
}

interface WaitlistMetricsProps {
  data?: WaitlistData;
}

export function WaitlistMetrics({ data }: WaitlistMetricsProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Metrics</CardTitle>
          <CardDescription>No waitlist data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { totalJoins, offersIssued, acceptanceRate, averageWaitTimeMinutes } = data;

  const declined = offersIssued - Math.round((offersIssued * acceptanceRate) / 100);
  const accepted = offersIssued - declined;

  // Convert average wait time to readable format
  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Acceptance rate quality
  const getAcceptanceQuality = (rate: number) => {
    if (rate >= 70) return { label: "Excellent", color: "text-green-600", variant: "default" as const };
    if (rate >= 50) return { label: "Good", color: "text-blue-600", variant: "secondary" as const };
    if (rate >= 30) return { label: "Average", color: "text-yellow-600", variant: "secondary" as const };
    return { label: "Low", color: "text-red-600", variant: "destructive" as const };
  };

  const quality = getAcceptanceQuality(acceptanceRate);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Joins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Joins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJoins.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique waitlist entries
            </p>
          </CardContent>
        </Card>

        {/* Offers Issued */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Issued</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offersIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Spots offered to waitlisted users
            </p>
          </CardContent>
        </Card>

        {/* Acceptance Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptanceRate.toFixed(1)}%</div>
            <div className="mt-2">
              <Badge variant={quality.variant} className={quality.color}>
                {quality.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Average Wait Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWaitTime(averageWaitTimeMinutes)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Time from join to offer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Waitlist Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Flow</CardTitle>
          <CardDescription>Journey from joining to acceptance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1: Joins */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Joins</span>
                </div>
                <span className="text-sm font-semibold">{totalJoins.toLocaleString()}</span>
              </div>
              <Progress value={100} className="h-3" />
            </div>

            {/* Step 2: Offers Issued */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Offers Issued</span>
                </div>
                <span className="text-sm font-semibold">
                  {offersIssued.toLocaleString()} ({totalJoins > 0 ? ((offersIssued / totalJoins) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <Progress value={totalJoins > 0 ? (offersIssued / totalJoins) * 100 : 0} className="h-3" />
            </div>

            {/* Step 3: Accepted */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Accepted</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {accepted.toLocaleString()} ({acceptanceRate.toFixed(1)}%)
                </span>
              </div>
              <Progress value={acceptanceRate} className="h-3 [&>div]:bg-green-500" />
            </div>

            {/* Step 4: Declined */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Declined/Expired</span>
                </div>
                <span className="text-sm font-semibold text-red-600">
                  {declined.toLocaleString()} ({(100 - acceptanceRate).toFixed(1)}%)
                </span>
              </div>
              <Progress value={100 - acceptanceRate} className="h-3 [&>div]:bg-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Recommendations to improve waitlist conversion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Acceptance Rate Analysis */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">Acceptance Rate Analysis</h4>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="text-xs text-green-600 dark:text-green-400 mb-1">Excellent</div>
                  <div className="text-sm font-semibold">&gt; 70%</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Good</div>
                  <div className="text-sm font-semibold">50-70%</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <div className="text-xs text-red-600 dark:text-red-400 mb-1">Needs Work</div>
                  <div className="text-sm font-semibold">&lt; 50%</div>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                {acceptanceRate < 50 && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Low acceptance rate - consider extending offer expiration time (currently 5 min)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Enable multi-channel notifications (email + push) for better reach</span>
                    </li>
                  </>
                )}
                {acceptanceRate >= 50 && acceptanceRate < 70 && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>Good performance! Consider A/B testing offer messaging</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>Add urgency indicators (countdown timers) to increase acceptance</span>
                    </li>
                  </>
                )}
                {acceptanceRate >= 70 && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Excellent acceptance rate! Your waitlist system is working well</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Consider implementing priority tiers for VIP/premium members</span>
                    </li>
                  </>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Industry benchmark: 60% acceptance rate for time-limited offers</span>
                </li>
              </ul>
            </div>

            {/* Wait Time Analysis */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Wait Time Analysis</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Average wait time: <span className="font-semibold">{formatWaitTime(averageWaitTimeMinutes)}</span>
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {averageWaitTimeMinutes > 60 && (
                  <li>• Long wait times may lead to drop-offs - consider increasing session capacity</li>
                )}
                {averageWaitTimeMinutes < 15 && (
                  <li>• Fast turnaround time! Users are getting spots quickly</li>
                )}
                <li>• Target wait time: Under 30 minutes for optimal user experience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
