// src/app/(platform)/dashboard/events/[eventId]/_components/presentation-viewer.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Radio,
  StopCircle,
  Users,
} from "lucide-react";
import { usePresentationControl } from "@/hooks/use-presentation-control";

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
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const { token } = useAuthStore();

  // Live presentation control hook (only active when in live mode)
  const {
    isConnected: liveConnected,
    isJoined: liveJoined,
    slideState: liveSlideState,
    nextSlide: liveNextSlide,
    prevSlide: livePrevSlide,
    goToSlide: liveGoToSlide,
    startPresentation,
    stopPresentation,
  } = usePresentationControl(session.id, event.id, isLiveMode);

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 5));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const resetZoom = () => setZoom(1);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);
  const fitToWidth = () => setZoom(1); // Reset to fit width

  // Toggle live presentation mode
  const toggleLiveMode = async () => {
    if (isLiveMode) {
      // Stop live presentation
      await stopPresentation();
      setIsLiveMode(false);
      toast.success("Live presentation ended", {
        description: "Attendees will no longer see slide updates",
      });
    } else {
      // Start live presentation
      setIsLiveMode(true);

      // Debug: Log connection state (using warn to appear in production)
      console.warn("[PresentationViewer] Starting live mode...", {
        liveConnected,
        liveJoined,
        sessionId: session.id,
        eventId: event.id,
      });

      // Wait for connection and state sync then start
      setTimeout(async () => {
        console.warn("[PresentationViewer] After timeout - attempting startPresentation", {
          liveConnected,
          liveJoined,
        });

        const result = await startPresentation();

        console.warn("[PresentationViewer] startPresentation result:", result);

        if (result.success) {
          toast.success("Live presentation started!", {
            description: "Attendees can now see your slides in real-time",
          });
        } else {
          toast.error("Failed to start live presentation", {
            description: result.error || "Please try again",
          });
          // Revert live mode if start failed
          setIsLiveMode(false);
        }
      }, 1500); // Increased timeout to ensure state sync
    }
  };

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
        if (data.status === "failed") {
          setError(
            "The presentation failed to process. Please try uploading again."
          );
          return true; // Stop polling
        }
        if (data.status === "ready") {
          return true; // Stop polling, it's ready
        }
        // If status is 'processing', we continue polling
        return false;
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
    setZoom(1);
    setIsFullscreen(false);

    let isCancelled = false;

    const pollForPresentation = async () => {
      if (isCancelled) return;

      const isReady = await fetchPresentation();

      if (isCancelled) return;

      if (isReady) {
        setIsLoading(false);
      } else {
        // If not ready, wait and try again
        setTimeout(pollForPresentation, 5000);
      }
    };

    pollForPresentation();

    // Cleanup function
    return () => {
      isCancelled = true;
    };
  }, [isOpen, fetchPresentation]);

  const goToNextSlide = useCallback(async () => {
    if (presentation) {
      const newSlide = Math.min(currentSlide + 1, presentation.slide_urls.length - 1);
      setCurrentSlide(newSlide);

      // Broadcast to attendees if in live mode
      if (isLiveMode && liveJoined) {
        await liveNextSlide();
      }
    }
  }, [presentation, currentSlide, isLiveMode, liveJoined, liveNextSlide]);

  const goToPrevSlide = useCallback(async () => {
    const newSlide = Math.max(currentSlide - 1, 0);
    setCurrentSlide(newSlide);

    // Broadcast to attendees if in live mode
    if (isLiveMode && liveJoined) {
      await livePrevSlide();
    }
  }, [currentSlide, isLiveMode, liveJoined, livePrevSlide]);

  // Go to specific slide (with live broadcast)
  const goToSpecificSlide = useCallback(async (slideIndex: number) => {
    setCurrentSlide(slideIndex);

    // Broadcast to attendees if in live mode (slide numbers are 1-indexed for backend)
    if (isLiveMode && liveJoined) {
      await liveGoToSlide(slideIndex + 1);
    }
  }, [isLiveMode, liveJoined, liveGoToSlide]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || isLoading || !presentation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          goToNextSlide();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goToPrevSlide();
          break;
        case "Escape":
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          e.preventDefault();
          resetZoom();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, presentation, isFullscreen, goToNextSlide, goToPrevSlide]);

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
        <div className="flex flex-col h-full overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between py-1.5 md:py-2 px-2 border-b bg-muted/30 rounded-t-lg flex-shrink-0">
            {/* Zoom controls - hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                disabled={zoom <= 0.25}
                title="Zoom out (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-14 text-center font-mono">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                disabled={zoom >= 5}
                title="Zoom in (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetZoom}
                title="Fit to screen (0)"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Center: Slide counter & Live status */}
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm font-medium">
                Slide {currentSlide + 1} of {presentation.slide_urls.length}
              </span>
              {isLiveMode && (
                <Badge variant="default" className="bg-red-600 hover:bg-red-600 gap-1 md:gap-1.5 animate-pulse text-xs">
                  <Radio className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  LIVE
                </Badge>
              )}
            </div>

            {/* Right: Live toggle & Fullscreen */}
            <div className="flex items-center gap-1">
              <Button
                variant={isLiveMode ? "destructive" : "default"}
                size="sm"
                onClick={toggleLiveMode}
                title={isLiveMode ? "Stop live presentation" : "Start live presentation"}
                className="gap-1 md:gap-1.5 text-xs md:text-sm h-7 md:h-8 px-2 md:px-3"
              >
                {isLiveMode ? (
                  <>
                    <StopCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">End Live</span>
                  </>
                ) : (
                  <>
                    <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Present Live</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                title="Toggle fullscreen (F)"
                className="h-7 md:h-8 w-7 md:w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Slide Container */}
          <div className="flex-1 relative bg-white dark:bg-neutral-800 md:bg-neutral-900 overflow-auto min-h-0 flex">
            {/* Left Arrow - Sticky */}
            <div className="sticky left-0 top-0 h-full flex items-center z-10 flex-shrink-0">
              <button
                onClick={goToPrevSlide}
                disabled={currentSlide === 0}
                className="m-1 md:m-2 p-1.5 md:p-3 rounded-full bg-black/40 md:bg-black/60 hover:bg-black/80 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                title="Previous slide (Left Arrow)"
              >
                <ChevronLeft className="h-5 w-5 md:h-8 md:w-8" />
              </button>
            </div>

            {/* Scrollable Slide Area */}
            <div className="flex-1 overflow-auto">
              <div
                className="flex items-center justify-center p-1 md:p-4"
                style={{
                  minWidth: "100%",
                  minHeight: "100%",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={presentation.slide_urls[currentSlide]}
                  alt={`Slide ${currentSlide + 1}`}
                  className="object-contain transition-all duration-200 shadow-lg md:shadow-2xl"
                  style={{
                    width: zoom === 1 ? "auto" : `${zoom * 100}%`,
                    maxWidth: zoom === 1 ? "100%" : "none",
                    maxHeight: zoom === 1 ? "100%" : "none",
                    height: "auto",
                  }}
                />
              </div>
            </div>

            {/* Right Arrow - Sticky */}
            <div className="sticky right-0 top-0 h-full flex items-center z-10 flex-shrink-0">
              <button
                onClick={goToNextSlide}
                disabled={currentSlide === presentation.slide_urls.length - 1}
                className="m-1 md:m-2 p-1.5 md:p-3 rounded-full bg-black/40 md:bg-black/60 hover:bg-black/80 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                title="Next slide (Right Arrow)"
              >
                <ChevronRight className="h-5 w-5 md:h-8 md:w-8" />
              </button>
            </div>
          </div>

          {/* Slide Thumbnails */}
          <div className="flex gap-1.5 md:gap-2 py-1.5 md:py-2 px-2 overflow-x-auto flex-shrink-0 border-t bg-muted/20">
            {presentation.slide_urls.map((url, index) => (
              <button
                key={index}
                onClick={() => goToSpecificSlide(index)}
                className={`relative flex-shrink-0 w-12 h-8 md:w-16 md:h-10 rounded border-2 overflow-hidden transition-all ${
                  index === currentSlide
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] md:text-[10px] px-0.5 md:px-1">
                  {index + 1}
                </span>
              </button>
            ))}
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
      <DialogContent
        className={`${
          isFullscreen
            ? "!max-w-[99vw] !w-[99vw] !h-[98vh] !max-h-[98vh]"
            : "!max-w-[98vw] !w-[98vw] !h-[90vh] !max-h-[90vh]"
        } flex flex-col overflow-hidden transition-all duration-300`}
      >
        <DialogHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">Presentation</DialogTitle>
              <DialogDescription className="text-sm">
                {session.title}
              </DialogDescription>
            </div>
            {!isLoading && presentation && (
              <p className="text-xs text-muted-foreground hidden sm:block">
                Use arrow keys to navigate, +/- to zoom, F for fullscreen
              </p>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden min-h-0">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
