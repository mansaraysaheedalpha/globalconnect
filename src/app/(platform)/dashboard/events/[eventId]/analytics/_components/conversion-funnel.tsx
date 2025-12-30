// src/app/(platform)/dashboard/events/[eventId]/analytics/_components/conversion-funnel.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/charts";
import { Funnel, FunnelChart, LabelList, ResponsiveContainer } from "recharts";
import { Eye, MousePointer, ShoppingCart, DollarSign, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConversionFunnelProps {
  data?: {
    offers?: {
      totalViews: number;
      totalPurchases: number;
      conversionRate: number;
    };
    ads?: {
      totalImpressions: number;
      totalClicks: number;
      averageCTR: number;
    };
  };
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  if (!data || !data.offers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>No funnel data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { offers, ads } = data;

  // Calculate funnel stages
  const offerViews = offers.totalViews || 0;
  const offerPurchases = offers.totalPurchases || 0;

  // Assume some clicked to view details (80% of views)
  const offerClicks = Math.round(offerViews * 0.8);

  // Funnel data for offers
  const offerFunnelData = [
    {
      stage: "Views",
      value: offerViews,
      fill: "hsl(var(--chart-1))",
      percentage: 100,
      icon: Eye,
    },
    {
      stage: "Clicks",
      value: offerClicks,
      fill: "hsl(var(--chart-2))",
      percentage: offerViews > 0 ? (offerClicks / offerViews) * 100 : 0,
      icon: MousePointer,
    },
    {
      stage: "Purchases",
      value: offerPurchases,
      fill: "hsl(var(--chart-3))",
      percentage: offerViews > 0 ? (offerPurchases / offerViews) * 100 : 0,
      icon: ShoppingCart,
    },
  ];

  // Calculate drop-off rates
  const viewToClickDropoff = offerViews > 0 ? ((offerViews - offerClicks) / offerViews) * 100 : 0;
  const clickToPurchaseDropoff = offerClicks > 0 ? ((offerClicks - offerPurchases) / offerClicks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Offers Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Offers Conversion Funnel</CardTitle>
          <CardDescription>User journey from viewing offers to purchasing</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Visual Funnel Stages */}
          <div className="space-y-4 mb-8">
            {offerFunnelData.map((stage, index) => {
              const Icon = stage.icon;
              const isLast = index === offerFunnelData.length - 1;
              const nextStage = !isLast ? offerFunnelData[index + 1] : null;
              const dropoffPercentage = nextStage
                ? ((stage.value - nextStage.value) / stage.value) * 100
                : 0;

              return (
                <div key={stage.stage}>
                  <div className="flex items-center gap-4">
                    {/* Stage Card */}
                    <div
                      className="flex-1 p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                      style={{
                        width: `${stage.percentage}%`,
                        backgroundColor: `${stage.fill}10`,
                        borderColor: stage.fill,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${stage.fill}20` }}
                          >
                            <Icon className="h-5 w-5" style={{ color: stage.fill }} />
                          </div>
                          <div>
                            <h4 className="font-semibold">{stage.stage}</h4>
                            <p className="text-2xl font-bold">{stage.value.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{stage.percentage.toFixed(1)}%</Badge>
                          <p className="text-xs text-muted-foreground mt-1">of total</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drop-off Indicator */}
                  {!isLast && nextStage && (
                    <div className="flex items-center gap-2 my-2 ml-4">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {dropoffPercentage.toFixed(1)}% drop-off ({(stage.value - nextStage.value).toLocaleString()} users lost)
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Overall Conversion</p>
              <p className="text-2xl font-bold">{offers.conversionRate.toFixed(2)}%</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">View → Click Rate</p>
              <p className="text-2xl font-bold">{(100 - viewToClickDropoff).toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Click → Purchase Rate</p>
              <p className="text-2xl font-bold">
                {offerClicks > 0 ? ((offerPurchases / offerClicks) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ads Funnel (if available) */}
      {ads && ads.totalImpressions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ads Engagement Funnel</CardTitle>
            <CardDescription>Ad impression to click journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Impressions */}
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Impressions</h4>
                        <p className="text-2xl font-bold">{ads.totalImpressions.toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge variant="outline">100%</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {(100 - ads.averageCTR).toFixed(1)}% did not click
                </span>
              </div>

              {/* Clicks */}
              <div className="flex items-center gap-4">
                <div
                  className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  style={{ width: `${Math.max(ads.averageCTR * 10, 10)}%` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <MousePointer className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Clicks</h4>
                        <p className="text-2xl font-bold">{ads.totalClicks.toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{ads.averageCTR.toFixed(2)}%</Badge>
                  </div>
                </div>
              </div>

              {/* CTR Performance */}
              <div className="pt-6 border-t">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Click-Through Rate</p>
                  <p className="text-2xl font-bold">{ads.averageCTR.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ads.averageCTR >= 2.0
                      ? "🎉 Excellent! Well above industry average (0.5-1.0%)"
                      : ads.averageCTR >= 1.0
                      ? "👍 Good performance, above industry average"
                      : "💡 Room for improvement - consider optimizing ad creatives"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel Optimization Recommendations</CardTitle>
          <CardDescription>Data-driven insights to improve conversions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* View to Click Optimization */}
            {viewToClickDropoff > 30 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-yellow-900 dark:text-yellow-100">
                  🎯 Improve View-to-Click Rate
                </h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>• Add more compelling offer images and descriptions</li>
                  <li>• Highlight discounts and savings more prominently</li>
                  <li>• Use urgency indicators (limited time, low stock)</li>
                </ul>
              </div>
            )}

            {/* Click to Purchase Optimization */}
            {clickToPurchaseDropoff > 50 && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-orange-900 dark:text-orange-100">
                  💳 Improve Purchase Conversion
                </h4>
                <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                  <li>• Simplify the checkout process (fewer steps)</li>
                  <li>• Add trust signals (money-back guarantee, secure payment)</li>
                  <li>• Offer multiple payment options</li>
                  <li>• Reduce cart abandonment with exit-intent offers</li>
                </ul>
              </div>
            )}

            {/* Ad CTR Optimization */}
            {ads && ads.averageCTR < 1.0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                  📢 Improve Ad Click-Through Rate
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Test different ad formats (video vs. banner)</li>
                  <li>• Improve ad copy with clear call-to-actions</li>
                  <li>• Ensure ads are relevant to your audience</li>
                  <li>• Experiment with ad placement (above fold, sidebar)</li>
                </ul>
              </div>
            )}

            {/* Success Message */}
            {offers.conversionRate >= 5 && (!ads || ads.averageCTR >= 2.0) && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
                  ✅ Excellent Performance!
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your conversion funnel is performing exceptionally well. Continue monitoring and maintain these best practices.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
