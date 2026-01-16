// src/app/(sponsor)/sponsor/analytics/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  TrendingUp,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
} from "lucide-react";
import { useState } from "react";

// Stats card component
function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {change && (
            <span
              className={`text-xs flex items-center ${
                changeType === "positive"
                  ? "text-green-600"
                  : changeType === "negative"
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {changeType === "positive" ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : changeType === "negative" ? (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              ) : null}
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Chart placeholder component
function ChartPlaceholder({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
          <div className="text-center text-muted-foreground">
            <Icon className="h-12 w-12 mx-auto opacity-50" />
            <p className="mt-2 text-sm">Chart visualization</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SponsorAnalyticsPage() {
  const [dateRange, setDateRange] = useState("today");

  // Mock analytics data
  const analytics = {
    totalLeads: 147,
    leadsChange: "+23%",
    boothVisits: 312,
    visitsChange: "+15%",
    avgEngagementTime: "4m 32s",
    timeChange: "+12%",
    conversionRate: 15.8,
    rateChange: "+2.3%",
    contentDownloads: 89,
    demoRequests: 23,
    messagesExchanged: 156,
  };

  // Intent distribution data
  const intentDistribution = [
    { level: "Hot", count: 23, percentage: 15.6, color: "bg-red-500" },
    { level: "Warm", count: 58, percentage: 39.5, color: "bg-orange-500" },
    { level: "Cold", count: 66, percentage: 44.9, color: "bg-blue-500" },
  ];

  // Top interaction types
  const interactionTypes = [
    { type: "Booth Visit", count: 156, percentage: 50 },
    { type: "Content Download", count: 89, percentage: 28.5 },
    { type: "Demo Request", count: 23, percentage: 7.4 },
    { type: "Direct Request", count: 44, percentage: 14.1 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your booth performance and lead quality
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="event">Entire Event</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads Captured"
          value={analytics.totalLeads}
          change={analytics.leadsChange}
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Booth Visits"
          value={analytics.boothVisits}
          change={analytics.visitsChange}
          changeType="positive"
          icon={Target}
        />
        <StatsCard
          title="Avg. Engagement Time"
          value={analytics.avgEngagementTime}
          change={analytics.timeChange}
          changeType="positive"
          icon={Clock}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${analytics.conversionRate}%`}
          change={analytics.rateChange}
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPlaceholder
          title="Leads Over Time"
          description="Lead capture trend throughout the event"
          icon={BarChart3}
        />
        <ChartPlaceholder
          title="Engagement Timeline"
          description="Booth activity patterns by hour"
          icon={Activity}
        />
      </div>

      {/* Distribution Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Intent Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Lead Intent Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of leads by engagement level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {intentDistribution.map((item) => (
                <div key={item.level} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.level}</span>
                    <span className="text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interaction Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Interaction Types
            </CardTitle>
            <CardDescription>
              How leads are engaging with your booth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interactionTypes.map((item) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Content Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.contentDownloads}</div>
            <p className="text-sm text-muted-foreground mt-1">
              PDFs, brochures, and resources
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Demo Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.demoRequests}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Scheduled or pending demos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Messages Exchanged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.messagesExchanged}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Follow-up communications sent
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
