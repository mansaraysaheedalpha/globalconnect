// src/app/(platform)/dashboard/events/[eventId]/_components/session-item.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { PresentationStatus, PresentationState } from "./presentation-status";
import { SessionChat } from "./session-chat";
import { SessionQA } from "./session-qa";
import { SessionPolls } from "./session-polls";
import { BackchannelPanel } from "./backchannel-panel";
import { MoreVertical, Edit, Trash2, Clock as ClockIcon, Mic2 as MicrophoneIcon, MessageSquare, HelpCircle, BarChart3, Smile, X, Radio, Play, Square, Video } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { TOGGLE_SESSION_CHAT_MUTATION, TOGGLE_SESSION_QA_MUTATION, TOGGLE_SESSION_POLLS_MUTATION, TOGGLE_SESSION_REACTIONS_MUTATION, END_SESSION_MUTATION } from "@/graphql/events.graphql";
import { cn } from "@/lib/utils";
import { VirtualSessionView } from "@/components/features/virtual-session";
import type { VirtualSession } from "@/components/features/virtual-session";

type Speaker = { id: string; name: string; userId?: string | null };
type SessionType = "MAINSTAGE" | "BREAKOUT" | "WORKSHOP" | "NETWORKING" | "EXPO";
type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status?: string;
  chatEnabled?: boolean;
  qaEnabled?: boolean;
  pollsEnabled?: boolean;
  reactionsEnabled?: boolean;
  chatOpen?: boolean;
  qaOpen?: boolean;
  pollsOpen?: boolean;
  reactionsOpen?: boolean;
  sessionType?: SessionType | null;
  streamingUrl?: string | null;
  recordingUrl?: string | null;
  virtualRoomId?: string | null;
  broadcastOnly?: boolean;
  streamingProvider?: string | null;
  isRecordable?: boolean;
  autoCaptions?: boolean;
  lobbyEnabled?: boolean;
  speakers: Speaker[];
};

// Session type badge styling
const getSessionTypeBadge = (sessionType?: SessionType | null) => {
  if (!sessionType) return null;
  const styles: Record<SessionType, string> = {
    MAINSTAGE: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    BREAKOUT: "bg-green-500/10 text-green-600 border-green-500/20",
    WORKSHOP: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    NETWORKING: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    EXPO: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  };
  const labels: Record<SessionType, string> = {
    MAINSTAGE: "Mainstage",
    BREAKOUT: "Breakout",
    WORKSHOP: "Workshop",
    NETWORKING: "Networking",
    EXPO: "Expo",
  };
  return (
    <Badge variant="outline" className={styles[sessionType]}>
      {labels[sessionType]}
    </Badge>
  );
};
type Event = {
  id: string;
  organizationId: string;
};

interface SessionItemProps {
  session: Session;
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onUpload: (session: Session) => void;
  onView: (session: Session) => void;
}

export const SessionItem = ({
  session,
  event,
  onEdit,
  onDelete,
  onUpload,
  onView,
}: SessionItemProps) => {
  const [presentationState, setPresentationState] =
    useState<PresentationState>("loading");
  const { token, user } = useAuthStore();

  // Local state for chat/QA/polls open status (tracks server state with optimistic updates)
  const [isChatOpen, setIsChatOpen] = useState(session.chatOpen ?? false);
  const [isQaOpen, setIsQaOpen] = useState(session.qaOpen ?? false);
  const [isPollsOpen, setIsPollsOpen] = useState(session.pollsOpen ?? false);
  const [isReactionsOpen, setIsReactionsOpen] = useState(session.reactionsOpen ?? false);

  // Dialog open states
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [qaDialogOpen, setQaDialogOpen] = useState(false);
  const [pollsDialogOpen, setPollsDialogOpen] = useState(false);
  const [backchannelDialogOpen, setBackchannelDialogOpen] = useState(false);
  const [showVirtualSession, setShowVirtualSession] = useState(false);

  // Live clock for time-based session status (updates every 15s)
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync local state with props when they change (e.g., from refetch)
  useEffect(() => {
    setIsChatOpen(session.chatOpen ?? false);
  }, [session.chatOpen]);

  useEffect(() => {
    setIsQaOpen(session.qaOpen ?? false);
  }, [session.qaOpen]);

  useEffect(() => {
    setIsPollsOpen(session.pollsOpen ?? false);
  }, [session.pollsOpen]);

  useEffect(() => {
    setIsReactionsOpen(session.reactionsOpen ?? false);
  }, [session.reactionsOpen]);

  // Toggle mutations
  const [toggleChat, { loading: togglingChat }] = useMutation(TOGGLE_SESSION_CHAT_MUTATION, {
    onError: (error) => {
      console.error("[SessionItem] Failed to toggle chat:", error);
      setIsChatOpen(session.chatOpen ?? false);
    },
  });

  const [toggleQa, { loading: togglingQa }] = useMutation(TOGGLE_SESSION_QA_MUTATION, {
    onError: (error) => {
      console.error("[SessionItem] Failed to toggle Q&A:", error);
      setIsQaOpen(session.qaOpen ?? false);
    },
  });

  const [togglePolls, { loading: togglingPolls }] = useMutation(TOGGLE_SESSION_POLLS_MUTATION, {
    onError: (error) => {
      console.error("[SessionItem] Failed to toggle Polls:", error);
      setIsPollsOpen(session.pollsOpen ?? false);
    },
  });

  const [toggleReactions, { loading: togglingReactions }] = useMutation(TOGGLE_SESSION_REACTIONS_MUTATION, {
    onError: (error) => {
      console.error("[SessionItem] Failed to toggle Reactions:", error);
      setIsReactionsOpen(session.reactionsOpen ?? false);
    },
  });

  // End Session mutation
  const [endSessionMutation, { loading: endingSession }] = useMutation(END_SESSION_MUTATION, {
    refetchQueries: ["GetSessionsByEvent"],
    onError: (error) => console.error("[SessionItem] Failed to end session:", error),
  });

  const handleToggleChat = async () => {
    const newState = !isChatOpen;
    setIsChatOpen(newState);
    try {
      await toggleChat({
        variables: { id: session.id, open: newState },
      });
      console.log(`[SessionItem] Chat ${newState ? "opened" : "closed"} for session:`, session.id);
    } catch {
      // Error handled by onError callback
    }
  };

  const handleToggleQa = async () => {
    const newState = !isQaOpen;
    setIsQaOpen(newState);
    try {
      await toggleQa({
        variables: { id: session.id, open: newState },
      });
      console.log(`[SessionItem] Q&A ${newState ? "opened" : "closed"} for session:`, session.id);
    } catch {
      // Error handled by onError callback
    }
  };

  const handleTogglePolls = async () => {
    const newState = !isPollsOpen;
    setIsPollsOpen(newState);
    try {
      await togglePolls({
        variables: { id: session.id, open: newState },
      });
      console.log(`[SessionItem] Polls ${newState ? "opened" : "closed"} for session:`, session.id);
    } catch {
      // Error handled by onError callback
    }
  };

  const handleToggleReactions = async () => {
    const newState = !isReactionsOpen;
    setIsReactionsOpen(newState);
    try {
      await toggleReactions({
        variables: { id: session.id, open: newState },
      });
      console.log(`[SessionItem] Reactions ${newState ? "opened" : "closed"} for session:`, session.id);
    } catch {
      // Error handled by onError callback
    }
  };

  const checkPresentationStatus = useCallback(async () => {
    const url = `${process.env.NEXT_PUBLIC_EVENT_SERVICE_URL || process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/organizations/${event.organizationId}/events/${event.id}/sessions/${session.id}/presentation`;
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPresentationState(data.status);
        return data.status;
      }
      if (response.status === 404) {
        setPresentationState("absent");
        return "absent";
      }
      throw new Error(`Server responded with status: ${response.status}`);
    } catch (error) {
      console.error("Failed to check presentation status:", error);
      setPresentationState("failed");
      return "failed";
    }
  }, [event.id, event.organizationId, session.id, token]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        const url = `${process.env.NEXT_PUBLIC_EVENT_SERVICE_URL || process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/organizations/${event.organizationId}/events/${event.id}/sessions/${session.id}/presentation`;
        try {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            setPresentationState("ready");
            if (intervalId) clearInterval(intervalId);
            if (timeoutId) clearTimeout(timeoutId);
          }
        } catch (error) {
          console.error("Polling for presentation status failed:", error);
          setPresentationState("failed");
          if (intervalId) clearInterval(intervalId);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }, 5000);

      timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        setPresentationState((current) =>
          current === "processing" ? "failed" : current
        );
      }, 120000);
    };

    if (presentationState === "loading") {
      checkPresentationStatus();
    } else if (presentationState === "processing") {
      startPolling();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    presentationState,
    checkPresentationStatus,
    event.id,
    event.organizationId,
    session.id,
    token,
  ]);

  const handleUpload = () => {
    onUpload(session);
    setPresentationState("processing");
  };

  // Check if features are enabled (default to true for backwards compatibility)
  const chatEnabled = session.chatEnabled !== false;
  const qaEnabled = session.qaEnabled !== false;
  const pollsEnabled = session.pollsEnabled !== false;
  const reactionsEnabled = session.reactionsEnabled !== false;

  // Time-based session status for Daily sessions
  // "Go Live" only shows when the scheduled start time has arrived and no room exists yet
  const isDailySession = session.streamingProvider === "daily";
  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);
  const timeArrived = currentTime >= startTime;
  const timePassed = currentTime > endTime;
  const hasRoom = !!session.virtualRoomId;

  console.log("[SessionItem] Session status check:", {
    id: session.id,
    title: session.title,
    streamingProvider: session.streamingProvider,
    isDailySession,
    timeArrived,
    timePassed,
    hasRoom,
    showGoLive: isDailySession && timeArrived && !timePassed && !hasRoom,
  });

  // For Daily sessions: use room existence to determine if organizer has "gone live"
  // For non-Daily sessions: fall back to time-based status
  const showGoLive = isDailySession && timeArrived && !timePassed && !hasRoom;
  const showLive = isDailySession
    ? (hasRoom && timeArrived && !timePassed)
    : (timeArrived && !timePassed);
  const showEnded = timePassed;
  const showScheduled = !timeArrived;

  // Build VirtualSession object for the dialog (organizer treated as speaker)
  const currentUserId = user?.id || null;
  const virtualSessionData: VirtualSession = {
    id: session.id,
    title: session.title,
    startTime: session.startTime,
    endTime: session.endTime,
    // For organizers: if time arrived, treat as LIVE (even without room) so DailySessionView can create it
    status: (timeArrived && !timePassed) ? "LIVE" : timePassed ? "ENDED" : "UPCOMING",
    sessionType: session.sessionType ?? undefined,
    streamingUrl: session.streamingUrl,
    recordingUrl: session.recordingUrl,
    broadcastOnly: session.broadcastOnly,
    chatEnabled: session.chatEnabled,
    qaEnabled: session.qaEnabled,
    pollsEnabled: session.pollsEnabled,
    reactionsEnabled: session.reactionsEnabled,
    chatOpen: session.chatOpen,
    qaOpen: session.qaOpen,
    pollsOpen: session.pollsOpen,
    reactionsOpen: session.reactionsOpen,
    streamingProvider: session.streamingProvider,
    virtualRoomId: session.virtualRoomId,
    autoCaptions: session.autoCaptions,
    lobbyEnabled: session.lobbyEnabled,
    isRecordable: session.isRecordable,
    // Ensure the organizer is included as a speaker so they can create the room
    speakers: currentUserId && !session.speakers.some(s => s.userId === currentUserId)
      ? [...session.speakers, { id: "organizer", name: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Organizer", userId: currentUserId }]
      : session.speakers,
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-4 sm:p-5">
          {/* Header: Title + Dropdown */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground leading-tight">
                  {session.title}
                </h3>
                {getSessionTypeBadge(session.sessionType)}
                {(session.streamingUrl || isDailySession) && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    Virtual
                  </Badge>
                )}
              </div>
              {/* Session metadata */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <ClockIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span>
                    {format(new Date(session.startTime), "p")} -{" "}
                    {format(new Date(session.endTime), "p")}
                  </span>
                </div>
                {session.speakers.length > 0 && (
                  <div className="flex items-center">
                    <MicrophoneIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">
                      {session.speakers.map((s) => s.name).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit/Delete Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Session
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Actions Row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Presentation Status */}
            <PresentationStatus
              status={presentationState}
              onUpload={handleUpload}
              onView={() => onView(session)}
            />

            {/* Session Status Controls */}
            {showScheduled && isDailySession && (
              <Badge variant="secondary" className="text-muted-foreground gap-1">
                <ClockIcon className="h-3 w-3" />
                Scheduled
              </Badge>
            )}
            {showGoLive && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                onClick={() => setShowVirtualSession(true)}
              >
                <Play className="h-3.5 w-3.5" />
                Go Live
              </Button>
            )}
            {showLive && (
              <>
                <Badge className="bg-red-500 text-white animate-pulse gap-1">
                  <span className="h-2 w-2 rounded-full bg-white inline-block" />
                  LIVE
                </Badge>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                  onClick={() => {
                    console.log("[SessionItem] Join Session clicked", {
                      isDailySession,
                      virtualRoomId: session.virtualRoomId,
                      streamingProvider: session.streamingProvider,
                      showVirtualSession,
                    });
                    setShowVirtualSession(true);
                  }}
                >
                  <Video className="h-3.5 w-3.5" />
                  Join Session
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5"
                  onClick={() => endSessionMutation({ variables: { id: session.id } })}
                  disabled={endingSession}
                >
                  <Square className="h-3.5 w-3.5" />
                  {endingSession ? "Ending..." : "End Session"}
                </Button>
              </>
            )}
            {showEnded && (
              <Badge variant="secondary" className="text-muted-foreground">
                Ended
              </Badge>
            )}

            {/* Interactive Features Toolbar */}
            {(chatEnabled || qaEnabled || pollsEnabled || reactionsEnabled) && (
              <TooltipProvider delayDuration={0}>
                <div className="flex items-center rounded-lg border bg-muted/30 p-1 gap-1">
                  {/* Chat Button */}
                  {chatEnabled && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isChatOpen ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "h-8 px-2 sm:px-3 gap-1.5 transition-colors",
                              isChatOpen && "bg-green-600 hover:bg-green-700 text-white"
                            )}
                            onClick={() => setChatDialogOpen(true)}
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">Chat</span>
                            {isChatOpen && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-pulse" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="sm:hidden">
                          <p>Chat {isChatOpen ? "(Open)" : "(Closed)"}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
                        <DialogContent className="!max-w-[95vw] !w-[95vw] md:!max-w-[85vw] md:!w-[85vw] lg:!max-w-[75vw] lg:!w-[75vw] !h-[85vh] p-0 gap-0 flex flex-col">
                          {/* Header */}
                          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b">
                            <div className="flex items-center gap-3">
                              <MessageSquare className="h-5 w-5 text-primary" />
                              <span className="font-medium truncate">{session.title} - Chat</span>
                              <Badge variant={isChatOpen ? "default" : "secondary"} className={cn(isChatOpen && "bg-green-600")}>
                                {isChatOpen ? "Open" : "Closed"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Allow Chat</span>
                                <Switch
                                  checked={isChatOpen}
                                  onCheckedChange={handleToggleChat}
                                  disabled={togglingChat}
                                  aria-label="Toggle chat"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setChatDialogOpen(false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {/* Chat Content */}
                          <div className="flex-1 min-h-0 overflow-hidden">
                            <SessionChat
                              sessionId={session.id}
                              eventId={event.id}
                              sessionName={session.title}
                              className="h-full border-0 shadow-none rounded-none"
                              initialChatOpen={isChatOpen}
                              isOrganizer={true}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {/* Q&A Button */}
                  {qaEnabled && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isQaOpen ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "h-8 px-2 sm:px-3 gap-1.5 transition-colors",
                              isQaOpen && "bg-green-600 hover:bg-green-700 text-white"
                            )}
                            onClick={() => setQaDialogOpen(true)}
                          >
                            <HelpCircle className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">Q&A</span>
                            {isQaOpen && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-pulse" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="sm:hidden">
                          <p>Q&A {isQaOpen ? "(Open)" : "(Closed)"}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Dialog open={qaDialogOpen} onOpenChange={setQaDialogOpen}>
                        <DialogContent className="!max-w-[95vw] !w-[95vw] md:!max-w-[85vw] md:!w-[85vw] lg:!max-w-[75vw] lg:!w-[75vw] !h-[85vh] p-0 gap-0 flex flex-col">
                          {/* Header */}
                          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b">
                            <div className="flex items-center gap-3">
                              <HelpCircle className="h-5 w-5 text-primary" />
                              <span className="font-medium truncate">{session.title} - Q&A</span>
                              <Badge variant={isQaOpen ? "default" : "secondary"} className={cn(isQaOpen && "bg-green-600")}>
                                {isQaOpen ? "Open" : "Closed"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Allow Q&A</span>
                                <Switch
                                  checked={isQaOpen}
                                  onCheckedChange={handleToggleQa}
                                  disabled={togglingQa}
                                  aria-label="Toggle Q&A"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQaDialogOpen(false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {/* Q&A Content */}
                          <div className="flex-1 min-h-0 overflow-auto">
                            <SessionQA
                              sessionId={session.id}
                              eventId={event.id}
                              sessionName={session.title}
                              isOrganizer={true}
                              isSpeaker={false}
                              className="h-full border-0 shadow-none rounded-none"
                              initialQaOpen={isQaOpen}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {/* Polls Button */}
                  {pollsEnabled && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isPollsOpen ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "h-8 px-2 sm:px-3 gap-1.5 transition-colors",
                              isPollsOpen && "bg-green-600 hover:bg-green-700 text-white"
                            )}
                            onClick={() => setPollsDialogOpen(true)}
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">Polls</span>
                            {isPollsOpen && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-pulse" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="sm:hidden">
                          <p>Polls {isPollsOpen ? "(Open)" : "(Closed)"}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Dialog open={pollsDialogOpen} onOpenChange={setPollsDialogOpen}>
                        <DialogContent className="!max-w-[95vw] !w-[95vw] md:!max-w-[85vw] md:!w-[85vw] lg:!max-w-[75vw] lg:!w-[75vw] !h-[85vh] p-0 gap-0 flex flex-col">
                          {/* Header */}
                          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b">
                            <div className="flex items-center gap-3">
                              <BarChart3 className="h-5 w-5 text-primary" />
                              <span className="font-medium truncate">{session.title} - Polls</span>
                              <Badge variant={isPollsOpen ? "default" : "secondary"} className={cn(isPollsOpen && "bg-green-600")}>
                                {isPollsOpen ? "Open" : "Closed"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Allow Polls</span>
                                <Switch
                                  checked={isPollsOpen}
                                  onCheckedChange={handleTogglePolls}
                                  disabled={togglingPolls}
                                  aria-label="Toggle Polls"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setPollsDialogOpen(false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {/* Polls Content */}
                          <div className="flex-1 min-h-0 overflow-auto">
                            <SessionPolls
                              sessionId={session.id}
                              eventId={event.id}
                              isOrganizer={true}
                              isSpeaker={false}
                              className="h-full border-0 shadow-none rounded-none"
                              initialPollsOpen={isPollsOpen}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {/* Reactions Toggle Button */}
                  {reactionsEnabled && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isReactionsOpen ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-8 px-2 sm:px-3 gap-1.5 transition-colors",
                            isReactionsOpen && "bg-green-600 hover:bg-green-700 text-white"
                          )}
                          onClick={handleToggleReactions}
                          disabled={togglingReactions}
                        >
                          <Smile className="h-4 w-4" />
                          <span className="hidden sm:inline text-xs">Reactions</span>
                          {isReactionsOpen && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-pulse" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{isReactionsOpen ? "Close Reactions" : "Open Reactions"}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Backchannel Button - Staff Communication */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 sm:px-3 gap-1.5 transition-colors text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => setBackchannelDialogOpen(true)}
                      >
                        <Radio className="h-4 w-4" />
                        <span className="hidden sm:inline text-xs">Staff</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="sm:hidden">
                      <p>Staff Backchannel</p>
                    </TooltipContent>
                  </Tooltip>
                  <Dialog open={backchannelDialogOpen} onOpenChange={setBackchannelDialogOpen}>
                    <DialogContent className="!max-w-[95vw] !w-[95vw] md:!max-w-[85vw] md:!w-[85vw] lg:!max-w-[75vw] lg:!w-[75vw] !h-[85vh] p-0 gap-0 flex flex-col">
                      {/* Header */}
                      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b">
                        <div className="flex items-center gap-3">
                          <Radio className="h-5 w-5 text-amber-500" />
                          <span className="font-medium truncate">{session.title} - Staff Backchannel</span>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            Staff Only
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setBackchannelDialogOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Backchannel Content */}
                      <div className="flex-1 min-h-0 overflow-hidden">
                        <BackchannelPanel
                          sessionId={session.id}
                          eventId={event.id}
                          className="h-full border-0 shadow-none rounded-none"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>

      {/* Virtual Session Dialog - opens inline for organizers (no registration needed) */}
      {isDailySession && (
        <VirtualSessionView
          session={virtualSessionData}
          eventId={event.id}
          isOpen={showVirtualSession}
          onClose={() => setShowVirtualSession(false)}
          currentUserId={currentUserId}
        />
      )}
    </Card>
  );
};
