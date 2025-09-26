// src/app/(platform)/venues/_components/add-venue-modal.tsx
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  GET_ORGANIZATION_VENUES_QUERY,
  CREATE_VENUE_MUTATION,
} from "@/graphql/venues.graphql";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

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

export const AddVenueModal = ({
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
