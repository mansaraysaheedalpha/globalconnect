"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ARCHIVE_SPEAKER_MUTATION, GET_ORGANIZATION_SPEAKERS_QUERY } from "@/graphql/speakers.graphql";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, MoreVertical, Trash2, UserPlus } from "lucide-react";
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
import { AddSpeakerModal } from "./_components/add-speaker-modal";
import { EditSpeakerModal } from "./_components/edit-speaker-modal";
import { toast } from "sonner";

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
  const [speakerToDelete, setSpeakerToDelete] = useState<Speaker | null>(
      null
    );

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    );
  }

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

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Speakers</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Speaker
          </Button>
        </div>

        {speakers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <Card key={speaker.id} className="flex flex-col">
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <CardTitle>{speaker.name}</CardTitle>
                    <CardDescription>{speaker.bio}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onSelect={() => setSpeakerToEdit(speaker)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setSpeakerToDelete(speaker)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-grow">
                  {speaker.expertise && speaker.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {speaker.expertise.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Speakers Found</h3>
            <p className="mt-2">Get started by adding your first speaker.</p>
          </div>
        )}
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
