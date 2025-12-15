// src/app/(public)/events/[eventId]/_components/session-timeline.tsx
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Mic2,
  FileText,
  Calendar,
} from "lucide-react";

type Speaker = { name: string };
type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  speakers: Speaker[];
  presentation?: string;
};

interface SessionTimelineProps {
  sessions: Session[];
}

export const SessionTimeline = ({ sessions }: SessionTimelineProps) => {
  if (sessions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            Agenda Coming Soon
          </h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            The full agenda has not been published yet. Check back soon for session details!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => {
        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);
        const duration = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60)
        );

        return (
          <Card
            key={session.id}
            className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30"
          >
            <CardContent className="p-0">
              <div className="flex">
                {/* Time Column */}
                <div className="flex-shrink-0 w-24 md:w-32 bg-muted/30 p-4 flex flex-col items-center justify-center border-r">
                  <p className="text-lg md:text-xl font-bold text-foreground">
                    {format(startTime, "h:mm")}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase">
                    {format(startTime, "a")}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {duration} min
                  </Badge>
                </div>

                {/* Content Column */}
                <div className="flex-1 p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {session.title}
                      </h3>

                      {session.speakers.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                          <Mic2 className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">
                            {session.speakers.map((s) => s.name).join(", ")}
                          </span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(startTime, "p")} - {format(endTime, "p")}
                        </span>
                      </div>
                    </div>

                    {/* Session Number Badge */}
                    <div className="flex-shrink-0 hidden md:flex h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {session.presentation && (
                    <div className="mt-4 pt-4 border-t">
                      <a
                        href={session.presentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        View Presentation
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
