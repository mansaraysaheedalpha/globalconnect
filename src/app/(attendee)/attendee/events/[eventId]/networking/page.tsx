// src/app/(attendee)/attendee/events/[eventId]/networking/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  PageTransition,
  PremiumCard,
} from "@/components/ui/premium-components";
import { RecommendationsPanel } from "@/components/features/recommendations";
import { ProximityContainer } from "@/components/features/proximity";
import { SuggestionsBell } from "@/components/features/suggestions";
import { ConnectionsList } from "@/components/features/networking/connections-list";
import {
  ArrowLeft,
  Sparkles,
  Users,
  MapPin,
  Loader2,
} from "lucide-react";

export default function NetworkingPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [activeTab, setActiveTab] = useState("recommended");

  // Handler for ping action (via proximity service)
  const handlePing = async (userId: string, message?: string) => {
    // This would integrate with the proximity ping API
    console.log("[Networking] Ping user:", userId, message);
  };

  // Handler for starting a DM conversation
  const handleStartChat = (userId: string, userName: string) => {
    // Dispatch custom event to open DM with this user
    window.dispatchEvent(
      new CustomEvent("start-dm-chat", { detail: { userId, userName } })
    );
  };

  // Handler for viewing a user profile
  const handleViewProfile = (userId: string) => {
    // Navigate to user profile or open modal
    router.push(`/attendee/events/${eventId}/attendees/${userId}`);
  };

  return (
    <PageTransition className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/attendee/events/${eventId}`}>
            <Button variant="ghost" size="sm" className="gap-2 hover:-translate-x-1 transition-transform">
              <ArrowLeft className="h-4 w-4" />
              Back to Event
            </Button>
          </Link>
        </div>
        <SuggestionsBell
          eventId={eventId}
          onViewProfile={handleViewProfile}
          onStartChat={handleStartChat}
        />
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Networking Hub
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover connections and grow your professional network
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger
            value="recommended"
            className="flex items-center gap-2 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI Recommended</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger
            value="connections"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">My Connections</span>
            <span className="sm:hidden">Connections</span>
          </TabsTrigger>
          <TabsTrigger
            value="nearby"
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Nearby</span>
            <span className="sm:hidden">Nearby</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Recommended Tab */}
        <TabsContent value="recommended" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
              <span className="text-sm text-muted-foreground">
                Personalized matches based on your profile
              </span>
            </div>
          </div>
          <RecommendationsPanel
            eventId={eventId}
            onPing={handlePing}
            onStartChat={handleStartChat}
          />
        </TabsContent>

        {/* My Connections Tab */}
        <TabsContent value="connections" className="mt-6">
          <ConnectionsList
            eventId={eventId}
            onMessage={handleStartChat}
            onViewProfile={handleViewProfile}
            onSwitchToRecommended={() => setActiveTab("recommended")}
          />
        </TabsContent>

        {/* Nearby Tab */}
        <TabsContent value="nearby" className="mt-6">
          <NearbySection
            eventId={eventId}
            onStartChat={handleStartChat}
          />
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}

/**
 * Nearby attendees section using proximity features.
 */
function NearbySection({
  eventId,
  onStartChat,
}: {
  eventId: string;
  onStartChat: (userId: string, userName: string) => void;
}) {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  const enableLocation = async () => {
    setIsEnabling(true);
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" });
      if (permission.state === "granted" || permission.state === "prompt") {
        navigator.geolocation.getCurrentPosition(
          () => setLocationEnabled(true),
          () => setLocationEnabled(false)
        );
      }
    } catch {
      // Fallback for browsers that don't support permissions API
      navigator.geolocation.getCurrentPosition(
        () => setLocationEnabled(true),
        () => setLocationEnabled(false)
      );
    } finally {
      setIsEnabling(false);
    }
  };

  if (!locationEnabled) {
    return (
      <PremiumCard variant="outline" padding="lg" className="text-center">
        <div className="p-4 w-fit mx-auto rounded-full bg-blue-500/10 mb-4">
          <MapPin className="h-10 w-10 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold">Discover Nearby Attendees</h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Enable location services to see other attendees near you
          and start meaningful conversations.
        </p>
        <Button
          variant="premium"
          className="mt-6 gap-2"
          onClick={enableLocation}
          disabled={isEnabling}
        >
          {isEnabling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enabling...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              Enable Location
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Your location is only shared while you're on this page
        </p>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
          <MapPin className="h-3 w-3 mr-1" />
          Location Active
        </Badge>
        <span className="text-sm text-muted-foreground">
          Showing attendees within 50 meters
        </span>
      </div>

      {/* Proximity container - embedded in the networking page */}
      <div className="relative min-h-[300px]">
        <ProximityContainer
          eventId={eventId}
          position="bottom-right"
          className="!static !bottom-auto !right-auto"
          onStartChat={onStartChat}
        />
      </div>
    </div>
  );
}
