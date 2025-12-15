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
import { Switch } from "@/components/ui/switch";
import { SpeakerMultiSelect } from "@/components/ui/speaker-multi-select";
import { Loader, MessageSquare, HelpCircle, BarChart3 } from "lucide-react";

type SessionData = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  chatEnabled?: boolean;
  qaEnabled?: boolean;
  pollsEnabled?: boolean;
  speakers: { id: string }[];
};

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionData;
  eventId: string;
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
    chatEnabled: z.boolean().default(true),
    qaEnabled: z.boolean().default(true),
    pollsEnabled: z.boolean().default(true),
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
  eventId,
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
        chatEnabled: session.chatEnabled !== false, // Default to true
        qaEnabled: session.qaEnabled !== false, // Default to true
        pollsEnabled: session.pollsEnabled !== false, // Default to true
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
        variables: { eventId },
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
          chatEnabled: values.chatEnabled,
          qaEnabled: values.qaEnabled,
          pollsEnabled: values.pollsEnabled,
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};