// src/components/features/virtual-session/VirtualSessionView.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@apollo/client";
import { StreamPlayer } from "@/components/features/video/StreamPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Video,
  Clock,
  Mic2,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Presentation,
  X,
  AlertTriangle,
  PlayCircle,
  Lock,
  Unlock,
  Calendar,
  Users,
  Eye,
} from "lucide-react";
import { SessionChat } from "@/app/(platform)/dashboard/events/[eventId]/_components/session-chat";
import { SessionQA } from "@/app/(platform)/dashboard/events/[eventId]/_components/session-qa";
import { SessionPolls } from "@/app/(platform)/dashboard/events/[eventId]/_components/session-polls";
import { IncidentReportForm } from "@/components/features/incidents";
import { ReactionBar } from "@/components/features/reaction-bar";
import { FloatingReactions } from "@/components/features/floating-reactions";
import { useSessionReactions } from "@/hooks/use-session-reactions";
import { DailySessionView } from "./DailySessionView";
import { LobbyView } from "./LobbyView";
import {
  JOIN_VIRTUAL_SESSION_MUTATION,
  LEAVE_VIRTUAL_SESSION_MUTATION,
  GET_VIRTUAL_ATTENDANCE_STATS_QUERY,
} from "@/graphql/attendee.graphql";

export interface VirtualSession {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "LIVE" | "ENDED";
  sessionType?: "MAINSTAGE" | "BREAKOUT" | "WORKSHOP" | "NETWORKING" | "EXPO";
  streamingUrl?: string | null;
  recordingUrl?: string | null;
  broadcastOnly?: boolean;
  chatEnabled?: boolean;
  qaEnabled?: boolean;
  pollsEnabled?: boolean;
  reactionsEnabled?: boolean;
  chatOpen?: boolean;
  qaOpen?: boolean;
  pollsOpen?: boolean;
  reactionsOpen?: boolean;
  speakers: { id: string; name: string; userId?: string | null }[];
  streamingProvider?: string | null;
  virtualRoomId?: string | null;
  autoCaptions?: boolean;
  lobbyEnabled?: boolean;
  isRecordable?: boolean;
}

interface VirtualSessionViewProps {
  session: VirtualSession;
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string | null;
  lobbyVideoUrl?: string | null;
}

type ActivePanel = "chat" | "qa" | "polls" | null;

const getStatusBadge = (status: string) => {
  switch (status) {
    case "LIVE":
      return (
        <Badge className="bg-red-500 text-white animate-pulse">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-white" />
          LIVE
        </Badge>
      );
    case "UPCOMING":
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
          <Calendar className="h-3 w-3 mr-1" />
          Upcoming
        </Badge>
      );
    case "ENDED":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <PlayCircle className="h-3 w-3 mr-1" />
          Recording Available
        </Badge>
      );
    default:
      return null;
  }
};

const getSessionTypeBadge = (sessionType?: string) => {
  if (!sessionType) return null;

  const types: Record<string, { label: string; className: string }> = {
    MAINSTAGE: { label: "Mainstage", className: "bg-purple-500/10 text-purple-600" },
    BREAKOUT: { label: "Breakout", className: "bg-green-500/10 text-green-600" },
    WORKSHOP: { label: "Workshop", className: "bg-orange-500/10 text-orange-600" },
    NETWORKING: { label: "Networking", className: "bg-cyan-500/10 text-cyan-600" },
    EXPO: { label: "Expo", className: "bg-pink-500/10 text-pink-600" },
  };

  const type = types[sessionType];
  if (!type) return null;

  return (
    <Badge variant="outline" className={type.className}>
      {type.label}
    </Badge>
  );
};

/**
 * Session Not Started Component
 */
function SessionNotStarted({ session }: { session: VirtualSession }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center text-white p-8 max-w-md">
        <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
          <Clock className="h-12 w-12 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Session Hasn't Started Yet</h2>
        <p className="text-gray-400 mb-6">
          This session is scheduled to begin at{" "}
          <span className="text-white font-medium">
            {format(new Date(session.startTime), "h:mm a")}
          </span>{" "}
          on{" "}
          <span className="text-white font-medium">
            {format(new Date(session.startTime), "MMMM d, yyyy")}
          </span>
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Come back when the session starts to watch live</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Session Ended Component with Recording Option
 */
function SessionEnded({ session }: { session: VirtualSession }) {
  const hasRecording = !!session.recordingUrl;

  if (hasRecording) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <StreamPlayer
          url={session.recordingUrl!}
          sessionId={session.id}
          autoPlay={false}
          fillHeight={true}
          className="flex-1"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center text-white p-8 max-w-md">
        <div className="w-24 h-24 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-6">
          <PlayCircle className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Session Has Ended</h2>
        <p className="text-gray-400 mb-6">
          This session ended at{" "}
          <span className="text-white font-medium">
            {format(new Date(session.endTime), "h:mm a")}
          </span>
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Video className="h-4 w-4" />
          <span>Recording not yet available</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Features Panel
 */
function InteractivePanelDialog({
  type,
  session,
  eventId,
  isOpen,
  onClose,
  liveStatus,
  onStatusChange,
}: {
  type: "chat" | "qa" | "polls";
  session: VirtualSession;
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  liveStatus: boolean;
  onStatusChange: (open: boolean) => void;
}) {
  const config = {
    chat: {
      icon: MessageSquare,
      title: "Chat",
      color: "text-blue-500",
    },
    qa: {
      icon: HelpCircle,
      title: "Q&A",
      color: "text-green-500",
    },
    polls: {
      icon: BarChart3,
      title: "Polls",
      color: "text-purple-500",
    },
  };

  const { icon: Icon, title, color } = config[type];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-[500px] sm:!w-[500px] h-[80vh] sm:h-[70vh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-background/95">
          <div className="flex items-center gap-3">
            <Icon className={cn("h-5 w-5", color)} />
            <span className="font-medium">{session.title} - {title}</span>
            <Badge variant={liveStatus ? "default" : "secondary"} className={liveStatus ? "bg-green-500/10 text-green-600" : ""}>
              {liveStatus ? "Open" : "Closed"}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {type === "chat" && (
            <SessionChat
              sessionId={session.id}
              eventId={eventId}
              sessionName={session.title}
              className="h-full border-0 shadow-none rounded-none"
              initialChatOpen={liveStatus}
              onStatusChange={onStatusChange}
            />
          )}
          {type === "qa" && (
            <SessionQA
              sessionId={session.id}
              eventId={eventId}
              sessionName={session.title}
              isOrganizer={false}
              isSpeaker={false}
              className="h-full border-0 shadow-none rounded-none"
              initialQaOpen={liveStatus}
              onStatusChange={onStatusChange}
            />
          )}
          {type === "polls" && (
            <SessionPolls
              sessionId={session.id}
              eventId={eventId}
              isOrganizer={false}
              isSpeaker={false}
              className="h-full border-0 shadow-none rounded-none"
              initialPollsOpen={liveStatus}
              onStatusChange={onStatusChange}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * VirtualSessionView - Full-screen virtual session viewing experience
 */
export function VirtualSessionView({
  session,
  eventId,
  isOpen,
  onClose,
  currentUserId,
  lobbyVideoUrl,
}: VirtualSessionViewProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [lobbyDismissed, setLobbyDismissed] = useState(false);
  const [liveChatOpen, setLiveChatOpen] = useState(session.chatOpen ?? false);
  const [liveQaOpen, setLiveQaOpen] = useState(session.qaOpen ?? false);
  const [livePollsOpen, setLivePollsOpen] = useState(session.pollsOpen ?? false);
  const [liveReactionsOpen, setLiveReactionsOpen] = useState(session.reactionsOpen ?? false);

  // Live emoji reactions
  const {
    sendReaction,
    getPopularEmojis,
    floatingEmojis,
    isConnected: reactionsConnected,
  } = useSessionReactions(session.id, eventId);

  // Track if we've already recorded joining this session
  const hasJoinedRef = useRef(false);
  const sessionIdRef = useRef(session.id);

  // Virtual attendance mutations
  const [joinSession] = useMutation(JOIN_VIRTUAL_SESSION_MUTATION, {
    onError: (err) => console.warn("Failed to record session join:", err),
  });
  const [leaveSession] = useMutation(LEAVE_VIRTUAL_SESSION_MUTATION, {
    onError: (err) => console.warn("Failed to record session leave:", err),
  });

  // Live viewer count query - polls every 15 seconds when dialog is open
  const { data: statsData } = useQuery(GET_VIRTUAL_ATTENDANCE_STATS_QUERY, {
    variables: { sessionId: session.id },
    skip: !isOpen,
    pollInterval: isOpen ? 15000 : 0, // Poll every 15 seconds while watching
    fetchPolicy: "network-only",
  });
  const currentViewers = statsData?.virtualAttendanceStats?.currentViewers ?? 0;

  // Get device type for analytics
  const getDeviceType = useCallback(() => {
    if (typeof window === "undefined") return "unknown";
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
      return /tablet|ipad/.test(ua) ? "tablet" : "mobile";
    }
    return "desktop";
  }, []);

  const isDailySession = session.streamingProvider === "daily";
  const isSpeaker = isDailySession && currentUserId
    ? session.speakers.some((s) => s.userId === currentUserId)
    : false;

  // Record joining when dialog opens with a stream/recording available (or Daily session)
  useEffect(() => {
    const shouldTrack = isOpen && (session.streamingUrl || session.recordingUrl || isDailySession);

    if (shouldTrack && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      sessionIdRef.current = session.id;

      joinSession({
        variables: {
          sessionId: session.id,
          deviceType: getDeviceType(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
      });
    }

    // Reset tracking when dialog closes
    if (!isOpen && hasJoinedRef.current) {
      leaveSession({
        variables: { sessionId: sessionIdRef.current },
      });
      hasJoinedRef.current = false;
    }
  }, [isOpen, session.id, session.streamingUrl, session.recordingUrl, isDailySession, joinSession, leaveSession, getDeviceType]);

  // Cleanup on unmount - record leaving
  useEffect(() => {
    return () => {
      if (hasJoinedRef.current) {
        // Use sendBeacon for reliable cleanup on page unload
        const sessionId = sessionIdRef.current;
        leaveSession({ variables: { sessionId } });
      }
    };
  }, [leaveSession]);

  // Handle visibility change (user switches tabs/minimizes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasJoinedRef.current) {
        // User switched away - record temporary leave
        leaveSession({ variables: { sessionId: sessionIdRef.current } });
        hasJoinedRef.current = false;
      } else if (!document.hidden && isOpen && (session.streamingUrl || session.recordingUrl || isDailySession)) {
        // User came back - record re-join
        if (!hasJoinedRef.current) {
          hasJoinedRef.current = true;
          joinSession({
            variables: {
              sessionId: session.id,
              deviceType: getDeviceType(),
              userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
            },
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOpen, session.id, session.streamingUrl, session.recordingUrl, isDailySession, joinSession, leaveSession, getDeviceType]);

  // Sync with session props
  useEffect(() => {
    setLiveChatOpen(session.chatOpen ?? false);
    setLiveQaOpen(session.qaOpen ?? false);
    setLivePollsOpen(session.pollsOpen ?? false);
    setLiveReactionsOpen(session.reactionsOpen ?? false);
  }, [session.chatOpen, session.qaOpen, session.pollsOpen, session.reactionsOpen]);

  const chatEnabled = session.chatEnabled !== false;
  const qaEnabled = session.qaEnabled !== false;
  const pollsEnabled = session.pollsEnabled !== false;
  const reactionsEnabled = session.reactionsEnabled !== false;

  // Determine what to show based on session status
  const isLive = session.status === "LIVE";
  const isUpcoming = session.status === "UPCOMING";
  const isEnded = session.status === "ENDED";
  const hasStream = !!session.streamingUrl;
  const hasRecording = !!session.recordingUrl;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-[100vw] !w-[100vw] !h-[100vh] !max-h-[100vh] p-0 gap-0 flex flex-col rounded-none border-0 bg-black">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-black/90 border-b border-white/10 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Video className="h-5 w-5 text-white/70 flex-shrink-0" />
            <h2 className="font-semibold text-white text-sm sm:text-base truncate">{session.title}</h2>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(session.status)}
              <span className="hidden sm:inline-flex">{getSessionTypeBadge(session.sessionType)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Live Viewer Count */}
            {currentViewers > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm">
                <Eye className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                <span className="hidden sm:inline">{currentViewers} watching</span>
                <span className="sm:hidden">{currentViewers}</span>
              </div>
            )}

            {/* Session Time */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-white/60 mr-2">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(session.startTime), "h:mm a")} -{" "}
                {format(new Date(session.endTime), "h:mm a")}
              </span>
            </div>

            {/* Speakers */}
            {session.speakers.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 text-sm text-white/60 mr-2">
                <Mic2 className="h-4 w-4" />
                <span className="truncate max-w-[200px]">
                  {session.speakers.map((s) => s.name).join(", ")}
                </span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 text-white/70 hover:text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="h-4 sm:h-5 w-4 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Video Area */}
          {isUpcoming && session.lobbyEnabled && !lobbyDismissed && (
            <LobbyView
              session={session}
              lobbyVideoUrl={lobbyVideoUrl}
              onDismiss={() => setLobbyDismissed(true)}
            />
          )}
          {isUpcoming && (!session.lobbyEnabled || lobbyDismissed) && (
            <SessionNotStarted session={session} />
          )}

          {isLive && isDailySession && (
            <DailySessionView
              session={session}
              eventId={eventId}
              isSpeaker={isSpeaker}
              onLeave={onClose}
            />
          )}

          {isLive && !isDailySession && hasStream && (
            <div className="flex-1 flex flex-col min-h-0">
              <StreamPlayer
                url={session.streamingUrl!}
                sessionId={session.id}
                autoPlay={true}
                muted={false}
                fillHeight={true}
                className="flex-1"
              />
            </div>
          )}

          {isLive && !isDailySession && !hasStream && (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="text-center text-white p-8 max-w-md">
                <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="h-12 w-12 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Stream Not Available</h2>
                <p className="text-gray-400">
                  The live stream hasn't been configured for this session.
                  You can still participate using Chat, Q&A, and Polls below.
                </p>
              </div>
            </div>
          )}

          {isEnded && <SessionEnded session={session} />}

          {/* Floating emoji reactions overlay */}
          {isLive && reactionsEnabled && liveReactionsOpen && <FloatingReactions emojis={floatingEmojis} />}
        </div>

        {/* Interactive Features Bar */}
        <div className="flex-shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-black/90 border-t border-white/10">
          {/* Chat Button */}
          {chatEnabled && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5 bg-transparent border-white/20 text-white hover:bg-white/10",
                liveChatOpen && "border-green-500/50",
                !liveChatOpen && "opacity-60"
              )}
              onClick={() => setActivePanel("chat")}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
              {liveChatOpen && (
                <Badge className="hidden sm:inline-flex ml-1 bg-green-600 text-white text-[10px] px-1.5 py-0 h-4">
                  Open
                </Badge>
              )}
            </Button>
          )}

          {/* Q&A Button */}
          {qaEnabled && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5 bg-transparent border-white/20 text-white hover:bg-white/10",
                liveQaOpen && "border-green-500/50",
                !liveQaOpen && "opacity-60"
              )}
              onClick={() => setActivePanel("qa")}
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Q&A</span>
              {liveQaOpen && (
                <Badge className="hidden sm:inline-flex ml-1 bg-green-600 text-white text-[10px] px-1.5 py-0 h-4">
                  Open
                </Badge>
              )}
            </Button>
          )}

          {/* Polls Button */}
          {pollsEnabled && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5 bg-transparent border-white/20 text-white hover:bg-white/10",
                livePollsOpen && "border-green-500/50",
                !livePollsOpen && "opacity-60"
              )}
              onClick={() => setActivePanel("polls")}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Polls</span>
              {livePollsOpen && (
                <Badge className="hidden sm:inline-flex ml-1 bg-green-600 text-white text-[10px] px-1.5 py-0 h-4">
                  Open
                </Badge>
              )}
            </Button>
          )}

          {/* Live Reactions */}
          {isLive && reactionsEnabled && liveReactionsOpen && (
            <ReactionBar
              onReaction={sendReaction}
              popularEmojis={getPopularEmojis()}
              disabled={!reactionsConnected}
              variant="compact"
            />
          )}

          {/* Report Issue */}
          <IncidentReportForm
            sessionId={session.id}
            eventId={eventId}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 bg-transparent border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Report Issue</span>
              </Button>
            }
          />
        </div>

        {/* Interactive Panels */}
        {activePanel === "chat" && (
          <InteractivePanelDialog
            type="chat"
            session={session}
            eventId={eventId}
            isOpen={true}
            onClose={() => setActivePanel(null)}
            liveStatus={liveChatOpen}
            onStatusChange={setLiveChatOpen}
          />
        )}
        {activePanel === "qa" && (
          <InteractivePanelDialog
            type="qa"
            session={session}
            eventId={eventId}
            isOpen={true}
            onClose={() => setActivePanel(null)}
            liveStatus={liveQaOpen}
            onStatusChange={setLiveQaOpen}
          />
        )}
        {activePanel === "polls" && (
          <InteractivePanelDialog
            type="polls"
            session={session}
            eventId={eventId}
            isOpen={true}
            onClose={() => setActivePanel(null)}
            liveStatus={livePollsOpen}
            onStatusChange={setLivePollsOpen}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default VirtualSessionView;
