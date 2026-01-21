// src/app/(sponsor)/sponsor/leads/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QrCode,
  Camera,
  Keyboard,
  CheckCircle2,
  User,
  Building2,
  Mail,
  Briefcase,
  Star,
  MessageSquare,
  AlertCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";

interface CapturedLead {
  id: string;
  user_name: string | null;
  user_email: string | null;
  user_company: string | null;
  user_title: string | null;
  intent_level: "hot" | "warm" | "cold";
  intent_score: number;
  is_starred: boolean;
  created_at: string;
}

export default function LeadCapturePage() {
  const { token, user } = useAuthStore();
  const { activeSponsorId, activeEventId, activeSponsorName } = useSponsorStore();

  const [captureMode, setCaptureMode] = useState<"qr" | "manual">("manual");
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastCapturedLead, setLastCapturedLead] = useState<CapturedLead | null>(null);
  const [recentCaptures, setRecentCaptures] = useState<CapturedLead[]>([]);
  const [isLoadingCaptures, setIsLoadingCaptures] = useState(true);

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    name: "",
    email: "",
    company: "",
    title: "",
    interactionType: "booth_visit",
    notes: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

  // Fetch recent captures when sponsor changes
  useEffect(() => {
    const fetchRecentCaptures = async () => {
      if (!token || !activeSponsorId) return;

      setIsLoadingCaptures(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads?limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setRecentCaptures(data);
        }
      } catch {
        // Silently fail - recent captures is not critical
      } finally {
        setIsLoadingCaptures(false);
      }
    };

    fetchRecentCaptures();
  }, [token, activeSponsorId, API_BASE_URL]);

  const handleQRScan = useCallback(async () => {
    if (!activeSponsorId) {
      toast.error("No sponsor selected");
      return;
    }

    setIsCapturing(true);

    // Note: QR scanning would require camera access and QR decoder library
    // For now, show a message about the feature
    setTimeout(() => {
      setIsCapturing(false);
      toast.info("QR scanning requires camera access. Use manual entry for now.");
    }, 2000);
  }, [activeSponsorId]);

  const handleManualSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeSponsorId || !activeEventId || !user) {
      toast.error("No sponsor selected");
      return;
    }

    setIsCapturing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/events/${activeEventId}/sponsors/${activeSponsorId}/capture-lead`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id, // The captured lead is the current user for self-capture, or could be a scanned user
            user_name: manualForm.name,
            user_email: manualForm.email,
            user_company: manualForm.company || undefined,
            user_title: manualForm.title || undefined,
            interaction_type: manualForm.interactionType,
            interaction_metadata: manualForm.notes ? { notes: manualForm.notes } : undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to capture lead");
      }

      const lead = await response.json();

      setLastCapturedLead(lead);
      setRecentCaptures((prev) => [lead, ...prev].slice(0, 10));
      setShowSuccessDialog(true);

      // Reset form
      setManualForm({
        name: "",
        email: "",
        company: "",
        title: "",
        interactionType: "booth_visit",
        notes: "",
      });

      toast.success(`Lead captured: ${lead.user_name} from ${lead.user_company || "Unknown"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to capture lead");
    } finally {
      setIsCapturing(false);
    }
  }, [activeSponsorId, activeEventId, user, token, API_BASE_URL, manualForm]);

  const handleRateLead = async (intentLevel: "hot" | "warm" | "cold") => {
    if (!lastCapturedLead || !activeSponsorId || !token) return;

    // Calculate score based on level
    const scoreMap = { hot: 85, warm: 55, cold: 25 };
    const intentScore = scoreMap[intentLevel];

    try {
      await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/${lastCapturedLead.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            intent_level: intentLevel,
            intent_score: intentScore,
          }),
        }
      );

      // Update local state regardless of API response
      setLastCapturedLead({ ...lastCapturedLead, intent_level: intentLevel, intent_score: intentScore });
      setRecentCaptures((prev) =>
        prev.map((l) =>
          l.id === lastCapturedLead.id
            ? { ...l, intent_level: intentLevel, intent_score: intentScore }
            : l
        )
      );
    } catch {
      // Silently fail - just show optimistic update
    }
  };

  const handleStarLead = async () => {
    if (!lastCapturedLead || !activeSponsorId || !token) return;

    try {
      await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/${lastCapturedLead.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_starred: !lastCapturedLead.is_starred }),
        }
      );

      setLastCapturedLead({ ...lastCapturedLead, is_starred: !lastCapturedLead.is_starred });
      setRecentCaptures((prev) =>
        prev.map((l) =>
          l.id === lastCapturedLead.id
            ? { ...l, is_starred: !lastCapturedLead.is_starred }
            : l
        )
      );
      toast.success(lastCapturedLead.is_starred ? "Removed from starred" : "Added to starred");
    } catch {
      toast.error("Failed to update star status");
    }
  };

  // Show empty state if no active sponsor (layout handles initialization)
  if (!activeSponsorId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              Please select a sponsor event to access lead capture.
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
          <h1 className="text-2xl font-bold tracking-tight">Lead Capture</h1>
          <p className="text-muted-foreground">
            {activeSponsorName
              ? `Capture leads for ${activeSponsorName}`
              : "Scan attendee badges or manually enter contact information"}
          </p>
        </div>
      </div>

      {/* Capture Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={captureMode === "qr" ? "default" : "outline"}
          onClick={() => setCaptureMode("qr")}
        >
          <Camera className="mr-2 h-4 w-4" />
          QR Scan
        </Button>
        <Button
          variant={captureMode === "manual" ? "default" : "outline"}
          onClick={() => setCaptureMode("manual")}
        >
          <Keyboard className="mr-2 h-4 w-4" />
          Manual Entry
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Capture Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {captureMode === "qr" ? "Scan Badge" : "Enter Details"}
            </CardTitle>
            <CardDescription>
              {captureMode === "qr"
                ? "Point your camera at the attendee's badge QR code"
                : "Manually enter the attendee's contact information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {captureMode === "qr" ? (
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  {isCapturing ? (
                    <div className="text-center">
                      <div className="animate-pulse">
                        <QrCode className="h-16 w-16 mx-auto text-primary" />
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Scanning...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                      <p className="mt-4 text-sm text-muted-foreground">
                        Camera view will appear here
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        QR scanning requires camera permissions
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleQRScan}
                  disabled={isCapturing}
                >
                  {isCapturing ? "Scanning..." : "Start Scanning"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={manualForm.name}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      className="pl-10"
                      value={manualForm.email}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company"
                        placeholder="Company Inc."
                        className="pl-10"
                        value={manualForm.company}
                        onChange={(e) =>
                          setManualForm({ ...manualForm, company: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="title"
                        placeholder="Product Manager"
                        className="pl-10"
                        value={manualForm.title}
                        onChange={(e) =>
                          setManualForm({ ...manualForm, title: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interactionType">Interaction Type</Label>
                  <Select
                    value={manualForm.interactionType}
                    onValueChange={(value) =>
                      setManualForm({ ...manualForm, interactionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booth_visit">Booth Visit</SelectItem>
                      <SelectItem value="demo_request">Demo Request</SelectItem>
                      <SelectItem value="content_download">Content Download</SelectItem>
                      <SelectItem value="direct_request">Direct Contact Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this interaction..."
                    value={manualForm.notes}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, notes: e.target.value })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isCapturing}
                >
                  {isCapturing ? "Capturing..." : "Capture Lead"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Recent Captures */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Captures</CardTitle>
            <CardDescription>Last 10 leads captured</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCaptures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto opacity-50" />
                <p className="mt-4">No leads captured yet</p>
                <p className="text-sm">Capture your first lead to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCaptures.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {(lead.user_name || "U").charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{lead.user_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.user_company || "No company"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        lead.intent_level === "hot"
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : lead.intent_level === "warm"
                          ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }
                    >
                      {lead.intent_level}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Lead Captured!</DialogTitle>
            <DialogDescription className="text-center">
              Successfully captured contact information
            </DialogDescription>
          </DialogHeader>

          {lastCapturedLead && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-medium">
                    {(lastCapturedLead.user_name || "U").charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{lastCapturedLead.user_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {lastCapturedLead.user_title || "No title"} at {lastCapturedLead.user_company || "No company"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lastCapturedLead.user_email || "No email"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rate this lead</Label>
                <div className="flex gap-2">
                  <Button
                    variant={lastCapturedLead.intent_level === "hot" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleRateLead("hot")}
                  >
                    Hot
                  </Button>
                  <Button
                    variant={lastCapturedLead.intent_level === "warm" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleRateLead("warm")}
                  >
                    Warm
                  </Button>
                  <Button
                    variant={lastCapturedLead.intent_level === "cold" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleRateLead("cold")}
                  >
                    Cold
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={`flex-1 ${lastCapturedLead.is_starred ? "text-yellow-500" : ""}`}
                  onClick={handleStarLead}
                >
                  <Star className={`mr-2 h-4 w-4 ${lastCapturedLead.is_starred ? "fill-current" : ""}`} />
                  {lastCapturedLead.is_starred ? "Starred" : "Star"}
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={() => setShowSuccessDialog(false)}
              >
                Capture Another Lead
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
