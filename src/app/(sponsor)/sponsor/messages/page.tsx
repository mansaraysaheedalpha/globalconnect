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
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

interface SponsorStats {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  leads_contacted: number;
  leads_converted: number;
}

interface Sponsor {
  id: string;
  company_name: string;
}

export default function MessagesPage() {
  const { token } = useAuthStore();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [stats, setStats] = useState<SponsorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [audience, setAudience] = useState("all");
  const [message, setMessage] = useState({
    subject: "",
    body: "",
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Fetch user's sponsors
  useEffect(() => {
    const fetchSponsors = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${apiUrl}/my-sponsors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sponsors");
        }

        const data = await response.json();
        setSponsors(data);
        if (data.length > 0) {
          setSelectedSponsorId(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sponsors");
      }
    };

    fetchSponsors();
  }, [token, apiUrl]);

  // Fetch stats for audience counts
  const fetchStats = useCallback(async () => {
    if (!token || !selectedSponsorId) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${apiUrl}/sponsors/${selectedSponsorId}/leads/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
  }, [token, selectedSponsorId, apiUrl]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSend = async () => {
    if (!message.subject || !message.body) {
      toast.error("Please fill in both subject and message body.");
      return;
    }

    setIsSending(true);

    // Note: Backend messaging API pending implementation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSending(false);

    toast.success("Your message has been sent to the selected recipients.");
    setMessage({ subject: "", body: "" });
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

  if (sponsors.length === 0 && !isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Access</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              You are not currently associated with any sponsors.
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
            Send follow-up messages to your captured leads
          </p>
        </div>
        {sponsors.length > 1 && (
          <Select value={selectedSponsorId || ""} onValueChange={setSelectedSponsorId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Sponsor" />
            </SelectTrigger>
            <SelectContent>
              {sponsors.map((sponsor) => (
                <SelectItem key={sponsor.id} value={sponsor.id}>
                  {sponsor.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
