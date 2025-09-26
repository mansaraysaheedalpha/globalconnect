// src/app/(platform)/dashboard/blueprints/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORGANIZATION_BLUEPRINTS_QUERY } from "@/graphql/blueprints.graphql";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
// --- CHANGE: Swapping to Heroicons ---
import {
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { CreateEventModal } from "../events/_components/create-event-modal";


type Blueprint = {
  id: string;
  name: string;
  description?: string | null;
};

type BlueprintsQueryData = {
  organizationBlueprints: Blueprint[];
};

const BlueprintsPage = () => {
  const { data, loading, error } = useQuery<BlueprintsQueryData>(
    GET_ORGANIZATION_BLUEPRINTS_QUERY
  );

  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<
     string | null
   >(null);

  const handleUseBlueprint = (blueprintId: string) => {
    setSelectedBlueprintId(blueprintId);
    setIsCreateEventModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateEventModalOpen(false);
    setSelectedBlueprintId(null); // Reset the selected ID when closing
  };


  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading blueprints: {error.message}
      </div>
    );
  }

  const blueprints = data?.organizationBlueprints || [];

  return (
    <>
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={handleCloseModal}
        preselectedBlueprintId={selectedBlueprintId}
      />

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Event Blueprints
          </h1>
          <p className="text-muted-foreground">
            Reusable templates to launch new events instantly.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        ) : blueprints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blueprints.map((blueprint) => (
              // --- CHANGE: Redesigned Card Component ---
              <Card
                key={blueprint.id}
                className="flex flex-col justify-between hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                      <DocumentDuplicateIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{blueprint.name}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-3">
                        {blueprint.description || "No description provided."}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter>
                  {/* --- CHANGE: Connect the button's onClick event --- */}
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleUseBlueprint(blueprint.id)}
                  >
                    Use Blueprint
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // --- CHANGE: Redesigned Empty State ---
          <div className="text-center p-16 border-2 border-dashed rounded-lg">
            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Blueprints Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You can save a completed event as a blueprint from its details
              page.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/dashboard/events">Go to Events</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default BlueprintsPage;
