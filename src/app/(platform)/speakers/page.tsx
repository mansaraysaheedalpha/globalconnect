// src/app/(platform)/dashboard/speakers/page.tsx
"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  ARCHIVE_SPEAKER_MUTATION,
  GET_ORGANIZATION_SPEAKERS_QUERY,
} from "@/graphql/speakers.graphql";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import {
  UserPlus,
  MoreVertical,
  Pencil,
  Trash2,
  Mic2,
} from "lucide-react";
import { AddSpeakerModal } from "./_components/add-speaker-modal";
import { EditSpeakerModal } from "./_components/edit-speaker-modal";

type Speaker = {
  id: string;
  name: string;
  bio?: string | null;
  expertise?: string[] | null;
};

type SpeakersQueryData = {
  organizationSpeakers: Speaker[];
};

const SpeakersPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [speakerToEdit, setSpeakerToEdit] = useState<Speaker | null>(null);
  const [speakerToDelete, setSpeakerToDelete] = useState<Speaker | null>(null);

  const { data, loading, error } = useQuery<SpeakersQueryData>(
    GET_ORGANIZATION_SPEAKERS_QUERY
  );

  const [archiveSpeaker] = useMutation(ARCHIVE_SPEAKER_MUTATION, {
    onCompleted: () => toast.success("Speaker deleted."),
    onError: (err) =>
      toast.error("Failed to delete speaker", { description: err.message }),
    update(cache, { data: { archiveSpeaker } }) {
      const existingData = cache.readQuery<SpeakersQueryData>({
        query: GET_ORGANIZATION_SPEAKERS_QUERY,
      });
      if (existingData) {
        cache.writeQuery({
          query: GET_ORGANIZATION_SPEAKERS_QUERY,
          data: {
            organizationSpeakers: existingData.organizationSpeakers.filter(
              (s) => s.id !== archiveSpeaker.id
            ),
          },
        });
      }
    },
  });

  const handleDelete = () => {
    if (speakerToDelete) {
      archiveSpeaker({ variables: { id: speakerToDelete.id } });
      setSpeakerToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading speakers: {error.message}
      </div>
    );
  }

  const speakers = data?.organizationSpeakers || [];

  return (
    <>
      <AddSpeakerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      {speakerToEdit && (
        <EditSpeakerModal
          isOpen={!!speakerToEdit}
          onClose={() => setSpeakerToEdit(null)}
          speaker={speakerToEdit}
        />
      )}

      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Speakers</h1>
            <p className="text-muted-foreground">
              Manage your organization's speaker directory.
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="h-5 w-5 mr-2" />
            Add Speaker
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : speakers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {/* --- CHANGE: Added a new column for Title/Bio and adjusted widths --- */}
                  <TableHead className="w-[25%]">Speaker</TableHead>
                  <TableHead className="w-[35%]">Title / Bio</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead className="text-right w-[10%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {speakers.map((speaker) => (
                  <TableRow key={speaker.id}>
                    {/* --- CHANGE: This cell now only contains the name --- */}
                    <TableCell className="font-medium">
                      {speaker.name}
                    </TableCell>
                    {/* --- CHANGE: New cell specifically for the bio --- */}
                    <TableCell className="text-sm text-muted-foreground">
                      {speaker.bio}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(speaker.expertise || []).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => setSpeakerToEdit(speaker)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setSpeakerToDelete(speaker)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
              <Mic2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Speakers Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by adding your first speaker.
              </p>
              <Button className="mt-6" onClick={() => setIsAddModalOpen(true)}>
                <UserPlus className="h-5 w-5 mr-2" />
                Add Speaker
              </Button>
            </div>
          )}
        </Card>
      </div>

      <AlertDialog
        open={!!speakerToDelete}
        onOpenChange={(open) => !open && setSpeakerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the speaker "{speakerToDelete?.name}". This
              action cannot be undone.
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

export default SpeakersPage;
