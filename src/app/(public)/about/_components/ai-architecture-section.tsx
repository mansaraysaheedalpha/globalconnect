// src/app/(public)/about/_components/ai-architecture-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  Eye,
  Cpu,
  Zap,
  Target,
  UserSearch,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const agentCapabilities = [
  {
    icon: Brain,
    title: "AI Engagement Conductor",
    description:
      "LangGraph-powered agent that monitors engagement signals in real-time and orchestrates interventions using Thompson Sampling for optimal results.",
    highlight: "Detects engagement drops in <2 seconds",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Target,
    title: "Intelligent Lead Scoring",
    description:
      "ML-based scoring system (0-100 scale) that tracks 12+ interaction types to classify leads as Hot, Warm, or Cold with full attribution.",
    highlight: "12+ interaction types tracked",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: UserSearch,
    title: "Profile Enrichment AI",
    description:
      "Tavily-powered web search combined with Claude for intelligent profile building, skills detection, and professional background analysis.",
    highlight: "Automatic context building",
    gradient: "from-amber-500 to-orange-500",
  },
];

const architectureLayers = [
  {
    name: "ORCHESTRATOR",
    subtitle: "Multi-Agent Coordinator",
    description: "Task planning, conflict resolution, goal alignment",
  },
  {
    name: "PERCEIVE",
    subtitle: "Signal Monitor",
    description: "Real-time engagement tracking",
  },
  {
    name: "DECIDE",
    subtitle: "Thompson Sampling",
    description: "Optimal intervention selection",
  },
  {
    name: "ACT",
    subtitle: "Intervention Executor",
    description: "Automated response delivery",
  },
];

export function AIArchitectureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
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
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-violet-500/10 text-violet-500 dark:text-violet-400 rounded-full"
          >
            <Cpu className="h-4 w-4" />
            The Intelligence Layer
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            AI-Native{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              Architecture
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built on LangGraph with autonomous agents that perceive, decide, and act—
            continuously learning from every event to optimize outcomes.
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <div className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5 p-6 sm:p-8">
            {/* Orchestrator Layer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-4 sm:p-6 mb-6"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg text-violet-400">ORCHESTRATOR LAYER</h3>
                  <p className="text-sm text-muted-foreground">
                    Multi-Agent Coordinator • Task Planner • Conflict Resolver
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Connection Arrow */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <ArrowDown className="h-8 w-8 text-violet-500/50" />
              </motion.div>
            </div>

            {/* Agent Layers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Perceive */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="relative rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 mb-3"
                >
                  <Eye className="h-6 w-6 text-blue-400" />
                </motion.div>
                <h4 className="font-semibold text-blue-400 mb-1">PERCEIVE</h4>
                <p className="text-xs text-muted-foreground">
                  Signal Monitor<br />Real-time tracking
                </p>
              </motion.div>

              {/* Decide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="relative rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 mb-3"
                >
                  <Brain className="h-6 w-6 text-purple-400" />
                </motion.div>
                <h4 className="font-semibold text-purple-400 mb-1">DECIDE</h4>
                <p className="text-xs text-muted-foreground">
                  Thompson Sampling<br />Optimal selection
                </p>
              </motion.div>

              {/* Act */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="relative rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 mb-3"
                >
                  <Zap className="h-6 w-6 text-emerald-400" />
                </motion.div>
                <h4 className="font-semibold text-emerald-400 mb-1">ACT</h4>
                <p className="text-xs text-muted-foreground">
                  Intervention Executor<br />Automated response
                </p>
              </motion.div>
            </div>

            {/* Learning Loop Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
              className="mt-6 pt-4 border-t border-violet-500/20 text-center"
            >
              <p className="text-sm text-violet-400/70">
                <span className="font-medium">Continuous Learning Loop</span> — Every intervention
                outcome feeds back into Thompson Sampling for improved decisions
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Agent Capability Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {agentCapabilities.map((capability, index) => (
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

                {/* Highlight Badge */}
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                    "bg-gradient-to-r opacity-90",
                    capability.gradient,
                    "text-white"
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  {capability.highlight}
                </div>

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
