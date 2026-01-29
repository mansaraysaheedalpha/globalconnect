// src/app/(public)/about/_components/problem-solution-section.tsx
"use client";

import { motion } from "framer-motion";
import {
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  Brain,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const problems = [
  {
    icon: Clock,
    text: "Manual content creation requiring constant human intervention",
  },
  {
    icon: AlertTriangle,
    text: "Post-event analytics that arrive too late to matter",
  },
  {
    icon: Brain,
    text: "No predictive intelligence or real-time optimization",
  },
  {
    icon: Users,
    text: "Siloed data with no cross-event learning capabilities",
  },
  {
    icon: TrendingUp,
    text: "Human bottlenecks that limit scale and responsiveness",
  },
];

const solutions = [
  {
    icon: Brain,
    text: "AI agents that perceive, decide, and act autonomously",
  },
  {
    icon: Zap,
    text: "Real-time monitoring with sub-2-second intervention",
  },
  {
    icon: TrendingUp,
    text: "Thompson Sampling for continuous A/B optimization",
  },
  {
    icon: Users,
    text: "Collective learning across all platform events",
  },
  {
    icon: Sparkles,
    text: "Infinite scale without additional resources",
  },
];

export function ProblemSolutionSection() {
  return (
    <section id="our-approach" className="py-20 sm:py-28 relative overflow-hidden scroll-mt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
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
            Why We Built This
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            From Reactive Tools to{" "}
            <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
              Intelligent Systems
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Traditional event platforms treat engagement as an afterthought.
            We built Event Dynamics to change that fundamentally.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Problem Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-rose-500/5 p-6 sm:p-8 h-full">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <span className="text-xs font-medium text-red-500 uppercase tracking-wider">
                    The Industry Challenge
                  </span>
                  <h3 className="text-xl font-semibold">
                    Traditional Platforms Are Reactive
                  </h3>
                </div>
              </div>

              {/* Problem List */}
              <ul className="space-y-4">
                {problems.map((problem, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <XCircle className="h-5 w-5 text-red-500/70" />
                    </div>
                    <span className="text-muted-foreground">{problem.text}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Visual indicator */}
              <div className="mt-8 pt-6 border-t border-red-500/10">
                <p className="text-sm text-red-400/70 italic">
                  &ldquo;We found organizers spending 70% of their time on tasks
                  that could be automated with the right intelligence.&rdquo;
                </p>
              </div>
            </div>
          </motion.div>

          {/* Solution Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 p-6 sm:p-8 h-full">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">
                    Our Approach
                  </span>
                  <h3 className="text-xl font-semibold">
                    Autonomous Event Intelligence
                  </h3>
                </div>
              </div>

              {/* Solution List */}
              <ul className="space-y-4">
                {solutions.map((solution, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span className="text-foreground">{solution.text}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Visual indicator */}
              <div className="mt-8 pt-6 border-t border-emerald-500/10">
                <p className="text-sm text-emerald-400/70 italic">
                  &ldquo;Our AI Engagement Conductor processes engagement signals
                  and intervenes in under 2 seconds—while your event is running.&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
