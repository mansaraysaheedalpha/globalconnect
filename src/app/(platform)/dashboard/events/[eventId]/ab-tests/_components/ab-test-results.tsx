// src/app/(platform)/dashboard/events/[eventId]/ab-tests/_components/ab-test-results.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/charts";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Trophy, TrendingUp, Users, Target } from "lucide-react";

interface Variant {
  name: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
}

interface ABTestResultsProps {
  testName: string;
  variants: Variant[];
  confidence: number;
  winner?: string;
}

export function ABTestResults({ testName, variants, confidence, winner }: ABTestResultsProps) {
  const controlVariant = variants[0];
  const testVariants = variants.slice(1);

  // Calculate lift for each variant compared to control
  const variantsWithLift = testVariants.map(variant => ({
    ...variant,
    lift: ((variant.conversionRate - controlVariant.conversionRate) / controlVariant.conversionRate) * 100,
  }));

  const bestVariant = [...variantsWithLift].sort((a, b) => b.lift - a.lift)[0];

  return (
    <div className="space-y-6">
      {/* Winner Announcement */}
      {winner && confidence >= 95 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Test Winner Declared
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-900 dark:text-yellow-100 mb-2">
              <span className="font-bold">{winner}</span> wins with{" "}
              <span className="font-bold">{confidence}% confidence</span>!
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This variant showed a <span className="font-semibold">+{bestVariant.lift.toFixed(1)}%</span>{" "}
              improvement in conversion rate compared to the control group.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Variants Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Performance</CardTitle>
          <CardDescription>Conversion rates and statistical significance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{controlVariant.name}</h4>
                  <Badge variant="outline" className="mt-1">Control Group</Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{controlVariant.conversionRate.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">
                    {controlVariant.conversions} / {controlVariant.participants}
                  </div>
                </div>
              </div>
              <Progress value={controlVariant.conversionRate} max={20} className="h-2" />
            </div>

            {/* Test Variants */}
            {variantsWithLift.map((variant) => {
              const isWinner = variant.name === winner;
              const isBest = variant.name === bestVariant.name;

              return (
                <div
                  key={variant.name}
                  className={`p-4 rounded-lg border ${
                    isWinner
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : isBest && !winner
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{variant.name}</h4>
                        {isWinner && (
                          <Badge className="bg-green-500">
                            <Trophy className="h-3 w-3 mr-1" />
                            Winner
                          </Badge>
                        )}
                        {isBest && !winner && (
                          <Badge variant="secondary">Leading</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={variant.lift > 0 ? "default" : "destructive"}
                          className={variant.lift > 0 ? "bg-green-500" : ""}
                        >
                          {variant.lift > 0 ? "+" : ""}{variant.lift.toFixed(1)}% lift
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{variant.conversionRate.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">
                        {variant.conversions} / {variant.participants}
                      </div>
                    </div>
                  </div>
                  <Progress value={variant.conversionRate} max={20} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate Comparison</CardTitle>
          <CardDescription>Visual comparison of all variants</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              conversionRate: {
                label: "Conversion Rate",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={variants}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="conversionRate"
                  fill="hsl(var(--chart-1))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Statistical Significance */}
      <Card>
        <CardHeader>
          <CardTitle>Statistical Significance</CardTitle>
          <CardDescription>Confidence level and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Confidence Level</span>
              <span className="text-2xl font-bold">{confidence}%</span>
            </div>

            <Progress value={confidence} max={100} className="h-3" />

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="text-xs text-red-600 dark:text-red-400 mb-1">Low</div>
                <div className="text-sm font-semibold">&lt; 80%</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Moderate</div>
                <div className="text-sm font-semibold">80-95%</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="text-xs text-green-600 dark:text-green-400 mb-1">High</div>
                <div className="text-sm font-semibold">&gt; 95%</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                💡 Recommendations
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {confidence >= 95 ? (
                  <>
                    <li>✓ Results are statistically significant</li>
                    <li>✓ Safe to implement the winning variant</li>
                    <li>• Expected uplift: +{bestVariant.lift.toFixed(1)}% improvement</li>
                  </>
                ) : confidence >= 80 ? (
                  <>
                    <li>• Results show promise but need more data</li>
                    <li>• Continue test to reach 95% confidence</li>
                    <li>• Current sample size: {variants.reduce((sum, v) => sum + v.participants, 0)} participants</li>
                  </>
                ) : (
                  <>
                    <li>⚠ Not enough data for conclusive results</li>
                    <li>• Continue running the test</li>
                    <li>• Target: 95% confidence level</li>
                    <li>• Recommended minimum: 100 conversions per variant</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
