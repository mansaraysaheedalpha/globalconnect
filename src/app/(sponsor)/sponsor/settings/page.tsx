// src/app/(sponsor)/sponsor/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Bell,
  Mail,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";

interface SponsorUserSettings {
  id: string;
  sponsor_id: string;
  user_id: string;
  role: string;
  job_title: string | null;
  notification_email: string | null;
  notify_new_leads: boolean;
  notify_hot_leads: boolean;
  notify_daily_summary: boolean;
  notify_event_updates: boolean;
  can_view_leads: boolean;
  can_export_leads: boolean;
  can_message_attendees: boolean;
  can_manage_booth: boolean;
  can_invite_others: boolean;
  is_active: boolean;
  joined_at: string;
  last_active_at: string | null;
}

export default function SponsorSettingsPage() {
  const { user, logout, token } = useAuthStore();
  const { activeSponsorId } = useSponsorStore();
  const { toast } = useToast();

  const [settings, setSettings] = useState<SponsorUserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notifyNewLeads, setNotifyNewLeads] = useState(true);
  const [notifyHotLeads, setNotifyHotLeads] = useState(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(true);
  const [notifyEventUpdates, setNotifyEventUpdates] = useState(false);

  const fullName = user ? `${user.first_name} ${user.last_name}` : "";
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SP";

  // Fetch user settings
  useEffect(() => {
    if (!activeSponsorId || !token) return;

    const fetchSettings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sponsor-settings/sponsors/${activeSponsorId}/settings/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load settings");
        }

        const data: SponsorUserSettings = await response.json();
        setSettings(data);

        // Populate form
        setJobTitle(data.job_title || "");
        setNotificationEmail(data.notification_email || "");
        setNotifyNewLeads(data.notify_new_leads);
        setNotifyHotLeads(data.notify_hot_leads);
        setNotifyDailySummary(data.notify_daily_summary);
        setNotifyEventUpdates(data.notify_event_updates);
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your settings. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [activeSponsorId, token, toast]);

  const handleSaveProfile = async () => {
    if (!activeSponsorId || !token) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sponsor-settings/sponsors/${activeSponsorId}/settings/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_title: jobTitle || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!activeSponsorId || !token) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sponsor-settings/sponsors/${activeSponsorId}/settings/preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notification_email: notificationEmail || null,
            notify_new_leads: notifyNewLeads,
            notify_hot_leads: notifyHotLeads,
            notify_daily_summary: notifyDailySummary,
            notify_event_updates: notifyEventUpdates,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      toast({
        title: "Success",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and notification preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.imageUrl || undefined} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    Profile photo is managed by your account provider
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={fullName}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Managed by your account provider
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Sales Representative"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Lead Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when a new lead is captured
                  </p>
                </div>
                <Switch
                  checked={notifyNewLeads}
                  onCheckedChange={setNotifyNewLeads}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hot Lead Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Immediate alerts for high-intent leads
                  </p>
                </div>
                <Switch
                  checked={notifyHotLeads}
                  onCheckedChange={setNotifyHotLeads}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Summary</Label>
                  <p className="text-xs text-muted-foreground">
                    Daily email with lead capture summary
                  </p>
                </div>
                <Switch
                  checked={notifyDailySummary}
                  onCheckedChange={setNotifyDailySummary}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Event Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Updates about the event schedule
                  </p>
                </div>
                <Switch
                  checked={notifyEventUpdates}
                  onCheckedChange={setNotifyEventUpdates}
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Preferences
              </CardTitle>
              <CardDescription>
                Manage email notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  placeholder={user?.email || ""}
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use your account email ({user?.email})
                </p>
              </div>
              <Button
                onClick={handleSavePreferences}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="font-medium">{fullName}</p>
                <p className="text-muted-foreground">{user?.email}</p>
                {settings?.role && (
                  <p className="text-xs text-muted-foreground capitalize mt-1">
                    {settings.role.replace("_", " ")}
                  </p>
                )}
              </div>
              <Separator />
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
