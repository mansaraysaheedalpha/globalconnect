// src/components/features/networking/connection-card.tsx
"use client";

import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Linkedin,
  Github,
  Twitter,
  User,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EventConnection } from "@/hooks/use-event-connections";

interface ConnectionCardProps {
  connection: EventConnection;
  onMessage: (userId: string, userName: string) => void;
  onViewProfile: (userId: string) => void;
}

/**
 * ConnectionCard displays a user you've connected with at an event:
 * - User info and original match score
 * - When you connected
 * - Social links (LinkedIn, GitHub, Twitter)
 * - Actions: Message, View Profile
 *
 * Security:
 * - All text content is rendered safely (no dangerouslySetInnerHTML)
 * - No sensitive user data is displayed
 */
export const ConnectionCard = ({
  connection,
  onMessage,
  onViewProfile,
}: ConnectionCardProps) => {
  const { user, matchScore, connectedAt, reasons } = connection;

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle message
  const handleMessage = useCallback(() => {
    onMessage(user.id, user.name);
  }, [onMessage, user.id, user.name]);

  // Handle view profile
  const handleViewProfile = useCallback(() => {
    onViewProfile(user.id);
  }, [onViewProfile, user.id]);

  // Format connected at date
  const connectedTimeAgo = connectedAt
    ? formatDistanceToNow(new Date(connectedAt), { addSuffix: true })
    : "Recently";

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        {/* Main Info Row */}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0 cursor-pointer" onClick={handleViewProfile}>
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4
                className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                onClick={handleViewProfile}
              >
                {user.name}
              </h4>
              <Badge
                variant="secondary"
                className="shrink-0 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
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

            {/* Connected time */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Connected {connectedTimeAgo}</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 mt-2">
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
            </div>
          </div>
        </div>

        {/* Connection reason - show first reason if available */}
        {reasons && reasons.length > 0 && (
          <div className="mt-3 p-2.5 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {reasons[0]}
            </p>
          </div>
        )}

        {/* Actions Row */}
        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewProfile}
            aria-label="View profile"
          >
            <User className="h-4 w-4 mr-1" />
            Profile
          </Button>
          <Button size="sm" onClick={handleMessage} aria-label="Send message">
            <MessageCircle className="h-4 w-4 mr-1" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionCard;
