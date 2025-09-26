// src/app/(public)/_components/hero-section.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center text-white dark:text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        poster="/placeholder-image.png" // Optional: a poster image while the video loads
      >
        <source src="/hero-background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 -z-10" />
      <div className="container px-4 md:px-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          The Intelligent Unified OS for World-Class Events.
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-neutral-300">
          Where enterprise power meets unparalleled simplicity. Create, manage,
          and attend unforgettable experiences.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/register">Create an Event</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:text-primary dark:hover:text-primary-foreground"
          >
            <Link href="/events">Discover Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
