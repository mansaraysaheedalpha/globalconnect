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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Loader,
  PartyPopper,
  ExternalLink,
  UserPlus,
  CheckCircle2,
  AlertCircle,
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

const guestFormSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email address."),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

// Helper to detect duplicate registration errors (HTTP 409 or GraphQL error)
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [existingRegistration, setExistingRegistration] =
    useState<ExistingRegistration | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: { first_name: "", last_name: "", email: "" },
  });

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

  // Check for existing registration when modal opens (for authenticated users)
  useEffect(() => {
    if (isOpen && token && user) {
      checkExistingRegistration({
        variables: { eventId },
        context: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      });
    }
  }, [isOpen, token, user, eventId, checkExistingRegistration]);

  const [createRegistration, { loading }] = useMutation(
    CREATE_REGISTRATION_MUTATION,
    {
      onCompleted: (data) => {
        setTicketCode(data.createRegistration.ticketCode);
        setIsSuccess(true);
      },
      onError: (error) => {
        // Handle duplicate registration error (HTTP 409)
        if (isDuplicateRegistrationError(error)) {
          toast.error("Already Registered", {
            description:
              "You or this email is already registered for this event.",
            icon: <AlertCircle className="h-4 w-4" />,
          });
          // For authenticated users, try to fetch their existing registration
          if (token && user) {
            checkExistingRegistration({
              variables: { eventId },
              context: {
                headers: {
                  authorization: `Bearer ${token}`,
                },
              },
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
    console.log("[Registration] Token being used:", token ? "Present" : "Missing");
    createRegistration({
      variables: {
        eventId,
        registrationIn: {},
      },
      context: {
        headers: {
          authorization: token ? `Bearer ${token}` : "",
        },
      },
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setTicketCode("");
      setExistingRegistration(null);
      setIsAlreadyRegistered(false);
      form.reset();
    }, 300);
  };

  const handleGoToEvent = () => {
    handleClose();
    router.push(`/attendee/events/${eventId}`);
  };

  const renderContent = () => {
    // Loading state while checking existing registration
    if (checkingRegistration) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">
            Checking registration status...
          </p>
        </div>
      );
    }

    // Already registered state
    if (isAlreadyRegistered && existingRegistration) {
      return (
        <div className="text-center py-8">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-bold mt-4">Already Registered!</h2>
          <p className="text-muted-foreground mt-2">
            You're already registered for this event.
          </p>
          <p className="text-muted-foreground mt-1">Your ticket code is:</p>
          <p className="text-2xl font-mono bg-secondary rounded-md p-2 mt-2 inline-block">
            {existingRegistration.ticketCode}
          </p>
          <div className="mt-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                existingRegistration.status === "checked_in"
                  ? "bg-green-100 text-green-800"
                  : existingRegistration.status === "confirmed"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {existingRegistration.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
          {existingRegistration.checkedInAt && (
            <p className="text-sm text-muted-foreground mt-2">
              Checked in at{" "}
              {new Date(existingRegistration.checkedInAt).toLocaleString()}
            </p>
          )}
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleGoToEvent} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Go to My Event
            </Button>
          </DialogFooter>
        </div>
      );
    }

    if (isSuccess) {
      const isGuestRegistration = !token && !user;

      return (
        <div className="text-center py-8">
          <PartyPopper className="h-16 w-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-bold mt-4">You're Registered!</h2>
          <p className="text-muted-foreground mt-2">Your ticket code is:</p>
          <p className="text-2xl font-mono bg-secondary rounded-md p-2 mt-2 inline-block">
            {ticketCode}
          </p>
          <p className="mt-4 text-sm">
            A confirmation has been sent to your email.
          </p>

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
    }

    if (token && user) {
      return (
        <div className="py-4">
          <DialogDescription>
            You are registering as{" "}
            <strong>
              {user.first_name} {user.last_name}
            </strong>{" "}
            ({user.email}). Click below to confirm your spot.
          </DialogDescription>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleAuthenticatedSubmit} disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Registration
            </Button>
          </DialogFooter>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleGuestSubmit)}
          className="space-y-4 py-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register for the Event</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
