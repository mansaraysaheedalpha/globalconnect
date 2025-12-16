// src/components/features/presentation/slide-viewer.tsx
"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

interface SlideViewerProps {
  slideState: SlideState | null;
  slideUrls?: string[];
  isPresenter?: boolean;
  onPrevSlide?: () => void;
  onNextSlide?: () => void;
  onGoToSlide?: (slide: number) => void;
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
  className = "",
}: SlideViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const currentSlideUrl =
    slideUrls && slideState
      ? slideUrls[slideState.currentSlide - 1]
      : undefined;

  const progress = slideState
    ? (slideState.currentSlide / slideState.totalSlides) * 100
    : 0;

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Reset image error when slide changes
  useEffect(() => {
    setImageError(false);
  }, [slideState?.currentSlide]);

  if (!slideState || !slideState.isActive) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-muted rounded-lg p-8",
          className
        )}
      >
        <ImageIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-center">
          {slideState
            ? "Presentation has ended"
            : "Waiting for presentation to start..."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col bg-black rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Slide Content */}
      <div className="relative flex-1 flex items-center justify-center bg-black min-h-[300px]">
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
              className="max-w-full max-h-full object-contain"
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
                  <FileText className="h-12 w-12 mb-2" />
                  <p>Slide {slideState.currentSlide}</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation overlay for presenters */}
        {isPresenter && (
          <>
            <button
              onClick={onPrevSlide}
              disabled={slideState.currentSlide <= 1}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={onNextSlide}
              disabled={slideState.currentSlide >= slideState.totalSlides}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {slideState.currentSlide} / {slideState.totalSlides}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="flex-1 mx-4">
          <Progress value={progress} className="h-1" />
        </div>

        {/* Slide thumbnails button for presenter */}
        {isPresenter && onGoToSlide && (
          <SlideThumbnails
            currentSlide={slideState.currentSlide}
            totalSlides={slideState.totalSlides}
            slideUrls={slideUrls}
            onSelectSlide={onGoToSlide}
          />
        )}
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
