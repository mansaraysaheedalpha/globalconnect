// src/components/features/gamification/gamification-hub.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Crown,
  Star,
  Flame,
  Target,
  Users,
  Zap,
  Lock,
} from "lucide-react";
import {
  type LeaderboardEntry,
  type TeamLeaderboardEntry,
  type AchievementProgress,
  type Achievement,
  type StreakInfo,
  type RecentPointEvent,
  type PointReason,
} from "@/hooks/use-gamification";
import { AnimatedScoreCounter } from "./points-animation";

interface GamificationHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentScore: number;
  currentRank: number | null;
  streak: StreakInfo;
  achievementProgress: AchievementProgress[];
  allAchievements: Achievement[];
  recentPointEvents: RecentPointEvent[];
  leaderboard: LeaderboardEntry[];
  teamLeaderboard: TeamLeaderboardEntry[];
  currentUserId?: string;
  getReasonText: (reason: PointReason) => string;
  getReasonEmoji: (reason: PointReason) => string;
}

export const GamificationHub = ({
  open,
  onOpenChange,
  currentScore,
  currentRank,
  streak,
  achievementProgress,
  allAchievements,
  recentPointEvents,
  leaderboard,
  teamLeaderboard,
  currentUserId,
  getReasonText,
  getReasonEmoji,
}: GamificationHubProps) => {
  // Sort progress: closest-to-unlock first (highest % that aren't unlocked)
  const sortedProgress = [...achievementProgress].sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return 1;
    if (!a.isUnlocked && b.isUnlocked) return -1;
    if (!a.isUnlocked && !b.isUnlocked) return b.percentage - a.percentage;
    return 0;
  });

  const unlockedCount = achievementProgress.filter((a) => a.isUnlocked).length;
  const totalCount = achievementProgress.length;

  // Group progress by category
  const categories = new Map<string, AchievementProgress[]>();
  for (const p of sortedProgress) {
    const cat = p.category || "Other";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(p);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Gamification Hub
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Badges</TabsTrigger>
            <TabsTrigger value="leaderboard">Ranks</TabsTrigger>
          </TabsList>

          {/* Tab 1: My Progress */}
          <TabsContent value="progress" className="space-y-4 mt-4">
            {/* Score + Rank */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border border-yellow-200/50 dark:border-yellow-800/50">
              <div>
                <p className="text-sm text-muted-foreground">Your Score</p>
                <div className="flex items-baseline gap-2">
                  <AnimatedScoreCounter
                    targetScore={currentScore}
                    className="text-3xl text-yellow-600 dark:text-yellow-400"
                  />
                  <span className="text-muted-foreground">pts</span>
                </div>
                {currentRank && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Rank #{currentRank}
                  </p>
                )}
              </div>

              {/* Streak indicator */}
              <div className="text-center">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    streak.active
                      ? "bg-orange-100 dark:bg-orange-950/50"
                      : "bg-muted"
                  )}
                >
                  <Flame
                    className={cn(
                      "h-8 w-8",
                      streak.active
                        ? "text-orange-500 animate-pulse"
                        : "text-muted-foreground/30"
                    )}
                  />
                </div>
                {streak.active ? (
                  <div className="mt-1">
                    <p className="text-xs font-bold text-orange-600">
                      {streak.multiplier}x
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Streak {streak.count}
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    No streak
                  </p>
                )}
              </div>
            </div>

            {/* Streak explanation */}
            {streak.active && (
              <div className="flex items-center gap-2 p-2 rounded bg-orange-50 dark:bg-orange-950/20 text-xs text-orange-700 dark:text-orange-300">
                <Zap className="h-3 w-3 flex-shrink-0" />
                Keep engaging! Your streak gives {streak.multiplier}x points.
                Inactivity for 5 min resets it.
              </div>
            )}

            {/* Achievement Overview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  Achievements ({unlockedCount}/{totalCount})
                </p>
                <Badge variant="secondary" className="text-xs">
                  {Math.round((unlockedCount / Math.max(totalCount, 1)) * 100)}%
                </Badge>
              </div>
              <Progress
                value={(unlockedCount / Math.max(totalCount, 1)) * 100}
                className="h-2"
              />
            </div>

            {/* Nearest achievements */}
            <div>
              <p className="text-sm font-medium mb-2">Next Up</p>
              <div className="space-y-3">
                {sortedProgress
                  .filter((a) => !a.isUnlocked)
                  .slice(0, 3)
                  .map((achievement) => (
                    <AchievementProgressCard
                      key={achievement.key}
                      achievement={achievement}
                    />
                  ))}
                {sortedProgress.filter((a) => !a.isUnlocked).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All achievements unlocked!
                  </p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            {recentPointEvents.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Recent Activity</p>
                <div className="space-y-1">
                  {recentPointEvents.slice(-5).reverse().map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <span className="flex items-center gap-2">
                        <span>{getReasonEmoji(event.reason)}</span>
                        <span className="text-muted-foreground">
                          {getReasonText(event.reason)}
                        </span>
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        +{event.points}
                        {event.streakMultiplier && event.streakMultiplier > 1 && (
                          <Flame className="h-2.5 w-2.5 ml-0.5 text-orange-500 inline" />
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Achievements */}
          <TabsContent value="achievements" className="mt-4">
            <div className="space-y-6">
              {Array.from(categories.entries()).map(([category, items]) => (
                <div key={category}>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">
                    {category}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {items.map((achievement) => (
                      <AchievementBadgeCard
                        key={achievement.key}
                        achievement={achievement}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 3: Leaderboard */}
          <TabsContent value="leaderboard" className="mt-4 space-y-4">
            {/* Individual Leaderboard */}
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Individual Rankings
              </p>
              <div className="space-y-1">
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No scores yet. Start engaging!
                  </p>
                ) : (
                  leaderboard.map((entry, index) => (
                    <LeaderboardRow
                      key={entry.user.id}
                      entry={entry}
                      index={index}
                      isCurrentUser={entry.user.id === currentUserId}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Team Leaderboard */}
            {teamLeaderboard.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Team Rankings
                </p>
                <div className="space-y-1">
                  {teamLeaderboard.map((entry, index) => (
                    <div
                      key={entry.teamId}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg",
                        index < 3 ? "bg-muted/50" : ""
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <RankIcon index={index} />
                        <span className="text-sm font-medium">
                          {entry.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({entry.memberCount})
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        {entry.score.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

const AchievementProgressCard = ({
  achievement,
}: {
  achievement: AchievementProgress;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg flex-shrink-0">
      {achievement.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{achievement.badgeName}</p>
      <div className="flex items-center gap-2 mt-1">
        <Progress value={achievement.percentage} className="h-1.5 flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {achievement.current}/{achievement.target}
        </span>
      </div>
    </div>
  </div>
);

const AchievementBadgeCard = ({
  achievement,
}: {
  achievement: AchievementProgress;
}) => (
  <div
    className={cn(
      "flex flex-col items-center gap-1 p-3 rounded-lg text-center transition-colors",
      achievement.isUnlocked
        ? "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200/50 dark:border-yellow-800/50"
        : "bg-muted/30 border border-transparent opacity-60"
    )}
  >
    <div
      className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center text-xl relative",
        achievement.isUnlocked
          ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md"
          : "bg-muted"
      )}
    >
      {achievement.isUnlocked ? (
        achievement.icon
      ) : (
        <>
          <span className="opacity-40">{achievement.icon}</span>
          <Lock className="h-3 w-3 absolute bottom-0 right-0 text-muted-foreground" />
        </>
      )}
    </div>
    <p className="text-[11px] font-medium leading-tight mt-1">
      {achievement.badgeName}
    </p>
    {!achievement.isUnlocked && achievement.percentage > 0 && (
      <Progress value={achievement.percentage} className="h-1 w-full mt-1" />
    )}
  </div>
);

const LeaderboardRow = ({
  entry,
  index,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  index: number;
  isCurrentUser: boolean;
}) => (
  <div
    className={cn(
      "flex items-center justify-between px-3 py-2 rounded-lg",
      isCurrentUser
        ? "bg-primary/5 border border-primary/20"
        : index < 3
          ? "bg-muted/50"
          : ""
    )}
  >
    <div className="flex items-center gap-2">
      <RankIcon index={index} />
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-[10px]">
          {entry.user.firstName?.charAt(0)}
          {entry.user.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium truncate">
        {entry.user.firstName} {entry.user.lastName}
      </span>
      {isCurrentUser && (
        <Badge variant="secondary" className="text-[10px] px-1.5">
          You
        </Badge>
      )}
    </div>
    <span className="text-sm font-bold">{entry.score.toLocaleString()}</span>
  </div>
);

const RankIcon = ({ index }: { index: number }) => {
  if (index === 0)
    return <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
  if (index === 1)
    return <Crown className="w-4 h-4 text-gray-400 flex-shrink-0" />;
  if (index === 2)
    return <Crown className="w-4 h-4 text-amber-700 flex-shrink-0" />;
  return (
    <span className="w-4 text-center text-xs text-muted-foreground flex-shrink-0">
      {index + 1}
    </span>
  );
};
