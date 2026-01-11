// src/components/features/translation/TranslateButton.tsx
"use client";

import { memo, useState, useCallback } from "react";
import { Languages, Loader2, Check, AlertCircle } from "lucide-react";
import { Socket } from "socket.io-client";
import { useTranslation } from "@/hooks/use-translation";
import { useSubtitleStore } from "@/store/subtitle.store";
import { getLanguageByCode } from "@/types/subtitles";
import { cn } from "@/lib/utils";

interface TranslateButtonProps {
  messageId: string;
  originalText: string;
  socket: Socket | null;
  onTranslated?: (translatedText: string, language: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export const TranslateButton = memo(function TranslateButton({
  messageId,
  socket,
  onTranslated,
  className,
  size = "sm",
}: TranslateButtonProps) {
  const { translate, hasTranslation, getTranslation, isTranslating } =
    useTranslation({ socket });
  const { getEffectiveLanguage } = useSubtitleStore();

  const [showError, setShowError] = useState(false);

  const targetLanguage = getEffectiveLanguage();
  const languageInfo = getLanguageByCode(targetLanguage);
  const isLoading = isTranslating(messageId);
  const hasExistingTranslation = hasTranslation(messageId);
  const existingTranslation = getTranslation(messageId);

  const handleTranslate = useCallback(async () => {
    if (isLoading || hasExistingTranslation) return;

    setShowError(false);
    const result = await translate(messageId);

    if (result) {
      onTranslated?.(result.translatedText, result.targetLanguage);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  }, [messageId, isLoading, hasExistingTranslation, translate, onTranslated]);

  const sizeClasses = {
    sm: "p-1 text-xs",
    md: "p-1.5 text-sm",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  if (hasExistingTranslation && existingTranslation) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded text-green-600 bg-green-50 hover:bg-green-100 transition-colors",
          sizeClasses[size],
          className
        )}
        title={`Translated to ${languageInfo?.name || targetLanguage}`}
        disabled
      >
        <Check className={iconSizes[size]} />
        <span className="sr-only">Translated</span>
      </button>
    );
  }

  if (showError) {
    return (
      <button
        type="button"
        onClick={handleTranslate}
        className={cn(
          "inline-flex items-center gap-1 rounded text-red-600 bg-red-50 hover:bg-red-100 transition-colors",
          sizeClasses[size],
          className
        )}
        title="Translation failed. Click to retry."
      >
        <AlertCircle className={iconSizes[size]} />
        <span className="sr-only">Translation failed</span>
      </button>
    );
  }

  if (isLoading) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded text-blue-600 bg-blue-50",
          sizeClasses[size],
          className
        )}
        disabled
      >
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
        <span className="sr-only">Translating...</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleTranslate}
      className={cn(
        "inline-flex items-center gap-1 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors",
        sizeClasses[size],
        className
      )}
      title={`Translate to ${languageInfo?.name || targetLanguage}`}
      aria-label={`Translate to ${languageInfo?.name || targetLanguage}`}
    >
      <Languages className={iconSizes[size]} />
      <span className="sr-only">Translate</span>
    </button>
  );
});
