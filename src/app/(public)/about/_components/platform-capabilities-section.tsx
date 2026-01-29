// src/app/(public)/about/_components/platform-capabilities-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Globe,
  Zap,
  Building2,
  TrendingUp,
  MessageSquare,
  Users,
  Award,
  BarChart3,
  Wifi,
  Target,
  Calendar,
  Ticket,
} from "lucide-react";

const capabilities = [
  {
    icon: Globe,
    title: "Unified Event Infrastructure",
    description:
      "Live, virtual, and hybrid events powered by one intelligent platform with multi-track agendas and seamless attendee experiences.",
    gradient: "from-blue-500 to-cyan-500",
    features: [
      "Multi-track session builder",
      "Speaker & venue management",
      "Smart ticketing with promo codes",
      "Waitlist automation",
    ],
  },
  {
    icon: Zap,
    title: "Real-time Engagement Suite",
    description:
      "20+ WebSocket gateways delivering sub-200ms latency for live polls, Q&A, chat, reactions, and instant notifications.",
    gradient: "from-violet-500 to-purple-500",
    features: [
      "Live polls with instant results",
      "Moderated Q&A sessions",
      "Real-time chat & reactions",
      "Push notifications",
    ],
  },
  {
    icon: Building2,
    title: "Comprehensive Sponsorship",
    description:
      "Full sponsor lifecycle management with tiered packages, virtual booths, intelligent lead capture, and ROI attribution.",
    gradient: "from-amber-500 to-orange-500",
    features: [
      "Tiered sponsor packages",
      "Virtual booth builder",
      "Intent-based lead scoring",
      "Full attribution tracking",
    ],
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description:
      "Real-time dashboards, engagement forecasting, anomaly detection, and heatmaps to optimize every aspect of your event.",
    gradient: "from-emerald-500 to-green-500",
    features: [
      "Live engagement metrics",
      "Attendance heatmaps",
      "Anomaly detection",
      "Custom report builder",
    ],
  },
  {
    icon: Users,
    title: "Intelligent Networking",
    description:
      "AI-powered attendee matching, huddles (micro-meetups), interest-based circles, and proximity-based suggestions.",
    gradient: "from-pink-500 to-rose-500",
    features: [
      "AI-powered matching",
      "Networking huddles",
      "Interest circles",
      "Connection management",
    ],
  },
  {
    icon: Award,
    title: "Gamification Engine",
    description:
      "Points, badges, leaderboards, and challenges to drive engagement with configurable rewards and team competitions.",
    gradient: "from-indigo-500 to-blue-500",
    features: [
      "Points & achievements",
      "Live leaderboards",
      "Team challenges",
      "Reward fulfillment",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

export function PlatformCapabilitiesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full"
          >
            Platform Capabilities
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
              Intelligently Connected
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Replace 7-8 disconnected tools with one unified platform where every
            feature feeds into our AI for continuous optimization.
          </p>
        </motion.div>

        {/* Capabilities Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative h-full rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 overflow-hidden">
                {/* Gradient hover effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${capability.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${capability.gradient} shadow-lg mb-5`}
                >
                  <capability.icon className="h-7 w-7 text-white" aria-hidden="true" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {capability.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {capability.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2">
                  {capability.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${capability.gradient}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
