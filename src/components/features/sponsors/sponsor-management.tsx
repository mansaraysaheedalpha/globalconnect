// src/components/features/sponsors/sponsor-management.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Users,
  Mail,
  ExternalLink,
  MoreVertical,
  Star,
  Trash2,
  Edit,
  UserPlus,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useSponsorManagement,
  Sponsor,
  SponsorTier,
  CreateSponsorInput,
} from "@/hooks/use-sponsor-management";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SponsorManagementProps {
  eventId: string;
  organizationId: string;
}

export function SponsorManagement({ eventId, organizationId }: SponsorManagementProps) {
  const {
    tiers,
    sponsors,
    sponsorCounts,
    isLoading,
    error,
    createDefaultTiers,
    createSponsor,
    updateSponsor,
    archiveSponsor,
    inviteRepresentative,
    clearError,
    refresh,
  } = useSponsorManagement({ eventId, organizationId });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for adding sponsor
  const [newSponsor, setNewSponsor] = useState<CreateSponsorInput>({
    companyName: "",
    companyDescription: "",
    companyWebsite: "",
    contactEmail: "",
    tierId: undefined,
    boothNumber: "",
  });

  // Form state for inviting representative
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("representative");

  const handleCreateDefaultTiers = async () => {
    setIsSubmitting(true);
    await createDefaultTiers();
    setIsSubmitting(false);
  };

  const handleAddSponsor = async () => {
    if (!newSponsor.companyName) return;

    setIsSubmitting(true);
    const result = await createSponsor(newSponsor);
    setIsSubmitting(false);

    if (result) {
      setIsAddDialogOpen(false);
      setNewSponsor({
        companyName: "",
        companyDescription: "",
        companyWebsite: "",
        contactEmail: "",
        tierId: undefined,
        boothNumber: "",
      });
    }
  };

  const handleOpenEditDialog = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsEditDialogOpen(true);
  };

  const handleEditSponsor = async () => {
    if (!selectedSponsor) return;

    setIsSubmitting(true);
    const result = await updateSponsor(selectedSponsor.id, {
      companyName: selectedSponsor.companyName,
      companyDescription: selectedSponsor.companyDescription || undefined,
      companyWebsite: selectedSponsor.companyWebsite || undefined,
      contactEmail: selectedSponsor.contactEmail || undefined,
      tierId: selectedSponsor.tierId || undefined,
      boothNumber: selectedSponsor.boothNumber || undefined,
    });
    setIsSubmitting(false);

    if (result) {
      setIsEditDialogOpen(false);
      setSelectedSponsor(null);
    }
  };

  const handleInviteRepresentative = async () => {
    if (!selectedSponsor || !inviteEmail) return;

    setIsSubmitting(true);
    const result = await inviteRepresentative(selectedSponsor.id, {
      email: inviteEmail,
      role: inviteRole,
      canViewLeads: true,
      canExportLeads: inviteRole === "admin",
      canManageBooth: inviteRole === "admin" || inviteRole === "representative",
      canInviteOthers: inviteRole === "admin",
    });
    setIsSubmitting(false);

    if (result) {
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("representative");
    }
  };

  const handleToggleFeatured = async (sponsor: Sponsor) => {
    await updateSponsor(sponsor.id, { isFeatured: !sponsor.isFeatured });
  };

  const handleArchiveSponsor = async (sponsorId: string) => {
    if (confirm("Are you sure you want to remove this sponsor?")) {
      await archiveSponsor(sponsorId);
    }
  };

  const getTierBadgeStyle = (tier?: SponsorTier) => {
    if (!tier) return {};
    const color = tier.color || "#888";
    return {
      backgroundColor: `${color}20`,
      color: color === "#E5E4E2" ? "#666" : color,
      borderColor: color,
    };
  };

  // Map API response to display format with counts
  const displaySponsors = sponsors.map((s) => {
    const counts = sponsorCounts.get(s.id) || { representativeCount: 0, leadCount: 0 };
    return {
      ...s,
      representativeCount: counts.representativeCount,
      leadCount: counts.leadCount,
    };
  });

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sponsor Management</h1>
          <p className="text-muted-foreground">
            Manage sponsors, tiers, and representatives for your event
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={tiers.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sponsor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Sponsor</DialogTitle>
                <DialogDescription>
                  Add a sponsor company to your event. You can invite representatives after.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={newSponsor.companyName}
                    onChange={(e) => setNewSponsor({ ...newSponsor, companyName: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tier">Sponsorship Tier</Label>
                  <Select
                    value={newSponsor.tierId || ""}
                    onValueChange={(value) => setNewSponsor({ ...newSponsor, tierId: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tier.color || "#888" }}
                            />
                            {tier.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={newSponsor.contactEmail || ""}
                    onChange={(e) => setNewSponsor({ ...newSponsor, contactEmail: e.target.value })}
                    placeholder="sponsor@company.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={newSponsor.companyWebsite || ""}
                    onChange={(e) => setNewSponsor({ ...newSponsor, companyWebsite: e.target.value })}
                    placeholder="https://company.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="boothNumber">Booth Number</Label>
                  <Input
                    id="boothNumber"
                    value={newSponsor.boothNumber || ""}
                    onChange={(e) => setNewSponsor({ ...newSponsor, boothNumber: e.target.value })}
                    placeholder="A-15"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSponsor.companyDescription || ""}
                    onChange={(e) => setNewSponsor({ ...newSponsor, companyDescription: e.target.value })}
                    placeholder="Brief description of the sponsor..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSponsor} disabled={!newSponsor.companyName || isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Sponsor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{displaySponsors.length}</p>
                <p className="text-xs text-muted-foreground">Total Sponsors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {displaySponsors.reduce((sum, s) => sum + s.representativeCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Representatives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {displaySponsors.reduce((sum, s) => sum + s.leadCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {displaySponsors.filter((s) => s.isFeatured).length}
                </p>
                <p className="text-xs text-muted-foreground">Featured</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tiers Setup (if no tiers exist) */}
      {tiers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Set Up Sponsorship Tiers</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Create sponsorship tiers to organize your sponsors by level (Platinum, Gold, Silver, Bronze)
            </p>
            <Button onClick={handleCreateDefaultTiers} disabled={isSubmitting || isLoading}>
              {(isSubmitting || isLoading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Default Tiers
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sponsors List */}
      {tiers.length > 0 && (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Sponsors</TabsTrigger>
            {tiers.map((tier) => (
              <TabsTrigger key={tier.id} value={tier.id}>
                {tier.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {displaySponsors.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Sponsors Yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                    Add your first sponsor to get started with sponsor management
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sponsor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displaySponsors.map((sponsor) => (
                  <SponsorCard
                    key={sponsor.id}
                    sponsor={sponsor}
                    tier={tiers.find((t) => t.id === sponsor.tierId)}
                    onEdit={() => handleOpenEditDialog(sponsor)}
                    onInvite={() => {
                      setSelectedSponsor(sponsor);
                      setIsInviteDialogOpen(true);
                    }}
                    onToggleFeatured={() => handleToggleFeatured(sponsor)}
                    onArchive={() => handleArchiveSponsor(sponsor.id)}
                    getTierBadgeStyle={getTierBadgeStyle}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {tiers.map((tier) => (
            <TabsContent key={tier.id} value={tier.id} className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displaySponsors
                  .filter((s) => s.tierId === tier.id)
                  .map((sponsor) => (
                    <SponsorCard
                      key={sponsor.id}
                      sponsor={sponsor}
                      tier={tier}
                      onEdit={() => handleOpenEditDialog(sponsor)}
                      onInvite={() => {
                        setSelectedSponsor(sponsor);
                        setIsInviteDialogOpen(true);
                      }}
                      onToggleFeatured={() => handleToggleFeatured(sponsor)}
                      onArchive={() => handleArchiveSponsor(sponsor.id)}
                      getTierBadgeStyle={getTierBadgeStyle}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Invite Representative Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Representative</DialogTitle>
            <DialogDescription>
              Invite someone to represent {selectedSponsor?.companyName} at this event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="representative@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inviteRole">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (Full access)</SelectItem>
                  <SelectItem value="representative">Representative (View & manage leads)</SelectItem>
                  <SelectItem value="booth_staff">Booth Staff (View leads only)</SelectItem>
                  <SelectItem value="viewer">Viewer (Read-only access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteRepresentative} disabled={!inviteEmail || isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sponsor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Sponsor</DialogTitle>
            <DialogDescription>
              Update sponsor information.
            </DialogDescription>
          </DialogHeader>
          {selectedSponsor && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editCompanyName">Company Name *</Label>
                <Input
                  id="editCompanyName"
                  value={selectedSponsor.companyName || ""}
                  onChange={(e) => setSelectedSponsor({ ...selectedSponsor, companyName: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editTier">Sponsorship Tier</Label>
                <Select
                  value={selectedSponsor.tierId || ""}
                  onValueChange={(value) => setSelectedSponsor({ ...selectedSponsor, tierId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tier.color || "#888" }}
                          />
                          {tier.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editContactEmail">Contact Email</Label>
                <Input
                  id="editContactEmail"
                  type="email"
                  value={selectedSponsor.contactEmail || ""}
                  onChange={(e) => setSelectedSponsor({ ...selectedSponsor, contactEmail: e.target.value })}
                  placeholder="sponsor@company.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editCompanyWebsite">Website</Label>
                <Input
                  id="editCompanyWebsite"
                  value={selectedSponsor.companyWebsite || ""}
                  onChange={(e) => setSelectedSponsor({ ...selectedSponsor, companyWebsite: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editBoothNumber">Booth Number</Label>
                <Input
                  id="editBoothNumber"
                  value={selectedSponsor.boothNumber || ""}
                  onChange={(e) => setSelectedSponsor({ ...selectedSponsor, boothNumber: e.target.value })}
                  placeholder="A-15"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={selectedSponsor.companyDescription || ""}
                  onChange={(e) => setSelectedSponsor({ ...selectedSponsor, companyDescription: e.target.value })}
                  placeholder="Brief description of the sponsor..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSponsor} disabled={!selectedSponsor?.companyName || isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sponsor Card Component
interface SponsorCardProps {
  sponsor: Sponsor & { representativeCount: number; leadCount: number };
  tier?: SponsorTier;
  onEdit: () => void;
  onInvite: () => void;
  onToggleFeatured: () => void;
  onArchive: () => void;
  getTierBadgeStyle: (tier?: SponsorTier) => React.CSSProperties;
}

function SponsorCard({
  sponsor,
  tier,
  onEdit,
  onInvite,
  onToggleFeatured,
  onArchive,
  getTierBadgeStyle,
}: SponsorCardProps) {
  return (
    <Card className="relative">
      {sponsor.isFeatured && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-yellow-500">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={sponsor.companyLogoUrl || undefined} />
              <AvatarFallback>
                {sponsor.companyName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{sponsor.companyName}</CardTitle>
              {tier && (
                <Badge
                  variant="outline"
                  className="mt-1"
                  style={getTierBadgeStyle(tier)}
                >
                  {tier.name}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onInvite}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Representative
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleFeatured}>
                <Star className="h-4 w-4 mr-2" />
                {sponsor.isFeatured ? "Remove Featured" : "Mark Featured"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={onArchive}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {sponsor.companyDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {sponsor.companyDescription}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{sponsor.representativeCount} reps</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>{sponsor.leadCount} leads</span>
          </div>
          {sponsor.boothNumber && (
            <Badge variant="secondary">Booth {sponsor.boothNumber}</Badge>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          {sponsor.companyWebsite && (
            <Button variant="outline" size="sm" asChild>
              <a href={sponsor.companyWebsite} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Website
              </a>
            </Button>
          )}
          {sponsor.contactEmail && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${sponsor.contactEmail}`}>
                <Mail className="h-3 w-3 mr-1" />
                Contact
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
