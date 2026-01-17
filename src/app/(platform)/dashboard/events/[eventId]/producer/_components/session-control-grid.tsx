// src/app/(platform)/dashboard/events/[eventId]/producer/_components/session-control-grid.tsx
"use client";

import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TOGGLE_SESSION_CHAT_MUTATION,
  TOGGLE_SESSION_QA_MUTATION,
  TOGGLE_SESSION_POLLS_MUTATION,
} from "@/graphql/events.graphql";
import { GET_VIRTUAL_ATTENDANCE_STATS_QUERY } from "@/graphql/attendee.graphql";
import {
  Radio,
  Clock,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Users,
  Eye,
  Video,
  DoorOpen,
  ExternalLink,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status?: string;
  chatEnabled?: boolean;
  qaEnabled?: boolean;
  pollsEnabled?: boolean;
  chatOpen?: boolean;
  qaOpen?: boolean;
  pollsOpen?: boolean;
  sessionType?: string;
  streamingUrl?: string;
  greenRoomEnabled?: boolean;
  greenRoomOpensMinutesBefore?: number;
  greenRoomNotes?: string;
  greenRoomOpen?: boolean;
  speakers: { id: string; name: string; userId?: string }[];
};

interface SessionControlGridProps {
  sessions: Session[];
  eventId: string;
  liveSessions: Session[];
  upcomingSessions: Session[];
  endedSessions: Session[];
}

const SessionCard = ({ session, eventId }: { session: Session; eventId: string }) => {
  const now = new Date();
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  const isLive = now >= start && now <= end;
  const isUpcoming = start > now;
  const isEnded = end < now;

  // Local state for toggles
  const [chatOpen, setChatOpen] = React.useState(session.chatOpen ?? false);
  const [qaOpen, setQaOpen] = React.useState(session.qaOpen ?? false);
  const [pollsOpen, setPollsOpen] = React.useState(session.pollsOpen ?? false);

  // Sync with props
  React.useEffect(() => setChatOpen(session.chatOpen ?? false), [session.chatOpen]);
  React.useEffect(() => setQaOpen(session.qaOpen ?? false), [session.qaOpen]);
  React.useEffect(() => setPollsOpen(session.pollsOpen ?? false), [session.pollsOpen]);

  // Fetch virtual attendance stats
  const { data: statsData } = useQuery(GET_VIRTUAL_ATTENDANCE_STATS_QUERY, {
    variables: { sessionId: session.id },
    pollInterval: 15000, // Poll every 15 seconds
    skip: !isLive,
  });
  const currentViewers = statsData?.virtualAttendanceStats?.currentViewers ?? 0;

  // Mutations
  const [toggleChat, { loading: togglingChat }] = useMutation(TOGGLE_SESSION_CHAT_MUTATION);
  const [toggleQA, { loading: togglingQA }] = useMutation(TOGGLE_SESSION_QA_MUTATION);
  const [togglePolls, { loading: togglingPolls }] = useMutation(TOGGLE_SESSION_POLLS_MUTATION);

  const handleToggleChat = async (open: boolean) => {
    setChatOpen(open);
    try {
      await toggleChat({ variables: { id: session.id, open } });
    } catch (e) {
      setChatOpen(!open); // Revert on error
    }
  };

  const handleToggleQA = async (open: boolean) => {
    setQaOpen(open);
    try {
      await toggleQA({ variables: { id: session.id, open } });
    } catch (e) {
      setQaOpen(!open);
    }
  };

  const handleTogglePolls = async (open: boolean) => {
    setPollsOpen(open);
    try {
      await togglePolls({ variables: { id: session.id, open } });
    } catch (e) {
      setPollsOpen(!open);
    }
  };

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <Badge className="bg-green-500 text-white">
          <Radio className="h-3 w-3 mr-1 animate-pulse" />
          LIVE
        </Badge>
      );
    }
    if (isUpcoming) {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Upcoming
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Ended
      </Badge>
    );
  };

  const getSessionTypeBadge = () => {
    if (!session.sessionType) return null;
    const styles: Record<string, string> = {
      MAINSTAGE: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      BREAKOUT: "bg-green-500/10 text-green-600 border-green-500/20",
      WORKSHOP: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      NETWORKING: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      EXPO: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    };
    return (
      <Badge variant="outline" className={styles[session.sessionType] || ""}>
        {session.sessionType.charAt(0) + session.sessionType.slice(1).toLowerCase()}
      </Badge>
    );
  };

  return (
    <Card className={cn(
      "transition-all",
      isLive && "border-green-500/50 shadow-green-500/10 shadow-lg"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">{session.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {format(start, "h:mm a")} - {format(end, "h:mm a")}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getStatusBadge()}
            {getSessionTypeBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Viewer Count (for live sessions) */}
        {isLive && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Current Viewers</span>
            </div>
            <span className="text-xl font-bold text-green-600">{currentViewers}</span>
          </div>
        )}

        {/* Virtual indicator */}
        {session.streamingUrl && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4" />
            <span className="truncate">{session.streamingUrl}</span>
          </div>
        )}

        {/* Green Room Status */}
        {session.greenRoomEnabled !== false && (
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            session.greenRoomOpen
              ? "bg-amber-500/10 border-amber-500/20"
              : "bg-muted/50 border-muted"
          )}>
            <div className="flex items-center gap-2">
              <DoorOpen className={cn(
                "h-4 w-4",
                session.greenRoomOpen ? "text-amber-600" : "text-muted-foreground"
              )} />
              <div>
                <span className={cn(
                  "text-sm font-medium",
                  session.greenRoomOpen ? "text-amber-700" : "text-muted-foreground"
                )}>
                  Green Room
                </span>
                <p className="text-xs text-muted-foreground">
                  Opens {session.greenRoomOpensMinutesBefore || 15}min before
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={session.greenRoomOpen ? "default" : "secondary"} className={cn(
                session.greenRoomOpen && "bg-amber-500"
              )}>
                {session.greenRoomOpen ? "Open" : "Closed"}
              </Badge>
              <Link href={`/dashboard/events/${eventId}/sessions/${session.id}/green-room`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Controls */}
        <div className="space-y-3 pt-2 border-t">
          <TooltipProvider delayDuration={0}>
            {/* Chat Toggle */}
            {session.chatEnabled !== false && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className={cn("h-4 w-4", chatOpen ? "text-green-500" : "text-muted-foreground")} />
                  <Label htmlFor={`chat-${session.id}`} className="text-sm cursor-pointer">
                    Chat
                  </Label>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Switch
                        id={`chat-${session.id}`}
                        checked={chatOpen}
                        onCheckedChange={handleToggleChat}
                        disabled={togglingChat}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {chatOpen ? "Close chat" : "Open chat"}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Q&A Toggle */}
            {session.qaEnabled !== false && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className={cn("h-4 w-4", qaOpen ? "text-blue-500" : "text-muted-foreground")} />
                  <Label htmlFor={`qa-${session.id}`} className="text-sm cursor-pointer">
                    Q&A
                  </Label>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Switch
                        id={`qa-${session.id}`}
                        checked={qaOpen}
                        onCheckedChange={handleToggleQA}
                        disabled={togglingQA}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {qaOpen ? "Close Q&A" : "Open Q&A"}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Polls Toggle */}
            {session.pollsEnabled !== false && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className={cn("h-4 w-4", pollsOpen ? "text-orange-500" : "text-muted-foreground")} />
                  <Label htmlFor={`polls-${session.id}`} className="text-sm cursor-pointer">
                    Polls
                  </Label>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Switch
                        id={`polls-${session.id}`}
                        checked={pollsOpen}
                        onCheckedChange={handleTogglePolls}
                        disabled={togglingPolls}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {pollsOpen ? "Close polls" : "Open polls"}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </TooltipProvider>
        </div>

        {/* Speakers */}
        {session.speakers.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate">
              {session.speakers.map(s => s.name).join(", ")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const SessionControlGrid = ({
  sessions,
  eventId,
  liveSessions,
  upcomingSessions,
  endedSessions,
}: SessionControlGridProps) => {
  return (
    <div className="space-y-6">
      {/* Live Sessions */}
      {liveSessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-green-500 animate-pulse" />
            <h2 className="text-lg font-semibold">Live Now ({liveSessions.length})</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveSessions.map((session) => (
              <SessionCard key={session.id} session={session} eventId={eventId} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Upcoming ({upcomingSessions.length})</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} eventId={eventId} />
            ))}
          </div>
        </div>
      )}

      {/* Ended Sessions */}
      {endedSessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Completed ({endedSessions.length})</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {endedSessions.map((session) => (
              <SessionCard key={session.id} session={session} eventId={eventId} />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Monitor className="h-12 w-12 mb-4 opacity-50" />
            <p>No sessions found for this event.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
