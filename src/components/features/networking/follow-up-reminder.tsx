// src/components/features/networking/follow-up-reminder.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import {
  Connection,
  FollowUpSuggestion,
  FollowUpTone,
  getOtherUser,
  formatUserName,
  getUserInitials,
  getStrengthLabel,
  getStrengthColor,
  getStrengthBgColor,
  formatTimeAgo,
} from "@/types/connection";
import {
  Mail,
  Sparkles,
  Clock,
  CheckCircle,
  ChevronRight,
  Send,
  RefreshCw,
} from "lucide-react";

interface FollowUpReminderProps {
  connections: Connection[];
  currentUserId: string;
  onGenerateSuggestion: (
    connectionId: string,
    tone: FollowUpTone
  ) => Promise<FollowUpSuggestion>;
  onSendFollowUp: (connectionId: string, message: string) => Promise<void>;
  isLoading?: boolean;
}

export function FollowUpReminder({
  connections,
  currentUserId,
  onGenerateSuggestion,
  onSendFollowUp,
  isLoading = false,
}: FollowUpReminderProps) {
  const [selectedConnection, setSelectedConnection] =
    useState<Connection | null>(null);
  const [suggestion, setSuggestion] = useState<FollowUpSuggestion | null>(null);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<FollowUpTone>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingConnections = connections.filter((c) => !c.followUpSentAt);

  const handleOpenFollowUp = async (connection: Connection) => {
    setSelectedConnection(connection);
    setMessage(connection.followUpMessage || "");
    setSuggestion(null);
    setDialogOpen(true);
  };

  const handleGenerateSuggestion = async () => {
    if (!selectedConnection) return;

    setIsGenerating(true);
    try {
      const result = await onGenerateSuggestion(selectedConnection.id, tone);
      setSuggestion(result);
      setMessage(result.suggestedMessage);
    } catch (error) {
      console.error("Failed to generate suggestion:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendFollowUp = async () => {
    if (!selectedConnection || !message.trim()) return;

    setIsSending(true);
    try {
      await onSendFollowUp(selectedConnection.id, message);
      setDialogOpen(false);
      setSelectedConnection(null);
      setMessage("");
      setSuggestion(null);
    } catch (error) {
      console.error("Failed to send follow-up:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6" />
        </CardContent>
      </Card>
    );
  }

  if (pendingConnections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
          <h3 className="font-semibold text-lg">All caught up!</h3>
          <p className="text-muted-foreground text-sm">
            You&apos;ve followed up with all your connections.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Follow-up Reminders
            </CardTitle>
            <Badge variant="secondary">
              {pendingConnections.length} pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingConnections.slice(0, 5).map((connection) => {
            const otherUser = getOtherUser(connection, currentUserId);
            return (
              <div
                key={connection.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleOpenFollowUp(connection)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser.avatarUrl || undefined} />
                    <AvatarFallback>
                      {getUserInitials(otherUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{formatUserName(otherUser)}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Connected {formatTimeAgo(connection.connectedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${getStrengthBgColor(connection.strength)} ${getStrengthColor(connection.strength)}`}
                  >
                    {getStrengthLabel(connection.strength)}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            );
          })}

          {pendingConnections.length > 5 && (
            <Button variant="ghost" className="w-full" size="sm">
              View all {pendingConnections.length} pending follow-ups
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Follow-up
            </DialogTitle>
          </DialogHeader>

          {selectedConnection && (
            <div className="space-y-4">
              {/* Recipient info */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={
                      getOtherUser(selectedConnection, currentUserId)
                        .avatarUrl || undefined
                    }
                  />
                  <AvatarFallback>
                    {getUserInitials(
                      getOtherUser(selectedConnection, currentUserId)
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {formatUserName(
                      getOtherUser(selectedConnection, currentUserId)
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getOtherUser(selectedConnection, currentUserId).email}
                  </p>
                </div>
              </div>

              {/* AI suggestion controls */}
              <div className="flex items-center gap-2">
                <Select
                  value={tone}
                  onValueChange={(v) => setTone(v as FollowUpTone)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={handleGenerateSuggestion}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "AI Suggest"}
                </Button>
              </div>

              {/* Talking points from AI */}
              {suggestion && suggestion.talkingPoints.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    Suggested talking points:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {suggestion.talkingPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Message textarea */}
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your follow-up message..."
                rows={6}
                className="resize-none"
              />

              {/* Context info */}
              {selectedConnection.contexts.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Shared context: </span>
                  {selectedConnection.contexts
                    .map((c) => c.contextValue)
                    .join(", ")}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendFollowUp}
              disabled={!message.trim() || isSending}
              className="gap-2"
            >
              {isSending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSending ? "Sending..." : "Send Follow-up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FollowUpReminder;
