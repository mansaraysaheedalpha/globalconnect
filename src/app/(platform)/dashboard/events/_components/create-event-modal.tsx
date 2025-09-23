// src/app/(platform)/events/_components/create-event-modal.tsx
"use client";

import React from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { CREATE_EVENT_MUTATION } from "@/graphql/events.graphql";
import { GET_EVENTS_BY_ORGANIZATION_QUERY } from "@/graphql/queries";

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
import { Loader } from "lucide-react";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z
  .object({
    name: z.string().min(3, "Event name must be at least 3 characters long."),
    description: z.string().optional(),
    startDate: z.date({ required_error: "A start date is required." }),
    endDate: z.date({ required_error: "An end date is required." }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before the start date.",
    path: ["endDate"],
  });

type EventFormValues = z.infer<typeof formSchema>;

export const CreateEventModal = ({
  isOpen,
  onClose,
}: CreateEventModalProps) => {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const [createEvent, { loading, error }] = useMutation(CREATE_EVENT_MUTATION, {
    // Refetch the list of events after a new one is created to update the UI
    refetchQueries: [
      {
        query: GET_EVENTS_BY_ORGANIZATION_QUERY,
        variables: {
          limit: 10,
          offset: 0,
          sortBy: "startDate",
          sortDirection: "desc",
        },
      },
    ],
    onCompleted: () => {
      toast.success("Event created successfully!");
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create event", {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: EventFormValues) => {
    createEvent({
      variables: {
        eventIn: {
          name: values.name,
          description: values.description,
          // Format dates to ISO 8601 string format for the backend
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        },
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new event for your
            organization.
          </DialogDescription>
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
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Annual Tech Conference"
                      {...field}
                    />
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
                    <Textarea
                      placeholder="Tell us a little bit about this event"
                      className="resize-none"
                      {...field}
                    />
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
                Create Event
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
