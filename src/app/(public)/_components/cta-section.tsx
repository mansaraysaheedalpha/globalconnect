// src/app/(public)/_components/cta-section.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-20 sm:py-24 md:px-6">
        <div className="rounded-2xl bg-secondary dark:bg-card p-12 text-center shadow-sm">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to redefine your event experience?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Join the next generation of event creators and start building
            unforgettable moments today.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/register">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
