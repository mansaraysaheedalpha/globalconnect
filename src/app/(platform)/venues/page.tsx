"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  GET_ORGANIZATION_VENUES_QUERY,
  CREATE_VENUE_MUTATION,
} from "@/graphql/venues.graphql";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, PlusCircle, Loader } from "lucide-react";

// --- Type Definitions ---
type Venue = {
  id: string;
  name: string;
  address?: string | null;
  __typename?: string;
};

type VenuesQueryData = {
  organizationVenues: Venue[];
};

// --- Add Venue Modal ---
const formSchema = z.object({
  name: z.string().min(2, "Venue name must be at least 2 characters."),
  address: z.string().optional(),
});

type VenueFormValues = z.infer<typeof formSchema>;

const AddVenueModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", address: "" },
  });

  const [createVenue, { loading }] = useMutation(CREATE_VENUE_MUTATION, {
    onCompleted: () => {
      toast.success("Venue added successfully!");
      onClose();
      form.reset();
    },
    onError: (error) =>
      toast.error("Failed to add venue", { description: error.message }),
    update(cache, { data: { createVenue } }) {
      const data = cache.readQuery<VenuesQueryData>({
        query: GET_ORGANIZATION_VENUES_QUERY,
      });
      if (data) {
        cache.writeQuery({
          query: GET_ORGANIZATION_VENUES_QUERY,
          data: {
            organizationVenues: [...data.organizationVenues, createVenue],
          },
        });
      }
    },
  });

  const onSubmit = (values: VenueFormValues) => {
    createVenue({ variables: { venueIn: values } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Venue</DialogTitle>
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
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Grand Convention Center"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 123 Innovation Drive, Tech City"
                      {...field}
                    />
                  </FormControl>
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
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}Add
                Venue
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Venues Page ---
const VenuesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, loading, error } = useQuery<VenuesQueryData>(
    GET_ORGANIZATION_VENUES_QUERY
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading venues: {error.message}
      </div>
    );
  }

  const venues = data?.organizationVenues || [];

  return (
    <>
      <AddVenueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Venues</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Venue
          </Button>
        </div>

        {venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <Card key={venue.id}>
                <CardHeader>
                  <CardTitle>{venue.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {venue.address && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{venue.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Venues Found</h3>
            <p className="mt-2">Get started by adding your first venue.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default VenuesPage;
