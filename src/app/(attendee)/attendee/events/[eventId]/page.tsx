
// src/app/(attendee)/attendee/events/[eventId]/page.tsx
"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useLazyQuery } from "@apollo/client";
import { useOfflineQuery } from "@/hooks/use-offline-query";
import { StaleDataIndicator } from "@/components/ui/stale-data-indicator";
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
  Presentation,
  X,
  Video,
  PlayCircle,
  DoorOpen,
  Store,
  ArrowRight,
  Smile,
} from "lucide-react";
import { format, isWithinInterval, isFuture } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePresentationControl, DroppedContent } from "@/hooks/use-presentation-control";
import { useAuthStore } from "@/store/auth.store";
import { useEventUpdates } from "@/hooks/use-event-updates";
import { toast } from "sonner";
import { FloatingScheduleIndicator } from "@/components/features/agenda/live-agenda-container";
import { AgendaSession } from "@/hooks/use-agenda-updates";
import { FloatingDMButton } from "@/components/features/dm";
import { AddToCalendarButton } from "@/components/features/calendar";
import { SessionSocketProvider } from "@/context/SessionSocketContext";
import { ReactionBar } from "@/components/features/reaction-bar";
import { FloatingReactions } from "@/components/features/floating-reactions";
import { useSessionReactions } from "@/hooks/use-session-reactions";
import { FloatingScoreWidget } from "@/components/features/gamification/gamification-container";
import { AchievementToast } from "@/components/features/gamification/achievement-toast";
import { SmartNudge } from "@/components/features/gamification/smart-nudge";
import { useGamification } from "@/hooks/use-gamification";
import { useEventPrefetch } from "@/hooks/use-event-prefetch";
import type { VirtualSession } from "@/components/features/virtual-session";

// Dynamic imports for heavy feature components (only loaded when rendered)
const SessionChat = dynamic(() => import("@/app/(platform)/dashboard/events/[eventId]/_components/session-chat").then(m => ({ default: m.SessionChat })), { ssr: false });
const SessionQA = dynamic(() => import("@/app/(platform)/dashboard/events/[eventId]/_components/session-qa").then(m => ({ default: m.SessionQA })), { ssr: false });
const SessionPolls = dynamic(() => import("@/app/(platform)/dashboard/events/[eventId]/_components/session-polls").then(m => ({ default: m.SessionPolls })), { ssr: false });
const SlideViewer = dynamic(() => import("@/components/features/presentation/slide-viewer").then(m => ({ default: m.SlideViewer })), { ssr: false });
const DroppedContentNotification = dynamic(() => import("@/components/features/presentation/slide-viewer").then(m => ({ default: m.DroppedContentNotification })), { ssr: false });
const VirtualSessionView = dynamic(() => import("@/components/features/virtual-session").then(m => ({ default: m.VirtualSessionView })), { ssr: false });
const BreakoutRoomList = dynamic(() => import("@/components/features/breakout").then(m => ({ default: m.BreakoutRoomList })), { ssr: false });
const RoomAssignmentNotice = dynamic(() => import("@/components/features/breakout").then(m => ({ default: m.RoomAssignmentNotice })), { ssr: false });
const OfferGrid = dynamic(() => import("@/components/features/offers").then(m => ({ default: m.OfferGrid })), { ssr: false });
const AdContainer = dynamic(() => import("@/components/features/ads/ad-container").then(m => ({ default: m.AdContainer })), { ssr: false });
const ProximityContainer = dynamic(() => import("@/components/features/proximity").then(m => ({ default: m.ProximityContainer })), { ssr: false });
const IncidentReportForm = dynamic(() => import("@/components/features/incidents").then(m => ({ default: m.IncidentReportForm })), { ssr: false });
const RecommendationsPanel = dynamic(() => import("@/components/features/recommendations").then(m => ({ default: m.RecommendationsPanel })), { ssr: false });
const SuggestionsBell = dynamic(() => import("@/components/features/suggestions").then(m => ({ default: m.SuggestionsBell })), { ssr: false });
const TeamPanel = dynamic(() => import("@/components/features/gamification/team-panel").then(m => ({ default: m.TeamPanel })), { ssr: false });
const GamificationHub = dynamic(() => import("@/components/features/gamification/gamification-hub").then(m => ({ default: m.GamificationHub })), { ssr: false });
const SessionSummary = dynamic(() => import("@/components/features/gamification/session-summary").then(m => ({ default: m.SessionSummary })), { ssr: false });
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Sparkles, Users } from "lucide-react";

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
  reactionsEnabled?: boolean;
  breakoutEnabled?: boolean;
  presentationEnabled?: boolean;
  chatOpen?: boolean;  // Runtime state: organizer controls when chat is open
  qaOpen?: boolean;    // Runtime state: organizer controls when Q&A is open
  pollsOpen?: boolean; // Runtime state: organizer controls when polls are open
  reactionsOpen?: boolean; // Runtime state: organizer controls when reactions are open
  presentationActive?: boolean; // Runtime state: presentation is currently being shown
  // Virtual session fields
  sessionType?: SessionType;
  streamingUrl?: string | null;
  recordingUrl?: string | null;
  broadcastOnly?: boolean;
  virtualRoomId?: string | null;
  streamingProvider?: string | null;
  isRecordable?: boolean;
  autoCaptions?: boolean;
  lobbyEnabled?: boolean;
  speakers: { id: string; name: string; userId?: string | null }[];
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
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-medium">
          <span className="relative mr-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          Live
        </Badge>
      );
    case "UPCOMING":
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-medium">
          Upcoming
        </Badge>
      );
    case "ENDED":
      return (
        <Badge variant="outline" className="text-muted-foreground font-medium">
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
        className={`gap-1.5 rounded-lg ${liveChatOpen ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10" : "opacity-50"}`}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className={`h-3.5 w-3.5 ${liveChatOpen ? "text-green-600" : ""}`} />
        Chat
        {liveChatOpen && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        )}
      </Button>
      <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-[90vw] sm:!w-[90vw] lg:!max-w-[75vw] lg:!w-[75vw] h-[92vh] sm:h-[88vh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden pt-safe pb-safe">
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="font-medium text-sm sm:text-base">{session.title} - Chat</span>
              <Badge variant={liveChatOpen ? "default" : "secondary"} className={`ml-2 text-[10px] ${liveChatOpen ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}`}>
                {liveChatOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
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
        className={`gap-1.5 rounded-lg ${liveQaOpen ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10" : "opacity-50"}`}
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className={`h-3.5 w-3.5 ${liveQaOpen ? "text-green-600" : ""}`} />
        Q&A
        {liveQaOpen && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        )}
      </Button>
      <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-[90vw] sm:!w-[90vw] lg:!max-w-[75vw] lg:!w-[75vw] h-[92vh] sm:h-[88vh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden pt-safe pb-safe">
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="font-medium text-sm sm:text-base">{session.title} - Q&A</span>
              <Badge variant={liveQaOpen ? "default" : "secondary"} className={`ml-2 text-[10px] ${liveQaOpen ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}`}>
                {liveQaOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
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
        className={`gap-1.5 rounded-lg ${livePollsOpen ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10" : "opacity-50"}`}
        onClick={() => setIsOpen(true)}
      >
        <BarChart3 className={`h-3.5 w-3.5 ${livePollsOpen ? "text-green-600" : ""}`} />
        Polls
        {livePollsOpen && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        )}
      </Button>
      <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-[90vw] sm:!w-[90vw] lg:!max-w-[75vw] lg:!w-[75vw] h-[92vh] sm:h-[88vh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden pt-safe pb-safe">
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="font-medium text-sm sm:text-base">{session.title} - Polls</span>
              <Badge variant={livePollsOpen ? "default" : "secondary"} className={`ml-2 text-[10px] ${livePollsOpen ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}`}>
                {livePollsOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
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
        className={`gap-1.5 rounded-lg ${livePresentationActive ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10" : "opacity-50"}`}
        onClick={() => setIsOpen(true)}
      >
        <Presentation className={`h-3.5 w-3.5 ${livePresentationActive ? "text-green-600" : ""}`} />
        Slides
        {livePresentationActive && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        )}
      </Button>
      <DialogContent className="!max-w-[98vw] !w-[98vw] max-h-[92vh] sm:max-h-[90vh] p-0 gap-0 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl overflow-hidden pt-safe pb-safe">
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 bg-black/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/10">
              <Presentation className="h-4 w-4 text-white/80" />
            </div>
            <span className="font-medium text-white text-sm sm:text-base">{session.title} - Presentation</span>
            {livePresentationActive && (
              <Badge className="bg-red-600/90 text-white text-[10px]">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white animate-pulse inline-block" />
                LIVE
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
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
        className="gap-1.5 rounded-lg"
        onClick={() => setIsOpen(true)}
      >
        <DoorOpen className="h-3.5 w-3.5" />
        Breakout
        {activeRoomCount > 0 && (
          <Badge className="ml-0.5 bg-green-600 text-white text-[10px] px-1.5 py-0 h-4">
            {activeRoomCount}
          </Badge>
        )}
      </Button>
      <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-[90vw] sm:!w-[90vw] lg:!max-w-[85vw] lg:!w-[85vw] h-[92vh] sm:h-[88vh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden pt-safe pb-safe">
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <DoorOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-sm sm:text-base">{session.title} - Breakout Rooms</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-4 sm:p-5">
          <div className="mb-4 p-3.5 bg-muted/20 rounded-xl border border-border/50">
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

// Dialog wrapper for Teams (full-screen modal)
const AttendeeTeamsDialog = ({
  session,
}: {
  session: Session;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 rounded-lg"
        onClick={() => setIsOpen(true)}
      >
        <Users className="h-3.5 w-3.5" />
        Teams
      </Button>
      <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-lg sm:!w-full max-h-[85vh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-sm sm:text-base">{session.title} - Teams</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-4 sm:p-5">
          <TeamPanel sessionId={session.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SessionCard = ({
  session,
  eventId,
  eventName,
  organizationId,
  eventVirtualSettings,
  userId,
}: {
  session: Session;
  eventId: string;
  eventName: string;
  organizationId?: string;
  eventVirtualSettings?: VirtualSettings | null;
  userId?: string;
}) => {
  const isLive = session.status === "LIVE";
  const isEnded = session.status === "ENDED";
  const isUpcoming = session.status === "UPCOMING";

  // Reactions hook — only connect for LIVE sessions to avoid unnecessary WebSocket connections
  const {
    sendReaction,
    getPopularEmojis,
    floatingEmojis,
    isConnected: reactionsConnected,
  } = useSessionReactions(isLive ? session.id : "", isLive ? eventId : "");

  // Check if features are enabled (default to true for backwards compatibility)
  const chatEnabled = session.chatEnabled !== false;
  const qaEnabled = session.qaEnabled !== false;
  const pollsEnabled = session.pollsEnabled !== false;
  const reactionsEnabled = session.reactionsEnabled !== false;
  const presentationEnabled = session.presentationEnabled !== false;
  const hasInteractiveFeatures = chatEnabled || qaEnabled || pollsEnabled || presentationEnabled;

  // Virtual session detection - streaming URL, recording, or Daily.co session
  const isDailySession = session.streamingProvider === "daily";
  const effectiveStreamingUrl = session.streamingUrl || eventVirtualSettings?.streamingUrl;
  const isVirtualSession = !!effectiveStreamingUrl || !!session.recordingUrl || isDailySession;
  const hasRecording = isEnded && !!session.recordingUrl;

  // State for virtual session viewer
  const [showVirtualSession, setShowVirtualSession] = React.useState(false);

  // Local state for live status tracking (updated via WebSocket events from child components)
  const [liveChatOpen, setLiveChatOpen] = React.useState(session.chatOpen ?? false);
  const [liveQaOpen, setLiveQaOpen] = React.useState(session.qaOpen ?? false);
  const [livePollsOpen, setLivePollsOpen] = React.useState(session.pollsOpen ?? false);
  const [liveReactionsOpen, setLiveReactionsOpen] = React.useState(session.reactionsOpen ?? false);

  // Track presentation status via WebSocket — only for LIVE sessions to avoid wasted connections
  const { slideState } = usePresentationControl(isLive ? session.id : "", isLive ? eventId : "", false);
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

  React.useEffect(() => {
    setLiveReactionsOpen(session.reactionsOpen ?? false);
  }, [session.reactionsOpen]);

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
    reactionsEnabled: session.reactionsEnabled,
    chatOpen: liveChatOpen,
    qaOpen: liveQaOpen,
    pollsOpen: livePollsOpen,
    reactionsOpen: liveReactionsOpen,
    speakers: session.speakers,
    streamingProvider: session.streamingProvider,
    virtualRoomId: session.virtualRoomId,
    isRecordable: session.isRecordable,
    autoCaptions: session.autoCaptions,
    lobbyEnabled: session.lobbyEnabled,
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
        {/* Live indicator bar */}
        {isLive && (
          <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />
        )}

        <div className="p-4 sm:p-5">
          {/* Top row: badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {getSessionStatusBadge(session.status)}
            {getSessionTypeBadge()}
            {isVirtualSession && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Video className="h-3 w-3 mr-1" />
                Virtual
              </Badge>
            )}
          </div>

          {/* Session title */}
          <h3 className="text-lg font-semibold text-foreground leading-snug">{session.title}</h3>

          {/* Meta row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {format(new Date(session.startTime), "h:mm a")} – {format(new Date(session.endTime), "h:mm a")}
              </span>
            </div>
            {session.speakers.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Mic2 className="h-3.5 w-3.5" />
                <span className="truncate max-w-[200px] sm:max-w-none">{session.speakers.map((s) => s.name).join(", ")}</span>
              </div>
            )}
          </div>

          {/* Action buttons row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Watch Live / Watch Recording / Join Session buttons for virtual sessions */}
            {isVirtualSession && isLive && isDailySession && (
              <Button
                variant="premium"
                size="sm"
                className="gap-2"
                onClick={() => setShowVirtualSession(true)}
              >
                <Video className="h-4 w-4" />
                Join Session
              </Button>
            )}
            {isVirtualSession && isLive && !isDailySession && effectiveStreamingUrl && (
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
            {isVirtualSession && hasRecording && (
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

            {/* View Lobby / Add to Calendar - for upcoming sessions */}
            {isUpcoming && isVirtualSession && session.lobbyEnabled && (
              <Button
                variant="premium"
                size="sm"
                className="gap-2"
                onClick={() => setShowVirtualSession(true)}
              >
                <Video className="h-4 w-4" />
                View Lobby
              </Button>
            )}
            {isUpcoming && (
              <AddToCalendarButton
                session={{
                  id: session.id,
                  title: session.title,
                  startTime: session.startTime,
                  endTime: session.endTime,
                  eventName,
                }}
                variant="outline"
                size="sm"
              />
            )}
          </div>

          {/* Interactive Features - only for in-person sessions */}
          {!isEnded && !isVirtualSession && hasInteractiveFeatures && (
            <SessionSocketProvider
              sessionId={session.id}
              eventId={eventId}
              initialChatOpen={liveChatOpen}
              initialQaOpen={liveQaOpen}
              initialPollsOpen={livePollsOpen}
              initialReactionsOpen={liveReactionsOpen}
            >
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex flex-wrap items-center gap-2">
                  {chatEnabled && (
                    <AttendeeChatDialog
                      session={session}
                      eventId={eventId}
                      liveChatOpen={liveChatOpen}
                      setLiveChatOpen={setLiveChatOpen}
                    />
                  )}
                  {qaEnabled && (
                    <AttendeeQADialog
                      session={session}
                      eventId={eventId}
                      liveQaOpen={liveQaOpen}
                      setLiveQaOpen={setLiveQaOpen}
                    />
                  )}
                  {pollsEnabled && (
                    <AttendeePollsDialog
                      session={session}
                      eventId={eventId}
                      livePollsOpen={livePollsOpen}
                      setLivePollsOpen={setLivePollsOpen}
                    />
                  )}
                  {presentationEnabled && (
                    <AttendeePresentationDialog
                      session={session}
                      eventId={eventId}
                      organizationId={organizationId}
                      livePresentationActive={livePresentationActive}
                    />
                  )}
                  {isLive && session.breakoutEnabled && (
                    <AttendeeBreakoutRoomsDialog
                      session={session}
                      eventId={eventId}
                      userId={userId}
                    />
                  )}
                  {isLive && (
                    <AttendeeTeamsDialog session={session} />
                  )}

                  {/* Report Issue - pushed to the right */}
                  <div className="ml-auto">
                    <IncidentReportForm
                      sessionId={session.id}
                      eventId={eventId}
                      trigger={
                        <Button variant="ghost" size="sm" className="gap-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/50">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Report</span>
                        </Button>
                      }
                    />
                  </div>
                </div>

                {/* Live Reactions - full width below buttons when open */}
                {isLive && reactionsEnabled && liveReactionsOpen && (
                  <div className="relative mt-3">
                    <div className="flex items-center gap-2 p-3 border rounded-xl bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50 dark:border-purple-800/50">
                      <div className="flex-1 min-w-0">
                        <ReactionBar
                          onReaction={sendReaction}
                          popularEmojis={getPopularEmojis()}
                          disabled={!reactionsConnected}
                          variant="horizontal"
                        />
                      </div>
                    </div>
                    <FloatingReactions emojis={floatingEmojis} />
                  </div>
                )}
                {isLive && reactionsEnabled && !liveReactionsOpen && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                      <Smile className="h-3 w-3" />
                      Reactions will appear when the host enables them
                    </p>
                  </div>
                )}
              </div>
            </SessionSocketProvider>
          )}
        </div>
      </PremiumCard>

      {/* Virtual Session Viewer Dialog */}
      <VirtualSessionView
        session={virtualSession}
        eventId={eventId}
        isOpen={showVirtualSession}
        onClose={() => setShowVirtualSession(false)}
        currentUserId={userId}
        lobbyVideoUrl={eventVirtualSettings?.lobbyVideoUrl}
      />
    </>
  );
};

export default function AttendeeEventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const { user } = useAuthStore();

  // Deep link parameters for auto-join
  const targetSessionId = searchParams.get('session');
  const autoJoin = searchParams.get('autoJoin') === 'true';
  const joinSource = searchParams.get('source');

  // State for auto-join virtual session
  const [autoJoinSession, setAutoJoinSession] = React.useState<Session | null>(null);
  const [showAutoJoinSession, setShowAutoJoinSession] = React.useState(false);
  const [hasProcessedAutoJoin, setHasProcessedAutoJoin] = React.useState(false);
  const [gamificationHubOpen, setGamificationHubOpen] = React.useState(false);

  const { data, loading, error, isStale, isOffline, lastFetched, refetch } = useOfflineQuery(GET_ATTENDEE_EVENT_DETAILS_QUERY, {
    variables: { eventId },
    skip: !eventId,
    offlineKey: `event-details-${eventId}`,
  });

  // Lazy-load attendees — only fetched after main data loads (used by DM button)
  const [fetchAttendees, { data: attendeesData }] = useLazyQuery(GET_EVENT_ATTENDEES_QUERY);

  const eventLoaded = !!data?.event;
  React.useEffect(() => {
    if (eventLoaded && eventId) {
      fetchAttendees({ variables: { eventId } });
    }
  }, [eventLoaded, eventId, fetchAttendees]);

  // Prefetch event images into service worker cache for offline access
  const attendeeAvatars = React.useMemo(() => {
    if (!attendeesData?.eventAttendees) return [];
    return attendeesData.eventAttendees
      .map((reg: any) => reg.user?.imageUrl)
      .filter(Boolean) as string[];
  }, [attendeesData]);

  useEventPrefetch({
    eventId,
    eventImageUrl: data?.event?.imageUrl,
    attendeeImageUrls: attendeeAvatars,
    enabled: eventLoaded,
  });

  // Listen for real-time event/session update notifications
  useEventUpdates({
    eventId,
    autoRefetch: true,
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

  // Auto-join effect for deep links - MUST be before early returns to maintain hook order
  React.useEffect(() => {
    // Guard against undefined data during loading
    if (!data?.event || loading) return;

    const sessions: Session[] = data.publicSessionsByEvent || [];
    const event: Event = data.event;

    if (!targetSessionId || hasProcessedAutoJoin || sessions.length === 0) return;

    const session = sessions.find(s => s.id === targetSessionId);
    if (!session) return;

    // Mark as processed to avoid re-triggering
    setHasProcessedAutoJoin(true);

    // Track analytics
    if (joinSource) {
      console.log('[Analytics] session_join_attempt', { sessionId: targetSessionId, source: joinSource });
    }

    // Auto-join for virtual sessions
    if (autoJoin) {
      const effectiveStreamingUrl = session.streamingUrl || event.virtualSettings?.streamingUrl;
      const hasRecording = session.status === 'ENDED' && !!session.recordingUrl;
      const isLiveOrUpcoming = session.status === 'LIVE' || session.status === 'UPCOMING';

      if ((isLiveOrUpcoming && effectiveStreamingUrl) || hasRecording) {
        setAutoJoinSession(session);
        setShowAutoJoinSession(true);
      }
    }

    // Scroll to the target session card
    setTimeout(() => {
      const element = document.getElementById(`session-card-${targetSessionId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [data, targetSessionId, autoJoin, joinSource, hasProcessedAutoJoin, loading]);

  // Handle DM chat query parameters
  React.useEffect(() => {
    const chatUserId = searchParams.get('chat');
    const chatUserName = searchParams.get('name');

    if (chatUserId && chatUserName) {
      // Dispatch custom event to open DM with this user
      window.dispatchEvent(
        new CustomEvent("start-dm-chat", {
          detail: { userId: chatUserId, userName: chatUserName }
        })
      );
    }
  }, [searchParams]);

  // --- Gamification hooks (MUST be above early returns to maintain hook order) ---
  const sessions: Session[] = data?.publicSessionsByEvent || [];
  const liveSessions = React.useMemo(
    () => sessions.filter((s) => s.status === "LIVE"),
    [sessions],
  );
  const activeGamificationSessionId = liveSessions[0]?.id || "";
  const gamification = useGamification({ sessionId: activeGamificationSessionId });

  const [celebratingAchievement, setCelebratingAchievement] = React.useState<typeof gamification.achievements[number] | null>(null);
  const lastAchievementCountRef = React.useRef(0);

  React.useEffect(() => {
    if (gamification.achievements.length > lastAchievementCountRef.current && lastAchievementCountRef.current > 0) {
      const newest = gamification.achievements[gamification.achievements.length - 1];
      setCelebratingAchievement(newest);
    }
    lastAchievementCountRef.current = gamification.achievements.length;
  }, [gamification.achievements]);

  const [summarySession, setSummarySession] = React.useState<{ title: string } | null>(null);
  const previousLiveSessionIdsRef = React.useRef<Set<string>>(new Set());

  const endedSessions = React.useMemo(
    () => sessions.filter((s) => s.status === "ENDED"),
    [sessions],
  );

  React.useEffect(() => {
    const currentLiveIds = new Set(liveSessions.map((s) => s.id));
    const prevLiveIds = previousLiveSessionIdsRef.current;

    if (prevLiveIds.size > 0) {
      for (const prevId of prevLiveIds) {
        if (!currentLiveIds.has(prevId)) {
          const ended = endedSessions.find((s) => s.id === prevId);
          if (ended && gamification.currentScore > 0) {
            setSummarySession({ title: ended.title });
            break;
          }
        }
      }
    }

    previousLiveSessionIdsRef.current = currentLiveIds;
  }, [liveSessions, endedSessions, gamification.currentScore]);
  // --- End gamification hooks ---

  if (loading && !data) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto animate-fade-in">
        {/* Back button skeleton */}
        <ShimmerSkeleton className="h-9 w-36 mb-6 rounded-lg" />

        {/* Hero banner skeleton */}
        <div className="rounded-2xl overflow-hidden mb-6">
          <ShimmerSkeleton className="h-56 sm:h-64 md:h-72 w-full" />
          <div className="p-4 sm:p-5 md:p-6 bg-background border border-t-0 rounded-b-2xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <ShimmerSkeleton key={i} className="h-16 sm:h-[72px] rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Expo card skeleton */}
        <ShimmerSkeleton className="h-20 rounded-2xl mb-6" />

        {/* Sessions header */}
        <div className="flex items-center justify-between mb-4">
          <ShimmerSkeleton className="h-7 w-32 rounded-lg" />
          <ShimmerSkeleton className="h-5 w-24 rounded-lg" />
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


  // Check if user is registered
  if (!registration) {
    return (
      <PageTransition className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
        <Link href="/attendee">
          <Button variant="ghost" className="mb-6 gap-2 hover:-translate-x-1 transition-transform">
            <ArrowLeft className="h-4 w-4" />
            Back to My Events
          </Button>
        </Link>
        <PremiumCard variant="elevated" padding="lg" className="border-yellow-500/20 text-center rounded-2xl">
          <div className="py-8">
            <div className="p-4 w-fit mx-auto rounded-2xl bg-yellow-500/10 mb-5">
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold">Not Registered</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm">
              You need to register for this event to access its features.
            </p>
            <Link href={`/events/${eventId}`}>
              <Button variant="premium" size="lg" className="mt-6">
                View Event & Register
              </Button>
            </Link>
          </div>
        </PremiumCard>
      </PageTransition>
    );
  }

  const upcomingSessions = sessions.filter((s) => s.status === "UPCOMING");

  // Handler for ping action
  const handlePing = async (userId: string, message?: string) => {
    console.log("[AttendeeEventPage] Ping user:", userId, message);
  };

  // Handler for starting a DM conversation
  const handleStartChat = (userId: string, userName: string) => {
    window.dispatchEvent(
      new CustomEvent("start-dm-chat", { detail: { userId, userName } })
    );
  };

  return (
    <PageTransition className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      {/* Header with Back Button and Suggestions Bell */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/attendee">
          <Button variant="ghost" className="gap-2 hover:-translate-x-1 transition-transform">
            <ArrowLeft className="h-4 w-4" />
            Back to My Events
          </Button>
        </Link>
        <SuggestionsBell
          eventId={eventId}
          onViewProfile={(userId) => {
            // Navigate to user profile
            window.location.href = `/attendee/events/${eventId}/attendees/${userId}`;
          }}
          onStartChat={handleStartChat}
        />
      </div>

      <StaleDataIndicator
        isStale={isStale}
        isOffline={isOffline}
        lastFetched={lastFetched}
        onRefresh={refetch}
        className="mb-4"
      />

      {/* Event Hero Banner */}
      <div className="overflow-hidden rounded-2xl mb-6 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
        <div className="relative h-56 sm:h-64 md:h-72 lg:h-80">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.name}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-primary/5 flex items-center justify-center">
              <CalendarDays className="h-20 w-20 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {event.eventType === "VIRTUAL" && (
                <Badge className="bg-blue-500/90 text-white backdrop-blur-sm border-0 shadow-lg">
                  <Video className="h-3 w-3 mr-1.5" />
                  Virtual Event
                </Badge>
              )}
              {event.eventType === "HYBRID" && (
                <Badge className="bg-purple-500/90 text-white backdrop-blur-sm border-0 shadow-lg">
                  <Video className="h-3 w-3 mr-1.5" />
                  Hybrid Event
                </Badge>
              )}
              {registration.checkedInAt && (
                <Badge className="bg-emerald-500/90 text-white backdrop-blur-sm border-0 shadow-lg">
                  <CheckCircle className="h-3 w-3 mr-1.5" />
                  Checked In
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              {event.name}
            </h1>
            {event.description && (
              <p className="text-white/60 text-sm sm:text-base mt-2 line-clamp-2 max-w-2xl">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="p-4 sm:p-5 md:p-6 bg-background">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StaggerItem className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/25 transition-colors">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 shrink-0">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Date</p>
                <p className="font-semibold text-sm sm:text-base truncate">
                  {format(new Date(event.startDate), "MMM d, yyyy")}
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/25 transition-colors">
              <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Time</p>
                <p className="font-semibold text-sm sm:text-base truncate">
                  {format(new Date(event.startDate), "h:mm a")}
                </p>
              </div>
            </StaggerItem>

            {event.venue ? (
              <StaggerItem className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/25 transition-colors">
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Venue</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{event.venue.name}</p>
                </div>
              </StaggerItem>
            ) : event.eventType === "VIRTUAL" ? (
              <StaggerItem className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/25 transition-colors">
                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 shrink-0">
                  <Video className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Location</p>
                  <p className="font-semibold text-sm sm:text-base truncate">Online Event</p>
                </div>
              </StaggerItem>
            ) : null}

            <StaggerItem className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 hover:border-violet-500/25 transition-colors">
              <div className="p-2 sm:p-2.5 rounded-xl bg-violet-500/10 shrink-0">
                <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Ticket</p>
                <p className="font-mono font-semibold text-sm sm:text-base truncate">{registration.ticketCode}</p>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {registration.checkedInAt && (
            <div className="mt-4 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-4 py-2.5 rounded-xl w-fit">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Checked in at {format(new Date(registration.checkedInAt), "h:mm a")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Expo Hall Quick Access */}
      <Link href={`/attendee/events/${eventId}/expo`}>
        <div className="mb-6 group cursor-pointer rounded-2xl overflow-hidden border border-purple-500/15 hover:border-purple-500/30 bg-gradient-to-r from-purple-500/[0.04] via-pink-500/[0.04] to-orange-500/[0.04] hover:from-purple-500/[0.08] hover:via-pink-500/[0.08] hover:to-orange-500/[0.08] transition-all duration-300 shadow-sm hover:shadow-md">
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20 shrink-0">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  Expo Hall
                  <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] sm:text-xs">
                    Open
                  </Badge>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Explore sponsor booths and connect with exhibitors
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-purple-500 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </div>
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

      {/* People You Should Meet - AI Networking Recommendations */}
      <section className="mb-8">
        <Collapsible defaultOpen={false} className="border border-amber-500/15 rounded-2xl bg-gradient-to-r from-amber-500/[0.03] via-orange-500/[0.03] to-pink-500/[0.03] overflow-hidden">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 sm:p-5 hover:bg-muted/20 transition-colors group">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-sm sm:text-base">People You Should Meet</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] sm:text-xs">
                AI Powered
              </Badge>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4">
              <RecommendationsPanel
                eventId={eventId}
                onStartChat={handleStartChat}
              />
              <div className="text-center pt-2">
                <Link href={`/attendee/events/${eventId}/networking`}>
                  <Button variant="link" className="gap-2 text-amber-600 hover:text-amber-700 text-sm">
                    View All Networking Options
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* Smart Gamification Nudge - contextual prompts above sessions */}
      {activeGamificationSessionId && gamification.isConnected && (
        <SmartNudge
          pollsOpen={liveSessions[0]?.pollsOpen === true}
          qaOpen={liveSessions[0]?.qaOpen === true}
          chatOpen={liveSessions[0]?.chatOpen === true}
          streakExpiring={gamification.streak.active && gamification.streak.count >= 2}
          className="mb-4"
        />
      )}

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
            <StaggerContainer className="space-y-4">
              {liveSessions.map((session) => (
                <StaggerItem key={session.id} id={`session-card-${session.id}`}>
                  <SessionCard session={session} eventId={eventId} eventName={event.name} organizationId={event.organizationId} eventVirtualSettings={event.virtualSettings} userId={user?.id} />
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
            <StaggerContainer className="space-y-4">
              {upcomingSessions.map((session) => (
                <StaggerItem key={session.id} id={`session-card-${session.id}`}>
                  <SessionCard session={session} eventId={eventId} eventName={event.name} organizationId={event.organizationId} eventVirtualSettings={event.virtualSettings} userId={user?.id} />
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
            className="rounded-xl overflow-hidden"
            showSponsorLabel={true}
          />
        )}

        {/* Ended Sessions */}
        {endedSessions.length > 0 && (
          <section>
            <SectionHeader
              title="Past Sessions"
              subtitle="Completed sessions"
              className="mb-4"
            />
            <StaggerContainer className="space-y-4">
              {endedSessions.map((session) => (
                <StaggerItem key={session.id} id={`session-card-${session.id}`} className="opacity-60 hover:opacity-90 transition-opacity">
                  <SessionCard session={session} eventId={eventId} eventName={event.name} organizationId={event.organizationId} eventVirtualSettings={event.virtualSettings} userId={user?.id} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )}

        {sessions.length === 0 && (
          <PremiumCard variant="outline" padding="lg" className="border-dashed text-center rounded-2xl">
            <div className="py-8">
              <div className="p-4 w-fit mx-auto rounded-2xl bg-muted/30 mb-5">
                <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-semibold">No Sessions Yet</h3>
              <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">
                The event schedule hasn't been published yet. Check back later.
              </p>
            </div>
          </PremiumCard>
        )}
      </div>

      {/* Gamification: Floating Score Widget + Hub + Achievement Celebration */}
      {activeGamificationSessionId && gamification.isConnected && (
        <>
          <FloatingScoreWidget
            currentScore={gamification.currentScore}
            currentRank={gamification.currentRank}
            streak={gamification.streak}
            recentPointEvents={gamification.recentPointEvents}
            onOpenHub={() => setGamificationHubOpen(true)}
          />
          <GamificationHub
            open={gamificationHubOpen}
            onOpenChange={setGamificationHubOpen}
            currentScore={gamification.currentScore}
            currentRank={gamification.currentRank}
            streak={gamification.streak}
            achievementProgress={gamification.achievementProgress}
            allAchievements={gamification.allAchievements}
            recentPointEvents={gamification.recentPointEvents}
            leaderboard={gamification.leaderboard}
            teamLeaderboard={gamification.teamLeaderboard}
            currentUserId={gamification.currentUserId}
            getReasonText={gamification.getReasonText}
            getReasonEmoji={gamification.getReasonEmoji}
          />
          <AchievementToast
            achievement={celebratingAchievement}
            onDismiss={() => setCelebratingAchievement(null)}
          />
          <SessionSummary
            open={!!summarySession}
            onClose={() => setSummarySession(null)}
            sessionTitle={summarySession?.title || ""}
            totalPoints={gamification.currentScore}
            rank={gamification.currentRank}
            achievements={gamification.achievements}
            streak={gamification.streak}
            stats={{
              messagesSent: gamification.activityCounts["MESSAGE_SENT"] || 0,
              questionsAsked: gamification.activityCounts["QUESTION_ASKED"] || 0,
              pollsVoted: gamification.activityCounts["POLL_VOTED"] || 0,
            }}
          />
        </>
      )}

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

      {/* Auto-Join Virtual Session View (from deep link) */}
      {autoJoinSession && (
        <VirtualSessionView
          session={{
            id: autoJoinSession.id,
            title: autoJoinSession.title,
            startTime: autoJoinSession.startTime,
            endTime: autoJoinSession.endTime,
            status: autoJoinSession.status,
            sessionType: autoJoinSession.sessionType,
            streamingUrl: autoJoinSession.streamingUrl || event.virtualSettings?.streamingUrl,
            recordingUrl: autoJoinSession.recordingUrl,
            broadcastOnly: autoJoinSession.broadcastOnly,
            chatEnabled: autoJoinSession.chatEnabled,
            qaEnabled: autoJoinSession.qaEnabled,
            pollsEnabled: autoJoinSession.pollsEnabled,
            reactionsEnabled: autoJoinSession.reactionsEnabled,
            chatOpen: autoJoinSession.chatOpen,
            qaOpen: autoJoinSession.qaOpen,
            pollsOpen: autoJoinSession.pollsOpen,
            reactionsOpen: autoJoinSession.reactionsOpen,
            speakers: autoJoinSession.speakers,
            streamingProvider: autoJoinSession.streamingProvider,
            virtualRoomId: autoJoinSession.virtualRoomId,
            isRecordable: autoJoinSession.isRecordable,
            autoCaptions: autoJoinSession.autoCaptions,
            lobbyEnabled: autoJoinSession.lobbyEnabled,
          }}
          eventId={eventId}
          isOpen={showAutoJoinSession}
          onClose={() => setShowAutoJoinSession(false)}
          currentUserId={user?.id}
          lobbyVideoUrl={event.virtualSettings?.lobbyVideoUrl}
        />
      )}
    </PageTransition>
  );
}