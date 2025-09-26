// src/app/(platform)/dashboard/events/_components/edit-event-modal.tsx
"use client";

import React, { useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  GET_EVENT_BY_ID_QUERY,
  UPDATE_EVENT_MUTATION,
} from "@/graphql/events.graphql";
import { GET_ORGANIZATION_VENUES_QUERY } from "@/graphql/venues.graphql";
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
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { GET_EVENTS_BY_ORGANIZATION_QUERY } from "@/graphql/queries";

interface EventData {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  venueId?: string | null;
  imageUrl?: string | null;
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
}

const formSchema = z
  .object({
    name: z.string().min(3, "Event name must be at least 3 characters long."),
    description: z.string().optional(),
    startDate: z.date({ required_error: "A start date is required." }),
    endDate: z.date({ required_error: "An end date is required." }),
    // --- VENUE ID IS NOW CORRECTLY INCLUDED ---
    venueId: z.string().optional(),
    // --- IMAGE URL IS NOW CORRECTLY INCLUDED ---
    imageUrl: z
      .string()
      .url({ message: "Please enter a valid URL." })
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before the start date.",
    path: ["endDate"],
  });

type EventFormValues = z.infer<typeof formSchema>;
type Venue = { id: string; name: string };

export const EditEventModal = ({
  isOpen,
  onClose,
  event,
}: EditEventModalProps) => {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
  });

  const { data: venuesData, loading: venuesLoading } = useQuery(
    GET_ORGANIZATION_VENUES_QUERY
  );
  const venues = venuesData?.organizationVenues || [];

  useEffect(() => {
    if (event) {
      form.reset({
        name: event.name,
        description: event.description || "",
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        venueId: event.venueId || undefined,
        imageUrl: event.imageUrl || "",
      });
    }
  }, [event, form]);

  const [updateEvent, { loading }] = useMutation(UPDATE_EVENT_MUTATION, {
    refetchQueries: [
      { query: GET_EVENT_BY_ID_QUERY, variables: { id: event.id } },
      { query: GET_EVENTS_BY_ORGANIZATION_QUERY, variables: { status: null } },
    ],
    onCompleted: () => {
      toast.success("Event updated successfully!");
      onClose();
    },
    onError: (error) =>
      toast.error("Failed to update event", { description: error.message }),
  });

  const onSubmit = (values: EventFormValues) => {
    updateEvent({
      variables: {
        id: event.id,
        eventIn: {
          name: values.name,
          description: values.description,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
          venueId: values.venueId,
          imageUrl: values.imageUrl,
        },
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the details for "{event.name}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="venueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={venuesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a venue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {venues.map((venue: Venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
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
