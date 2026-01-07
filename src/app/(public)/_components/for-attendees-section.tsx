// src/app/(public)/_components/for-attendees-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
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
import { cn } from "@/lib/utils";

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
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <section id="for-attendees" className="py-16 sm:py-24 relative overflow-hidden scroll-mt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16 px-2"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-full"
          >
            <Heart className="h-4 w-4" />
            For Attendees
          </motion.span>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 sm:mb-6">
            Experience events like{" "}
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              never before
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Discover, register, and engage with events through a beautifully designed experience that puts you first.
          </p>
        </motion.div>

        {/* Feature Cards - Bento Grid Style */}
        <motion.div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {attendeeFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
              className={cn(
                "group relative p-5 sm:p-6 rounded-2xl border border-border/50 bg-background transition-all duration-500 cursor-pointer overflow-hidden",
                activeCard === index ? "shadow-2xl border-transparent -translate-y-2" : "shadow-sm hover:shadow-lg"
              )}
            >
              {/* Gradient background on hover */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                feature.gradient,
                activeCard === index && "opacity-[0.08]"
              )} />

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className={cn(
                  "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br mb-4 sm:mb-5 shadow-lg transition-all duration-300",
                  feature.gradient,
                  activeCard === index && "scale-110 shadow-xl"
                )}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>

                {/* Text */}
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow indicator */}
                <div className={cn(
                  "mt-4 flex items-center gap-1 text-sm font-medium transition-all duration-300",
                  "text-muted-foreground group-hover:text-primary",
                  activeCard === index && "translate-x-1"
                )}>
                  Learn more
                  <ArrowRight className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    activeCard === index && "translate-x-1"
                  )} />
                </div>
              </div>

              {/* Decorative corner */}
              <div className={cn(
                "absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] transition-opacity duration-300",
                "bg-gradient-to-bl opacity-0",
                feature.gradient.replace("from-", "from-").replace("to-", "to-") + "/10",
                activeCard === index && "opacity-100"
              )} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <Button size="lg" variant="outline" className="group" asChild>
            <Link href="/events">
              <Sparkles className="mr-2 h-4 w-4" />
              Explore Upcoming Events
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
