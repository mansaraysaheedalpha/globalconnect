// src/app/(platform)/dashboard/events/[eventId]/_components/event-history-timeline.tsx
"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Clock as ClockIcon } from "lucide-react";
import { GET_EVENT_HISTORY_QUERY } from "@/graphql/events.graphql";

interface DomainEvent {
  id: string;
  eventType: string;
  timestamp: string;
  data: string | null; // Data is a JSON string
}

interface EventHistoryTimelineProps {
  eventId: string;
}

const formatEventData = (event: DomainEvent): string => {
  try {
    const data = event.data ? JSON.parse(event.data) : {};
    switch (event.eventType) {
      case "EventCreated":
        return `Event created with name "${data.name}".`;
      case "EventRenamed":
        return `Name changed from "${data.old_name}" to "${data.new_name}".`;
      case "EventDescriptionChanged":
        return `Description was updated.`;
      case "EventPublished":
        return `Event was published.`;
      case "EventArchived":
        return `Event was archived.`;
      case "SessionAdded":
        return `Session "${data.title}" was added.`;
      default:
        return `Action: ${event.eventType}`;
    }
  } catch (e) {
    return `An action of type '${event.eventType}' was performed.`;
  }
};

export const EventHistoryTimeline = ({
  eventId,
}: EventHistoryTimelineProps) => {
  const { data, loading, error } = useQuery(GET_EVENT_HISTORY_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive text-center py-8">
        Error loading event history.
      </p>
    );
  }

  const history: DomainEvent[] = data?.eventHistory || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <div className="space-y-8">
            {history.map((item) => (
              <div key={item.id} className="relative flex gap-x-4">
                <div className="absolute left-0 top-0 flex w-12 justify-center -bottom-8">
                  <div className="w-px bg-border"></div>
                </div>
                <div className="relative flex h-12 w-12 flex-none items-center justify-center bg-card rounded-full shadow-sm ring-1 ring-border">
                  <ClockIcon
                    className="h-6 w-6 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <div className="pb-8 pt-1.5">
                  <h3 className="font-semibold text-foreground">
                    {item.eventType}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {format(new Date(item.timestamp), "MMMM d, yyyy 'at' p")}
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {formatEventData(item)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No history found for this event.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
