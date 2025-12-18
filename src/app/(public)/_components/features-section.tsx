// src/app/(public)/_components/features-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Paintbrush, Settings, Users, Zap, BarChart3, Shield } from "lucide-react";

const features = [
  {
    name: "Create",
    description:
      "Launch stunning event pages in minutes with our intuitive drag-and-drop builder. No design skills required.",
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
    name: "Experience",
    description:
      "Discover, register, and engage with events through a frictionless, beautiful interface that delights.",
    icon: Users,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "Automate",
    description:
      "Set up smart workflows that handle repetitive tasks automatically, saving you hours every week.",
    icon: Zap,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "Analyze",
    description:
      "Get actionable insights with real-time analytics and beautiful reports that drive better decisions.",
    icon: BarChart3,
    gradient: "from-emerald-500 to-green-500",
  },
  {
    name: "Secure",
    description:
      "Enterprise-grade security with SOC 2 compliance, encryption, and role-based access controls.",
    icon: Shield,
    gradient: "from-slate-500 to-gray-500",
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

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 sm:py-32 relative overflow-hidden scroll-mt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full"
          >
            Powerful Features
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            An Intelligent, Unified OS
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to run successful events, all in one beautifully designed platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative h-full rounded-2xl border bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 overflow-hidden">
                {/* Gradient hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Icon */}
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-6`}>
                  <feature.icon className="h-7 w-7 text-white" aria-hidden="true" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

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
