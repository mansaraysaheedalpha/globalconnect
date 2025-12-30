// src/app/(platform)/dashboard/events/[eventId]/analytics/_components/ad-campaign-analytics.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, MousePointer, TrendingUp, Zap, AlertCircle } from "lucide-react";

interface AdData {
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  topPerformers: Array<{
    adId: string;
    name: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
}

interface AdCampaignAnalyticsProps {
  eventId: string;
  data?: AdData;
  dateRange: { from: string; to: string };
}

export function AdCampaignAnalytics({ eventId, data, dateRange }: AdCampaignAnalyticsProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ad Campaign Analytics</CardTitle>
          <CardDescription>No ad data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { totalImpressions, totalClicks, averageCTR, topPerformers } = data;

  // CTR benchmark classification
  const getCTRQuality = (ctr: number) => {
    if (ctr >= 2.0) return { label: "Excellent", color: "text-green-600", variant: "default" as const };
    if (ctr >= 1.0) return { label: "Good", color: "text-blue-600", variant: "secondary" as const };
    if (ctr >= 0.5) return { label: "Average", color: "text-yellow-600", variant: "secondary" as const };
    return { label: "Needs Improvement", color: "text-red-600", variant: "destructive" as const };
  };

  const overallCTRQuality = getCTRQuality(averageCTR);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Impressions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Viewable ad impressions
            </p>
          </CardContent>
        </Card>

        {/* Total Clicks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Click-through events
            </p>
          </CardContent>
        </Card>

        {/* Average CTR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCTR.toFixed(2)}%</div>
            <div className="mt-2">
              <Badge variant={overallCTRQuality.variant} className={overallCTRQuality.color}>
                {overallCTRQuality.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTR Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Click-Through Rate Analysis</CardTitle>
          <CardDescription>Industry benchmarks and performance insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Your CTR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Average CTR</span>
                <span className="text-sm font-semibold">{averageCTR.toFixed(2)}%</span>
              </div>
              <Progress value={Math.min(averageCTR * 20, 100)} className="h-3" />
            </div>

            {/* Benchmark Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="text-xs text-red-600 dark:text-red-400 mb-1">Poor</div>
                <div className="text-sm font-semibold">&lt; 0.5%</div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Average</div>
                <div className="text-sm font-semibold">0.5% - 1.0%</div>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="text-xs text-green-600 dark:text-green-400 mb-1">Excellent</div>
                <div className="text-sm font-semibold">&gt; 2.0%</div>
              </div>
            </div>

            {/* Insights */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Optimization Tips
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {averageCTR < 0.5 && (
                  <>
                    <li>• Consider more compelling ad creative and clear CTAs</li>
                    <li>• Test different ad placements (top vs. sidebar)</li>
                    <li>• Ensure ads are relevant to your audience</li>
                  </>
                )}
                {averageCTR >= 0.5 && averageCTR < 1.0 && (
                  <>
                    <li>• Good start! Try A/B testing different creatives</li>
                    <li>• Experiment with video ads vs. banner ads</li>
                    <li>• Optimize ad timing and frequency</li>
                  </>
                )}
                {averageCTR >= 2.0 && (
                  <>
                    <li>• Excellent performance! Your ads are highly engaging</li>
                    <li>• Consider expanding ad inventory for more revenue</li>
                    <li>• Document what's working to replicate success</li>
                  </>
                )}
                <li>• Industry average CTR for display ads is 0.35% - 1.0%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Ads */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Ads</CardTitle>
          <CardDescription>Ads ranked by click-through rate</CardDescription>
        </CardHeader>
        <CardContent>
          {topPerformers && topPerformers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Ad Name</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((ad, index) => {
                  const quality = getCTRQuality(ad.ctr);
                  return (
                    <TableRow key={ad.adId}>
                      <TableCell>
                        {index === 0 ? (
                          <Badge className="bg-yellow-500">🥇 1st</Badge>
                        ) : index === 1 ? (
                          <Badge variant="secondary">🥈 2nd</Badge>
                        ) : index === 2 ? (
                          <Badge variant="secondary">🥉 3rd</Badge>
                        ) : (
                          <span className="text-muted-foreground">#{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{ad.name}</TableCell>
                      <TableCell className="text-right">{ad.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{ad.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {ad.ctr.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={quality.variant} className={quality.color}>
                          {quality.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No ad performance data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Performing Ads Warning */}
      {topPerformers && topPerformers.some(ad => ad.ctr < 0.5) && (
        <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              Low Performance Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Some of your ads have CTR below 0.5%. Consider pausing or optimizing these ads:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
              {topPerformers.filter(ad => ad.ctr < 0.5).map(ad => (
                <li key={ad.adId}>• {ad.name} ({ad.ctr.toFixed(2)}% CTR)</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
