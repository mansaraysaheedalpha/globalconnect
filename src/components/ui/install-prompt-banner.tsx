// src/components/ui/install-prompt-banner.tsx
"use client";

import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "./button";
import { cn } from "@/lib/utils";

/**
 * Floating banner that prompts users to install the PWA.
 * Shows only when the browser fires beforeinstallprompt,
 * hides for 7 days after dismissal.
 */
export function InstallPromptBanner({ className }: { className?: string }) {
  const { canInstall, promptInstall, dismiss } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md",
        "bg-card border shadow-lg rounded-xl p-4",
        "animate-in slide-in-from-bottom-4 fade-in duration-300",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Download className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Install Event Dynamics</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quick access to tickets, schedules &amp; live sessions — works offline
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={promptInstall}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>

        <button
          onClick={dismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
