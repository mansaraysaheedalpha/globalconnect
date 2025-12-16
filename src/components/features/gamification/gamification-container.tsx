// src/components/features/gamification/gamification-container.tsx
"use client";

import React, { useEffect } from "react";
import { useGamification, PointReason } from "@/hooks/use-gamification";
import { Leaderboard, TeamLeaderboard } from "./leaderboard";
import { PointsAnimation } from "./points-animation";
import { AchievementToast } from "./achievement-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, RefreshCw, Star } from "lucide-react";

interface GamificationContainerProps {
  sessionId: string;
  eventId: string;
  variant?: "full" | "compact" | "leaderboard-only";
  showAchievements?: boolean;
  className?: string;
}

/**
 * Container component that combines gamification hook with UI components.
 * Use on event/session pages to show leaderboard, points, and achievements.
 */
export const GamificationContainer = ({
  sessionId,
  eventId,
  variant = "full",
  showAchievements = true,
  className = "",
}: GamificationContainerProps) => {
  const {
    isConnected,
    isJoined,
    leaderboard,
    teamLeaderboard,
    currentScore,
    currentRank,
    achievements,
    recentPointEvents,
    isLoadingLeaderboard,
    currentUserId,
    requestLeaderboard,
    clearRecentAchievements,
    getReasonText,
  } = useGamification(sessionId, eventId);

  // Request leaderboard on mount and when joined
  useEffect(() => {
    if (isJoined) {
      requestLeaderboard();
    }
  }, [isJoined, requestLeaderboard]);

  // Handle achievement dismissal
  const handleDismissAchievement = (achievementId: string) => {
    clearRecentAchievements([achievementId]);
  };

  if (!isConnected) {
    return null; // Don't show until connected
  }

  if (variant === "leaderboard-only") {
    return (
      <Leaderboard
        entries={leaderboard?.topEntries || []}
        currentUserId={currentUserId}
        currentUserRank={currentRank}
        currentUserScore={currentScore}
        isLoading={isLoadingLeaderboard}
        className={className}
      />
    );
  }

  if (variant === "compact") {
    return (
      <CompactGamification
        currentScore={currentScore}
        currentRank={currentRank}
        recentPointEvents={recentPointEvents}
        getReasonText={getReasonText}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Score Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Your Score
            </span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {currentScore.toLocaleString()} pts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {currentRank && (
            <p className="text-sm text-muted-foreground">
              Rank #{currentRank} in this session
            </p>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <div className="relative">
        <Leaderboard
          entries={leaderboard?.topEntries || []}
          currentUserId={currentUserId}
          currentUserRank={currentRank}
          currentUserScore={currentScore}
          isLoading={isLoadingLeaderboard}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => requestLeaderboard()}
          className="absolute top-3 right-3"
          disabled={isLoadingLeaderboard}
        >
          <RefreshCw className={cn("h-4 w-4", isLoadingLeaderboard && "animate-spin")} />
        </Button>
      </div>

      {/* Team Leaderboard (if available) */}
      {teamLeaderboard && teamLeaderboard.length > 0 && (
        <TeamLeaderboard entries={teamLeaderboard} />
      )}

      {/* Points Animation Overlay */}
      <PointsAnimation events={recentPointEvents} />

      {/* Achievement Toasts */}
      {showAchievements && achievements.map((achievement) => (
        <AchievementToast
          key={achievement.id}
          achievement={achievement}
          onDismiss={() => handleDismissAchievement(achievement.id)}
        />
      ))}
    </div>
  );
};

/**
 * Compact version showing just score and recent points
 */
interface CompactGamificationProps {
  currentScore: number;
  currentRank: number | null;
  recentPointEvents: Array<{
    id: string;
    points: number;
    reason: PointReason;
    timestamp: number;
  }>;
  getReasonText: (reason: PointReason) => string;
  className?: string;
}

const CompactGamification = ({
  currentScore,
  currentRank,
  recentPointEvents,
  getReasonText,
  className = "",
}: CompactGamificationProps) => {
  return (
    <div className={cn("flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg", className)}>
      <Trophy className="h-5 w-5 text-yellow-500" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{currentScore.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">points</span>
        </div>
        {currentRank && (
          <p className="text-xs text-muted-foreground">Rank #{currentRank}</p>
        )}
      </div>

      {/* Recent points indicator */}
      {recentPointEvents.length > 0 && (
        <Badge variant="default" className="bg-green-500 animate-pulse">
          +{recentPointEvents.reduce((sum, e) => sum + e.points, 0)}
        </Badge>
      )}
    </div>
  );
};

/**
 * Floating score widget for overlay display
 */
interface FloatingScoreWidgetProps {
  sessionId: string;
  eventId: string;
  className?: string;
}

export const FloatingScoreWidget = ({
  sessionId,
  eventId,
  className = "",
}: FloatingScoreWidgetProps) => {
  const {
    isConnected,
    currentScore,
    currentRank,
    recentPointEvents,
    getReasonText,
  } = useGamification(sessionId, eventId);

  if (!isConnected) return null;

  return (
    <div className={cn("fixed bottom-20 left-4 z-40", className)}>
      <Card className="shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-bold">{currentScore.toLocaleString()}</span>
            {currentRank && (
              <span className="text-xs text-muted-foreground">#{currentRank}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Points Animation */}
      <PointsAnimation events={recentPointEvents} />
    </div>
  );
};
