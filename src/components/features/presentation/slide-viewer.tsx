// src/components/features/presentation/slide-viewer.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SlideState, DroppedContent } from "@/hooks/use-presentation-control";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Loader,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Download,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Radio,
} from "lucide-react";

interface SlideViewerProps {
  slideState: SlideState | null;
  slideUrls?: string[];  // Optional here since slideState.slideUrls is primary source
  isPresenter?: boolean;
  onPrevSlide?: () => void;
  onNextSlide?: () => void;
  onGoToSlide?: (slide: number) => void;
  onDownload?: () => void;  // Callback when attendee clicks download
  isDownloading?: boolean;  // Loading state for download button
  className?: string;
}

/**
 * Slide viewer for attendees and presenters
 */
export const SlideViewer = ({
  slideState,
  slideUrls,
  isPresenter = false,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  onDownload,
  isDownloading = false,
  className = "",
}: SlideViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Prefer slideUrls from slideState (backend always provides it), fallback to prop
  const urls = slideState?.slideUrls || slideUrls;
  const currentSlideUrl =
    urls && slideState
      ? urls[slideState.currentSlide - 1]
      : undefined;

  const progress = slideState
    ? (slideState.currentSlide / slideState.totalSlides) * 100
    : 0;

  // Zoom controls
  const zoomIn = useCallback(() => setZoom((prev) => Math.min(prev + 0.25, 3)), []);
  const zoomOut = useCallback(() => setZoom((prev) => Math.max(prev - 0.25, 0.5)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Reset image error and zoom when slide changes
  useEffect(() => {
    setImageError(false);
  }, [slideState?.currentSlide]);

  // Keyboard navigation for attendees
  useEffect(() => {
    if (!slideState?.isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
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
        case "Escape":
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideState?.isActive, isFullscreen, zoomIn, zoomOut, resetZoom, toggleFullscreen]);

  // Waiting state
  if (!slideState || !slideState.isActive) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-neutral-900 rounded-lg p-8 h-full",
          className
        )}
      >
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-white/80 mb-2">
            {slideState
              ? "Presentation has ended"
              : "Waiting for presentation to start..."}
          </h3>
          <p className="text-sm text-muted-foreground">
            {slideState
              ? "The presenter has ended the live presentation"
              : "The presenter will start the slides shortly"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col bg-neutral-900 rounded-lg overflow-hidden h-full",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 px-3 border-b border-white/10 bg-black/40 flex-shrink-0">
        {/* Left: Zoom controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            title="Zoom out (-)"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-white/60 w-12 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={zoom >= 3}
            title="Zoom in (+)"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetZoom}
            title="Reset zoom (0)"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Center: Slide counter & Live badge */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/90">
            Slide {slideState.currentSlide} of {slideState.totalSlides}
          </span>
          <Badge variant="default" className="bg-red-600 hover:bg-red-600 gap-1.5 animate-pulse">
            <Radio className="h-3 w-3" />
            LIVE
          </Badge>
        </div>

        {/* Right: Download & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Download button - visible for attendees when download is enabled */}
          {!isPresenter && slideState?.downloadEnabled && onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              disabled={isDownloading}
              title="Download presentation"
              className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
            >
              {isDownloading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline text-xs">
                {isDownloading ? "Downloading..." : "Download"}
              </span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title="Toggle fullscreen (F)"
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Expand</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Slide Container - Optimized for landscape viewing */}
      <div className="flex-1 relative overflow-hidden min-h-0 flex bg-black">
        {/* Scrollable Slide Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <div
            className="flex items-center justify-center w-full h-full p-2 sm:p-4"
          >
            <AnimatePresence mode="wait">
              {currentSlideUrl && !imageError ? (
                <motion.img
                  key={slideState.currentSlide}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  src={currentSlideUrl}
                  alt={`Slide ${slideState.currentSlide}`}
                  className="object-contain rounded shadow-2xl"
                  style={{
                    width: zoom === 1 ? "100%" : `${zoom * 100}%`,
                    maxWidth: zoom === 1 ? "100%" : "none",
                    maxHeight: zoom === 1 ? "100%" : "none",
                    height: zoom === 1 ? "auto" : "auto",
                    transition: "all 0.2s ease",
                  }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center text-white/60"
                >
                  {imageError ? (
                    <>
                      <ImageIcon className="h-12 w-12 mb-2" />
                      <p>Failed to load slide</p>
                    </>
                  ) : (
                    <>
                      <Loader className="h-8 w-8 animate-spin mb-2" />
                      <p>Loading slide...</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slide Thumbnails */}
      {urls && urls.length > 0 && (
        <div className="flex gap-2 py-2 px-3 overflow-x-auto flex-shrink-0 border-t border-white/10 bg-black/40">
          {urls.map((url, index) => (
            <button
              key={index}
              onClick={() => isPresenter && onGoToSlide?.(index + 1)}
              disabled={!isPresenter}
              className={cn(
                "relative flex-shrink-0 w-16 h-10 rounded border-2 overflow-hidden transition-all",
                index + 1 === slideState.currentSlide
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent opacity-60",
                isPresenter && "hover:border-white/50 hover:opacity-100 cursor-pointer",
                !isPresenter && "cursor-default"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded-tl">
                {index + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Progress bar at the very bottom */}
      <div className="h-1 flex-shrink-0">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>
    </div>
  );
};

interface SlideThumbnailsProps {
  currentSlide: number;
  totalSlides: number;
  slideUrls?: string[];
  onSelectSlide: (slide: number) => void;
}

const SlideThumbnails = ({
  currentSlide,
  totalSlides,
  slideUrls,
  onSelectSlide,
}: SlideThumbnailsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-white hover:bg-white/20"
      >
        <ImageIcon className="h-4 w-4 mr-1" />
        Slides
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 w-[300px] max-h-[300px] overflow-y-auto bg-black/90 rounded-lg p-2 grid grid-cols-3 gap-2"
          >
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectSlide(index + 1);
                  setIsOpen(false);
                }}
                className={cn(
                  "relative aspect-video rounded overflow-hidden border-2 transition-all",
                  currentSlide === index + 1
                    ? "border-primary"
                    : "border-transparent hover:border-white/50"
                )}
              >
                {slideUrls?.[index] ? (
                  <img
                    src={slideUrls[index]}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    {index + 1}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 px-1 text-xs bg-black/70 text-white rounded-tl">
                  {index + 1}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Dropped content notification
 */
interface DroppedContentNotificationProps {
  content: DroppedContent;
  onDismiss: () => void;
  className?: string;
}

export const DroppedContentNotification = ({
  content,
  onDismiss,
  className = "",
}: DroppedContentNotificationProps) => {
  const Icon =
    content.type === "LINK"
      ? LinkIcon
      : content.type === "FILE"
      ? Download
      : FileText;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={cn(
        "bg-card border rounded-lg shadow-lg p-4 max-w-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate">{content.title}</p>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 hover:bg-muted rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {content.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {content.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Shared by {content.droppedBy.name}
            </span>
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Open
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Presenter control panel
 */
interface PresenterControlPanelProps {
  slideState: SlideState | null;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (slide: number) => void;
  onStart: () => void;
  onStop: () => void;
  onDropContent: (
    type: "LINK" | "FILE" | "RESOURCE",
    title: string,
    url: string,
    description?: string
  ) => void;
  isLoading?: boolean;
  className?: string;
}

export const PresenterControlPanel = ({
  slideState,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  onStart,
  onStop,
  onDropContent,
  isLoading = false,
  className = "",
}: PresenterControlPanelProps) => {
  const [dropFormOpen, setDropFormOpen] = useState(false);
  const [dropType, setDropType] = useState<"LINK" | "FILE" | "RESOURCE">("LINK");
  const [dropTitle, setDropTitle] = useState("");
  const [dropUrl, setDropUrl] = useState("");
  const [dropDescription, setDropDescription] = useState("");

  const handleDrop = () => {
    if (dropTitle && dropUrl) {
      onDropContent(dropType, dropTitle, dropUrl, dropDescription);
      setDropTitle("");
      setDropUrl("");
      setDropDescription("");
      setDropFormOpen(false);
    }
  };

  return (
    <div className={cn("bg-card border rounded-lg p-4", className)}>
      <h3 className="font-semibold mb-4">Presentation Controls</h3>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevSlide}
          disabled={!slideState || slideState.currentSlide <= 1 || isLoading}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous
        </Button>

        <div className="text-center">
          <p className="text-2xl font-mono font-bold">
            {slideState?.currentSlide || 0} / {slideState?.totalSlides || 0}
          </p>
          <p className="text-xs text-muted-foreground">Current Slide</p>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={onNextSlide}
          disabled={
            !slideState ||
            slideState.currentSlide >= slideState.totalSlides ||
            isLoading
          }
        >
          Next
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>

      {/* Start/Stop */}
      <div className="flex justify-center gap-2 mb-4">
        {!slideState?.isActive ? (
          <Button onClick={onStart} disabled={isLoading}>
            {isLoading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Start Presentation
          </Button>
        ) : (
          <Button variant="destructive" onClick={onStop} disabled={isLoading}>
            End Presentation
          </Button>
        )}
      </div>

      {/* Drop Content */}
      <div className="border-t pt-4 mt-4">
        <Button
          variant="outline"
          onClick={() => setDropFormOpen(!dropFormOpen)}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Share Content with Attendees
        </Button>

        <AnimatePresence>
          {dropFormOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 mt-4">
                <select
                  value={dropType}
                  onChange={(e) => setDropType(e.target.value as "LINK" | "FILE" | "RESOURCE")}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option value="LINK">Link</option>
                  <option value="FILE">File</option>
                  <option value="RESOURCE">Resource</option>
                </select>

                <input
                  type="text"
                  placeholder="Title"
                  value={dropTitle}
                  onChange={(e) => setDropTitle(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                />

                <input
                  type="url"
                  placeholder="URL"
                  value={dropUrl}
                  onChange={(e) => setDropUrl(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                />

                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={dropDescription}
                  onChange={(e) => setDropDescription(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                />

                <Button
                  onClick={handleDrop}
                  disabled={!dropTitle || !dropUrl}
                  className="w-full"
                >
                  Share
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
