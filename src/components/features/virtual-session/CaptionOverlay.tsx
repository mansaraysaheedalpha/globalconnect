// src/components/features/virtual-session/CaptionOverlay.tsx
"use client";

import { cn } from "@/lib/utils";
import { CaptionEntry } from "@/components/features/breakout/video/DailyProvider";

interface CaptionOverlayProps {
  captions: CaptionEntry[];
  className?: string;
}

export function CaptionOverlay({ captions, className }: CaptionOverlayProps) {
  // Show last 2 caption entries
  const visibleCaptions = captions.slice(-2);

  if (visibleCaptions.length === 0) return null;

  return (
    <div
      className={cn(
        "absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 w-[92%] sm:w-[85%] max-w-2xl pointer-events-none z-10",
        className
      )}
    >
      <div className="bg-black/70 backdrop-blur-md rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 space-y-1.5 border border-white/[0.06] shadow-xl">
        {visibleCaptions.map((caption, i) => (
          <p
            key={`${caption.timestamp}-${i}`}
            className={cn(
              "text-[13px] sm:text-sm text-white leading-relaxed",
              !caption.isFinal && "text-white/50 italic"
            )}
          >
            <span className="font-semibold text-blue-300/90 mr-1.5">
              {caption.speakerName}:
            </span>
            {caption.text}
          </p>
        ))}
      </div>
    </div>
  );
}
