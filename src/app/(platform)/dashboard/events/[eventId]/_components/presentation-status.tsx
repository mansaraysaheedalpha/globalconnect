// src/app/(platform)/dashboard/events/[eventId]/_components/presentation-status.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DocumentArrowUpIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Loader } from "lucide-react";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
export type PresentationState =
  | "loading"
  | "absent"
  | "processing"
  | "ready"
  | "failed";

interface PresentationStatusProps {
  status: PresentationState;
  onUpload: () => void;
  onView: () => void;
}

export const PresentationStatus = ({
  status,
  onUpload,
  onView,
}: PresentationStatusProps) => {
  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (status === "failed") {
    return (
      <Button variant="destructive" size="sm" onClick={onUpload}>
        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
        Processing Failed
      </Button>
    );
  }

  if (status === "ready") {
    return (
      <Button variant="outline" size="sm" onClick={onView}>
        <EyeIcon className="h-4 w-4 mr-2" />
        View Presentation
      </Button>
    );
  }

  if (status === "processing") {
    return (
      <Button variant="outline" size="sm" disabled>
        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
        Processing...
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={onUpload}>
      <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
      Upload Presentation
    </Button>
  );
};
