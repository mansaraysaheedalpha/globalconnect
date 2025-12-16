// src/components/features/gamification/leaderboard.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, TrendingUp, User } from "lucide-react";
import { LeaderboardEntry, TeamLeaderboardEntry } from "@/hooks/use-gamification";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  currentUserRank?: number | null;
  currentUserScore?: number;
  title?: string;
  showTopN?: number;
  isLoading?: boolean;
  className?: string;
}

/**
 * Displays the session/event leaderboard with rankings
 */
export const Leaderboard = ({
  entries,
  currentUserId,
  currentUserRank,
  currentUserScore,
  title = "Leaderboard",
  showTopN = 10,
  isLoading = false,
  className = "",
}: LeaderboardProps) => {
  const displayEntries = entries.slice(0, showTopN);
  const userInTop = displayEntries.some((e) => e.user.id === currentUserId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No participants yet. Be the first!
          </p>
        ) : (
          <div className="space-y-2">
            {displayEntries.map((entry, index) => (
              <LeaderboardRow
                key={entry.user.id}
                entry={entry}
                isCurrentUser={entry.user.id === currentUserId}
                animationDelay={index * 0.1}
              />
            ))}

            {/* Show current user if not in top N */}
            {!userInTop && currentUserRank && currentUserScore !== undefined && (
              <>
                <div className="border-t my-3" />
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>...</span>
                </div>
                <LeaderboardRow
                  entry={{
                    rank: currentUserRank,
                    user: {
                      id: currentUserId || "",
                      firstName: "You",
                      lastName: "",
                    },
                    score: currentUserScore,
                  }}
                  isCurrentUser={true}
                  animationDelay={0}
                />
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  animationDelay: number;
}

const LeaderboardRow = ({
  entry,
  isCurrentUser,
  animationDelay,
}: LeaderboardRowProps) => {
  const { rank, user, score } = entry;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 text-center text-sm font-medium text-muted-foreground">
            {rank}
          </span>
        );
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-colors",
        isCurrentUser
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted/50",
        rank <= 3 && "font-medium"
      )}
    >
      {/* Rank */}
      <div className="w-8 flex justify-center">{getRankIcon(rank)}</div>

      {/* Avatar */}
      <Avatar className="h-8 w-8">
        <AvatarFallback
          className={cn(
            "text-xs",
            rank === 1 && "bg-yellow-100 text-yellow-700",
            rank === 2 && "bg-gray-100 text-gray-700",
            rank === 3 && "bg-amber-100 text-amber-700"
          )}
        >
          {isCurrentUser ? <User className="h-4 w-4" /> : getInitials(user.firstName, user.lastName)}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <span className={cn("flex-1 truncate", isCurrentUser && "font-semibold")}>
        {isCurrentUser ? "You" : `${user.firstName} ${user.lastName}`}
      </span>

      {/* Score */}
      <div className="flex items-center gap-1">
        <TrendingUp className="h-3 w-3 text-muted-foreground" />
        <span className={cn("font-mono", rank <= 3 && "font-bold")}>
          {score.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
};

/**
 * Team leaderboard variant
 */
interface TeamLeaderboardProps {
  entries: TeamLeaderboardEntry[];
  title?: string;
  showTopN?: number;
  isLoading?: boolean;
  className?: string;
}

export const TeamLeaderboard = ({
  entries,
  title = "Team Standings",
  showTopN = 10,
  isLoading = false,
  className = "",
}: TeamLeaderboardProps) => {
  const displayEntries = entries.slice(0, showTopN);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No teams yet.
          </p>
        ) : (
          <div className="space-y-2">
            {displayEntries.map((entry, index) => (
              <TeamRow
                key={entry.teamId}
                entry={entry}
                animationDelay={index * 0.1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface TeamRowProps {
  entry: TeamLeaderboardEntry;
  animationDelay: number;
}

const TeamRow = ({ entry, animationDelay }: TeamRowProps) => {
  const { rank, name, memberCount, score } = entry;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 text-center text-sm font-medium text-muted-foreground">
            {rank}
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors",
        rank <= 3 && "font-medium"
      )}
    >
      {/* Rank */}
      <div className="w-8 flex justify-center">{getRankIcon(rank)}</div>

      {/* Team name and members */}
      <div className="flex-1 min-w-0">
        <span className="block truncate">{name}</span>
        <span className="text-xs text-muted-foreground">
          {memberCount} member{memberCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1">
        <TrendingUp className="h-3 w-3 text-muted-foreground" />
        <span className={cn("font-mono", rank <= 3 && "font-bold")}>
          {score.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
};
