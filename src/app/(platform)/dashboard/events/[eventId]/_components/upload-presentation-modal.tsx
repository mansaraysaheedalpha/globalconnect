// src/app/(platform)/dashboard/events/[eventId]/_components/upload-presentation-modal.tsx
"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface UploadPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  event: { id: string; organizationId: string };
  session: { id: string; title: string };
}

export const UploadPresentationModal = ({
  isOpen,
  onClose,
  onUploadComplete,
  event,
  session,
}: UploadPresentationModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("Awaiting file selection...");
  const { token } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setStatusText(`Selected: ${e.target.files[0].name}`);
    }
  };

  const handleUpload = async () => {
    if (!token) {
      toast.error("Authentication error", {
        description: "No auth token found. Please log in again.",
      });
      return;
    }

    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    setIsLoading(true);

    try {
      setStatusText("Requesting upload permission...");

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const requestUrl = `${baseUrl}/api/v1/organizations/${event.organizationId}/events/${event.id}/sessions/${session.id}/presentation/upload-request`;

      const presignResponse = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type,
        }),
      });

      if (!presignResponse.ok)
        throw new Error("Could not get upload URL from backend.");
      const { url, fields, s3_key } = await presignResponse.json();

      setStatusText("Uploading file directly to storage...");
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file);

      const s3Response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!s3Response.ok) throw new Error("File upload to storage failed.");

      setStatusText("Finalizing and starting processing...");
      const processUrl = `${baseUrl}/api/v1/organizations/${event.organizationId}/events/${event.id}/sessions/${session.id}/presentation/process`;

      const processResponse = await fetch(processUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ s3_key }),
      });

      if (!processResponse.ok)
        throw new Error("Failed to start file processing on backend.");

      toast.success("Presentation uploaded successfully!", {
        description: "The file is now being processed into slides.",
      });
      onUploadComplete();
      onClose();
    } catch (error: any) {
      toast.error("Upload Failed", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Presentation</DialogTitle>
          <DialogDescription>For session: "{session.title}"</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="presentation-file">
              Presentation File (PDF recommended)
            </Label>
            <Input
              id="presentation-file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.ppt,.pptx"
              disabled={isLoading}
            />
          </div>
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-secondary rounded-md">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span>{statusText}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isLoading || !file}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? statusText : "Upload & Process"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
