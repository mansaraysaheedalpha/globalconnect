// Challenge monitor - shows all challenges with organizer controls
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords, ListOrdered } from "lucide-react";
import { ChallengeCard } from "@/components/features/gamification/challenge-card";
import type { Challenge } from "@/hooks/use-challenges";

interface ChallengeMonitorProps {
  challenges: Challenge[];
  onStart: (challengeId: string) => void;
  onCancel: (challengeId: string) => void;
}

export const ChallengeMonitor = ({
  challenges,
  onStart,
  onCancel,
}: ChallengeMonitorProps) => {
  const active = challenges.filter((c) => c.status === "ACTIVE");
  const pending = challenges.filter((c) => c.status === "PENDING");
  const completed = challenges.filter((c) => c.status === "COMPLETED");
  const cancelled = challenges.filter((c) => c.status === "CANCELLED");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ListOrdered className="h-4 w-4" />
          Challenges ({challenges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No challenges created yet. Use the creator above to start one.
          </p>
        )}

        {active.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
              Active ({active.length})
            </p>
            {active.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                isOrganizer
                onCancel={onCancel}
              />
            ))}
          </div>
        )}

        {pending.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">
              Pending ({pending.length})
            </p>
            {pending.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                isOrganizer
                onStart={onStart}
                onCancel={onCancel}
              />
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Completed ({completed.length})
            </p>
            {completed.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        )}

        {cancelled.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Cancelled ({cancelled.length})
            </p>
            {cancelled.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
