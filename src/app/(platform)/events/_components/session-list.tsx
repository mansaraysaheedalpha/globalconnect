"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { format } from "date-fns";
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
import {
  PlusCircle,
  Clock,
  Mic,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddSessionModal } from "./add-session-modal";
import { EditSessionModal } from "./edit-session-modal";
import {
  ARCHIVE_SESSION_MUTATION,
  GET_SESSIONS_BY_EVENT_QUERY,
} from "@/graphql/events.graphql";

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

export const SessionList = ({
  sessions,
  eventId,
  eventStartDate,
  eventEndDate,
}: SessionListProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  const [archiveSession] = useMutation(ARCHIVE_SESSION_MUTATION, {
    onCompleted: () => toast.success("Session deleted."),
    onError: (error) =>
      toast.error("Failed to delete session", { description: error.message }),
    update(cache, { data: { archiveSession } }) {
      const data = cache.readQuery<{ sessionsByEvent: Session[] }>({
        query: GET_SESSIONS_BY_EVENT_QUERY,
        variables: { eventId },
      });
      if (data) {
        cache.writeQuery({
          query: GET_SESSIONS_BY_EVENT_QUERY,
          variables: { eventId },
          data: {
            sessionsByEvent: data.sessionsByEvent.filter(
              (s) => s.id !== archiveSession.id
            ),
          },
        });
      }
    },
  });

  const handleDelete = () => {
    if (sessionToDelete) {
      archiveSession({ variables: { id: sessionToDelete.id } });
      setSessionToDelete(null);
    }
  };

  return (
    <>
      <AddSessionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        eventId={eventId}
        eventStartDate={eventStartDate}
        eventEndDate={eventEndDate}
      />
      {sessionToEdit && (
        <EditSessionModal
          isOpen={!!sessionToEdit}
          onClose={() => setSessionToEdit(null)}
          session={sessionToEdit}
          eventStartDate={eventStartDate}
          eventEndDate={eventEndDate}
        />
      )}

      <Card className="mt-8">
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
                <div
                  key={session.id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{session.title}</h3>
                    <div className="text-sm text-muted-foreground mt-2 space-y-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {format(new Date(session.startTime), "p")} -{" "}
                          {format(new Date(session.endTime), "p")}
                        </span>
                      </div>
                      {session.speakers.length > 0 && (
                        <div className="flex items-center">
                          <Mic className="h-4 w-4 mr-2" />
                          <span>
                            {session.speakers.map((s) => s.name).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onSelect={() => setSessionToEdit(session)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setSessionToDelete(session)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
