// src/components/features/ads/video-ad.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { TRACK_AD_CLICK_MUTATION } from "@/graphql/monetization.graphql";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

export interface Ad {
  id: string;
  name: string;
  contentType: string;
  mediaUrl: string;
  clickUrl: string;
  displayDuration?: number;
  weight?: number;
}

interface VideoAdProps {
  ad: Ad;
  onImpression?: (adId: string, viewableData: {
    viewable_duration_ms: number;
    viewport_percentage: number;
  }) => void;
  className?: string;
  autoPlay?: boolean;
  showSponsorLabel?: boolean;
}

export const VideoAd = ({
  ad,
  onImpression,
  className = "",
  autoPlay = false,
  showSponsorLabel = true,
}: VideoAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  const [trackClick] = useMutation(TRACK_AD_CLICK_MUTATION);

  // Intersection Observer for viewability tracking (video ads: 50%+ visible for 2+ seconds)
  useEffect(() => {
    if (!adRef.current || !onImpression) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const viewportPercentage = Math.round(entry.intersectionRatio * 100);

        if (entry.isIntersecting && viewportPercentage >= 50) {
          if (!viewStartTime) {
            setViewStartTime(Date.now());
          }

          // Auto-play when in view (if autoPlay enabled)
          if (autoPlay && videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(() => {
              // Auto-play failed (browser policy), user needs to interact
            });
          }
        } else {
          // Track impression if viewed for 2+ seconds (IAB standard for video)
          if (viewStartTime) {
            const viewDuration = Date.now() - viewStartTime;

            if (viewDuration >= 2000 && !hasTrackedImpression) {
              onImpression(ad.id, {
                viewable_duration_ms: viewDuration,
                viewport_percentage: viewportPercentage,
              });
              setHasTrackedImpression(true);
            }
          }
          setViewStartTime(null);

          // Pause when out of view
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
          }
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    observer.observe(adRef.current);

    return () => {
      observer.disconnect();
    };
  }, [ad.id, viewStartTime, hasTrackedImpression, autoPlay, onImpression]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoClick = async (e: React.MouseEvent) => {
    // Don't navigate if clicking on video controls
    if ((e.target as HTMLElement).tagName === "VIDEO") {
      togglePlay();
      return;
    }
  };

  const handleCtaClick = async () => {
    try {
      const { data } = await trackClick({
        variables: {
          adId: ad.id,
          sessionContext: window.location.pathname,
        },
      });

      logger.info("Video ad click tracked successfully", { adId: ad.id });

      window.open(data?.trackAdClick?.redirectUrl || ad.clickUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      logger.error("Failed to track video ad click", error, {
        adId: ad.id,
        clickUrl: ad.clickUrl
      });
      window.open(ad.clickUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      ref={adRef}
      className={cn(
        "relative group overflow-hidden rounded-lg border bg-card",
        className
      )}
      onClick={handleVideoClick}
    >
      {/* Sponsored Label */}
      {showSponsorLabel && (
        <div className="absolute top-3 left-3 z-20">
          <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm text-xs">
            Sponsored Video
          </Badge>
        </div>
      )}

      {/* Video */}
      <div className="relative w-full aspect-video bg-black">
        <video
          ref={videoRef}
          src={ad.mediaUrl}
          className="w-full h-full object-contain"
          loop
          muted={isMuted}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between gap-4">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              {/* Mute/Unmute */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Play button overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <button
              onClick={togglePlay}
              className="bg-white/90 hover:bg-white rounded-full p-6 transition-all duration-200 hover:scale-110"
            >
              <Play className="h-10 w-10 text-black fill-black ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="p-4 bg-muted/50">
        <Button
          variant="default"
          className="w-full gap-2"
          onClick={handleCtaClick}
        >
          <ExternalLink className="h-4 w-4" />
          Learn More
        </Button>
      </div>
    </div>
  );
};
