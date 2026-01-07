// src/app/(public)/_components/for-organizers-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LayoutDashboard,
  Ticket,
  BarChart3,
  Users,
  Presentation,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";

const organizerFeatures = [
  {
    icon: LayoutDashboard,
    title: "Intuitive Dashboard",
    description: "Manage all your events from a single, beautifully designed command center.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Ticket,
    title: "Smart Ticketing",
    description: "Create multiple ticket types, early bird pricing, and promo codes effortlessly.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track registrations, engagement, and revenue with live dashboards and reports.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Users,
    title: "Attendee Management",
    description: "Check-in guests, manage waitlists, and view attendee details at a glance.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Presentation,
    title: "Session Builder",
    description: "Create multi-track agendas with speakers, rooms, and interactive sessions.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Engagement",
    description: "Let our AI monitor sessions and suggest polls, Q&A, and interventions automatically.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

const highlights = [
  "Create unlimited events",
  "Custom branding options",
  "Real-time engagement tools",
  "Export attendee data",
  "Team collaboration",
  "Detailed analytics",
];

export function ForOrganizersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="for-organizers" className="py-16 sm:py-24 scroll-mt-20 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
              <LayoutDashboard className="h-4 w-4" />
              For Organizers
            </span>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 sm:mb-6">
              Everything you need to{" "}
              <span className="text-primary">
                create amazing events
              </span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              From intimate workshops to large conferences, our powerful tools give you complete control over every aspect of your event.
            </p>

            {/* Highlights grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <Button size="lg" className="group" asChild>
              <Link href="/auth/register">
                Start Creating Events
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Right - Feature Cards */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {organizerFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-2xl bg-background border shadow-sm transition-shadow duration-200 hover:shadow-lg"
              >
                {/* Icon */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${feature.bg}`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>

                {/* Content */}
                <h3 className="font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
