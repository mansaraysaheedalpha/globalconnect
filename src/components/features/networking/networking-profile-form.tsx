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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  Sparkles,
  Target,
  Heart,
  Code,
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  ChevronDown,
  ChevronUp,
  Info,
  X,
} from "lucide-react";

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

// Networking goals for AI matching (same as registration)
const NETWORKING_GOALS = [
  { value: "LEARN", label: "Learn new skills", icon: "📚" },
  { value: "NETWORK", label: "Build connections", icon: "🤝" },
  { value: "HIRE", label: "Find talent to hire", icon: "👔" },
  { value: "GET_HIRED", label: "Find job opportunities", icon: "💼" },
  { value: "FIND_PARTNERS", label: "Find business partners", icon: "🤲" },
  { value: "FIND_INVESTORS", label: "Find investors", icon: "💰" },
  { value: "MENTOR", label: "Mentor others", icon: "🎓" },
  { value: "GET_MENTORED", label: "Find a mentor", icon: "🌱" },
] as const;

// Suggested interests for quick selection
const SUGGESTED_INTERESTS = [
  "AI/ML", "Web Development", "Mobile Apps", "Cloud", "DevOps",
  "Startups", "Product Management", "Design", "Data Science", "Blockchain",
  "Cybersecurity", "Marketing", "Sales", "Finance", "Leadership",
];

// Suggested skills
const SUGGESTED_SKILLS = [
  "Python", "JavaScript", "React", "Node.js", "AWS", "Docker",
  "Leadership", "Public Speaking", "Project Management", "UI/UX Design",
  "Data Analysis", "Marketing Strategy", "Sales", "Fundraising",
];

interface NetworkingProfile {
  // Professional info
  currentRole?: string;
  company?: string;
  industry?: string;
  experienceLevel?: string;
  // Networking
  goals?: string[];
  interests?: string[];
  bio?: string;
  // Skills
  skillsToOffer?: string[];
  skillsNeeded?: string[];
  // Social media
  linkedInUrl?: string;
  githubUsername?: string;
  twitterHandle?: string;
  facebookProfileUrl?: string;
  instagramHandle?: string;
  youtubeChannelUrl?: string;
  personalWebsite?: string;
}

export function NetworkingProfileForm() {
  const { socket, isConnected } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);

  const [formData, setFormData] = useState<NetworkingProfile>({
    currentRole: "",
    company: "",
    industry: "",
    experienceLevel: "",
    goals: [],
    interests: [],
    bio: "",
    skillsToOffer: [],
    skillsNeeded: [],
    linkedInUrl: "",
    githubUsername: "",
    twitterHandle: "",
    facebookProfileUrl: "",
    instagramHandle: "",
    youtubeChannelUrl: "",
    personalWebsite: "",
  });

  const [initialData, setInitialData] = useState<NetworkingProfile>({});
  const [customInterest, setCustomInterest] = useState("");
  const [customSkillToOffer, setCustomSkillToOffer] = useState("");
  const [customSkillNeeded, setCustomSkillNeeded] = useState("");

  // Fetch existing profile on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    if (!socket || !isConnected) return;

    socket.emit("profile.get", {}, (response: { success: boolean; profile?: NetworkingProfile }) => {
      clearTimeout(timeout);
      setIsLoading(false);
      if (response.success && response.profile) {
        const profile = {
          currentRole: response.profile.currentRole || "",
          company: response.profile.company || "",
          industry: response.profile.industry || "",
          experienceLevel: response.profile.experienceLevel || "",
          goals: response.profile.goals || [],
          interests: response.profile.interests || [],
          bio: response.profile.bio || "",
          skillsToOffer: response.profile.skillsToOffer || [],
          skillsNeeded: response.profile.skillsNeeded || [],
          linkedInUrl: response.profile.linkedInUrl || "",
          githubUsername: response.profile.githubUsername || "",
          twitterHandle: response.profile.twitterHandle || "",
          facebookProfileUrl: response.profile.facebookProfileUrl || "",
          instagramHandle: response.profile.instagramHandle || "",
          youtubeChannelUrl: response.profile.youtubeChannelUrl || "",
          personalWebsite: response.profile.personalWebsite || "",
        };
        setFormData(profile);
        setInitialData(profile);

        // Expand social links section if any are filled
        const hasSocialLinks = !!(
          profile.linkedInUrl || profile.githubUsername || profile.twitterHandle ||
          profile.facebookProfileUrl || profile.instagramHandle ||
          profile.youtubeChannelUrl || profile.personalWebsite
        );
        setShowSocialLinks(hasSocialLinks);
      }
    });

    return () => clearTimeout(timeout);
  }, [socket, isConnected]);

  const handleChange = (field: keyof NetworkingProfile, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    const currentGoals = formData.goals || [];
    if (currentGoals.includes(goal)) {
      handleChange("goals", currentGoals.filter((g) => g !== goal));
    } else if (currentGoals.length < 5) {
      handleChange("goals", [...currentGoals, goal]);
    } else {
      toast.error("You can select up to 5 goals");
    }
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = formData.interests || [];
    if (currentInterests.includes(interest)) {
      handleChange("interests", currentInterests.filter((i) => i !== interest));
    } else if (currentInterests.length < 10) {
      handleChange("interests", [...currentInterests, interest]);
    } else {
      toast.error("You can select up to 10 interests");
    }
  };

  const addCustomInterest = () => {
    const custom = customInterest.trim();
    const currentInterests = formData.interests || [];
    if (custom && !currentInterests.includes(custom) && currentInterests.length < 10) {
      handleChange("interests", [...currentInterests, custom]);
      setCustomInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    handleChange("interests", (formData.interests || []).filter((i) => i !== interest));
  };

  const toggleSkillToOffer = (skill: string) => {
    const currentSkills = formData.skillsToOffer || [];
    if (currentSkills.includes(skill)) {
      handleChange("skillsToOffer", currentSkills.filter((s) => s !== skill));
    } else if (currentSkills.length < 10) {
      handleChange("skillsToOffer", [...currentSkills, skill]);
    } else {
      toast.error("You can select up to 10 skills");
    }
  };

  const addCustomSkillToOffer = () => {
    const custom = customSkillToOffer.trim();
    const currentSkills = formData.skillsToOffer || [];
    if (custom && !currentSkills.includes(custom) && currentSkills.length < 10) {
      handleChange("skillsToOffer", [...currentSkills, custom]);
      setCustomSkillToOffer("");
    }
  };

  const removeSkillToOffer = (skill: string) => {
    handleChange("skillsToOffer", (formData.skillsToOffer || []).filter((s) => s !== skill));
  };

  const toggleSkillNeeded = (skill: string) => {
    const currentSkills = formData.skillsNeeded || [];
    if (currentSkills.includes(skill)) {
      handleChange("skillsNeeded", currentSkills.filter((s) => s !== skill));
    } else if (currentSkills.length < 10) {
      handleChange("skillsNeeded", [...currentSkills, skill]);
    } else {
      toast.error("You can select up to 10 skills");
    }
  };

  const addCustomSkillNeeded = () => {
    const custom = customSkillNeeded.trim();
    const currentSkills = formData.skillsNeeded || [];
    if (custom && !currentSkills.includes(custom) && currentSkills.length < 10) {
      handleChange("skillsNeeded", [...currentSkills, custom]);
      setCustomSkillNeeded("");
    }
  };

  const removeSkillNeeded = (skill: string) => {
    handleChange("skillsNeeded", (formData.skillsNeeded || []).filter((s) => s !== skill));
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

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

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
            provide personalized recommendations at events. All fields are optional.
          </CardDescription>
          {!isConnected && (
            <p className="text-sm text-amber-600 mt-2">
              Connecting to server... Changes will be saved once connected.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Professional Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Professional Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentRole">Job Title / Role</Label>
                <Input
                  id="currentRole"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  value={formData.currentRole}
                  onChange={(e) => handleChange("currentRole", e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="e.g., Google, Startup XYZ"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  disabled={isSaving}
                />
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
                  <SelectContent position="popper" side="bottom" sideOffset={4}>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => handleChange("experienceLevel", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" sideOffset={4}>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Networking Goals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Networking Goals</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Select up to 5 goals to help us find your perfect connections
            </p>
            <div className="flex flex-wrap gap-2">
              {NETWORKING_GOALS.map((goal) => (
                <Badge
                  key={goal.value}
                  variant={(formData.goals || []).includes(goal.value) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer py-1.5 px-3 text-sm transition-all",
                    (formData.goals || []).includes(goal.value)
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleGoal(goal.value)}
                >
                  <span className="mr-1">{goal.icon}</span>
                  {goal.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Interests</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Select up to 10 interests or add your own
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_INTERESTS.map((interest) => (
                <Badge
                  key={interest}
                  variant={(formData.interests || []).includes(interest) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer py-1 px-2.5 text-sm transition-all",
                    (formData.interests || []).includes(interest)
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>

            {/* Custom interests that aren't in the suggested list */}
            {(formData.interests || [])
              .filter((interest) => !SUGGESTED_INTERESTS.includes(interest))
              .map((interest) => (
                <Badge
                  key={interest}
                  variant="default"
                  className="mr-2 mb-2"
                >
                  {interest}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeInterest(interest)}
                  />
                </Badge>
              ))}

            <div className="flex gap-2">
              <Input
                placeholder="Add custom interest..."
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomInterest();
                  }
                }}
                disabled={isSaving}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomInterest}
                disabled={isSaving}
              >
                Add
              </Button>
            </div>
          </div>

          {/* About / Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">About You</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself, your background, and what you're passionate about... (max 500 characters)"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                disabled={isSaving}
                maxLength={500}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {(formData.bio || "").length} / 500
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Skills</h3>
            </div>

            {/* Skills to Offer */}
            <div className="space-y-2">
              <Label>Skills You Can Offer (up to 10)</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={(formData.skillsToOffer || []).includes(skill) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer py-1 px-2.5 text-sm transition-all",
                      (formData.skillsToOffer || []).includes(skill)
                        ? "bg-green-600 hover:bg-green-700"
                        : "hover:bg-muted"
                    )}
                    onClick={() => toggleSkillToOffer(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* Custom skills to offer */}
              {(formData.skillsToOffer || [])
                .filter((skill) => !SUGGESTED_SKILLS.includes(skill))
                .map((skill) => (
                  <Badge
                    key={skill}
                    variant="default"
                    className="mr-2 mb-2 bg-green-600"
                  >
                    {skill}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => removeSkillToOffer(skill)}
                    />
                  </Badge>
                ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom skill..."
                  value={customSkillToOffer}
                  onChange={(e) => setCustomSkillToOffer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSkillToOffer();
                    }
                  }}
                  disabled={isSaving}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomSkillToOffer}
                  disabled={isSaving}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Skills Needed */}
            <div className="space-y-2">
              <Label>Skills You Need (up to 10)</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={(formData.skillsNeeded || []).includes(skill) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer py-1 px-2.5 text-sm transition-all",
                      (formData.skillsNeeded || []).includes(skill)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-muted"
                    )}
                    onClick={() => toggleSkillNeeded(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* Custom skills needed */}
              {(formData.skillsNeeded || [])
                .filter((skill) => !SUGGESTED_SKILLS.includes(skill))
                .map((skill) => (
                  <Badge
                    key={skill}
                    variant="default"
                    className="mr-2 mb-2 bg-blue-600"
                  >
                    {skill}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => removeSkillNeeded(skill)}
                    />
                  </Badge>
                ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom skill..."
                  value={customSkillNeeded}
                  onChange={(e) => setCustomSkillNeeded(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSkillNeeded();
                    }
                  }}
                  disabled={isSaving}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomSkillNeeded}
                  disabled={isSaving}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Social Media Links - Collapsible */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
              onClick={() => setShowSocialLinks(!showSocialLinks)}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Social Media & Links</h3>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
              </div>
              {showSocialLinks ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showSocialLinks && (
              <div className="space-y-3 pl-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    These help us provide better AI recommendations and networking matches
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-[#0077b5] flex-shrink-0" />
                  <Input
                    placeholder="linkedin.com/in/yourprofile"
                    value={formData.linkedInUrl}
                    onChange={(e) => handleChange("linkedInUrl", e.target.value)}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 flex-shrink-0" />
                  <Input
                    placeholder="GitHub username"
                    value={formData.githubUsername}
                    onChange={(e) => handleChange("githubUsername", e.target.value)}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-[#1da1f2] flex-shrink-0" />
                  <Input
                    placeholder="@username"
                    value={formData.twitterHandle}
                    onChange={(e) => handleChange("twitterHandle", e.target.value)}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-[#1877f2] flex-shrink-0" />
                  <Input
                    placeholder="facebook.com/yourprofile"
                    value={formData.facebookProfileUrl}
                    onChange={(e) => handleChange("facebookProfileUrl", e.target.value)}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-[#e4405f] flex-shrink-0" />
                  <Input
                    placeholder="@username"
                    value={formData.instagramHandle}
                    onChange={(e) => handleChange("instagramHandle", e.target.value)}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-[#ff0000] flex-shrink-0" />
                  <Input
                    placeholder="youtube.com/@yourchannel"
                    value={formData.youtubeChannelUrl}
                    onChange={(e) => handleChange("youtubeChannelUrl", e.target.value)}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <Input
                    placeholder="Your website URL"
                    value={formData.personalWebsite}
                    onChange={(e) => handleChange("personalWebsite", e.target.value)}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Why we collect this</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Match you with attendees who share your interests and goals</li>
              <li>Auto-assign you to relevant breakout room discussions</li>
              <li>Provide personalized AI-powered networking recommendations</li>
              <li>Help you discover valuable connections at every event</li>
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
