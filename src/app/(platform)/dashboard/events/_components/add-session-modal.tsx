//src/app/(platform)/events/_components/add-session-modal.tsx
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
import { Switch } from "@/components/ui/switch";
import { Loader, MessageSquare, HelpCircle, BarChart3 } from "lucide-react";
import { SpeakerMultiSelect } from "@/components/ui/speaker-multi-select";

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
    title: z.string().min(3, "Session title must be at least 3 characters."),
    sessionDate: z.date({
      message: "Please select a date for the session.",
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
    speakerIds: z.array(z.string()).optional(),
    chatEnabled: z.boolean().default(true),
    qaEnabled: z.boolean().default(true),
    pollsEnabled: z.boolean().default(true),
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
    defaultValues: {
      title: "",
      sessionDate: new Date(eventStartDate),
      startTime: "09:00",
      endTime: "10:00",
      speakerIds: [],
      chatEnabled: true,
      qaEnabled: true,
      pollsEnabled: true,
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
          speakerIds: values.speakerIds,
          chatEnabled: values.chatEnabled,
          qaEnabled: values.qaEnabled,
          pollsEnabled: values.pollsEnabled,
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
            <FormField
              control={form.control}
              name="speakerIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Speakers (Optional)</FormLabel>
                  <SpeakerMultiSelect
                    selectedSpeakerIds={field.value || []}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interactive Features */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">Interactive Features</p>
              <FormField
                control={form.control}
                name="chatEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <FormLabel className="font-normal cursor-pointer">Enable Chat</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qaEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <FormLabel className="font-normal cursor-pointer">Enable Q&A</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pollsEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <FormLabel className="font-normal cursor-pointer">Enable Polls</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
