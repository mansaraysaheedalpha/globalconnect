"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MailX, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type UnsubscribeStatus = "idle" | "loading" | "success" | "error";

export default function UnsubscribePage() {
  const params = useParams();
  const deliveryId = params.deliveryId as string;
  const [status, setStatus] = useState<UnsubscribeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleUnsubscribe = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL}/sponsors-campaigns/unsubscribe/${deliveryId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to unsubscribe");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        {status === "success" ? (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Unsubscribed Successfully</CardTitle>
                <CardDescription>
                  You have been removed from this mailing list. You will no longer receive
                  emails from this sponsor.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Changed your mind? You can always reconnect with sponsors at future events.
              </p>
              <Button asChild variant="outline">
                <Link href="/">Return to Event Dynamics</Link>
              </Button>
            </CardContent>
          </>
        ) : status === "error" ? (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleUnsubscribe} className="w-full">
                Try Again
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Return to Event Dynamics</Link>
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <MailX className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Unsubscribe from Emails</CardTitle>
                <CardDescription>
                  You&apos;re about to unsubscribe from emails sent by this sponsor through
                  Event Dynamics. You will no longer receive campaign emails from them.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">What happens when you unsubscribe:</p>
                <ul className="space-y-1">
                  <li>- No more campaign emails from this sponsor</li>
                  <li>- You can still receive important event notifications</li>
                  <li>- You can reconnect with sponsors at future events</li>
                </ul>
              </div>

              <Button
                onClick={handleUnsubscribe}
                disabled={status === "loading"}
                className="w-full"
                variant="destructive"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Unsubscribe"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Reference: {deliveryId}
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
