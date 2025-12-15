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
} from "lucide-react";

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
  const { token } = useAuthStore();

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 5));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const resetZoom = () => setZoom(1);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);
  const fitToWidth = () => setZoom(1); // Reset to fit width

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

  const goToNextSlide = useCallback(() => {
    if (presentation) {
      setCurrentSlide((prev) =>
        Math.min(prev + 1, presentation.slide_urls.length - 1)
      );
    }
  }, [presentation]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

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
          <div className="flex items-center justify-between py-2 px-2 border-b bg-muted/30 rounded-t-lg flex-shrink-0">
            <div className="flex items-center gap-1">
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
            <span className="text-sm font-medium">
              Slide {currentSlide + 1} of {presentation.slide_urls.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title="Toggle fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Slide Container */}
          <div className="flex-1 relative bg-neutral-900 overflow-auto min-h-0 flex">
            {/* Left Arrow - Sticky */}
            <div className="sticky left-0 top-0 h-full flex items-center z-10 flex-shrink-0">
              <button
                onClick={goToPrevSlide}
                disabled={currentSlide === 0}
                className="m-2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                title="Previous slide (Left Arrow)"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            </div>

            {/* Scrollable Slide Area */}
            <div className="flex-1 overflow-auto">
              <div
                className="flex items-center justify-center p-4"
                style={{
                  minWidth: "100%",
                  minHeight: "100%",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={presentation.slide_urls[currentSlide]}
                  alt={`Slide ${currentSlide + 1}`}
                  className="object-contain transition-all duration-200"
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
                className="m-2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                title="Next slide (Right Arrow)"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
          </div>

          {/* Slide Thumbnails */}
          <div className="flex gap-2 py-2 px-2 overflow-x-auto flex-shrink-0 border-t bg-muted/20">
            {presentation.slide_urls.map((url, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative flex-shrink-0 w-16 h-10 rounded border-2 overflow-hidden transition-all ${
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
                <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1">
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
