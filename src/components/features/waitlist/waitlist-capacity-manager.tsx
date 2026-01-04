// src/components/features/waitlist/waitlist-capacity-manager.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_SESSION_WAITLIST_QUERY,
  UPDATE_SESSION_CAPACITY_MUTATION,
} from "@/graphql/monetization.graphql";
import { Loader2, Users, Settings2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface WaitlistCapacityManagerProps {
  sessionId: string;
  sessionTitle?: string;
}

interface SessionCapacity {
  current: number;
  maximum: number;
  waitlistCount: number;
  isAvailable: boolean;
}

export function WaitlistCapacityManager({ sessionId, sessionTitle }: WaitlistCapacityManagerProps) {
  const [newCapacity, setNewCapacity] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const { data, loading, refetch } = useQuery(GET_SESSION_WAITLIST_QUERY, {
    variables: { sessionId },
    skip: !sessionId,
  });

  const [updateCapacity, { loading: updating }] = useMutation(UPDATE_SESSION_CAPACITY_MUTATION, {
    onCompleted: (data) => {
      const result = data.updateSessionCapacity;
      const autoSent = result.offersAutomaticallySent || 0;
      toast.success("Capacity updated successfully", {
        description: autoSent > 0 ? `Automatically sent ${autoSent} offers to waitlist` : undefined,
      });
      setIsEditing(false);
      setNewCapacity("");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update capacity", {
        description: error.message,
      });
    },
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Session Capacity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const capacity: SessionCapacity | undefined = data?.sessionCapacity;

  if (!capacity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Session Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Capacity information not available. Backend endpoint may not be implemented yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleUpdateCapacity = () => {
    const capacityValue = parseInt(newCapacity);

    if (isNaN(capacityValue) || capacityValue < 0) {
      toast.error("Invalid capacity", {
        description: "Please enter a valid positive number",
      });
      return;
    }

    if (capacityValue < capacity.current) {
      toast.error("Invalid capacity", {
        description: `Capacity cannot be less than current attendance (${capacity.current})`,
      });
      return;
    }

    updateCapacity({
      variables: {
        input: {
          sessionId,
          capacity: capacityValue,
        },
      },
    });
  };

  const occupancyPercentage = capacity.maximum > 0 ? (capacity.current / capacity.maximum) * 100 : 0;
  const spotsAvailable = capacity.maximum - capacity.current;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Session Capacity Management
        </CardTitle>
        {sessionTitle && (
          <CardDescription>{sessionTitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Capacity Overview */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-4 rounded-lg border bg-card">
                <span className="text-sm text-muted-foreground mb-1">Current Attendance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{capacity.current}</span>
                  <span className="text-sm text-muted-foreground">/ {capacity.maximum}</span>
                </div>
              </div>

              <div className="flex flex-col p-4 rounded-lg border bg-card">
                <span className="text-sm text-muted-foreground mb-1">Waitlist</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{capacity.waitlistCount}</span>
                  <span className="text-sm text-muted-foreground">waiting</span>
                </div>
              </div>
            </div>

            {/* Occupancy Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Occupancy</span>
                <span className="text-muted-foreground">{occupancyPercentage.toFixed(0)}%</span>
              </div>
              <Progress
                value={occupancyPercentage}
                className="h-3"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{spotsAvailable > 0 ? `${spotsAvailable} spots available` : "Session full"}</span>
                <Badge variant={capacity.isAvailable ? "default" : "secondary"}>
                  {capacity.isAvailable ? "Available" : "Full"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Warning if there's a waitlist */}
          {capacity.waitlistCount > 0 && spotsAvailable > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-600">Waitlist Available</p>
                <p className="text-muted-foreground mt-1">
                  There are {capacity.waitlistCount} people waiting. Consider sending offers to fill the {spotsAvailable} available spots.
                </p>
              </div>
            </div>
          )}

          {/* Update Capacity Form */}
          <div className="pt-4 border-t">
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(true);
                  setNewCapacity(capacity.maximum.toString());
                }}
                className="w-full"
              >
                <Settings2 className="h-4 w-4 mr-2" />
                Update Maximum Capacity
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="capacity">New Maximum Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={capacity.current}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    placeholder={`Minimum: ${capacity.current}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least {capacity.current} (current attendance)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateCapacity}
                    disabled={updating || !newCapacity}
                    className="flex-1"
                  >
                    {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setNewCapacity("");
                    }}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
