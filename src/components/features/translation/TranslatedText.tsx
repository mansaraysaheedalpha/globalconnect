// src/components/features/translation/TranslatedText.tsx
"use client";

import { memo, useState, useCallback } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { getLanguageByCode } from "@/types/subtitles";
import { cn } from "@/lib/utils";

interface TranslatedTextProps {
  originalText: string;
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage: string;
  showOriginal?: boolean;
  collapsible?: boolean;
  className?: string;
}

export const TranslatedText = memo(function TranslatedText({
  originalText,
  translatedText,
  sourceLanguage,
  targetLanguage,
  showOriginal = true,
  collapsible = true,
  className,
}: TranslatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [copied, setCopied] = useState(false);

  const targetLangInfo = getLanguageByCode(targetLanguage);
  const sourceLangInfo = sourceLanguage
    ? getLanguageByCode(sourceLanguage)
    : null;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [translatedText]);

  const toggleExpanded = useCallback(() => {
    if (collapsible) {
      setIsExpanded((prev) => !prev);
    }
  }, [collapsible]);

  return (
    <div className={cn("mt-2 border-l-2 border-blue-400 pl-3 py-1", className)}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {targetLangInfo?.nativeName || targetLanguage}
          </span>
          {sourceLangInfo && (
            <span className="text-xs text-gray-400">
              from {sourceLangInfo.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "p-1 rounded transition-colors",
              copied
                ? "text-green-600 bg-green-50"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            )}
            title={copied ? "Copied!" : "Copy translation"}
            aria-label={copied ? "Copied" : "Copy translation"}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {collapsible && (
            <button
              type="button"
              onClick={toggleExpanded}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {(!collapsible || isExpanded) && (
        <div className="space-y-1">
          <p className="text-sm text-gray-800">{translatedText}</p>

          {showOriginal && originalText !== translatedText && (
            <p className="text-xs text-gray-400 italic">
              Original: {originalText}
            </p>
          )}
        </div>
      )}

      {collapsible && !isExpanded && (
        <p className="text-sm text-gray-600 truncate">{translatedText}</p>
      )}
    </div>
  );
});
