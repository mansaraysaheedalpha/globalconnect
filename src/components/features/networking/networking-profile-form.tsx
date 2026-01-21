// src/components/features/networking/networking-profile-form.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSocket } from "@/hooks/use-socket";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Users, Briefcase, Building2, TrendingUp } from "lucide-react";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Retail",
  "Manufacturing",
  "Media & Entertainment",
  "Real Estate",
  "Consulting",
  "Non-profit",
  "Government",
  "Other",
];

const EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-level (3-5 years)" },
  { value: "senior", label: "Senior (6-10 years)" },
  { value: "executive", label: "Executive (10+ years)" },
];

interface NetworkingProfile {
  currentRole?: string;
  company?: string;
  industry?: string;
  experienceLevel?: string;
  interests?: string[];
}

export function NetworkingProfileForm() {
  const { socket, isConnected } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<NetworkingProfile>({
    currentRole: "",
    company: "",
    industry: "",
    experienceLevel: "",
    interests: [],
  });
  const [initialData, setInitialData] = useState<NetworkingProfile>({});

  // Fetch existing profile on mount
  useEffect(() => {
    // Set a timeout to stop loading even if socket doesn't connect
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    if (!socket || !isConnected) return;

    socket.emit("profile.get", {}, (response: { success: boolean; profile?: NetworkingProfile }) => {
      clearTimeout(timeout);
      setIsLoading(false);
      if (response.success && response.profile) {
        setFormData({
          currentRole: response.profile.currentRole || "",
          company: response.profile.company || "",
          industry: response.profile.industry || "",
          experienceLevel: response.profile.experienceLevel || "",
          interests: response.profile.interests || [],
        });
        setInitialData(response.profile);
      }
    });

    return () => clearTimeout(timeout);
  }, [socket, isConnected]);

  const handleChange = (field: keyof NetworkingProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!socket || !isConnected) {
      toast.error("Not connected to server");
      return;
    }

    setIsSaving(true);
    socket.emit(
      "profile.update",
      formData,
      (response: { success: boolean; error?: string }) => {
        setIsSaving(false);
        if (response.success) {
          toast.success("Networking profile updated!");
          setInitialData(formData);
        } else {
          toast.error(response.error || "Failed to update profile");
        }
      }
    );
  };

  const isDirty =
    formData.currentRole !== (initialData.currentRole || "") ||
    formData.company !== (initialData.company || "") ||
    formData.industry !== (initialData.industry || "") ||
    formData.experienceLevel !== (initialData.experienceLevel || "");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Networking Profile
          </CardTitle>
          <CardDescription>
            This information helps us match you with relevant attendees and
            automatically assign you to the right breakout rooms during events.
            All fields are optional.
          </CardDescription>
          {!isConnected && (
            <p className="text-sm text-amber-600 mt-2">
              Connecting to server... Changes will be saved once connected.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentRole" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Job Title / Role
              </Label>
              <Input
                id="currentRole"
                placeholder="e.g., Software Engineer, Marketing Manager"
                value={formData.currentRole}
                onChange={(e) => handleChange("currentRole", e.target.value)}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Your current job title or role
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company
              </Label>
              <Input
                id="company"
                placeholder="e.g., Google, Startup XYZ"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Where you currently work
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleChange("industry", value)}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry.toLowerCase()}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Experience Level
              </Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => handleChange("experienceLevel", value)}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Why we collect this</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Match you with attendees who share your interests</li>
              <li>Auto-assign you to relevant breakout room discussions</li>
              <li>Provide personalized networking recommendations</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex w-full justify-end">
            <Button type="submit" disabled={!isDirty || isSaving || !isConnected}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
