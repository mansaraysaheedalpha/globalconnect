// src/components/features/expo/ExpoBoothManagement.tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Save,
  Upload,
  Trash2,
  Plus,
  GripVertical,
  ExternalLink,
  FileText,
  Video,
  ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExpoBooth, BoothResource, BoothCta, BOOTH_TIER_CONFIG } from "./types";

export interface ExpoBoothManagementProps {
  booth: ExpoBooth;
  onSave: (updates: Partial<BoothFormData>) => Promise<boolean>;
  onUploadLogo: (file: File) => Promise<string | null>;
  onUploadBanner: (file: File) => Promise<string | null>;
  onUploadVideo: (file: File) => Promise<string | null>;
  onAddResource: (resource: Omit<BoothResource, "id" | "downloadCount">) => Promise<BoothResource | null>;
  onDeleteResource: (resourceId: string) => Promise<boolean>;
  onAddCta: (cta: Omit<BoothCta, "id" | "clickCount">) => Promise<BoothCta | null>;
  onDeleteCta: (ctaId: string) => Promise<boolean>;
  isLoading?: boolean;
  className?: string;
}

export interface BoothFormData {
  name: string;
  tagline: string;
  description: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  videoUrl: string;
  chatEnabled: boolean;
  videoEnabled: boolean;
}

interface ResourceFormData {
  name: string;
  description: string;
  type: "PDF" | "VIDEO" | "IMAGE" | "OTHER";
  url: string;
  thumbnailUrl?: string;
}

interface CtaFormData {
  label: string;
  url: string;
  style: "primary" | "secondary" | "outline";
  order: number;
}

export function ExpoBoothManagement({
  booth,
  onSave,
  onUploadLogo,
  onUploadBanner,
  onUploadVideo,
  onAddResource,
  onDeleteResource,
  onAddCta,
  onDeleteCta,
  isLoading = false,
  className,
}: ExpoBoothManagementProps) {
  const tierConfig = BOOTH_TIER_CONFIG[booth.tier];

  // Form state
  const [formData, setFormData] = useState<BoothFormData>({
    name: booth.name,
    tagline: booth.tagline || "",
    description: booth.description || "",
    category: booth.category || "",
    logoUrl: booth.logoUrl || "",
    bannerUrl: booth.bannerUrl || "",
    videoUrl: booth.videoUrl || "",
    chatEnabled: booth.chatEnabled,
    videoEnabled: booth.videoEnabled,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Resource dialog state
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState<ResourceFormData>({
    name: "",
    description: "",
    type: "PDF",
    url: "",
  });
  const [isAddingResource, setIsAddingResource] = useState(false);

  // CTA dialog state
  const [isCtaDialogOpen, setIsCtaDialogOpen] = useState(false);
  const [ctaForm, setCtaForm] = useState<CtaFormData>({
    label: "",
    url: "",
    style: "primary",
    order: booth.ctaButtons.length,
  });
  const [isAddingCta, setIsAddingCta] = useState(false);

  // Upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Handle form field changes
  const handleFieldChange = useCallback(
    (field: keyof BoothFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setSaveSuccess(false);
    },
    []
  );

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const success = await onSave(formData);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError("Failed to save changes. Please try again.");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave]);

  // Handle logo upload
  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingLogo(true);
      try {
        const url = await onUploadLogo(file);
        if (url) {
          setFormData((prev) => ({ ...prev, logoUrl: url }));
        }
      } finally {
        setIsUploadingLogo(false);
      }
    },
    [onUploadLogo]
  );

  // Handle banner upload
  const handleBannerUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingBanner(true);
      try {
        const url = await onUploadBanner(file);
        if (url) {
          setFormData((prev) => ({ ...prev, bannerUrl: url }));
        }
      } finally {
        setIsUploadingBanner(false);
      }
    },
    [onUploadBanner]
  );

  // Handle video upload
  const handleVideoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingVideo(true);
      try {
        const url = await onUploadVideo(file);
        if (url) {
          setFormData((prev) => ({ ...prev, videoUrl: url }));
        }
      } finally {
        setIsUploadingVideo(false);
      }
    },
    [onUploadVideo]
  );

  // Handle add resource
  const handleAddResource = useCallback(async () => {
    if (!resourceForm.name || !resourceForm.url) return;

    setIsAddingResource(true);
    try {
      const result = await onAddResource({
        name: resourceForm.name,
        description: resourceForm.description,
        type: resourceForm.type,
        url: resourceForm.url,
        thumbnailUrl: resourceForm.thumbnailUrl,
      });

      if (result) {
        setIsResourceDialogOpen(false);
        setResourceForm({
          name: "",
          description: "",
          type: "PDF",
          url: "",
        });
      }
    } finally {
      setIsAddingResource(false);
    }
  }, [resourceForm, onAddResource]);

  // Handle add CTA
  const handleAddCta = useCallback(async () => {
    if (!ctaForm.label || !ctaForm.url) return;

    setIsAddingCta(true);
    try {
      const result = await onAddCta({
        label: ctaForm.label,
        url: ctaForm.url,
        style: ctaForm.style,
        order: ctaForm.order,
      });

      if (result) {
        setIsCtaDialogOpen(false);
        setCtaForm({
          label: "",
          url: "",
          style: "primary",
          order: booth.ctaButtons.length + 1,
        });
      }
    } finally {
      setIsAddingCta(false);
    }
  }, [ctaForm, onAddCta, booth.ctaButtons.length]);

  // Get resource type icon
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-4 w-4" />;
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "IMAGE":
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Booth Settings</h1>
          <p className="text-muted-foreground">
            Configure your expo booth appearance and features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(tierConfig.bgColor, tierConfig.color)}>
            {tierConfig.label}
          </Badge>
          <Badge variant="outline">Booth #{booth.boothNumber}</Badge>
        </div>
      </div>

      {/* Save status */}
      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}
      {saveSuccess && (
        <Alert className="border-green-500 bg-green-50 text-green-700">
          <AlertDescription>Changes saved successfully!</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="ctas">Call-to-Actions</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set your booth&apos;s name, tagline, and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Booth Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleFieldChange("tagline", e.target.value)}
                  placeholder="A short catchy phrase"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.tagline.length}/100 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Tell visitors about your company..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Your company logo (recommended: 200x200px, PNG or JPG)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-lg border bg-muted overflow-hidden flex-shrink-0">
                  {formData.logoUrl ? (
                    <Image
                      src={formData.logoUrl}
                      alt="Logo preview"
                      width={96}
                      height={96}
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <Button
                      variant="outline"
                      disabled={isUploadingLogo}
                      asChild
                    >
                      <span>
                        {isUploadingLogo ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Logo
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  {formData.logoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldChange("logoUrl", "")}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banner</CardTitle>
              <CardDescription>
                Banner image for your booth (recommended: 1200x400px)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-[3/1] rounded-lg border bg-muted overflow-hidden">
                  {formData.bannerUrl ? (
                    <Image
                      src={formData.bannerUrl}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Label htmlFor="banner-upload" className="cursor-pointer">
                    <Button
                      variant="outline"
                      disabled={isUploadingBanner}
                      asChild
                    >
                      <span>
                        {isUploadingBanner ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Banner
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                  {formData.bannerUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldChange("bannerUrl", "")}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Video</CardTitle>
              <CardDescription>
                Upload a video to showcase on your booth (max 100MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.videoUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <video
                      src={formData.videoUrl}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Label htmlFor="video-upload" className="cursor-pointer">
                    <Button
                      variant="outline"
                      disabled={isUploadingVideo}
                      asChild
                    >
                      <span>
                        {isUploadingVideo ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Video
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    onChange={handleVideoUpload}
                  />
                  {formData.videoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldChange("videoUrl", "")}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Downloadable Resources</CardTitle>
                <CardDescription>
                  Add brochures, presentations, and other materials for visitors
                </CardDescription>
              </div>
              <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Resource</DialogTitle>
                    <DialogDescription>
                      Add a new downloadable resource to your booth
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="resource-name">Name</Label>
                      <Input
                        id="resource-name"
                        value={resourceForm.name}
                        onChange={(e) =>
                          setResourceForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Resource name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resource-description">Description</Label>
                      <Input
                        id="resource-description"
                        value={resourceForm.description}
                        onChange={(e) =>
                          setResourceForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Brief description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resource-type">Type</Label>
                      <Select
                        value={resourceForm.type}
                        onValueChange={(value) =>
                          setResourceForm((prev) => ({
                            ...prev,
                            type: value as ResourceFormData["type"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF Document</SelectItem>
                          <SelectItem value="VIDEO">Video</SelectItem>
                          <SelectItem value="IMAGE">Image</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resource-url">URL</Label>
                      <Input
                        id="resource-url"
                        value={resourceForm.url}
                        onChange={(e) =>
                          setResourceForm((prev) => ({ ...prev, url: e.target.value }))
                        }
                        placeholder="https://..."
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
                    <Button onClick={handleAddResource} disabled={isAddingResource}>
                      {isAddingResource && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Add Resource
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {booth.resources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No resources added yet</p>
                  <p className="text-sm">Click &quot;Add Resource&quot; to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {booth.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      {getResourceIcon(resource.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{resource.name}</p>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {resource.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">{resource.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {resource.downloadCount} downloads
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTAs Tab */}
        <TabsContent value="ctas" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Call-to-Action Buttons</CardTitle>
                <CardDescription>
                  Add buttons for scheduling demos, visiting your website, etc.
                </CardDescription>
              </div>
              <Dialog open={isCtaDialogOpen} onOpenChange={setIsCtaDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add CTA
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Call-to-Action</DialogTitle>
                    <DialogDescription>
                      Add a new action button to your booth
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cta-label">Button Label</Label>
                      <Input
                        id="cta-label"
                        value={ctaForm.label}
                        onChange={(e) =>
                          setCtaForm((prev) => ({ ...prev, label: e.target.value }))
                        }
                        placeholder="e.g., Schedule Demo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta-url">URL</Label>
                      <Input
                        id="cta-url"
                        value={ctaForm.url}
                        onChange={(e) =>
                          setCtaForm((prev) => ({ ...prev, url: e.target.value }))
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta-style">Button Style</Label>
                      <Select
                        value={ctaForm.style}
                        onValueChange={(value) =>
                          setCtaForm((prev) => ({
                            ...prev,
                            style: value as CtaFormData["style"],
                          }))
                        }
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
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCtaDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddCta} disabled={isAddingCta}>
                      {isAddingCta && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Add CTA
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {booth.ctaButtons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No CTAs added yet</p>
                  <p className="text-sm">Click &quot;Add CTA&quot; to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {booth.ctaButtons.map((cta) => (
                    <div
                      key={cta.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <ExternalLink className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{cta.label}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {cta.url}
                        </p>
                      </div>
                      <Badge variant="outline">{cta.style}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {cta.clickCount} clicks
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteCta(cta.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booth Features</CardTitle>
              <CardDescription>
                Enable or disable interactive features for your booth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="chat-enabled" className="text-base font-medium">
                    Live Chat
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow visitors to send chat messages to your booth
                  </p>
                </div>
                <Switch
                  id="chat-enabled"
                  checked={formData.chatEnabled}
                  onCheckedChange={(checked) =>
                    handleFieldChange("chatEnabled", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="video-enabled" className="text-base font-medium">
                    Video Calls
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow visitors to request video calls with your staff
                  </p>
                </div>
                <Switch
                  id="video-enabled"
                  checked={formData.videoEnabled}
                  onCheckedChange={(checked) =>
                    handleFieldChange("videoEnabled", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tier Features</CardTitle>
              <CardDescription>
                Features available based on your {tierConfig.label} tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tierConfig.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className={cn("w-2 h-2 rounded-full", tierConfig.bgColor)} />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save button */}
      <div className="flex justify-end sticky bottom-4">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
          className="shadow-lg"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
