// Leaderboard components for gamification
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGamification } from "@/hooks/use-gamification";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, AlertCircle } from "lucide-react";

interface LeaderboardProps {
  sessionId: string;
}

export const Leaderboard = ({ sessionId }: LeaderboardProps) => {
  const { leaderboard, isConnected, error } = useGamification({ sessionId });

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load leaderboard: {error}</span>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No activity yet. Points will appear here as attendees interact during the session.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="text-right">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboard.map((entry, index) => (
          <TableRow key={entry.user.id} className={index < 3 ? "font-bold" : ""}>
            <TableCell>
              <div className="flex items-center gap-2">
                {index === 0 && <Crown className="w-6 h-6 text-yellow-500" />}
                {index === 1 && <Crown className="w-6 h-6 text-gray-400" />}
                {index === 2 && <Crown className="w-6 h-6 text-yellow-700" />}
                <span className="text-lg">{entry.rank}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>
                    {entry.user.firstName.charAt(0)}
                    {entry.user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {entry.user.firstName} {entry.user.lastName}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">{entry.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
};

export const TeamLeaderboard = ({ sessionId }: LeaderboardProps) => {
    const { teamLeaderboard, error } = useGamification({ sessionId });

    if (error) {
      return (
        <div className="flex items-center gap-2 p-4 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load team leaderboard: {error}</span>
        </div>
      );
    }

    if (teamLeaderboard.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No teams yet.
        </p>
      );
    }

    return (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
        <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Points</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {teamLeaderboard.map((entry, index) => (
            <TableRow key={entry.teamId} className={index < 3 ? "font-bold" : ""}>
                <TableCell>
                <div className="flex items-center gap-2">
                    {index === 0 && <Crown className="w-6 h-6 text-yellow-500" />}
                    {index === 1 && <Crown className="w-6 h-6 text-gray-400" />}
                    {index === 2 && <Crown className="w-6 h-6 text-yellow-700" />}
                    <span className="text-lg">{entry.rank}</span>
                </div>
                </TableCell>
                <TableCell>{entry.name}</TableCell>
                <TableCell className="text-right">{entry.score}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
        </div>
    );
}
