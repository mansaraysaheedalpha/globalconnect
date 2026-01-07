// src/app/(public)/_components/benefits-section.tsx
"use client";

import { Sparkles, Brain, Wifi, Zap, BarChart3, CreditCard } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const benefits = [
  {
    name: "Unparalleled Simplicity",
    description:
      "Create events in minutes, not days. Our intuitive interface requires no coding or complex training.",
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "AI-Powered Engagement",
    description:
      "Our unique AI Engagement Conductor monitors sessions and suggests interventions to keep audiences engaged.",
    icon: Brain,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Real-Time Everything",
    description:
      "WebSocket-powered polls, Q&A, chat, and reactions. Changes appear instantly for all participants.",
    icon: Wifi,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "Lightning Fast",
    description:
      "Built on Next.js 15 with optimized performance. Your events and dashboards load in milliseconds.",
    icon: Zap,
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    name: "Comprehensive Analytics",
    description:
      "Track registrations, engagement metrics, and revenue with detailed dashboards and exportable reports.",
    icon: BarChart3,
    gradient: "from-emerald-500 to-green-500",
  },
  {
    name: "Stripe-Powered Payments",
    description:
      "Secure payment processing with multiple ticket types, promo codes, and real-time revenue tracking.",
    icon: CreditCard,
    gradient: "from-pink-500 to-rose-500",
  },
];

export function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="benefits" className="py-16 sm:py-24 bg-secondary/30 scroll-mt-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 px-2">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Why GlobalConnect
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            The GlobalConnect Advantage
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-2">
            We built a platform that&apos;s both incredibly powerful and beautifully simple.
          </p>
        </div>

        {/* Benefits Grid */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.name}
              className="h-full rounded-2xl bg-background border p-5 sm:p-7 shadow-sm transition-shadow duration-200 hover:shadow-lg"
            >
              {/* Icon */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.gradient} mb-5`}>
                <benefit.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">
                {benefit.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
