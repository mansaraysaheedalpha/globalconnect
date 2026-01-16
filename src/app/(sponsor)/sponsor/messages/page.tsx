// src/app/(sponsor)/sponsor/messages/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle2,
  XCircle,
  Mail,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface MessageHistory {
  id: string;
  subject: string;
  recipientCount: number;
  sentAt: string;
  status: "sent" | "failed" | "scheduled";
  openRate: number;
}

const mockMessageHistory: MessageHistory[] = [
  {
    id: "1",
    subject: "Thank you for visiting our booth!",
    recipientCount: 45,
    sentAt: "2024-01-15T16:00:00Z",
    status: "sent",
    openRate: 68,
  },
  {
    id: "2",
    subject: "Exclusive demo invitation",
    recipientCount: 23,
    sentAt: "2024-01-15T10:00:00Z",
    status: "sent",
    openRate: 72,
  },
  {
    id: "3",
    subject: "Download your requested resources",
    recipientCount: 15,
    sentAt: "2024-01-14T14:30:00Z",
    status: "sent",
    openRate: 85,
  },
];

export default function MessagesPage() {
  const [isSending, setIsSending] = useState(false);
  const [audience, setAudience] = useState("all");
  const [message, setMessage] = useState({
    subject: "",
    body: "",
  });

  const handleSend = async () => {
    if (!message.subject || !message.body) {
      toast.error("Please fill in both subject and message body.");
      return;
    }

    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSending(false);

    toast.success("Your message has been sent to the selected recipients.");

    setMessage({ subject: "", body: "" });
  };

  const audienceCounts: Record<string, number> = {
    all: 147,
    hot: 23,
    warm: 58,
    new: 45,
    contacted: 32,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Send follow-up messages to your captured leads
        </p>
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
                <p className="text-xs text-muted-foreground">
                  {audienceCounts[audience]} recipients will receive this message
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
                  Use {"{{name}}"} to personalize with the recipient's name
                </p>
              </div>

              {/* Send Options */}
              <div className="flex items-center gap-4 pt-4">
                <Button onClick={handleSend} disabled={isSending}>
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
                Message Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Messages Sent</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg. Open Rate</span>
                <span className="font-medium">72%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Response Rate</span>
                <span className="font-medium">28%</span>
              </div>
            </CardContent>
          </Card>

          {/* Message History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockMessageHistory.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium line-clamp-1">
                      {msg.subject}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{msg.recipientCount} recipients</span>
                      <span>|</span>
                      <span>{msg.openRate}% opened</span>
                    </div>
                  </div>
                  {msg.status === "sent" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  ) : msg.status === "failed" ? (
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-orange-600 shrink-0" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
