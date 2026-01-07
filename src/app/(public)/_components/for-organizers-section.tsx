// src/app/(public)/_components/for-organizers-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LayoutDashboard,
  Ticket,
  BarChart3,
  Users,
  Settings,
  Presentation,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section id="for-organizers" className="py-16 sm:py-24 relative overflow-hidden scroll-mt-20 bg-secondary/30">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full"
            >
              <Settings className="h-4 w-4" />
              For Organizers
            </motion.span>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 sm:mb-6">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                create amazing events
              </span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              From intimate workshops to large conferences, our powerful tools give you complete control over every aspect of your event.
            </p>

            {/* Highlights grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              {highlights.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </motion.div>
              ))}
            </div>

            <Button size="lg" className="group" asChild>
              <Link href="/auth/register">
                Start Creating Events
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {/* Right - Feature Cards */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {organizerFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={cn(
                  "group relative p-5 rounded-2xl bg-background border border-border/50 transition-all duration-300",
                  hoveredFeature === index ? "shadow-xl border-primary/30 -translate-y-1" : "shadow-sm hover:shadow-md"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl mb-4 transition-transform duration-300",
                  feature.bg,
                  hoveredFeature === index && "scale-110"
                )}>
                  <feature.icon className={cn("h-5 w-5", feature.color)} />
                </div>

                {/* Content */}
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover gradient */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 -z-10",
                  "bg-gradient-to-br from-blue-500/5 to-violet-500/5",
                  hoveredFeature === index && "opacity-100"
                )} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
