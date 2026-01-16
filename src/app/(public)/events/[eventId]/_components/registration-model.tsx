//src/app/(public)/events/[eventId]/_components/registration-modal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  CREATE_REGISTRATION_MUTATION,
  CHECK_EXISTING_REGISTRATION_QUERY,
} from "@/graphql/public.graphql";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Loader2 as Loader,
  PartyPopper,
  ExternalLink,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Linkedin,
  Github,
  Twitter,
  Globe,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

interface ExistingRegistration {
  id: string;
  status: string;
  ticketCode: string;
  checkedInAt: string | null;
}

// Networking goals for AI matching
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

// Common interests for quick selection
const SUGGESTED_INTERESTS = [
  "AI/ML", "Web Development", "Mobile Apps", "Cloud", "DevOps",
  "Startups", "Product Management", "Design", "Data Science", "Blockchain",
  "Cybersecurity", "Marketing", "Sales", "Finance", "Leadership",
];

const guestFormSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email address."),
});

const profileFormSchema = z.object({
  goals: z.array(z.string()).min(1, "Please select at least one goal"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  customInterest: z.string().optional(),
  linkedInUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  githubUsername: z.string().optional(),
  twitterHandle: z.string().optional(),
  personalWebsite: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  eventExpectations: z.string().max(500).optional(),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;
type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Helper to detect duplicate registration errors
const isDuplicateRegistrationError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return (
    message.includes("already registered") ||
    message.includes("duplicate") ||
    message.includes("conflict") ||
    message.includes("409")
  );
};

export const RegistrationModal = ({
  isOpen,
  onClose,
  eventId,
}: RegistrationModalProps) => {
  const router = useRouter();
  const { user, token } = useAuthStore();

  // Registration state
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [existingRegistration, setExistingRegistration] = useState<ExistingRegistration | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  // Multi-step state
  const [step, setStep] = useState<"register" | "profile" | "complete">("register");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const guestForm = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: { first_name: "", last_name: "", email: "" },
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      goals: [],
      interests: [],
      customInterest: "",
      linkedInUrl: "",
      githubUsername: "",
      twitterHandle: "",
      personalWebsite: "",
      eventExpectations: "",
    },
  });

  const selectedGoals = profileForm.watch("goals");
  const selectedInterests = profileForm.watch("interests");

  // Query to check if user is already registered
  const [checkExistingRegistration, { loading: checkingRegistration }] =
    useLazyQuery(CHECK_EXISTING_REGISTRATION_QUERY, {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        if (data?.myRegistrationForEvent) {
          setExistingRegistration(data.myRegistrationForEvent);
          setIsAlreadyRegistered(true);
        }
      },
    });

  // Check for existing registration when modal opens
  useEffect(() => {
    if (isOpen && token && user) {
      checkExistingRegistration({
        variables: { eventId },
        context: { headers: { authorization: `Bearer ${token}` } },
      });
    }
  }, [isOpen, token, user, eventId, checkExistingRegistration]);

  const [createRegistration, { loading }] = useMutation(
    CREATE_REGISTRATION_MUTATION,
    {
      onCompleted: (data) => {
        setTicketCode(data.createRegistration.ticketCode);
        setIsSuccess(true);
        // Move to profile step for authenticated users
        if (token && user) {
          setStep("profile");
        }
      },
      onError: (error) => {
        if (isDuplicateRegistrationError(error)) {
          toast.error("Already Registered", {
            description: "You or this email is already registered for this event.",
            icon: <AlertCircle className="h-4 w-4" />,
          });
          if (token && user) {
            checkExistingRegistration({
              variables: { eventId },
              context: { headers: { authorization: `Bearer ${token}` } },
            });
          }
        } else {
          toast.error("Registration Failed", { description: error.message });
        }
      },
    }
  );

  const handleGuestSubmit = (values: GuestFormValues) => {
    createRegistration({
      variables: {
        eventId,
        registrationIn: {
          firstName: values.first_name,
          lastName: values.last_name,
          email: values.email,
        },
      },
    });
  };

  const handleAuthenticatedSubmit = () => {
    createRegistration({
      variables: { eventId, registrationIn: {} },
      context: { headers: { authorization: token ? `Bearer ${token}` : "" } },
    });
  };

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    if (!token) {
      setStep("complete");
      return;
    }

    setIsSavingProfile(true);
    try {
      const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";
      // Remove /events suffix for profile endpoint
      const baseUrl = realtimeUrl.replace(/\/events$/, "");

      const response = await fetch(`${baseUrl}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goals: values.goals,
          interests: values.interests,
          linkedInUrl: values.linkedInUrl || undefined,
          githubUsername: values.githubUsername || undefined,
          twitterHandle: values.twitterHandle?.replace("@", "") || undefined,
          personalWebsite: values.personalWebsite || undefined,
          eventExpectations: values.eventExpectations || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      toast.success("Profile saved!", {
        description: "You'll get better networking recommendations now.",
      });
      setStep("complete");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Couldn't save profile", {
        description: "You can update it later in your settings.",
      });
      setStep("complete");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSkipProfile = () => {
    setStep("complete");
  };

  const toggleGoal = (goal: string) => {
    const current = profileForm.getValues("goals");
    if (current.includes(goal)) {
      profileForm.setValue("goals", current.filter((g) => g !== goal));
    } else if (current.length < 3) {
      profileForm.setValue("goals", [...current, goal]);
    }
  };

  const toggleInterest = (interest: string) => {
    const current = profileForm.getValues("interests");
    if (current.includes(interest)) {
      profileForm.setValue("interests", current.filter((i) => i !== interest));
    } else if (current.length < 5) {
      profileForm.setValue("interests", [...current, interest]);
    }
  };

  const addCustomInterest = () => {
    const custom = profileForm.getValues("customInterest")?.trim();
    if (custom && !selectedInterests.includes(custom) && selectedInterests.length < 5) {
      profileForm.setValue("interests", [...selectedInterests, custom]);
      profileForm.setValue("customInterest", "");
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setTicketCode("");
      setExistingRegistration(null);
      setIsAlreadyRegistered(false);
      setStep("register");
      guestForm.reset();
      profileForm.reset();
    }, 300);
  };

  const handleGoToEvent = () => {
    handleClose();
    router.push(`/attendee/events/${eventId}`);
  };

  // Render registration step
  const renderRegistrationStep = () => {
    if (checkingRegistration) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">Checking registration status...</p>
        </div>
      );
    }

    if (isAlreadyRegistered && existingRegistration) {
      return (
        <div className="text-center py-8">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-bold mt-4">Already Registered!</h2>
          <p className="text-muted-foreground mt-2">You're already registered for this event.</p>
          <p className="text-2xl font-mono bg-secondary rounded-md p-2 mt-2 inline-block">
            {existingRegistration.ticketCode}
          </p>
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleClose}>Close</Button>
            <Button onClick={handleGoToEvent} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Go to My Event
            </Button>
          </DialogFooter>
        </div>
      );
    }

    if (token && user) {
      return (
        <div className="py-4">
          <DialogDescription>
            You are registering as <strong>{user.first_name} {user.last_name}</strong> ({user.email}).
          </DialogDescription>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAuthenticatedSubmit} disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Registration
            </Button>
          </DialogFooter>
        </div>
      );
    }

    return (
      <Form {...guestForm}>
        <form onSubmit={guestForm.handleSubmit(handleGuestSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={guestForm.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={guestForm.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={guestForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  // Render profile step
  const renderProfileStep = () => {
    return (
      <div className="py-2">
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Help us find your perfect connections! This info powers our AI recommendations.
          </p>
        </div>

        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-5">
            {/* Goals Section */}
            <div>
              <FormLabel className="text-base font-semibold">What brings you here? (Select up to 3)</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {NETWORKING_GOALS.map((goal) => (
                  <Badge
                    key={goal.value}
                    variant={selectedGoals.includes(goal.value) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer py-1.5 px-3 text-sm transition-all",
                      selectedGoals.includes(goal.value)
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
              {profileForm.formState.errors.goals && (
                <p className="text-sm text-destructive mt-1">
                  {profileForm.formState.errors.goals.message}
                </p>
              )}
            </div>

            {/* Interests Section */}
            <div>
              <FormLabel className="text-base font-semibold">Your interests (Select up to 5)</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {SUGGESTED_INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer py-1 px-2.5 text-sm transition-all",
                      selectedInterests.includes(interest)
                        ? "bg-primary hover:bg-primary/90"
                        : "hover:bg-muted"
                    )}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add custom interest..."
                  {...profileForm.register("customInterest")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomInterest();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomInterest}>
                  Add
                </Button>
              </div>
              {profileForm.formState.errors.interests && (
                <p className="text-sm text-destructive mt-1">
                  {profileForm.formState.errors.interests.message}
                </p>
              )}
            </div>

            {/* Social Links Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FormLabel className="text-base font-semibold mb-0">Social profiles (Optional)</FormLabel>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Recommended</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                We use these to find more about you and provide better matches. Your privacy is respected.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-[#0077b5] flex-shrink-0" />
                  <Input
                    placeholder="linkedin.com/in/yourprofile"
                    {...profileForm.register("linkedInUrl")}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 flex-shrink-0" />
                  <Input
                    placeholder="GitHub username"
                    {...profileForm.register("githubUsername")}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-[#1da1f2] flex-shrink-0" />
                  <Input
                    placeholder="@username"
                    {...profileForm.register("twitterHandle")}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <Input
                    placeholder="Your website URL"
                    {...profileForm.register("personalWebsite")}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Alternative: Event Expectations */}
            <div>
              <FormLabel className="text-base font-semibold">
                Don't have social profiles? Tell us about yourself
              </FormLabel>
              <Textarea
                placeholder="What are you hoping to learn or achieve at this event? Who would you like to meet? (This helps us match you with the right people)"
                {...profileForm.register("eventExpectations")}
                className="mt-2 min-h-[80px]"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={handleSkipProfile}>
                Skip for now
              </Button>
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Save & Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    );
  };

  // Render complete step
  const renderCompleteStep = () => {
    const isGuestRegistration = !token && !user;

    return (
      <div className="text-center py-8">
        <PartyPopper className="h-16 w-16 mx-auto text-green-500" />
        <h2 className="text-2xl font-bold mt-4">You're All Set!</h2>
        <p className="text-muted-foreground mt-2">Your ticket code is:</p>
        <p className="text-2xl font-mono bg-secondary rounded-md p-2 mt-2 inline-block">
          {ticketCode}
        </p>
        <p className="mt-4 text-sm">A confirmation has been sent to your email.</p>

        {isGuestRegistration && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Want to manage all your events in one place?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a free account to track your registrations, get reminders, and more.
            </p>
            <Link href="/auth/register">
              <Button variant="secondary" className="mt-3 gap-2">
                <UserPlus className="h-4 w-4" />
                Create Free Account
              </Button>
            </Link>
          </div>
        )}

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose}>Close</Button>
          {token && user && (
            <Button onClick={handleGoToEvent} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Go to My Event
            </Button>
          )}
        </DialogFooter>
      </div>
    );
  };

  const renderContent = () => {
    if (step === "profile") return renderProfileStep();
    if (step === "complete" || (isSuccess && !token)) return renderCompleteStep();
    return renderRegistrationStep();
  };

  const getDialogTitle = () => {
    if (step === "profile") return "Help Us Match You Better";
    if (step === "complete") return "Registration Complete";
    return "Register for the Event";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-w-lg",
        step === "profile" && "max-w-xl max-h-[90vh] overflow-y-auto"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "profile" && <Users className="h-5 w-5" />}
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
