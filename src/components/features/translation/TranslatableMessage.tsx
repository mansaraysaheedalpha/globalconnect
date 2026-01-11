// src/components/features/translation/TranslatableMessage.tsx
"use client";

import { memo, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { TranslateButton } from "./TranslateButton";
import { TranslatedText } from "./TranslatedText";
import { useTranslation } from "@/hooks/use-translation";
import { useSubtitleStore } from "@/store/subtitle.store";
import { cn } from "@/lib/utils";

interface TranslatableMessageProps {
  messageId: string;
  text: string;
  sourceLanguage?: string;
  socket: Socket | null;
  children?: React.ReactNode;
  className?: string;
  showTranslateButton?: boolean;
  autoTranslate?: boolean;
}

export const TranslatableMessage = memo(function TranslatableMessage({
  messageId,
  text,
  sourceLanguage,
  socket,
  children,
  className,
  showTranslateButton = true,
  autoTranslate = false,
}: TranslatableMessageProps) {
  const { getTranslation, hasTranslation } = useTranslation({ socket });
  const { getEffectiveLanguage } = useSubtitleStore();

  const [showTranslation, setShowTranslation] = useState(autoTranslate);

  const targetLanguage = getEffectiveLanguage();
  const translation = hasTranslation(messageId)
    ? getTranslation(messageId)
    : null;

  const handleTranslated = useCallback(() => {
    setShowTranslation(true);
  }, []);

  return (
    <div className={cn("group relative", className)}>
      <div className="relative">
        {children || <p className="text-sm">{text}</p>}

        {showTranslateButton && (
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <TranslateButton
              messageId={messageId}
              originalText={text}
              socket={socket}
              onTranslated={handleTranslated}
              size="sm"
            />
          </div>
        )}
      </div>

      {showTranslation && translation && (
        <TranslatedText
          originalText={text}
          translatedText={translation.translatedText}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          showOriginal={false}
          collapsible={true}
        />
      )}
    </div>
  );
});
