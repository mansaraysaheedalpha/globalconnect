"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { GET_ORGANIZATION_BLUEPRINTS_QUERY } from "@/graphql/blueprints.graphql";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCopy } from "lucide-react";

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

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-9 w-48 mb-6" />
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
        Error loading blueprints: {error.message}
      </div>
    );
  }

  const blueprints = data?.organizationBlueprints || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Blueprints</h1>
      </div>

      {blueprints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blueprints.map((blueprint) => (
            <Card key={blueprint.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <BookCopy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{blueprint.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {blueprint.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No Blueprints Found</h3>
          <p className="mt-2">
            You can save an event as a blueprint from its details page.
          </p>
        </div>
      )}
    </div>
  );
};

export default BlueprintsPage;
