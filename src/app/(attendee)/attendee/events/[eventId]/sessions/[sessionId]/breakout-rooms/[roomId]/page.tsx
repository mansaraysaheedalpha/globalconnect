// src/app/(attendee)/attendee/events/[eventId]/sessions/[sessionId]/breakout-rooms/[roomId]/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { BreakoutRoomView } from "@/components/features/breakout/BreakoutRoomView";
import { Loader2 } from "lucide-react";

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      firstName
      lastName
      email
    }
  }
`;

export default function AttendeeBreakoutRoomPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const sessionId = params.sessionId as string;
  const roomId = params.roomId as string;

  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const user = userData?.me;
  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email || "Participant";

  return (
    <BreakoutRoomView
      roomId={roomId}
      eventId={eventId}
      sessionId={sessionId}
      userId={user?.id || ""}
      userName={userName}
      isOrganizer={false}
    />
  );
}
