// src/components/features/expo/LeadCaptureForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { Loader2, CheckCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface LeadCaptureFormProps {
  boothName: string;
  onSubmit: (formData: LeadFormData) => Promise<boolean>;
  trigger?: React.ReactNode;
  className?: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  interests?: string;
  message?: string;
  marketingConsent: boolean;
}

export function LeadCaptureForm({
  boothName,
  onSubmit,
  trigger,
  className,
}: LeadCaptureFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    company: "",
    jobTitle: "",
    phone: "",
    interests: "",
    message: "",
    marketingConsent: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const success = await onSubmit(formData);
      if (success) {
        setIsSubmitted(true);
        // Reset form after a delay
        setTimeout(() => {
          setIsOpen(false);
          setIsSubmitted(false);
          setFormData({
            name: "",
            email: "",
            company: "",
            jobTitle: "",
            phone: "",
            interests: "",
            message: "",
            marketingConsent: false,
          });
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof LeadFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formContent = isSubmitted ? (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
      <p className="text-muted-foreground">
        Your information has been submitted. A representative from {boothName} will
        be in touch soon.
      </p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => updateField("company", e.target.value)}
            placeholder="Acme Inc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => updateField("jobTitle", e.target.value)}
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interests">What are you interested in?</Label>
        <Input
          id="interests"
          value={formData.interests}
          onChange={(e) => updateField("interests", e.target.value)}
          placeholder="e.g., Product demo, Pricing, Partnership"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => updateField("message", e.target.value)}
          placeholder="Any specific questions or comments?"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="marketingConsent"
          checked={formData.marketingConsent}
          onCheckedChange={(checked) =>
            updateField("marketingConsent", checked === true)
          }
        />
        <Label htmlFor="marketingConsent" className="text-sm text-muted-foreground">
          I agree to receive marketing communications from {boothName}
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit
          </>
        )}
      </Button>
    </form>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className={cn("sm:max-w-[500px]", className)}>
          <DialogHeader>
            <DialogTitle>Connect with {boothName}</DialogTitle>
            <DialogDescription>
              Share your information and a representative will reach out to you.
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Get in Touch</CardTitle>
        <CardDescription>
          Share your information and a representative from {boothName} will reach out
          to you.
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
