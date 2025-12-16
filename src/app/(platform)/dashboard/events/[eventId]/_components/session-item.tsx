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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { MoreVertical, Edit, Trash2, Clock as ClockIcon, Mic2 as MicrophoneIcon, MessageSquare, HelpCircle, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { TOGGLE_SESSION_CHAT_MUTATION, TOGGLE_SESSION_QA_MUTATION, TOGGLE_SESSION_POLLS_MUTATION } from "@/graphql/events.graphql";
import { cn } from "@/lib/utils";

type Speaker = { id: string; name: string };
type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  chatEnabled?: boolean;
  qaEnabled?: boolean;
  pollsEnabled?: boolean;
  chatOpen?: boolean;
  qaOpen?: boolean;
  pollsOpen?: boolean;
  speakers: Speaker[];
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
  const { token } = useAuthStore();

  // Local state for chat/QA/polls open status (tracks server state with optimistic updates)
  const [isChatOpen, setIsChatOpen] = useState(session.chatOpen ?? false);
  const [isQaOpen, setIsQaOpen] = useState(session.qaOpen ?? false);
  const [isPollsOpen, setIsPollsOpen] = useState(session.pollsOpen ?? false);

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

  // Toggle mutations
  const [toggleChat, { loading: togglingChat }] = useMutation(TOGGLE_SESSION_CHAT_MUTATION, {
    onError: (error) => {
      console.error("[SessionItem] Failed to toggle chat:", error);
      // Rollback optimistic update
      setIsChatOpen(session.chatOpen ?? false);
    },
  });

  const [toggleQa, { loading: togglingQa }] = useMutation(TOGGLE_SESSION_QA_MUTATION, {
    onError: (error) => {
      console.error("[SessionItem] Failed to toggle Q&A:", error);
      // Rollback optimistic update
      setIsQaOpen(session.qaOpen ?? false);
    },
  });

  const [togglePolls, { loading: togglingPolls }] = useMutation(TOGGLE_SESSION_POLLS_MUTATION, {
    onError: (error) => {
      console.error("[SessionItem] Failed to toggle Polls:", error);
      // Rollback optimistic update
      setIsPollsOpen(session.pollsOpen ?? false);
    },
  });

  const handleToggleChat = async () => {
    const newState = !isChatOpen;
    // Optimistic update
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
    // Optimistic update
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
    // Optimistic update
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

  const checkPresentationStatus = useCallback(async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/organizations/${event.organizationId}/events/${event.id}/sessions/${session.id}/presentation`;
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
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/organizations/${event.organizationId}/events/${event.id}/sessions/${session.id}/presentation`;
        try {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            setPresentationState("ready");
            if (intervalId) clearInterval(intervalId);
            if (timeoutId) clearTimeout(timeoutId);
          }
          // If 404, we're still processing, so we do nothing and wait for the next interval.
        } catch (error) {
          console.error("Polling for presentation status failed:", error);
          setPresentationState("failed");
          if (intervalId) clearInterval(intervalId);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }, 5000); // Poll every 5 seconds

      timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        // If we're still processing after the timeout, mark as failed.
        setPresentationState((current) =>
          current === "processing" ? "failed" : current
        );
      }, 120000); // 2-minute timeout
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
    // Optimistically update the UI to show processing
    setPresentationState("processing");
  };

  // Check if features are enabled (default to true for backwards compatibility)
  const chatEnabled = session.chatEnabled !== false;
  const qaEnabled = session.qaEnabled !== false;
  const pollsEnabled = session.pollsEnabled !== false;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-4 sm:p-5">
          {/* Header: Title + Dropdown */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground leading-tight">
                {session.title}
              </h3>
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

            {/* Interactive Features Toolbar */}
            {(chatEnabled || qaEnabled || pollsEnabled) && (
              <TooltipProvider delayDuration={0}>
                <div className="flex items-center rounded-lg border bg-muted/30 p-1 gap-1">
                  {/* Chat Button */}
                  {chatEnabled && (
                    <Sheet>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SheetTrigger asChild>
                            <Button
                              variant={isChatOpen ? "default" : "ghost"}
                              size="sm"
                              className={cn(
                                "h-8 px-2 sm:px-3 gap-1.5 transition-colors",
                                isChatOpen && "bg-green-600 hover:bg-green-700 text-white"
                              )}
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span className="hidden sm:inline text-xs">Chat</span>
                              {isChatOpen && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-pulse" />
                              )}
                            </Button>
                          </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="sm:hidden">
                          <p>Chat {isChatOpen ? "(Open)" : "(Closed)"}</p>
                        </TooltipContent>
                      </Tooltip>
                      <SheetContent className="w-full sm:max-w-lg p-0">
                        <SheetHeader className="px-6 pt-6 pb-2 border-b">
                          <SheetTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-5 w-5" />
                              <span className="truncate">{session.title} - Chat</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={isChatOpen ? "default" : "secondary"} className={cn(isChatOpen && "bg-green-600")}>
                                {isChatOpen ? "Open" : "Closed"}
                              </Badge>
                              <Switch
                                checked={isChatOpen}
                                onCheckedChange={handleToggleChat}
                                disabled={togglingChat}
                                aria-label="Toggle chat"
                              />
                            </div>
                          </SheetTitle>
                        </SheetHeader>
                        <div className="h-[calc(100vh-100px)]">
                          <SessionChat
                            sessionId={session.id}
                            eventId={event.id}
                            className="h-full border-0 shadow-none rounded-none"
                            initialChatOpen={isChatOpen}
                            isOrganizer={true}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}

                  {/* Q&A Button */}
                  {qaEnabled && (
                    <Sheet>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SheetTrigger asChild>
                            <Button
                              variant={isQaOpen ? "default" : "ghost"}
                              size="sm"
                              className={cn(
                                "h-8 px-2 sm:px-3 gap-1.5 transition-colors",
                                isQaOpen && "bg-green-600 hover:bg-green-700 text-white"
                              )}
                            >
                              <HelpCircle className="h-4 w-4" />
                              <span className="hidden sm:inline text-xs">Q&A</span>
                              {isQaOpen && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-pulse" />
                              )}
                            </Button>
                          </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="sm:hidden">
                          <p>Q&A {isQaOpen ? "(Open)" : "(Closed)"}</p>
                        </TooltipContent>
                      </Tooltip>
                      <SheetContent className="w-full sm:max-w-lg p-0">
                        <SheetHeader className="px-6 pt-6 pb-2 border-b">
                          <SheetTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="h-5 w-5" />
                              <span className="truncate">{session.title} - Q&A</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={isQaOpen ? "default" : "secondary"} className={cn(isQaOpen && "bg-green-600")}>
                                {isQaOpen ? "Open" : "Closed"}
                              </Badge>
                              <Switch
                                checked={isQaOpen}
                                onCheckedChange={handleToggleQa}
                                disabled={togglingQa}
                                aria-label="Toggle Q&A"
                              />
                            </div>
                          </SheetTitle>
                        </SheetHeader>
                        <div className="h-[calc(100vh-100px)]">
                          <SessionQA
                            sessionId={session.id}
                            eventId={event.id}
                            isOrganizer={true}
                            isSpeaker={false}
                            className="h-full border-0 shadow-none rounded-none"
                            initialQaOpen={isQaOpen}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}

                  {/* Polls Button */}
                  {pollsEnabled && (
                    <Sheet>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SheetTrigger asChild>
                            <Button
                              variant={isPollsOpen ? "default" : "ghost"}
                              size="sm"
                              className={cn(
                                "h-8 px-2 sm:px-3 gap-1.5 transition-colors",
                                isPollsOpen && "bg-green-600 hover:bg-green-700 text-white"
                              )}
                            >
                              <BarChart3 className="h-4 w-4" />
                              <span className="hidden sm:inline text-xs">Polls</span>
                              {isPollsOpen && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-pulse" />
                              )}
                            </Button>
                          </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="sm:hidden">
                          <p>Polls {isPollsOpen ? "(Open)" : "(Closed)"}</p>
                        </TooltipContent>
                      </Tooltip>
                      <SheetContent className="w-full sm:max-w-lg p-0">
                        <SheetHeader className="px-6 pt-6 pb-2 border-b">
                          <SheetTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              <span className="truncate">{session.title} - Polls</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={isPollsOpen ? "default" : "secondary"} className={cn(isPollsOpen && "bg-green-600")}>
                                {isPollsOpen ? "Open" : "Closed"}
                              </Badge>
                              <Switch
                                checked={isPollsOpen}
                                onCheckedChange={handleTogglePolls}
                                disabled={togglingPolls}
                                aria-label="Toggle Polls"
                              />
                            </div>
                          </SheetTitle>
                        </SheetHeader>
                        <div className="h-[calc(100vh-100px)]">
                          <SessionPolls
                            sessionId={session.id}
                            eventId={event.id}
                            isOrganizer={true}
                            isSpeaker={false}
                            className="h-full border-0 shadow-none rounded-none"
                            initialPollsOpen={isPollsOpen}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
