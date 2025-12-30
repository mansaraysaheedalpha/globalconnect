// src/components/features/ads/banner-ad.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { TRACK_AD_CLICK_MUTATION } from "@/graphql/monetization.graphql";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface Ad {
  id: string;
  name: string;
  contentType: string;
  mediaUrl: string;
  clickUrl: string;
  displayDuration?: number;
  weight?: number;
}

interface BannerAdProps {
  ad: Ad;
  onImpression?: (adId: string, viewableData: {
    viewable_duration_ms: number;
    viewport_percentage: number;
  }) => void;
  className?: string;
  showSponsorLabel?: boolean;
}

export const BannerAd = ({
  ad,
  onImpression,
  className = "",
  showSponsorLabel = true,
}: BannerAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  const [trackClick] = useMutation(TRACK_AD_CLICK_MUTATION);

  // Intersection Observer for viewability tracking
  useEffect(() => {
    if (!adRef.current || !onImpression) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const viewportPercentage = Math.round(entry.intersectionRatio * 100);

        if (entry.isIntersecting && viewportPercentage >= 50) {
          // Ad is viewable (50%+ visible)
          setIsInView(true);
          if (!viewStartTime) {
            setViewStartTime(Date.now());
          }
        } else {
          // Ad is no longer viewable
          if (isInView && viewStartTime) {
            const viewDuration = Date.now() - viewStartTime;

            // Track impression if viewed for 1+ second and 50%+ visible
            if (viewDuration >= 1000 && !hasTrackedImpression) {
              onImpression(ad.id, {
                viewable_duration_ms: viewDuration,
                viewport_percentage: viewportPercentage,
              });
              setHasTrackedImpression(true);
            }
          }
          setIsInView(false);
          setViewStartTime(null);
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0], // Track at different visibility levels
      }
    );

    observer.observe(adRef.current);

    return () => {
      observer.disconnect();
    };
  }, [ad.id, isInView, viewStartTime, hasTrackedImpression, onImpression]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      // Track click
      const { data } = await trackClick({
        variables: {
          adId: ad.id,
          sessionContext: window.location.pathname,
        },
      });

      // Open in new tab
      window.open(data?.trackAdClick?.redirectUrl || ad.clickUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to track ad click:", error);
      // Fallback: still open the link
      window.open(ad.clickUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      ref={adRef}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-300",
        className
      )}
      onClick={handleClick}
    >
      {/* Sponsored Label */}
      {showSponsorLabel && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-white/90 dark:bg-black/90 backdrop-blur-sm text-xs">
            Sponsored
          </Badge>
        </div>
      )}

      {/* Banner Image */}
      <div className="relative w-full aspect-[16/3] md:aspect-[21/3]">
        <Image
          src={ad.mediaUrl}
          alt={ad.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized // For external images
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white dark:bg-black rounded-full p-3">
            <ExternalLink className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Click hint */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Badge variant="secondary" className="bg-white/90 dark:bg-black/90 backdrop-blur-sm text-xs flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Learn More
        </Badge>
      </div>
    </div>
  );
};
