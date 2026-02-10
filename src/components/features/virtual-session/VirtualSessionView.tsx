// src/components/features/virtual-session/VirtualSessionView.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@apollo/client";
import { StreamPlayer } from "@/components/features/video/StreamPlayer";
import { Badge } from "@/components/ui/badge";
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
  X,
  AlertTriangle,
  PlayCircle,
  Calendar,
  Eye,
  Smile,
  PanelRightClose,
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

/* ─── Status / Type Badges ─────────────────────────────────────────── */

const getStatusBadge = (status: string) => {
  switch (status) {
    case "LIVE":
      return (
        <Badge className="bg-red-500/90 text-white border-0 gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
          Live
        </Badge>
      );
    case "UPCOMING":
      return (
        <Badge variant="secondary" className="bg-blue-500/15 text-blue-400 border-0 gap-1 px-2.5 py-0.5 text-[11px]">
          <Calendar className="h-3 w-3" />
          Upcoming
        </Badge>
      );
    case "ENDED":
      return (
        <Badge variant="outline" className="text-white/50 border-white/15 gap-1 px-2.5 py-0.5 text-[11px]">
          <PlayCircle className="h-3 w-3" />
          Ended
        </Badge>
      );
    default:
      return null;
  }
};

const getSessionTypeBadge = (sessionType?: string) => {
  if (!sessionType) return null;
  const types: Record<string, { label: string; className: string }> = {
    MAINSTAGE: { label: "Mainstage", className: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
    BREAKOUT: { label: "Breakout", className: "bg-green-500/15 text-green-400 border-green-500/20" },
    WORKSHOP: { label: "Workshop", className: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
    NETWORKING: { label: "Networking", className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20" },
    EXPO: { label: "Expo", className: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  };
  const type = types[sessionType];
  if (!type) return null;
  return (
    <Badge variant="outline" className={cn("text-[11px] px-2 py-0.5", type.className)}>
      {type.label}
    </Badge>
  );
};

/* ─── Session Not Started ──────────────────────────────────────────── */

function SessionNotStarted({ session }: { session: VirtualSession }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 text-center text-white px-6 py-10 max-w-md">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">Session Hasn&apos;t Started Yet</h2>
        <p className="text-white/50 mb-8 text-sm sm:text-base leading-relaxed">
          Scheduled for{" "}
          <span className="text-white/80 font-medium">
            {format(new Date(session.startTime), "h:mm a")}
          </span>{" "}
          on{" "}
          <span className="text-white/80 font-medium">
            {format(new Date(session.startTime), "MMMM d, yyyy")}
          </span>
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-white/30 bg-white/5 rounded-full px-4 py-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>Come back when the session goes live</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Session Ended ────────────────────────────────────────────────── */

function SessionEnded({ session }: { session: VirtualSession }) {
  if (session.recordingUrl) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <StreamPlayer
          url={session.recordingUrl}
          sessionId={session.id}
          autoPlay={false}
          fillHeight={true}
          className="flex-1"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-gray-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 text-center text-white px-6 py-10 max-w-md">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <PlayCircle className="h-10 w-10 sm:h-12 sm:w-12 text-white/40" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">Session Has Ended</h2>
        <p className="text-white/50 mb-4 text-sm sm:text-base">
          Ended at{" "}
          <span className="text-white/80 font-medium">
            {format(new Date(session.endTime), "h:mm a")}
          </span>
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-white/30 bg-white/5 rounded-full px-4 py-2">
          <Video className="h-3.5 w-3.5" />
          <span>Recording not yet available</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Side Panel (Desktop Inline / Mobile Dialog) ─────────────────── */

function SidePanel({
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
    chat: { icon: MessageSquare, title: "Chat", color: "text-blue-400", accent: "bg-blue-500" },
    qa: { icon: HelpCircle, title: "Q&A", color: "text-emerald-400", accent: "bg-emerald-500" },
    polls: { icon: BarChart3, title: "Polls", color: "text-violet-400", accent: "bg-violet-500" },
  };

  const { icon: Icon, title, color, accent } = config[type];

  if (!isOpen) return null;

  // Desktop: inline side panel
  // Mobile: bottom dialog
  return (
    <>
      {/* Desktop inline panel */}
      <div className="hidden md:flex flex-col w-[360px] lg:w-[400px] flex-shrink-0 border-l border-white/[0.06] bg-gray-950/80 backdrop-blur-sm">
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", accent)} />
            <Icon className={cn("h-4 w-4", color)} />
            <span className="font-medium text-sm text-white">{title}</span>
            {liveStatus && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400">
                Open
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>
        {/* Panel content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {type === "chat" && (
            <SessionChat
              sessionId={session.id}
              eventId={eventId}
              sessionName={session.title}
              className="h-full border-0 shadow-none rounded-none bg-transparent"
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
              className="h-full border-0 shadow-none rounded-none bg-transparent"
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
              className="h-full border-0 shadow-none rounded-none bg-transparent"
              initialPollsOpen={liveStatus}
              onStatusChange={onStatusChange}
            />
          )}
        </div>
      </div>

      {/* Mobile bottom-sheet dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="md:hidden !max-w-[100vw] !w-[100vw] !h-[85vh] !max-h-[85vh] p-0 gap-0 flex flex-col !rounded-t-2xl !rounded-b-none border-0 border-t border-white/10 bg-gray-950 !bottom-0 !top-auto !translate-y-0 fixed">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Icon className={cn("h-4 w-4", color)} />
              <span className="font-medium text-sm text-white">{title}</span>
              {liveStatus && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400">
                  Open
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {type === "chat" && (
              <SessionChat
                sessionId={session.id}
                eventId={eventId}
                sessionName={session.title}
                className="h-full border-0 shadow-none rounded-none bg-transparent"
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
                className="h-full border-0 shadow-none rounded-none bg-transparent"
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
                className="h-full border-0 shadow-none rounded-none bg-transparent"
                initialPollsOpen={liveStatus}
                onStatusChange={onStatusChange}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Interaction Toolbar Button ───────────────────────────────────── */

function ToolbarButton({
  icon: Icon,
  label,
  isActive,
  isOpen,
  isDanger,
  onClick,
  disabled,
  className,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  isOpen?: boolean;
  isDanger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 text-sm",
        "outline-none select-none",
        isDanger
          ? "text-orange-400 hover:bg-orange-500/10 active:bg-orange-500/15"
          : isActive
          ? "bg-white/10 text-white ring-1 ring-white/15"
          : isOpen
          ? "bg-white/[0.07] text-white/70 hover:text-white hover:bg-white/10"
          : "text-white/40 hover:text-white/60 hover:bg-white/[0.05]",
        disabled && "opacity-40 pointer-events-none",
        className
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="hidden sm:inline text-[13px] font-medium">{label}</span>
      {isOpen && !isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
      )}
      {children}
    </button>
  );
}

/* ─── Main VirtualSessionView ─────────────────────────────────────── */

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

  // Live viewer count
  const { data: statsData } = useQuery(GET_VIRTUAL_ATTENDANCE_STATS_QUERY, {
    variables: { sessionId: session.id },
    skip: !isOpen,
    pollInterval: isOpen ? 15000 : 0,
    fetchPolicy: "network-only",
  });
  const currentViewers = statsData?.virtualAttendanceStats?.currentViewers ?? 0;

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

  // Record joining when dialog opens
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
    if (!isOpen && hasJoinedRef.current) {
      leaveSession({ variables: { sessionId: sessionIdRef.current } });
      hasJoinedRef.current = false;
    }
  }, [isOpen, session.id, session.streamingUrl, session.recordingUrl, isDailySession, joinSession, leaveSession, getDeviceType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hasJoinedRef.current) {
        const sessionId = sessionIdRef.current;
        leaveSession({ variables: { sessionId } });
      }
    };
  }, [leaveSession]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasJoinedRef.current) {
        leaveSession({ variables: { sessionId: sessionIdRef.current } });
        hasJoinedRef.current = false;
      } else if (!document.hidden && isOpen && (session.streamingUrl || session.recordingUrl || isDailySession)) {
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

  const isLive = session.status === "LIVE";
  const isUpcoming = session.status === "UPCOMING";
  const isEnded = session.status === "ENDED";
  const hasStream = !!session.streamingUrl;

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-[100vw] !w-[100vw] !h-[100dvh] !max-h-[100dvh] p-0 gap-0 flex flex-col rounded-none border-0 bg-gray-950 overflow-hidden">
        {/* ─── Header ──────────────────────────────────────────── */}
        <header className="flex-shrink-0 flex items-center justify-between px-3 sm:px-5 h-12 sm:h-14 bg-gray-950/95 backdrop-blur-xl border-b border-white/[0.06] z-20">
          {/* Left: Title & badges */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.06]">
              <Video className="h-4 w-4 text-white/50" />
            </div>
            <h2 className="font-semibold text-white text-sm sm:text-[15px] truncate max-w-[140px] sm:max-w-[280px] md:max-w-[400px]">
              {session.title}
            </h2>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {getStatusBadge(session.status)}
              <span className="hidden lg:inline-flex">{getSessionTypeBadge(session.sessionType)}</span>
            </div>
          </div>

          {/* Right: Meta info & close */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Viewer count */}
            {currentViewers > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] text-white/70 text-xs font-medium">
                <Eye className="h-3 w-3 text-white/50" />
                <span>{currentViewers}</span>
                <span className="hidden sm:inline text-white/40">watching</span>
              </div>
            )}

            {/* Session time */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-white/40 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
              </span>
            </div>

            {/* Speakers */}
            {session.speakers.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-white/40 font-medium">
                <Mic2 className="h-3.5 w-3.5" />
                <span className="truncate max-w-[180px]">
                  {session.speakers.map((s) => s.name).join(", ")}
                </span>
              </div>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
          </div>
        </header>

        {/* ─── Body: Video + Side Panel ────────────────────────── */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
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
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-yellow-500/[0.03] blur-[100px]" />
                </div>
                <div className="relative z-10 text-center text-white px-6 py-10 max-w-md">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                    <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400/80" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">Stream Not Available</h2>
                  <p className="text-white/50 text-sm sm:text-base leading-relaxed">
                    The live stream hasn&apos;t been configured yet. You can still participate using Chat, Q&A, and Polls below.
                  </p>
                </div>
              </div>
            )}

            {isEnded && <SessionEnded session={session} />}

            {/* Floating reactions overlay */}
            {isLive && reactionsEnabled && liveReactionsOpen && (
              <FloatingReactions emojis={floatingEmojis} />
            )}
          </div>

          {/* Desktop side panel */}
          <SidePanel
            type={activePanel || "chat"}
            session={session}
            eventId={eventId}
            isOpen={activePanel !== null}
            onClose={() => setActivePanel(null)}
            liveStatus={
              activePanel === "chat" ? liveChatOpen :
              activePanel === "qa" ? liveQaOpen :
              livePollsOpen
            }
            onStatusChange={
              activePanel === "chat" ? setLiveChatOpen :
              activePanel === "qa" ? setLiveQaOpen :
              setLivePollsOpen
            }
          />
        </div>

        {/* ─── Bottom Toolbar ──────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-white/[0.06] bg-gray-950/95 backdrop-blur-xl z-20">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2 sm:py-2.5 overflow-x-auto">
            {/* Chat */}
            {chatEnabled && (
              <ToolbarButton
                icon={MessageSquare}
                label="Chat"
                isActive={activePanel === "chat"}
                isOpen={liveChatOpen}
                onClick={() => togglePanel("chat")}
              />
            )}

            {/* Q&A */}
            {qaEnabled && (
              <ToolbarButton
                icon={HelpCircle}
                label="Q&A"
                isActive={activePanel === "qa"}
                isOpen={liveQaOpen}
                onClick={() => togglePanel("qa")}
              />
            )}

            {/* Polls */}
            {pollsEnabled && (
              <ToolbarButton
                icon={BarChart3}
                label="Polls"
                isActive={activePanel === "polls"}
                isOpen={livePollsOpen}
                onClick={() => togglePanel("polls")}
              />
            )}

            {/* Divider */}
            {(chatEnabled || qaEnabled || pollsEnabled) && reactionsEnabled && (
              <div className="w-px h-6 bg-white/[0.08] mx-1 flex-shrink-0" />
            )}

            {/* Reactions */}
            {reactionsEnabled && (
              isLive && liveReactionsOpen ? (
                <ReactionBar
                  onReaction={sendReaction}
                  popularEmojis={getPopularEmojis()}
                  disabled={!reactionsConnected}
                  variant="compact"
                />
              ) : (
                <ToolbarButton
                  icon={Smile}
                  label="Reactions"
                  disabled={!isLive || !liveReactionsOpen}
                />
              )
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-white/[0.08] mx-1 flex-shrink-0" />

            {/* Report Issue */}
            <IncidentReportForm
              sessionId={session.id}
              eventId={eventId}
              trigger={
                <ToolbarButton
                  icon={AlertTriangle}
                  label="Report"
                  isDanger
                />
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VirtualSessionView;
