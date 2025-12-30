// src/app/(platform)/dashboard/events/[eventId]/analytics/_components/revenue-overview.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/charts";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Bar, BarChart } from "recharts";
import { DollarSign, TrendingUp, ShoppingBag, MousePointer } from "lucide-react";
import { format } from "date-fns";

interface RevenueData {
  total: number;
  fromOffers: number;
  fromAds: number;
  byDay: Array<{
    date: string;
    amount: number;
  }>;
}

interface RevenueOverviewProps {
  data?: RevenueData;
}

export function RevenueOverview({ data }: RevenueOverviewProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>No revenue data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalRevenue = data.total / 100;
  const offerRevenue = data.fromOffers / 100;
  const adRevenue = data.fromAds / 100;

  // Transform daily data for chart
  const chartData = data.byDay.map((day) => ({
    date: format(new Date(day.date), "MMM d"),
    revenue: day.amount / 100,
  }));

  // Revenue source breakdown
  const sourceData = [
    {
      source: "Offers",
      amount: offerRevenue,
      percentage: totalRevenue > 0 ? (offerRevenue / totalRevenue) * 100 : 0,
      icon: ShoppingBag,
      color: "hsl(var(--chart-1))",
    },
    {
      source: "Ads",
      amount: adRevenue,
      percentage: totalRevenue > 0 ? (adRevenue / totalRevenue) * 100 : 0,
      icon: MousePointer,
      color: "hsl(var(--chart-2))",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Total Revenue Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Total Revenue
          </CardTitle>
          <CardDescription>Combined revenue from all monetization sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary mb-2">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Across {chartData.length} days</span>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Source</CardTitle>
          <CardDescription>Breakdown of revenue streams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {sourceData.map((source) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.source}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${source.color}20` }}>
                      <Icon className="h-5 w-5" style={{ color: source.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{source.source}</p>
                      <p className="text-2xl font-bold">${source.amount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Share</p>
                    <p className="text-lg font-semibold">{source.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bar Chart for Source Comparison */}
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="source"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--chart-1))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue Trend Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue over selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No revenue data for this period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
