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
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

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

interface Lead {
  id: string;
  interactions: Array<{ type: string; timestamp: string }>;
  interaction_count: number;
}

interface Sponsor {
  id: string;
  company_name: string;
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
            <p className="mt-2 text-sm">Chart visualization coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SponsorAnalyticsPage() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<SponsorStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("event");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Fetch user's sponsors
  useEffect(() => {
    const fetchSponsors = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${apiUrl}/my-sponsors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sponsors");
        }

        const data = await response.json();
        setSponsors(data);
        if (data.length > 0) {
          setSelectedSponsorId(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sponsors");
      }
    };

    fetchSponsors();
  }, [token, apiUrl]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!token || !selectedSponsorId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch stats and leads in parallel
      const [statsResponse, leadsResponse] = await Promise.all([
        fetch(`${apiUrl}/sponsors/${selectedSponsorId}/leads/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/sponsors/${selectedSponsorId}/leads?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedSponsorId, apiUrl]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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

  if (sponsors.length === 0 && !isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Access</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              You are not currently associated with any sponsors.
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
            Track your booth performance and lead quality
          </p>
        </div>
        <div className="flex gap-2">
          {sponsors.length > 1 && (
            <Select value={selectedSponsorId || ""} onValueChange={setSelectedSponsorId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Sponsor" />
              </SelectTrigger>
              <SelectContent>
                {sponsors.map((sponsor) => (
                  <SelectItem key={sponsor.id} value={sponsor.id}>
                    {sponsor.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
    </div>
  );
}
