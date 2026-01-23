// src/app/(sponsor)/sponsor/booth/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FileText,
  Video,
  Image as ImageIcon,
  File,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  MousePointerClick,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";
const REALTIME_API_URL = process.env.NEXT_PUBLIC_REALTIME_SERVICE_URL || "http://localhost:3002";

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

interface BoothResource {
  id: string;
  name: string;
  description?: string;
  type: "PDF" | "VIDEO" | "IMAGE" | "DOCUMENT" | "LINK";
  url: string;
  thumbnailUrl?: string;
  fileSize?: number;
  downloadCount: number;
  createdAt: string;
}

interface BoothCta {
  id: string;
  label: string;
  url: string;
  style: "primary" | "secondary" | "outline";
  icon?: string;
  clickCount: number;
  createdAt: string;
}

interface ExpoBooth {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  tier: string;
  boothNumber: string;
  logoUrl?: string;
  bannerUrl?: string;
  videoUrl?: string;
  resources: BoothResource[];
  ctaButtons: BoothCta[];
  chatEnabled: boolean;
  videoEnabled: boolean;
  category?: string;
  sponsorId: string;
  staffIds: string[];
  expoHall?: {
    id: string;
    eventId: string;
    name: string;
  };
}

const RESOURCE_TYPE_ICONS: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-4 w-4 text-red-500" />,
  VIDEO: <Video className="h-4 w-4 text-purple-500" />,
  IMAGE: <ImageIcon className="h-4 w-4 text-blue-500" />,
  DOCUMENT: <File className="h-4 w-4 text-green-500" />,
  LINK: <ExternalLink className="h-4 w-4 text-orange-500" />,
};

export default function BoothSettingsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { activeSponsorId, activeSponsorName, clearSponsorContext } = useSponsorStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSponsorStale, setIsSponsorStale] = useState(false);
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [stats, setStats] = useState<SponsorStats>({ total_leads: 0 });
  const [expoBooth, setExpoBooth] = useState<ExpoBooth | null>(null);

  // Dialog states
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isCtaDialogOpen, setIsCtaDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<BoothResource | null>(null);
  const [editingCta, setEditingCta] = useState<BoothCta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resource form state
  const [resourceForm, setResourceForm] = useState({
    name: "",
    description: "",
    type: "PDF" as "PDF" | "VIDEO" | "IMAGE" | "DOCUMENT" | "LINK",
    url: "",
  });

  // CTA form state
  const [ctaForm, setCtaForm] = useState({
    label: "",
    url: "",
    style: "primary" as "primary" | "secondary" | "outline",
  });

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

  // Fetch sponsor and expo booth data
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
          // The activeSponsorId is stale - sponsor no longer exists or user is no longer a rep
          setIsSponsorStale(true);
          throw new Error("The selected sponsor is no longer available. Please select a different sponsor.");
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

        // Fetch expo booth data from real-time service
        try {
          const boothRes = await fetch(
            `${REALTIME_API_URL}/api/expo/sponsor/${activeSponsorId}/booth`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (boothRes.ok) {
            const boothData = await boothRes.json();
            setExpoBooth(boothData.booth);
          }
        } catch (boothErr) {
          console.log("No expo booth found for this sponsor (this is normal if expo hall not set up)");
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

  // Resource management
  const handleAddResource = async () => {
    if (!expoBooth || !token) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${REALTIME_API_URL}/api/expo/booths/${expoBooth.id}/resources`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resourceForm),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add resource");
      }

      const data = await response.json();
      setExpoBooth({
        ...expoBooth,
        resources: [...(expoBooth.resources || []), data.resource],
      });
      setIsResourceDialogOpen(false);
      setResourceForm({ name: "", description: "", type: "PDF", url: "" });
      toast.success("Resource added successfully");
    } catch (err) {
      toast.error("Failed to add resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateResource = async () => {
    if (!expoBooth || !token || !editingResource) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${REALTIME_API_URL}/api/expo/booths/${expoBooth.id}/resources/${editingResource.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: resourceForm.name,
            description: resourceForm.description,
            url: resourceForm.url,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update resource");
      }

      const data = await response.json();
      setExpoBooth({
        ...expoBooth,
        resources: expoBooth.resources.map(r =>
          r.id === editingResource.id ? { ...r, ...data.resource } : r
        ),
      });
      setIsResourceDialogOpen(false);
      setEditingResource(null);
      setResourceForm({ name: "", description: "", type: "PDF", url: "" });
      toast.success("Resource updated successfully");
    } catch (err) {
      toast.error("Failed to update resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!expoBooth || !token) return;

    try {
      const response = await fetch(
        `${REALTIME_API_URL}/api/expo/booths/${expoBooth.id}/resources/${resourceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete resource");
      }

      setExpoBooth({
        ...expoBooth,
        resources: expoBooth.resources.filter(r => r.id !== resourceId),
      });
      toast.success("Resource deleted");
    } catch (err) {
      toast.error("Failed to delete resource");
    }
  };

  // CTA management
  const handleAddCta = async () => {
    if (!expoBooth || !token) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${REALTIME_API_URL}/api/expo/booths/${expoBooth.id}/ctas`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ctaForm),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add CTA");
      }

      const data = await response.json();
      setExpoBooth({
        ...expoBooth,
        ctaButtons: [...(expoBooth.ctaButtons || []), data.cta],
      });
      setIsCtaDialogOpen(false);
      setCtaForm({ label: "", url: "", style: "primary" });
      toast.success("CTA button added successfully");
    } catch (err) {
      toast.error("Failed to add CTA button");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCta = async () => {
    if (!expoBooth || !token || !editingCta) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${REALTIME_API_URL}/api/expo/booths/${expoBooth.id}/ctas/${editingCta.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ctaForm),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update CTA");
      }

      const data = await response.json();
      setExpoBooth({
        ...expoBooth,
        ctaButtons: expoBooth.ctaButtons.map(c =>
          c.id === editingCta.id ? { ...c, ...data.cta } : c
        ),
      });
      setIsCtaDialogOpen(false);
      setEditingCta(null);
      setCtaForm({ label: "", url: "", style: "primary" });
      toast.success("CTA button updated successfully");
    } catch (err) {
      toast.error("Failed to update CTA button");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCta = async (ctaId: string) => {
    if (!expoBooth || !token) return;

    try {
      const response = await fetch(
        `${REALTIME_API_URL}/api/expo/booths/${expoBooth.id}/ctas/${ctaId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete CTA");
      }

      setExpoBooth({
        ...expoBooth,
        ctaButtons: expoBooth.ctaButtons.filter(c => c.id !== ctaId),
      });
      toast.success("CTA button deleted");
    } catch (err) {
      toast.error("Failed to delete CTA button");
    }
  };

  const openEditResource = (resource: BoothResource) => {
    setEditingResource(resource);
    setResourceForm({
      name: resource.name,
      description: resource.description || "",
      type: resource.type,
      url: resource.url,
    });
    setIsResourceDialogOpen(true);
  };

  const openEditCta = (cta: BoothCta) => {
    setEditingCta(cta);
    setCtaForm({
      label: cta.label,
      url: cta.url,
      style: cta.style,
    });
    setIsCtaDialogOpen(true);
  };

  // Show empty state if no active sponsor
  if (!activeSponsorId && !isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center mb-4">
              Please select a sponsor event to manage booth settings.
            </p>
            <Button onClick={() => router.push("/sponsor/select-event")}>
              Select Sponsor
            </Button>
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
    const handleSelectNewSponsor = () => {
      clearSponsorContext();
      router.push("/sponsor/select-event");
    };

    return (
      <div className="p-6">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Error loading booth settings</p>
              <p className="text-sm text-muted-foreground">{error || "No sponsor data available"}</p>
            </div>
            <div className="ml-auto flex gap-2">
              {isSponsorStale ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSelectNewSponsor}
                >
                  Select Sponsor
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              )}
            </div>
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
          {expoBooth?.expoHall && (
            <Button
              variant="outline"
              onClick={() => window.open(`/attendee/events/${expoBooth.expoHall?.eventId}/expo`, "_blank")}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview Booth
            </Button>
          )}
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

          {/* Resources - Only show if expo booth exists */}
          {expoBooth && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Resources
                    </CardTitle>
                    <CardDescription>
                      Downloadable files for booth visitors
                    </CardDescription>
                  </div>
                  <Dialog open={isResourceDialogOpen} onOpenChange={(open) => {
                    setIsResourceDialogOpen(open);
                    if (!open) {
                      setEditingResource(null);
                      setResourceForm({ name: "", description: "", type: "PDF", url: "" });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Resource
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingResource ? "Edit Resource" : "Add Resource"}
                        </DialogTitle>
                        <DialogDescription>
                          Add a downloadable file or link for booth visitors
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={resourceForm.name}
                            onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                            placeholder="Product Brochure"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (optional)</Label>
                          <Textarea
                            value={resourceForm.description}
                            onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                            placeholder="Brief description of this resource"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={resourceForm.type}
                            onValueChange={(v) => setResourceForm({ ...resourceForm, type: v as typeof resourceForm.type })}
                            disabled={!!editingResource}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PDF">PDF Document</SelectItem>
                              <SelectItem value="VIDEO">Video</SelectItem>
                              <SelectItem value="IMAGE">Image</SelectItem>
                              <SelectItem value="DOCUMENT">Other Document</SelectItem>
                              <SelectItem value="LINK">External Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={resourceForm.url}
                            onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                            placeholder="https://example.com/file.pdf"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsResourceDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={editingResource ? handleUpdateResource : handleAddResource}
                          disabled={!resourceForm.name || !resourceForm.url || isSubmitting}
                        >
                          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {editingResource ? "Update" : "Add"} Resource
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {expoBooth.resources?.length > 0 ? (
                  <div className="space-y-2">
                    {expoBooth.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          {RESOURCE_TYPE_ICONS[resource.type] || <File className="h-4 w-4" />}
                          <div>
                            <p className="font-medium text-sm">{resource.name}</p>
                            {resource.description && (
                              <p className="text-xs text-muted-foreground">{resource.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {resource.downloadCount} downloads
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditResource(resource)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No resources added yet</p>
                    <p className="text-xs">Add brochures, videos, or documents for visitors</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* CTA Buttons - Only show if expo booth exists */}
          {expoBooth && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MousePointerClick className="h-5 w-5" />
                      Call-to-Action Buttons
                    </CardTitle>
                    <CardDescription>
                      Action buttons displayed on your booth
                    </CardDescription>
                  </div>
                  <Dialog open={isCtaDialogOpen} onOpenChange={(open) => {
                    setIsCtaDialogOpen(open);
                    if (!open) {
                      setEditingCta(null);
                      setCtaForm({ label: "", url: "", style: "primary" });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add CTA
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingCta ? "Edit CTA Button" : "Add CTA Button"}
                        </DialogTitle>
                        <DialogDescription>
                          Add a call-to-action button for booth visitors
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Button Label</Label>
                          <Input
                            value={ctaForm.label}
                            onChange={(e) => setCtaForm({ ...ctaForm, label: e.target.value })}
                            placeholder="Schedule a Demo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={ctaForm.url}
                            onChange={(e) => setCtaForm({ ...ctaForm, url: e.target.value })}
                            placeholder="https://calendly.com/your-link"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Style</Label>
                          <Select
                            value={ctaForm.style}
                            onValueChange={(v) => setCtaForm({ ...ctaForm, style: v as typeof ctaForm.style })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary (Filled)</SelectItem>
                              <SelectItem value="secondary">Secondary</SelectItem>
                              <SelectItem value="outline">Outline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="pt-2">
                          <Label className="text-xs text-muted-foreground">Preview</Label>
                          <div className="mt-2">
                            <Button
                              variant={ctaForm.style === "primary" ? "default" : ctaForm.style === "secondary" ? "secondary" : "outline"}
                              disabled
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {ctaForm.label || "Button Label"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsCtaDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={editingCta ? handleUpdateCta : handleAddCta}
                          disabled={!ctaForm.label || !ctaForm.url || isSubmitting}
                        >
                          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {editingCta ? "Update" : "Add"} CTA
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {expoBooth.ctaButtons?.length > 0 ? (
                  <div className="space-y-2">
                    {expoBooth.ctaButtons.map((cta) => (
                      <div
                        key={cta.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <Button
                            variant={cta.style === "primary" ? "default" : cta.style === "secondary" ? "secondary" : "outline"}
                            size="sm"
                            disabled
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {cta.label}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {cta.clickCount} clicks
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditCta(cta)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCta(cta.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MousePointerClick className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No CTA buttons added yet</p>
                    <p className="text-xs">Add buttons like &quot;Schedule Demo&quot; or &quot;Visit Website&quot;</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
              {expoBooth && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expo Booth</span>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                      {expoBooth.boothNumber}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resources</span>
                    <span className="text-sm font-medium">{expoBooth.resources?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CTA Buttons</span>
                    <span className="text-sm font-medium">{expoBooth.ctaButtons?.length || 0}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* No Expo Booth Warning */}
          {!expoBooth && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-700">No Expo Booth</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your booth will be created when the event organizer sets up the Expo Hall.
                      Resources and CTA buttons can be added once your booth is active.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Manage Team Members
              </Button>
              {expoBooth?.expoHall && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`/attendee/events/${expoBooth.expoHall?.eventId}/expo`, "_blank")}
                >
                  View Public Booth Page
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
