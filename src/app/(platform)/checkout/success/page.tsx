"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      logger.info("Checkout completed successfully", { sessionId });

      // Track conversion event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', {
          transaction_id: sessionId,
          currency: 'USD',
        });
      }

      // Show confetti animation
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [sessionId]);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl min-h-screen flex items-center justify-center">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 rounded-full animate-fall",
                i % 5 === 0 ? "bg-yellow-400" :
                i % 5 === 1 ? "bg-blue-400" :
                i % 5 === 2 ? "bg-green-400" :
                i % 5 === 3 ? "bg-red-400" :
                "bg-purple-400"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      <Card className="w-full shadow-2xl border-2 border-green-100">
        <CardHeader className="text-center space-y-4 pb-8">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <CardTitle className="text-3xl md:text-4xl font-bold text-green-600">
              Purchase Successful!
            </CardTitle>
            <CardDescription className="text-lg">
              Thank you for your purchase. Your order has been confirmed.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Details */}
          {sessionId && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Order Reference
              </p>
              <p className="font-mono text-sm break-all">
                {sessionId}
              </p>
            </div>
          )}

          {/* What's Next */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>You'll receive a confirmation email with your order details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Digital items are immediately available in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Physical items will be shipped according to the event schedule</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Check your purchase history for tracking information</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => router.push("/attendee/my-offers")}
              className="flex-1 gap-2"
              size="lg"
            >
              <Package className="h-4 w-4" />
              View My Purchases
            </Button>
            <Button
              onClick={() => router.push("/events")}
              variant="outline"
              className="flex-1 gap-2"
              size="lg"
            >
              Back to Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground pt-4 border-t">
            Need help? Contact support at{" "}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              support@example.com
            </a>
          </p>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fall {
          animation: fall linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}