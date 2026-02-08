// src/app/(attendee)/attendee/events/[eventId]/attendees/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_EVENT_ATTENDEES_QUERY } from "@/graphql/registrations.graphql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PageTransition,
  PremiumCard,
} from "@/components/ui/premium-components";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  ArrowLeft,
  Search,
  Users,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type Attendee = {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    imageUrl?: string;
  };
};

export default function AttendeesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading, error } = useQuery(GET_EVENT_ATTENDEES_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  // Handler for starting a DM conversation
  const handleStartChat = (userId: string, userName: string) => {
    window.dispatchEvent(
      new CustomEvent("start-dm-chat", { detail: { userId, userName } })
    );
  };

  // Filter attendees based on search query
  const filteredAttendees = useMemo(() => {
    if (!data?.eventAttendees) return [];

    const attendees = data.eventAttendees.filter((reg: Attendee) => reg.user);

    if (!searchQuery.trim()) return attendees;

    const query = searchQuery.toLowerCase();
    return attendees.filter((attendee: Attendee) => {
      const fullName = `${attendee.user.first_name} ${attendee.user.last_name}`.toLowerCase();
      const email = attendee.user.email.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [data?.eventAttendees, searchQuery]);

  return (
    <PageTransition className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/attendee/events/${eventId}/networking`}>
          <Button variant="ghost" size="sm" className="gap-2 hover:-translate-x-1 transition-transform">
            <ArrowLeft className="h-4 w-4" />
            Back to Networking
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Event Attendees
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse and connect with all attendees at this event
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search attendees by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <PremiumCard variant="outline" padding="lg" className="border-destructive/50 text-center">
          <p className="text-destructive">Failed to load attendees. Please try again.</p>
        </PremiumCard>
      )}

      {/* Attendees Count */}
      {!loading && !error && (
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">
            {filteredAttendees.length} {filteredAttendees.length === 1 ? "attendee" : "attendees"}
          </Badge>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              matching "{searchQuery}"
            </span>
          )}
        </div>
      )}

      {/* Attendees Grid */}
      {!loading && !error && (
        <>
          {filteredAttendees.length === 0 ? (
            <PremiumCard variant="outline" padding="lg" className="text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">No attendees found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "No attendees have registered for this event yet"}
              </p>
            </PremiumCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAttendees.map((attendee: Attendee) => (
                <PremiumCard
                  key={attendee.id}
                  variant="elevated"
                  padding="md"
                  hover="lift"
                  className="cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <UserAvatar
                      firstName={attendee.user.first_name}
                      lastName={attendee.user.last_name}
                      imageUrl={attendee.user.imageUrl}
                      className="h-12 w-12"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {attendee.user.first_name} {attendee.user.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {attendee.user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            handleStartChat(
                              attendee.user.id,
                              `${attendee.user.first_name} ${attendee.user.last_name}`
                            )
                          }
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}
        </>
      )}
    </PageTransition>
  );
}
