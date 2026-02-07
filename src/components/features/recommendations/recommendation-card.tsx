// src/components/features/recommendations/recommendation-card.tsx
"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Linkedin,
  Github,
  Twitter,
} from "lucide-react";
import { Recommendation } from "@/hooks/use-recommendations";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onStartChat: (userId: string, userName: string) => void;
  onConnect?: (userId: string) => void;
  onViewed?: (recommendationId: string) => void;
}

/**
 * RecommendationCard displays an AI-recommended connection with:
 * - User info and match score
 * - Why they should connect (LLM-generated reasons)
 * - Actions: Connect, Chat
 *
 * Security:
 * - All text content is rendered safely (no dangerouslySetInnerHTML)
 * - No sensitive user data is displayed
 */
export const RecommendationCard = ({
  recommendation,
  onStartChat,
  onConnect,
  onViewed,
}: RecommendationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, matchScore, reasons, conversationStarters, viewed, connected } = recommendation;

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle expand/collapse
  const handleToggleExpand = useCallback(() => {
    if (!isExpanded && !viewed && onViewed) {
      onViewed(recommendation.id);
    }
    setIsExpanded(!isExpanded);
  }, [isExpanded, viewed, recommendation.id, onViewed]);

  // Handle start chat
  const handleStartChat = useCallback(() => {
    onStartChat(user.id, user.name);
  }, [onStartChat, user.id, user.name]);

  // Handle connect
  const handleConnect = useCallback(() => {
    if (onConnect) {
      onConnect(user.id);
    }
  }, [onConnect, user.id]);

  // Get match score color
  const getMatchScoreColor = (score: number): string => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-amber-100 text-amber-800";
    return "bg-slate-100 text-slate-800";
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        {/* Main Info Row */}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold truncate">{user.name}</h4>
              <Badge
                variant="secondary"
                className={`shrink-0 ${getMatchScoreColor(matchScore)}`}
              >
                {matchScore}% match
              </Badge>
            </div>

            {(user.role || user.company) && (
              <p className="text-sm text-muted-foreground truncate">
                {user.role}
                {user.role && user.company && " at "}
                {user.company}
              </p>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-2 mt-1.5">
              {user.linkedInUrl && (
                <a
                  href={user.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-blue-600 transition-colors"
                  aria-label="LinkedIn profile"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {user.githubUsername && (
                <a
                  href={`https://github.com/${user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub profile"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {user.twitterHandle && (
                <a
                  href={`https://twitter.com/${user.twitterHandle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-blue-400 transition-colors"
                  aria-label="Twitter profile"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {user.industry && (
                <Badge variant="outline" className="text-xs">
                  {user.industry}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* First Reason - Always Visible */}
        {reasons.length > 0 && (
          <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-md">
            <p className="text-sm">
              <span className="font-medium text-amber-700 dark:text-amber-400">
                Why connect:
              </span>{" "}
              {reasons[0]}
            </p>
          </div>
        )}

        {/* Expandable Section */}
        {isExpanded && (
          <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Additional Reasons */}
            {reasons.slice(1).map((reason, i) => (
              <p
                key={i}
                className="text-sm text-muted-foreground pl-3 border-l-2 border-amber-200 dark:border-amber-700"
              >
                {reason}
              </p>
            ))}
          </div>
        )}

        {/* Actions Row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            aria-expanded={isExpanded}
            aria-controls={`recommendation-details-${recommendation.id}`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Why connect
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            {onConnect && (
              <Button
                variant={connected ? "secondary" : "default"}
                size="sm"
                onClick={handleConnect}
                disabled={connected}
                aria-label={connected ? "Already connected" : "Mark as connected"}
                className={connected ? "" : "bg-green-600 hover:bg-green-700 text-white"}
              >
                {connected ? "Connected ✓" : "Connect"}
              </Button>
            )}
            <Button size="sm" onClick={handleStartChat}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
