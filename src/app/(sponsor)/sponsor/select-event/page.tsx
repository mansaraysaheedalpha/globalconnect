// src/app/(sponsor)/sponsor/select-event/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, ChevronRight, AlertCircle, Users } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

interface Sponsor {
  id: string;
  company_name: string;
  company_logo_url?: string;
  event_id: string;
  tier_id?: string;
}

interface Event {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  location?: string;
}

interface SponsorWithEvent extends Sponsor {
  event?: Event;
  role?: string;
}

export default function SelectEventPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { setActiveSponsor, setSponsors, activeSponsorId } = useSponsorStore();

  const [sponsorsWithEvents, setSponsorsWithEvents] = useState<SponsorWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchSponsorsAndEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch sponsors the user represents
        const sponsorsRes = await fetch(`${API_BASE_URL}/sponsors/my-sponsors`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!sponsorsRes.ok) {
          throw new Error("Failed to fetch sponsors");
        }

        const sponsorsData: Sponsor[] = await sponsorsRes.json();

        // If user only has one sponsor, redirect directly to dashboard
        if (sponsorsData.length === 1) {
          const sponsor = sponsorsData[0];
          setActiveSponsor(sponsor.id, sponsor.event_id, sponsor.company_name, null);
          setSponsors(sponsorsData.map(s => ({
            id: s.id,
            eventId: s.event_id,
            companyName: s.company_name,
            companyLogoUrl: s.company_logo_url,
            role: null,
          })));
          router.push("/sponsor");
          return;
        }

        // If no sponsors, show empty state
        if (sponsorsData.length === 0) {
          setSponsorsWithEvents([]);
          setIsLoading(false);
          return;
        }

        // Fetch event details for each sponsor (in parallel)
        const uniqueEventIds = [...new Set(sponsorsData.map(s => s.event_id))];
        const eventPromises = uniqueEventIds.map(async (eventId) => {
          try {
            const eventRes = await fetch(`${API_BASE_URL}/events/${eventId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            if (eventRes.ok) {
              return await eventRes.json() as Event;
            }
          } catch {
            // Event fetch failed, continue without event details
          }
          return null;
        });

        const events = await Promise.all(eventPromises);
        const eventMap = new Map<string, Event>();
        events.forEach((event, index) => {
          if (event) {
            eventMap.set(uniqueEventIds[index], event);
          }
        });

        // Combine sponsors with event data
        const combined: SponsorWithEvent[] = sponsorsData.map(sponsor => ({
          ...sponsor,
          event: eventMap.get(sponsor.event_id),
        }));

        setSponsorsWithEvents(combined);
        setSponsors(sponsorsData.map(s => ({
          id: s.id,
          eventId: s.event_id,
          companyName: s.company_name,
          companyLogoUrl: s.company_logo_url,
          role: null,
        })));
      } catch (err) {
        console.error("Error fetching sponsors:", err);
        setError(err instanceof Error ? err.message : "Failed to load sponsors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsorsAndEvents();
  }, [token, router, setActiveSponsor, setSponsors]);

  const handleSelectSponsor = (sponsor: SponsorWithEvent) => {
    setActiveSponsor(sponsor.id, sponsor.event_id, sponsor.company_name, sponsor.role || null);
    router.push("/sponsor");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-destructive/50 bg-destructive/10">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <p className="font-medium text-destructive">Error loading events</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 py-6">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no sponsors
  if (sponsorsWithEvents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Events</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              You are not currently representing any sponsors. Please accept a sponsor invitation to access event dashboards.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Select Event</h1>
          <p className="text-muted-foreground mt-1">
            Choose which event you want to manage as a sponsor
          </p>
        </div>

        {/* Sponsor/Event List */}
        <div className="space-y-4">
          {sponsorsWithEvents.map((sponsor) => (
            <Card
              key={sponsor.id}
              className={`cursor-pointer hover:shadow-md transition-all hover:border-primary/50 ${
                activeSponsorId === sponsor.id ? "border-primary ring-1 ring-primary" : ""
              }`}
              onClick={() => handleSelectSponsor(sponsor)}
            >
              <CardContent className="flex items-center gap-4 py-6">
                {/* Company Logo or Placeholder */}
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {sponsor.company_logo_url ? (
                    <img
                      src={sponsor.company_logo_url}
                      alt={sponsor.company_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {sponsor.company_name}
                  </h3>
                  {sponsor.event ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="truncate">{sponsor.event.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      Event details loading...
                    </p>
                  )}
                  {sponsor.event?.start_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(sponsor.event.start_date)}
                      {sponsor.event.end_date && ` - ${formatDate(sponsor.event.end_date)}`}
                    </p>
                  )}
                </div>

                {/* Role Badge & Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  {sponsor.role && (
                    <Badge variant="secondary" className="capitalize">
                      {sponsor.role}
                    </Badge>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          You can switch between events anytime from the sponsor dashboard
        </p>
      </div>
    </div>
  );
}
