// src/components/features/expo/BoothResources.tsx
"use client";

import {
  FileText,
  Video,
  Link as LinkIcon,
  Image as ImageIcon,
  Download,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BoothResource } from "./types";

export interface BoothResourcesProps {
  resources: BoothResource[];
  onDownload?: (resource: BoothResource) => void;
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

export function BoothResources({
  resources,
  onDownload,
  className,
}: BoothResourcesProps) {
  const handleResourceClick = (resource: BoothResource) => {
    // Track download
    onDownload?.(resource);

    // Open resource - LINK and OTHER types are external links
    if (resource.type === "LINK" || resource.type === "OTHER") {
      window.open(resource.url, "_blank", "noopener,noreferrer");
    } else {
      // Download file
      const link = document.createElement("a");
      link.href = resource.url;
      link.download = resource.name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
            >
              {resource.type === "LINK" || resource.type === "OTHER" ? (
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
