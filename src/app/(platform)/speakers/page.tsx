"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORGANIZATION_SPEAKERS_QUERY } from "@/graphql/speakers.graphql";

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
import { UserPlus } from "lucide-react";
import { AddSpeakerModal } from "./_components/add-speaker-modal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, loading, error } = useQuery<SpeakersQueryData>(
    GET_ORGANIZATION_SPEAKERS_QUERY
  );

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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Speakers</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Speaker
          </Button>
        </div>

        {speakers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <Card key={speaker.id}>
                <CardHeader>
                  <CardTitle>{speaker.name}</CardTitle>
                  <CardDescription>{speaker.bio}</CardDescription>
                </CardHeader>
                <CardContent>
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
    </>
  );
};

export default SpeakersPage;
