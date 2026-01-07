// src/app/(public)/_components/features-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Paintbrush, Settings, Users, Zap, BarChart3, Shield } from "lucide-react";

const features = [
  {
    name: "Create",
    description:
      "Build professional event pages quickly with our streamlined event builder. Add sessions, speakers, and tickets with ease.",
    icon: Paintbrush,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    name: "Manage",
    description:
      "Control everything from ticketing and analytics to attendee engagement from a single, elegant dashboard.",
    icon: Settings,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Engage",
    description:
      "Keep your audience active with real-time polls, live Q&A, chat, and emoji reactions during sessions.",
    icon: Users,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "AI-Powered",
    description:
      "Our AI Engagement Conductor monitors audience participation and suggests interventions to boost engagement.",
    icon: Zap,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "Analyze",
    description:
      "Get actionable insights with real-time analytics and detailed reports that drive better decisions.",
    icon: BarChart3,
    gradient: "from-emerald-500 to-green-500",
  },
  {
    name: "Secure",
    description:
      "Built with security in mind including encrypted connections, secure authentication, and role-based access.",
    icon: Shield,
    gradient: "from-slate-500 to-gray-500",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="features" className="py-16 sm:py-24 scroll-mt-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 px-2">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Powerful Features
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            An Intelligent, Unified OS
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-2">
            Everything you need to run successful events, all in one beautifully designed platform.
          </p>
        </div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {features.map((feature) => (
            <div
              key={feature.name}
              className="group relative h-full rounded-2xl border bg-card p-5 sm:p-7 shadow-sm transition-shadow duration-200 hover:shadow-lg"
            >
              {/* Icon */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-5`}>
                <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">
                {feature.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
