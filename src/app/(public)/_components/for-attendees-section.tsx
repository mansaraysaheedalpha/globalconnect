// src/app/(public)/_components/for-attendees-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Search,
  Ticket,
  CalendarCheck,
  MessageSquare,
  Trophy,
  Heart,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const attendeeFeatures = [
  {
    icon: Search,
    title: "Discover Events",
    description: "Find events that match your interests with filters by date, location, and category.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Ticket,
    title: "Easy Registration",
    description: "Register in seconds with Stripe-powered checkout. Your tickets are always accessible.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: CalendarCheck,
    title: "Session Schedule",
    description: "View the full event agenda with sessions, speakers, and timing all in one place.",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: MessageSquare,
    title: "Live Interaction",
    description: "Participate in polls, Q&A sessions, and live chat. Your voice matters at every event.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Heart,
    title: "Emoji Reactions",
    description: "Express yourself during sessions with real-time emoji reactions visible to everyone.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Earn points, climb leaderboards, and compete with other attendees for top spots.",
    gradient: "from-yellow-500 to-amber-500",
  },
];

export function ForAttendeesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="for-attendees" className="py-16 sm:py-24 scroll-mt-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 px-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-full">
            <Heart className="h-4 w-4" />
            For Attendees
          </span>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 sm:mb-6">
            Experience events like{" "}
            <span className="text-primary">
              never before
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Discover, register, and engage with events through a beautifully designed experience that puts you first.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {attendeeFeatures.map((feature) => (
            <div
              key={feature.title}
              className="p-5 sm:p-6 rounded-2xl border bg-card shadow-sm transition-shadow duration-200 hover:shadow-lg"
            >
              {/* Icon */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-5`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Button size="lg" variant="outline" className="group" asChild>
            <Link href="/events">
              <Sparkles className="mr-2 h-4 w-4" />
              Explore Upcoming Events
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
