// src/app/(sponsor)/sponsor/messages/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  Users,
  Clock,
  Mail,
  Zap,
  AlertCircle,
  RefreshCw,
  Inbox,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";

interface SponsorStats {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  leads_contacted: number;
  leads_converted: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

export default function MessagesPage() {
  const { token } = useAuthStore();
  const { activeSponsorId, activeSponsorName } = useSponsorStore();
  const [stats, setStats] = useState<SponsorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audience, setAudience] = useState("all");
  const [message, setMessage] = useState({
    subject: "",
    body: "",
  });

  // Fetch stats for audience counts
  const fetchStats = useCallback(async () => {
    if (!token || !activeSponsorId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch lead stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  }, [token, activeSponsorId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSend = async () => {
    if (!message.subject || !message.body) {
      toast.error("Please fill in both subject and message body.");
      return;
    }

    if (!activeSponsorId) {
      toast.error("No sponsor selected.");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/${activeSponsorId}/campaigns`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `Campaign ${new Date().toLocaleString()}`,
            subject: message.subject,
            message_body: message.body,
            audience_type: audience,
            metadata: {},
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to send campaign");
      }

      const campaign = await response.json();

      toast.success(
        `Campaign "${campaign.name}" has been queued! Your message is being sent to ${campaign.total_recipients} recipient${campaign.total_recipients !== 1 ? 's' : ''}.`
      );

      setMessage({ subject: "", body: "" });

      // Refresh stats after successful send
      fetchStats();
    } catch (err) {
      console.error("Failed to send campaign:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to send campaign. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!activeSponsorId) {
      toast.error("No sponsor selected.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors-campaigns/sponsors/${activeSponsorId}/campaigns/generate-ai-message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audience_type: audience,
            tone: "professional",
            include_cta: true,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate AI message");
      }

      const result = await response.json();

      setMessage({
        subject: result.subject,
        body: result.body,
      });

      toast.success("AI message generated! Feel free to customize it.", {
        description: result.reasoning,
      });
    } catch (err) {
      console.error("Failed to generate AI message:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "AI generation failed. Please try again or write manually."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate audience counts from real stats
  const audienceCounts: Record<string, number> = {
    all: stats?.total_leads ?? 0,
    hot: stats?.hot_leads ?? 0,
    warm: stats?.warm_leads ?? 0,
    new: (stats?.total_leads ?? 0) - (stats?.leads_contacted ?? 0),
    contacted: stats?.leads_contacted ?? 0,
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Messages</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchStats} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeSponsorId && !isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              Please select a sponsor event to access messages.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            {activeSponsorName ? `Send follow-up messages to ${activeSponsorName} leads` : "Send follow-up messages to your captured leads"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compose Message */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Compose Message
              </CardTitle>
              <CardDescription>
                Create a new message to send to your leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Generation Button */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    AI-Powered Message Generator
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Let Claude AI write a personalized message based on your event and audience
                  </p>
                </div>
                <Button
                  onClick={handleAIGenerate}
                  disabled={isGenerating || audienceCounts[audience] === 0}
                  variant="default"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>

              {/* Audience Selection */}
              <div className="space-y-2">
                <Label>Recipients</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Leads ({audienceCounts.all})</SelectItem>
                      <SelectItem value="hot">Hot Leads Only ({audienceCounts.hot})</SelectItem>
                      <SelectItem value="warm">Warm Leads ({audienceCounts.warm})</SelectItem>
                      <SelectItem value="new">New (Not Contacted) ({audienceCounts.new})</SelectItem>
                      <SelectItem value="contacted">Previously Contacted ({audienceCounts.contacted})</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  {audienceCounts[audience]} recipient{audienceCounts[audience] !== 1 ? "s" : ""} will receive this message
                </p>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Thank you for visiting our booth!"
                  value={message.subject}
                  onChange={(e) =>
                    setMessage({ ...message, subject: e.target.value })
                  }
                />
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  placeholder="Write your message here..."
                  rows={8}
                  value={message.body}
                  onChange={(e) =>
                    setMessage({ ...message, body: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{name}}"} to personalize with the recipient&apos;s name
                </p>
              </div>

              {/* Send Options */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleSend}
                  disabled={isSending || audienceCounts[audience] === 0}
                >
                  {isSending ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Now
                    </>
                  )}
                </Button>
                <Button variant="outline" disabled={isSending}>
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Message Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Templates
              </CardTitle>
              <CardDescription>
                Use pre-written templates to save time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex-col items-start"
                  onClick={() =>
                    setMessage({
                      subject: "Thank you for visiting our booth!",
                      body: "Hi {{name}},\n\nThank you for stopping by our booth today! It was great meeting you.\n\nIf you have any questions about what we discussed, please don't hesitate to reach out.\n\nBest regards,\nYour Name",
                    })
                  }
                >
                  <span className="font-medium">Thank You</span>
                  <span className="text-xs text-muted-foreground">
                    Post-visit appreciation message
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex-col items-start"
                  onClick={() =>
                    setMessage({
                      subject: "Your demo request - Let's schedule!",
                      body: "Hi {{name}},\n\nThank you for your interest in a demo! I'd love to show you how our solution can help your team.\n\nPlease let me know your availability for a 30-minute call this week.\n\nLooking forward to connecting!\n\nBest,\nYour Name",
                    })
                  }
                >
                  <span className="font-medium">Demo Follow-up</span>
                  <span className="text-xs text-muted-foreground">
                    Schedule a demo call
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex-col items-start"
                  onClick={() =>
                    setMessage({
                      subject: "Here are the resources you requested",
                      body: "Hi {{name}},\n\nAs promised, here are the resources we discussed:\n\n- [Resource 1]\n- [Resource 2]\n- [Resource 3]\n\nLet me know if you have any questions!\n\nBest,\nYour Name",
                    })
                  }
                >
                  <span className="font-medium">Resource Share</span>
                  <span className="text-xs text-muted-foreground">
                    Send requested materials
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex-col items-start"
                  onClick={() =>
                    setMessage({
                      subject: "Quick follow-up from the event",
                      body: "Hi {{name}},\n\nI wanted to reach out while our conversation is still fresh. I think there's a great opportunity for us to work together.\n\nWould you be open to a quick call next week to explore this further?\n\nBest,\nYour Name",
                    })
                  }
                >
                  <span className="font-medium">General Follow-up</span>
                  <span className="text-xs text-muted-foreground">
                    Standard follow-up message
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Lead Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Leads</span>
                    <span className="font-medium">{stats?.total_leads ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hot Leads</span>
                    <span className="font-medium">{stats?.hot_leads ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Contacted</span>
                    <span className="font-medium">{stats?.leads_contacted ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Converted</span>
                    <span className="font-medium">{stats?.leads_converted ?? 0}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Message History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto opacity-50 mb-2" />
                <p className="text-sm font-medium">No messages sent yet</p>
                <p className="text-xs mt-1">
                  Your message history will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
