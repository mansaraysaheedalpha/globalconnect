// src/components/features/connections/connection-card.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  MoreVertical,
  Trophy,
  Send,
  Check,
  Calendar,
  Users,
  Sparkles,
} from "lucide-react";
import {
  Connection,
  ConnectionUser,
  getOtherUser,
  formatUserName,
} from "@/types/connection";
import { OutcomeReporter } from "./outcome-reporter";

interface ConnectionCardProps {
  connection: Connection;
  currentUserId: string;
  onSendFollowUp?: (connectionId: string) => void;
  onReportOutcome?: (connectionId: string, outcome: { outcomeType: string; outcomeNotes?: string }) => void;
  onStartDm?: (userId: string) => void;
}

export const ConnectionCard = ({
  connection,
  currentUserId,
  onSendFollowUp,
  onReportOutcome,
  onStartDm,
}: ConnectionCardProps) => {
  const [showOutcomeReporter, setShowOutcomeReporter] = useState(false);
  const otherUser = getOtherUser(connection, currentUserId);
  const otherUserName = formatUserName(otherUser);

  const getInitials = (user: ConnectionUser) => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "??";
  };

  const getConnectionTypeLabel = (type: string) => {
    switch (type) {
      case "PROXIMITY_PING":
        return "Met nearby";
      case "DM_INITIATED":
        return "Started conversation";
      case "SESSION_QA":
        return "Q&A interaction";
      case "MANUAL_EXCHANGE":
        return "Contact exchanged";
      default:
        return "Connected";
    }
  };

  const getContextIcon = (type: string) => {
    switch (type) {
      case "SHARED_SESSION":
        return <Calendar className="h-3 w-3" />;
      case "SHARED_INTEREST":
        return <Sparkles className="h-3 w-3" />;
      case "MUTUAL_CONNECTION":
        return <Users className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const hasFollowUp = !!connection.followUpSentAt;
  const hasOutcome = !!connection.outcomeType;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.avatarUrl || undefined} alt={otherUserName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(otherUser)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-sm truncate">{otherUserName}</h4>
                  <p className="text-xs text-muted-foreground">{otherUser.email}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onStartDm && (
                      <DropdownMenuItem onClick={() => onStartDm(otherUser.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send message
                      </DropdownMenuItem>
                    )}
                    {onSendFollowUp && !hasFollowUp && (
                      <DropdownMenuItem onClick={() => onSendFollowUp(connection.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Mark follow-up sent
                      </DropdownMenuItem>
                    )}
                    {onReportOutcome && !hasOutcome && (
                      <DropdownMenuItem onClick={() => setShowOutcomeReporter(true)}>
                        <Trophy className="h-4 w-4 mr-2" />
                        Report outcome
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {getConnectionTypeLabel(connection.connectionType)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(connection.connectedAt), "MMM d, yyyy")}
                </span>
                {hasFollowUp && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    <Check className="h-3 w-3 mr-1" />
                    Followed up
                  </Badge>
                )}
                {hasOutcome && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                    <Trophy className="h-3 w-3 mr-1" />
                    {connection.outcomeType?.replace("_", " ").toLowerCase()}
                  </Badge>
                )}
              </div>

              {connection.initialMessage && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  "{connection.initialMessage}"
                </p>
              )}

              {connection.contexts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-xs text-muted-foreground">Why connect:</span>
                  {connection.contexts.slice(0, 3).map((ctx) => (
                    <Badge key={ctx.id} variant="secondary" className="text-xs">
                      {getContextIcon(ctx.contextType)}
                      <span className="ml-1">{ctx.contextValue}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showOutcomeReporter && onReportOutcome && (
        <OutcomeReporter
          connectionId={connection.id}
          otherUserName={otherUserName}
          open={showOutcomeReporter}
          onOpenChange={setShowOutcomeReporter}
          onSubmit={(outcome) => {
            onReportOutcome(connection.id, outcome);
            setShowOutcomeReporter(false);
          }}
        />
      )}
    </>
  );
};
