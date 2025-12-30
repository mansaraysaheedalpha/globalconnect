// src/app/(platform)/dashboard/events/[eventId]/ab-tests/_components/ab-test-list.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, BarChart3, Trophy, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ABTest {
  id: string;
  name: string;
  type: string;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
  startedAt: string;
  endedAt?: string;
  participants: number;
  variants: Array<{
    name: string;
    conversions: number;
    participants: number;
    conversionRate: number;
  }>;
  winner?: string;
  confidence?: number;
}

interface ABTestListProps {
  eventId: string;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
}

// Mock data for demonstration
const mockTests: ABTest[] = [
  {
    id: "test-1",
    name: "VIP Upgrade Pricing",
    type: "OFFER_PRICE",
    status: "ACTIVE",
    startedAt: "2025-12-28T10:00:00Z",
    participants: 324,
    variants: [
      { name: "Control ($49)", conversions: 18, participants: 162, conversionRate: 11.1 },
      { name: "Variant A ($39)", conversions: 29, participants: 162, conversionRate: 17.9 },
    ],
    confidence: 92,
  },
  {
    id: "test-2",
    name: "Premium Merch Bundle Copy",
    type: "OFFER_COPY",
    status: "ACTIVE",
    startedAt: "2025-12-27T14:00:00Z",
    participants: 198,
    variants: [
      { name: "Control", conversions: 8, participants: 99, conversionRate: 8.1 },
      { name: "Variant A", conversions: 12, participants: 99, conversionRate: 12.1 },
    ],
    confidence: 78,
  },
  {
    id: "test-3",
    name: "Sponsor Banner Creative",
    type: "AD_CREATIVE",
    status: "COMPLETED",
    startedAt: "2025-12-20T09:00:00Z",
    endedAt: "2025-12-27T18:00:00Z",
    participants: 1042,
    variants: [
      { name: "Control", conversions: 18, participants: 521, conversionRate: 3.5 },
      { name: "Variant A", conversions: 31, participants: 521, conversionRate: 6.0 },
    ],
    winner: "Variant A",
    confidence: 99,
  },
];

export function ABTestList({ eventId, status }: ABTestListProps) {
  const tests = mockTests.filter(test => test.status === status);

  if (tests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No {status.toLowerCase()} tests</h3>
          <p className="text-muted-foreground text-center max-w-xs">
            {status === "ACTIVE"
              ? "Start a new A/B test to optimize your monetization"
              : status === "COMPLETED"
              ? "Completed tests will appear here"
              : "Draft tests will appear here"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tests.map((test) => {
        const winningVariant = test.variants.reduce((max, v) =>
          v.conversionRate > max.conversionRate ? v : max
        );
        const lift = test.variants.length === 2
          ? ((winningVariant.conversionRate - test.variants[0].conversionRate) / test.variants[0].conversionRate) * 100
          : 0;

        return (
          <Card key={test.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{test.name}</CardTitle>
                    {test.status === "ACTIVE" && (
                      <Badge className="bg-green-500">
                        <Play className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    {test.status === "COMPLETED" && test.winner && (
                      <Badge className="bg-yellow-500">
                        <Trophy className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {test.type.replace("_", " ")} • {test.participants} participants
                  </CardDescription>
                </div>

                <div className="flex gap-2">
                  {test.status === "ACTIVE" && (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Link href={`/platform/dashboard/events/${eventId}/ab-tests/${test.id}`}>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Variants Comparison */}
              <div className="space-y-3">
                {test.variants.map((variant, index) => {
                  const isWinning = variant.name === winningVariant.name && test.variants.length > 1;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        isWinning ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{variant.name}</span>
                          {isWinning && test.status === "ACTIVE" && (
                            <Badge variant="outline" className="bg-green-500 text-white border-green-600">
                              Leading
                            </Badge>
                          )}
                          {test.winner === variant.name && (
                            <Badge className="bg-yellow-500">
                              <Trophy className="h-3 w-3 mr-1" />
                              Winner
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{variant.conversionRate.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">
                            {variant.conversions} / {variant.participants}
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={variant.conversionRate}
                        max={Math.max(...test.variants.map(v => v.conversionRate))}
                        className="h-2"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Statistical Significance */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {test.confidence && test.confidence >= 95 ? (
                      <AlertCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium">
                      {test.confidence}% confidence
                    </span>
                  </div>
                  <div className="text-right">
                    {lift > 0 && (
                      <span className="text-sm text-green-600 font-semibold">
                        +{lift.toFixed(1)}% lift
                      </span>
                    )}
                  </div>
                </div>
                {test.confidence && test.confidence < 95 && test.status === "ACTIVE" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Need more participants for statistical significance (target: 95%)
                  </p>
                )}
                {test.confidence && test.confidence >= 95 && test.status === "ACTIVE" && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Results are statistically significant
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
