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
  Info,
  MessageSquare,
  HelpCircle,
  BarChart3,
  UserPlus,
  Compass,
} from "lucide-react";
import {
  type LeaderboardEntry,
  type TeamLeaderboardEntry,
  type AchievementProgress,
  type Achievement,
  type StreakInfo,
  type RecentPointEvent,
  type PointReason,
  POINT_VALUES,
  PointReason as PointReasonEnum,
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

            {/* Streak explanation — always visible so attendees learn about it */}
            <div className={cn(
              "flex items-center gap-2 p-2 rounded text-xs",
              streak.active
                ? "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300"
                : "bg-muted/50 text-muted-foreground"
            )}>
              <Zap className="h-3 w-3 flex-shrink-0" />
              {streak.active
                ? `Keep engaging! Your streak gives ${streak.multiplier}x points. Inactivity for 5 min resets it.`
                : "Stay active to build a streak! After 3 consecutive actions you'll earn 1.5x points, and 2x after 6."}
            </div>

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
                {totalCount === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Achievements loading...
                  </p>
                ) : sortedProgress.filter((a) => !a.isUnlocked).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All achievements unlocked!
                  </p>
                ) : null}
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

            {/* How to Earn Points Guide */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                How to Earn Points
              </p>
              <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
                {EARN_POINTS_GUIDE.map((item) => (
                  <div key={item.reason} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span>{getReasonEmoji(item.reason as PointReason)}</span>
                      <span className="text-muted-foreground">{item.label}</span>
                    </span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      +{item.points} pt{item.points !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
                <div className="pt-1.5 mt-1.5 border-t text-[11px] text-muted-foreground">
                  Streaks multiply your points: 1.5x after 3 actions, 2x after 6!
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Achievements */}
          <TabsContent value="achievements" className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Unlock badges by participating in the event. Each badge tracks a specific activity — check the description to see how to earn it!
            </p>
            {categories.size === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Achievements loading...
              </p>
            ) : (
              <div className="space-y-6">
                {Array.from(categories.entries()).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <CategoryIcon category={category} />
                      <p className="text-sm font-semibold text-muted-foreground">
                        {category}
                      </p>
                    </div>
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
            )}
          </TabsContent>

          {/* Tab 3: Leaderboard */}
          <TabsContent value="leaderboard" className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Rankings update in real time. Earn points by chatting, asking questions, voting in polls, and more to climb the leaderboard!
            </p>
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
      <p className="text-[11px] text-muted-foreground truncate">
        {achievement.description}
      </p>
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
    <p className="text-[10px] text-muted-foreground leading-tight">
      {achievement.description}
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

const CategoryIcon = ({ category }: { category: string }) => {
  const iconClass = "h-3.5 w-3.5 text-muted-foreground";
  switch (category) {
    case "Social Butterfly":
      return <MessageSquare className={iconClass} />;
    case "Curious Mind":
      return <HelpCircle className={iconClass} />;
    case "Voice of the People":
      return <BarChart3 className={iconClass} />;
    case "Team Player":
      return <UserPlus className={iconClass} />;
    case "Event Explorer":
      return <Compass className={iconClass} />;
    case "Milestones":
      return <Star className={iconClass} />;
    default:
      return <Trophy className={iconClass} />;
  }
};

const EARN_POINTS_GUIDE = [
  { reason: "MESSAGE_SENT", label: "Send a chat message", points: POINT_VALUES[PointReasonEnum.MESSAGE_SENT] },
  { reason: "MESSAGE_REACTED", label: "React to a message", points: POINT_VALUES[PointReasonEnum.MESSAGE_REACTED] },
  { reason: "QUESTION_ASKED", label: "Ask a question", points: POINT_VALUES[PointReasonEnum.QUESTION_ASKED] },
  { reason: "QUESTION_UPVOTED", label: "Upvote a question", points: POINT_VALUES[PointReasonEnum.QUESTION_UPVOTED] },
  { reason: "POLL_VOTED", label: "Vote in a poll", points: POINT_VALUES[PointReasonEnum.POLL_VOTED] },
  { reason: "POLL_CREATED", label: "Create a poll", points: POINT_VALUES[PointReasonEnum.POLL_CREATED] },
  { reason: "TEAM_CREATED", label: "Create a team", points: POINT_VALUES[PointReasonEnum.TEAM_CREATED] },
  { reason: "TEAM_JOINED", label: "Join a team", points: POINT_VALUES[PointReasonEnum.TEAM_JOINED] },
  { reason: "SESSION_JOINED", label: "Join a session", points: POINT_VALUES[PointReasonEnum.SESSION_JOINED] },
];
