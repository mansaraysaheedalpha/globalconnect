// src/app/(platform)/dashboard/events/[eventId]/analytics/_components/ad-campaign-analytics.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  MousePointer,
  TrendingUp,
  Zap,
  AlertCircle,
  Archive,
  Activity,
  Image as ImageIcon,
  Video,
  Megaphone
} from "lucide-react";

interface AdPerformer {
  adId: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  isArchived?: boolean;
  contentType?: string;
}

interface AdData {
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  activeAdsCount?: number;
  archivedAdsCount?: number;
  topPerformers: AdPerformer[];
  allAdsPerformance?: AdPerformer[];
}

interface AdCampaignAnalyticsProps {
  eventId: string;
  data?: AdData;
  dateRange: { from: string; to: string };
  includeArchived?: boolean;
  onIncludeArchivedChange?: (value: boolean) => void;
}

// Helper to get content type icon
const getContentTypeIcon = (contentType?: string) => {
  switch (contentType?.toUpperCase()) {
    case "VIDEO":
      return <Video className="h-4 w-4 text-purple-500" />;
    case "SPONSORED_SESSION":
      return <Megaphone className="h-4 w-4 text-blue-500" />;
    default:
      return <ImageIcon className="h-4 w-4 text-green-500" />;
  }
};

export function AdCampaignAnalytics({
  eventId,
  data,
  dateRange,
  includeArchived = false,
  onIncludeArchivedChange
}: AdCampaignAnalyticsProps) {
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

  const {
    totalImpressions,
    totalClicks,
    averageCTR,
    topPerformers,
    activeAdsCount = 0,
    archivedAdsCount = 0,
    allAdsPerformance = []
  } = data;

  // CTR benchmark classification
  const getCTRQuality = (ctr: number) => {
    if (ctr >= 2.0) return { label: "Excellent", color: "text-green-600", variant: "default" as const };
    if (ctr >= 1.0) return { label: "Good", color: "text-blue-600", variant: "secondary" as const };
    if (ctr >= 0.5) return { label: "Average", color: "text-yellow-600", variant: "secondary" as const };
    return { label: "Needs Improvement", color: "text-red-600", variant: "destructive" as const };
  };

  const overallCTRQuality = getCTRQuality(averageCTR);

  // Use allAdsPerformance for the complete breakdown, fallback to topPerformers
  const adsToDisplay = allAdsPerformance.length > 0 ? allAdsPerformance : topPerformers;

  // Pre-compute low performing ads to avoid duplicate filtering
  const lowPerformingAds = adsToDisplay.filter(
    ad => !ad.isArchived && ad.ctr < 0.5 && ad.impressions > 0
  );

  return (
    <div className="space-y-6">
      {/* Header with Historical Data Toggle */}
      {onIncludeArchivedChange && archivedAdsCount > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{activeAdsCount} Active Ads</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Archive className="h-4 w-4" />
                  <span className="text-sm">{archivedAdsCount} Archived</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="include-archived"
                  checked={includeArchived}
                  onCheckedChange={onIncludeArchivedChange}
                />
                <Label htmlFor="include-archived" className="text-sm cursor-pointer">
                  Include historical data
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Ads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAdsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently running
            </p>
          </CardContent>
        </Card>

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

      {/* Individual Ad Performance - Full Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Individual Ad Performance
            {includeArchived && archivedAdsCount > 0 && (
              <Badge variant="outline" className="ml-2 font-normal">
                Including archived
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Complete breakdown of each ad's performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adsToDisplay && adsToDisplay.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adsToDisplay.map((ad) => {
                  const quality = getCTRQuality(ad.ctr);
                  return (
                    <TableRow
                      key={ad.adId}
                      className={ad.isArchived ? "opacity-60" : ""}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {ad.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getContentTypeIcon(ad.contentType)}
                          <span className="text-xs text-muted-foreground">
                            {ad.contentType || "BANNER"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ad.isArchived ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Archive className="h-3 w-3 mr-1" />
                            Archived
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20">
                            <Activity className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {ad.impressions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {ad.clicks.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
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
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No ad performance data available</p>
              <p className="text-sm mt-1">Create ads and they'll appear here once they receive impressions</p>
            </div>
          )}
        </CardContent>
      </Card>

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="text-xs text-red-600 dark:text-red-400 mb-1">Poor</div>
                <div className="text-sm font-semibold">&lt; 0.5%</div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Average</div>
                <div className="text-sm font-semibold">0.5% - 1.0%</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Good</div>
                <div className="text-sm font-semibold">1.0% - 2.0%</div>
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
                    <li>Consider more compelling ad creative and clear CTAs</li>
                    <li>Test different ad placements (hero vs. sidebar vs. session break)</li>
                    <li>Ensure ads are relevant to your audience</li>
                  </>
                )}
                {averageCTR >= 0.5 && averageCTR < 1.0 && (
                  <>
                    <li>Good start! Try A/B testing different creatives</li>
                    <li>Experiment with video ads vs. banner ads</li>
                    <li>Optimize ad timing and frequency</li>
                  </>
                )}
                {averageCTR >= 1.0 && averageCTR < 2.0 && (
                  <>
                    <li>Great performance! Your ads are resonating well</li>
                    <li>Consider testing new placements to expand reach</li>
                    <li>Analyze which ad types perform best</li>
                  </>
                )}
                {averageCTR >= 2.0 && (
                  <>
                    <li>Excellent performance! Your ads are highly engaging</li>
                    <li>Consider expanding ad inventory for more revenue</li>
                    <li>Document what's working to replicate success</li>
                  </>
                )}
                <li>Industry average CTR for display ads is 0.35% - 1.0%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Performing Ads Warning */}
      {lowPerformingAds.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              Low Performance Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Some of your active ads have CTR below 0.5%. Consider pausing or optimizing these ads:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
              {lowPerformingAds.map(ad => (
                <li key={ad.adId}>{ad.name} ({ad.ctr.toFixed(2)}% CTR from {ad.impressions} impressions)</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
