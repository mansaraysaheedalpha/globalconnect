// src/app/(platform)/dashboard/events/[eventId]/_components/session-item.tsx
"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PresentationStatus, PresentationState } from "./presentation-status";
import { ClockIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { useAuthStore } from "@/store/auth.store";

type Speaker = { id: string; name: string };
type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
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

  // Connect to the WebSocket server
  const socket = useSocket("/events");

  useEffect(() => {
    if (!socket) return;

    // Listener for real-time status updates
    const onStatusUpdate = (data: {
      sessionId: string;
      status: PresentationState;
    }) => {
      if (data.sessionId === session.id) {
        setPresentationState(data.status);
      }
    };

    socket.on("presentation.status.update", onStatusUpdate);

    // Initial status check (in case the page is loaded after processing is complete)
    const checkInitialStatus = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/organizations/${event.organizationId}/events/${event.id}/sessions/${session.id}/presentation`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPresentationState(data.status);
        } else if (response.status === 404) {
          setPresentationState("absent");
        } else {
          setPresentationState("failed");
        }
      } catch {
        setPresentationState("failed");
      }
    };

    checkInitialStatus();

    // Cleanup listener on component unmount
    return () => {
      socket.off("presentation.status.update", onStatusUpdate);
    };
  }, [socket, session.id, event.organizationId, event.id]);

  const handleUpload = () => {
    onUpload(session);
    setPresentationState("processing");
  };

  return (
    <div className="p-4 border rounded-lg flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-foreground">{session.title}</h3>
        <div className="text-sm text-muted-foreground mt-2 space-y-2">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>
              {format(new Date(session.startTime), "p")} -{" "}
              {format(new Date(session.endTime), "p")}
            </span>
          </div>
          {session.speakers.length > 0 && (
            <div className="flex items-center">
              <MicrophoneIcon className="h-4 w-4 mr-2" />
              <span>{session.speakers.map((s) => s.name).join(", ")}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PresentationStatus
          status={presentationState}
          onUpload={handleUpload}
          onView={() => onView(session)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
