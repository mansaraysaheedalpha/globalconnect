// src/hooks/use-temp-image-upload.ts
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const EVENT_SERVICE_URL =
  process.env.NEXT_PUBLIC_EVENT_SERVICE_URL || "http://localhost:8000/api/v1";

export const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadResult {
  publicUrl: string;
  s3Key: string;
}

export function useTempImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, orgId } = useAuthStore();

  const uploadImage = async (file: File): Promise<UploadResult | null> => {
    if (!token || !orgId) {
      setError("Not authenticated");
      toast.error("Authentication error. Please log in again.");
      return null;
    }

    // Validate file type
    if (!Object.keys(ACCEPTED_IMAGE_TYPES).includes(file.type)) {
      setError("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
      toast.error("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
      return null;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10MB.");
      toast.error("File too large. Maximum size is 10MB.");
      return null;
    }

    setIsUploading(true);
    setError(null);
    const toastId = toast.loading("Preparing to upload image...");

    try {
      // Step 1: Get pre-signed URL
      toast.loading("Requesting upload permission...", { id: toastId });
      const requestResponse = await fetch(
        `${EVENT_SERVICE_URL}/organizations/${orgId}/temp-image-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content_type: file.type,
            filename: file.name,
          }),
        }
      );

      if (!requestResponse.ok) {
        const errorData = await requestResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to get upload URL");
      }

      const { url, fields, s3_key, public_url } = await requestResponse.json();

      // Step 2: Upload to S3
      toast.loading("Uploading image...", { id: toastId });
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      // File must be appended last for S3
      formData.append("file", file);

      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      // S3 returns 204 No Content on success
      if (!uploadResponse.ok && uploadResponse.status !== 204) {
        throw new Error("Failed to upload file to storage");
      }

      toast.success("Image uploaded successfully!", { id: toastId });

      return {
        publicUrl: public_url,
        s3Key: s3_key,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const clearError = () => setError(null);

  return { uploadImage, isUploading, error, clearError };
}
