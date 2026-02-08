// src/app/(public)/contact/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Calendar,
  Clock,
  Mail,
  Building2,
  CheckCircle2,
  Send,
  Sparkles,
  Users,
  Globe,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const SOLUTION_OPTIONS: Record<string, string> = {
  "virtual-events": "Virtual Events",
  "hybrid-events": "Hybrid Events",
  "in-person-events": "In-Person Events",
  analytics: "Analytics & Insights",
  engagement: "Engagement Tools",
  sponsors: "Sponsor Management",
  matchmaking: "AI Matchmaking",
  gamification: "Gamification",
};

const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const demoFormSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(1, "Company name is required").max(200),
  job_title: z.string().max(200).optional().or(z.literal("")),
  company_size: z.string().min(1, "Please select a company size"),
  solution_interest: z.string().optional().or(z.literal("")),
  preferred_date: z.string().optional().or(z.literal("")),
  preferred_time: z.string().optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
});

type DemoFormValues = z.infer<typeof demoFormSchema>;

function BookDemoForm() {
  const searchParams = useSearchParams();
  const demoParam = searchParams.get("demo") || "";
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferredDate, setPreferredDate] = useState<Date | undefined>();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      company: "",
      job_title: "",
      company_size: "",
      solution_interest: demoParam || "",
      preferred_date: "",
      preferred_time: "",
      message: "",
    },
  });

  const onSubmit = async (data: DemoFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/demo-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Failed to submit demo request"
        );
      }

      setIsSubmitted(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setPreferredDate(date);
    setValue(
      "preferred_date",
      date ? date.toISOString().split("T")[0] : ""
    );
  };

  const solutionLabel = SOLUTION_OPTIONS[demoParam] || null;

  // Success State
  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-12 pb-12 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Demo Request Submitted!</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Thank you for your interest in Event Dynamics. Our team will
              reach out within 24 hours to schedule your personalized demo.
            </p>
            <div className="pt-4">
              <Button variant="outline" asChild>
                <a href="/">Back to Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 lg:py-20">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          Book a Demo
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See how Event Dynamics can transform your events.
          {solutionLabel
            ? ` Get a personalized walkthrough of our ${solutionLabel} capabilities.`
            : " Get a personalized walkthrough tailored to your needs."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form Column */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Request a Demo
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you
                  within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        placeholder="John"
                        {...register("first_name")}
                      />
                      {errors.first_name && (
                        <p className="text-sm text-red-500">
                          {errors.first_name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        placeholder="Doe"
                        {...register("last_name")}
                      />
                      {errors.last_name && (
                        <p className="text-sm text-red-500">
                          {errors.last_name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Work Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Company & Job Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">
                        Company <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company"
                        placeholder="Acme Inc."
                        {...register("company")}
                      />
                      {errors.company && (
                        <p className="text-sm text-red-500">
                          {errors.company.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        placeholder="Event Manager"
                        {...register("job_title")}
                      />
                    </div>
                  </div>

                  {/* Company Size & Solution Interest */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Company Size <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        onValueChange={(val) =>
                          setValue("company_size", val, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size} employees
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.company_size && (
                        <p className="text-sm text-red-500">
                          {errors.company_size.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Solution Interest</Label>
                      <Select
                        defaultValue={demoParam || undefined}
                        onValueChange={(val) =>
                          setValue("solution_interest", val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a solution" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SOLUTION_OPTIONS).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Preferred Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred Date</Label>
                      <DatePicker
                        date={preferredDate}
                        setDate={handleDateChange}
                        fromDate={
                          new Date(Date.now() + 24 * 60 * 60 * 1000)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Time</Label>
                      <Select
                        onValueChange={(val) =>
                          setValue("preferred_time", val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your event needs, team size, or any specific features you'd like to explore..."
                      rows={4}
                      {...register("message")}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Request Demo
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* What to expect */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">30-Minute Demo</p>
                    <p className="text-sm text-muted-foreground">
                      A personalized walkthrough tailored to your event
                      goals
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Live Q&A</p>
                    <p className="text-sm text-muted-foreground">
                      Ask questions and get real-time answers from our
                      product experts
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Custom Pricing</p>
                    <p className="text-sm text-muted-foreground">
                      Get a pricing plan that fits your organization and
                      event scale
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Highlights */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">AI-Powered Engagement</p>
                    <p className="text-sm text-muted-foreground">
                      Real-time insights and automated interventions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">All Event Types</p>
                    <p className="text-sm text-muted-foreground">
                      Virtual, hybrid, and in-person events
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Enterprise Ready</p>
                    <p className="text-sm text-muted-foreground">
                      Built for scale with robust security
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Prefer to reach out directly? Email us at{" "}
                  <a
                    href="mailto:demos@eventdynamics.io"
                    className="text-primary hover:underline font-medium"
                  >
                    demos@eventdynamics.io
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BookDemoForm />
    </Suspense>
  );
}
