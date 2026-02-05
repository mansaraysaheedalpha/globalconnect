// src/components/features/suggestions/SuggestionToast.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users } from "lucide-react";
import { ConnectionSuggestion, CircleSuggestion, Suggestion } from "@/hooks/use-suggestions";

interface SuggestionToastProps {
  suggestion: Suggestion;
}

/**
 * Toast content component for displaying AI suggestions.
 * Used with the sonner toast library for real-time notifications.
 */
export const SuggestionToast = ({ suggestion }: SuggestionToastProps) => {
  if (suggestion.type === "CONNECTION_SUGGESTION") {
    return <ConnectionToast suggestion={suggestion} />;
  }

  return <CircleToast suggestion={suggestion} />;
};

const ConnectionToast = ({ suggestion }: { suggestion: ConnectionSuggestion }) => {
  const initials = suggestion.suggestedUserName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-10 w-10 border-2 border-primary/20">
        <AvatarImage src={suggestion.suggestedUserAvatar} alt={suggestion.suggestedUserName} />
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
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
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {suggestion.reason}
        </p>
        <Badge variant="secondary" className="mt-1.5 text-[10px] px-1.5 py-0">
          {suggestion.matchScore}% match
        </Badge>
      </div>
    </div>
  );
};

const CircleToast = ({ suggestion }: { suggestion: CircleSuggestion }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
        <Users className="h-5 w-5 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {suggestion.circleName}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {suggestion.memberCount} members
        </p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {suggestion.reason}
        </p>
      </div>
    </div>
  );
};
