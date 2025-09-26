// src/components/layout/public-header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Your logo file `logo_5.jpg` should be in the /public folder for this path to work.
  const logoSrc = "/logo.png";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-sm border-b shadow-sm"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logoSrc}
            alt="Infinite Dynamics Logo"
            width={32}
            height={32}
          />
          <span
            className={cn(
              "text-xl font-bold transition-colors",
              // --- CHANGE: Text is white when not scrolled, with a shadow for clarity ---
              !scrolled && "text-white text-shadow shadow-black/50"
            )}
          >
            GlobalConnect
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/events"
            className={cn(
              "text-sm font-medium transition-colors",
              // --- CHANGE: Nav links are white when not scrolled, with a shadow ---
              !scrolled
                ? "text-white hover:text-neutral-200 text-shadow shadow-black/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Events
          </Link>
          <Link
            href="#organizers"
            className={cn(
              "text-sm font-medium transition-colors",
              // --- CHANGE: Nav links are white when not scrolled, with a shadow ---
              !scrolled
                ? "text-white hover:text-neutral-200 text-shadow shadow-black/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            For Organizers
          </Link>
          <Link
            href="#pricing"
            className={cn(
              "text-sm font-medium transition-colors",
              // --- CHANGE: Nav links are white when not scrolled, with a shadow ---
              !scrolled
                ? "text-white hover:text-neutral-200 text-shadow shadow-black/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            className={cn(
              !scrolled && "text-white hover:bg-white/10 hover:text-white"
            )}
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
