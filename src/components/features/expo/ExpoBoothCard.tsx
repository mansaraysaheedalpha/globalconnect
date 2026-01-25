// src/components/features/expo/ExpoBoothCard.tsx
"use client";

import { memo } from "react";
import Image from "next/image";
import { Users, Video, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExpoBooth, BOOTH_TIER_CONFIG } from "./types";

export interface ExpoBoothCardProps {
  booth: ExpoBooth;
  onClick?: (booth: ExpoBooth) => void;
  isSelected?: boolean;
}

export const ExpoBoothCard = memo(function ExpoBoothCard({
  booth,
  onClick,
  isSelected = false,
}: ExpoBoothCardProps) {
  const tierConfig = BOOTH_TIER_CONFIG[booth.tier];
  const hasOnlineStaff = booth.staffPresence.some((s) => s.status === "ONLINE");
  const visitorCount = booth._count.visits;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg group overflow-hidden touch-manipulation",
        "active:scale-[0.98] active:shadow-md",
        tierConfig.borderColor,
        "border-2",
        isSelected && "ring-2 ring-primary ring-offset-2",
        booth.tier === "PLATINUM" && "shadow-md"
      )}
      onClick={() => onClick?.(booth)}
    >
      {/* Banner Image */}
      <div className="relative h-32 bg-muted overflow-hidden">
        {booth.bannerUrl ? (
          <Image
            src={booth.bannerUrl}
            alt={`${booth.name} banner`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center",
              tierConfig.bgColor
            )}
          >
            <Sparkles className={cn("h-12 w-12 opacity-20", tierConfig.color)} />
          </div>
        )}

        {/* Tier Badge */}
        <Badge
          variant="secondary"
          className={cn(
            "absolute top-2 left-2",
            tierConfig.bgColor,
            tierConfig.color
          )}
        >
          {tierConfig.label}
        </Badge>

        {/* Live indicator */}
        {hasOnlineStaff && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Live
          </div>
        )}

        {/* Logo overlay */}
        {booth.logoUrl && (
          <div className="absolute -bottom-6 left-4 w-16 h-16 rounded-lg border-2 border-background bg-background shadow-sm overflow-hidden">
            <Image
              src={booth.logoUrl}
              alt={`${booth.name} logo`}
              fill
              className="object-contain p-1"
            />
          </div>
        )}
      </div>

      <CardContent className="pt-8 pb-4">
        {/* Booth name and tagline */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {booth.name}
          </h3>
          {booth.tagline && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {booth.tagline}
            </p>
          )}
        </div>

        {/* Category */}
        {booth.category && (
          <Badge variant="outline" className="mb-3">
            {booth.category}
          </Badge>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3 mt-3">
          <div className="flex items-center gap-4">
            {/* Visitor count */}
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{visitorCount}</span>
            </div>

            {/* Features */}
            {booth.chatEnabled && (
              <MessageSquare className="h-4 w-4" aria-label="Chat available" />
            )}
            {booth.videoEnabled && hasOnlineStaff && (
              <Video className="h-4 w-4 text-green-500" aria-label="Video call available" />
            )}
          </div>

          {/* Booth number */}
          <span className="text-xs"># {booth.boothNumber}</span>
        </div>
      </CardContent>
    </Card>
  );
});
