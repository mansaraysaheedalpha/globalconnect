// src/app/(platform)/dashboard/events/[eventId]/producer/_components/breakout-rooms-control.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Users, DoorOpen, ExternalLink } from "lucide-react";
import {
  BreakoutRoomList,
  CreateBreakoutRoomModal,
  CreateBreakoutRoomData,
} from "@/components/features/breakout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  sessionType?: string;
};

interface BreakoutRoomsControlProps {
  sessions: Session[];
  eventId: string;
}

export function BreakoutRoomsControl({ sessions, eventId }: BreakoutRoomsControlProps) {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions[0]?.id || ""
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRecallDialogOpen, setIsRecallDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const handleCreateRoom = useCallback(
    async (data: CreateBreakoutRoomData) => {
      if (!socket || !isConnected) {
        toast.error("Not connected to server");
        return;
      }

      setIsSubmitting(true);
      socket.emit(
        "breakout.room.create",
        data,
        (response: { success: boolean; error?: string }) => {
          setIsSubmitting(false);
          if (response.success) {
            toast.success("Breakout room created");
            setIsCreateModalOpen(false);
          } else {
            toast.error(response.error || "Failed to create room");
          }
        }
      );
    },
    [socket, isConnected]
  );

  const handleRecallAll = useCallback(() => {
    if (!socket || !isConnected || !selectedSessionId) {
      toast.error("Not connected to server");
      return;
    }

    socket.emit(
      "breakout.all.recall",
      { sessionId: selectedSessionId },
      (response: { success: boolean; error?: string }) => {
        if (response.success) {
          toast.success("All participants recalled to main session");
          setIsRecallDialogOpen(false);
        } else {
          toast.error(response.error || "Failed to recall participants");
        }
      }
    );
  }, [socket, isConnected, selectedSessionId]);

  const handleOpenFullPage = () => {
    if (selectedSessionId) {
      router.push(
        `/dashboard/events/${eventId}/sessions/${selectedSessionId}/breakout-rooms`
      );
    }
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <DoorOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No sessions available for breakout rooms</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session Selector and Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <DoorOpen className="h-4 w-4" />
              Breakout Rooms
            </CardTitle>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={selectedSessionId}
                onValueChange={setSelectedSessionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      <div className="flex items-center gap-2">
                        <span>{session.title}</span>
                        {session.sessionType && (
                          <Badge variant="outline" className="text-xs">
                            {session.sessionType}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecallDialogOpen(true)}
              disabled={!selectedSessionId}
            >
              <Users className="h-4 w-4 mr-1" />
              Recall All
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!selectedSessionId}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Room
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFullPage}
              disabled={!selectedSessionId}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {selectedSession && (
            <p className="text-sm text-muted-foreground">
              Managing breakout rooms for: <strong>{selectedSession.title}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Rooms List */}
      {selectedSessionId && (
        <BreakoutRoomList
          sessionId={selectedSessionId}
          eventId={eventId}
          isOrganizer={true}
          onStartRoom={(roomId) => toast.success(`Room started`)}
          onCloseRoom={(roomId) => toast.success(`Room closed`)}
        />
      )}

      {/* Create Room Modal */}
      {selectedSessionId && (
        <CreateBreakoutRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          sessionId={selectedSessionId}
          eventId={eventId}
          onSubmit={handleCreateRoom}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Recall All Dialog */}
      <AlertDialog open={isRecallDialogOpen} onOpenChange={setIsRecallDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recall All Participants</AlertDialogTitle>
            <AlertDialogDescription>
              This will close all breakout rooms for the selected session and
              notify all participants to return to the main session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRecallAll}>
              Recall Everyone
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
