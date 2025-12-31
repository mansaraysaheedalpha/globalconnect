"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";

export default function CheckoutCancelPage() {
  const router = useRouter();

  useEffect(() => {
    logger.info("Checkout cancelled by user");

    // Track cancellation event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'checkout_cancel', {
        event_category: 'ecommerce',
      });
    }
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl min-h-screen flex items-center justify-center">
      <Card className="w-full shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          {/* Cancel Icon */}
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <XCircle className="h-12 w-12 text-orange-600" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <CardTitle className="text-3xl md:text-4xl font-bold text-orange-600">
              Checkout Cancelled
            </CardTitle>
            <CardDescription className="text-lg">
              Your payment was not processed. No charges were made to your account.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Information */}
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">
              What happened?
            </h3>
            <p className="text-sm text-orange-800">
              You cancelled the checkout process. Your cart items are still available
              if you'd like to complete your purchase later.
            </p>
          </div>

          {/* Common Reasons */}
          <div className="space-y-3">
            <h3 className="font-semibold">Changed your mind?</h3>
            <p className="text-sm text-muted-foreground">
              That's perfectly fine! Here are some things you can do:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Browse other offers and deals available for this event</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Return to the event page to explore more options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Complete your purchase anytime before the offer expires</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => router.back()}
              className="flex-1 gap-2"
              size="lg"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/events")}
              variant="outline"
              className="flex-1 gap-2"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </div>

          {/* Help Text */}
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Need assistance?</p>
            <p className="text-xs text-muted-foreground">
              If you encountered an error or have questions, please contact our support team at{" "}
              <a href="mailto:support@example.com" className="text-primary hover:underline">
                support@example.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}