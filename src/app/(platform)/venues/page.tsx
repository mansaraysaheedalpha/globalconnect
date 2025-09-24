"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";

import {
  GET_ORGANIZATION_VENUES_QUERY,
  ARCHIVE_VENUE_MUTATION,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, PlusCircle, Loader, MoreVertical, Edit, Trash2 } from "lucide-react";
import {AddVenueModal} from "./_components/add-venue-modal";
import { EditVenueModal } from "./_components/edit-venue-modal";

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



// --- Main Venues Page ---
const VenuesPage = () => {
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [venueToEdit, setVenueToEdit] = useState<Venue | null>(null);
   const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  const { data, loading, error } = useQuery<VenuesQueryData>(
    GET_ORGANIZATION_VENUES_QUERY
  );

    const [archiveVenue] = useMutation(ARCHIVE_VENUE_MUTATION, {
      onCompleted: () => toast.success("Venue deleted."),
      onError: (err) =>
        toast.error("Failed to delete venue", { description: err.message }),
      update(cache, { data: { archiveVenue } }) {
        const existingData = cache.readQuery<VenuesQueryData>({
          query: GET_ORGANIZATION_VENUES_QUERY,
        });
        if (existingData) {
          cache.writeQuery({
            query: GET_ORGANIZATION_VENUES_QUERY,
            data: {
              organizationVenues: existingData.organizationVenues.filter(
                (v) => v.id !== archiveVenue.id
              ),
            },
          });
        }
      },
    });

    const handleDelete = () => {
      if (venueToDelete) {
        archiveVenue({ variables: { id: venueToDelete.id } });
        setVenueToDelete(null);
      }
    };

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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      {venueToEdit && (
        <EditVenueModal
          isOpen={!!venueToEdit}
          onClose={() => setVenueToEdit(null)}
          venue={venueToEdit}
        />
      )}

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Venues</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Venue
          </Button>
        </div>

        {venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <Card key={venue.id}>
                <CardHeader className="flex-row items-start justify-between">
                  <CardTitle>{venue.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => setVenueToEdit(venue)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setVenueToDelete(venue)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      <AlertDialog
        open={!!venueToDelete}
        onOpenChange={(open) => !open && setVenueToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the venue "{venueToDelete?.name}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VenuesPage;
