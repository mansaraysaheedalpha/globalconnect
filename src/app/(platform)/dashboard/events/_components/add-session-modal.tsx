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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, MessageSquare, HelpCircle, BarChart3, Video, Users, Presentation, Coffee, Store } from "lucide-react";
import { SpeakerMultiSelect } from "@/components/ui/speaker-multi-select";

// Session type options for virtual session support
const SESSION_TYPES = [
  { value: "MAINSTAGE", label: "Mainstage", icon: Presentation, description: "Main keynote/general session" },
  { value: "BREAKOUT", label: "Breakout", icon: Users, description: "Smaller focused session" },
  { value: "WORKSHOP", label: "Workshop", icon: Users, description: "Hands-on interactive session" },
  { value: "NETWORKING", label: "Networking", icon: Coffee, description: "Networking/social session" },
  { value: "EXPO", label: "Expo", icon: Store, description: "Exhibition/booth session" },
] as const;

type SessionType = "MAINSTAGE" | "BREAKOUT" | "WORKSHOP" | "NETWORKING" | "EXPO";

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
    chatEnabled: z.boolean(),
    qaEnabled: z.boolean(),
    pollsEnabled: z.boolean(),
    // Virtual Session Support
    sessionType: z.enum(["MAINSTAGE", "BREAKOUT", "WORKSHOP", "NETWORKING", "EXPO"]).default("MAINSTAGE"),
    streamingUrl: z
      .string()
      .url("Please enter a valid streaming URL.")
      .optional()
      .or(z.literal("")),
    isRecordable: z.boolean().default(true),
    broadcastOnly: z.boolean().default(true),
    maxParticipants: z.number().min(1).max(10000).optional(),
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
      sessionType: "MAINSTAGE",
      streamingUrl: "",
      isRecordable: true,
      broadcastOnly: true,
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
          // Virtual Session fields
          sessionType: values.sessionType,
          streamingUrl: values.streamingUrl || null,
          isRecordable: values.isRecordable,
          broadcastOnly: values.broadcastOnly,
          maxParticipants: values.maxParticipants || null,
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

            {/* Session Type Selector */}
            <FormField
              control={form.control}
              name="sessionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SESSION_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {SESSION_TYPES.find((t) => t.value === field.value)?.description}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Virtual Session Settings */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Video className="h-4 w-4" />
                Virtual Session Settings
              </p>

              <FormField
                control={form.control}
                name="streamingUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Streaming URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://stream.example.com/..."
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="isRecordable"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel className="font-normal cursor-pointer">Recordable</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="broadcastOnly"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel className="font-normal cursor-pointer">Broadcast Only</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
