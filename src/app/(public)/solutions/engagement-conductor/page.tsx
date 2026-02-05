// src/app/(public)/solutions/engagement-conductor/page.tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Sparkles,
  Brain,
  Eye,
  AlertTriangle,
  CheckCircle,
  Check,
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
  User,
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

  // Engagement decline data points for the animated graph
  const engagementData = [100, 95, 88, 75, 60, 45, 33, 28, 25, 22];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-red-950/5 to-muted/30 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-500/8 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-[150px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.4, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Warning pattern */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,rgba(239,68,68,0.02)_40px,rgba(239,68,68,0.02)_80px)]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 rounded-full border border-red-500/20"
            animate={{ boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0)", "0 0 0 8px rgba(239, 68, 68, 0.1)", "0 0 0 0 rgba(239, 68, 68, 0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            The Problem
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            The Silent{" "}
            <span className="relative">
              <span className="text-red-500">Killer</span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>
            {" "}of Virtual Events
          </h2>
          <p className="text-lg text-muted-foreground">
            By the time you notice engagement dropping, it's already too late.
            Attendees have mentally checked out, and recovering their attention is an uphill battle.
          </p>
        </motion.div>

        {/* Main Content: Graph + Stats */}
        <div className="grid lg:grid-cols-5 gap-8 items-center max-w-6xl mx-auto">
          {/* Animated Engagement Decline Graph */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 relative"
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-red-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Typical Event Engagement</span>
                <motion.div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
                  <span className="text-xs font-medium text-red-500">Declining</span>
                </motion.div>
              </div>

              {/* SVG Graph */}
              <div className="relative h-48">
                <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="40"
                      y1={160 - (y / 100) * 140}
                      x2="390"
                      y2={160 - (y / 100) * 140}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Y-axis labels */}
                  {[0, 50, 100].map((y) => (
                    <text
                      key={y}
                      x="30"
                      y={165 - (y / 100) * 140}
                      textAnchor="end"
                      className="fill-muted-foreground text-[10px]"
                    >
                      {y}%
                    </text>
                  ))}

                  {/* Gradient fill under the line */}
                  <defs>
                    <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  <motion.path
                    d={`M 40 ${160 - (engagementData[0] / 100) * 140} ${engagementData.map((val, i) => `L ${40 + i * 38.9} ${160 - (val / 100) * 140}`).join(" ")} L 390 160 L 40 160 Z`}
                    fill="url(#engagementGradient)"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />

                  {/* Main line */}
                  <motion.path
                    d={`M 40 ${160 - (engagementData[0] / 100) * 140} ${engagementData.map((val, i) => `L ${40 + i * 38.9} ${160 - (val / 100) * 140}`).join(" ")}`}
                    fill="none"
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
                  />

                  {/* Data points */}
                  {engagementData.map((val, i) => (
                    <motion.circle
                      key={i}
                      cx={40 + i * 38.9}
                      cy={160 - (val / 100) * 140}
                      r="4"
                      fill="rgb(239, 68, 68)"
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                    />
                  ))}

                  {/* Danger zone indicator */}
                  <rect x="40" y={160 - (33 / 100) * 140} width="350" height={(33 / 100) * 140} fill="rgb(239, 68, 68)" fillOpacity="0.05" />
                  <line x1="40" y1={160 - (33 / 100) * 140} x2="390" y2={160 - (33 / 100) * 140} stroke="rgb(239, 68, 68)" strokeWidth="1" strokeDasharray="6 4" strokeOpacity="0.5" />
                  <text x="395" y={160 - (33 / 100) * 140 + 4} className="fill-red-500 text-[9px] font-medium">
                    Danger
                  </text>
                </svg>

                {/* Time labels */}
                <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[10px] text-muted-foreground">
                  <span>Start</span>
                  <span>15m</span>
                  <span>30m</span>
                  <span>45m</span>
                  <span>End</span>
                </div>
              </div>

              {/* Bottom stat */}
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average retention at end</span>
                <motion.span
                  className="text-2xl font-bold text-red-500"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 2 }}
                >
                  22%
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="lg:col-span-3 space-y-4">
            {[
              {
                icon: Users,
                stat: "67",
                suffix: "%",
                title: "Audience Drop-off",
                description: "of virtual event attendees leave before the event ends due to declining engagement",
                color: "red",
                delay: 0.3,
              },
              {
                icon: Clock,
                stat: "8",
                suffix: " min",
                title: "Attention Span",
                description: "Average time before attendees start disengaging without active interaction",
                color: "orange",
                delay: 0.5,
              },
              {
                icon: AlertTriangle,
                stat: "73",
                suffix: "%",
                title: "Too Late to Act",
                description: "of organizers only notice engagement issues after significant audience loss",
                color: "amber",
                delay: 0.7,
              },
            ].map((problem, index) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.6, delay: problem.delay }}
                className="group"
              >
                <div className={cn(
                  "relative rounded-2xl border p-5 transition-all duration-300 overflow-hidden",
                  "bg-card/80 backdrop-blur-sm hover:shadow-xl",
                  problem.color === "red" && "border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/10",
                  problem.color === "orange" && "border-orange-500/20 hover:border-orange-500/40 hover:shadow-orange-500/10",
                  problem.color === "amber" && "border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/10"
                )}>
                  {/* Animated background on hover */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10",
                      problem.color === "red" && "bg-gradient-to-r from-red-500/5 to-transparent",
                      problem.color === "orange" && "bg-gradient-to-r from-orange-500/5 to-transparent",
                      problem.color === "amber" && "bg-gradient-to-r from-amber-500/5 to-transparent"
                    )}
                  />

                  <div className="flex items-center gap-5">
                    {/* Icon with pulse effect */}
                    <div className="relative">
                      <motion.div
                        className={cn(
                          "absolute inset-0 rounded-xl blur-md",
                          problem.color === "red" && "bg-red-500/30",
                          problem.color === "orange" && "bg-orange-500/30",
                          problem.color === "amber" && "bg-amber-500/30"
                        )}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      />
                      <div className={cn(
                        "relative flex h-14 w-14 items-center justify-center rounded-xl",
                        problem.color === "red" && "bg-red-500/10",
                        problem.color === "orange" && "bg-orange-500/10",
                        problem.color === "amber" && "bg-amber-500/10"
                      )}>
                        <problem.icon className={cn(
                          "h-7 w-7",
                          problem.color === "red" && "text-red-500",
                          problem.color === "orange" && "text-orange-500",
                          problem.color === "amber" && "text-amber-500"
                        )} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1 mb-1">
                        <motion.span
                          className={cn(
                            "text-4xl font-bold tabular-nums",
                            problem.color === "red" && "text-red-500",
                            problem.color === "orange" && "text-orange-500",
                            problem.color === "amber" && "text-amber-500"
                          )}
                          initial={{ opacity: 0 }}
                          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ delay: problem.delay + 0.3 }}
                        >
                          {problem.stat}
                        </motion.span>
                        <span className={cn(
                          "text-2xl font-bold",
                          problem.color === "red" && "text-red-500",
                          problem.color === "orange" && "text-orange-500",
                          problem.color === "amber" && "text-amber-500"
                        )}>
                          {problem.suffix}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{problem.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{problem.description}</p>
                    </div>

                    {/* Progress indicator */}
                    <div className="hidden sm:block">
                      <svg className="w-16 h-16" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeOpacity="0.1"
                          strokeWidth="4"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke={problem.color === "red" ? "rgb(239, 68, 68)" : problem.color === "orange" ? "rgb(249, 115, 22)" : "rgb(245, 158, 11)"}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${parseFloat(problem.stat) * 1.76} 176`}
                          transform="rotate(-90 32 32)"
                          initial={{ strokeDasharray: "0 176" }}
                          animate={isInView ? { strokeDasharray: `${parseFloat(problem.stat) * 1.76} 176` } : { strokeDasharray: "0 176" }}
                          transition={{ duration: 1.5, delay: problem.delay + 0.2, ease: "easeOut" }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm text-muted-foreground">
              What if you could{" "}
              <span className="font-semibold text-foreground">detect and fix engagement issues</span>
              {" "}before they become critical?
            </span>
          </div>
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
          <div className="relative max-w-5xl mx-auto">
            {/* Main Dashboard - Centered with constrained width */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: 8 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 8 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10"
              style={{ perspective: "1200px" }}
            >
              {/* Glow behind */}
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-3xl blur-3xl opacity-70" />

              <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 bg-background shadow-[0_25px_80px_-15px_rgba(0,0,0,0.4)]">
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

                {/* Screenshot - constrained */}
                <div className="relative max-h-[500px] overflow-hidden">
                  <Image
                    src="/engagement-dashboard-screenshot.png"
                    alt="AI Engagement Conductor Dashboard"
                    width={1400}
                    height={800}
                    className="w-full h-auto object-cover object-top"
                    priority
                  />

                  {/* Animated scan line effect */}
                  <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent"
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Overlay gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>

            {/* Floating Stats Row - Below dashboard */}
            <motion.div
              className="flex justify-center gap-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {floatingStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="relative"
                >
                  <div className={cn(
                    "px-5 py-3 rounded-2xl bg-background/90 backdrop-blur-xl border shadow-lg",
                    "hover:shadow-xl transition-shadow cursor-pointer"
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
                  <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-15 blur-xl -z-10", stat.color)} />
                </motion.div>
              ))}
            </motion.div>

            {/* AI Card - Positioned to the right side, overlapping */}
            <motion.div
              initial={{ opacity: 0, x: 80, rotate: 4 }}
              animate={isInView ? { opacity: 1, x: 0, rotate: 2 } : { opacity: 0, x: 80, rotate: 4 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ rotate: 0, scale: 1.02, y: -4 }}
              className="absolute -bottom-4 right-8 w-[320px] z-20"
            >
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-black/90">
                <Image
                  src="/Gemini_Generated_Image_wihwe6wihwe6wihw.png"
                  alt="AI Learning System"
                  width={640}
                  height={400}
                  className="w-full h-auto opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                {/* Animated content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <motion.div
                    className="flex items-center gap-3 mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.div
                      className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="h-4 w-4 text-white" />
                    </motion.div>
                    <div>
                      <div className="text-white font-semibold text-sm">Thompson Sampling AI</div>
                      <div className="text-white/60 text-xs">Reinforcement Learning</div>
                    </div>
                  </motion.div>

                  {/* Animated learning progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Model Optimization</span>
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-green-400"
                      >
                        Active
                      </motion.span>
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
                // Calculate positions ON the orbital ring
                // Ring is at inset 50px in 600px container = radius of 250px from center
                const angle = (index * 60 - 90) * (Math.PI / 180); // Start from top
                const orbitRadius = 250; // Matches the ring exactly
                const centerX = 300;
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

              {/* Animated particles circling on the ring */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/50"
                  style={{ top: "300px", left: "300px" }}
                  animate={{
                    x: [0, 250, 0, -250, 0],
                    y: [-250, 0, 250, 0, -250],
                  }}
                  transition={{
                    duration: 10,
                    delay: i * 3.33,
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
// OPERATING MODES SECTION - Interactive Mode Selector with Animations
// ============================================================================
function OperatingModesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeMode, setActiveMode] = useState(1); // 0: Manual, 1: Semi-Auto, 2: Auto

  const modes = [
    {
      id: 0,
      name: "Manual",
      fullName: "Manual Mode",
      tagline: "Full Human Control",
      description: "You approve every action. AI provides recommendations with confidence scores, but you make all final decisions.",
      icon: Settings,
      color: "blue",
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-500/10 to-indigo-500/10",
      autonomy: 15,
      features: ["AI suggestions only", "Manual approval required", "Complete oversight"],
    },
    {
      id: 1,
      name: "Semi-Auto",
      fullName: "Semi-Auto Mode",
      tagline: "Collaborative Co-Pilot",
      description: "AI handles routine interventions automatically. High-impact decisions are escalated to you for approval.",
      icon: Users,
      color: "purple",
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      autonomy: 60,
      features: ["Auto low-risk actions", "Human escalation", "Balanced control"],
      recommended: true,
    },
    {
      id: 2,
      name: "Auto",
      fullName: "Autonomous Mode",
      tagline: "AI-Driven Excellence",
      description: "AI operates autonomously with real-time monitoring. You can override any decision at any time.",
      icon: Zap,
      color: "green",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-500/10 to-emerald-500/10",
      autonomy: 95,
      features: ["Full automation", "Real-time monitoring", "Override capability"],
    },
  ];

  const currentMode = modes[activeMode];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          key={activeMode}
          className={cn("absolute inset-0 bg-gradient-to-br opacity-30", currentMode.bgGradient)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20"
            animate={{ boxShadow: ["0 0 0 0 rgba(99, 102, 241, 0)", "0 0 0 8px rgba(99, 102, 241, 0.1)", "0 0 0 0 rgba(99, 102, 241, 0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Control Levels
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            You're Always{" "}
            <span className="relative">
              <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", currentMode.gradient)}>
                in Control
              </span>
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose your level of AI autonomy. Start supervised and increase automation as you build confidence.
          </p>
        </motion.div>

        {/* Mode Selector - Interactive Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          {/* Mode Pills */}
          <div className="relative flex justify-between items-center mb-8 px-4">
            {/* Connection Line */}
            <div className="absolute left-[12%] right-[12%] top-1/2 h-1 bg-border/50 rounded-full -translate-y-1/2" />

            {/* Animated Progress Line */}
            <motion.div
              className={cn("absolute left-[12%] top-1/2 h-1 rounded-full bg-gradient-to-r -translate-y-1/2", currentMode.gradient)}
              initial={{ width: "0%" }}
              animate={{ width: `${activeMode * 38}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />

            {modes.map((mode, index) => (
              <motion.button
                key={mode.id}
                onClick={() => setActiveMode(index)}
                className="relative z-10 flex flex-col items-center group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Pill */}
                <motion.div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                    "border-2 shadow-lg",
                    activeMode === index
                      ? cn("border-transparent bg-gradient-to-br text-white shadow-xl", mode.gradient)
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  )}
                  animate={activeMode === index ? {
                    boxShadow: [`0 0 0 0 ${mode.color === 'blue' ? 'rgba(59, 130, 246, 0)' : mode.color === 'purple' ? 'rgba(168, 85, 247, 0)' : 'rgba(34, 197, 94, 0)'}`,
                                `0 0 20px 4px ${mode.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' : mode.color === 'purple' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                                `0 0 0 0 ${mode.color === 'blue' ? 'rgba(59, 130, 246, 0)' : mode.color === 'purple' ? 'rgba(168, 85, 247, 0)' : 'rgba(34, 197, 94, 0)'}`]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <mode.icon className="w-7 h-7" />
                </motion.div>

                {/* Label */}
                <span className={cn(
                  "mt-3 text-sm font-semibold transition-colors",
                  activeMode === index ? "text-foreground" : "text-muted-foreground"
                )}>
                  {mode.name}
                </span>

                {/* Recommended Badge */}
                {mode.recommended && (
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-8 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-medium rounded-full"
                  >
                    Recommended
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Mode Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative rounded-3xl border-2 p-8 lg:p-10 overflow-hidden",
                "bg-gradient-to-br from-background via-background to-muted/30"
              )}
            >
              {/* Animated background glow */}
              <motion.div
                className={cn("absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 -z-10 bg-gradient-to-br", currentMode.gradient)}
                animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="grid lg:grid-cols-2 gap-10 items-center">
                {/* Left: Content */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white", currentMode.gradient)}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <currentMode.icon className="w-7 h-7" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold">{currentMode.fullName}</h3>
                      <p className={cn("text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent", currentMode.gradient)}>
                        {currentMode.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    {currentMode.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-3">
                    {currentMode.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br", currentMode.gradient)}>
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-foreground font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right: Autonomy Visualization */}
                <div className="relative">
                  {/* Autonomy Meter */}
                  <div className="bg-muted/50 rounded-2xl p-6 border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-muted-foreground">AI Autonomy Level</span>
                      <motion.span
                        key={currentMode.autonomy}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn("text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent", currentMode.gradient)}
                      >
                        {currentMode.autonomy}%
                      </motion.span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-4 rounded-full bg-muted overflow-hidden mb-6">
                      <motion.div
                        className={cn("h-full rounded-full bg-gradient-to-r", currentMode.gradient)}
                        initial={{ width: 0 }}
                        animate={{ width: `${currentMode.autonomy}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>

                    {/* Visual Indicators */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-background border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-muted-foreground">Human Effort</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={cn(
                                "w-3 h-3 rounded-full",
                                i < Math.round((100 - currentMode.autonomy) / 20) ? "bg-blue-500" : "bg-muted"
                              )}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-background border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-purple-500" />
                          <span className="text-xs font-medium text-muted-foreground">AI Autonomy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={cn(
                                "w-3 h-3 rounded-full",
                                i < Math.round(currentMode.autonomy / 20) ? "bg-purple-500" : "bg-muted"
                              )}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Activity Simulation */}
                    <div className="mt-6 p-4 rounded-xl bg-background/80 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-muted-foreground">Simulated Activity</span>
                        <motion.div
                          className="flex items-center gap-1.5"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs text-green-500">Live</span>
                        </motion.div>
                      </div>

                      <div className="space-y-2">
                        {["Intervention suggested", "Confidence: 87%", activeMode === 0 ? "Awaiting approval..." : activeMode === 1 ? "Auto-approved (low risk)" : "Executed automatically"].map((text, i) => (
                          <motion.div
                            key={text}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.15 }}
                            className="flex items-center gap-2 text-xs"
                          >
                            <motion.div
                              className={cn("w-1.5 h-1.5 rounded-full", i === 2 ? (activeMode === 0 ? "bg-amber-500" : "bg-green-500") : "bg-muted-foreground")}
                              animate={i === 2 && activeMode === 0 ? { opacity: [1, 0.3, 1] } : {}}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span className="text-muted-foreground">{text}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
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