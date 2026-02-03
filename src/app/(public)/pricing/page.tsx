// src/app/(public)/pricing/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing - Coming Soon",
  description: "View our pricing plans. Coming soon.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Pricing
        </h1>

        <p className="text-xl text-muted-foreground mb-2">
          Coming Soon
        </p>

        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We&apos;re finalizing our pricing plans to offer you the best value.
          Check back soon for flexible options that fit your needs.
        </p>

        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
