// src/components/features/connections/linkedin-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ExternalLink, Copy, Check } from "lucide-react";

// LinkedIn icon component
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface LinkedInButtonProps {
  linkedInUrl?: string | null;
  userName: string;
  suggestedMessage?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  onConnect?: () => void;
}

export const LinkedInButton = ({
  linkedInUrl,
  userName,
  suggestedMessage,
  variant = "outline",
  size = "sm",
  showLabel = true,
  onConnect,
}: LinkedInButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(
    suggestedMessage ||
      `Hi ${userName}! It was great meeting you. Would love to connect here on LinkedIn!`
  );

  const handleOpenProfile = () => {
    if (linkedInUrl) {
      window.open(linkedInUrl, "_blank", "noopener,noreferrer");
      onConnect?.();
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const handleConnect = () => {
    // Open dialog to show suggested message
    setShowDialog(true);
  };

  const handleConnectAndOpen = () => {
    handleOpenProfile();
    setShowDialog(false);
  };

  if (!linkedInUrl) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={variant} size={size} disabled className="opacity-50">
              <LinkedInIcon className="h-4 w-4" />
              {showLabel && size !== "icon" && <span className="ml-1">LinkedIn</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{userName} hasn&apos;t connected LinkedIn</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={handleConnect}
              className="text-[#0077B5] hover:text-[#0077B5] hover:bg-[#0077B5]/10"
            >
              <LinkedInIcon className="h-4 w-4" />
              {showLabel && size !== "icon" && <span className="ml-1">Connect</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connect on LinkedIn</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkedInIcon className="h-5 w-5 text-[#0077B5]" />
              Connect with {userName}
            </DialogTitle>
            <DialogDescription>
              Copy the suggested message below, then click &quot;Open LinkedIn&quot; to
              send a connection request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] pr-10 resize-none"
                placeholder="Connection message..."
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleCopyMessage}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: Copy this message, then paste it when sending your LinkedIn
              connection request.
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConnectAndOpen}
              className="bg-[#0077B5] hover:bg-[#0077B5]/90"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open LinkedIn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * Simpler LinkedIn link button that just opens the profile.
 */
export const LinkedInProfileLink = ({
  linkedInUrl,
  size = "icon",
}: {
  linkedInUrl?: string | null;
  size?: "default" | "sm" | "lg" | "icon";
}) => {
  if (!linkedInUrl) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            onClick={() => window.open(linkedInUrl, "_blank", "noopener,noreferrer")}
            className="text-[#0077B5] hover:text-[#0077B5] hover:bg-[#0077B5]/10"
          >
            <LinkedInIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View LinkedIn Profile</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
