// src/components/features/virtual-session/CaptionOverlay.tsx
"use client";

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
      className={`absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl pointer-events-none z-10 ${className || ""}`}
    >
      <div className="bg-black/75 backdrop-blur-sm rounded-lg px-4 py-3 space-y-1">
        {visibleCaptions.map((caption, i) => (
          <p
            key={`${caption.timestamp}-${i}`}
            className={`text-sm text-white leading-relaxed ${
              !caption.isFinal ? "opacity-60 italic" : ""
            }`}
          >
            <span className="font-semibold text-blue-300 mr-1.5">
              {caption.speakerName}:
            </span>
            {caption.text}
          </p>
        ))}
      </div>
    </div>
  );
}
