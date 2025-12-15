// src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { RegistrationForm } from "@/components/features/Auth/RegistrationForm";
import { AttendeeRegistrationForm } from "@/components/features/Auth/AttendeeRegistrationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Building2, User, ArrowLeft } from "lucide-react";

type UserRole = "organizer" | "attendee" | null;

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  if (selectedRole === "organizer") {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedRole(null)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Organizer Account</h1>
          <p className="text-muted-foreground">
            Set up your organization and start creating events.
          </p>
        </div>
        <RegistrationForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </p>
      </>
    );
  }

  if (selectedRole === "attendee") {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedRole(null)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Attendee Account</h1>
          <p className="text-muted-foreground">
            Join events and connect with others.
          </p>
        </div>
        <AttendeeRegistrationForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </p>
      </>
    );
  }

  // Role selection screen
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Join GlobalConnect</h1>
        <p className="text-muted-foreground">
          How would you like to use GlobalConnect?
        </p>
      </div>

      <div className="space-y-4">
        <Card
          className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
          onClick={() => setSelectedRole("organizer")}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">I'm an Organizer</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and manage events, track registrations, and engage with
                  attendees.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
          onClick={() => setSelectedRole("attendee")}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">I'm an Attendee</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover events, register to attend, and participate in live
                  sessions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary hover:underline"
        >
          Sign In
        </Link>
      </p>
    </>
  );
}
