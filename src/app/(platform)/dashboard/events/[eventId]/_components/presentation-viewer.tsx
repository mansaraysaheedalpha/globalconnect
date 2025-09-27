// src/app/(platform)/dashboard/events/[eventId]/_components/presentation-viewer.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader, AlertTriangle } from "lucide-react";
import Image from "next/image";

type Presentation = {
  id: string;
  session_id: string;
  slide_urls: string[];
};

interface PresentationViewerProps {
  isOpen: boolean;
  onClose: () => void;
  event: { id: string; organizationId: string };
  session: { id: string; title: string };
}

export const PresentationViewer = ({
  isOpen,
  onClose,
  event,
  session,
}: PresentationViewerProps) => {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { token } = useAuthStore();

  const fetchPresentation = useCallback(async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/organizations/${event.organizationId}/events/${event.id}/sessions/${session.id}/presentation`;
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPresentation(data);
        setError(null);
        return true; // Indicates success
      }
      if (response.status === 404) {
        return false; // Indicates still processing
      }
      throw new Error(
        `Failed to fetch presentation. Status: ${response.status}`
      );
    } catch (err: any) {
      setError(err.message);
      toast.error("Error", { description: err.message });
      return true; // Stop polling on error
    }
  }, [event, session, token]);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);
    setPresentation(null);
    setCurrentSlide(0);

    const poll = async () => {
      const isReady = await fetchPresentation();
      if (isReady) {
        setIsLoading(false);
      }
    };

    poll(); // Initial fetch

    const intervalId = setInterval(async () => {
      if (presentation || error) {
        clearInterval(intervalId);
        return;
      }
      const isReady = await fetchPresentation();
      if (isReady) {
        setIsLoading(false);
        clearInterval(intervalId);
      }
    }, 5000); // Poll every 5 seconds

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (!presentation && !error) {
        setError(
          "Polling timed out. The presentation may have failed to process."
        );
        setIsLoading(false);
      }
    }, 120000); // 2-minute timeout

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isOpen, fetchPresentation, presentation, error]);

  const goToNextSlide = () => {
    if (presentation) {
      setCurrentSlide((prev) =>
        Math.min(prev + 1, presentation.slide_urls.length - 1)
      );
    }
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading presentation...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-destructive">
          <AlertTriangle className="h-8 w-8" />
          <p className="mt-4 font-semibold">An error occurred</p>
          <p className="text-sm text-center">{error}</p>
        </div>
      );
    }

    if (presentation && presentation.slide_urls.length > 0) {
      return (
        <div className="space-y-4">
          <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden">
            <Image
              src={presentation.slide_urls[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={goToPrevSlide}
              disabled={currentSlide === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Slide {currentSlide + 1} of {presentation.slide_urls.length}
            </span>
            <Button
              variant="outline"
              onClick={goToNextSlide}
              disabled={currentSlide === presentation.slide_urls.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      );
    }

    if (presentation && presentation.slide_urls.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="mt-4 text-muted-foreground">
            The presentation has no slides.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Presentation</DialogTitle>
          <DialogDescription>Session: {session.title}</DialogDescription>
        </DialogHeader>
        <div className="py-4">{renderContent()}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
