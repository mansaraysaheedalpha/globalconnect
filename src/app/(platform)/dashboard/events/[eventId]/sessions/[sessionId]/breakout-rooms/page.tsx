// src/app/(platform)/dashboard/events/[eventId]/sessions/[sessionId]/breakout-rooms/page.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { useSocket } from "@/hooks/use-socket";
import { GET_SESSION_BY_ID_QUERY } from "@/graphql/events.graphql";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Users,
  RefreshCw,
  DoorOpen,
  AlertTriangle,
} from "lucide-react";
import {
  BreakoutRoomList,
  CreateBreakoutRoomModal,
  CreateBreakoutRoomData,
  SegmentManager,
  BreakoutRoom,
} from "@/components/features/breakout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function BreakoutRoomsManagementPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const sessionId = params.sessionId as string;
  const { socket, isConnected } = useSocket();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRecallDialogOpen, setIsRecallDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);

  const { data: sessionData, loading: sessionLoading } = useQuery(GET_SESSION_BY_ID_QUERY, {
    variables: { id: sessionId },
    skip: !sessionId,
  });

  const session: Session | undefined = sessionData?.session;

  // Fetch rooms for SegmentManager
  React.useEffect(() => {
    if (!socket || !isConnected || !sessionId) return;

    socket.emit(
      "breakout.rooms.list",
      { sessionId },
      (response: { success: boolean; rooms?: BreakoutRoom[] }) => {
        if (response.success && response.rooms) {
          setRooms(response.rooms);
        }
      }
    );

    // Listen for room updates
    const handleRoomCreated = (room: BreakoutRoom) => {
      setRooms((prev) => {
        if (prev.some((r) => r.id === room.id)) return prev;
        return [...prev, room];
      });
    };

    const handleRoomClosed = (data: { roomId: string }) => {
      setRooms((prev) => prev.filter((r) => r.id !== data.roomId));
    };

    socket.on("breakout.room.created", handleRoomCreated);
    socket.on("breakout.room.closed", handleRoomClosed);

    return () => {
      socket.off("breakout.room.created", handleRoomCreated);
      socket.off("breakout.room.closed", handleRoomClosed);
    };
  }, [socket, isConnected, sessionId]);

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
    if (!socket || !isConnected) {
      toast.error("Not connected to server");
      return;
    }

    socket.emit(
      "breakout.all.recall",
      { sessionId },
      (response: { success: boolean; error?: string }) => {
        if (response.success) {
          toast.success("All participants recalled to main session");
          setIsRecallDialogOpen(false);
        } else {
          toast.error(response.error || "Failed to recall participants");
        }
      }
    );
  }, [socket, isConnected, sessionId]);

  const handleRefresh = useCallback(() => {
    // Force a re-fetch by re-mounting the BreakoutRoomList component
    // This is a simple approach - could also use a key prop
    router.refresh();
  }, [router]);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Session not found</p>
        <Link href={`/dashboard/events/${eventId}`}>
          <Button variant="link">Back to Event</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/events/${eventId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Breakout Rooms</h1>
              <Badge variant="outline">
                <DoorOpen className="h-3 w-3 mr-1" />
                {session.sessionType || "Session"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{session.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="mr-2"
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRecallDialogOpen(true)}
          >
            <Users className="h-4 w-4 mr-1" />
            Recall All
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create Room
          </Button>
        </div>
      </div>

      {/* Tabs for Rooms and Segments */}
      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms">Breakout Rooms</TabsTrigger>
          <TabsTrigger value="segments">Audience Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          {/* Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                About Breakout Rooms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Breakout rooms allow attendees to split into smaller groups for focused
                discussions. You can create multiple rooms with different topics, set
                time limits, and recall everyone back to the main session when ready.
              </p>
            </CardContent>
          </Card>

          {/* Rooms List */}
          <BreakoutRoomList
            sessionId={sessionId}
            eventId={eventId}
            isOrganizer={true}
            onStartRoom={() => toast.success(`Room started`)}
            onCloseRoom={() => toast.success(`Room closed`)}
          />
        </TabsContent>

        <TabsContent value="segments">
          <SegmentManager
            sessionId={sessionId}
            eventId={eventId}
            rooms={rooms}
          />
        </TabsContent>
      </Tabs>

      {/* Create Room Modal */}
      <CreateBreakoutRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        sessionId={sessionId}
        eventId={eventId}
        onSubmit={handleCreateRoom}
        isSubmitting={isSubmitting}
      />

      {/* Recall All Confirmation Dialog */}
      <AlertDialog open={isRecallDialogOpen} onOpenChange={setIsRecallDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Recall All Participants
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will close all breakout rooms and notify all participants to
              return to the main session. This action cannot be undone.
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
