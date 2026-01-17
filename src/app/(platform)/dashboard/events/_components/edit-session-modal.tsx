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
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpeakerMultiSelect } from "@/components/ui/speaker-multi-select";
import { Loader, MessageSquare, HelpCircle, BarChart3, Video, Users, Presentation, Coffee, Store, DoorOpen } from "lucide-react";

// Session type options for virtual session support
const SESSION_TYPES = [
  { value: "MAINSTAGE", label: "Mainstage", icon: Presentation, description: "Main keynote/general session" },
  { value: "BREAKOUT", label: "Breakout", icon: Users, description: "Smaller focused session" },
  { value: "WORKSHOP", label: "Workshop", icon: Users, description: "Hands-on interactive session" },
  { value: "NETWORKING", label: "Networking", icon: Coffee, description: "Networking/social session" },
  { value: "EXPO", label: "Expo", icon: Store, description: "Exhibition/booth session" },
] as const;

type SessionType = "MAINSTAGE" | "BREAKOUT" | "WORKSHOP" | "NETWORKING" | "EXPO";

type SessionData = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  chatEnabled?: boolean;
  qaEnabled?: boolean;
  pollsEnabled?: boolean;
  speakers: { id: string }[];
  // Virtual Session fields
  sessionType?: SessionType;
  streamingUrl?: string | null;
  isRecordable?: boolean;
  broadcastOnly?: boolean;
  maxParticipants?: number | null;
  // Green Room fields
  greenRoomEnabled?: boolean;
  greenRoomOpensMinutesBefore?: number;
  greenRoomNotes?: string | null;
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
    sessionDate: z.date({ message: "Please select a date." }),
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please use HH:MM format."),
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please use HH:MM format."),
    speakerIds: z.array(z.string()).optional(),
    chatEnabled: z.boolean(),
    qaEnabled: z.boolean(),
    pollsEnabled: z.boolean(),
    // Virtual Session Support (required fields - defaults provided in useForm)
    sessionType: z.enum(["MAINSTAGE", "BREAKOUT", "WORKSHOP", "NETWORKING", "EXPO"]),
    streamingUrl: z
      .string()
      .url("Please enter a valid streaming URL.")
      .optional()
      .or(z.literal("")),
    isRecordable: z.boolean(),
    broadcastOnly: z.boolean(),
    maxParticipants: z.number().min(1).max(10000).optional(),
    // Green Room settings
    greenRoomEnabled: z.boolean(),
    greenRoomOpensMinutesBefore: z.number().min(5).max(60),
    greenRoomNotes: z.string().max(1000).optional().or(z.literal("")),
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
        chatEnabled: session.chatEnabled !== false,
        qaEnabled: session.qaEnabled !== false,
        pollsEnabled: session.pollsEnabled !== false,
        // Virtual Session fields
        sessionType: session.sessionType || "MAINSTAGE",
        streamingUrl: session.streamingUrl || "",
        isRecordable: session.isRecordable !== false,
        broadcastOnly: session.broadcastOnly !== false,
        maxParticipants: session.maxParticipants || undefined,
        // Green Room fields
        greenRoomEnabled: session.greenRoomEnabled !== false,
        greenRoomOpensMinutesBefore: session.greenRoomOpensMinutesBefore || 15,
        greenRoomNotes: session.greenRoomNotes || "",
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
          // Virtual Session fields
          sessionType: values.sessionType,
          streamingUrl: values.streamingUrl || null,
          isRecordable: values.isRecordable,
          broadcastOnly: values.broadcastOnly,
          maxParticipants: values.maxParticipants || null,
          // Green Room fields
          greenRoomEnabled: values.greenRoomEnabled,
          greenRoomOpensMinutesBefore: values.greenRoomOpensMinutesBefore,
          greenRoomNotes: values.greenRoomNotes || null,
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

            {/* Green Room Settings */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                Green Room Settings
              </p>

              <FormField
                control={form.control}
                name="greenRoomEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="font-normal cursor-pointer">Enable Green Room</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Backstage area for speakers to prepare before going live
                      </p>
                    </div>
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

              {form.watch("greenRoomEnabled") && (
                <>
                  <FormField
                    control={form.control}
                    name="greenRoomOpensMinutesBefore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opens Before Session (minutes)</FormLabel>
                        <Select
                          onValueChange={(val) => field.onChange(parseInt(val))}
                          value={field.value?.toString()}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="10">10 minutes</SelectItem>
                            <SelectItem value="15">15 minutes (default)</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="greenRoomNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Producer Notes for Speakers</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instructions for speakers (e.g., 'Please join 10 mins early for sound check. Have your slides ready.')"
                            className="resize-none"
                            rows={3}
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          These notes will be visible to speakers in the Green Room
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};