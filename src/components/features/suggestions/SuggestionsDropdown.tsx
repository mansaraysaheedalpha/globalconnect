// src/components/features/suggestions/SuggestionsDropdown.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Users,
  MessageSquare,
  User,
  X,
  Inbox,
} from "lucide-react";
import {
  ConnectionSuggestion,
  CircleSuggestion,
  Suggestion,
} from "@/hooks/use-suggestions";

interface SuggestionsDropdownProps {
  suggestions: Suggestion[];
  onViewProfile?: (userId: string) => void;
  onStartChat?: (userId: string, userName: string) => void;
  onJoinCircle?: (circleId: string) => void;
  onDismiss: (index: number) => void;
  maxHeight?: string;
}

/**
 * Dropdown list of AI suggestions with actions.
 * Used inside the SuggestionsBell popover.
 */
export const SuggestionsDropdown = ({
  suggestions,
  onViewProfile,
  onStartChat,
  onJoinCircle,
  onDismiss,
  maxHeight = "320px",
}: SuggestionsDropdownProps) => {
  if (suggestions.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No suggestions yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          AI is analyzing your profile to find matches
        </p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="overflow-y-auto">
      <AnimatePresence mode="popLayout">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={`${suggestion.type}-${index}-${suggestion.timestamp}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {suggestion.type === "CONNECTION_SUGGESTION" ? (
              <ConnectionSuggestionItem
                suggestion={suggestion}
                onViewProfile={onViewProfile}
                onStartChat={onStartChat}
                onDismiss={() => onDismiss(index)}
              />
            ) : (
              <CircleSuggestionItem
                suggestion={suggestion}
                onJoinCircle={onJoinCircle}
                onDismiss={() => onDismiss(index)}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </ScrollArea>
  );
};

const ConnectionSuggestionItem = ({
  suggestion,
  onViewProfile,
  onStartChat,
  onDismiss,
}: {
  suggestion: ConnectionSuggestion;
  onViewProfile?: (userId: string) => void;
  onStartChat?: (userId: string, userName: string) => void;
  onDismiss: () => void;
}) => {
  const initials = suggestion.suggestedUserName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors group">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/10 flex-shrink-0">
          <AvatarImage
            src={suggestion.suggestedUserAvatar}
            alt={suggestion.suggestedUserName}
          />
          <AvatarFallback className="bg-primary/5 text-primary text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-500 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  {suggestion.suggestedUserName}
                </span>
              </div>
              {(suggestion.suggestedUserTitle || suggestion.suggestedUserCompany) && (
                <p className="text-xs text-muted-foreground truncate">
                  {suggestion.suggestedUserTitle}
                  {suggestion.suggestedUserTitle && suggestion.suggestedUserCompany && " at "}
                  {suggestion.suggestedUserCompany}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDismiss}
              aria-label="Dismiss suggestion"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {suggestion.reason}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 border-green-500/20"
            >
              {suggestion.matchScore}% match
            </Badge>

            {suggestion.sharedInterests && suggestion.sharedInterests.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {suggestion.sharedInterests.length} shared interests
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            {onViewProfile && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => onViewProfile(suggestion.suggestedUserId)}
              >
                <User className="h-3 w-3" />
                Profile
              </Button>
            )}
            {onStartChat && (
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() =>
                  onStartChat(suggestion.suggestedUserId, suggestion.suggestedUserName)
                }
              >
                <MessageSquare className="h-3 w-3" />
                Chat
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CircleSuggestionItem = ({
  suggestion,
  onJoinCircle,
  onDismiss,
}: {
  suggestion: CircleSuggestion;
  onJoinCircle?: (circleId: string) => void;
  onDismiss: () => void;
}) => {
  return (
    <div className="p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
          <Users className="h-5 w-5 text-purple-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-500 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  {suggestion.circleName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {suggestion.memberCount} members
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDismiss}
              aria-label="Dismiss suggestion"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {suggestion.reason}
          </p>

          {suggestion.circleDescription && (
            <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1 italic">
              {suggestion.circleDescription}
            </p>
          )}

          {onJoinCircle && (
            <div className="mt-2">
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => onJoinCircle(suggestion.circleId)}
              >
                <Users className="h-3 w-3" />
                Join Circle
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
