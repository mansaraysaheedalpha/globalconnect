// src/app/(public)/about/_components/team-culture-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  Zap,
  Database,
  Users,
  ArrowRight,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const values = [
  {
    icon: Brain,
    title: "AI-First Engineering",
    description:
      "We build intelligent systems, not just features. Every capability is designed with AI augmentation in mind from day one.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Real-time Obsession",
    description:
      "Sub-second response times everywhere. We believe users deserve instant feedback, and we engineer for it relentlessly.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Database,
    title: "Event Sourcing Purists",
    description:
      "Complete audit trails and time-travel capabilities. Every state change is captured, enabling powerful analytics and debugging.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Open Collaboration",
    description:
      "Async-first, documentation-driven development. We value clear communication and believe great ideas can come from anywhere.",
    gradient: "from-emerald-500 to-green-500",
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

export function TeamCultureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[150px]" />
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
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full"
          >
            <Heart className="h-4 w-4" />
            Our Culture
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Built by Engineers,{" "}
            <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
              For Event Professionals
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We&apos;re a team of engineers who believe events deserve better technology.
            These are the principles that guide everything we build.
          </p>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative h-full rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 overflow-hidden">
                {/* Gradient hover effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${value.gradient} shadow-lg`}
                  >
                    <value.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Join Us CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-1">Interested in joining us?</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;re always looking for talented engineers who share our vision.
              </p>
            </div>
            <Button variant="outline" className="group whitespace-nowrap" asChild>
              <Link href="mailto:careers@eventdynamics.io">
                View Open Roles
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
