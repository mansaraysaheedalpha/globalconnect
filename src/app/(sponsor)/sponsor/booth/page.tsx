// src/app/(sponsor)/sponsor/booth/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BoothSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Mock booth data
  const [boothData, setBoothData] = useState({
    companyName: "Acme Corporation",
    description: "Leading provider of innovative enterprise solutions. We help businesses transform their operations with cutting-edge technology.",
    website: "https://acme.example.com",
    boothNumber: "B-42",
    leadCaptureEnabled: true,
    notificationEmail: "leads@acme.example.com",
    socialLinks: {
      linkedin: "https://linkedin.com/company/acme",
      twitter: "https://twitter.com/acmecorp",
      instagram: "",
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Settings saved",
      description: "Your booth settings have been updated.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booth Settings</h1>
          <p className="text-muted-foreground">
            Customize your sponsor booth appearance and settings
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
                  value={boothData.companyName}
                  onChange={(e) =>
                    setBoothData({ ...boothData, companyName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={boothData.description}
                  onChange={(e) =>
                    setBoothData({ ...boothData, description: e.target.value })
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
                      value={boothData.website}
                      onChange={(e) =>
                        setBoothData({ ...boothData, website: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boothNumber">Booth Number</Label>
                  <Input
                    id="boothNumber"
                    value={boothData.boothNumber}
                    onChange={(e) =>
                      setBoothData({ ...boothData, boothNumber: e.target.value })
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
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
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
                  value={boothData.socialLinks.linkedin}
                  onChange={(e) =>
                    setBoothData({
                      ...boothData,
                      socialLinks: { ...boothData.socialLinks, linkedin: e.target.value },
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
                  value={boothData.socialLinks.twitter}
                  onChange={(e) =>
                    setBoothData({
                      ...boothData,
                      socialLinks: { ...boothData.socialLinks, twitter: e.target.value },
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
                  value={boothData.socialLinks.instagram}
                  onChange={(e) =>
                    setBoothData({
                      ...boothData,
                      socialLinks: { ...boothData.socialLinks, instagram: e.target.value },
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
                  checked={boothData.leadCaptureEnabled}
                  onCheckedChange={(checked) =>
                    setBoothData({ ...boothData, leadCaptureEnabled: checked })
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
                  value={boothData.notificationEmail}
                  onChange={(e) =>
                    setBoothData({
                      ...boothData,
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
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tier</span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  Gold Sponsor
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Team Members</span>
                <span className="text-sm font-medium">3 / 5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Leads Today</span>
                <span className="text-sm font-medium">12</span>
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
