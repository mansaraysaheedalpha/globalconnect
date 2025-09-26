// src/app/(platform)/dashboard/venues/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  GET_ORGANIZATION_VENUES_QUERY,
  ARCHIVE_VENUE_MUTATION,
} from "@/graphql/venues.graphql";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
// --- CHANGE: Swapping to Heroicons ---
import {
  MapPinIcon,
  PlusCircleIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { AddVenueModal } from "./_components/add-venue-modal";
import { EditVenueModal } from "./_components/edit-venue-modal";

type Venue = {
  id: string;
  name: string;
  address?: string | null;
  __typename?: string;
};

type VenuesQueryData = {
  organizationVenues: Venue[];
};

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

      <div className="p-6 space-y-6">
        {/* --- CHANGE: New Page Header --- */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
            <p className="text-muted-foreground">
              Manage your organization's event locations.
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Add Venue
          </Button>
        </div>

        {/* --- CHANGE: Main content is now a Card containing a Table or Empty State --- */}
        <Card>
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : venues.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell className="font-medium">{venue.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {venue.address || "Not specified"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => setVenueToEdit(venue)}
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setVenueToDelete(venue)}
                            className="text-destructive"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-16">
              <MapPinIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Venues Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by adding your first venue.
              </p>
              <Button className="mt-6" onClick={() => setIsAddModalOpen(true)}>
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Add Venue
              </Button>
            </div>
          )}
        </Card>
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
