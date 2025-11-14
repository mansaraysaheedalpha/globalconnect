// src/app/(platform)/dashboard/events/[eventId]/_components/presentation-viewer.tsx
"use client";

import { useEffect, useState } from "react";
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
import { FullScreenViewer } from "./full-screen-view";
import { useSocket } from "@/hooks/use-socket";
import { v4 as uuidv4 } from "uuid";

type Presentation = {
  id: string;
  session_id: string;
  slide_urls: string[];
  status: "processing" | "ready" | "failed";
};

type PresentationStatus = {
  isActive: boolean;
  currentSlide: number;
  totalSlides: number;
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
  const [presentationStatus, setPresentationStatus] =
    useState<PresentationStatus | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { token } = useAuthStore();
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleSlideUpdate = (data: { currentSlide: number }) => {
      setCurrentSlide(data.currentSlide);
    };

    socket.emit("session.join", { sessionId: session.id });
    socket.emit(
      "content.request_state",
      { sessionId: session.id },
      (response: { success: boolean; state: PresentationStatus }) => {
        if (response.success && response.state) {
          setPresentationStatus(response.state);
          setCurrentSlide(response.state.currentSlide);
        }
      }
    );

    socket.on("slide.update", handleSlideUpdate);

    return () => {
      socket.emit("session.leave", { sessionId: session.id });
      socket.off("slide.update", handleSlideUpdate);
    };
  }, [socket, isOpen, session.id]);

  useEffect(() => {
    if (!isOpen || !token) return;

    const fetchPresentationData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/organizations/${event.organizationId}/events/${event.id}/sessions/${session.id}/presentation`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === "ready") {
            setPresentation(data);
          } else {
            setError(`Presentation is not ready. Status: ${data.status}`);
          }
        } else {
          setError("Could not load presentation data.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresentationData();
  }, [isOpen, event.id, event.organizationId, session.id, token]);

  const handleStartPresentation = () => {
    if (socket) {
      socket.emit(
        "content.control",
        {
          action: "START",
          sessionId: session.id,
          idempotencyKey: uuidv4(),
        },
        (response: {
          success: boolean;
          error?: string;
          newState?: PresentationStatus;
        }) => {
          if (response.success && response.newState) {
            setPresentationStatus(response.newState);
            setCurrentSlide(response.newState.currentSlide);
            toast.success("Presentation started!");
          } else {
            toast.error("Failed to start presentation.", {
              description: response.error,
            });
          }
        }
      );
    }
  };

  const handleSlideControl = (action: "NEXT_SLIDE" | "PREV_SLIDE") => {
    if (socket) {
      const payload = {
        action,
        sessionId: session.id,
        idempotencyKey: uuidv4(),
      };
      socket.emit(
        "content.control",
        payload,
        (response: { success: boolean; error?: string }) => {
          if (!response.success) {
            toast.error("Failed to change slide", {
              description: response.error,
            });
          }
        }
      );
    }
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

    if (presentation && !presentationStatus?.isActive) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg font-medium mb-4">
            The presentation is ready to begin.
          </p>
          <Button onClick={handleStartPresentation}>Start Presentation</Button>
          <p className="text-sm text-muted-foreground mt-2">
            (This will synchronize the view for all attendees)
          </p>
        </div>
      );
    }

    if (presentation && presentationStatus?.isActive) {
      return (
        <div className="space-y-4">
          <div
            className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden cursor-zoom-in"
            onClick={() => setIsFullScreen(true)}
          >
            <Image
              src={presentation.slide_urls[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => handleSlideControl("PREV_SLIDE")}
              disabled={currentSlide === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Slide {currentSlide + 1} of {presentation.slide_urls.length}
            </span>
            <Button
              variant="outline"
              onClick={() => handleSlideControl("NEXT_SLIDE")}
              disabled={currentSlide === presentation.slide_urls.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">No presentation loaded.</p>
      </div>
    );
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
        {presentation && (
          <FullScreenViewer
            isOpen={isFullScreen}
            onClose={() => setIsFullScreen(false)}
            src={presentation.slide_urls[currentSlide]}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
