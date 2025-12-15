//src/app/(public)/events/[eventId]/_components/registration-modal.tsx
"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CREATE_REGISTRATION_MUTATION } from "@/graphql/public.graphql";
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
import { Loader, PartyPopper, ExternalLink, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

const guestFormSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email address."),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

export const RegistrationModal = ({
  isOpen,
  onClose,
  eventId,
}: RegistrationModalProps) => {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState("");

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: { first_name: "", last_name: "", email: "" },
  });

  const [createRegistration, { loading }] = useMutation(
    CREATE_REGISTRATION_MUTATION,
    {
      onCompleted: (data) => {
        setTicketCode(data.createRegistration.ticketCode);
        setIsSuccess(true);
      },
      onError: (error) => {
        toast.error("Registration Failed", { description: error.message });
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
      form.reset();
    }, 300);
  };

  const handleGoToEvent = () => {
    handleClose();
    router.push(`/attendee/events/${eventId}`);
  };

  const renderContent = () => {
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
