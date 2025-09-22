"use client";

import React from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CREATE_SESSION_MUTATION,
  GET_SESSIONS_BY_EVENT_QUERY,
} from "@/graphql/events.graphql";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Loader } from "lucide-react";

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventStartDate: string;
  eventEndDate: string;
}

// Define the shape of a Session for cache updates
type Session = {
  id: string;
  __typename?: "SessionType";
  [key: string]: any;
};

// Define the shape of the query data in the cache
type SessionsQueryData = {
  sessionsByEvent: Session[];
};

// --- CORRECTED ZOD SCHEMA ---
const formSchema = z
  .object({
    title: z
      .string()
      .min(3, "Session title must be at least 3 characters long."),
    // Use z.date() directly as our component provides a Date object
    sessionDate: z.date({
      required_error: "A date is required.",
    }),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please use a valid HH:MM format."
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please use a valid HH:MM format."
      ),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after the start time.",
    path: ["endTime"],
  });

// Infer the type from the schema
type SessionFormValues = z.infer<typeof formSchema>;

export const AddSessionModal = ({
  isOpen,
  onClose,
  eventId,
  eventStartDate,
  eventEndDate,
}: AddSessionModalProps) => {
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(formSchema),
    // Set default values directly, including the initial date
    defaultValues: {
      title: "",
      sessionDate: new Date(eventStartDate), // Pre-fill with event start date
      startTime: "09:00",
      endTime: "10:00",
    },
  });

  const [createSession, { loading }] = useMutation(CREATE_SESSION_MUTATION, {
    onCompleted: () => {
      toast.success("Session added successfully!");
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to add session", { description: error.message });
    },
    update(cache, { data: { createSession } }) {
      const queryOptions = {
        query: GET_SESSIONS_BY_EVENT_QUERY,
        variables: { eventId },
      };

      const data = cache.readQuery<SessionsQueryData>(queryOptions);
      if (!data) return;

      cache.writeQuery<SessionsQueryData>({
        ...queryOptions,
        data: {
          sessionsByEvent: [...data.sessionsByEvent, createSession],
        },
      });
    },
  });

  const onSubmit = (values: SessionFormValues) => {
    createSession({
      variables: {
        sessionIn: {
          eventId: eventId,
          title: values.title,
          sessionDate: format(values.sessionDate, "yyyy-MM-dd"),
          startTime: values.startTime,
          endTime: values.endTime,
        },
      },
    });
  };

  const fromDate = new Date(eventStartDate);
  const toDate = new Date(eventEndDate);
  fromDate.setHours(0, 0, 0, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Session</DialogTitle>
          <DialogDescription>
            The session date must be within the event's date range.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Keynote Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sessionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Session Date</FormLabel>
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    fromDate={fromDate}
                    toDate={toDate}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
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
                Add Session
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
