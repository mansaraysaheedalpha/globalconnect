// src/app/(sponsor)/sponsor/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  QrCode,
  TrendingUp,
  MessageSquare,
  Star,
  ArrowUpRight,
  Activity,
  Clock
} from "lucide-react";
import Link from "next/link";

// Stats card component
function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  href?: string;
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
          <p className="text-sm text-muted-foreground">{company}</p>
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

export default function SponsorDashboardPage() {
  // In a real app, this would come from an API
  const stats = {
    totalLeads: 147,
    hotLeads: 23,
    warmLeads: 58,
    coldLeads: 66,
    todayLeads: 12,
    conversionRate: 15.8,
  };

  const recentLeads = [
    { name: "Sarah Johnson", company: "TechCorp Inc.", intentLevel: "hot" as const, time: "2m ago" },
    { name: "Michael Chen", company: "StartupXYZ", intentLevel: "warm" as const, time: "15m ago" },
    { name: "Emily Davis", company: "Enterprise Co.", intentLevel: "hot" as const, time: "32m ago" },
    { name: "James Wilson", company: "Innovation Labs", intentLevel: "cold" as const, time: "1h ago" },
    { name: "Lisa Anderson", company: "Digital Agency", intentLevel: "warm" as const, time: "2h ago" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sponsor Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your lead capture performance and booth activity
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
          value={stats.totalLeads}
          change={`+${stats.todayLeads} today`}
          changeType="positive"
          icon={Users}
          href="/sponsor/leads/all"
        />
        <StatsCard
          title="Hot Leads"
          value={stats.hotLeads}
          change="High intent contacts"
          changeType="neutral"
          icon={TrendingUp}
          href="/sponsor/leads/all?intent=hot"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change="+2.3% from last event"
          changeType="positive"
          icon={Activity}
        />
        <StatsCard
          title="Starred Leads"
          value="12"
          change="Priority follow-ups"
          changeType="neutral"
          icon={Star}
          href="/sponsor/leads/starred"
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
            <div className="space-y-0">
              {recentLeads.map((lead, index) => (
                <RecentLeadItem key={index} {...lead} />
              ))}
            </div>
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
                  <div className="text-xs text-muted-foreground">23 leads awaiting first contact</div>
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
                <p className="text-2xl font-bold text-red-600">{stats.hotLeads}</p>
                <p className="text-sm text-muted-foreground">Hot Leads</p>
                <p className="text-xs text-muted-foreground">Highly engaged, demo requests</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-500/10">
              <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.warmLeads}</p>
                <p className="text-sm text-muted-foreground">Warm Leads</p>
                <p className="text-xs text-muted-foreground">Multiple booth visits</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/10">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.coldLeads}</p>
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
