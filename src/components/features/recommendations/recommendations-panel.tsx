// src/components/features/recommendations/recommendations-panel.tsx
"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, RefreshCw, AlertCircle, Users } from "lucide-react";
import { useRecommendations, Recommendation } from "@/hooks/use-recommendations";
import { RecommendationCard } from "./recommendation-card";

interface RecommendationsPanelProps {
  eventId: string;
  onStartChat: (userId: string, userName: string) => void;
}

/**
 * RecommendationsPanel displays AI-powered networking recommendations.
 *
 * Features:
 * - Loading skeleton during fetch
 * - Error state with retry
 * - Empty state when no recommendations
 * - Refresh button with debounce protection
 * - Expandable recommendation cards
 *
 * Accessibility:
 * - Semantic heading structure
 * - ARIA labels on interactive elements
 * - Keyboard navigable
 */
export const RecommendationsPanel = ({
  eventId,
  onStartChat,
}: RecommendationsPanelProps) => {
  const {
    recommendations,
    isLoading,
    isRefreshing,
    error,
    isEmpty,
    isStale,
    refresh,
    markViewed,
    markConnected,
    clearError,
  } = useRecommendations({ eventId });

  // Handle viewed tracking
  const handleViewed = useCallback(
    async (recommendationId: string) => {
      await markViewed(recommendationId);
    },
    [markViewed]
  );

  // Handle connect with tracking (triggers AI suggestions)
  const handleConnect = useCallback(
    async (userId: string) => {
      // Find the recommendation for this user
      const rec = recommendations.find((r) => r.user.id === userId);
      if (rec) {
        await markConnected(rec.id);
      }
    },
    [recommendations, markConnected]
  );

  // Loading state
  if (isLoading) {
    return <RecommendationsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={refresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No Recommendations Yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          We're finding the best connections for you. Check back soon or refresh to try again.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={refresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Generate Recommendations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" />
          <h3 className="font-semibold">Recommended for You</h3>
          {isStale && (
            <span className="text-xs text-muted-foreground">(Stale)</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
          aria-label="Refresh recommendations"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3" role="list" aria-label="Networking recommendations">
        {recommendations.map((rec) => (
          <div key={rec.id} role="listitem">
            <RecommendationCard
              recommendation={rec}
              onStartChat={onStartChat}
              onConnect={handleConnect}
              onViewed={handleViewed}
            />
          </div>
        ))}
      </div>

      {/* Footer with count */}
      <div className="text-center text-sm text-muted-foreground pt-2">
        <Users className="h-4 w-4 inline mr-1" />
        {recommendations.length} recommendation{recommendations.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

/**
 * Loading skeleton for recommendations panel
 */
const RecommendationsSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
          <div className="flex justify-between pt-2 border-t">
            <Skeleton className="h-8 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendationsPanel;
