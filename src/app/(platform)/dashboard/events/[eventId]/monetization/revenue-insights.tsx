// src/app/(platform)/dashboard/events/[eventId]/monetization/revenue-insights.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_MONETIZATION_ANALYTICS_QUERY } from "@/graphql/monetization.graphql";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Eye,
  ShoppingBag,
  RefreshCw
} from "lucide-react";
import { RevenueOverview } from "../analytics/_components/revenue-overview";
import { OfferPerformance } from "../analytics/_components/offer-performance";
import { AdCampaignAnalytics } from "../analytics/_components/ad-campaign-analytics";
import { WaitlistMetrics } from "../analytics/_components/waitlist-metrics";
import { ConversionFunnel } from "../analytics/_components/conversion-funnel";
import { DateRangePicker } from "../analytics/_components/date-range-picker";
import { ExportReportDialog } from "../analytics/_components/export-report-dialog";
import { ScheduledReports } from "../analytics/_components/scheduled-reports";
import { ChartErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, format } from "date-fns";
import { formatCurrency, formatPercent } from "@/lib/format-utils";

// M-CQ5: Named constant for auto-refresh interval
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const RevenueInsights = () => {
  const params = useParams();
  const eventId = params.eventId as string;

  const [dateRange, setDateRange] = useState({
    from: format(addDays(new Date(), -30), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });

  const { data, loading, error, refetch } = useQuery(GET_MONETIZATION_ANALYTICS_QUERY, {
    variables: {
      eventId,
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
    },
    fetchPolicy: "cache-and-network",
  });

  const analytics = data?.monetizationAnalytics;

  // Memoize derived metric calculations to avoid recomputing on every render
  const keyMetrics = useMemo(() => {
    if (!analytics) return null;
    return {
      totalRevenue: formatCurrency(analytics.revenue?.total || 0),
      offerRevenueDisplay: analytics.revenue?.fromOffers
        ? `${formatCurrency(analytics.revenue.fromOffers)} from offers`
        : "No offer revenue",
      conversionRate: formatPercent(analytics.offers?.conversionRate || 0, 2),
      totalPurchases: analytics.offers?.totalPurchases || 0,
      totalViews: analytics.offers?.totalViews || 0,
      totalImpressions: (analytics.ads?.totalImpressions || 0).toLocaleString(),
      averageCTR: formatPercent(analytics.ads?.averageCTR || 0, 2),
      acceptanceRate: formatPercent(analytics.waitlist?.acceptanceRate || 0, 1),
      offersIssued: analytics.waitlist?.offersIssued || 0,
    };
  }, [analytics]);

  // M-FE1: Track last updated timestamp
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch().then(() => setLastUpdated(new Date()));
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  // Update timestamp on manual refetch or initial load
  useEffect(() => {
    if (!loading && data) {
      setLastUpdated(new Date());
    }
  }, [data, loading]);

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Revenue Insights
          </h2>
          <p className="text-muted-foreground">
            Track revenue, conversions, and performance across offers, ads, and waitlists.
            <span className="ml-2 text-xs">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <ExportReportDialog
            eventId={eventId}
            dateRange={dateRange}
            analyticsData={analytics}
          />
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load analytics: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {keyMetrics?.totalRevenue}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {keyMetrics?.offerRevenueDisplay}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offer Conversion Rate</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {keyMetrics?.conversionRate}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {keyMetrics?.totalPurchases} purchases from {keyMetrics?.totalViews} views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ad Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {keyMetrics?.totalImpressions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {keyMetrics?.averageCTR} CTR
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waitlist Acceptance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {keyMetrics?.acceptanceRate}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {keyMetrics?.offersIssued} offers issued
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
              <TabsTrigger value="ads">Ads</TabsTrigger>
              <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
              <TabsTrigger value="funnel">Funnel</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ChartErrorBoundary chartName="Revenue Overview">
                <RevenueOverview data={analytics?.revenue} />
              </ChartErrorBoundary>
            </TabsContent>

            <TabsContent value="offers" className="space-y-6">
              <ChartErrorBoundary chartName="Offer Performance">
                <OfferPerformance
                  eventId={eventId}
                  data={analytics?.offers}
                  dateRange={dateRange}
                />
              </ChartErrorBoundary>
            </TabsContent>

            <TabsContent value="ads" className="space-y-6">
              <ChartErrorBoundary chartName="Ad Campaign Analytics">
                <AdCampaignAnalytics
                  eventId={eventId}
                  data={analytics?.ads}
                  dateRange={dateRange}
                />
              </ChartErrorBoundary>
            </TabsContent>

            <TabsContent value="waitlist" className="space-y-6">
              <ChartErrorBoundary chartName="Waitlist Metrics">
                <WaitlistMetrics data={analytics?.waitlist} />
              </ChartErrorBoundary>
            </TabsContent>

            <TabsContent value="funnel" className="space-y-6">
              <ChartErrorBoundary chartName="Conversion Funnel">
                <ConversionFunnel data={analytics} />
              </ChartErrorBoundary>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <ScheduledReports eventId={eventId} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};