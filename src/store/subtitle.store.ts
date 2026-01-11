// src/store/subtitle.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  SubtitlePreferences,
  SubtitleFontSize,
  SubtitlePosition,
  DEFAULT_SUBTITLE_PREFERENCES,
  detectBrowserLanguage,
} from "@/types/subtitles";

/**
 * Validate and sanitize color values to prevent XSS attacks
 * Only allows safe CSS color formats
 */
function sanitizeColor(color: string, fallback: string): string {
  // Allow hex colors: #RGB, #RRGGBB, #RRGGBBAA
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  if (hexPattern.test(color)) return color;

  // Allow rgb/rgba with only numbers and commas
  const rgbPattern = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+))?\s*\)$/;
  if (rgbPattern.test(color)) return color;

  // Allow named colors (common safe colors only)
  const safeNamedColors = [
    "black", "white", "red", "green", "blue", "yellow", "cyan", "magenta",
    "gray", "grey", "orange", "purple", "pink", "brown", "transparent",
  ];
  if (safeNamedColors.includes(color.toLowerCase())) return color;

  // Return fallback for invalid colors
  return fallback;
}

interface SubtitleState extends SubtitlePreferences {
  // Actions
  setEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  setFontSize: (fontSize: SubtitleFontSize) => void;
  setBackgroundColor: (color: string) => void;
  setTextColor: (color: string) => void;
  setPosition: (position: SubtitlePosition) => void;
  setPreferredLanguage: (language: string | null) => void;
  setShowOriginalWithTranslation: (show: boolean) => void;
  resetToDefaults: () => void;

  // Computed
  getEffectiveLanguage: () => string;
}

export const useSubtitleStore = create<SubtitleState>()(
  persist(
    (set, get) => ({
      // Default state
      ...DEFAULT_SUBTITLE_PREFERENCES,

      // Actions
      setEnabled: (enabled) => set({ enabled }),

      toggleEnabled: () => set((state) => ({ enabled: !state.enabled })),

      setFontSize: (fontSize) => set({ fontSize }),

      setBackgroundColor: (backgroundColor) =>
        set({
          backgroundColor: sanitizeColor(
            backgroundColor,
            DEFAULT_SUBTITLE_PREFERENCES.backgroundColor
          ),
        }),

      setTextColor: (textColor) =>
        set({
          textColor: sanitizeColor(
            textColor,
            DEFAULT_SUBTITLE_PREFERENCES.textColor
          ),
        }),

      setPosition: (position) => set({ position }),

      setPreferredLanguage: (preferredLanguage) => set({ preferredLanguage }),

      setShowOriginalWithTranslation: (showOriginalWithTranslation) =>
        set({ showOriginalWithTranslation }),

      resetToDefaults: () => set(DEFAULT_SUBTITLE_PREFERENCES),

      // Get effective language (auto-detect if null)
      getEffectiveLanguage: () => {
        const { preferredLanguage } = get();
        if (preferredLanguage) return preferredLanguage;
        return detectBrowserLanguage();
      },
    }),
    {
      name: "subtitle-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        fontSize: state.fontSize,
        backgroundColor: state.backgroundColor,
        textColor: state.textColor,
        position: state.position,
        preferredLanguage: state.preferredLanguage,
        showOriginalWithTranslation: state.showOriginalWithTranslation,
      }),
      // Sanitize values when loading from localStorage to prevent XSS
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<SubtitlePreferences>;
        return {
          ...currentState,
          ...persisted,
          // Sanitize color values from storage
          backgroundColor: persisted?.backgroundColor
            ? sanitizeColor(
                persisted.backgroundColor,
                DEFAULT_SUBTITLE_PREFERENCES.backgroundColor
              )
            : currentState.backgroundColor,
          textColor: persisted?.textColor
            ? sanitizeColor(
                persisted.textColor,
                DEFAULT_SUBTITLE_PREFERENCES.textColor
              )
            : currentState.textColor,
        };
      },
    }
  )
);

// Export helper to get subtitle preferences without hooks
export function getSubtitlePreferences(): SubtitlePreferences {
  const state = useSubtitleStore.getState();
  return {
    enabled: state.enabled,
    fontSize: state.fontSize,
    backgroundColor: state.backgroundColor,
    textColor: state.textColor,
    position: state.position,
    preferredLanguage: state.preferredLanguage,
    showOriginalWithTranslation: state.showOriginalWithTranslation,
  };
}

// Export helper to check if subtitles are enabled
export function areSubtitlesEnabled(): boolean {
  return useSubtitleStore.getState().enabled;
}
