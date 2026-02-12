// src/app/(platform)/dashboard/events/[eventId]/_components/session-list.tsx
"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddSessionModal } from "../../_components/add-session-modal";
import { EditSessionModal } from "../../_components/edit-session-modal";
import { UploadPresentationModal } from "./upload-presentation-modal";
import { PresentationViewer } from "./presentation-viewer";
import { SessionItem } from "./session-item";
import {
  ARCHIVE_SESSION_MUTATION,
  GET_SESSIONS_BY_EVENT_QUERY,
} from "@/graphql/events.graphql";
import { PlusCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

type Speaker = { id: string; name: string; userId?: string | null };
type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  chatEnabled?: boolean;
  qaEnabled?: boolean;
  maxParticipants?: number | null;
  rsvpCount?: number;
  rsvpAvailableSpots?: number | null;
  isSessionFull?: boolean;
  speakers: Speaker[];
};
type Event = {
  id: string;
  organizationId: string;
  startDate: string;
  endDate: string;
};

interface SessionListProps {
  sessions: Session[];
  event: Event;
  refetchSessions: () => void;
}

export const SessionList = ({
  sessions,
  event,
  refetchSessions,
}: SessionListProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [sessionForUpload, setSessionForUpload] = useState<Session | null>(
    null
  );
  const [sessionToView, setSessionToView] = useState<Session | null>(null);

  // Get current user ID to check if they are a speaker for the session
  const { user } = useAuthStore();

  // Check if current user is a speaker for the session being viewed
  const isCurrentUserSpeaker = sessionToView?.speakers?.some(
    (speaker) => speaker.userId && speaker.userId === user?.id
  ) ?? false;

  const [archiveSession] = useMutation(ARCHIVE_SESSION_MUTATION, {
    refetchQueries: [
      { query: GET_SESSIONS_BY_EVENT_QUERY, variables: { eventId: event.id } },
    ],
    onCompleted: () => toast.success("Session deleted."),
    onError: (error) =>
      toast.error("Failed to delete session", { description: error.message }),
  });

  const handleDelete = () => {
    if (sessionToDelete) {
      archiveSession({ variables: { id: sessionToDelete.id } });
      setSessionToDelete(null);
    }
  };

  const handleOpenUploadModal = (session: Session) => {
    setSessionForUpload(session);
    setIsUploadModalOpen(true);
  };

  const handleOpenViewer = (session: Session) => {
    setSessionToView(session);
    setIsViewerOpen(true);
  };

  return (
    <>
      <AddSessionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        eventId={event.id}
        eventStartDate={event.startDate}
        eventEndDate={event.endDate}
      />
      {sessionToEdit && (
        <EditSessionModal
          isOpen={!!sessionToEdit}
          onClose={() => setSessionToEdit(null)}
          session={sessionToEdit}
          eventId={event.id}
          eventStartDate={event.startDate}
          eventEndDate={event.endDate}
        />
      )}
      {sessionForUpload && event && (
        <UploadPresentationModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadComplete={() => {
            // The SessionItem will handle its own state update.
            // We can close the modal and optionally refetch all sessions
            // if we want other data to be updated, but for now it's not strictly needed.
            setIsUploadModalOpen(false);
          }}
          event={event}
          session={sessionForUpload}
        />
      )}
      {sessionToView && event && (
        <PresentationViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          event={event}
          session={sessionToView}
          canPresent={isCurrentUserSpeaker}
        />
      )}

      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Agenda / Sessions</CardTitle>
              <CardDescription>
                The schedule of talks and workshops for this event.
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  event={event}
                  onEdit={() => setSessionToEdit(session)}
                  onDelete={() => setSessionToDelete(session)}
                  onUpload={handleOpenUploadModal}
                  onView={handleOpenViewer}
                />
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

      <AlertDialog
        open={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the session "{sessionToDelete?.title}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
