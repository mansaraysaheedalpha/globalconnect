// src/app/(sponsor)/sponsor/analytics/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  AlertCircle,
  RefreshCw,
  Mail,
  Eye,
  MousePointer,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/charts";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import type {
  LeadTimelineResponse,
  LeadTimelineDataPoint,
  EngagementTimelineResponse,
  EngagementDataPoint,
} from "@/types/leads";

interface SponsorStats {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  leads_contacted: number;
  leads_converted: number;
  conversion_rate: number;
  avg_intent_score: number;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
  completed_at: string | null;
}

interface Lead {
  id: string;
  interactions: Array<{ type: string; timestamp: string }>;
  interaction_count: number;
}

// Stats card component
function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  subtitle,
  isLoading,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  subtitle?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

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

// Leads Over Time Chart Component
function LeadsOverTimeChart({
  data,
  isLoading,
}: {
  data: LeadTimelineDataPoint[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart display
  const chartData = data.map((point) => ({
    date: format(parseISO(point.date), "MMM d"),
    fullDate: point.date,
    total: point.total,
    hot: point.hot,
    warm: point.warm,
    cold: point.cold,
  }));

  const hasData = chartData.some((d) => d.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Leads Over Time
        </CardTitle>
        <CardDescription>Lead capture trend throughout the event</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            config={{
              hot: { label: "Hot Leads", color: "hsl(var(--destructive))" },
              warm: { label: "Warm Leads", color: "hsl(38 92% 50%)" },
              cold: { label: "Cold Leads", color: "hsl(217 91% 60%)" },
            }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="hotGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="warmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="coldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip content={ChartTooltipContent} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="hot"
                  name="Hot"
                  stroke="hsl(var(--destructive))"
                  fill="url(#hotGradient)"
                  strokeWidth={2}
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="warm"
                  name="Warm"
                  stroke="hsl(38 92% 50%)"
                  fill="url(#warmGradient)"
                  strokeWidth={2}
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="cold"
                  name="Cold"
                  stroke="hsl(217 91% 60%)"
                  fill="url(#coldGradient)"
                  strokeWidth={2}
                  stackId="1"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto opacity-50" />
              <p className="mt-2 text-sm">No lead data available yet</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Engagement Timeline Chart Component
function EngagementTimelineChart({
  data,
  peakHour,
  isLoading,
}: {
  data: EngagementDataPoint[];
  peakHour: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Format hours for display (e.g., "9 AM", "2 PM")
  const chartData = data.map((point) => ({
    hour: point.hour,
    hourLabel: format(new Date().setHours(point.hour, 0, 0, 0), "ha"),
    interactions: point.interaction_count,
    visitors: point.unique_visitors,
    isPeak: point.hour === peakHour,
  }));

  const hasData = chartData.some((d) => d.interactions > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Engagement Timeline
        </CardTitle>
        <CardDescription>
          Booth activity patterns by hour
          {hasData && peakHour !== undefined && (
            <span className="ml-2 text-primary font-medium">
              (Peak: {format(new Date().setHours(peakHour, 0, 0, 0), "ha")})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            config={{
              interactions: { label: "Interactions", color: "hsl(var(--primary))" },
              visitors: { label: "Unique Visitors", color: "hsl(var(--chart-2))" },
            }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="hourLabel"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip content={ChartTooltipContent} />
                <Legend />
                <Bar
                  dataKey="interactions"
                  name="Interactions"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="visitors"
                  name="Unique Visitors"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto opacity-50" />
              <p className="mt-2 text-sm">No engagement data available yet</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Chart placeholder component (kept for fallback)
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
            <p className="mt-2 text-sm">Chart visualization coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SponsorAnalyticsPage() {
  const { token } = useAuthStore();
  const { activeSponsorId, activeSponsorName } = useSponsorStore();
  const [stats, setStats] = useState<SponsorStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("event");

  // Timeline chart data state
  const [timelineData, setTimelineData] = useState<LeadTimelineDataPoint[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);

  // Engagement timeline data state
  const [engagementData, setEngagementData] = useState<EngagementDataPoint[]>([]);
  const [engagementPeakHour, setEngagementPeakHour] = useState<number>(0);
  const [isLoadingEngagement, setIsLoadingEngagement] = useState(true);

  // Campaign performance data state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignDetailsOpen, setCampaignDetailsOpen] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

  // Map date range to days parameter
  const getDaysFromDateRange = (range: string): number => {
    switch (range) {
      case "today": return 1;
      case "yesterday": return 2;
      case "week": return 7;
      case "event":
      default: return 30;
    }
  };

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!token || !activeSponsorId) return;

    setIsLoading(true);
    setIsLoadingTimeline(true);
    setIsLoadingEngagement(true);
    setIsLoadingCampaigns(true);
    setError(null);

    const days = getDaysFromDateRange(dateRange);

    try {
      // Fetch all data in parallel
      const [statsResponse, leadsResponse, timelineResponse, engagementResponse, campaignsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads?limit=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/timeline?days=${days}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/engagement-timeline?days=${days}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE_URL}/sponsors-campaigns/sponsors/${activeSponsorId}/campaigns?limit=20`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        setLeads(leadsData);
      }

      // Process timeline data
      if (timelineResponse.ok) {
        const timelineResult: LeadTimelineResponse = await timelineResponse.json();
        setTimelineData(timelineResult.data);
      }
      setIsLoadingTimeline(false);

      // Process engagement data
      if (engagementResponse.ok) {
        const engagementResult: EngagementTimelineResponse = await engagementResponse.json();
        setEngagementData(engagementResult.data);
        setEngagementPeakHour(engagementResult.peak_hour);
      }
      setIsLoadingEngagement(false);

      // Process campaigns data
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData.campaigns || []);
      }
      setIsLoadingCampaigns(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
      setIsLoadingTimeline(false);
      setIsLoadingEngagement(false);
      setIsLoadingCampaigns(false);
    } finally {
      setIsLoading(false);
    }
  }, [token, activeSponsorId, API_BASE_URL, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh charts every 60 seconds for near real-time updates
  useEffect(() => {
    if (!token || !activeSponsorId) return;

    const refreshInterval = setInterval(() => {
      // Silently refresh timeline data without showing loading state
      const refreshCharts = async () => {
        const days = getDaysFromDateRange(dateRange);

        try {
          const [timelineResponse, engagementResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/timeline?days=${days}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }),
            fetch(`${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/engagement-timeline?days=${days}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }),
          ]);

          if (timelineResponse.ok) {
            const timelineResult: LeadTimelineResponse = await timelineResponse.json();
            setTimelineData(timelineResult.data);
          }

          if (engagementResponse.ok) {
            const engagementResult: EngagementTimelineResponse = await engagementResponse.json();
            setEngagementData(engagementResult.data);
            setEngagementPeakHour(engagementResult.peak_hour);
          }
        } catch {
          // Silently fail on background refresh
        }
      };

      refreshCharts();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(refreshInterval);
  }, [token, activeSponsorId, dateRange, API_BASE_URL]);

  // WebSocket connection for real-time lead updates
  useEffect(() => {
    if (!token || !activeSponsorId) return;

    const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_SERVICE_URL || "http://localhost:3002";

    // Dynamic import to avoid SSR issues with socket.io
    let socket: ReturnType<typeof import("socket.io-client").io> | null = null;

    const connectSocket = async () => {
      const { io } = await import("socket.io-client");

      socket = io(REALTIME_URL, {
        auth: { token: `Bearer ${token}` },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 3,
      });

      socket.on("connect", () => {
        // Join sponsor room to receive lead updates
        socket?.emit("sponsor.leads.join", { sponsorId: activeSponsorId });
      });

      // Listen for new lead captures to trigger chart refresh
      socket.on("lead.captured.new", () => {
        // Increment chart data in real-time
        const today = new Date().toISOString().split("T")[0];
        setTimelineData((prev) => {
          const updated = [...prev];
          const todayIndex = updated.findIndex((d) => d.date === today);
          if (todayIndex >= 0) {
            updated[todayIndex] = {
              ...updated[todayIndex],
              total: updated[todayIndex].total + 1,
            };
          }
          return updated;
        });
      });
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, activeSponsorId]);

  // Calculate intent distribution from stats
  const intentDistribution = stats
    ? [
        {
          level: "Hot",
          count: stats.hot_leads,
          percentage: stats.total_leads > 0 ? (stats.hot_leads / stats.total_leads) * 100 : 0,
          color: "bg-red-500",
        },
        {
          level: "Warm",
          count: stats.warm_leads,
          percentage: stats.total_leads > 0 ? (stats.warm_leads / stats.total_leads) * 100 : 0,
          color: "bg-orange-500",
        },
        {
          level: "Cold",
          count: stats.cold_leads,
          percentage: stats.total_leads > 0 ? (stats.cold_leads / stats.total_leads) * 100 : 0,
          color: "bg-blue-500",
        },
      ]
    : [];

  // Calculate interaction types from leads
  const interactionCounts: Record<string, number> = {};
  leads.forEach((lead) => {
    lead.interactions?.forEach((interaction) => {
      const type = interaction.type || "Unknown";
      interactionCounts[type] = (interactionCounts[type] || 0) + 1;
    });
  });

  const totalInteractions = Object.values(interactionCounts).reduce((a, b) => a + b, 0);
  const interactionTypes = Object.entries(interactionCounts)
    .map(([type, count]) => ({
      type: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      count,
      percentage: totalInteractions > 0 ? (count / totalInteractions) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state if no active sponsor
  if (!activeSponsorId && !isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              Please select a sponsor event to view analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            {activeSponsorName
              ? `Performance analytics for ${activeSponsorName}`
              : "Track your booth performance and lead quality"}
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
          value={stats?.total_leads ?? 0}
          icon={Users}
          isLoading={isLoading}
        />
        <StatsCard
          title="Hot Leads"
          value={stats?.hot_leads ?? 0}
          subtitle="High intent"
          icon={Target}
          isLoading={isLoading}
        />
        <StatsCard
          title="Avg. Intent Score"
          value={stats?.avg_intent_score?.toFixed(1) ?? "0"}
          icon={Clock}
          isLoading={isLoading}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats?.conversion_rate?.toFixed(1) ?? 0}%`}
          icon={TrendingUp}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LeadsOverTimeChart
          data={timelineData}
          isLoading={isLoadingTimeline}
        />
        <EngagementTimelineChart
          data={engagementData}
          peakHour={engagementPeakHour}
          isLoading={isLoadingEngagement}
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
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : intentDistribution.length > 0 ? (
              <div className="space-y-4">
                {intentDistribution.map((item) => (
                  <div key={item.level} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.level}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({item.percentage.toFixed(1)}%)
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
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <PieChart className="h-8 w-8 mx-auto opacity-50 mb-2" />
                <p className="text-sm">No lead data available yet</p>
              </div>
            )}
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
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : interactionTypes.length > 0 ? (
              <div className="space-y-4">
                {interactionTypes.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.type}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({item.percentage.toFixed(1)}%)
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
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto opacity-50 mb-2" />
                <p className="text-sm">No interaction data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Contacted
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.leads_contacted ?? 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Follow-up initiated
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.leads_converted ?? 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Successfully converted
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">{totalInteractions}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  All booth interactions
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Campaign Performance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Campaign Performance
          </CardTitle>
          <CardDescription>
            Track open rates, click rates, and engagement for your email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCampaigns ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Send className="h-12 w-12 mx-auto opacity-50 mb-3" />
              <p className="font-medium">No campaigns sent yet</p>
              <p className="text-sm mt-1">
                Send your first email campaign from the Messages tab to see performance metrics here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              {(() => {
                const sentCampaigns = campaigns.filter(c => c.status === "sent");
                // Use sent_count as the base metric (delivered_count requires webhooks)
                const totalSent = sentCampaigns.reduce((sum, c) => sum + c.sent_count, 0);
                const totalOpened = sentCampaigns.reduce((sum, c) => sum + c.opened_count, 0);
                const totalClicked = sentCampaigns.reduce((sum, c) => sum + c.clicked_count, 0);
                const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
                const avgClickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Send className="h-4 w-4" />
                        Campaigns
                      </div>
                      <p className="text-2xl font-bold">{sentCampaigns.length}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Sent
                      </div>
                      <p className="text-2xl font-bold">{totalSent}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                        <Eye className="h-4 w-4" />
                        Avg Open Rate
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{avgOpenRate.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
                        <MousePointer className="h-4 w-4" />
                        Avg Click Rate
                      </div>
                      <p className="text-2xl font-bold text-green-700">{avgClickRate.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })()}

              {/* Campaign List */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Recent Campaigns</h4>
                {campaigns.slice(0, 5).map((campaign) => {
                  // Use sent_count as base (delivered_count requires webhooks)
                  const openRate = campaign.sent_count > 0
                    ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1)
                    : "0";
                  const clickRate = campaign.opened_count > 0
                    ? ((campaign.clicked_count / campaign.opened_count) * 100).toFixed(1)
                    : "0";

                  return (
                    <div
                      key={campaign.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setCampaignDetailsOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{campaign.subject}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {campaign.total_recipients} recipients • {campaign.completed_at ? format(parseISO(campaign.completed_at), "MMM d, yyyy") : "Not sent"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-blue-600">
                              <Eye className="h-4 w-4" />
                              <span className="font-medium">{openRate}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">opens</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-green-600">
                              <MousePointer className="h-4 w-4" />
                              <span className="font-medium">{clickRate}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">clicks</p>
                          </div>
                        </div>
                      </div>

                      {campaign.status === "sent" && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Open Rate</span>
                              <span className="font-medium text-blue-600">{openRate}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${Math.min(parseFloat(openRate), 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Click Rate</span>
                              <span className="font-medium text-green-600">{clickRate}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${Math.min(parseFloat(clickRate), 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details Modal */}
      <Dialog open={campaignDetailsOpen} onOpenChange={setCampaignDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Campaign Performance
            </DialogTitle>
            <DialogDescription>
              Detailed metrics for this email campaign
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-6">
              {/* Campaign Info */}
              <div className="space-y-2">
                <h4 className="font-medium">{selectedCampaign.subject}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedCampaign.completed_at
                    ? format(parseISO(selectedCampaign.completed_at), "MMM d, yyyy h:mm a")
                    : format(parseISO(selectedCampaign.created_at), "MMM d, yyyy h:mm a")}
                </p>
              </div>

              {/* Delivery Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    Recipients
                  </div>
                  <p className="text-2xl font-bold">{selectedCampaign.total_recipients}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Sent
                  </div>
                  <p className="text-2xl font-bold text-green-700">{selectedCampaign.sent_count}</p>
                  <p className="text-xs text-green-600">
                    {selectedCampaign.total_recipients > 0
                      ? ((selectedCampaign.sent_count / selectedCampaign.total_recipients) * 100).toFixed(1)
                      : 0}% send rate
                  </p>
                </div>
              </div>

              {/* Engagement Stats */}
              {selectedCampaign.status === "sent" && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Engagement Metrics
                  </h4>

                  {/* Open Rate */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Opens</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {selectedCampaign.opened_count} opens
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{
                          width: `${selectedCampaign.sent_count > 0
                            ? Math.min((selectedCampaign.opened_count / selectedCampaign.sent_count) * 100, 100)
                            : 0}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedCampaign.sent_count > 0
                        ? ((selectedCampaign.opened_count / selectedCampaign.sent_count) * 100).toFixed(1)
                        : 0}% open rate
                    </p>
                  </div>

                  {/* Click Rate */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Clicks</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {selectedCampaign.clicked_count} clicks
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{
                          width: `${selectedCampaign.opened_count > 0
                            ? Math.min((selectedCampaign.clicked_count / selectedCampaign.opened_count) * 100, 100)
                            : 0}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedCampaign.opened_count > 0
                        ? ((selectedCampaign.clicked_count / selectedCampaign.opened_count) * 100).toFixed(1)
                        : 0}% click-through rate (of opens)
                    </p>
                  </div>

                  {/* Failed Deliveries */}
                  {selectedCampaign.failed_count > 0 && (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-700">
                          {selectedCampaign.failed_count} failed delivery{selectedCampaign.failed_count !== 1 ? "ies" : ""}
                        </span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        These emails could not be delivered due to invalid addresses or server issues.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Helpful Tips */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> Industry average open rates are 15-25%. Click rates of 2-5% are considered good.
                  {selectedCampaign.sent_count > 0 && selectedCampaign.opened_count / selectedCampaign.sent_count > 0.25 && (
                    <span className="block mt-1 text-green-700">Your open rate is above average!</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
