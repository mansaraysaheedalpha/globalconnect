// src/app/(platform)/dashboard/events/[eventId]/expo/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Store,
  Plus,
  Building2,
  Users,
  Eye,
  BarChart3,
  Settings,
  Trash2,
  Edit,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useSocket } from "@/hooks/use-socket";

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002";

interface ExpoHall {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  opensAt?: string;
  closesAt?: string;
  categories: string[];
  _count?: {
    booths: number;
  };
}

interface ExpoBooth {
  id: string;
  name: string;
  description?: string;
  sponsorId: string;
  tier?: string;
  isActive: boolean;
  position?: number;
  _count?: {
    visits: number;
  };
}

interface BoothAnalytics {
  currentVisitors: number;
  totalVisitors: number;
  uniqueVisitors: number;
  totalLeads: number;
  totalDownloads: number;
  totalCtaClicks: number;
}

export default function ExpoManagementPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { token } = useAuthStore();
  const { socket, isConnected } = useSocket();

  const [hall, setHall] = useState<ExpoHall | null>(null);
  const [booths, setBooths] = useState<ExpoBooth[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, BoothAnalytics>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create hall dialog
  const [showCreateHall, setShowCreateHall] = useState(false);
  const [isCreatingHall, setIsCreatingHall] = useState(false);
  const [hallForm, setHallForm] = useState({
    name: "",
    description: "",
    categories: "",
  });

  // Create booth dialog
  const [showCreateBooth, setShowCreateBooth] = useState(false);
  const [isCreatingBooth, setIsCreatingBooth] = useState(false);
  const [boothForm, setBoothForm] = useState({
    name: "",
    tagline: "",
    description: "",
    tier: "BRONZE",
    category: "",
  });

  // Fetch expo hall data
  useEffect(() => {
    if (!socket || !isConnected || !eventId) return;

    setIsLoading(true);

    // Get hall info
    socket.emit("expo.hall.get", { eventId }, (response: any) => {
      setIsLoading(false);
      if (response.success && response.hall) {
        setHall(response.hall);
        setBooths(response.hall.booths || []);
      } else if (response.error && !response.error.includes("not found")) {
        setError(response.error);
      }
    });
  }, [socket, isConnected, eventId]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleBoothUpdate = (data: { boothId: string; analytics: BoothAnalytics }) => {
      setAnalytics((prev) => ({
        ...prev,
        [data.boothId]: data.analytics,
      }));
    };

    const handleVisitorUpdate = (data: { boothId: string; currentVisitors: number }) => {
      setAnalytics((prev) => ({
        ...prev,
        [data.boothId]: {
          ...prev[data.boothId],
          currentVisitors: data.currentVisitors,
        },
      }));
    };

    socket.on("expo.booth.analytics.updated", handleBoothUpdate);
    socket.on("expo.booth.visitors.updated", handleVisitorUpdate);

    return () => {
      socket.off("expo.booth.analytics.updated", handleBoothUpdate);
      socket.off("expo.booth.visitors.updated", handleVisitorUpdate);
    };
  }, [socket, isConnected]);

  // Create expo hall
  const handleCreateHall = async () => {
    if (!socket || !hallForm.name.trim()) return;

    setIsCreatingHall(true);

    socket.emit(
      "expo.hall.create",
      {
        eventId,
        name: hallForm.name.trim(),
        description: hallForm.description.trim() || undefined,
        categories: hallForm.categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      },
      (response: any) => {
        setIsCreatingHall(false);
        if (response.success) {
          setHall(response.hall);
          setShowCreateHall(false);
          setHallForm({ name: "", description: "", categories: "" });
          toast.success("Expo hall created successfully");
        } else {
          toast.error(response.error || "Failed to create expo hall");
        }
      }
    );
  };

  // Toggle hall active status
  const toggleHallStatus = () => {
    if (!socket || !hall) return;

    socket.emit(
      "expo.hall.update",
      {
        hallId: hall.id,
        isActive: !hall.isActive,
      },
      (response: any) => {
        if (response.success) {
          setHall(response.hall);
          toast.success(`Expo hall ${response.hall.isActive ? "activated" : "deactivated"}`);
        } else {
          toast.error(response.error || "Failed to update expo hall");
        }
      }
    );
  };

  // Create booth
  const handleCreateBooth = async () => {
    if (!socket || !hall || !boothForm.name.trim()) return;

    setIsCreatingBooth(true);

    socket.emit(
      "expo.booth.create",
      {
        hallId: hall.id,
        name: boothForm.name.trim(),
        tagline: boothForm.tagline.trim() || undefined,
        description: boothForm.description.trim() || undefined,
        tier: boothForm.tier,
        category: boothForm.category.trim() || undefined,
      },
      (response: any) => {
        setIsCreatingBooth(false);
        if (response.success) {
          setBooths((prev) => [...prev, response.booth]);
          setShowCreateBooth(false);
          setBoothForm({
            name: "",
            tagline: "",
            description: "",
            tier: "BRONZE",
            category: "",
          });
          toast.success("Booth created successfully");
        } else {
          toast.error(response.error || "Failed to create booth");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  // No hall created yet
  if (!hall) {
    return (
      <div className="p-6">
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Expo Hall</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              Create an expo hall for this event to allow sponsors to set up virtual booths.
            </p>
            <Dialog open={showCreateHall} onOpenChange={setShowCreateHall}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Expo Hall
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Expo Hall</DialogTitle>
                  <DialogDescription>
                    Set up a virtual expo hall for sponsors to showcase their booths.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hall Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Main Expo Hall"
                      value={hallForm.name}
                      onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the expo hall..."
                      value={hallForm.description}
                      onChange={(e) => setHallForm({ ...hallForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categories">Categories (comma-separated)</Label>
                    <Input
                      id="categories"
                      placeholder="e.g., Technology, Services, Startups"
                      value={hallForm.categories}
                      onChange={(e) => setHallForm({ ...hallForm, categories: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateHall(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateHall} disabled={isCreatingHall || !hallForm.name.trim()}>
                    {isCreatingHall ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Hall"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals
  const totalVisitors = Object.values(analytics).reduce((sum, a) => sum + (a?.totalVisitors || 0), 0);
  const currentVisitors = Object.values(analytics).reduce((sum, a) => sum + (a?.currentVisitors || 0), 0);
  const totalLeads = Object.values(analytics).reduce((sum, a) => sum + (a?.totalLeads || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{hall.name}</h1>
            <Badge
              className={
                hall.isActive
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : "bg-gray-500/10 text-gray-600 border-gray-500/20"
              }
            >
              {hall.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {hall.description || "Manage your virtual expo hall and sponsor booths"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleHallStatus}>
            {hall.isActive ? "Deactivate" : "Activate"} Hall
          </Button>
          <Button variant="outline" asChild>
            <a href={`/attendee/events/${eventId}/expo`} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Booths</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{booths.length}</div>
            <p className="text-xs text-muted-foreground">Active sponsor booths</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentVisitors}</div>
            <p className="text-xs text-muted-foreground">Browsing expo hall now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors}</div>
            <p className="text-xs text-muted-foreground">Booth visits today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Captured</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">Across all booths</p>
          </CardContent>
        </Card>
      </div>

      {/* Booths */}
      <Tabs defaultValue="booths" className="space-y-4">
        <TabsList>
          <TabsTrigger value="booths">Booths</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="booths" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showCreateBooth} onOpenChange={setShowCreateBooth}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Booth
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Booth</DialogTitle>
                  <DialogDescription>
                    Add a new sponsor booth to the expo hall.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="booth-name">Booth Name</Label>
                    <Input
                      id="booth-name"
                      placeholder="e.g., Acme Corp"
                      value={boothForm.name}
                      onChange={(e) => setBoothForm({ ...boothForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booth-tagline">Tagline</Label>
                    <Input
                      id="booth-tagline"
                      placeholder="e.g., Building the future of tech"
                      value={boothForm.tagline}
                      onChange={(e) => setBoothForm({ ...boothForm, tagline: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booth-description">Description</Label>
                    <Textarea
                      id="booth-description"
                      placeholder="Brief description of the company..."
                      value={boothForm.description}
                      onChange={(e) => setBoothForm({ ...boothForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="booth-tier">Tier</Label>
                      <select
                        id="booth-tier"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={boothForm.tier}
                        onChange={(e) => setBoothForm({ ...boothForm, tier: e.target.value })}
                      >
                        <option value="BRONZE">Bronze</option>
                        <option value="SILVER">Silver</option>
                        <option value="GOLD">Gold</option>
                        <option value="PLATINUM">Platinum</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booth-category">Category</Label>
                      <Input
                        id="booth-category"
                        placeholder="e.g., Technology"
                        value={boothForm.category}
                        onChange={(e) => setBoothForm({ ...boothForm, category: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateBooth(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBooth} disabled={isCreatingBooth || !boothForm.name.trim()}>
                    {isCreatingBooth ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Booth"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {booths.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Booths Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                  Create booths for sponsors to showcase their products and services.
                </p>
                <Button onClick={() => setShowCreateBooth(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Booth
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {booths.map((booth) => (
                <Card key={booth.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{booth.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          booth.isActive
                            ? "bg-green-500/10 text-green-600"
                            : "bg-gray-500/10 text-gray-600"
                        }
                      >
                        {booth.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {booth.tier && (
                      <Badge variant="secondary" className="w-fit">
                        {booth.tier}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Visitors</p>
                        <p className="font-medium">
                          {analytics[booth.id]?.currentVisitors || 0} now / {analytics[booth.id]?.totalVisitors || 0} total
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Leads</p>
                        <p className="font-medium">{analytics[booth.id]?.totalLeads || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Expo Analytics</CardTitle>
              <CardDescription>
                Detailed analytics across all booths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics data will be displayed here as visitors interact with the expo hall.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Hall Settings</CardTitle>
              <CardDescription>
                Configure expo hall settings and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {hall.categories.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                  {hall.categories.length === 0 && (
                    <p className="text-sm text-muted-foreground">No categories set</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Connection Status</Label>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Real-time connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">Connecting...</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
