// src/components/features/reaction-bar.tsx
"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile, ChevronUp } from "lucide-react";
import { ALLOWED_EMOJIS, AllowedEmoji } from "@/hooks/use-session-reactions";

interface ReactionBarProps {
  onReaction: (emoji: string) => boolean;
  popularEmojis?: string[];
  disabled?: boolean;
  className?: string;
  variant?: "horizontal" | "vertical" | "compact";
}

/**
 * Reaction bar for sending live emoji reactions.
 * Shows popular emojis with option to see all available emojis.
 */
export const ReactionBar = ({
  onReaction,
  popularEmojis,
  disabled = false,
  className = "",
  variant = "horizontal",
}: ReactionBarProps) => {
  const [showAll, setShowAll] = useState(false);
  const [lastTapped, setLastTapped] = useState<string | null>(null);

  // Use popular emojis or default subset
  const quickEmojis = popularEmojis?.slice(0, 6) || ALLOWED_EMOJIS.slice(0, 6);

  const handleReaction = useCallback(
    (emoji: string) => {
      if (disabled) return;

      const success = onReaction(emoji);
      if (success) {
        setLastTapped(emoji);
        setTimeout(() => setLastTapped(null), 200);
      }
    },
    [onReaction, disabled]
  );

  if (variant === "compact") {
    return (
      <CompactReactionBar
        onReaction={handleReaction}
        quickEmojis={quickEmojis as string[]}
        disabled={disabled}
        className={className}
      />
    );
  }

  const isVertical = variant === "vertical";

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        isVertical ? "flex-col" : "flex-row",
        className
      )}
    >
      {/* Quick reaction buttons */}
      <TooltipProvider delayDuration={300}>
        <div
          className={cn(
            "flex gap-1",
            isVertical ? "flex-col" : "flex-row flex-wrap"
          )}
        >
          {quickEmojis.map((emoji) => (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <motion.button
                  whileTap={{ scale: 1.4 }}
                  animate={lastTapped === emoji ? { scale: [1, 1.3, 1] } : {}}
                  onClick={() => handleReaction(emoji)}
                  disabled={disabled}
                  className={cn(
                    "text-2xl p-1.5 rounded-full transition-all",
                    "hover:bg-primary/10 active:bg-primary/20",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                  )}
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "right" : "top"}>
                <p>React with {emoji}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Show all emojis button */}
        <Popover open={showAll} onOpenChange={setShowAll}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              className={cn(
                "p-1.5 h-auto",
                isVertical ? "mt-1" : "ml-1"
              )}
              aria-label="Show all reactions"
            >
              {showAll ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <Smile className="h-4 w-4" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side={isVertical ? "right" : "top"}
            className="w-64 p-2"
          >
            <div className="grid grid-cols-6 gap-1">
              {ALLOWED_EMOJIS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 1.3 }}
                  onClick={() => {
                    handleReaction(emoji);
                    setShowAll(false);
                  }}
                  className={cn(
                    "text-xl p-1.5 rounded-md transition-colors",
                    "hover:bg-primary/10 active:bg-primary/20",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                  )}
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </div>
  );
};

/**
 * Compact single-button variant that expands on click
 */
interface CompactReactionBarProps {
  onReaction: (emoji: string) => void;
  quickEmojis: string[];
  disabled?: boolean;
  className?: string;
}

const CompactReactionBar = ({
  onReaction,
  quickEmojis,
  disabled,
  className,
}: CompactReactionBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Popover open={isExpanded} onOpenChange={setIsExpanded}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn("gap-1.5 bg-transparent border-white/20 text-white hover:bg-white/10", className)}
        >
          <span className="text-lg">👍</span>
          <span className="hidden sm:inline text-xs">React</span>
          <ChevronUp
            className={cn(
              "h-3 w-3 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-72 p-3 bg-background/95 backdrop-blur-sm border-white/20">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center mb-2">Choose your reaction</p>
          <div className="grid grid-cols-6 gap-2">
            {ALLOWED_EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                whileTap={{ scale: 1.3 }}
                onClick={() => {
                  onReaction(emoji);
                  setIsExpanded(false);
                }}
                className={cn(
                  "text-2xl p-2 rounded-lg transition-colors",
                  "hover:bg-primary/20 active:bg-primary/30",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50"
                )}
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Floating action button style reaction trigger
 */
interface ReactionFabProps {
  onReaction: (emoji: string) => boolean;
  popularEmojis?: string[];
  disabled?: boolean;
  className?: string;
}

export const ReactionFab = ({
  onReaction,
  popularEmojis,
  disabled = false,
  className = "",
}: ReactionFabProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const quickEmojis = popularEmojis?.slice(0, 8) || ALLOWED_EMOJIS.slice(0, 8);

  const handleReaction = useCallback(
    (emoji: string) => {
      const success = onReaction(emoji);
      if (success) {
        setIsOpen(false);
      }
    },
    [onReaction]
  );

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full mb-2 right-0 bg-background border rounded-lg shadow-lg p-2"
          >
            <div className="grid grid-cols-4 gap-1">
              {quickEmojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 1.3 }}
                  onClick={() => handleReaction(emoji)}
                  className={cn(
                    "text-2xl p-2 rounded-md transition-colors",
                    "hover:bg-primary/10 active:bg-primary/20"
                  )}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        variant={isOpen ? "default" : "outline"}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="rounded-full h-14 w-14 p-0 shadow-lg"
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="text-2xl"
        >
          {isOpen ? "✕" : "👍"}
        </motion.span>
      </Button>
    </div>
  );
};
