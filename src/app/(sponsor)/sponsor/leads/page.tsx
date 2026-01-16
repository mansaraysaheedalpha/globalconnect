// src/app/(sponsor)/sponsor/leads/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CapturedLead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  intentLevel: "hot" | "warm" | "cold";
  notes: string;
  capturedAt: Date;
}

export default function LeadCapturePage() {
  const [captureMode, setCaptureMode] = useState<"qr" | "manual">("qr");
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastCapturedLead, setLastCapturedLead] = useState<CapturedLead | null>(null);
  const [recentCaptures, setRecentCaptures] = useState<CapturedLead[]>([]);
  const { toast } = useToast();

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    name: "",
    email: "",
    company: "",
    title: "",
    interactionType: "booth_visit",
    notes: "",
  });

  const handleQRScan = useCallback(async () => {
    setIsCapturing(true);

    // Simulate QR scan - in real implementation, this would use the camera
    setTimeout(() => {
      const mockLead: CapturedLead = {
        id: `lead-${Date.now()}`,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        company: "Acme Corp",
        title: "VP of Engineering",
        intentLevel: "warm",
        notes: "",
        capturedAt: new Date(),
      };

      setLastCapturedLead(mockLead);
      setRecentCaptures((prev) => [mockLead, ...prev].slice(0, 10));
      setShowSuccessDialog(true);
      setIsCapturing(false);

      toast({
        title: "Lead captured!",
        description: `${mockLead.name} from ${mockLead.company}`,
      });
    }, 2000);
  }, [toast]);

  const handleManualSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const lead: CapturedLead = {
      id: `lead-${Date.now()}`,
      name: manualForm.name,
      email: manualForm.email,
      company: manualForm.company,
      title: manualForm.title,
      intentLevel: manualForm.interactionType === "demo_request" ? "hot" : "warm",
      notes: manualForm.notes,
      capturedAt: new Date(),
    };

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

    toast({
      title: "Lead captured!",
      description: `${lead.name} from ${lead.company}`,
    });
  }, [manualForm, toast]);

  const handleRateLead = (intentLevel: "hot" | "warm" | "cold") => {
    if (lastCapturedLead) {
      setLastCapturedLead({ ...lastCapturedLead, intentLevel });
      // In real app, this would update the backend
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lead Capture</h1>
        <p className="text-muted-foreground">
          Scan attendee badges or manually enter contact information
        </p>
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

                <Button type="submit" className="w-full" size="lg">
                  Capture Lead
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Recent Captures */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Captures</CardTitle>
            <CardDescription>Last 10 leads captured this session</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCaptures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto opacity-50" />
                <p className="mt-4">No leads captured yet</p>
                <p className="text-sm">Scan a badge to get started</p>
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
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.company}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        lead.intentLevel === "hot"
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : lead.intentLevel === "warm"
                          ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }
                    >
                      {lead.intentLevel}
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
                    {lastCapturedLead.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{lastCapturedLead.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {lastCapturedLead.title} at {lastCapturedLead.company}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lastCapturedLead.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rate this lead</Label>
                <div className="flex gap-2">
                  <Button
                    variant={lastCapturedLead.intentLevel === "hot" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleRateLead("hot")}
                  >
                    Hot
                  </Button>
                  <Button
                    variant={lastCapturedLead.intentLevel === "warm" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleRateLead("warm")}
                  >
                    Warm
                  </Button>
                  <Button
                    variant={lastCapturedLead.intentLevel === "cold" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleRateLead("cold")}
                  >
                    Cold
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Star className="mr-2 h-4 w-4" />
                  Star
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
