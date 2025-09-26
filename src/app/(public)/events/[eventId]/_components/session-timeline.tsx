// src/app/(public)/events/[eventId]/_components/session-timeline.tsx
import { format } from "date-fns";
import { ClockIcon, MicrophoneIcon } from "@heroicons/react/24/outline";

type Speaker = { name: string };
type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  speakers: Speaker[];
};

interface SessionTimelineProps {
  sessions: Session[];
}

export const SessionTimeline = ({ sessions }: SessionTimelineProps) => {
  if (sessions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground border rounded-lg">
        The full agenda has not been published yet. Check back soon!
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sessions.map((session) => (
        <div key={session.id} className="relative flex gap-x-4">
          <div className="absolute left-0 top-0 flex w-12 justify-center -bottom-8">
            <div className="w-px bg-border"></div>
          </div>
          <div className="relative flex h-12 w-12 flex-none items-center justify-center bg-card rounded-full shadow-sm ring-1 ring-border">
            <ClockIcon className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div className="pb-8 pt-1.5">
            <p className="text-sm text-muted-foreground">
              {format(new Date(session.startTime), "p")} -{" "}
              {format(new Date(session.endTime), "p")}
            </p>
            <h3 className="text-lg font-semibold text-foreground">
              {session.title}
            </h3>
            {session.speakers.length > 0 && (
              <div className="mt-2 flex items-center text-muted-foreground">
                <MicrophoneIcon className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {session.speakers.map((s) => s.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
