// src/app/(platform)/dashboard/events/[eventId]/analytics/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_MONETIZATION_ANALYTICS_QUERY } from "@/graphql/monetization.graphql";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Eye,
  MousePointer,
  ShoppingBag,
  Download,
  Calendar,
  RefreshCw
} from "lucide-react";
import { RevenueOverview } from "./_components/revenue-overview";
import { OfferPerformance } from "./_components/offer-performance";
import { AdCampaignAnalytics } from "./_components/ad-campaign-analytics";
import { WaitlistMetrics } from "./_components/waitlist-metrics";
import { ConversionFunnel } from "./_components/conversion-funnel";
import { DateRangePicker } from "./_components/date-range-picker";
import { ExportReportDialog } from "./_components/export-report-dialog";
import { ScheduledReports } from "./_components/scheduled-reports";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { addDays, format } from "date-fns";

export default function MonetizationAnalyticsPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  // Date range state (default: last 30 days)
  const [dateRange, setDateRange] = useState({
    from: format(addDays(new Date(), -30), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });

  // Fetch analytics data
  const { data, loading, error, refetch } = useQuery(GET_MONETIZATION_ANALYTICS_QUERY, {
    variables: {
      eventId,
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
    },
    fetchPolicy: "cache-and-network",
  });

  const analytics = data?.monetizationAnalytics;

  const handleRefresh = () => {
    refetch();
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Monetization Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Track revenue, conversions, and performance across offers, ads, and waitlists.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Picker */}
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />

          {/* Refresh Button */}
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {/* Export Dialog */}
          <ExportReportDialog
            eventId={eventId}
            dateRange={dateRange}
            analyticsData={analytics}
          />
        </div>
      </div>

      {loading && !data ? (
        <AnalyticsSkeleton />
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load analytics: {error.message}</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${((analytics?.revenue?.total || 0) / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics?.revenue?.fromOffers
                    ? `$${(analytics.revenue.fromOffers / 100).toFixed(2)} from offers`
                    : "No offer revenue"
                  }
                </p>
              </CardContent>
            </Card>

            {/* Offer Conversions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offer Conversion Rate</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.offers?.conversionRate?.toFixed(2) || 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics?.offers?.totalPurchases || 0} purchases from {analytics?.offers?.totalViews || 0} views
                </p>
              </CardContent>
            </Card>

            {/* Ad Impressions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ad Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analytics?.ads?.totalImpressions || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics?.ads?.averageCTR?.toFixed(2) || 0}% CTR
                </p>
              </CardContent>
            </Card>

            {/* Waitlist Acceptance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waitlist Acceptance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.waitlist?.acceptanceRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics?.waitlist?.offersIssued || 0} offers issued
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

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <RevenueOverview data={analytics?.revenue} />
            </TabsContent>

            {/* Offers Tab */}
            <TabsContent value="offers" className="space-y-6">
              <OfferPerformance
                eventId={eventId}
                data={analytics?.offers}
                dateRange={dateRange}
              />
            </TabsContent>

            {/* Ads Tab */}
            <TabsContent value="ads" className="space-y-6">
              <AdCampaignAnalytics
                eventId={eventId}
                data={analytics?.ads}
                dateRange={dateRange}
              />
            </TabsContent>

            {/* Waitlist Tab */}
            <TabsContent value="waitlist" className="space-y-6">
              <WaitlistMetrics data={analytics?.waitlist} />
            </TabsContent>

            {/* Conversion Funnel Tab */}
            <TabsContent value="funnel" className="space-y-6">
              <ConversionFunnel data={analytics} />
            </TabsContent>

            {/* Scheduled Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <ScheduledReports eventId={eventId} />
            </TabsContent>
          </Tabs>
        </>
      )}
      </div>
    </ErrorBoundary>
  );
}

// Loading skeleton
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
