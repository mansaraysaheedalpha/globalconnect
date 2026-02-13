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
  Clock,
  LogOut,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  ExpoBooth,
  BoothVideoSession,
  BoothCta,
  BoothQueueInfo,
  StaffAvailability,
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
  queueInfo: BoothQueueInfo | null;
  videoStaffAvailability: StaffAvailability | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestVideo: () => Promise<void>;
  onCancelVideoRequest: () => Promise<void>;
  onEndVideoCall: () => Promise<void>;
  onLeaveQueue: () => Promise<void>;
  onResourceDownload: (resourceId: string) => void;
  onCtaClick: (ctaId: string) => void;
  onLeadCapture: (formData: LeadFormData) => Promise<boolean>;
  isRequestingVideo?: boolean;
  isLeavingQueue?: boolean;
  /** Current user's display name for video calls */
  userName?: string;
  /** Function to get a presigned download URL for S3 resources */
  getDownloadUrl?: (resourceUrl: string, filename: string) => Promise<string>;
}

export function ExpoBoothView({
  booth,
  eventId,
  videoSession,
  queueInfo,
  videoStaffAvailability,
  isOpen,
  onClose,
  onRequestVideo,
  onCancelVideoRequest,
  onEndVideoCall,
  onLeaveQueue,
  onResourceDownload,
  onCtaClick,
  onLeadCapture,
  isRequestingVideo = false,
  isLeavingQueue = false,
  userName = "Attendee",
  getDownloadUrl,
}: ExpoBoothViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const tierConfig = BOOTH_TIER_CONFIG[booth.tier];
  const hasOnlineStaff = booth.staffPresence.some((s) => s.status === "ONLINE");
  const hasAnyStaff = booth.staffPresence.some((s) => s.status !== "OFFLINE");
  const visitorCount = booth._count.visits;

  // Handle CTA click
  const handleCtaClick = (cta: BoothCta) => {
    onCtaClick(cta.id);
    window.open(cta.url, "_blank", "noopener,noreferrer");
  };

  // Shared content component to avoid duplication
  const BoothContent = ({ isMobileView }: { isMobileView: boolean }) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile drag handle */}
      {isMobileView && (
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 my-3" />
      )}

      {/* Header with banner */}
      <div className="relative flex-shrink-0">
        {/* Banner - smaller on mobile */}
        <div className={cn("bg-muted relative", isMobileView ? "h-32" : "h-40")}>
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
        <div className={cn("pb-4 -mt-10 relative", isMobileView ? "px-4" : "px-6")}>
          <div className="flex items-end gap-3">
            {/* Logo - slightly smaller on mobile */}
            <div className={cn(
              "rounded-xl border-4 border-background bg-background shadow-lg overflow-hidden flex-shrink-0",
              isMobileView ? "w-16 h-16" : "w-20 h-20"
            )}>
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
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn(tierConfig.bgColor, tierConfig.color, "text-xs")}
                >
                  {tierConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  #{booth.boothNumber}
                </span>
              </div>
              <h2 className={cn("font-bold truncate", isMobileView ? "text-lg" : "text-xl")}>
                {booth.name}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className={cn("pb-3 flex-shrink-0", isMobileView ? "px-4" : "px-6")}>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {visitorCount}{booth.maxVisitors != null ? `/${booth.maxVisitors}` : ""} visiting
            </span>
          </div>
          {(booth._count.queueEntries ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-amber-600">
              <Clock className="h-3.5 w-3.5" />
              <span>{booth._count.queueEntries} in queue</span>
            </div>
          )}
          {booth.category && (
            <Badge variant="outline" className="text-xs">{booth.category}</Badge>
          )}
        </div>
      </div>

      {/* Queue status panel - shown when user is queued */}
      {queueInfo?.isQueued && (
        <div className={cn("pb-3 flex-shrink-0", isMobileView ? "px-4" : "px-6")}>
          <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                    You&apos;re #{queueInfo.queuePosition} in line
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {queueInfo.queueSize} {queueInfo.queueSize === 1 ? "person" : "people"} waiting
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeaveConfirm(true)}
                disabled={isLeavingQueue}
                className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300"
              >
                {isLeavingQueue ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                )}
                {isLeavingQueue ? "Leaving..." : "Leave Queue"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Separator className="flex-shrink-0" />

      {/* Main content tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <TabsList className={cn(
          "mt-3 grid grid-cols-3 flex-shrink-0",
          isMobileView ? "mx-4 h-11" : "mx-6 mt-4"
        )}>
          <TabsTrigger value="overview" className={isMobileView ? "h-9 text-sm" : ""}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="chat" className={cn("gap-1", isMobileView ? "h-9 text-sm" : "")}>
            Chat
            {booth.chatEnabled && (
              <MessageSquare className="h-3 w-3" />
            )}
          </TabsTrigger>
          <TabsTrigger value="resources" className={isMobileView ? "h-9 text-sm" : ""}>
            Resources
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-auto">
          {/* Overview Tab */}
          <TabsContent value="overview" className={cn("space-y-5 mt-0", isMobileView ? "p-4" : "p-6")}>
            {/* Tagline */}
            {booth.tagline && (
              <p className={cn("text-muted-foreground italic", isMobileView ? "text-base" : "text-lg")}>
                &ldquo;{booth.tagline}&rdquo;
              </p>
            )}

            {/* Description */}
            {booth.description && (
              <div>
                <h3 className="font-semibold mb-2 text-sm">About</h3>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                  {booth.description}
                </p>
              </div>
            )}

            {/* Video placeholder */}
            {booth.videoUrl && (
              <div>
                <h3 className="font-semibold mb-2 text-sm">Featured Video</h3>
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
              <h3 className="font-semibold mb-3 text-sm">Booth Staff</h3>
              <BoothStaffStatus staff={booth.staffPresence} />
            </div>

            {/* Video call section - hide on mobile, show in fixed footer */}
            {booth.videoEnabled && !isMobileView && (
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video Call with Staff
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {videoStaffAvailability?.allBusy
                        ? `All ${videoStaffAvailability.total} staff on calls. Your request is queued -- staff will respond when available.`
                        : hasOnlineStaff
                          ? `${booth.staffPresence.filter(s => s.status === "ONLINE").length} staff available for a live video chat`
                          : hasAnyStaff
                            ? "Staff are busy. Your request will be queued and staff will respond when available."
                            : "No staff currently online. Try again later."}
                    </p>
                  </div>
                  <Button
                    onClick={onRequestVideo}
                    disabled={!hasAnyStaff || isRequestingVideo}
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
                <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {booth.ctaButtons.map((cta) => (
                    <Button
                      key={cta.id}
                      variant={cta.style === "primary" ? "default" : "outline"}
                      onClick={() => handleCtaClick(cta)}
                      className={isMobileView ? "h-11" : ""}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {cta.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Lead capture - add extra padding at bottom on mobile for fixed CTA */}
            <div className={isMobileView ? "pb-20" : ""}>
              <LeadCaptureForm
                boothName={booth.name}
                onSubmit={onLeadCapture}
              />
            </div>
          </TabsContent>

          {/* Chat Tab - flex-1 instead of fixed height */}
          <TabsContent value="chat" className={cn("mt-0", isMobileView ? "h-full pb-20" : "h-[500px]")}>
            {booth.chatEnabled ? (
              <BoothChat boothId={booth.id} eventId={eventId} className="h-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Chat is not available for this booth</p>
              </div>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className={cn("mt-0", isMobileView ? "p-4 pb-24" : "p-6")}>
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
        </div>
      </Tabs>

      {/* Mobile fixed bottom CTA bar */}
      {isMobileView && (booth.chatEnabled || booth.videoEnabled) && !queueInfo?.isQueued && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t safe-bottom z-10">
          <div className="flex gap-2">
            {booth.chatEnabled && activeTab !== "chat" && (
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setActiveTab("chat")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat with {booth.name.split(' ')[0]}
              </Button>
            )}
            {booth.videoEnabled && (
              <Button
                onClick={onRequestVideo}
                disabled={!hasAnyStaff || isRequestingVideo}
                className={cn("h-11", booth.chatEnabled && activeTab !== "chat" ? "flex-1" : "w-full")}
              >
                {isRequestingVideo ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Video className="h-4 w-4 mr-2" />
                )}
                {isRequestingVideo ? "Requesting..." : hasAnyStaff ? "Video Call" : "Staff Offline"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Mobile: Use Sheet (bottom drawer)
  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <SheetContent
            side="bottom"
            className="h-[95vh] max-h-[95vh] p-0 rounded-t-2xl"
            showCloseButton={false}
          >
            <BoothContent isMobileView={true} />
          </SheetContent>
        </Sheet>

        {/* Leave Queue Confirmation Dialog */}
        <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave the queue?</AlertDialogTitle>
              <AlertDialogDescription>
                You&apos;re #{queueInfo?.queuePosition} in line. If you leave, you&apos;ll lose your place and have to join the queue again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay in Queue</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  setShowLeaveConfirm(false);
                  await onLeaveQueue();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Leave Queue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Desktop: Use Dialog
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <BoothContent isMobileView={false} />
        </DialogContent>
      </Dialog>

      {/* Leave Queue Confirmation Dialog */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave the queue?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re #{queueInfo?.queuePosition} in line. If you leave, you&apos;ll lose your place and have to join the queue again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay in Queue</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowLeaveConfirm(false);
                await onLeaveQueue();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Leave Queue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
