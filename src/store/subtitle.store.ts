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

      setBackgroundColor: (backgroundColor) => set({ backgroundColor }),

      setTextColor: (textColor) => set({ textColor }),

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
