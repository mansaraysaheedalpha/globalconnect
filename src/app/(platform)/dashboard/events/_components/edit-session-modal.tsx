//src / app / platform / events / _components / edit - session - modal.tsx;
"use client";

import React, { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  UPDATE_SESSION_MUTATION,
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
import { SpeakerMultiSelect } from "@/components/ui/speaker-multi-select";
import { Loader } from "lucide-react";

type SessionData = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  speakers: { id: string }[];
};

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionData;
  eventStartDate: string;
  eventEndDate: string;
}

const formSchema = z
  .object({
    title: z.string().min(3, "Session title must be at least 3 characters."),
    sessionDate: z.date({ required_error: "Please select a date." }),
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please use HH:MM format."),
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please use HH:MM format."),
    speakerIds: z.array(z.string()).optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

type SessionFormValues = z.infer<typeof formSchema>;

export const EditSessionModal = ({
  isOpen,
  onClose,
  session,
  eventStartDate,
  eventEndDate,
}: EditSessionModalProps) => {
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (session) {
      form.reset({
        title: session.title,
        sessionDate: parseISO(session.startTime),
        startTime: format(parseISO(session.startTime), "HH:mm"),
        endTime: format(parseISO(session.endTime), "HH:mm"),
        speakerIds: session.speakers.map((s) => s.id),
      });
    }
  }, [session, form]);

  const [updateSession, { loading }] = useMutation(UPDATE_SESSION_MUTATION, {
    onCompleted: () => {
      toast.success("Session updated successfully!");
      onClose();
    },
    onError: (error) =>
      toast.error("Failed to update session", { description: error.message }),
    refetchQueries: [
      {
        query: GET_SESSIONS_BY_EVENT_QUERY,
        variables: { eventId: session?.id ? session.id.split("_")[0] : "" },
      },
    ],
  });

  const onSubmit = (values: SessionFormValues) => {
    const combinedStartTime = new Date(values.sessionDate);
    const [startHours, startMinutes] = values.startTime.split(":").map(Number);
    combinedStartTime.setHours(startHours, startMinutes);

    const combinedEndTime = new Date(values.sessionDate);
    const [endHours, endMinutes] = values.endTime.split(":").map(Number);
    combinedEndTime.setHours(endHours, endMinutes);

    updateSession({
      variables: {
        id: session.id,
        sessionIn: {
          title: values.title,
          startTime: combinedStartTime.toISOString(),
          endTime: combinedEndTime.toISOString(),
          speakerIds: values.speakerIds,
        },
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
          <DialogDescription>
            Make changes to "{session?.title}".
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
                    <Input {...field} />
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
                    fromDate={new Date(eventStartDate)}
                    toDate={new Date(eventEndDate)}
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
                  <FormLabel>Speakers</FormLabel>
                  <SpeakerMultiSelect
                    selectedSpeakerIds={field.value || []}
                    onChange={field.onChange}
                  />
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