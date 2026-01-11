// src/components/features/subtitles/SubtitleSettings.tsx
"use client";

import { memo, useState, useRef, useEffect } from "react";
import { Settings, X } from "lucide-react";
import { useSubtitleStore } from "@/store/subtitle.store";
import { LanguageSelector } from "./LanguageSelector";
import { SUBTITLE_FONT_SIZES, SubtitleFontSize } from "@/types/subtitles";
import { cn } from "@/lib/utils";

interface SubtitleSettingsProps {
  className?: string;
}

const BACKGROUND_PRESETS = [
  { value: "rgba(0, 0, 0, 0.75)", label: "Dark" },
  { value: "rgba(0, 0, 0, 0.5)", label: "Semi-transparent" },
  { value: "rgba(0, 0, 0, 0.9)", label: "Opaque" },
  { value: "rgba(255, 255, 255, 0.9)", label: "Light" },
];

const TEXT_COLOR_PRESETS = [
  { value: "#ffffff", label: "White" },
  { value: "#ffff00", label: "Yellow" },
  { value: "#00ff00", label: "Green" },
  { value: "#00ffff", label: "Cyan" },
];

export const SubtitleSettings = memo(function SubtitleSettings({
  className,
}: SubtitleSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    enabled,
    fontSize,
    backgroundColor,
    textColor,
    position,
    showOriginalWithTranslation,
    setEnabled,
    setFontSize,
    setBackgroundColor,
    setTextColor,
    setPosition,
    setShowOriginalWithTranslation,
    resetToDefaults,
  } = useSubtitleStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full",
          "bg-black/50 hover:bg-black/70 text-white transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-white/50"
        )}
        aria-label="Subtitle settings"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Subtitle settings"
          className={cn(
            "absolute bottom-full right-0 mb-2 w-80",
            "bg-gray-900 rounded-lg shadow-xl border border-gray-700",
            "animate-in fade-in-0 slide-in-from-bottom-2"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Subtitle Settings</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-5 max-h-[400px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-medium">
                Show Subtitles
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors",
                  enabled ? "bg-blue-600" : "bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                    enabled && "translate-x-5"
                  )}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium block">
                Language
              </label>
              <LanguageSelector size="sm" showIcon={true} />
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium block">
                Font Size
              </label>
              <div className="flex gap-2">
                {(["small", "medium", "large"] as SubtitleFontSize[]).map(
                  (size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFontSize(size)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-md text-sm capitalize transition-colors",
                        fontSize === size
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      )}
                    >
                      {size}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium block">
                Background
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setBackgroundColor(preset.value)}
                    className={cn(
                      "h-8 rounded-md border-2 transition-colors",
                      backgroundColor === preset.value
                        ? "border-blue-500"
                        : "border-transparent hover:border-gray-500"
                    )}
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                    aria-label={`${preset.label} background`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium block">
                Text Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TEXT_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setTextColor(preset.value)}
                    className={cn(
                      "h-8 rounded-md border-2 transition-colors",
                      textColor === preset.value
                        ? "border-blue-500"
                        : "border-transparent hover:border-gray-500"
                    )}
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                    aria-label={`${preset.label} text color`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium block">
                Position
              </label>
              <div className="flex gap-2">
                {(["bottom", "top"] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm capitalize transition-colors",
                      position === pos
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    )}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-medium">
                Show Original Text
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={showOriginalWithTranslation}
                onClick={() =>
                  setShowOriginalWithTranslation(!showOriginalWithTranslation)
                }
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors",
                  showOriginalWithTranslation ? "bg-blue-600" : "bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                    showOriginalWithTranslation && "translate-x-5"
                  )}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium block">
                Preview
              </label>
              <div className="relative h-16 bg-gray-800 rounded-md flex items-end justify-center pb-2">
                <div
                  className="px-3 py-1 rounded text-center"
                  style={{
                    backgroundColor,
                    color: textColor,
                    fontSize: SUBTITLE_FONT_SIZES[fontSize],
                  }}
                >
                  Sample subtitle text
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={resetToDefaults}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md text-sm transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
