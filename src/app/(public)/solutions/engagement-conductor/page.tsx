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
          {problems.map((problem) => (
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
// PLATFORM SHOWCASE SECTION - Immersive 3D-like Design with Animations
// ============================================================================
function PlatformShowcaseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const floatingStats = [
    { value: "99.9%", label: "Uptime", icon: Activity, color: "from-green-500 to-emerald-500" },
    { value: "<5s", label: "Detection", icon: Zap, color: "from-amber-500 to-orange-500" },
    { value: "24/7", label: "Monitoring", icon: Eye, color: "from-blue-500 to-cyan-500" },
    { value: "AI", label: "Powered", icon: Brain, color: "from-purple-500 to-pink-500" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/20"
            animate={{ boxShadow: ["0 0 0 0 rgba(168, 85, 247, 0)", "0 0 0 8px rgba(168, 85, 247, 0.1)", "0 0 0 0 rgba(168, 85, 247, 0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            The Platform
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            AI That{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                Watches, Learns, and Acts
              </span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From intelligent monitoring to autonomous intervention—see the complete platform in action
          </p>
        </motion.div>

        {/* Desktop: Immersive Layered Design */}
        <div className="hidden lg:block">
          <div className="relative max-w-6xl mx-auto">
            {/* Floating Stats - positioned around the main content */}
            {floatingStats.map((stat, index) => {
              const positions = [
                { top: "5%", left: "-5%" },
                { top: "15%", right: "-5%" },
                { bottom: "20%", left: "-8%" },
                { bottom: "10%", right: "-3%" },
              ];
              const pos = positions[index];

              return (
                <motion.div
                  key={stat.label}
                  className="absolute z-30"
                  style={pos as React.CSSProperties}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1, type: "spring" }}
                >
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className={cn(
                      "px-4 py-3 rounded-2xl bg-background/80 backdrop-blur-xl border shadow-2xl",
                      "hover:scale-110 transition-transform cursor-pointer"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center", stat.color)}>
                          <stat.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xl font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                    {/* Glow effect */}
                    <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20 blur-xl -z-10", stat.color)} />
                  </motion.div>
                </motion.div>
              );
            })}

            {/* Main Dashboard - Hero Image with 3D effect */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: 10 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 10 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 perspective-1000"
            >
              {/* Glow behind */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-60" />

              <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 bg-background shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)]">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-muted/80 to-muted/50 border-b border-border/50 backdrop-blur-sm">
                  <div className="flex gap-1.5">
                    <motion.div className="w-3 h-3 rounded-full bg-red-500" whileHover={{ scale: 1.2 }} />
                    <motion.div className="w-3 h-3 rounded-full bg-yellow-500" whileHover={{ scale: 1.2 }} />
                    <motion.div className="w-3 h-3 rounded-full bg-green-500" whileHover={{ scale: 1.2 }} />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <motion.div
                      className="px-4 py-1.5 rounded-lg bg-background/50 text-xs text-muted-foreground flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      dashboard.eventdynamics.com/conductor
                    </motion.div>
                  </div>
                </div>

                {/* Screenshot */}
                <div className="relative">
                  <Image
                    src="/engagement-dashboard-screenshot.png"
                    alt="AI Engagement Conductor Dashboard"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                    priority
                  />

                  {/* Animated scan line effect */}
                  <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>

            {/* AI Visualization - Floating card overlapping */}
            <motion.div
              initial={{ opacity: 0, x: 100, rotate: 5 }}
              animate={isInView ? { opacity: 1, x: 0, rotate: 3 } : { opacity: 0, x: 100, rotate: 5 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ rotate: 0, scale: 1.02 }}
              className="absolute -bottom-8 -right-8 w-[400px] z-20"
            >
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                <Image
                  src="/Gemini_Generated_Image_wihwe6wihwe6wihw.png"
                  alt="AI Learning System"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Animated content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <motion.div
                    className="flex items-center gap-3 mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.div
                      className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="h-5 w-5 text-white" />
                    </motion.div>
                    <div>
                      <div className="text-white font-semibold">Thompson Sampling AI</div>
                      <div className="text-white/60 text-xs">Reinforcement Learning Engine</div>
                    </div>
                  </motion.div>

                  {/* Animated learning progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Model Optimization</span>
                      <span>Active</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        animate={{ width: ["30%", "80%", "50%", "90%", "30%"] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="relative rounded-2xl overflow-hidden border-2 border-border/50 shadow-xl"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border/50">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-xs text-muted-foreground">Live Dashboard</div>
            </div>
            <Image
              src="/engagement-dashboard-screenshot.png"
              alt="Dashboard"
              width={1920}
              height={1080}
              className="w-full h-auto"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-xl aspect-video"
          >
            <Image src="/Gemini_Generated_Image_wihwe6wihwe6wihw.png" alt="AI System" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <span className="text-white text-sm font-medium">AI Learning Engine</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {floatingStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="p-3 rounded-xl border bg-card flex items-center gap-3"
              >
                <div className={cn("h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center", stat.color)}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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
          <div className="relative max-w-4xl mx-auto" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative mx-auto"
              style={{ width: "600px", height: "600px" }}
            >
              {/* Outer orbital ring - dashed */}
              <div
                className="absolute rounded-full border-2 border-dashed border-primary/20"
                style={{ top: "50px", left: "50px", right: "50px", bottom: "50px" }}
              />

              {/* Animated orbital ring */}
              <motion.div
                className="absolute rounded-full border-2 border-primary/40"
                style={{ top: "50px", left: "50px", right: "50px", bottom: "50px" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />

              {/* Inner glow */}
              <div
                className="absolute rounded-full bg-gradient-to-br from-primary/15 to-purple-500/15 blur-2xl"
                style={{ top: "150px", left: "150px", right: "150px", bottom: "150px" }}
              />

              {/* Center AI Brain - exactly at center */}
              <div
                className="absolute z-20"
                style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Pulsing ring */}
                  <motion.div
                    className="absolute rounded-full bg-primary/30"
                    style={{ width: "160px", height: "160px", top: "50%", left: "50%", marginTop: "-80px", marginLeft: "-80px" }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {/* Second pulsing ring */}
                  <motion.div
                    className="absolute rounded-full bg-purple-500/20"
                    style={{ width: "180px", height: "180px", top: "50%", left: "50%", marginTop: "-90px", marginLeft: "-90px" }}
                    animate={{ scale: [1.2, 1.6, 1.2], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  />
                  {/* Brain circle */}
                  <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-primary/40">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                </motion.div>
                {/* Label below - positioned separately */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap">
                  <span className="text-sm font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    AI Engine
                  </span>
                </div>
              </div>

              {/* Orbital Steps - positioned around the circle */}
              {steps.map((step, index) => {
                // Calculate exact positions on the orbit
                const angle = (index * 60 - 90) * (Math.PI / 180); // Start from top
                const orbitRadius = 200; // Distance from center in pixels
                const centerX = 300; // Center of 600px container
                const centerY = 300;
                const x = centerX + orbitRadius * Math.cos(angle);
                const y = centerY + orbitRadius * Math.sin(angle);

                return (
                  <motion.div
                    key={step.title}
                    className="absolute z-10"
                    style={{ left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    <motion.div
                      className="relative group cursor-pointer"
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Glow effect */}
                      <motion.div
                        className={cn("absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300", step.bgColor)}
                      />

                      {/* Step icon box */}
                      <div className={cn(
                        "relative w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                        step.color
                      )}>
                        <step.icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Number badge */}
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-background border-2 border-border flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </div>

                      {/* Label */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-center whitespace-nowrap">
                        <div className="font-semibold text-xs">{step.title}</div>
                        <div className="text-[10px] text-muted-foreground max-w-[90px] mx-auto leading-tight">
                          {step.description}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Animated particles circling */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/50"
                  style={{ top: "300px", left: "300px" }}
                  animate={{
                    x: [0, 200, 0, -200, 0],
                    y: [-200, 0, 200, 0, -200],
                  }}
                  transition={{
                    duration: 8,
                    delay: i * 2.67,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
            </motion.div>
          </div>
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
// INTELLIGENCE & IMPACT SECTION - Dynamic Flow with Animated Connections
// ============================================================================
function IntelligenceImpactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const anomalies = [
    { icon: AlertTriangle, title: "Sudden Drop", severity: "Critical", color: "text-red-500", gradientColor: "from-red-500 to-red-600" },
    { icon: TrendingUp, title: "Gradual Decline", severity: "Warning", color: "text-orange-500", gradientColor: "from-orange-500 to-orange-600" },
    { icon: Activity, title: "Low Engagement", severity: "Warning", color: "text-yellow-500", gradientColor: "from-yellow-500 to-yellow-600" },
    { icon: Users, title: "Mass Exit", severity: "Critical", color: "text-red-600", gradientColor: "from-red-600 to-red-700" },
  ];

  const metrics = [
    { label: "Engagement", value: 47, suffix: "%", prefix: "+", color: "text-green-500" },
    { label: "Drop-off", value: 62, suffix: "%", prefix: "-", color: "text-green-500" },
    { label: "Duration", value: 35, suffix: "%", prefix: "+", color: "text-green-500" },
    { label: "Success", value: 89, suffix: "%", prefix: "", color: "text-purple-500" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px]"
          animate={{ x: [0, 100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[150px]"
          animate={{ x: [0, -100, 0], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium rounded-full border"
            style={{ background: "linear-gradient(90deg, rgba(249,115,22,0.1) 0%, rgba(34,197,94,0.1) 100%)" }}
            animate={{ boxShadow: ["0 0 0 0 rgba(249,115,22,0)", "0 0 0 8px rgba(249,115,22,0.1)", "0 0 0 0 rgba(34,197,94,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            Intelligence & Impact
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="text-orange-500">Detect</span> Problems.{" "}
            <span className="text-green-500">Deliver</span> Results.
          </h2>
          <p className="text-lg text-muted-foreground">
            Real-time anomaly detection powers immediate intervention—watch the transformation unfold
          </p>
        </motion.div>

        {/* Desktop: Immersive Flow Design */}
        <div className="hidden lg:block">
          <div className="relative max-w-6xl mx-auto">
            {/* Animated Connection Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ minHeight: "500px" }}>
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <motion.path
                d="M 250 250 Q 500 150 750 250"
                stroke="url(#flowGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              {/* Animated particles along path */}
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  r="6"
                  fill="url(#flowGradient)"
                  initial={{ opacity: 0 }}
                  animate={isInView ? {
                    opacity: [0, 1, 1, 0],
                    offsetDistance: ["0%", "100%"],
                  } : { opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: 1 + i * 0.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ offsetPath: "path('M 250 250 Q 500 150 750 250')" }}
                />
              ))}
            </svg>

            <div className="grid grid-cols-2 gap-16 items-center relative">
              {/* Left: Detection Panel */}
              <motion.div
                initial={{ opacity: 0, x: -50, rotateY: -10 }}
                animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: -50, rotateY: -10 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="relative"
              >
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl blur-2xl" />

                <div className="relative rounded-2xl border-2 border-orange-500/30 bg-card overflow-hidden shadow-2xl">
                  {/* Header with pulsing indicator */}
                  <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-500/10 to-transparent border-b border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </motion.div>
                      <div>
                        <div className="font-semibold">Anomaly Detection</div>
                        <div className="text-xs text-muted-foreground">Real-time monitoring active</div>
                      </div>
                    </div>
                    <motion.div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      <span className="text-xs font-medium text-orange-500">SCANNING</span>
                    </motion.div>
                  </div>

                  {/* Anomaly Image with scan effect */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src="/Gemini_Generated_Image_wod3nrwod3nrwod3.png"
                      alt="Anomaly Detection"
                      fill
                      className="object-cover"
                    />
                    {/* Scan line */}
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  </div>

                  {/* Anomaly Cards with stagger animation */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      {anomalies.map((anomaly, index) => (
                        <motion.div
                          key={anomaly.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                          transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="relative p-3 rounded-xl border bg-background/50 backdrop-blur-sm cursor-pointer overflow-hidden group"
                        >
                          {/* Animated border glow on hover */}
                          <motion.div
                            className={cn("absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity rounded-xl", anomaly.gradientColor)}
                          />
                          <div className="relative flex items-center gap-3">
                            <div className={cn("h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center", anomaly.gradientColor)}>
                              <anomaly.icon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{anomaly.title}</div>
                              <motion.div
                                className={cn("text-xs font-semibold", anomaly.color)}
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                {anomaly.severity}
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Detection speed indicator */}
                    <motion.div
                      className="mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 border border-green-500/20"
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Detection in</span>
                      <motion.span
                        className="text-lg font-bold text-green-500"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        5s
                      </motion.span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Results Panel */}
              <motion.div
                initial={{ opacity: 0, x: 50, rotateY: 10 }}
                animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 50, rotateY: 10 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />

                <div className="relative rounded-2xl border-2 border-green-500/30 bg-card overflow-hidden shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-500/10 to-transparent border-b border-green-500/20">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      >
                        <TrendingUp className="h-5 w-5 text-white" />
                      </motion.div>
                      <div>
                        <div className="font-semibold">Engagement Transformed</div>
                        <div className="text-xs text-muted-foreground">AI interventions active</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-500">OPTIMIZED</span>
                    </div>
                  </div>

                  {/* Before/After with overlay labels */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src="/before_after.png"
                      alt="Before After"
                      fill
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

                    {/* Animated comparison labels */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between">
                      <motion.span
                        className="px-3 py-1.5 rounded-full bg-red-500/90 text-white text-xs font-medium backdrop-blur-sm"
                        initial={{ x: -20, opacity: 0 }}
                        animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        Without AI
                      </motion.span>
                      <motion.span
                        className="px-3 py-1.5 rounded-full bg-green-500/90 text-white text-xs font-medium backdrop-blur-sm"
                        initial={{ x: 20, opacity: 0 }}
                        animate={isInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        With AI Conductor
                      </motion.span>
                    </div>
                  </div>

                  {/* Animated Metrics */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      {metrics.map((metric, index) => (
                        <motion.div
                          key={metric.label}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.5, delay: 0.8 + index * 0.1, type: "spring" }}
                          whileHover={{ scale: 1.05 }}
                          className="relative p-4 rounded-xl border bg-background/50 backdrop-blur-sm text-center overflow-hidden group"
                        >
                          {/* Background pulse on hover */}
                          <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <motion.div
                            className={cn("text-3xl font-bold", metric.color)}
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ delay: 1 + index * 0.1 }}
                          >
                            {metric.prefix}{metric.value}{metric.suffix}
                          </motion.div>
                          <div className="text-xs text-muted-foreground mt-1">{metric.label}</div>

                          {/* Animated bar */}
                          <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={isInView ? { width: `${metric.value}%` } : { width: 0 }}
                              transition={{ duration: 1, delay: 1.2 + index * 0.1 }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Center floating action */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
            >
              <motion.div
                className="relative"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-green-500 rounded-full blur-xl opacity-50" />
              </motion.div>
              <motion.div
                className="relative w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 flex items-center justify-center shadow-2xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight className="h-10 w-10 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Detection Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="rounded-2xl border-2 border-orange-500/30 bg-card overflow-hidden"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-orange-500/10 to-transparent border-b border-orange-500/20 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">Detect</span>
            </div>
            <div className="relative h-32">
              <Image src="/Gemini_Generated_Image_wod3nrwod3nrwod3.png" alt="Detection" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {anomalies.map((a) => (
                <div key={a.title} className="flex items-center gap-2 p-2 rounded-lg border bg-background/50">
                  <a.icon className={cn("h-4 w-4", a.color)} />
                  <span className="text-xs font-medium">{a.title}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="flex justify-center py-2"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-b from-orange-500 to-green-500 flex items-center justify-center shadow-xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ChevronRight className="h-6 w-6 text-white rotate-90" />
            </motion.div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border-2 border-green-500/30 bg-card overflow-hidden"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-green-500/10 to-transparent border-b border-green-500/20 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Transform</span>
            </div>
            <div className="relative h-32">
              <Image src="/before_after.png" alt="Results" fill className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="p-3 grid grid-cols-4 gap-2">
              {metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <div className={cn("text-lg font-bold", m.color)}>{m.prefix}{m.value}{m.suffix}</div>
                  <div className="text-[9px] text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-12 text-center"
        >
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500/5 via-yellow-500/5 to-green-500/5 border backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6 text-amber-500" />
            </motion.div>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Engagement dips detected and corrected in seconds</span>
              <span className="text-muted-foreground"> — before attendees leave</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// INTERVENTIONS SECTION - Interactive Showcase Design
// ============================================================================
function InterventionsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const interventions = [
    {
      icon: BarChart3,
      title: "AI-Generated Polls",
      shortTitle: "Polls",
      description: "Contextually relevant polls generated based on session content and audience interests",
      example: '"What topic should we explore next?"',
      improvement: 12,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-500",
      lightBg: "bg-purple-500/10",
      textColor: "text-purple-500",
    },
    {
      icon: MessageSquare,
      title: "Smart Chat Prompts",
      shortTitle: "Chat",
      description: "Conversation starters that spark discussion and re-engage passive attendees",
      example: '"Share your biggest takeaway so far!"',
      improvement: 8,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500",
      lightBg: "bg-blue-500/10",
      textColor: "text-blue-500",
    },
    {
      icon: Bell,
      title: "Targeted Notifications",
      shortTitle: "Alerts",
      description: "Personalized alerts that bring attention back to key moments",
      example: '"Live Q&A starting now - ask your question!"',
      improvement: 5,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500",
      lightBg: "bg-amber-500/10",
      textColor: "text-amber-500",
    },
    {
      icon: Trophy,
      title: "Gamification Triggers",
      shortTitle: "Rewards",
      description: "Points, badges, and challenges that motivate continued participation",
      example: '"Bonus points for the next 5 questions!"',
      improvement: 15,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500",
      lightBg: "bg-green-500/10",
      textColor: "text-green-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

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
            Your AI Arsenal for Engagement Recovery
          </h2>
          <p className="text-lg text-muted-foreground">
            When attention drops, the AI deploys the right intervention at the right moment
          </p>
        </motion.div>

        {/* Desktop: Interactive Showcase */}
        <div className="hidden lg:block">
          <div className="relative max-w-6xl mx-auto">
            {/* Central engagement indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="relative">
                {/* Pulsing warning ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: "120px", height: "120px", marginLeft: "-60px", marginTop: "-60px", left: "50%", top: "50%" }}
                />
                {/* Recovery ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-500/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  style={{ width: "120px", height: "120px", marginLeft: "-60px", marginTop: "-60px", left: "50%", top: "50%" }}
                />
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 via-amber-500 to-green-500 flex items-center justify-center shadow-2xl">
                  <div className="w-20 h-20 rounded-full bg-background flex flex-col items-center justify-center">
                    <Activity className="w-6 h-6 text-foreground mb-1" />
                    <span className="text-xs font-medium">Engagement</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Intervention cards in 2x2 grid around center */}
            <div className="grid grid-cols-2 gap-x-32 gap-y-8">
              {interventions.map((intervention, index) => {
                const isLeft = index % 2 === 0;
                const isTop = index < 2;

                return (
                  <motion.div
                    key={intervention.title}
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -50 : 50 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className={cn(
                      "relative group",
                      isLeft ? "pr-16" : "pl-16",
                      !isTop && "mt-8"
                    )}
                  >
                    {/* Connection line to center */}
                    <div
                      className={cn(
                        "absolute top-1/2 h-0.5 bg-gradient-to-r",
                        isLeft
                          ? "right-0 w-16 from-transparent to-primary/30"
                          : "left-0 w-16 from-primary/30 to-transparent"
                      )}
                    />
                    {/* Animated pulse on line */}
                    <motion.div
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                        intervention.bgColor
                      )}
                      animate={{
                        x: isLeft ? [0, 64] : [-64, 0],
                        opacity: [1, 0],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.3 }}
                      style={{ [isLeft ? "right" : "left"]: 0 }}
                    />

                    <div className={cn(
                      "relative p-6 rounded-2xl border bg-card transition-all duration-300",
                      "hover:shadow-xl hover:border-primary/30 group-hover:scale-[1.02]"
                    )}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                          intervention.color
                        )}>
                          <intervention.icon className="h-7 w-7 text-white" />
                        </div>
                        {/* Impact badge */}
                        <div className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold",
                          intervention.lightBg,
                          intervention.textColor
                        )}>
                          <TrendingUp className="w-4 h-4" />
                          +{intervention.improvement}%
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {intervention.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {intervention.description}
                      </p>

                      {/* Example prompt */}
                      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                          Example
                        </div>
                        <p className="text-sm italic text-foreground/80">
                          {intervention.example}
                        </p>
                      </div>

                      {/* Impact bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Engagement Impact</span>
                          <span className={intervention.textColor}>+{intervention.improvement}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={cn("h-full rounded-full bg-gradient-to-r", intervention.color)}
                            initial={{ width: 0 }}
                            animate={isInView ? { width: `${intervention.improvement * 5}%` } : { width: 0 }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.15, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet: Stacked cards with visual impact */}
        <div className="lg:hidden space-y-6">
          {interventions.map((intervention, index) => (
            <motion.div
              key={intervention.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative p-5 rounded-2xl border bg-card overflow-hidden">
                {/* Gradient accent */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                  intervention.color
                )} />

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    intervention.color
                  )}>
                    <intervention.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{intervention.title}</h3>
                      <span className={cn(
                        "text-sm font-bold",
                        intervention.textColor
                      )}>
                        +{intervention.improvement}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {intervention.description}
                    </p>

                    {/* Impact bar */}
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full bg-gradient-to-r", intervention.color)}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${intervention.improvement * 5}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-lg font-bold text-green-500">+40%</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Combined engagement boost when AI selects the optimal intervention
            </span>
          </div>
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
      <PlatformShowcaseSection />
      <HowItWorksSection />
      <IntelligenceImpactSection />
      <InterventionsSection />
      <OperatingModesSection />
      <TransparencySection />
      <EnterpriseFeaturesSection />
      <CTASection />
    </div>
  );
}