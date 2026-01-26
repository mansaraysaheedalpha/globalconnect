// src/app/(sponsor)/sponsor/team/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  AlertCircle,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  MessageSquare,
  Settings,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  can_view_leads: boolean;
  can_export_leads: boolean;
  can_message_attendees: boolean;
  can_manage_booth: boolean;
  can_invite_others: boolean;
  is_active: boolean;
  joined_at: string;
  last_active_at?: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  can_view_leads: boolean;
  can_export_leads: boolean;
  can_message_attendees: boolean;
  can_manage_booth: boolean;
  can_invite_others: boolean;
  personal_message?: string;
  invited_by_user_id: string;
  created_at: string;
  expires_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

const ROLE_DESCRIPTIONS: Record<string, { label: string; description: string; color: string }> = {
  admin: {
    label: "Admin",
    description: "Full access to all features including team management",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  representative: {
    label: "Representative",
    description: "Can view, export, message leads and manage booth",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  booth_staff: {
    label: "Booth Staff",
    description: "Can view leads and manage booth settings",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access to leads",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
};

export default function TeamManagementPage() {
  const { token, user } = useAuthStore();
  const { activeSponsorId, activeSponsorName } = useSponsorStore();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "representative",
    personal_message: "",
  });

  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [invitationToRevoke, setInvitationToRevoke] = useState<Invitation | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Check if current user can invite others
  const currentUserMember = teamMembers.find(m => m.user_id === user?.sub);
  const canInviteOthers = currentUserMember?.can_invite_others ?? false;

  // Fetch team members and invitations
  const fetchTeamData = useCallback(async () => {
    if (!token || !activeSponsorId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch team members
      const membersRes = await fetch(
        `${API_BASE_URL}/sponsor-team/${activeSponsorId}/team`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!membersRes.ok) {
        throw new Error("Failed to fetch team members");
      }

      const membersData = await membersRes.json();
      setTeamMembers(membersData);

      // Fetch pending invitations (only if user can invite)
      if (currentUserMember?.can_invite_others) {
        try {
          const invitationsRes = await fetch(
            `${API_BASE_URL}/sponsor-team/${activeSponsorId}/team/invitations?status_filter=pending`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (invitationsRes.ok) {
            const invitationsData = await invitationsRes.json();
            setInvitations(invitationsData);
          }
        } catch (err) {
          console.log("Could not fetch invitations (user may not have permission)");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  }, [token, activeSponsorId, currentUserMember?.can_invite_others]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  // Handle invite team member
  const handleInvite = async () => {
    if (!inviteForm.email || !activeSponsorId) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsInviting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsor-team/${activeSponsorId}/team/invite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: inviteForm.email,
            role: inviteForm.role,
            personal_message: inviteForm.personal_message || null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to send invitation");
      }

      const invitation = await response.json();

      toast.success(
        `Invitation sent to ${inviteForm.email}`,
        {
          description: `They will receive an email with instructions to join your team as a ${ROLE_DESCRIPTIONS[inviteForm.role].label}.`,
        }
      );

      setIsInviteDialogOpen(false);
      setInviteForm({
        email: "",
        role: "representative",
        personal_message: "",
      });

      // Refresh team data
      fetchTeamData();
    } catch (err) {
      console.error("Failed to send invitation:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to send invitation. Please try again."
      );
    } finally {
      setIsInviting(false);
    }
  };

  // Handle remove team member
  const handleRemoveMember = async () => {
    if (!memberToRemove || !activeSponsorId) return;

    setIsRemoving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsor-team/${activeSponsorId}/team/${memberToRemove.user_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to remove team member");
      }

      toast.success("Team member removed successfully");
      setMemberToRemove(null);

      // Refresh team data
      fetchTeamData();
    } catch (err) {
      console.error("Failed to remove team member:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to remove team member"
      );
    } finally {
      setIsRemoving(false);
    }
  };

  // Handle revoke invitation
  const handleRevokeInvitation = async () => {
    if (!invitationToRevoke || !activeSponsorId) return;

    setIsRevoking(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsor-team/${activeSponsorId}/team/invitations/${invitationToRevoke.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to revoke invitation");
      }

      toast.success("Invitation revoked successfully");
      setInvitationToRevoke(null);

      // Refresh team data
      fetchTeamData();
    } catch (err) {
      console.error("Failed to revoke invitation:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke invitation"
      );
    } finally {
      setIsRevoking(false);
    }
  };

  // Render permission badges
  const PermissionBadges = ({ member }: { member: TeamMember | Invitation }) => (
    <div className="flex flex-wrap gap-1">
      {member.can_view_leads && (
        <Badge variant="outline" className="text-xs">
          <Eye className="h-3 w-3 mr-1" />
          View Leads
        </Badge>
      )}
      {member.can_export_leads && (
        <Badge variant="outline" className="text-xs">
          <Download className="h-3 w-3 mr-1" />
          Export
        </Badge>
      )}
      {member.can_message_attendees && (
        <Badge variant="outline" className="text-xs">
          <MessageSquare className="h-3 w-3 mr-1" />
          Message
        </Badge>
      )}
      {member.can_manage_booth && (
        <Badge variant="outline" className="text-xs">
          <Settings className="h-3 w-3 mr-1" />
          Manage Booth
        </Badge>
      )}
      {member.can_invite_others && (
        <Badge variant="outline" className="text-xs">
          <UserCheck className="h-3 w-3 mr-1" />
          Invite
        </Badge>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Team</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchTeamData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeSponsorId && !isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              Please select a sponsor event to manage your team.
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
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            {activeSponsorName
              ? `Manage team members for ${activeSponsorName}`
              : "Manage your sponsor team members and invitations"}
          </p>
        </div>
        {canInviteOthers && (
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to add someone to your sponsor team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) =>
                      setInviteForm({ ...inviteForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_DESCRIPTIONS).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col">
                            <span className="font-medium">{info.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {info.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show permissions preview based on selected role */}
                <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="text-sm font-medium mb-2">Permissions for {ROLE_DESCRIPTIONS[inviteForm.role].label}:</p>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {inviteForm.role === "admin" && (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>View and export leads</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Send messages to attendees</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Manage booth settings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Invite and manage team members</span>
                        </div>
                      </>
                    )}
                    {inviteForm.role === "representative" && (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>View and export leads</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Send messages to attendees</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Manage booth settings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-red-500" />
                          <span>Cannot invite team members</span>
                        </div>
                      </>
                    )}
                    {inviteForm.role === "booth_staff" && (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>View leads</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Manage booth settings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-red-500" />
                          <span>Cannot export or message leads</span>
                        </div>
                      </>
                    )}
                    {inviteForm.role === "viewer" && (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>View leads (read-only)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-red-500" />
                          <span>Cannot export, message, or manage</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Looking forward to working with you at the event!"
                    rows={3}
                    value={inviteForm.personal_message}
                    onChange={(e) =>
                      setInviteForm({
                        ...inviteForm,
                        personal_message: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    This message will be included in the invitation email
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(false)}
                  disabled={isInviting}
                >
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={isInviting}>
                  {isInviting ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team Members List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Current team members with active access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto opacity-50 mb-2" />
                  <p className="text-sm font-medium">No team members yet</p>
                  <p className="text-xs mt-1">
                    Invite team members to collaborate on your booth
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">
                              {member.user?.email || "Unknown User"}
                              {member.user_id === user?.sub && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (You)
                                </span>
                              )}
                            </p>
                            {member.user?.full_name && (
                              <p className="text-sm text-muted-foreground">
                                {member.user.full_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={ROLE_DESCRIPTIONS[member.role]?.color}
                          >
                            {ROLE_DESCRIPTIONS[member.role]?.label || member.role}
                          </Badge>
                          {!member.is_active && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <PermissionBadges member={member} />
                      </div>
                      {canInviteOthers && member.user_id !== user?.sub && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setMemberToRemove(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {canInviteOthers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Invitations
                </CardTitle>
                <CardDescription>
                  Invitations waiting to be accepted
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-8 w-8 mx-auto opacity-50 mb-2" />
                    <p className="text-sm font-medium">No pending invitations</p>
                    <p className="text-xs mt-1">
                      All sent invitations have been accepted or expired
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-start justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="space-y-2 flex-1">
                          <div>
                            <p className="font-medium">{invitation.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Invited {new Date(invitation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={ROLE_DESCRIPTIONS[invitation.role]?.color}
                            >
                              {ROLE_DESCRIPTIONS[invitation.role]?.label || invitation.role}
                            </Badge>
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              Pending
                            </Badge>
                          </div>
                          <PermissionBadges member={invitation} />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setInvitationToRevoke(invitation)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Team Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Members</span>
                <span className="font-medium">{teamMembers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Members</span>
                <span className="font-medium">
                  {teamMembers.filter((m) => m.is_active).length}
                </span>
              </div>
              {canInviteOthers && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending Invites</span>
                  <span className="font-medium">{invitations.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle>About Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(ROLE_DESCRIPTIONS).map(([key, info]) => (
                <div key={key} className="space-y-1">
                  <Badge className={info.color}>{info.label}</Badge>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {!canInviteOthers && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-700">Limited Access</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Only team admins can invite or remove team members. Contact your admin if you need to manage the team.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.user?.email} from the team?
              They will lose access to all sponsor features immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Invitation Confirmation Dialog */}
      <AlertDialog
        open={!!invitationToRevoke}
        onOpenChange={() => setInvitationToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the invitation for {invitationToRevoke?.email}?
              The invitation link will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeInvitation}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking ? "Revoking..." : "Revoke Invitation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
