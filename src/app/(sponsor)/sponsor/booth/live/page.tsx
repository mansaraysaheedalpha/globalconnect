// src/app/(sponsor)/sponsor/booth/live/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";
import { SponsorDashboard } from "@/components/features/expo/SponsorDashboard";

const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";
const REALTIME_API_URL = process.env.NEXT_PUBLIC_REALTIME_SERVICE_URL || "http://localhost:3002";

interface ExpoBooth {
  id: string;
  name: string;
  boothNumber: string;
  expoHall?: {
    id: string;
    eventId: string;
    name: string;
  };
}

export default function BoothLivePage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { activeSponsorId, activeSponsorName, clearSponsorContext } = useSponsorStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expoBooth, setExpoBooth] = useState<ExpoBooth | null>(null);

  // Fetch expo booth data
  useEffect(() => {
    if (!token || !activeSponsorId) return;

    const fetchBoothData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try to get booth data
        let boothRes = await fetch(
          `${REALTIME_API_URL}/api/expo/sponsor/${activeSponsorId}/booth`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // If we get 403, try to self-repair booth access and retry
        if (boothRes.status === 403) {
          console.log("Got 403 on booth fetch, attempting to sync booth access...");
          const syncRes = await fetch(
            `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/sync-my-booth-access`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (syncRes.ok) {
            console.log("Booth access synced, retrying booth fetch...");
            boothRes = await fetch(
              `${REALTIME_API_URL}/api/expo/sponsor/${activeSponsorId}/booth`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
          }
        }

        if (!boothRes.ok) {
          if (boothRes.status === 404) {
            throw new Error("No expo booth found for this sponsor. The event organizer needs to set up the Expo Hall first.");
          }
          throw new Error("Failed to load booth data");
        }

        const boothData = await boothRes.json();
        setExpoBooth(boothData.booth);
      } catch (err) {
        console.error("Error fetching booth data:", err);
        setError(err instanceof Error ? err.message : "Failed to load booth data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoothData();
  }, [token, activeSponsorId]);

  // No sponsor selected
  if (!activeSponsorId && !isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center mb-4">
              Please select a sponsor event to manage your live booth.
            </p>
            <Button onClick={() => router.push("/sponsor/select-event")}>
              Select Sponsor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const handleSelectNewSponsor = () => {
      clearSponsorContext();
      router.push("/sponsor/select-event");
    };

    return (
      <div className="p-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sponsor/booth">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Booth Settings
            </Link>
          </Button>
        </div>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Unable to load live booth</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSelectNewSponsor}
              >
                Select Sponsor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No expo booth
  if (!expoBooth) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sponsor/booth">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Booth Settings
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Expo Booth Available</h3>
            <p className="text-sm text-muted-foreground max-w-md text-center mb-4">
              Your expo booth hasn&apos;t been set up yet. The event organizer needs to
              create the Expo Hall for this event. Once it&apos;s ready, you&apos;ll be
              able to manage your booth in real-time here.
            </p>
            <Button variant="outline" asChild>
              <Link href="/sponsor/booth">Go to Booth Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No expo hall / event ID
  if (!expoBooth.expoHall?.eventId) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sponsor/booth">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Booth Settings
            </Link>
          </Button>
        </div>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-700">Booth Not Ready</p>
              <p className="text-sm text-muted-foreground">
                The expo hall configuration is incomplete. Please contact the event organizer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the sponsor dashboard with all required props
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <SponsorDashboard
        boothId={expoBooth.id}
        boothName={expoBooth.name || activeSponsorName || "Sponsor Booth"}
        eventId={expoBooth.expoHall.eventId}
        className="flex-1"
      />
    </div>
  );
}
