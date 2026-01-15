// src/components/features/networking/events-with-connections.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import {
  Connection,
  ConnectionStrength,
  getOtherUser,
  formatUserName,
  getUserInitials,
  getStrengthColor,
  getStrengthBgColor,
} from "@/types/connection";
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface EventInfo {
  id: string;
  name: string;
  date: string;
  location?: string;
  imageUrl?: string;
}

interface EventWithConnections {
  event: EventInfo;
  connections: Connection[];
  strongCount: number;
  moderateCount: number;
  weakCount: number;
}

interface EventsWithConnectionsProps {
  eventsWithConnections: EventWithConnections[];
  currentUserId: string;
  onViewEvent: (eventId: string) => void;
  onViewConnection: (connectionId: string) => void;
  isLoading?: boolean;
}

export function EventsWithConnections({
  eventsWithConnections,
  currentUserId,
  onViewEvent,
  onViewConnection,
  isLoading = false,
}: EventsWithConnectionsProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6" />
        </CardContent>
      </Card>
    );
  }

  if (eventsWithConnections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-blue-100 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">
            Start Building Your Network
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-4">
            Attend events and connect with other attendees to see your network
            grow across different events.
          </p>
          <Button>
            Browse Events
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Sort events by number of connections (descending)
  const sortedEvents = [...eventsWithConnections].sort(
    (a, b) => b.connections.length - a.connections.length
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Your Events & Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedEvents.map((eventData) => (
          <EventCard
            key={eventData.event.id}
            eventData={eventData}
            currentUserId={currentUserId}
            isExpanded={expandedEvent === eventData.event.id}
            onToggleExpand={() =>
              setExpandedEvent(
                expandedEvent === eventData.event.id
                  ? null
                  : eventData.event.id
              )
            }
            onViewEvent={() => onViewEvent(eventData.event.id)}
            onViewConnection={onViewConnection}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface EventCardProps {
  eventData: EventWithConnections;
  currentUserId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onViewEvent: () => void;
  onViewConnection: (connectionId: string) => void;
}

function EventCard({
  eventData,
  currentUserId,
  isExpanded,
  onToggleExpand,
  onViewEvent,
  onViewConnection,
}: EventCardProps) {
  const { event, connections, strongCount, moderateCount, weakCount } =
    eventData;

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Event Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.name}
              className="h-14 w-14 rounded-lg object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-semibold">{event.name}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatEventDate(event.date)}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection strength summary */}
          <div className="flex items-center gap-2">
            {strongCount > 0 && (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-600 border-green-200"
              >
                {strongCount} strong
              </Badge>
            )}
            {moderateCount > 0 && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-600 border-yellow-200"
              >
                {moderateCount} growing
              </Badge>
            )}
            {weakCount > 0 && (
              <Badge variant="outline" className="bg-gray-100 text-gray-600">
                {weakCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{connections.length}</span>
          </div>

          <ChevronRight
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded Connections List */}
      {isExpanded && (
        <div className="border-t bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Connections from this event
            </p>
            <Button variant="link" size="sm" onClick={onViewEvent}>
              View Event
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {connections.slice(0, 6).map((connection) => {
              const otherUser = getOtherUser(connection, currentUserId);
              return (
                <div
                  key={connection.id}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg border cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onViewConnection(connection.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser.avatarUrl || undefined} />
                    <AvatarFallback>{getUserInitials(otherUser)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {formatUserName(otherUser)}
                    </p>
                    <StrengthIndicator strength={connection.strength} />
                  </div>
                </div>
              );
            })}
          </div>

          {connections.length > 6 && (
            <Button
              variant="ghost"
              className="w-full mt-3"
              size="sm"
              onClick={onViewEvent}
            >
              View all {connections.length} connections from this event
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function StrengthIndicator({ strength }: { strength: ConnectionStrength }) {
  const bars = strength === "STRONG" ? 3 : strength === "MODERATE" ? 2 : 1;
  const colorClass = getStrengthColor(strength);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className={`h-2 w-1.5 rounded-full ${
            bar <= bars ? getStrengthBgColor(strength) : "bg-gray-200"
          } ${bar <= bars ? colorClass.replace("text-", "bg-") : ""}`}
          style={{
            backgroundColor:
              bar <= bars
                ? strength === "STRONG"
                  ? "#22c55e"
                  : strength === "MODERATE"
                    ? "#eab308"
                    : "#6b7280"
                : undefined,
          }}
        />
      ))}
    </div>
  );
}

export default EventsWithConnections;
