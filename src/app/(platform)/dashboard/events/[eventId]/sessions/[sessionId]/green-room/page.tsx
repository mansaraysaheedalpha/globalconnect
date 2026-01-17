// src/app/(platform)/dashboard/events/[eventId]/sessions/[sessionId]/green-room/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_SESSION_BY_ID_QUERY, GET_EVENT_BY_ID_QUERY } from "@/graphql/events.graphql";
import { useAuthStore } from "@/store/auth.store";
import { useSocket } from "@/hooks/use-socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Radio,
  Clock,
  Video,
  Users,
  FileText,
  Mic,
  Camera,
  ArrowRight,
  Loader,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";

export default function GreenRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const eventId = params.eventId as string;
  const sessionId = params.sessionId as string;

  const [countdown, setCountdown] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [avChecks, setAvChecks] = useState({
    camera: false,
    microphone: false,
    network: false,
  });
  const [onlineSpeakers, setOnlineSpeakers] = useState<Set<string>>(new Set());

  // Socket for real-time presence
  const { socket, isConnected } = useSocket();

  const { data: sessionData, loading: sessionLoading } = useQuery(
    GET_SESSION_BY_ID_QUERY,
    {
      variables: { id: sessionId },
      pollInterval: 10000, // Refresh every 10 seconds
    }
  );

  const { data: eventData } = useQuery(GET_EVENT_BY_ID_QUERY, {
    variables: { id: eventId },
  });

  const session = sessionData?.session;
  const event = eventData?.event;

  // Check if user is a speaker for this session
  const isSpeaker = session?.speakers?.some(
    (s: { userId: string | null }) => s.userId === user?.id
  );
  const isOrgMember = user?.role === "OWNER" || user?.role === "ADMIN" || user?.role === "MEMBER";

  // Countdown timer
  useEffect(() => {
    if (!session?.startTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(session.startTime);
      const diff = differenceInSeconds(start, now);

      if (diff <= 0) {
        setCountdown("LIVE NOW");
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session?.startTime]);

  // Simulate A/V checks
  useEffect(() => {
    const checkAV = async () => {
      // Network check
      setAvChecks((prev) => ({ ...prev, network: true }));

      // Camera check (simulated)
      if (!session?.requiresCamera) {
        setAvChecks((prev) => ({ ...prev, camera: true }));
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop());
          setAvChecks((prev) => ({ ...prev, camera: true }));
        } catch {
          setAvChecks((prev) => ({ ...prev, camera: false }));
        }
      }

      // Microphone check (simulated)
      if (!session?.requiresMicrophone) {
        setAvChecks((prev) => ({ ...prev, microphone: true }));
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          setAvChecks((prev) => ({ ...prev, microphone: true }));
        } catch {
          setAvChecks((prev) => ({ ...prev, microphone: false }));
        }
      }
    };

    if (session) {
      checkAV();
    }
  }, [session]);

  // Update ready state
  useEffect(() => {
    const allChecksPass =
      avChecks.network &&
      (avChecks.camera || !session?.requiresCamera) &&
      (avChecks.microphone || !session?.requiresMicrophone);
    setIsReady(allChecksPass);
  }, [avChecks, session?.requiresCamera, session?.requiresMicrophone]);

  // Green Room presence tracking - ONLY for assigned speakers
  // Organizers can view the green room but aren't tracked as "online presenters"
  useEffect(() => {
    if (!socket || !isConnected || !sessionId || !user?.id) return;

    // Handle initial presence list when joining (all users receive this)
    const handlePresenceList = (data: { users: Array<{ userId: string; firstName: string; lastName: string }> }) => {
      if (data?.users && Array.isArray(data.users)) {
        setOnlineSpeakers(new Set(data.users.map((u) => u.userId)));
      }
    };

    // Handle user joined green room
    const handleUserJoined = (data: { userId: string; firstName: string; lastName: string }) => {
      if (data?.userId) {
        setOnlineSpeakers((prev) => new Set([...prev, data.userId]));
      }
    };

    // Handle user left green room
    const handleUserLeft = (data: { userId: string }) => {
      if (data?.userId) {
        setOnlineSpeakers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    // Only emit join if user is an assigned speaker for this session
    // Organizers can still view the green room and see who's online,
    // but they won't be tracked as "online presenters"
    if (isSpeaker) {
      socket.emit("greenroom.join", {
        sessionId,
        eventId,
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
      });
    }

    // Everyone listens for presence updates (so organizers can see who's arrived)
    socket.on("greenroom.presence", handlePresenceList);
    socket.on("greenroom.user.joined", handleUserJoined);
    socket.on("greenroom.user.left", handleUserLeft);

    return () => {
      // Only emit leave if we joined (i.e., if we're a speaker)
      if (isSpeaker) {
        socket.emit("greenroom.leave", { sessionId, userId: user.id });
      }
      socket.off("greenroom.presence", handlePresenceList);
      socket.off("greenroom.user.joined", handleUserJoined);
      socket.off("greenroom.user.left", handleUserLeft);
    };
  }, [socket, isConnected, sessionId, eventId, user?.id, user?.first_name, user?.last_name, isSpeaker]);

  const handleEnterSession = () => {
    // Navigate to the session/streaming page
    // Use session-specific URL first, then fall back to event-level URL (in virtualSettings)
    const streamingUrl = session?.streamingUrl || event?.virtualSettings?.streamingUrl;
    if (streamingUrl) {
      window.open(streamingUrl, "_blank");
    } else {
      // No streaming URL configured - go to the session view page
      router.push(`/dashboard/events/${eventId}/sessions/${sessionId}`);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg">Session not found</p>
      </div>
    );
  }

  if (!session.greenRoomEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg">Green room is not enabled for this session</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`/dashboard/events/${eventId}`)}
        >
          Return to Event
        </Button>
      </div>
    );
  }

  if (!session.greenRoomOpen && !isOrgMember) {
    const openTime = new Date(session.startTime);
    openTime.setMinutes(openTime.getMinutes() - session.greenRoomOpensMinutesBefore);

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Clock className="h-16 w-16 mb-6 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Green Room Not Yet Open</h2>
        <p className="text-muted-foreground mb-4">
          The green room opens at {format(openTime, "h:mm a")}
        </p>
        <p className="text-sm text-muted-foreground">
          ({session.greenRoomOpensMinutesBefore} minutes before session starts)
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => router.push(`/dashboard/events/${eventId}`)}
        >
          Return to Event
        </Button>
      </div>
    );
  }

  const isLive = countdown === "LIVE NOW";
  const sessionEnd = new Date(session.endTime);
  const isEnded = new Date() > sessionEnd;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>{event?.name || "Event"}</span>
          <span>/</span>
          <span>Green Room</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{session.title}</h1>
          {isLive ? (
            <Badge className="bg-red-500 text-white animate-pulse">
              <Radio className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          ) : isEnded ? (
            <Badge variant="outline">Session Ended</Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Green Room Open
            </Badge>
          )}
        </div>
      </div>

      {/* Countdown Card */}
      <Card className={cn("mb-6", isLive && "border-red-500 bg-red-500/5")}>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {isLive ? "Session is" : "Session starts in"}
            </p>
            <p
              className={cn(
                "text-5xl font-bold font-mono",
                isLive ? "text-red-500" : "text-foreground"
              )}
            >
              {countdown}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {format(new Date(session.startTime), "EEEE, MMMM d 'at' h:mm a")}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Producer Notes */}
        {session.greenRoomNotes && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Producer Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription className="whitespace-pre-wrap">
                  {session.greenRoomNotes}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* A/V Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5" />
              Technical Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    avChecks.network ? "bg-green-500/20" : "bg-yellow-500/20"
                  )}
                >
                  {avChecks.network ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Loader className="h-4 w-4 text-yellow-500 animate-spin" />
                  )}
                </div>
                <span className="font-medium">Network Connection</span>
              </div>
              <Badge variant={avChecks.network ? "default" : "secondary"}>
                {avChecks.network ? "Connected" : "Checking..."}
              </Badge>
            </div>

            {session.requiresCamera && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      avChecks.camera ? "bg-green-500/20" : "bg-red-500/20"
                    )}
                  >
                    <Camera
                      className={cn(
                        "h-4 w-4",
                        avChecks.camera ? "text-green-500" : "text-red-500"
                      )}
                    />
                  </div>
                  <span className="font-medium">Camera</span>
                </div>
                <Badge variant={avChecks.camera ? "default" : "destructive"}>
                  {avChecks.camera ? "Ready" : "Not Detected"}
                </Badge>
              </div>
            )}

            {session.requiresMicrophone && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      avChecks.microphone ? "bg-green-500/20" : "bg-red-500/20"
                    )}
                  >
                    <Mic
                      className={cn(
                        "h-4 w-4",
                        avChecks.microphone ? "text-green-500" : "text-red-500"
                      )}
                    />
                  </div>
                  <span className="font-medium">Microphone</span>
                </div>
                <Badge variant={avChecks.microphone ? "default" : "destructive"}>
                  {avChecks.microphone ? "Ready" : "Not Detected"}
                </Badge>
              </div>
            )}

            {session.broadcastOnly && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This is a broadcast-only session. Attendees will view the stream but cannot
                  participate with audio/video.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Speakers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Speakers
              </div>
              {onlineSpeakers.size > 0 && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  {onlineSpeakers.size} online
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {session.speakers?.map((speaker: { id: string; name: string; userId: string | null }) => {
                const isOnline = speaker.userId ? onlineSpeakers.has(speaker.userId) : false;
                const isCurrentUser = speaker.userId === user?.id;
                return (
                  <div
                    key={speaker.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      isOnline ? "bg-green-500/10 border border-green-500/20" : "bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Online indicator */}
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        isOnline ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"
                      )} />
                      <span className="font-medium">{speaker.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOnline && !isCurrentUser && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                          In Green Room
                        </Badge>
                      )}
                      {isCurrentUser && (
                        <Badge variant="outline">You</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!session.speakers || session.speakers.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No speakers assigned
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Go Live Button */}
      <Separator className="my-8" />

      <div className="flex flex-col items-center gap-4">
        {isEnded ? (
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Session Ended</AlertTitle>
            <AlertDescription>
              This session has already concluded.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Button
              size="lg"
              className={cn(
                "text-lg px-8",
                isLive && "bg-red-600 hover:bg-red-700"
              )}
              disabled={!isReady && !isLive}
              onClick={handleEnterSession}
            >
              {isLive ? (
                <>
                  <Radio className="h-5 w-5 mr-2 animate-pulse" />
                  Enter Live Session
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Preview Session
                </>
              )}
            </Button>
            {!isReady && !isLive && (
              <p className="text-sm text-muted-foreground">
                Complete the technical checklist to continue
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
