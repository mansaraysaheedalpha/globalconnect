"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Settings, CheckCircle2, AlertCircle, Loader2, Mail, Bell, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type Status = "loading" | "ready" | "saving" | "success" | "error";

interface Preferences {
  sponsor_emails: boolean;
  event_updates: boolean;
  platform_news: boolean;
}

export default function EmailPreferencesPage() {
  const params = useParams();
  const deliveryId = params.deliveryId as string;
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [preferences, setPreferences] = useState<Preferences>({
    sponsor_emails: true,
    event_updates: true,
    platform_news: true,
  });
  const [sponsorName, setSponsorName] = useState<string>("");

  useEffect(() => {
    // Fetch current preferences
    const fetchPreferences = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sponsors-campaigns/email-preferences/${deliveryId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load preferences");
        }

        const data = await response.json();
        setPreferences({
          sponsor_emails: data.sponsor_emails ?? true,
          event_updates: data.event_updates ?? true,
          platform_news: data.platform_news ?? true,
        });
        setSponsorName(data.sponsor_name || "this sponsor");
        setStatus("ready");
      } catch (error) {
        // Default to showing the form even if fetch fails
        setStatus("ready");
      }
    };

    fetchPreferences();
  }, [deliveryId]);

  const handleSave = async () => {
    setStatus("saving");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sponsors-campaigns/email-preferences/${deliveryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preferences),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to save preferences");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        {status === "success" ? (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Preferences Saved</CardTitle>
                <CardDescription>
                  Your email preferences have been updated successfully.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild variant="outline">
                <Link href="/">Return to Event Dynamics</Link>
              </Button>
            </CardContent>
          </>
        ) : status === "error" ? (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => setStatus("ready")} className="w-full">
                Try Again
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Return to Event Dynamics</Link>
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Email Preferences</CardTitle>
                <CardDescription>
                  Manage what types of emails you receive from Event Dynamics and sponsors.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sponsor Emails */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sponsor-emails" className="text-sm font-medium">
                      Sponsor Emails
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive emails from {sponsorName || "sponsors"} you&apos;ve connected with at events
                    </p>
                  </div>
                </div>
                <Switch
                  id="sponsor-emails"
                  checked={preferences.sponsor_emails}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, sponsor_emails: checked }))
                  }
                />
              </div>

              <Separator />

              {/* Event Updates */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="event-updates" className="text-sm font-medium">
                      Event Updates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Important notifications about events you&apos;re attending
                    </p>
                  </div>
                </div>
                <Switch
                  id="event-updates"
                  checked={preferences.event_updates}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, event_updates: checked }))
                  }
                />
              </div>

              <Separator />

              {/* Platform News */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="platform-news" className="text-sm font-medium">
                      Platform News
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Updates about new features and improvements
                    </p>
                  </div>
                </div>
                <Switch
                  id="platform-news"
                  checked={preferences.platform_news}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, platform_news: checked }))
                  }
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={status === "saving"}
                  className="w-full"
                >
                  {status === "saving" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>

                <Button asChild variant="ghost" className="w-full text-destructive hover:text-destructive">
                  <Link href={`/unsubscribe/${deliveryId}`}>
                    Unsubscribe from all sponsor emails
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Reference: {deliveryId}
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
