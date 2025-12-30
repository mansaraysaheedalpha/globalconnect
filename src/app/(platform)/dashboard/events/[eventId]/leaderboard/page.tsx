
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaderboard, TeamLeaderboard } from "./leaderboard";

const LeaderboardPage = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Leaderboard />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Team Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamLeaderboard />
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;