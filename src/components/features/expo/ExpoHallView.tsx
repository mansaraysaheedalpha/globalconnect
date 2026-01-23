// src/components/features/expo/ExpoHallView.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Loader2, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useExpo } from "@/hooks/use-expo";
import { useAuthStore } from "@/store/auth.store";
import { ExpoBooth } from "./types";
import { ExpoHallGrid } from "./ExpoHallGrid";
import { ExpoBoothView } from "./ExpoBoothView";
import { LeadFormData } from "./LeadCaptureForm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ExpoHallViewProps {
  eventId: string;
  className?: string;
}

export function ExpoHallView({ eventId, className }: ExpoHallViewProps) {
  const [selectedBooth, setSelectedBooth] = useState<ExpoBooth | null>(null);
  const [isRequestingVideo, setIsRequestingVideo] = useState(false);
  const { token } = useAuthStore();

  const {
    hall,
    booths,
    currentBooth,
    videoSession,
    isConnected,
    isLoading,
    error,
    categories,
    enterHall,
    enterBooth,
    leaveBooth,
    requestVideoCall,
    cancelVideoRequest,
    endVideoCall,
    trackResourceDownload,
    trackCtaClick,
    captureLead,
    clearError,
  } = useExpo({ eventId });

  // Get user info from auth store
  const { user } = useAuthStore();

  // Enter hall on mount
  useEffect(() => {
    if (isConnected && !hall) {
      enterHall();
    }
  }, [isConnected, hall, enterHall]);

  // Handle booth selection
  const handleBoothClick = useCallback(
    async (booth: ExpoBooth) => {
      setSelectedBooth(booth);
      await enterBooth(booth.id);
    },
    [enterBooth]
  );

  // Handle booth close
  const handleBoothClose = useCallback(async () => {
    if (currentBooth) {
      await leaveBooth();
    }
    setSelectedBooth(null);
  }, [currentBooth, leaveBooth]);

  // Handle video request
  const handleRequestVideo = useCallback(async () => {
    if (!selectedBooth) return;
    setIsRequestingVideo(true);
    try {
      await requestVideoCall(selectedBooth.id);
    } finally {
      setIsRequestingVideo(false);
    }
  }, [selectedBooth, requestVideoCall]);

  // Handle video cancel
  const handleCancelVideo = useCallback(async () => {
    await cancelVideoRequest();
  }, [cancelVideoRequest]);

  // Handle video end
  const handleEndVideo = useCallback(async () => {
    await endVideoCall();
  }, [endVideoCall]);

  // Handle resource download
  const handleResourceDownload = useCallback(
    (resourceId: string) => {
      if (selectedBooth) {
        trackResourceDownload(selectedBooth.id, resourceId);
      }
    },
    [selectedBooth, trackResourceDownload]
  );

  // Handle CTA click
  const handleCtaClick = useCallback(
    (ctaId: string) => {
      if (selectedBooth) {
        trackCtaClick(selectedBooth.id, ctaId);
      }
    },
    [selectedBooth, trackCtaClick]
  );

  // Handle lead capture
  const handleLeadCapture = useCallback(
    async (formData: LeadFormData): Promise<boolean> => {
      if (!selectedBooth) return false;
      return captureLead(selectedBooth.id, formData as unknown as Record<string, unknown>);
    },
    [selectedBooth, captureLead]
  );

  // Get presigned download URL for S3 resources
  const getDownloadUrl = useCallback(
    async (resourceUrl: string, filename: string): Promise<string> => {
      if (!token) {
        return resourceUrl; // Fall back to direct URL if no token
      }

      const response = await fetch(
        `${API_BASE_URL}/sponsors/booth-resources/download-url?resource_url=${encodeURIComponent(resourceUrl)}&filename=${encodeURIComponent(filename)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to get download URL");
        return resourceUrl; // Fall back to direct URL on error
      }

      const data = await response.json();
      return data.download_url;
    },
    [token]
  );

  // Loading state
  if (!isConnected || isLoading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[400px]",
          className
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {!isConnected ? "Connecting to expo hall..." : "Loading expo hall..."}
        </p>
      </div>
    );
  }

  // Error state
  if (error && !hall) {
    return (
      <div className={cn("p-6", className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load expo hall</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearError();
                enterHall();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No hall found
  if (!hall) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[400px] text-center",
          className
        )}
      >
        <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Expo Hall Found</h2>
        <p className="text-muted-foreground max-w-md">
          This event doesn&apos;t have an expo hall set up yet. Check back later or
          contact the event organizer.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Hall header */}
      <div className="relative">
        {/* Banner */}
        {hall.bannerUrl && (
          <div className="h-32 sm:h-48 relative">
            <Image
              src={hall.bannerUrl}
              alt={hall.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}

        {/* Hall info */}
        <div
          className={cn(
            "px-6 py-4",
            hall.bannerUrl ? "-mt-16 relative" : "border-b"
          )}
        >
          <h1 className="text-2xl font-bold">{hall.name}</h1>
          {hall.description && (
            <p className="text-muted-foreground mt-1 max-w-2xl">
              {hall.description}
            </p>
          )}
          {hall.welcomeMessage && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              {hall.welcomeMessage}
            </p>
          )}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="px-6 py-2">
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Booth grid */}
      <div className="flex-1 min-h-0">
        <ExpoHallGrid
          booths={booths}
          categories={categories}
          onBoothClick={handleBoothClick}
          selectedBoothId={selectedBooth?.id}
        />
      </div>

      {/* Booth detail view */}
      {selectedBooth && (
        <ExpoBoothView
          booth={selectedBooth}
          eventId={eventId}
          videoSession={videoSession}
          isOpen={!!selectedBooth}
          onClose={handleBoothClose}
          onRequestVideo={handleRequestVideo}
          onCancelVideoRequest={handleCancelVideo}
          onEndVideoCall={handleEndVideo}
          onResourceDownload={handleResourceDownload}
          onCtaClick={handleCtaClick}
          onLeadCapture={handleLeadCapture}
          isRequestingVideo={isRequestingVideo}
          userName={user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.email || "Attendee"}
          getDownloadUrl={getDownloadUrl}
        />
      )}
    </div>
  );
}
