// src/components/features/subtitles/LanguageSelector.tsx
"use client";

import { memo, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useSubtitleStore } from "@/store/subtitle.store";
import {
  SUPPORTED_LANGUAGES,
  getLanguagesByRegion,
  detectBrowserLanguage,
} from "@/types/subtitles";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  onLanguageChange?: (language: string | null) => void;
}

export const LanguageSelector = memo(function LanguageSelector({
  className,
  showIcon = true,
  size = "md",
  onLanguageChange,
}: LanguageSelectorProps) {
  const { preferredLanguage, setPreferredLanguage } = useSubtitleStore();

  const languagesByRegion = useMemo(() => getLanguagesByRegion(), []);
  const detectedLanguage = useMemo(() => detectBrowserLanguage(), []);

  const handleValueChange = (value: string) => {
    const newLanguage = value === "auto" ? null : value;
    setPreferredLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  const currentValue = preferredLanguage || "auto";

  const displayValue = useMemo(() => {
    if (!preferredLanguage) {
      const detected = SUPPORTED_LANGUAGES.find(
        (l) => l.code === detectedLanguage
      );
      return `Auto (${detected?.name || "English"})`;
    }
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === preferredLanguage);
    return lang?.nativeName || lang?.name || preferredLanguage;
  }, [preferredLanguage, detectedLanguage]);

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-9 text-sm",
    lg: "h-10 text-base",
  };

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn("w-[180px] gap-2", sizeClasses[size], className)}
        aria-label="Select subtitle language"
      >
        {showIcon && <Globe className="h-4 w-4 shrink-0 opacity-70" />}
        <SelectValue placeholder="Select language">{displayValue}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto" className="font-medium">
          <div className="flex flex-col">
            <span>Auto-detect</span>
            <span className="text-xs text-muted-foreground">
              Use browser language ({detectedLanguage.toUpperCase()})
            </span>
          </div>
        </SelectItem>

        <SelectGroup>
          <SelectLabel className="text-xs uppercase tracking-wide text-muted-foreground">
            World Languages
          </SelectLabel>
          {languagesByRegion.world.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.nativeName}</span>
                {lang.nativeName !== lang.name && (
                  <span className="text-xs text-muted-foreground">
                    ({lang.name})
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel className="text-xs uppercase tracking-wide text-muted-foreground">
            African Languages
          </SelectLabel>
          {languagesByRegion.africa.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.nativeName}</span>
                {lang.nativeName !== lang.name && (
                  <span className="text-xs text-muted-foreground">
                    ({lang.name})
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
});
