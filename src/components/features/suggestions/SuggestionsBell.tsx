// src/components/features/suggestions/SuggestionsBell.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSuggestions } from "@/hooks/use-suggestions";
import { SuggestionsDropdown } from "./SuggestionsDropdown";

interface SuggestionsBellProps {
  eventId: string;
  className?: string;
  onViewProfile?: (userId: string) => void;
  onStartChat?: (userId: string, userName: string) => void;
  onJoinCircle?: (circleId: string) => void;
}

/**
 * Bell icon button with popover showing AI suggestions.
 * Displays unread count badge and opens a dropdown with suggestion cards.
 *
 * Features:
 * - Animated unread badge
 * - Auto-marks as read when opened
 * - Actions for viewing profiles and starting chats
 * - Clear all functionality
 */
export const SuggestionsBell = ({
  eventId,
  className,
  onViewProfile,
  onStartChat,
  onJoinCircle,
}: SuggestionsBellProps) => {
  const {
    suggestions,
    unreadCount,
    hasSuggestions,
    markAllAsRead,
    dismissSuggestion,
    clearAll,
  } = useSuggestions({ eventId, showToasts: false });

  const [open, setOpen] = React.useState(false);

  // Mark all as read when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 hover:bg-amber-500/10 hover:text-amber-600 transition-colors",
            className
          )}
          aria-label={`AI suggestions${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Sparkles className="h-5 w-5" />

          {/* Unread count badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-[10px] font-semibold text-white flex items-center justify-center shadow-sm"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-amber-500/5 to-orange-500/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h4 className="font-semibold text-sm">AI Suggestions</h4>
          </div>
          {hasSuggestions && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1.5"
              onClick={clearAll}
            >
              <Trash2 className="h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>

        {/* Suggestions list */}
        <SuggestionsDropdown
          suggestions={suggestions}
          onViewProfile={(userId) => {
            onViewProfile?.(userId);
            setOpen(false);
          }}
          onStartChat={(userId, userName) => {
            onStartChat?.(userId, userName);
            setOpen(false);
          }}
          onJoinCircle={(circleId) => {
            onJoinCircle?.(circleId);
            setOpen(false);
          }}
          onDismiss={dismissSuggestion}
          maxHeight="320px"
        />

        {/* Footer hint */}
        {hasSuggestions && (
          <div className="p-2 border-t bg-muted/30">
            <p className="text-[10px] text-muted-foreground text-center">
              Suggestions update based on your activity
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
