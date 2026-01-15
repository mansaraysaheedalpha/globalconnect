// src/components/features/sponsors/lead-card.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageSquare, Clock, Activity } from "lucide-react";
import { Lead } from "@/types/sponsor";
import { LeadIntentBadge } from "./lead-intent-badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface LeadCardProps {
  lead: Lead;
  onContact?: (lead: Lead) => void;
  className?: string;
}

const ACTION_LABELS: Record<string, string> = {
  BOOTH_VISIT: "Visited booth",
  CONTENT_DOWNLOADED: "Downloaded content",
  DEMO_REQUESTED: "Requested demo",
  CONTACT_SHARED: "Shared contact",
  SESSION_ATTENDED: "Attended session",
  AD_CLICKED: "Clicked ad",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatAction(action: string): string {
  return ACTION_LABELS[action] || action;
}

export function LeadCard({ lead, onContact, className }: LeadCardProps) {
  const timeAgo = formatDistanceToNow(new Date(lead.timestamp), {
    addSuffix: true,
  });

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        lead.intentScore >= 70 && "border-red-200 bg-red-50/30",
        lead.intentScore >= 40 &&
          lead.intentScore < 70 &&
          "border-yellow-200 bg-yellow-50/30",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(lead.userName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{lead.userName}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </p>
            </div>
          </div>
          <LeadIntentBadge intentScore={lead.intentScore} showScore />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {/* Latest Action */}
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatAction(lead.action)}</span>
          </div>

          {/* Action History */}
          {lead.actions.length > 1 && (
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-1">
                Recent activity ({lead.actions.length} actions)
              </p>
              <div className="flex flex-wrap gap-1">
                {lead.actions.slice(0, 5).map((entry, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-block px-2 py-0.5 text-xs bg-muted rounded">
                          {formatAction(entry.action)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {formatDistanceToNow(new Date(entry.timestamp), {
                          addSuffix: true,
                        })}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}

          {/* Contact Button */}
          {onContact && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onContact(lead)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Lead
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
