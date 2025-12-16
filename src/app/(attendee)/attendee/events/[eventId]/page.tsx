// src/app/(attendee)/attendee/events/[eventId]/page.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_ATTENDEE_EVENT_DETAILS_QUERY } from "@/graphql/attendee.graphql";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
} from "lucide-react";
import { format, isWithinInterval, isFuture } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { SessionChat } from "@/app/(platform)/dashboard/events/[eventId]/_components/session-chat";
import { SessionQA } from "@/app/(platform)/dashboard/events/[eventId]/_components/session-qa";
import { SessionPolls } from "@/app/(platform)/dashboard/events/[eventId]/_components/session-polls";

type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "LIVE" | "ENDED";
  chatEnabled?: boolean;
  qaEnabled?: boolean;
  pollsEnabled?: boolean;
  chatOpen?: boolean;  // Runtime state: organizer controls when chat is open
  qaOpen?: boolean;    // Runtime state: organizer controls when Q&A is open
  pollsOpen?: boolean; // Runtime state: organizer controls when polls are open
  speakers: { id: string; name: string }[];
};

type Registration = {
  id: string;
  status: string;
  ticketCode: string;
  checkedInAt: string | null;
};

type Event = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  imageUrl: string | null;
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

const SessionCard = ({ session, eventId }: { session: Session; eventId: string }) => {
  const isLive = session.status === "LIVE";
  const isEnded = session.status === "ENDED";

  // Check if features are enabled (default to true for backwards compatibility)
  const chatEnabled = session.chatEnabled !== false;
  const qaEnabled = session.qaEnabled !== false;
  const pollsEnabled = session.pollsEnabled !== false;
  const hasInteractiveFeatures = chatEnabled || qaEnabled || pollsEnabled;

  // Local state for live status tracking (updated via WebSocket events from child components)
  const [liveChatOpen, setLiveChatOpen] = React.useState(session.chatOpen ?? false);
  const [liveQaOpen, setLiveQaOpen] = React.useState(session.qaOpen ?? false);
  const [livePollsOpen, setLivePollsOpen] = React.useState(session.pollsOpen ?? false);

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

  return (
    <Card className={`overflow-hidden transition-all ${isLive ? "ring-2 ring-green-500/20" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getSessionStatusBadge(session.status)}
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
          </div>

          {/* Chat & Q&A Buttons - show if features are enabled (not ended sessions) */}
          {!isEnded && hasInteractiveFeatures && (
            <div className="flex flex-col gap-2">
              {/* Session Chat */}
              {chatEnabled && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 ${!liveChatOpen ? "opacity-60" : ""}`}
                    >
                      {liveChatOpen ? (
                        <Unlock className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-lg p-0">
                    <SheetHeader className="px-6 pt-6 pb-2">
                      <SheetTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          {session.title} - Chat
                        </div>
                        <Badge variant={liveChatOpen ? "default" : "secondary"} className={liveChatOpen ? "bg-green-500/10 text-green-600" : ""}>
                          {liveChatOpen ? "Open" : "Closed"}
                        </Badge>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="h-[calc(100vh-100px)]">
                      <SessionChat
                        sessionId={session.id}
                        eventId={eventId}
                        className="h-full border-0 shadow-none rounded-none"
                        initialChatOpen={liveChatOpen}
                        onStatusChange={setLiveChatOpen}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {/* Session Q&A */}
              {qaEnabled && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 ${!liveQaOpen ? "opacity-60" : ""}`}
                    >
                      {liveQaOpen ? (
                        <Unlock className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <HelpCircle className="h-4 w-4" />
                      Q&A
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-lg p-0">
                    <SheetHeader className="px-6 pt-6 pb-2">
                      <SheetTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-5 w-5" />
                          {session.title} - Q&A
                        </div>
                        <Badge variant={liveQaOpen ? "default" : "secondary"} className={liveQaOpen ? "bg-green-500/10 text-green-600" : ""}>
                          {liveQaOpen ? "Open" : "Closed"}
                        </Badge>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="h-[calc(100vh-100px)]">
                      <SessionQA
                        sessionId={session.id}
                        eventId={eventId}
                        isOrganizer={false}
                        isSpeaker={false}
                        className="h-full border-0 shadow-none rounded-none"
                        initialQaOpen={liveQaOpen}
                        onStatusChange={setLiveQaOpen}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {/* Session Polls */}
              {pollsEnabled && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 ${!livePollsOpen ? "opacity-60" : ""}`}
                    >
                      {livePollsOpen ? (
                        <Unlock className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <BarChart3 className="h-4 w-4" />
                      Polls
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-lg p-0">
                    <SheetHeader className="px-6 pt-6 pb-2">
                      <SheetTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          {session.title} - Polls
                        </div>
                        <Badge variant={livePollsOpen ? "default" : "secondary"} className={livePollsOpen ? "bg-green-500/10 text-green-600" : ""}>
                          {livePollsOpen ? "Open" : "Closed"}
                        </Badge>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="h-[calc(100vh-100px)]">
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
                  </SheetContent>
                </Sheet>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function AttendeeEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const { data, loading, error } = useQuery(GET_ATTENDEE_EVENT_DETAILS_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.event) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Link href="/attendee">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to My Events
          </Button>
        </Link>
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive font-semibold">Event Not Found</p>
            <p className="text-sm text-muted-foreground mt-1">
              This event may not exist or you don't have access to it.
            </p>
          </CardContent>
        </Card>
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
      <div className="p-6 max-w-5xl mx-auto">
        <Link href="/attendee">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to My Events
          </Button>
        </Link>
        <Card className="border-yellow-500/50">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <p className="font-semibold">Not Registered</p>
            <p className="text-sm text-muted-foreground mt-1">
              You need to register for this event to access its features.
            </p>
            <Link href={`/events/${eventId}`}>
              <Button className="mt-4">View Event & Register</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link href="/attendee">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to My Events
        </Button>
      </Link>

      {/* Event Header */}
      <Card className="overflow-hidden mb-6">
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
            <h1 className="text-2xl md:text-3xl font-bold text-white">{event.name}</h1>
          </div>
        </div>

        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {format(new Date(event.startDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">
                  {format(new Date(event.startDate), "h:mm a")}
                </p>
              </div>
            </div>

            {event.venue && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="font-medium">{event.venue.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Ticket</p>
                <p className="font-mono font-medium">{registration.ticketCode}</p>
              </div>
            </div>
          </div>

          {registration.checkedInAt && (
            <div className="mt-4 flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                Checked in at {format(new Date(registration.checkedInAt), "h:mm a")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions */}
      <div className="space-y-6">
        {/* Live Sessions */}
        {liveSessions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live Now
            </h2>
            <div className="space-y-3">
              {liveSessions.map((session) => (
                <SessionCard key={session.id} session={session} eventId={eventId} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} eventId={eventId} />
              ))}
            </div>
          </section>
        )}

        {/* Ended Sessions */}
        {endedSessions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
              Past Sessions
            </h2>
            <div className="space-y-3 opacity-60">
              {endedSessions.map((session) => (
                <SessionCard key={session.id} session={session} eventId={eventId} />
              ))}
            </div>
          </section>
        )}

        {sessions.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">No Sessions Yet</h3>
              <p className="text-muted-foreground mt-2">
                The event schedule hasn't been published yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
