// src/app/(platform)/events/_components/event-page-header.tsx
"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_ARCHIVED_EVENTS_COUNT_QUERY } from "@/graphql/events.graphql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Archive, ArrowLeft, Search } from "lucide-react";
import { CreateEventModal } from "./create-event-modal";
import { useState } from "react";

interface EventPageHeaderProps {
  pageTitle: string;
  totalCount: number;
  isArchivedView: boolean;
}

export const EventPageHeader = ({
  pageTitle,
  totalCount,
  isArchivedView,
}: EventPageHeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: archivedData } = useQuery(GET_ARCHIVED_EVENTS_COUNT_QUERY, {
    variables: { status: "archived" },
    fetchPolicy: "cache-and-network",
  });
  const archivedCount = archivedData?.eventsByOrganization?.totalCount || 0;

  return (
    <>
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {pageTitle}{" "}
            <span className="text-lg text-muted-foreground font-normal">
              ({totalCount})
            </span>
          </h1>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-9" />
          </div>
          {isArchivedView ? (
            <Link href="/dashboard/events" className="w-full md:w-auto">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          ) : (
            <div className="flex gap-2 w-full md:w-auto">
              {archivedCount > 0 && (
                <Link
                  href="/dashboard/events?status=archived"
                  className="flex-1 md:flex-auto"
                >
                  <Button variant="secondary" className="w-full">
                    <Archive className="h-4 w-4 mr-2" />
                    Archived ({archivedCount})
                  </Button>
                </Link>
              )}
              <Button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 md:flex-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
