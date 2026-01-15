// src/components/features/gamification/gamification-container.tsx
"use client";

import React, { useEffect } from "react";
import { useGamification, PointReason } from "@/hooks/use-gamification";
import { PointsAnimation } from "./points-animation";
import { AchievementToast } from "./achievement-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Trophy, RefreshCw, Star, Crown, AlertCircle, Wifi, WifiOff } from "lucide-react";

interface GamificationContainerProps {
  sessionId: string;
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
    error,
    currentUserId,
    requestLeaderboard,
    clearRecentAchievements,
    clearError,
    getReasonText,
  } = useGamification({ sessionId });

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

  // Show error state
  if (error) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Connection status indicator
  const ConnectionStatus = () => (
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        isConnected
          ? "bg-green-50 text-green-600 border-green-200"
          : "bg-red-50 text-red-600 border-red-200"
      )}
    >
      {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
      {isConnected ? "Live" : "Offline"}
    </Badge>
  );

  // Inline leaderboard table
  const LeaderboardTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="text-right w-[80px]">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboard.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
              {isLoadingLeaderboard ? "Loading..." : "No scores yet"}
            </TableCell>
          </TableRow>
        ) : (
          leaderboard.map((entry, index) => (
            <TableRow
              key={entry.user.id}
              className={cn(
                entry.user.id === currentUserId && "bg-primary/5",
                index < 3 && "font-semibold"
              )}
            >
              <TableCell>
                <div className="flex items-center gap-1">
                  {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                  {index === 1 && <Crown className="w-4 h-4 text-gray-400" />}
                  {index === 2 && <Crown className="w-4 h-4 text-amber-700" />}
                  <span>{entry.rank}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {entry.user.firstName?.charAt(0) || ""}
                      {entry.user.lastName?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {entry.user.firstName} {entry.user.lastName}
                  </span>
                  {entry.user.id === currentUserId && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">{entry.score.toLocaleString()}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  // Team leaderboard table
  const TeamLeaderboardTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Rank</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right w-[80px]">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamLeaderboard.map((entry, index) => (
          <TableRow key={entry.teamId} className={index < 3 ? "font-semibold" : ""}>
            <TableCell>
              <div className="flex items-center gap-1">
                {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                {index === 1 && <Crown className="w-4 h-4 text-gray-400" />}
                {index === 2 && <Crown className="w-4 h-4 text-amber-700" />}
                <span>{entry.rank}</span>
              </div>
            </TableCell>
            <TableCell>{entry.name}</TableCell>
            <TableCell className="text-right">{entry.score.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (variant === "leaderboard-only") {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <ConnectionStatus />
            <Button
              variant="ghost"
              size="sm"
              onClick={requestLeaderboard}
              disabled={isLoadingLeaderboard}
            >
              <RefreshCw className={cn("h-4 w-4", isLoadingLeaderboard && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LeaderboardTable />
        </CardContent>
      </Card>
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
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {currentScore.toLocaleString()} pts
              </Badge>
              <ConnectionStatus />
            </div>
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={requestLeaderboard}
            disabled={isLoadingLeaderboard}
          >
            <RefreshCw className={cn("h-4 w-4", isLoadingLeaderboard && "animate-spin")} />
          </Button>
        </CardHeader>
        <CardContent>
          <LeaderboardTable />
        </CardContent>
      </Card>

      {/* Team Leaderboard (if available) */}
      {teamLeaderboard && teamLeaderboard.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Team Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamLeaderboardTable />
          </CardContent>
        </Card>
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
  eventId?: string;
  className?: string;
}

export const FloatingScoreWidget = ({
  sessionId,
  eventId: _eventId,
  className = "",
}: FloatingScoreWidgetProps) => {
  const {
    isConnected,
    currentScore,
    currentRank,
    recentPointEvents,
  } = useGamification({ sessionId });

  if (!isConnected) return null;

  // Positioned above the DM button (which is at bottom-4)
  return (
    <div className={cn("fixed bottom-24 left-4 z-40 safe-bottom", className)}>
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