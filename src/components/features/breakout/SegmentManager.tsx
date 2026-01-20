// src/components/features/breakout/SegmentManager.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Trash2,
  Users,
  Link2,
  Play,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BreakoutSegment,
  BreakoutRoom,
  MatchCriteria,
  MatchOperator,
  CreateSegmentData,
} from "./types";

// Common registration fields that can be used for segmentation
const REGISTRATION_FIELDS = [
  { value: "jobRole", label: "Job Role" },
  { value: "industry", label: "Industry" },
  { value: "company", label: "Company" },
  { value: "experienceLevel", label: "Experience Level" },
  { value: "country", label: "Country" },
  { value: "interests", label: "Interests" },
  { value: "department", label: "Department" },
];

const OPERATORS: { value: MatchOperator; label: string }[] = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "in", label: "Is one of" },
];

const SEGMENT_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
];

interface SegmentManagerProps {
  sessionId: string;
  eventId: string;
  rooms: BreakoutRoom[];
}

export function SegmentManager({
  sessionId,
  eventId,
  rooms,
}: SegmentManagerProps) {
  const { socket, isConnected } = useSocket();
  const [segments, setSegments] = useState<BreakoutSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [selectedSegmentForRule, setSelectedSegmentForRule] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [computeResult, setComputeResult] = useState<{
    created: number;
    errors: string[];
  } | null>(null);

  // Form state for creating segment
  const [newSegment, setNewSegment] = useState<{
    name: string;
    description: string;
    color: string;
    field: string;
    operator: MatchOperator;
    value: string;
  }>({
    name: "",
    description: "",
    color: SEGMENT_COLORS[0],
    field: "jobRole",
    operator: "equals",
    value: "",
  });

  // Form state for assignment rule
  const [newRule, setNewRule] = useState<{
    roomId: string;
    maxFromSegment: string;
  }>({
    roomId: "",
    maxFromSegment: "",
  });

  // Fetch segments
  useEffect(() => {
    if (!socket || !isConnected) return;

    setIsLoading(true);
    socket.emit(
      "segment.list",
      { sessionId },
      (response: { success: boolean; segments?: BreakoutSegment[] }) => {
        if (response.success && response.segments) {
          setSegments(response.segments);
        }
        setIsLoading(false);
      }
    );
  }, [socket, isConnected, sessionId]);

  // Listen for segment updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleCreated = (segment: BreakoutSegment) => {
      setSegments((prev) => [...prev, segment]);
    };

    const handleUpdated = (segment: BreakoutSegment) => {
      setSegments((prev) =>
        prev.map((s) => (s.id === segment.id ? segment : s))
      );
    };

    const handleDeleted = (data: { segmentId: string }) => {
      setSegments((prev) => prev.filter((s) => s.id !== data.segmentId));
    };

    socket.on("segment.created", handleCreated);
    socket.on("segment.updated", handleUpdated);
    socket.on("segment.deleted", handleDeleted);

    return () => {
      socket.off("segment.created", handleCreated);
      socket.off("segment.updated", handleUpdated);
      socket.off("segment.deleted", handleDeleted);
    };
  }, [socket, isConnected]);

  // Create segment
  const handleCreateSegment = useCallback(() => {
    if (!socket || !newSegment.name.trim()) return;

    const data: CreateSegmentData = {
      sessionId,
      eventId,
      name: newSegment.name,
      description: newSegment.description || undefined,
      color: newSegment.color,
      priority: segments.length,
    };

    // Add match criteria if value is provided
    if (newSegment.value.trim()) {
      data.matchCriteria = {
        field: newSegment.field,
        operator: newSegment.operator,
        value:
          newSegment.operator === "in"
            ? newSegment.value.split(",").map((v) => v.trim())
            : newSegment.value,
      };
    }

    socket.emit(
      "segment.create",
      data,
      (response: { success: boolean; error?: string }) => {
        if (response.success) {
          setIsCreateOpen(false);
          setNewSegment({
            name: "",
            description: "",
            color: SEGMENT_COLORS[(segments.length + 1) % SEGMENT_COLORS.length],
            field: "jobRole",
            operator: "equals",
            value: "",
          });
        }
      }
    );
  }, [socket, sessionId, eventId, newSegment, segments.length]);

  // Delete segment
  const handleDeleteSegment = useCallback(
    (segmentId: string) => {
      if (!socket) return;

      socket.emit(
        "segment.delete",
        { segmentId, sessionId },
        (response: { success: boolean }) => {
          // Handled by socket event
        }
      );
    },
    [socket, sessionId]
  );

  // Create assignment rule
  const handleCreateRule = useCallback(() => {
    if (!socket || !selectedSegmentForRule || !newRule.roomId) return;

    socket.emit(
      "segment.rule.create",
      {
        segmentId: selectedSegmentForRule,
        roomId: newRule.roomId,
        sessionId,
        maxFromSegment: newRule.maxFromSegment
          ? parseInt(newRule.maxFromSegment)
          : undefined,
      },
      (response: { success: boolean }) => {
        if (response.success) {
          setIsRuleModalOpen(false);
          setSelectedSegmentForRule(null);
          setNewRule({ roomId: "", maxFromSegment: "" });
          // Refresh segments to get updated rules
          socket.emit(
            "segment.list",
            { sessionId },
            (res: { success: boolean; segments?: BreakoutSegment[] }) => {
              if (res.success && res.segments) {
                setSegments(res.segments);
              }
            }
          );
        }
      }
    );
  }, [socket, selectedSegmentForRule, newRule, sessionId]);

  // Delete assignment rule
  const handleDeleteRule = useCallback(
    (segmentId: string, roomId: string) => {
      if (!socket) return;

      socket.emit(
        "segment.rule.delete",
        { segmentId, roomId, sessionId },
        () => {
          // Refresh segments
          socket.emit(
            "segment.list",
            { sessionId },
            (res: { success: boolean; segments?: BreakoutSegment[] }) => {
              if (res.success && res.segments) {
                setSegments(res.segments);
              }
            }
          );
        }
      );
    },
    [socket, sessionId]
  );

  // Compute room assignments
  const handleComputeAssignments = useCallback(() => {
    if (!socket) return;

    setIsComputing(true);
    setComputeResult(null);

    socket.emit(
      "segment.assignment.compute",
      { sessionId, eventId },
      (response: { success: boolean; created?: number; errors?: string[] }) => {
        setIsComputing(false);
        if (response.success) {
          setComputeResult({
            created: response.created || 0,
            errors: response.errors || [],
          });
        }
      }
    );
  }, [socket, sessionId, eventId]);

  // Notify assignments
  const handleNotifyAssignments = useCallback(() => {
    if (!socket) return;

    socket.emit(
      "segment.assignment.notify",
      { sessionId },
      (response: { success: boolean; notified?: number }) => {
        if (response.success) {
          setComputeResult((prev) =>
            prev
              ? { ...prev, errors: [] }
              : { created: 0, errors: [] }
          );
        }
      }
    );
  }, [socket, sessionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Audience Segments</h3>
          <p className="text-sm text-muted-foreground">
            Create segments to auto-assign attendees to breakout rooms based on
            their registration data.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Segment
        </Button>
      </div>

      {/* Segments List */}
      {segments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No segments created yet.
              <br />
              Create segments to organize attendees into groups.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {segments.map((segment) => (
            <Collapsible key={segment.id} className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color || "#3B82F6" }}
                  />
                  <span className="font-medium">{segment.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {segment._count.members} members
                  </Badge>
                  {segment.matchCriteria && (
                    <Badge variant="outline" className="text-xs">
                      Auto-match
                    </Badge>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4">
                {segment.description && (
                  <p className="text-sm text-muted-foreground">
                    {segment.description}
                  </p>
                )}

                {/* Match Criteria */}
                {segment.matchCriteria && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">Match Criteria</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-mono">
                        {segment.matchCriteria.field}
                      </span>{" "}
                      <span className="text-primary">
                        {segment.matchCriteria.operator}
                      </span>{" "}
                      <span className="font-mono">
                        {Array.isArray(segment.matchCriteria.value)
                          ? segment.matchCriteria.value.join(", ")
                          : segment.matchCriteria.value}
                      </span>
                    </p>
                  </div>
                )}

                {/* Assignment Rules */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Room Assignments</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSegmentForRule(segment.id);
                        setIsRuleModalOpen(true);
                      }}
                    >
                      <Link2 className="w-3 h-3 mr-1" />
                      Link Room
                    </Button>
                  </div>
                  {segment.assignmentRules &&
                  segment.assignmentRules.length > 0 ? (
                    <div className="space-y-2">
                      {segment.assignmentRules.map((rule) => (
                        <div
                          key={rule.roomId}
                          className="flex items-center justify-between bg-muted/30 rounded px-3 py-2"
                        >
                          <span className="text-sm">{rule.room.name}</span>
                          <div className="flex items-center gap-2">
                            {rule.maxFromSegment && (
                              <Badge variant="outline" className="text-xs">
                                Max {rule.maxFromSegment}
                              </Badge>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() =>
                                handleDeleteRule(segment.id, rule.roomId)
                              }
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No rooms linked yet
                    </p>
                  )}
                </div>

                {/* Delete Segment */}
                <div className="flex justify-end pt-2 border-t">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteSegment(segment.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete Segment
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Compute Assignments */}
      {segments.length > 0 && rooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compute Assignments</CardTitle>
            <CardDescription>
              Run the assignment engine to pre-assign attendees to breakout
              rooms based on segment rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={handleComputeAssignments} disabled={isComputing}>
                {isComputing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Compute Assignments
              </Button>
              {computeResult && computeResult.created > 0 && (
                <Button variant="outline" onClick={handleNotifyAssignments}>
                  Notify Attendees
                </Button>
              )}
            </div>

            {computeResult && (
              <div
                className={cn(
                  "flex items-start gap-2 p-3 rounded-lg",
                  computeResult.errors.length > 0
                    ? "bg-yellow-500/10 text-yellow-600"
                    : "bg-green-500/10 text-green-600"
                )}
              >
                {computeResult.errors.length > 0 ? (
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                )}
                <div className="text-sm">
                  <p>Created {computeResult.created} assignments</p>
                  {computeResult.errors.length > 0 && (
                    <ul className="mt-1 list-disc list-inside">
                      {computeResult.errors.slice(0, 3).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Segment Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Segment</DialogTitle>
            <DialogDescription>
              Define a segment to group attendees based on their registration
              data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Segment Name</Label>
              <Input
                placeholder="e.g., Developers, Marketing Team"
                value={newSegment.name}
                onChange={(e) =>
                  setNewSegment({ ...newSegment, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                placeholder="Brief description of this segment"
                value={newSegment.description}
                onChange={(e) =>
                  setNewSegment({ ...newSegment, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {SEGMENT_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-6 h-6 rounded-full border-2",
                      newSegment.color === color
                        ? "border-foreground"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewSegment({ ...newSegment, color })}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Auto-Match Criteria (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Automatically add attendees whose registration data matches
                these criteria.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={newSegment.field}
                  onValueChange={(v) =>
                    setNewSegment({ ...newSegment, field: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGISTRATION_FIELDS.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={newSegment.operator}
                  onValueChange={(v) =>
                    setNewSegment({
                      ...newSegment,
                      operator: v as MatchOperator,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder={
                    newSegment.operator === "in"
                      ? "value1, value2"
                      : "Value"
                  }
                  value={newSegment.value}
                  onChange={(e) =>
                    setNewSegment({ ...newSegment, value: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSegment}>Create Segment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Room Modal */}
      <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Room to Segment</DialogTitle>
            <DialogDescription>
              Assign members of this segment to a specific breakout room.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Breakout Room</Label>
              <Select
                value={newRule.roomId}
                onValueChange={(v) => setNewRule({ ...newRule, roomId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Participants from Segment (Optional)</Label>
              <Input
                type="number"
                placeholder="Leave empty for no limit"
                value={newRule.maxFromSegment}
                onChange={(e) =>
                  setNewRule({ ...newRule, maxFromSegment: e.target.value })
                }
              />
              <p className="text-sm text-muted-foreground">
                Limit how many members from this segment can be assigned to this
                room.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRule}>Link Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
