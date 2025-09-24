// src/app/(platform)/events/_components/create-event-modal.tsx
"use client";

import React, { useState } from "react";
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
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label"; // <-- Added missing import

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
    venueId: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before the start date.",
    path: ["endDate"],
  });

type EventFormValues = z.infer<typeof formSchema>;
type Blueprint = {
  id: string;
  name: string;
  description: string;
  template: string;
};
type Venue = { id: string; name: string }; // <-- Added Venue type

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

  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(
    null
  );

  const { data: blueprintsData, loading: blueprintsLoading } = useQuery(
    GET_ORGANIZATION_BLUEPRINTS_QUERY
  );
  // --- FIX: Renamed duplicate 'venuesLoading' variable ---
  const { data: venuesData, loading: areVenuesLoading } = useQuery(
    GET_ORGANIZATION_VENUES_QUERY
  );

  const blueprints = blueprintsData?.organizationBlueprints || [];
  const venues = venuesData?.organizationVenues || [];

  const [createEvent, { loading: isCreating }] = useMutation(
    CREATE_EVENT_MUTATION,
    {
      refetchQueries: [{ query: GET_EVENTS_BY_ORGANIZATION_QUERY }],
      onCompleted: () => {
        toast.success("Event created successfully!");
        onClose();
        form.reset();
      },
      onError: (error) => {
        toast.error("Failed to create event", { description: error.message });
      },
    }
  );

  const [instantiateBlueprint, { loading: isInstantiating }] = useMutation(
    INSTANTIATE_BLUEPRINT_MUTATION,
    {
      refetchQueries: [{ query: GET_EVENTS_BY_ORGANIZATION_QUERY }],
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

  const loading = isCreating || isInstantiating;

  const onSubmit = (values: EventFormValues) => {
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
            venueId: values.venueId,
          },
        },
      });
    }
  };

  // --- THIS IS THE NEW LOGIC ---
  const handleBlueprintSelect = (blueprintId: string) => {
    setSelectedBlueprintId(blueprintId);

    // Find the full blueprint object from the selected ID
    const selectedBlueprint = blueprints.find(
      (bp: Blueprint) => bp.id === blueprintId
    );
    if (!selectedBlueprint) return;

    // Parse the template data
    const template = JSON.parse(selectedBlueprint.template);

    // Pre-fill the form with the blueprint's data
    form.setValue(
      "name",
      `${selectedBlueprint.name} ${new Date().getFullYear()}`
    );
    form.setValue("description", template.description || "");
    if (template.venue_id) {
      form.setValue("venueId", template.venue_id);
    }
  };
  // ---------------------------

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
            className="space-y-4 py-4"
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
            <FormField
              control={form.control}
              name="venueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={areVenuesLoading}
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
                {selectedBlueprintId ? "Create from Blueprint" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
