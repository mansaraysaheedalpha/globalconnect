// src/components/features/expo/BoothResources.tsx
"use client";

import { useState } from "react";
import {
  FileText,
  Video,
  Link as LinkIcon,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BoothResource } from "./types";

export interface BoothResourcesProps {
  resources: BoothResource[];
  onDownload?: (resource: BoothResource) => void;
  /** Function to get a presigned download URL for S3 resources */
  getDownloadUrl?: (resourceUrl: string, filename: string) => Promise<string>;
  className?: string;
}

const RESOURCE_ICONS: Record<BoothResource["type"], React.ReactNode> = {
  PDF: <FileText className="h-5 w-5 text-red-500" />,
  VIDEO: <Video className="h-5 w-5 text-purple-500" />,
  IMAGE: <ImageIcon className="h-5 w-5 text-orange-500" />,
  DOCUMENT: <FileText className="h-5 w-5 text-blue-500" />,
  LINK: <LinkIcon className="h-5 w-5 text-green-500" />,
  OTHER: <LinkIcon className="h-5 w-5 text-gray-500" />,
};

const RESOURCE_LABELS: Record<BoothResource["type"], string> = {
  PDF: "PDF",
  VIDEO: "Video",
  IMAGE: "Image",
  DOCUMENT: "Document",
  LINK: "Link",
  OTHER: "Other",
};

// Extract file extension from URL
const getExtensionFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? `.${match[1].toLowerCase()}` : "";
  } catch {
    return "";
  }
};

// Ensure filename has proper extension
const getFilenameWithExtension = (name: string, url: string): string => {
  // Check if name already has an extension
  const hasExtension = /\.[a-zA-Z0-9]{2,5}$/.test(name);
  if (hasExtension) {
    return name;
  }
  // Extract extension from URL and append
  const ext = getExtensionFromUrl(url);
  return ext ? `${name}${ext}` : name;
};

export function BoothResources({
  resources,
  onDownload,
  getDownloadUrl,
  className,
}: BoothResourcesProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleResourceClick = async (resource: BoothResource) => {
    // Track download
    onDownload?.(resource);

    // Open resource - LINK and OTHER types are external links
    if (resource.type === "LINK" || resource.type === "OTHER") {
      window.open(resource.url, "_blank", "noopener,noreferrer");
      return;
    }

    // Start loading state
    setDownloadingId(resource.id);

    try {
      // Ensure filename has proper extension
      const filename = getFilenameWithExtension(resource.name, resource.url);

      // Get presigned URL with Content-Disposition: attachment header
      let downloadUrl = resource.url;
      if (getDownloadUrl) {
        try {
          downloadUrl = await getDownloadUrl(resource.url, filename);
          console.log("Got presigned download URL:", downloadUrl);
        } catch (error) {
          console.error("Failed to get download URL:", error);
          // Fall back to direct URL
        }
      }

      // Create a hidden anchor element to trigger the download
      // The presigned URL has Content-Disposition: attachment which tells
      // the browser to download instead of display
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(resource.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingId(null);
    }
  };

  if (resources.length === 0) {
    return null;
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Resources & Downloads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            {/* Icon */}
            <div className="mt-0.5">{RESOURCE_ICONS[resource.type]}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{resource.name}</h4>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {RESOURCE_LABELS[resource.type]}
                </Badge>
              </div>
              {resource.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {resource.description}
                </p>
              )}
            </div>

            {/* Action button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleResourceClick(resource)}
              className="flex-shrink-0"
              disabled={downloadingId === resource.id}
            >
              {downloadingId === resource.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : resource.type === "LINK" || resource.type === "OTHER" ? (
                <ExternalLink className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
