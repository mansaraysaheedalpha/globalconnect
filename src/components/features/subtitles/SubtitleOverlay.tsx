// src/components/features/subtitles/SubtitleOverlay.tsx
"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubtitleStore } from "@/store/subtitle.store";
import { ActiveSubtitle, SUBTITLE_FONT_SIZES } from "@/types/subtitles";
import { cn } from "@/lib/utils";

interface SubtitleOverlayProps {
  subtitles: ActiveSubtitle[];
  className?: string;
}

export const SubtitleOverlay = memo(function SubtitleOverlay({
  subtitles,
  className,
}: SubtitleOverlayProps) {
  const {
    enabled,
    fontSize,
    backgroundColor,
    textColor,
    position,
    showOriginalWithTranslation,
  } = useSubtitleStore();

  if (!enabled || subtitles.length === 0) {
    return null;
  }

  const fontSizeValue = SUBTITLE_FONT_SIZES[fontSize];

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-50 pointer-events-none",
        "flex flex-col items-center gap-1 px-4",
        position === "bottom" ? "bottom-16" : "top-4",
        className
      )}
      role="region"
      aria-label="Live subtitles"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {subtitles.map((subtitle) => (
          <motion.div
            key={subtitle.id}
            initial={{ opacity: 0, y: position === "bottom" ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === "bottom" ? -10 : 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="max-w-[90%] text-center"
          >
            <div
              className="inline-block px-4 py-2 rounded-md shadow-lg"
              style={{
                backgroundColor,
                color: textColor,
                fontSize: fontSizeValue,
              }}
            >
              {subtitle.translatedText ? (
                <>
                  <span className="block">{subtitle.translatedText}</span>
                  {showOriginalWithTranslation && (
                    <span
                      className="block text-sm opacity-70 mt-1 italic"
                      style={{ fontSize: `calc(${fontSizeValue} * 0.75)` }}
                    >
                      {subtitle.text}
                    </span>
                  )}
                </>
              ) : (
                <span>{subtitle.text}</span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
