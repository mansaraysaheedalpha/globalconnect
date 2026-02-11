// src/components/ui/adaptive-image.tsx
"use client";

import Image, { ImageProps } from "next/image";
import { useNetworkStatus } from "@/hooks/use-network-status";

/**
 * Quality tiers based on connection quality.
 * Next.js Image `quality` ranges from 1-100 (default 75).
 */
const QUALITY_MAP = {
  good: 75,
  slow: 40,
  offline: 30, // Minimal — for any image that somehow loads offline
} as const;

interface AdaptiveImageProps extends Omit<ImageProps, "quality"> {
  /** Override automatic quality selection */
  quality?: number;
  /** If true, skip rendering entirely on save-data / slow connections */
  decorative?: boolean;
}

/**
 * Drop-in replacement for next/image that automatically adjusts
 * quality based on the user's connection speed.
 *
 * - Good connection (4g, wifi): quality 75 (default)
 * - Slow connection (2g, 3g): quality 40
 * - Save-data enabled: quality 40, decorative images hidden
 *
 * Usage: Replace `<Image>` with `<AdaptiveImage>`. Same props.
 */
export function AdaptiveImage({
  decorative = false,
  quality: qualityOverride,
  ...props
}: AdaptiveImageProps) {
  const { connectionQuality, saveData } = useNetworkStatus();

  // Skip decorative images on metered/slow connections
  if (decorative && (saveData || connectionQuality === "slow")) {
    return null;
  }

  const quality = qualityOverride ?? QUALITY_MAP[connectionQuality];

  return <Image quality={quality} {...props} />;
}
