"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Clock, Mic } from "lucide-react";
import { AddSessionModal } from "./add-session-modal";

// Define the types for our data
type Speaker = {
  id: string;
  name: string;
};

type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  speakers: Speaker[];
};

interface SessionListProps {
  sessions: Session[];
  eventId: string;
  eventStartDate: string;
  eventEndDate: string;
}

// A small component to render a single session
const SessionItem = ({ session }: { session: Session }) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">{session.title}</h3>
      <div className="text-sm text-muted-foreground mt-2 space-y-2">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>
            {formatTime(session.startTime)} - {formatTime(session.endTime)}
          </span>
        </div>
        {session.speakers.length > 0 && (
          <div className="flex items-center">
            <Mic className="h-4 w-4 mr-2" />
            <span>{session.speakers.map((s) => s.name).join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SessionList = ({ sessions, eventId, eventStartDate, eventEndDate }: SessionListProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <AddSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={eventId}
        eventStartDate={eventStartDate}
        eventEndDate={eventEndDate}
      />
      <Card className="mt-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Agenda / Sessions</CardTitle>
              <CardDescription>
                The schedule of talks and workshops for this event.
              </CardDescription>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              {" "}
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionItem key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No sessions have been added yet.</p>
              <p>Click "Add Session" to build your event's agenda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
