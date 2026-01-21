// src/app/(sponsor)/sponsor/booth/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Globe,
  Upload,
  Link2,
  Bell,
  Linkedin,
  Twitter,
  Instagram,
  Save,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

interface Sponsor {
  id: string;
  company_name: string;
  company_description?: string;
  company_website?: string;
  company_logo_url?: string;
  booth_number?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  lead_capture_enabled: boolean;
  lead_notification_email?: string;
  tier?: {
    name: string;
    max_representatives: number;
  };
  is_active: boolean;
}

interface SponsorStats {
  total_leads: number;
  team_count?: number;
}

export default function BoothSettingsPage() {
  const { token } = useAuthStore();
  const { activeSponsorId, activeSponsorName } = useSponsorStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [stats, setStats] = useState<SponsorStats>({ total_leads: 0 });

  // Local form state
  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    website: "",
    boothNumber: "",
    leadCaptureEnabled: true,
    notificationEmail: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      instagram: "",
    },
  });

  // Fetch sponsor data
  useEffect(() => {
    if (!token || !activeSponsorId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch sponsor details from my-sponsors and find the active one
        const sponsorsRes = await fetch(`${API_BASE_URL}/sponsors/my-sponsors`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!sponsorsRes.ok) {
          throw new Error("Failed to fetch sponsor data");
        }

        const sponsors: Sponsor[] = await sponsorsRes.json();
        const currentSponsor = sponsors.find(s => s.id === activeSponsorId);

        if (!currentSponsor) {
          throw new Error("Sponsor not found");
        }

        setSponsor(currentSponsor);

        // Populate form with existing data
        setFormData({
          companyName: currentSponsor.company_name || "",
          description: currentSponsor.company_description || "",
          website: currentSponsor.company_website || "",
          boothNumber: currentSponsor.booth_number || "",
          leadCaptureEnabled: currentSponsor.lead_capture_enabled ?? true,
          notificationEmail: currentSponsor.lead_notification_email || "",
          socialLinks: {
            linkedin: currentSponsor.social_links?.linkedin || "",
            twitter: currentSponsor.social_links?.twitter || "",
            instagram: currentSponsor.social_links?.instagram || "",
          },
        });

        // Fetch stats
        const statsRes = await fetch(
          `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({ total_leads: statsData.total_leads || 0 });
        }
      } catch (err) {
        console.error("Error fetching booth data:", err);
        setError(err instanceof Error ? err.message : "Failed to load booth data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, activeSponsorId]);

  const handleSave = async () => {
    if (!sponsor || !token || !activeSponsorId) return;

    setIsSaving(true);

    try {
      // Use the booth-settings endpoint for sponsor representatives
      const response = await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/booth-settings`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_description: formData.description,
            company_website: formData.website,
            booth_number: formData.boothNumber,
            lead_capture_enabled: formData.leadCaptureEnabled,
            lead_notification_email: formData.notificationEmail || null,
            social_links: formData.socialLinks,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update booth settings");
      }

      toast.success("Your booth settings have been updated.");
    } catch (err) {
      console.error("Error saving booth settings:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Show empty state if no active sponsor
  if (!activeSponsorId && !isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              Please select a sponsor event to manage booth settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !sponsor) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Error loading booth settings</p>
              <p className="text-sm text-muted-foreground">{error || "No sponsor data available"}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
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
          <h1 className="text-2xl font-bold tracking-tight">Booth Settings</h1>
          <p className="text-muted-foreground">
            {activeSponsorName
              ? `Customize booth appearance for ${activeSponsorName}`
              : "Customize your sponsor booth appearance and settings"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview Booth
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Basic information displayed on your booth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Contact the event organizer to change company name
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Brief description of your company (max 500 characters)
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      className="pl-10"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boothNumber">Booth Number</Label>
                  <Input
                    id="boothNumber"
                    value={formData.boothNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, boothNumber: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Logo and visual assets for your booth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed overflow-hidden">
                    {sponsor.company_logo_url ? (
                      <img
                        src={sponsor.company_logo_url}
                        alt={sponsor.company_name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 400x400px, PNG or SVG
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div className="h-32 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Upload a banner image (1200x400px recommended)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Social Links
              </CardTitle>
              <CardDescription>
                Connect your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/company/..."
                  value={formData.socialLinks.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/..."
                  value={formData.socialLinks.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/..."
                  value={formData.socialLinks.instagram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Capture Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Lead Capture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Lead Capture</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow scanning attendee badges
                  </p>
                </div>
                <Switch
                  checked={formData.leadCaptureEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, leadCaptureEnabled: checked })
                  }
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  placeholder="leads@company.com"
                  value={formData.notificationEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationEmail: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Receive notifications for new leads
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Booth Status */}
          <Card>
            <CardHeader>
              <CardTitle>Booth Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge className={sponsor.is_active
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : "bg-red-500/10 text-red-600 border-red-500/20"
                }>
                  {sponsor.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {sponsor.tier && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tier</span>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    {sponsor.tier.name}
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm">Leads Captured</span>
                <span className="text-sm font-medium">{stats.total_leads}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Manage Team Members
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Upload Marketing Assets
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View Public Booth Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
