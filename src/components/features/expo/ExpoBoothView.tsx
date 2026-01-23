// src/components/features/expo/ExpoBoothView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Video,
  MessageSquare,
  Users,
  ExternalLink,
  Loader2,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Note: BoothVideoSession type kept for API compatibility, but video is now rendered via VideoCallOverlay
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ExpoBooth,
  BoothVideoSession,
  BoothCta,
  BOOTH_TIER_CONFIG,
} from "./types";
import { BoothChat } from "./BoothChat";
import { BoothResources } from "./BoothResources";
import { BoothStaffStatus } from "./BoothStaffStatus";
import { LeadCaptureForm, LeadFormData } from "./LeadCaptureForm";

export interface ExpoBoothViewProps {
  booth: ExpoBooth;
  eventId: string;
  videoSession: BoothVideoSession | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestVideo: () => Promise<void>;
  onCancelVideoRequest: () => Promise<void>;
  onEndVideoCall: () => Promise<void>;
  onResourceDownload: (resourceId: string) => void;
  onCtaClick: (ctaId: string) => void;
  onLeadCapture: (formData: LeadFormData) => Promise<boolean>;
  isRequestingVideo?: boolean;
  /** Current user's display name for video calls */
  userName?: string;
  /** Function to get a presigned download URL for S3 resources */
  getDownloadUrl?: (resourceUrl: string, filename: string) => Promise<string>;
}

export function ExpoBoothView({
  booth,
  eventId,
  videoSession,
  isOpen,
  onClose,
  onRequestVideo,
  onCancelVideoRequest,
  onEndVideoCall,
  onResourceDownload,
  onCtaClick,
  onLeadCapture,
  isRequestingVideo = false,
  userName = "Attendee",
  getDownloadUrl,
}: ExpoBoothViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const tierConfig = BOOTH_TIER_CONFIG[booth.tier];
  const hasOnlineStaff = booth.staffPresence.some((s) => s.status === "ONLINE");
  const visitorCount = booth._count.visits;

  // Handle CTA click
  const handleCtaClick = (cta: BoothCta) => {
    onCtaClick(cta.id);
    window.open(cta.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header with banner */}
          <div className="relative flex-shrink-0">
            {/* Banner */}
            <div className="h-40 bg-muted relative">
              {booth.bannerUrl ? (
                <Image
                  src={booth.bannerUrl}
                  alt={`${booth.name} banner`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "w-full h-full",
                    tierConfig.bgColor
                  )}
                />
              )}

            </div>

            {/* Logo and title overlay */}
            <div className="px-6 pb-4 -mt-12 relative">
              <div className="flex items-end gap-4">
                {/* Logo */}
                <div className="w-20 h-20 rounded-xl border-4 border-background bg-background shadow-lg overflow-hidden flex-shrink-0">
                  {booth.logoUrl ? (
                    <Image
                      src={booth.logoUrl}
                      alt={`${booth.name} logo`}
                      width={80}
                      height={80}
                      className="object-contain p-2"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-full h-full flex items-center justify-center text-2xl font-bold",
                        tierConfig.bgColor,
                        tierConfig.color
                      )}
                    >
                      {booth.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className={cn(tierConfig.bgColor, tierConfig.color)}
                    >
                      {tierConfig.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Booth #{booth.boothNumber}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold truncate">{booth.name}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="px-6 pb-4 flex-shrink-0">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{visitorCount} visiting</span>
              </div>
              {booth.category && (
                <Badge variant="outline">{booth.category}</Badge>
              )}
            </div>
          </div>

          <Separator className="flex-shrink-0" />

          {/* Main content tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <TabsList className="mx-6 mt-4 grid grid-cols-3 flex-shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="chat">
                Chat
                {booth.chatEnabled && (
                  <MessageSquare className="h-3 w-3 ml-1" />
                )}
              </TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 overflow-auto">
              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6 mt-0">
                {/* Tagline */}
                {booth.tagline && (
                  <p className="text-lg text-muted-foreground italic">
                    &ldquo;{booth.tagline}&rdquo;
                  </p>
                )}

                {/* Description */}
                {booth.description && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {booth.description}
                    </p>
                  </div>
                )}

                {/* Video placeholder */}
                {booth.videoUrl && (
                  <div>
                    <h3 className="font-semibold mb-2">Featured Video</h3>
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <video
                        src={booth.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        poster={booth.bannerUrl || undefined}
                      />
                    </div>
                  </div>
                )}

                {/* Staff presence */}
                <div>
                  <h3 className="font-semibold mb-3">Booth Staff</h3>
                  <BoothStaffStatus staff={booth.staffPresence} />
                </div>

                {/* Video call section */}
                {booth.videoEnabled && (
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Video Call with Staff
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {hasOnlineStaff
                            ? "Staff members are available for a live video chat"
                            : "No staff currently available. Try again later."}
                        </p>
                      </div>
                      <Button
                        onClick={onRequestVideo}
                        disabled={!hasOnlineStaff || isRequestingVideo}
                        size="lg"
                      >
                        {isRequestingVideo ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Phone className="h-4 w-4 mr-2" />
                        )}
                        {isRequestingVideo ? "Requesting..." : "Start Video Call"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                {booth.ctaButtons.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      {booth.ctaButtons.map((cta) => (
                        <Button
                          key={cta.id}
                          variant={cta.style === "primary" ? "default" : "outline"}
                          onClick={() => handleCtaClick(cta)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {cta.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lead capture */}
                <LeadCaptureForm
                  boothName={booth.name}
                  onSubmit={onLeadCapture}
                />
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent value="chat" className="mt-0 h-[500px]">
                {booth.chatEnabled ? (
                  <BoothChat boothId={booth.id} eventId={eventId} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Chat is not available for this booth</p>
                  </div>
                )}
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="p-6 mt-0">
                <BoothResources
                  resources={booth.resources}
                  onDownload={(resource) => onResourceDownload(resource.id)}
                  getDownloadUrl={getDownloadUrl}
                />
                {booth.resources.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No resources available for download</p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
