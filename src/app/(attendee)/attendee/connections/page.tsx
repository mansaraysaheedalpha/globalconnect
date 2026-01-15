// src/app/(attendee)/attendee/connections/page.tsx
"use client";

import { useMemo } from "react";
import { useConnections } from "@/hooks/use-connections";
import { useFollowUp } from "@/hooks/use-follow-up";
import { ConnectionCard } from "@/components/features/connections/connection-card";
import { FollowUpCard } from "@/components/features/connections/follow-up-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  CheckCircle,
  Trophy,
  Loader2,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Connection, getOtherUser, formatUserName } from "@/types/connection";

export default function ConnectionsPage() {
  const {
    connections,
    isLoading,
    error,
    currentUserId,
    markFollowUpSent,
    reportOutcome,
    fetchConnections,
  } = useConnections();

  const {
    sendFollowUp,
    isSending,
  } = useFollowUp();

  // Group connections by status
  const { pendingFollowUp, followedUp, withOutcomes } = useMemo(() => {
    const pending: Connection[] = [];
    const followed: Connection[] = [];
    const outcomes: Connection[] = [];

    connections.forEach((c) => {
      if (c.outcomeType) {
        outcomes.push(c);
      } else if (c.followUpSentAt) {
        followed.push(c);
      } else {
        pending.push(c);
      }
    });

    return {
      pendingFollowUp: pending,
      followedUp: followed,
      withOutcomes: outcomes,
    };
  }, [connections]);

  const handleSendFollowUp = async (connectionId: string) => {
    await markFollowUpSent(connectionId);
  };

  const handleSendFollowUpMessage = async (connectionId: string, message: string): Promise<boolean> => {
    const success = await sendFollowUp(connectionId, message);
    if (success) {
      // Refresh connections to update the list
      await fetchConnections();
    }
    return success;
  };

  const handleReportOutcome = async (
    connectionId: string,
    outcome: { outcomeType: string; outcomeNotes?: string }
  ) => {
    await reportOutcome(connectionId, outcome as never);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="border-destructive">
          <CardContent className="py-6 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Connections</h1>
        <p className="text-muted-foreground">
          People you've met at events. Follow up and track your networking outcomes.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{connections.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{pendingFollowUp.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending Follow-ups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{followedUp.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Followed Up</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{withOutcomes.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Outcomes Reported</p>
          </CardContent>
        </Card>
      </div>

      {connections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No Connections Yet</h3>
            <p className="text-muted-foreground mt-2">
              Start networking at events to build your connections. Use the proximity
              feature to discover and ping nearby attendees.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingFollowUp.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingFollowUp.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="followed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Followed Up
            </TabsTrigger>
            <TabsTrigger value="outcomes" className="gap-2">
              <Trophy className="h-4 w-4" />
              Outcomes
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Users className="h-4 w-4" />
              All
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingFollowUp.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-muted-foreground">
                    Great job! All follow-ups sent.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-amber-50/50 border-amber-200">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Mail className="h-4 w-4" />
                      <p className="text-sm">
                        <strong>{pendingFollowUp.length}</strong> connection{pendingFollowUp.length !== 1 ? "s" : ""} waiting for your follow-up message
                      </p>
                    </div>
                  </CardContent>
                </Card>
                {pendingFollowUp.map((connection) => (
                  <FollowUpCard
                    key={connection.id}
                    connection={connection}
                    currentUserId={currentUserId || ""}
                    onSendFollowUp={handleSendFollowUpMessage}
                  />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="followed" className="space-y-4">
            {followedUp.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No followed-up connections yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              followedUp.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  currentUserId={currentUserId || ""}
                  onReportOutcome={handleReportOutcome}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-4">
            {withOutcomes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No outcomes reported yet. Track the results of your networking!
                  </p>
                </CardContent>
              </Card>
            ) : (
              withOutcomes.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  currentUserId={currentUserId || ""}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {connections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                currentUserId={currentUserId || ""}
                onSendFollowUp={
                  !connection.followUpSentAt ? handleSendFollowUp : undefined
                }
                onReportOutcome={
                  !connection.outcomeType ? handleReportOutcome : undefined
                }
              />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
