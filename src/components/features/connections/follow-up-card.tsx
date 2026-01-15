// src/components/features/connections/follow-up-card.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Send,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  Users,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  Connection,
  ConnectionUser,
  getOtherUser,
  formatUserName,
} from "@/types/connection";

interface FollowUpCardProps {
  connection: Connection;
  currentUserId: string;
  suggestedMessage?: string;
  onSendFollowUp: (connectionId: string, message: string) => Promise<boolean>;
  onStartDm?: (userId: string) => void;
}

export const FollowUpCard = ({
  connection,
  currentUserId,
  suggestedMessage,
  onSendFollowUp,
  onStartDm,
}: FollowUpCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState(suggestedMessage || "");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const otherUser = getOtherUser(connection, currentUserId);
  const otherUserName = formatUserName(otherUser);
  const firstName = otherUserName.split(" ")[0];

  const getInitials = (user: ConnectionUser) => {
    const first = user.firstName || "";
    const last = user.lastName || "";
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "??";
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

  const generateDefaultMessage = () => {
    const contexts = connection.contexts || [];

    // Find shared session context
    const sharedSession = contexts.find((c) => c.contextType === "SHARED_SESSION");
    if (sharedSession) {
      return `Hi ${firstName}, great meeting you! I enjoyed the "${sharedSession.contextValue}" session too. Would love to continue our conversation about what we discussed.`;
    }

    // Find shared interest context
    const sharedInterest = contexts.find((c) => c.contextType === "SHARED_INTEREST");
    if (sharedInterest) {
      return `Hi ${firstName}, it was great connecting! I noticed we're both interested in ${sharedInterest.contextValue}. Would love to exchange ideas sometime.`;
    }

    // Default message with initial context if available
    if (connection.initialMessage) {
      return `Hi ${firstName}, it was great connecting at the event. You mentioned "${connection.initialMessage}" - I'd love to continue our conversation!`;
    }

    return `Hi ${firstName}, it was great meeting you at the event. I'd love to stay in touch and continue our conversation!`;
  };

  const handleUseSuggested = () => {
    setMessage(suggestedMessage || generateDefaultMessage());
    setIsExpanded(true);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    const success = await onSendFollowUp(connection.id, message);
    setIsSending(false);

    if (success) {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatarUrl || undefined} alt={otherUserName} />
              <AvatarFallback className="bg-green-100 text-green-700">
                {getInitials(otherUser)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-green-700">Follow-up sent to {otherUserName}</p>
              <p className="text-sm text-green-600">
                Sent {format(new Date(), "MMM d 'at' h:mm a")}
              </p>
            </div>
            <Send className="h-5 w-5 text-green-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherUser.avatarUrl || undefined} alt={otherUserName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(otherUser)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-sm">{otherUserName}</h4>
                <p className="text-xs text-muted-foreground">{otherUser.email}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {format(new Date(connection.connectedAt), "MMM d")}
              </Badge>
            </div>

            {connection.initialMessage && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                "{connection.initialMessage}"
              </p>
            )}

            {connection.contexts && connection.contexts.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
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

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="flex items-center gap-2 mt-4">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide message
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Write follow-up
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            {!isExpanded && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUseSuggested}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Use suggested
              </Button>
            )}

            {onStartDm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStartDm(otherUser.id)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
          </div>

          <CollapsibleContent className="mt-3">
            <Textarea
              placeholder={`Write a follow-up message to ${firstName}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none"
            />

            {!message && (
              <Button
                variant="link"
                size="sm"
                className="mt-1 p-0 h-auto text-xs"
                onClick={handleUseSuggested}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Generate suggested message
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      {isExpanded && (
        <CardFooter className="pt-0">
          <Button
            className="w-full"
            onClick={handleSend}
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Follow-up
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
