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
import { useParams, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, AlertCircle } from "lucide-react";

interface LeaderboardProps {
  sessionId?: string;
}

export const Leaderboard = ({ sessionId: propSessionId }: LeaderboardProps = {}) => {
  const params = useParams();
  const searchParams = useSearchParams();
  // Use prop sessionId, or query param, or fallback to eventId
  const sessionId = propSessionId || searchParams.get("sessionId") || (params.eventId as string);

  const { leaderboard, isConnected, error } = useGamification({ sessionId });

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load leaderboard: {error}</span>
      </div>
    );
  }

  return (
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
                  <AvatarImage src={`https://github.com/shadcn.png`} />
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
  );
};

export const TeamLeaderboard = ({ sessionId: propSessionId }: LeaderboardProps = {}) => {
    const params = useParams();
    const searchParams = useSearchParams();
    const sessionId = propSessionId || searchParams.get("sessionId") || (params.eventId as string);

    const { teamLeaderboard, error } = useGamification({ sessionId });

    if (error) {
      return (
        <div className="flex items-center gap-2 p-4 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load team leaderboard: {error}</span>
        </div>
      );
    }

    return (
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
    );
}