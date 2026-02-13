// src/app/offline/page.tsx
"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <WifiOff className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            You&apos;re Offline
          </h1>
          <p className="text-muted-foreground">
            It looks like you&apos;ve lost your internet connection. Don&apos;t
            worry — some features are still available:
          </p>
        </div>

        <ul className="space-y-2 text-left text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            View previously loaded events and sessions
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Read cached chat messages and Q&amp;A
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Queue actions that will sync when you reconnect
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Access your QR tickets for check-in
          </li>
        </ul>

        <Button
          onClick={() => window.location.reload()}
          variant="default"
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
