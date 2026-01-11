// src/app/(platform)/events/_components/create-event-modal.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { CREATE_EVENT_MUTATION } from "@/graphql/events.graphql";
import { GET_EVENTS_BY_ORGANIZATION_QUERY } from "@/graphql/queries";
import { GET_ORGANIZATION_VENUES_QUERY } from "@/graphql/venues.graphql";
import { Separator } from "@/components/ui/separator";
import {
  GET_ORGANIZATION_BLUEPRINTS_QUERY,
  INSTANTIATE_BLUEPRINT_MUTATION,
} from "@/graphql/blueprints.graphql";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ImageUpload } from "@/components/ui/image-upload";
import { useTempImageUpload } from "@/hooks/use-temp-image-upload";
import { Loader, Link as LinkIcon, Upload, Video, Users, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Event type options for virtual event support
const EVENT_TYPES = [
  { value: "IN_PERSON", label: "In-Person", icon: Users, description: "Physical venue attendance" },
  { value: "VIRTUAL", label: "Virtual", icon: Video, description: "Online streaming only" },
  { value: "HYBRID", label: "Hybrid", icon: Globe, description: "Both in-person and virtual" },
] as const;

const STREAMING_PROVIDERS = [
  { value: "youtube", label: "YouTube Live" },
  { value: "vimeo", label: "Vimeo" },
  { value: "mux", label: "Mux" },
  { value: "ivs", label: "Amazon IVS" },
  { value: "cloudflare", label: "Cloudflare Stream" },
  { value: "rtmp", label: "Custom RTMP" },
] as const;

type EventType = "IN_PERSON" | "VIRTUAL" | "HYBRID";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBlueprintId?: string | null;
}

const formSchema = z
  .object({
    name: z.string().min(3, "Event name must be at least 3 characters long."),
    description: z.string().optional(),
    startDate: z.date({ error: "A start date is required." }),
    endDate: z.date({ error: "An end date is required." }),
    venueId: z.string().optional(),
    imageUrl: z
      .string()
      .url("Please enter a valid URL.")
      .optional()
      .or(z.literal("")),
    // Virtual Event Support
    eventType: z.enum(["IN_PERSON", "VIRTUAL", "HYBRID"]).default("IN_PERSON"),
    streamingProvider: z.string().optional(),
    streamingUrl: z
      .string()
      .url("Please enter a valid streaming URL.")
      .optional()
      .or(z.literal("")),
    recordingEnabled: z.boolean().default(true),
    autoCaptions: z.boolean().default(false),
    lobbyEnabled: z.boolean().default(false),
    maxConcurrentViewers: z.number().min(1).max(1000000).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before the start date.",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      // If event is virtual or hybrid, streaming provider should be set
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
type Blueprint = {
  id: string;
  name: string;
  description: string;
  template: string;
};
type Venue = { id: string; name: string };

type ImageInputMode = "url" | "upload";

export const CreateEventModal = ({
  isOpen,
  onClose,
  preselectedBlueprintId,
}: CreateEventModalProps) => {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      eventType: "IN_PERSON",
      streamingProvider: "",
      streamingUrl: "",
      recordingEnabled: true,
      autoCaptions: false,
      lobbyEnabled: false,
    },
  });
  const { reset, setValue, watch } = form;
  const eventType = watch("eventType");
  const showVirtualSettings = eventType === "VIRTUAL" || eventType === "HYBRID";

  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(
    null
  );
  const [imageInputMode, setImageInputMode] = useState<ImageInputMode>("upload");
  const { uploadImage, isUploading } = useTempImageUpload();

  const { data: blueprintsData, loading: blueprintsLoading } = useQuery(
    GET_ORGANIZATION_BLUEPRINTS_QUERY
  );
  const { data: venuesData, loading: venuesLoading } = useQuery(
    GET_ORGANIZATION_VENUES_QUERY
  );

  const blueprints = blueprintsData?.organizationBlueprints || [];
  const venues = venuesData?.organizationVenues || [];

  const [createEvent, { loading: isCreating }] = useMutation(
    CREATE_EVENT_MUTATION,
    {
      refetchQueries: [
        {
          query: GET_EVENTS_BY_ORGANIZATION_QUERY,
          variables: {
            limit: 10,
            offset: 0,
            sortBy: "startDate",
            sortDirection: "desc",
            status: null,
          },
        },
      ],
      onCompleted: () => {
        toast.success("Event created successfully!");
        onClose();
        form.reset();
      },
      onError: (error) =>
        toast.error("Failed to create event", { description: error.message }),
    }
  );

  const [instantiateBlueprint, { loading: isInstantiating }] = useMutation(
    INSTANTIATE_BLUEPRINT_MUTATION,
    {
      refetchQueries: [
        {
          query: GET_EVENTS_BY_ORGANIZATION_QUERY,
          variables: {
            limit: 10,
            offset: 0,
            sortBy: "startDate",
            sortDirection: "desc",
            status: null,
          },
        },
      ],
      onCompleted: (data) => {
        toast.success(
          `Event "${data.instantiateBlueprint.name}" created from blueprint!`
        );
        onClose();
        form.reset();
      },
      onError: (error) =>
        toast.error("Failed to create from blueprint", {
          description: error.message,
        }),
    }
  );

  const loading = isCreating || isInstantiating || isUploading;

  const handleBlueprintSelect = useCallback(
    (blueprintId: string) => {
      setSelectedBlueprintId(blueprintId);
      const selectedBlueprint = blueprints.find(
        (bp: Blueprint) => bp.id === blueprintId
      );
      if (!selectedBlueprint) return;
      const template = JSON.parse(selectedBlueprint.template);
      setValue("name", `${selectedBlueprint.name} ${new Date().getFullYear()}`);
      setValue("description", template.description || "");
      if (template.venue_id) {
        setValue("venueId", template.venue_id);
      }
    },
    [blueprints, setValue]
  );

  useEffect(() => {
    if (isOpen && preselectedBlueprintId && blueprints.length > 0) {
      handleBlueprintSelect(preselectedBlueprintId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, preselectedBlueprintId, blueprints.length]);

  useEffect(() => {
    if (!isOpen) {
      reset({
        name: "",
        description: "",
        imageUrl: "",
        eventType: "IN_PERSON",
        streamingProvider: "",
        streamingUrl: "",
        recordingEnabled: true,
        autoCaptions: false,
        lobbyEnabled: false,
      });
      setSelectedBlueprintId(null);
      setImageInputMode("upload");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleImageUpload = async (file: File) => {
    const result = await uploadImage(file);
    if (result) {
      setValue("imageUrl", result.publicUrl);
    }
  };

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

    if (selectedBlueprintId) {
      instantiateBlueprint({
        variables: {
          id: selectedBlueprintId,
          blueprintIn: {
            name: values.name,
            startDate: values.startDate.toISOString(),
            endDate: values.endDate.toISOString(),
          },
        },
      });
    } else {
      createEvent({
        variables: {
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill in the details below or start from a blueprint to create a new
            event.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4"
          >
            {blueprints.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label>Start from a Blueprint (Optional)</Label>
                  <Select
                    onValueChange={handleBlueprintSelect}
                    disabled={blueprintsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a blueprint..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {blueprints.map((bp: Blueprint) => (
                        <SelectItem key={bp.id} value={bp.id}>
                          {bp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="my-4" />
              </>
            )}
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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Image (Optional)</FormLabel>
                  <div className="space-y-3">
                    {/* Toggle between URL and Upload */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={imageInputMode === "upload" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setImageInputMode("upload")}
                        disabled={loading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <Button
                        type="button"
                        variant={imageInputMode === "url" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setImageInputMode("url")}
                        disabled={loading}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        URL
                      </Button>
                    </div>

                    {imageInputMode === "upload" ? (
                      <FormControl>
                        <ImageUpload
                          value={field.value || null}
                          onChange={handleImageUpload}
                          onClear={() => field.onChange("")}
                          isUploading={isUploading}
                          disabled={loading && !isUploading}
                        />
                      </FormControl>
                    ) : (
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                    )}
                  </div>
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
                    defaultValue={field.value}
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
                {selectedBlueprintId ? "Create from Blueprint" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
