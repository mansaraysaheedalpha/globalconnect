// src/app/(platform)/dashboard/events/[eventId]/analytics/_components/offer-performance.tsx
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
import { Eye, ShoppingCart, DollarSign, TrendingUp, Award } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/format-utils";

interface OfferData {
  totalViews: number;
  totalPurchases: number;
  conversionRate: number;
  averageOrderValue: number;
  topPerformers: Array<{
    offerId: string;
    title: string;
    revenue: number;
    conversions: number;
  }>;
}

interface OfferPerformanceProps {
  eventId: string;
  data?: OfferData;
  dateRange: { from: string; to: string };
}

export function OfferPerformance({ eventId, data, dateRange }: OfferPerformanceProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Offer Performance</CardTitle>
          <CardDescription>No offer data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { totalViews, totalPurchases, conversionRate, averageOrderValue, topPerformers } = data;

  // Calculate metrics
  const viewToPurchaseRate = totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique offer impressions
            </p>
          </CardContent>
        </Card>

        {/* Total Purchases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed transactions
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(conversionRate, 2)}</div>
            <div className="mt-2">
              <Progress value={conversionRate} max={10} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {conversionRate >= 5 ? "Excellent" : conversionRate >= 2 ? "Good" : "Needs improvement"}
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageOrderValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>How visitors progress through the offer journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Views */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Views</span>
                <span className="text-sm text-muted-foreground">
                  {totalViews.toLocaleString()} (100%)
                </span>
              </div>
              <Progress value={100} className="h-3" />
            </div>

            {/* Purchases */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Purchases</span>
                <span className="text-sm text-muted-foreground">
                  {totalPurchases.toLocaleString()} ({formatPercent(viewToPurchaseRate)})
                </span>
              </div>
              <Progress value={viewToPurchaseRate} className="h-3" />
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">💡 Insights</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {conversionRate < 2 && (
                <li>• Low conversion rate - consider improving offer descriptions or pricing</li>
              )}
              {conversionRate >= 5 && (
                <li>• Excellent conversion rate! Your offers are highly appealing</li>
              )}
              {totalViews < 100 && (
                <li>• Low visibility - consider promoting offers more prominently</li>
              )}
              <li>• Average of {totalViews > 0 ? (totalViews / topPerformers.length).toFixed(0) : 0} views per offer</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Top Performing Offers
          </CardTitle>
          <CardDescription>Best offers ranked by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {topPerformers && topPerformers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Offer Title</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((offer, index) => {
                  const avgValue = offer.conversions > 0 ? offer.revenue / offer.conversions : 0;
                  return (
                    <TableRow key={offer.offerId}>
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
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell className="text-right">{offer.conversions}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(offer.revenue)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(avgValue)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No offer performance data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
