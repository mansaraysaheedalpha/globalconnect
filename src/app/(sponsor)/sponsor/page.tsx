// src/app/(sponsor)/sponsor/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  QrCode,
  TrendingUp,
  MessageSquare,
  Star,
  ArrowUpRight,
  Activity,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";
import { useLeads } from "@/hooks/use-leads";

import type { Lead, LeadStats } from "@/types/leads";

// Stats card component
function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  href,
  isLoading,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  href?: string;
  isLoading?: boolean;
}) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p
                className={`text-xs ${
                  changeType === "positive"
                    ? "text-green-600"
                    : changeType === "negative"
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                {change}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// Recent lead item
function RecentLeadItem({
  name,
  company,
  intentLevel,
  time,
}: {
  name: string;
  company: string;
  intentLevel: "hot" | "warm" | "cold";
  time: string;
}) {
  const intentColors = {
    hot: "bg-red-500/10 text-red-600 border-red-500/20",
    warm: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    cold: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{company || "No company"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={intentColors[intentLevel]}>
          {intentLevel}
        </Badge>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function SponsorDashboardPage() {
  const { token } = useAuthStore();
  const { activeSponsorId, activeSponsorName } = useSponsorStore();

  // Use the useLeads hook for lead data (PostgreSQL as single source of truth)
  const {
    leads,
    stats,
    isLoading: isLoadingLeads,
    isLoadingStats,
    error,
    refetch,
  } = useLeads({
    sponsorId: activeSponsorId || "",
    enabled: !!activeSponsorId && !!token,
    limit: 5, // Only fetch 5 for recent leads display
  });

  // Combined loading state - show loading until both leads AND stats are ready
  const isLoading = isLoadingLeads || isLoadingStats;

  // Count starred leads from the fetched leads
  const starredCount = leads.filter((l) => l.is_starred).length;

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Error loading dashboard</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state if no active sponsor
  if (!isLoading && !activeSponsorId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Selected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Please select a sponsor event to access the dashboard.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/sponsor/select-event">Select Event</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayStats: LeadStats = stats || {
    total_leads: 0,
    hot_leads: 0,
    warm_leads: 0,
    cold_leads: 0,
    leads_contacted: 0,
    leads_converted: 0,
    conversion_rate: 0,
    avg_intent_score: 0,
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sponsor Dashboard</h1>
          <p className="text-muted-foreground">
            {activeSponsorName || "Monitor your lead capture performance and booth activity"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/sponsor/export">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Export Leads
            </Link>
          </Button>
          <Button asChild>
            <Link href="/sponsor/leads">
              <QrCode className="mr-2 h-4 w-4" />
              Capture Lead
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={displayStats.total_leads}
          change={displayStats.total_leads > 0 ? "All captured leads" : "No leads yet"}
          changeType="neutral"
          icon={Users}
          href="/sponsor/leads/all"
          isLoading={isLoading}
        />
        <StatsCard
          title="Hot Leads"
          value={displayStats.hot_leads}
          change="High intent contacts"
          changeType="neutral"
          icon={TrendingUp}
          href="/sponsor/leads/all?intent=hot"
          isLoading={isLoading}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${displayStats.conversion_rate.toFixed(1)}%`}
          change={`${displayStats.leads_converted} converted`}
          changeType={displayStats.conversion_rate > 10 ? "positive" : "neutral"}
          icon={Activity}
          isLoading={isLoading}
        />
        <StatsCard
          title="Starred Leads"
          value={starredCount}
          change="Priority follow-ups"
          changeType="neutral"
          icon={Star}
          href="/sponsor/leads/starred"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest captured contacts</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sponsor/leads/all">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No leads captured yet</p>
              </div>
            ) : (
              <div className="space-y-0">
                {leads.map((lead) => (
                  <RecentLeadItem
                    key={lead.id}
                    name={lead.user_name || "Unknown"}
                    company={lead.user_company || ""}
                    intentLevel={lead.intent_level}
                    time={formatTimeAgo(lead.created_at)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/sponsor/leads">
                <QrCode className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Scan Badge</div>
                  <div className="text-xs text-muted-foreground">Capture a new lead via QR scan</div>
                </div>
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/sponsor/leads/all?status=new">
                <Clock className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">New Leads to Follow Up</div>
                  <div className="text-xs text-muted-foreground">
                    {displayStats.total_leads - displayStats.leads_contacted} leads awaiting first contact
                  </div>
                </div>
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/sponsor/messages">
                <MessageSquare className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Send Bulk Message</div>
                  <div className="text-xs text-muted-foreground">Reach out to multiple leads</div>
                </div>
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/sponsor/analytics">
                <Activity className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-muted-foreground">Detailed performance insights</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lead Intent Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Intent Distribution</CardTitle>
          <CardDescription>Breakdown of leads by engagement level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-red-500/10">
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-red-600">{displayStats.hot_leads}</p>
                )}
                <p className="text-sm text-muted-foreground">Hot Leads</p>
                <p className="text-xs text-muted-foreground">Highly engaged, demo requests</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-500/10">
              <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-orange-600">{displayStats.warm_leads}</p>
                )}
                <p className="text-sm text-muted-foreground">Warm Leads</p>
                <p className="text-xs text-muted-foreground">Multiple booth visits</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/10">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-blue-600">{displayStats.cold_leads}</p>
                )}
                <p className="text-sm text-muted-foreground">Cold Leads</p>
                <p className="text-xs text-muted-foreground">Single interaction</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
