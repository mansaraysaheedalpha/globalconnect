
// src/app/(attendee)/attendee/events/[eventId]/page.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_ATTENDEE_EVENT_DETAILS_QUERY } from "@/graphql/attendee.graphql";
import { GET_EVENT_ATTENDEES_QUERY } from "@/graphql/registrations.graphql";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EventHeaderSkeleton,
  SessionCardSkeleton,
  ShimmerSkeleton,
} from "@/components/ui/skeleton-patterns";
import { NotFoundError } from "@/components/ui/error-boundary";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  PremiumCard,
  SectionHeader,
} from "@/components/ui/premium-components";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  MapPin,
  Clock,
  Ticket,
  ArrowLeft,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Mic2,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Presentation,
  X,
  Video,
  PlayCircle,
  DoorOpen,
  Store,
  ArrowRight,
} from "lucide-react";
import { format, isWithinInterval, isFuture } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { SessionChat } from "@/app/(platform)/dashboard/events/[eventId]/_components/session-chat";
import { SessionQA } from "@/app/(platform)/dashboard/events/[eventId]/_components/session-qa";
import { SessionPolls } from "@/app/(platform)/dashboard/events/[eventId]/_components/session-polls";
import { SlideViewer, DroppedContentNotification } from "@/components/features/presentation/slide-viewer";
import { usePresentationControl, DroppedContent } from "@/hooks/use-presentation-control";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { FloatingScheduleIndicator } from "@/components/features/agenda/live-agenda-container";
import { AgendaSession } from "@/hooks/use-agenda-updates";
import { FloatingDMButton } from "@/components/features/dm";
import { OfferGrid } from "@/components/features/offers";
import { AdContainer } from "@/components/features/ads/ad-container";
import { ProximityContainer } from "@/components/features/proximity";
import { IncidentReportForm } from "@/components/features/incidents";
import { VirtualSessionView, VirtualSession } from "@/components/features/virtual-session";
import { BreakoutRoomList, RoomAssignmentNotice } from "@/components/features/breakout";
import { SessionSocketProvider } from "@/context/SessionSocketContext";
import { ReactionBar } from "@/components/features/reaction-bar";
import { FloatingReactions } from "@/components/features/floating-reactions";
import { useSessionReactions } from "@/hooks/use-session-reactions";

type SessionType = "MAINSTAGE" | "BREAKOUT" | "WORKSHOP" | "NETWORKING" | "EXPO";
type EventType = "IN_PERSON" | "VIRTUAL" | "HYBRID";

type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "LIVE" | "ENDED";
  chatEnabled?: boolean;
  qaEnabled?: boolean;
  pollsEnabled?: boolean;
  breakoutEnabled?: boolean;
  presentationEnabled?: boolean;
  chatOpen?: boolean;  // Runtime state: organizer controls when chat is open
  qaOpen?: boolean;    // Runtime state: organizer controls when Q&A is open
  pollsOpen?: boolean; // Runtime state: organizer controls when polls are open
  presentationActive?: boolean; // Runtime state: presentation is currently being shown
  // Virtual session fields
  sessionType?: SessionType;
  streamingUrl?: string | null;
  recordingUrl?: string | null;
  broadcastOnly?: boolean;
  virtualRoomId?: string | null;
  speakers: { id: string; name: string }[];
};

type Registration = {
  id: string;
  status: string;
  ticketCode: string;
  checkedInAt: string | null;
};

type VirtualSettings = {
  streamingProvider?: string;
  streamingUrl?: string;
  recordingEnabled?: boolean;
  autoCaptions?: boolean;
  lobbyEnabled?: boolean;
  lobbyVideoUrl?: string;
  maxConcurrentViewers?: number;
};

type Event = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  imageUrl: string | null;
  organizationId?: string;
  eventType?: EventType;
  virtualSettings?: VirtualSettings | null;
  venue: {
    id: string;
    name: string;
    address: string;
  } | null;
};

const getSessionStatusBadge = (status: string) => {
  switch (status) {
    case "LIVE":
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </Badge>
      );
    case "UPCOMING":
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
          Upcoming
        </Badge>
      );
    case "ENDED":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Ended
        </Badge>
      );
    default:
      return null;
  }
};

// Dialog wrapper for Chat (full-screen modal)
const AttendeeChatDialog = ({
  session,
  eventId,
  liveChatOpen,
  setLiveChatOpen,
}: {
  session: Session;
  eventId: string;
  liveChatOpen: boolean;
  setLiveChatOpen: (open: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 ${!liveChatOpen ? "opacity-60" : ""}`}
        onClick={() => setIsOpen(true)}
      >
        {liveChatOpen ? (
          <Unlock className="h-4 w-4 text-green-600" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
        <MessageSquare className="h-4 w-4" />
        Chat
        {liveChatOpen && (
          <Badge className="ml-1 bg-green-600 text-white text-[10px] px-1.5 py-0 h-4">
            Open
          </Badge>
        )}
      </Button>
      <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-[90vw] sm:!w-[90vw] lg:!max-w-[75vw] lg:!w-[75vw] h-[92vh] sm:h-[88vh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden pt-safe pb-safe">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-background/95">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-medium">{session.title} - Chat</span>
            <Badge variant={liveChatOpen ? "default" : "secondary"} className={liveChatOpen ? "bg-green-500/10 text-green-600" : ""}>
              {liveChatOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <SessionChat
            sessionId={session.id}
            eventId={eventId}
            sessionName={session.title}
            className="h-full border-0 shadow-none rounded-none"
            initialChatOpen={liveChatOpen}
            onStatusChange={setLiveChatOpen}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Dialog wrapper for Q&A (full-screen modal)
const AttendeeQADialog = ({
  session,
  eventId,
  liveQaOpen,
  setLiveQaOpen,
}: {
  session: Session;
  eventId: string;
  liveQaOpen: boolean;
  setLiveQaOpen: (open: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 ${!liveQaOpen ? "opacity-60" : ""}`}
        onClick={() => setIsOpen(true)}
      >
        {liveQaOpen ? (
          <Unlock className="h-4 w-4 text-green-600" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
        <HelpCircle className="h-4 w-4" />
        Q&A
        {liveQaOpen && (
          <Badge className="ml-1 bg-green-600 text-white text-[10px] px-1.5 py-0 h-4">
            Open
          </Badge>
        )}
      </Button>
      <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-[90vw] sm:!w-[90vw] lg:!max-w-[75vw] lg:!w-[75vw] h-[92vh] sm:h-[88vh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden pt-safe pb-safe">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-background/95">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-primary" />
            <span className="font-medium">{session.title} - Q&A</span>
            <Badge variant={liveQaOpen ? "default" : "secondary"} className={liveQaOpen ? "bg-green-500/10 text-green-600" : ""}>
              {liveQaOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Q&A Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <SessionQA
            sessionId={session.id}
            eventId={eventId}
            sessionName={session.title}
            isOrganizer={false}
            isSpeaker={false}
            className="h-full border-0 shadow-none rounded-none"
            initialQaOpen={liveQaOpen}
            onStatusChange={setLiveQaOpen}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Dialog wrapper for Polls (full-screen modal)
const AttendeePollsDialog = ({
  session,
  eventId,
  livePollsOpen,
  setLivePollsOpen,
}: {
  session: Session;
  eventId: string;
  livePollsOpen: boolean;
  setLivePollsOpen: (open: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 ${!livePollsOpen ? "opacity-60" : ""}`}
        onClick={() => setIsOpen(true)}
      >
        {livePollsOpen ? (
          <Unlock className="h-4 w-4 text-green-600" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
        <BarChart3 className="h-4 w-4" />
        Polls
        {livePollsOpen && (
          <Badge className="ml-1 bg-green-600 text-white text-[10px] px-1.5 py-0 h-4">
            Open
          </Badge>
        )}
      </Button>
      <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-[90vw] sm:!w-[90vw] lg:!max-w-[75vw] lg:!w-[75vw] h-[92vh] sm:h-[88vh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden pt-safe pb-safe">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-background/95">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-medium">{session.title} - Polls</span>
            <Badge variant={livePollsOpen ? "default" : "secondary"} className={livePollsOpen ? "bg-green-500/10 text-green-600" : ""}>
              {livePollsOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Polls Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <SessionPolls
            sessionId={session.id}
            eventId={eventId}
            isOrganizer={false}
            isSpeaker={false}
            className="h-full border-0 shadow-none rounded-none"
            initialPollsOpen={livePollsOpen}
            onStatusChange={setLivePollsOpen}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Dialog wrapper for presentation (full-screen like organizer's view)
const AttendeePresentationDialog = ({
  session,
  eventId,
  organizationId,
  livePresentationActive,
}: {
  session: Session;
  eventId: string;
  organizationId?: string;
  livePresentationActive: boolean;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 ${!livePresentationActive ? "opacity-60" : ""}`}
        onClick={() => setIsOpen(true)}
      >
        {livePresentationActive ? (
          <Unlock className="h-4 w-4 text-green-600" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
        <Presentation className="h-4 w-4" />
        Slides
        {livePresentationActive && (
          <Badge className="ml-1 bg-green-600 text-white text-[10px] px-1.5 py-0 h-4">
            Open
          </Badge>
        )}
      </Button>
      <DialogContent className="!max-w-[98vw] !w-[98vw] max-h-[92vh] sm:max-h-[90vh] p-0 gap-0 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl overflow-hidden pt-safe pb-safe">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60">
          <div className="flex items-center gap-3">
            <Presentation className="h-5 w-5 text-white/70" />
            <span className="font-medium text-white">{session.title} - Presentation</span>
            {livePresentationActive && (
              <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Presentation Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-auto">
          <AttendeePresentation
            sessionId={session.id}
            eventId={eventId}
            sessionTitle={session.title}
            organizationId={organizationId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Separate component for attendee presentation viewer (hooks need stable component)
const AttendeePresentation = ({ sessionId, eventId, sessionTitle, organizationId }: {
  sessionId: string;
  eventId: string;
  sessionTitle: string;
  organizationId?: string;
}) => {
  const {
    slideState,
    droppedContent,
    isConnected,
    error,
    clearDroppedContent,
  } = usePresentationControl(sessionId, eventId, false); // canControl = false for attendees
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { token } = useAuthStore();

  // Handle download request
  const handleDownload = async () => {
    if (!organizationId) {
      toast.error("Cannot download", { description: "Organization information not available" });
      return;
    }

    setIsDownloading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_EVENT_SERVICE_URL || process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/organizations/${organizationId}/events/${eventId}/sessions/${sessionId}/presentation/download-url`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Open the signed download URL in a new tab
        window.open(data.url, "_blank");
        toast.success("Download started", {
          description: `Downloading ${data.filename}`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to get download link");
      }
    } catch (err: any) {
      toast.error("Download failed", { description: err.message });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Connection status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-yellow-500/10 text-yellow-600 text-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
          Connecting...
        </div>
      )}

      {error && (
        <div className="px-4 py-2 bg-red-500/10 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Slide Viewer - view only for attendees */}
      <div className="flex-1 p-4">
        <SlideViewer
          slideState={slideState}
          slideUrls={slideState?.slideUrls}
          isPresenter={false} // Attendees can only view, not control
          onDownload={handleDownload}
          isDownloading={isDownloading}
          className="h-full"
        />
      </div>

      {/* Dropped content notifications */}
      {droppedContent.length > 0 && (
        <div className="absolute bottom-4 right-4 space-y-2 z-10">
          {droppedContent.map((content) => (
            <DroppedContentNotification
              key={content.id}
              content={content}
              onDismiss={() => clearDroppedContent(content.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Dialog wrapper for Breakout Rooms (full-screen modal)
const AttendeeBreakoutRoomsDialog = ({
  session,
  eventId,
  userId,
}: {
  session: Session;
  eventId: string;
  userId?: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeRoomCount, setActiveRoomCount] = React.useState(0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setIsOpen(true)}
      >
        <DoorOpen className="h-4 w-4" />
        Breakout
        {activeRoomCount > 0 && (
          <Badge className="ml-1 bg-green-600 text-white text-[10px] px-1.5 py-0 h-4">
            {activeRoomCount}
          </Badge>
        )}
      </Button>
      <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-[90vw] sm:!w-[90vw] lg:!max-w-[85vw] lg:!w-[85vw] h-[92vh] sm:h-[88vh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden pt-safe pb-safe">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-background/95">
          <div className="flex items-center gap-3">
            <DoorOpen className="h-5 w-5 text-primary" />
            <span className="font-medium">{session.title} - Breakout Rooms</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Breakout Rooms Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-auto p-4">
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Join a breakout room to participate in smaller group discussions.
              You can leave and rejoin rooms at any time.
            </p>
          </div>
          {/* Show pre-assigned room notice if user has an assignment */}
          {userId && (
            <RoomAssignmentNotice
              sessionId={session.id}
              eventId={eventId}
              userId={userId}
              className="mb-4"
            />
          )}
          <BreakoutRoomList
            sessionId={session.id}
            eventId={eventId}
            userId={userId}
            isOrganizer={false}
            onJoinRoom={() => toast.success("Joined breakout room")}
            onLeaveRoom={() => toast.success("Left breakout room")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SessionCard = ({
  session,
  eventId,
  organizationId,
  eventVirtualSettings,
  userId,
}: {
  session: Session;
  eventId: string;
  organizationId?: string;
  eventVirtualSettings?: VirtualSettings | null;
  userId?: string;
}) => {
  const isLive = session.status === "LIVE";
  const isEnded = session.status === "ENDED";
  const isUpcoming = session.status === "UPCOMING";

  // Reactions hook for live sessions
  const {
    sendReaction,
    getPopularEmojis,
    floatingEmojis,
    isConnected: reactionsConnected,
  } = useSessionReactions(session.id, eventId);

  // Check if features are enabled (default to true for backwards compatibility)
  const chatEnabled = session.chatEnabled !== false;
  const qaEnabled = session.qaEnabled !== false;
  const pollsEnabled = session.pollsEnabled !== false;
  const presentationEnabled = session.presentationEnabled !== false;
  const hasInteractiveFeatures = chatEnabled || qaEnabled || pollsEnabled || presentationEnabled;

  // Virtual session detection - only if there's a streaming URL (session-level or event-level)
  const effectiveStreamingUrl = session.streamingUrl || eventVirtualSettings?.streamingUrl;
  const isVirtualSession = !!effectiveStreamingUrl || !!session.recordingUrl;
  const hasRecording = isEnded && !!session.recordingUrl;

  // State for virtual session viewer
  const [showVirtualSession, setShowVirtualSession] = React.useState(false);

  // Local state for live status tracking (updated via WebSocket events from child components)
  const [liveChatOpen, setLiveChatOpen] = React.useState(session.chatOpen ?? false);
  const [liveQaOpen, setLiveQaOpen] = React.useState(session.qaOpen ?? false);
  const [livePollsOpen, setLivePollsOpen] = React.useState(session.pollsOpen ?? false);

  // Track presentation status via WebSocket (always connected for live sessions)
  const { slideState } = usePresentationControl(session.id, eventId, false);
  const livePresentationActive = slideState?.isActive ?? false;

  // Sync with props when they change (e.g., from refetch)
  React.useEffect(() => {
    setLiveChatOpen(session.chatOpen ?? false);
  }, [session.chatOpen]);

  React.useEffect(() => {
    setLiveQaOpen(session.qaOpen ?? false);
  }, [session.qaOpen]);

  React.useEffect(() => {
    setLivePollsOpen(session.pollsOpen ?? false);
  }, [session.pollsOpen]);

  // Convert Session to VirtualSession for the viewer (using effective streaming URL)
  const virtualSession: VirtualSession = {
    id: session.id,
    title: session.title,
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status,
    sessionType: session.sessionType,
    streamingUrl: effectiveStreamingUrl,
    recordingUrl: session.recordingUrl,
    broadcastOnly: session.broadcastOnly,
    chatEnabled: session.chatEnabled,
    qaEnabled: session.qaEnabled,
    pollsEnabled: session.pollsEnabled,
    chatOpen: liveChatOpen,
    qaOpen: liveQaOpen,
    pollsOpen: livePollsOpen,
    speakers: session.speakers,
  };

  // Get session type badge
  const getSessionTypeBadge = () => {
    if (!session.sessionType) return null;
    const types: Record<string, { label: string; className: string }> = {
      MAINSTAGE: { label: "Mainstage", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
      BREAKOUT: { label: "Breakout", className: "bg-green-500/10 text-green-600 border-green-500/20" },
      WORKSHOP: { label: "Workshop", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
      NETWORKING: { label: "Networking", className: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
      EXPO: { label: "Expo", className: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
    };
    const type = types[session.sessionType];
    if (!type) return null;
    return <Badge variant="outline" className={type.className}>{type.label}</Badge>;
  };

  return (
    <>
      <PremiumCard
        variant={isLive ? "glow" : "elevated"}
        padding="none"
        hover={!isEnded ? "lift" : "none"}
        className={`overflow-hidden ${isLive ? "ring-2 ring-green-500/20 border-green-500/30" : ""}`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getSessionStatusBadge(session.status)}
                {getSessionTypeBadge()}
                {isVirtualSession && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    <Video className="h-3 w-3 mr-1" />
                    Virtual
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-foreground">{session.title}</h3>

              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(session.startTime), "h:mm a")} -{" "}
                    {format(new Date(session.endTime), "h:mm a")}
                  </span>
                </div>

                {session.speakers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mic2 className="h-4 w-4" />
                    <span>{session.speakers.map((s) => s.name).join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Watch Live / Watch Recording buttons for virtual sessions */}
              {isVirtualSession && (isLive || hasRecording) && (
                <div className="mt-3">
                  {isLive && effectiveStreamingUrl && (
                    <Button
                      variant="premium"
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowVirtualSession(true)}
                    >
                      <Video className="h-4 w-4" />
                      Watch Live
                    </Button>
                  )}
                  {hasRecording && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowVirtualSession(true)}
                    >
                      <PlayCircle className="h-4 w-4" />
                      Watch Recording
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Features - show if features are enabled (not ended sessions) */}
            {/* Wrapped in SessionSocketProvider to share a single socket across Chat/Q&A/Polls */}
            {!isEnded && hasInteractiveFeatures && (
              <SessionSocketProvider
                sessionId={session.id}
                eventId={eventId}
                initialChatOpen={liveChatOpen}
                initialQaOpen={liveQaOpen}
                initialPollsOpen={livePollsOpen}
              >
                <div className="flex flex-col gap-2">
                  {/* Session Chat */}
                  {chatEnabled && (
                    <AttendeeChatDialog
                      session={session}
                      eventId={eventId}
                      liveChatOpen={liveChatOpen}
                      setLiveChatOpen={setLiveChatOpen}
                    />
                  )}

                  {/* Session Q&A */}
                  {qaEnabled && (
                    <AttendeeQADialog
                      session={session}
                      eventId={eventId}
                      liveQaOpen={liveQaOpen}
                      setLiveQaOpen={setLiveQaOpen}
                    />
                  )}

                  {/* Session Polls */}
                  {pollsEnabled && (
                    <AttendeePollsDialog
                      session={session}
                      eventId={eventId}
                      livePollsOpen={livePollsOpen}
                      setLivePollsOpen={setLivePollsOpen}
                    />
                  )}

                  {/* Session Presentation */}
                  {presentationEnabled && (
                    <AttendeePresentationDialog
                      session={session}
                      eventId={eventId}
                      organizationId={organizationId}
                      livePresentationActive={livePresentationActive}
                    />
                  )}

                  {/* Breakout Rooms - available for live sessions when enabled */}
                  {isLive && session.breakoutEnabled && (
                    <AttendeeBreakoutRoomsDialog
                      session={session}
                      eventId={eventId}
                      userId={userId}
                    />
                  )}

                  {/* Live Reactions - available for live sessions */}
                  {isLive && (
                    <div className="relative">
                      <div className="flex items-center gap-2 p-3 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                            React with emojis
                          </p>
                          <ReactionBar
                            onReaction={sendReaction}
                            popularEmojis={getPopularEmojis()}
                            disabled={!reactionsConnected}
                            variant="horizontal"
                          />
                        </div>
                      </div>
                      {/* Floating reactions overlay */}
                      <FloatingReactions emojis={floatingEmojis} />
                    </div>
                  )}

                  {/* Report Issue Button - Always available for live/upcoming sessions */}
                  <IncidentReportForm
                    sessionId={session.id}
                    eventId={eventId}
                    trigger={
                      <Button variant="outline" size="sm" className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
                        <AlertTriangle className="h-4 w-4" />
                        Report Issue
                      </Button>
                    }
                  />
                </div>
              </SessionSocketProvider>
            )}
          </div>
        </div>
      </PremiumCard>

      {/* Virtual Session Viewer Dialog */}
      <VirtualSessionView
        session={virtualSession}
        eventId={eventId}
        isOpen={showVirtualSession}
        onClose={() => setShowVirtualSession(false)}
      />
    </>
  );
};

export default function AttendeeEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { user } = useAuthStore();

  const { data, loading, error } = useQuery(GET_ATTENDEE_EVENT_DETAILS_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  const { data: attendeesData } = useQuery(GET_EVENT_ATTENDEES_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  const availableUsers = React.useMemo(() => {
    if (!attendeesData?.eventAttendees) return [];

    return attendeesData.eventAttendees
      .filter((reg: any) => reg.user) // Only users with accounts
      .map((reg: any) => ({
        id: reg.user.id,
        firstName: reg.user.first_name,
        lastName: reg.user.last_name,
        avatar: reg.user.imageUrl // Assuming user has imageUrl
      }));
  }, [attendeesData]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto animate-fade-in">
        {/* Back button skeleton */}
        <ShimmerSkeleton className="h-9 w-36 mb-6 rounded-md" />

        {/* Event header skeleton */}
        <EventHeaderSkeleton className="mb-8" />

        {/* Sessions header */}
        <div className="flex items-center justify-between mb-4">
          <ShimmerSkeleton className="h-7 w-32" />
          <ShimmerSkeleton className="h-5 w-24" />
        </div>

        {/* Session cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.event) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
        <Link href="/attendee">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to My Events
          </Button>
        </Link>
        <NotFoundError
          resource="event"
          onGoBack={() => window.history.back()}
          onGoHome={() => window.location.href = "/attendee"}
        />
      </div>
    );
  }

  const registration: Registration | null = data.myRegistrationForEvent;
  const event: Event = data.event;
  const sessions: Session[] = data.publicSessionsByEvent || [];

  // Debug: Log IDs to help track registration issues
  console.log("[AttendeeEventPage] Debug info:", {
    urlEventId: eventId,
    eventIdFromQuery: event.id,
    registrationId: registration?.id,
    registrationStatus: registration?.status,
    sessionIds: sessions.map(s => ({ id: s.id, title: s.title })),
  });

  // Check if user is registered
  if (!registration) {
    return (
      <PageTransition className="p-6 max-w-5xl mx-auto">
        <Link href="/attendee">
          <Button variant="ghost" className="mb-4 gap-2 hover:-translate-x-1 transition-transform">
            <ArrowLeft className="h-4 w-4" />
            Back to My Events
          </Button>
        </Link>
        <PremiumCard variant="elevated" padding="lg" className="border-yellow-500/30 text-center">
          <div className="p-3 w-fit mx-auto rounded-full bg-yellow-500/10 mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold">Not Registered</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            You need to register for this event to access its features.
          </p>
          <Link href={`/events/${eventId}`}>
            <Button variant="premium" size="lg" className="mt-6">
              View Event & Register
            </Button>
          </Link>
        </PremiumCard>
      </PageTransition>
    );
  }

  // Sort sessions: live first, then upcoming, then ended
  const sortedSessions = [...sessions].sort((a, b) => {
    const order = { LIVE: 0, UPCOMING: 1, ENDED: 2 };
    return order[a.status] - order[b.status];
  });

  const liveSessions = sortedSessions.filter((s) => s.status === "LIVE");
  const upcomingSessions = sortedSessions.filter((s) => s.status === "UPCOMING");
  const endedSessions = sortedSessions.filter((s) => s.status === "ENDED");

  return (
    <PageTransition className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link href="/attendee">
        <Button variant="ghost" className="mb-4 gap-2 hover:-translate-x-1 transition-transform">
          <ArrowLeft className="h-4 w-4" />
          Back to My Events
        </Button>
      </Link>

      {/* Event Header */}
      <PremiumCard variant="elevated" padding="none" className="overflow-hidden mb-6">
        <div className="relative h-48 md:h-64">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <CalendarDays className="h-16 w-16 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              {event.eventType === "VIRTUAL" && (
                <Badge className="bg-blue-500 text-white">
                  <Video className="h-3 w-3 mr-1" />
                  Virtual Event
                </Badge>
              )}
              {event.eventType === "HYBRID" && (
                <Badge className="bg-purple-500 text-white">
                  <Video className="h-3 w-3 mr-1" />
                  Hybrid Event
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{event.name}</h1>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggerItem className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="font-semibold">
                  {format(new Date(event.startDate), "MMM d, yyyy")}
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p>
                <p className="font-semibold">
                  {format(new Date(event.startDate), "h:mm a")}
                </p>
              </div>
            </StaggerItem>

            {event.venue ? (
              <StaggerItem className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Venue</p>
                  <p className="font-semibold">{event.venue.name}</p>
                </div>
              </StaggerItem>
            ) : event.eventType === "VIRTUAL" ? (
              <StaggerItem className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Video className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                  <p className="font-semibold">Online Event</p>
                </div>
              </StaggerItem>
            ) : null}

            <StaggerItem className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-lg bg-primary/10">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Ticket</p>
                <p className="font-mono font-semibold">{registration.ticketCode}</p>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {registration.checkedInAt && (
            <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-500/10 px-4 py-2 rounded-lg w-fit">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                Checked in at {format(new Date(registration.checkedInAt), "h:mm a")}
              </span>
            </div>
          )}
        </div>
      </PremiumCard>

      {/* Expo Hall Quick Access */}
      <Link href={`/attendee/events/${eventId}/expo`}>
        <PremiumCard
          variant="elevated"
          hover="lift"
          className="mb-6 group cursor-pointer bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all"
        >
          <div className="p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Expo Hall
                  <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                    Open
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore sponsor booths, download resources, and connect with exhibitors
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
          </div>
        </PremiumCard>
      </Link>

      {/* Sponsored Content - Hero Banner Ad */}
      <AdContainer
        eventId={eventId}
        placement="EVENT_HERO"
        limit={1}
        rotationInterval={45000}
        className="mb-6 rounded-xl overflow-hidden"
        showSponsorLabel={true}
      />

      {/* Exclusive Offers */}
      <section className="mb-8">
        <SectionHeader
          title="Exclusive Offers"
          subtitle="Limited-time upgrades and add-ons for this event"
          className="mb-4"
        />
        <OfferGrid
          eventId={eventId}
          placement="IN_EVENT"
          variant="featured"
          limit={3}
        />
      </section>

      {/* Sessions */}
      <div className="space-y-8">
        {/* Live Sessions */}
        {liveSessions.length > 0 && (
          <section>
            <SectionHeader
              title="Live Now"
              subtitle="Currently happening sessions"
              className="mb-4"
            />
            <StaggerContainer className="space-y-3">
              {liveSessions.map((session, index) => (
                <StaggerItem key={session.id}>
                  <SessionCard session={session} eventId={eventId} organizationId={event.organizationId} eventVirtualSettings={event.virtualSettings} userId={user?.id} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <section>
            <SectionHeader
              title="Upcoming Sessions"
              subtitle={`${upcomingSessions.length} session${upcomingSessions.length > 1 ? 's' : ''} scheduled`}
              className="mb-4"
            />
            <StaggerContainer className="space-y-3">
              {upcomingSessions.map((session, index) => (
                <StaggerItem key={session.id}>
                  <SessionCard session={session} eventId={eventId} organizationId={event.organizationId} eventVirtualSettings={event.virtualSettings} userId={user?.id} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )}

        {/* Session Break Ad */}
        {(liveSessions.length > 0 || upcomingSessions.length > 0) && (
          <AdContainer
            eventId={eventId}
            placement="SESSION_BREAK"
            limit={1}
            rotationInterval={30000}
            className="rounded-lg overflow-hidden"
            showSponsorLabel={true}
          />
        )}

        {/* Ended Sessions */}
        {endedSessions.length > 0 && (
          <section className="opacity-70">
            <SectionHeader
              title="Past Sessions"
              subtitle="Completed sessions"
              className="mb-4"
            />
            <StaggerContainer className="space-y-3">
              {endedSessions.map((session, index) => (
                <StaggerItem key={session.id}>
                  <SessionCard session={session} eventId={eventId} organizationId={event.organizationId} eventVirtualSettings={event.virtualSettings} userId={user?.id} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )}

        {sessions.length === 0 && (
          <PremiumCard variant="outline" padding="lg" className="border-dashed text-center">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No Sessions Yet</h3>
            <p className="text-muted-foreground mt-2">
              The event schedule hasn't been published yet.
            </p>
          </PremiumCard>
        )}
      </div>

      {/* Note: LiveReactionsFull and FloatingScoreWidget removed for cleaner virtual event experience */}

      {/* Floating Schedule Indicator - Real-time agenda updates */}
      {sessions.length > 0 && (
        <FloatingScheduleIndicator
          eventId={eventId}
          initialSessions={sessions.map((s): AgendaSession => ({
            id: s.id,
            title: s.title,
            startTime: s.startTime,
            endTime: s.endTime,
            status: s.status === "LIVE" ? "live" : s.status === "ENDED" ? "completed" : "upcoming",
            speakers: s.speakers.map((sp) => ({
              id: sp.id,
              firstName: sp.name.split(" ")[0] || sp.name,
              lastName: sp.name.split(" ").slice(1).join(" ") || "",
            })),
          }))}
          className="right-4 sm:right-6"
        />
      )}

      {/* Proximity Networking - Discover nearby attendees */}
      <ProximityContainer
        eventId={eventId}
        position="bottom-right"
        className="right-20 sm:right-24"
        onStartChat={(userId, userName) => {
          // Dispatch custom event to open DM with this user
          window.dispatchEvent(
            new CustomEvent("start-dm-chat", { detail: { userId, userName } })
          );
        }}
      />

      {/* Floating Direct Messages Button */}
      <FloatingDMButton
        eventId={eventId}
        availableUsers={availableUsers}
        position="bottom-left"
        className="left-4 sm:left-6"
      />
    </PageTransition>
  );
}