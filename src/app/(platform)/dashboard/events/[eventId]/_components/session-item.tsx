// src/app/(platform)/dashboard/events/[eventId]/_components/session-item.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  const { token } = useAuthStore();

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
