// src/app/(platform)/venues/_components/edit-venue-modal.tsx
"use client";

import React, { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UPDATE_VENUE_MUTATION } from "@/graphql/venues.graphql";
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
import { Loader } from "lucide-react";

type Venue = {
  id: string;
  name: string;
  address?: string | null;
};

interface EditVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: Venue;
}

const formSchema = z.object({
  name: z.string().min(2, "Venue name must be at least 2 characters."),
  address: z.string().optional(),
});

type VenueFormValues = z.infer<typeof formSchema>;

export const EditVenueModal = ({
  isOpen,
  onClose,
  venue,
}: EditVenueModalProps) => {
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (venue) {
      form.reset({
        name: venue.name,
        address: venue.address || "",
      });
    }
  }, [venue, form]);

  const [updateVenue, { loading }] = useMutation(UPDATE_VENUE_MUTATION, {
    onCompleted: () => {
      toast.success("Venue updated successfully!");
      onClose();
    },
    onError: (error) =>
      toast.error("Failed to update venue", { description: error.message }),
  });

  const onSubmit = (values: VenueFormValues) => {
    updateVenue({
      variables: {
        id: venue.id,
        venueIn: {
          name: values.name,
          address: values.address,
        },
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Venue</DialogTitle>
          <DialogDescription>Make changes to {venue.name}.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
