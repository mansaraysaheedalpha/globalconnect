// src/app/(public)/solutions/engagement-conductor/page.tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Sparkles,
  Brain,
  Eye,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  MessageSquare,
  Trophy,
  Bell,
  Settings,
  Shield,
  Clock,
  TrendingUp,
  Users,
  Activity,
  Target,
  Lightbulb,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center text-center text-white overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        poster="/placeholder-image.png"
      >
        <source src="/AI_Intervention_for_Live_Event_Engagement.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 -z-10" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Content */}
      <div className="container px-4 md:px-6 max-w-6xl relative z-10 py-20">
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-purple-400" />
            AI-Powered
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-sm font-medium">
            <Zap className="h-4 w-4 text-amber-400" />
            NEW
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
            For Event Organizers
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-tight"
        >
          Never Lose Your Audience{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 bg-clip-text text-transparent">
              Again
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-neutral-300 leading-relaxed"
        >
          Our AI Engagement Conductor monitors audience participation in real-time,
          detects when attention drops, and automatically intervenes with smart polls,
          chat prompts, and gamification—before you even notice the problem.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-14 px-8 text-lg shadow-lg shadow-purple-500/25"
            asChild
          >
            <Link href="/contact?demo=engagement-conductor">
              Book a Demo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 text-lg backdrop-blur-sm"
            asChild
          >
            <Link href="/auth/register">
              <Play className="mr-2 h-5 w-5" />
              Start Free Trial
            </Link>
          </Button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "5s", label: "Detection Speed" },
            { value: "4", label: "Anomaly Types" },
            { value: "4", label: "Intervention Types" },
            { value: "3", label: "Operating Modes" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-white"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// PROBLEM SECTION
// ============================================================================
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: TrendingUp,
      stat: "67%",
      title: "Audience Drop-off",
      description: "of virtual event attendees leave before the event ends due to declining engagement",
    },
    {
      icon: Clock,
      stat: "8 min",
      title: "Attention Span",
      description: "Average time before attendees start disengaging without active interaction",
    },
    {
      icon: AlertTriangle,
      stat: "73%",
      title: "Too Late to Act",
      description: "of organizers only notice engagement issues after significant audience loss",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">
            The Problem
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            The Silent Killer of Virtual Events
          </h2>
          <p className="text-lg text-muted-foreground">
            By the time you notice engagement dropping, it's already too late.
            Attendees have mentally checked out, and recovering their attention is an uphill battle.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              variants={fadeInUp}
              className="relative group"
            >
              <div className="h-full rounded-2xl border border-red-500/20 bg-card p-8 transition-all duration-300 hover:border-red-500/40 hover:shadow-xl hover:shadow-red-500/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10">
                    <problem.icon className="h-7 w-7 text-red-500" />
                  </div>
                  <div className="text-4xl font-bold text-red-500">
                    {problem.stat}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SOLUTION SECTION
// ============================================================================
function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full">
            The Solution
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            AI That Watches, Learns, and Acts
          </h2>
          <p className="text-lg text-muted-foreground">
            The AI Engagement Conductor is your autonomous co-pilot that continuously monitors
            audience engagement and takes action to prevent drop-off—before it happens.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={scaleIn}
          className="relative max-w-5xl mx-auto"
        >
          <div className="aspect-video relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-purple-500/10">
            <Image
              src="/Gemini_Generated_Image_wihwe6wihwe6wihw.png"
              alt="AI Learning and Intervention System"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay with feature callouts */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white text-lg font-medium text-center">
                Thompson Sampling reinforcement learning optimizes interventions over time
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION - Orbital Flow Design
// ============================================================================
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "01",
      icon: Eye,
      title: "Perceive",
      description: "Collects real-time signals every 5 seconds",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500",
      position: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
      mobileOrder: 1,
    },
    {
      number: "02",
      icon: Brain,
      title: "Analyze",
      description: "AI calculates engagement scores",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500",
      position: "top-1/4 right-0 translate-x-1/2 -translate-y-1/2",
      mobileOrder: 2,
    },
    {
      number: "03",
      icon: AlertTriangle,
      title: "Detect",
      description: "Identifies anomalies instantly",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500",
      position: "bottom-1/4 right-0 translate-x-1/2 translate-y-1/2",
      mobileOrder: 3,
    },
    {
      number: "04",
      icon: Lightbulb,
      title: "Decide",
      description: "Selects optimal intervention",
      color: "from-amber-500 to-yellow-500",
      bgColor: "bg-amber-500",
      position: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
      mobileOrder: 4,
    },
    {
      number: "05",
      icon: Zap,
      title: "Act",
      description: "Executes smart interventions",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500",
      position: "bottom-1/4 left-0 -translate-x-1/2 translate-y-1/2",
      mobileOrder: 5,
    },
    {
      number: "06",
      icon: RefreshCw,
      title: "Learn",
      description: "Improves continuously",
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-500",
      position: "top-1/4 left-0 -translate-x-1/2 -translate-y-1/2",
      mobileOrder: 6,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            The Continuous AI Loop
          </h2>
          <p className="text-lg text-muted-foreground">
            A perpetual cycle of perception, analysis, and action that never sleeps
          </p>
        </motion.div>

        {/* Desktop: Orbital Visualization */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative max-w-4xl mx-auto aspect-square"
          >
            {/* Outer orbital ring */}
            <div className="absolute inset-8 rounded-full border-2 border-dashed border-primary/20" />

            {/* Animated orbital ring */}
            <motion.div
              className="absolute inset-8 rounded-full border-2 border-primary/40"
              style={{ borderStyle: "solid", borderWidth: "2px" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner glow ring */}
            <div className="absolute inset-24 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 blur-xl" />

            {/* Center AI Brain */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                {/* Pulsing rings */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: "160px", height: "160px", marginLeft: "-80px", marginTop: "-80px", left: "50%", top: "50%" }}
                />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-primary/30">
                  <Brain className="w-14 h-14 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-sm font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    AI Engine
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Orbital Steps */}
            {steps.map((step, index) => {
              // Calculate position on circle
              const angle = (index * 60 - 90) * (Math.PI / 180); // Start from top, 60 degrees apart
              const radius = 42; // percentage from center
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);

              return (
                <motion.div
                  key={step.title}
                  className="absolute z-10"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <div className="relative -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
                    {/* Connection line to center */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-primary/10 origin-left -z-10"
                      style={{
                        width: `${radius * 2}%`,
                        transform: `rotate(${180 + (index * 60 - 90)}deg)`,
                      }}
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                    />

                    {/* Step node */}
                    <div className="relative">
                      {/* Glow effect on hover */}
                      <div className={cn(
                        "absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300",
                        step.bgColor
                      )} />

                      <div className={cn(
                        "relative w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-all duration-300",
                        "group-hover:scale-110 group-hover:shadow-xl",
                        step.color
                      )}>
                        <step.icon className="w-9 h-9 text-white" />
                      </div>

                      {/* Step number badge */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>

                    {/* Label */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center whitespace-nowrap">
                      <div className="font-semibold text-sm">{step.title}</div>
                      <div className="text-xs text-muted-foreground max-w-[120px] mx-auto">
                        {step.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Animated flow particles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
                style={{ left: "50%", top: "8%" }}
                animate={{
                  offsetDistance: ["0%", "100%"],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 2,
                  ease: "linear",
                }}
                initial={{ offsetPath: "path('M 0,0 A 180,180 0 1,1 0,360 A 180,180 0 1,1 0,0')" }}
              />
            ))}
          </motion.div>
        </div>

        {/* Mobile/Tablet: Vertical Flow Timeline */}
        <div className="lg:hidden">
          <div className="relative max-w-md mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 via-orange-500 via-amber-500 via-green-500 to-indigo-500" />

            {/* Steps */}
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex items-start gap-6 pl-4"
                >
                  {/* Node on timeline */}
                  <div className={cn(
                    "relative z-10 flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    step.color
                  )}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        STEP {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}

              {/* Loop back indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="relative flex items-center gap-6 pl-4"
              >
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <RefreshCw className="w-6 h-6 text-white animate-spin-slow" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">
                    Continuous loop — the cycle never stops
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-8 lg:gap-16"
        >
          {[
            { value: "5s", label: "Cycle Time" },
            { value: "24/7", label: "Always Active" },
            { value: "100%", label: "Automated" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// ANOMALY DETECTION SECTION
// ============================================================================
function AnomalyDetectionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full">
              Anomaly Detection
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              4 Types of Engagement Anomalies Detected in Real-Time
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our ML algorithms continuously analyze engagement patterns to identify problems
              the moment they start—not after the damage is done.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: AlertTriangle,
                  title: "Sudden Drop",
                  description: "Sharp decline in engagement requiring immediate attention",
                  severity: "Critical",
                  color: "text-red-500",
                },
                {
                  icon: TrendingUp,
                  title: "Gradual Decline",
                  description: "Slow erosion in interaction over time—investigate causes",
                  severity: "Warning",
                  color: "text-orange-500",
                },
                {
                  icon: Activity,
                  title: "Low Engagement",
                  description: "Flatlined engagement that needs a strategy rework",
                  severity: "Warning",
                  color: "text-yellow-500",
                },
                {
                  icon: Users,
                  title: "Mass Exit",
                  description: "High volume of users leaving—critical intervention needed",
                  severity: "Critical",
                  color: "text-red-600",
                },
              ].map((anomaly) => (
                <div
                  key={anomaly.title}
                  className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className={cn("mt-1", anomaly.color)}>
                    <anomaly.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{anomaly.title}</h4>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        anomaly.severity === "Critical"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-yellow-500/10 text-yellow-600"
                      )}>
                        {anomaly.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={scaleIn}
            className="relative"
          >
            <div className="aspect-[4/3] relative rounded-2xl overflow-hidden border border-border shadow-2xl">
              <Image
                src="/Gemini_Generated_Image_wod3nrwod3nrwod3.png"
                alt="Event Engagement Anomalies Detection Panel"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating badge */}
            <motion.div
              className="absolute -bottom-4 -left-4 bg-card border rounded-xl p-4 shadow-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Detection Speed</div>
                  <div className="text-2xl font-bold text-green-500">5 seconds</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// INTERVENTIONS SECTION
// ============================================================================
function InterventionsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const interventions = [
    {
      icon: BarChart3,
      title: "AI-Generated Polls",
      description: "Contextually relevant polls generated based on session content and audience interests",
      improvement: "+12%",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: MessageSquare,
      title: "Smart Chat Prompts",
      description: "Conversation starters that spark discussion and re-engage passive attendees",
      improvement: "+8%",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Bell,
      title: "Targeted Notifications",
      description: "Personalized alerts that bring attention back to key moments",
      improvement: "+5%",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Trophy,
      title: "Gamification Triggers",
      description: "Points, badges, and challenges that motivate continued participation",
      improvement: "+15%",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
            Smart Interventions
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            4 Powerful Ways to Re-Engage Your Audience
          </h2>
          <p className="text-lg text-muted-foreground">
            Each intervention is selected by our AI based on context, audience behavior,
            and historical performance data
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {interventions.map((intervention, index) => (
            <motion.div
              key={intervention.title}
              variants={fadeInUp}
              className="group relative"
            >
              <div className="h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/30 text-center">
                {/* Icon */}
                <div className={cn(
                  "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg mb-6",
                  intervention.color
                )}>
                  <intervention.icon className="h-8 w-8 text-white" />
                </div>

                {/* Improvement stat */}
                <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-semibold mb-4">
                  {intervention.improvement} engagement
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                  {intervention.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {intervention.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// OPERATING MODES SECTION
// ============================================================================
function OperatingModesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={scaleIn}
            className="relative order-2 lg:order-1"
          >
            <div className="aspect-[16/9] relative rounded-2xl overflow-hidden border border-border shadow-2xl">
              <Image
                src="/Gemini_Generated_Image_7uavm67uavm67uav.png"
                alt="AI Operating Modes - Manual, Semi-Auto, Auto"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="order-1 lg:order-2"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full">
              Control Levels
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              You're Always in Control
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Choose how much autonomy to give the AI. Start with full oversight,
              and increase automation as you build confidence.
            </p>

            <div className="space-y-6">
              {[
                {
                  mode: "Manual Mode",
                  description: "Full human control. AI suggests, you decide. Every intervention requires your explicit approval.",
                  confidence: "Low Confidence",
                  effort: "High Effort",
                  icon: Settings,
                  color: "border-blue-500/30 bg-blue-500/5",
                },
                {
                  mode: "Semi-Auto Mode",
                  description: "Collaborative co-pilot. AI executes low-risk interventions automatically, escalates important decisions to you.",
                  confidence: "Medium Confidence",
                  effort: "Shared Effort",
                  icon: Users,
                  color: "border-purple-500/30 bg-purple-500/5",
                  recommended: true,
                },
                {
                  mode: "Auto Mode",
                  description: "Autonomous execution. AI handles everything with human oversight. You monitor and can override anytime.",
                  confidence: "High Confidence",
                  effort: "Low Effort",
                  icon: Zap,
                  color: "border-green-500/30 bg-green-500/5",
                },
              ].map((item) => (
                <div
                  key={item.mode}
                  className={cn(
                    "relative p-5 rounded-xl border transition-all hover:shadow-lg",
                    item.color
                  )}
                >
                  {item.recommended && (
                    <span className="absolute -top-3 right-4 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                      Recommended
                    </span>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border">
                      <item.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{item.mode}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-muted-foreground">{item.confidence}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{item.effort}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TRANSPARENCY SECTION
// ============================================================================
function TransparencySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full">
            Decision Transparency
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Understand Every Decision
          </h2>
          <p className="text-lg text-muted-foreground">
            No black box AI here. Every recommendation comes with clear reasoning,
            confidence scores, and historical performance data.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {[
            {
              icon: Brain,
              title: "Reasoning Explained",
              description: "See exactly why the AI chose a specific intervention, including the signals that triggered it",
            },
            {
              icon: Target,
              title: "Confidence Scores",
              description: "Know how confident the AI is in each recommendation based on available data and historical patterns",
            },
            {
              icon: BarChart3,
              title: "Performance History",
              description: "View how similar interventions performed in past sessions to inform your decisions",
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg mb-6">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// ENTERPRISE FEATURES SECTION
// ============================================================================
function EnterpriseFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: Shield, title: "Enterprise Security", description: "SOC 2 compliant, encrypted at rest and in transit" },
    { icon: Activity, title: "99.9% Uptime SLA", description: "Built on reliable infrastructure with failover" },
    { icon: RefreshCw, title: "Circuit Breakers", description: "Graceful degradation under high load" },
    { icon: BarChart3, title: "Export Reports", description: "CSV and JSON exports for all intervention data" },
    { icon: Clock, title: "Real-Time Updates", description: "WebSocket-powered live data streaming" },
    { icon: Users, title: "Multi-Session", description: "Monitor multiple live sessions simultaneously" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-full">
            Enterprise Ready
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Built for Scale and Reliability
          </h2>
          <p className="text-lg text-muted-foreground">
            Production-grade infrastructure trusted by organizations running high-stakes events
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="flex items-start gap-4 p-5 rounded-xl border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA SECTION
// ============================================================================
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-white/10 rounded-full blur-[100px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-8"
          >
            <Sparkles className="h-4 w-4" />
            Start Engaging Smarter Today
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Transform Your Event Engagement?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join forward-thinking event organizers who never worry about losing their audience.
            Let AI handle engagement while you focus on delivering great content.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-purple-700 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-xl"
              asChild
            >
              <Link href="/contact?demo=engagement-conductor">
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 text-lg backdrop-blur-sm"
              asChild
            >
              <Link href="/auth/register">
                Start Free Trial
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Cancel anytime
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function EngagementConductorPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <AnomalyDetectionSection />
      <InterventionsSection />
      <OperatingModesSection />
      <TransparencySection />
      <EnterpriseFeaturesSection />
      <CTASection />
    </div>
  );
}