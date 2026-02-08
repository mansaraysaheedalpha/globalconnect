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
import { Loader, Video, Users, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { GET_EVENTS_BY_ORGANIZATION_QUERY } from "@/graphql/queries";

// Event type options for virtual event support
const EVENT_TYPES = [
  { value: "IN_PERSON", label: "In-Person", icon: Users, description: "Physical venue attendance" },
  { value: "VIRTUAL", label: "Virtual", icon: Video, description: "Online streaming only" },
  { value: "HYBRID", label: "Hybrid", icon: Globe, description: "Both in-person and virtual" },
] as const;

const STREAMING_PROVIDERS = [
  { value: "daily", label: "Daily.co (Interactive Video)" },
  { value: "youtube", label: "YouTube Live" },
  { value: "vimeo", label: "Vimeo" },
  { value: "mux", label: "Mux" },
  { value: "ivs", label: "Amazon IVS" },
  { value: "cloudflare", label: "Cloudflare Stream" },
  { value: "rtmp", label: "Custom RTMP" },
] as const;

type EventType = "IN_PERSON" | "VIRTUAL" | "HYBRID";

interface VirtualSettings {
  streamingProvider?: string | null;
  streamingUrl?: string | null;
  recordingEnabled?: boolean;
  autoCaptions?: boolean;
  lobbyEnabled?: boolean;
  maxConcurrentViewers?: number | null;
}

interface EventData {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  venueId?: string | null;
  imageUrl?: string | null;
  eventType?: EventType;
  virtualSettings?: VirtualSettings | null;
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
    startDate: z.date({ message: "A start date is required." }),
    endDate: z.date({ message: "An end date is required." }),
    venueId: z.string().optional(),
    imageUrl: z
      .string()
      .url({ message: "Please enter a valid URL." })
      .optional()
      .or(z.literal("")),
    // Virtual Event Support (required fields - defaults provided in useForm)
    eventType: z.enum(["IN_PERSON", "VIRTUAL", "HYBRID"]),
    streamingProvider: z.string().optional(),
    streamingUrl: z
      .string()
      .url("Please enter a valid streaming URL.")
      .optional()
      .or(z.literal("")),
    recordingEnabled: z.boolean(),
    autoCaptions: z.boolean(),
    lobbyEnabled: z.boolean(),
    maxConcurrentViewers: z.number().min(1).max(1000000).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before the start date.",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      if ((data.eventType === "VIRTUAL" || data.eventType === "HYBRID") && data.streamingUrl && !data.streamingProvider) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a streaming provider when providing a streaming URL.",
      path: ["streamingProvider"],
    }
  );

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

  const eventType = form.watch("eventType");
  const showVirtualSettings = eventType === "VIRTUAL" || eventType === "HYBRID";

  const { data: venuesData, loading: venuesLoading } = useQuery(
    GET_ORGANIZATION_VENUES_QUERY
  );
  const venues = venuesData?.organizationVenues || [];

  useEffect(() => {
    if (event) {
      const vs = event.virtualSettings;
      form.reset({
        name: event.name,
        description: event.description || "",
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        venueId: event.venueId || undefined,
        imageUrl: event.imageUrl || "",
        eventType: event.eventType || "IN_PERSON",
        streamingProvider: vs?.streamingProvider || "",
        streamingUrl: vs?.streamingUrl || "",
        recordingEnabled: vs?.recordingEnabled ?? true,
        autoCaptions: vs?.autoCaptions ?? false,
        lobbyEnabled: vs?.lobbyEnabled ?? false,
        maxConcurrentViewers: vs?.maxConcurrentViewers || undefined,
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
    // Build virtual settings object if event is virtual or hybrid
    const virtualSettings =
      values.eventType === "VIRTUAL" || values.eventType === "HYBRID"
        ? {
            streamingProvider: values.streamingProvider || null,
            streamingUrl: values.streamingUrl || null,
            recordingEnabled: values.recordingEnabled,
            autoCaptions: values.autoCaptions,
            lobbyEnabled: values.lobbyEnabled,
            maxConcurrentViewers: values.maxConcurrentViewers || null,
          }
        : null;

    updateEvent({
      variables: {
        id: event.id,
        eventIn: {
          name: values.name,
          description: values.description,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
          venueId: values.venueId || null,
          imageUrl: values.imageUrl || null,
          eventType: values.eventType,
          virtualSettings,
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

            {/* Event Type Selector */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {EVENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = field.value === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => field.onChange(type.value)}
                          disabled={loading}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/50"
                          } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <Icon className={`h-5 w-5 mb-1 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {EVENT_TYPES.find((t) => t.value === field.value)?.description}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Virtual Settings - Only shown for VIRTUAL or HYBRID events */}
            {showVirtualSettings && (
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Virtual Event Settings
                </h4>

                <FormField
                  control={form.control}
                  name="streamingProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Streaming Provider</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STREAMING_PROVIDERS.map((provider) => (
                            <SelectItem key={provider.value} value={provider.value}>
                              {provider.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <p className="text-xs text-muted-foreground">
                        The embed URL for your live stream
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="recordingEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Recording</FormLabel>
                          <p className="text-xs text-muted-foreground">Enable session recording</p>
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

                  <FormField
                    control={form.control}
                    name="autoCaptions"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Auto Captions</FormLabel>
                          <p className="text-xs text-muted-foreground">AI-generated captions</p>
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
                </div>

                <FormField
                  control={form.control}
                  name="lobbyEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Lobby</FormLabel>
                        <p className="text-xs text-muted-foreground">Show waiting room before event starts</p>
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
              </div>
            )}

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
