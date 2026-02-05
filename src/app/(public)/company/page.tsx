// src/app/(public)/company/page.tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Sparkles,
  Brain,
  Zap,
  Globe,
  Users,
  Heart,
  Target,
  Rocket,
  MapPin,
  Network,
  Shield,
  Clock,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  ChevronRight,
  Wifi,
  BarChart3,
  MessageSquare,
  Activity,
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

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center text-center text-white overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 -z-10" />

      {/* Animated mesh gradient */}
      <div className="absolute inset-0 -z-5">
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[200px]"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[180px]"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-500/10 rounded-full blur-[250px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container px-4 md:px-6 max-w-5xl relative z-10 py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-sm font-medium">
            <MapPin className="h-4 w-4 text-purple-400" />
            Freetown, Sierra Leone
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-sm font-medium">
            <Globe className="h-4 w-4 text-amber-400" />
            Built for Africa, Ready for the World
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-tight"
        >
          We're Building the Future of{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Human Connection
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </span>
        </motion.h1>

        {/* Mission Statement */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-neutral-300 leading-relaxed"
        >
          <span className="text-white font-semibold">Our Mission:</span>{" "}
          To transform every event into the best networking opportunity of your life—powered by AI that understands, connects, and engages in real-time.
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
            className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 px-8 text-lg shadow-lg shadow-purple-500/25"
            asChild
          >
            <Link href="/events">
              Explore the Platform
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 text-lg backdrop-blur-sm"
            asChild
          >
            <Link href="#our-story">
              <Play className="mr-2 h-5 w-5" />
              Our Story
            </Link>
          </Button>
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
// ORIGIN STORY SECTION
// ============================================================================
function OriginStorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const timeline = [
    {
      icon: Lightbulb,
      title: "The Spark",
      description: "It started with a simple observation: people want to connect. Real connections—the kind that change careers, spark partnerships, and create lifelong relationships. But where do these connections happen?",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Users,
      title: "The Realization",
      description: "Events. Conferences, meetups, summits—these are where meaningful connections are made. But existing platforms treat networking as an afterthought. We saw an opportunity to make it the main event.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Target,
      title: "The Vision",
      description: "Why settle for just another event app? We dreamed bigger. An all-in-one platform that combines the best of Cvent, Hopin, Bizzabo, and Zoom Events—but smarter, with AI that actually helps people connect.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Globe,
      title: "Africa First",
      description: "We chose to build from Africa, for Africa first. Not because we can't compete globally—but because innovation shouldn't only flow one way. Africa deserves world-class technology built with its needs in mind.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section id="our-story" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/20">
            <Sparkles className="h-4 w-4" />
            Our Story
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            From a Dream in Freetown to a{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Global Vision
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every great company starts with a problem worth solving. Ours began with a question:
            Why do so many people leave events without making the connections they came for?
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-purple-500 via-cyan-500 to-green-500 md:-translate-x-1/2" />

            {timeline.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                className={cn(
                  "relative flex items-start gap-6 md:gap-0 mb-12 last:mb-0",
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                )}
              >
                {/* Icon */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10">
                  <motion.div
                    className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                      item.color
                    )}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <item.icon className="h-8 w-8 text-white" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className={cn(
                  "ml-24 md:ml-0 md:w-1/2",
                  index % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"
                )}>
                  <div className="bg-card rounded-2xl border p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
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
// WHAT WE DO SECTION
// ============================================================================
function WhatWeDoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const capabilities = [
    {
      icon: Brain,
      title: "AI Engagement Conductor",
      description: "Autonomous AI that monitors engagement in real-time, detects drops before they happen, and intervenes intelligently.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Network,
      title: "Smart Matchmaking",
      description: "AI-powered networking that enriches profiles from 6+ platforms and connects the right people at the right time.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Wifi,
      title: "12+ Real-Time Gateways",
      description: "True WebSocket infrastructure—chat, Q&A, polls, notifications, proximity—all instant, all the time.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: MapPin,
      title: "Proximity Networking",
      description: "GPS-powered discovery that tells you who's nearby and worth meeting at in-person events.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Intent-Based Lead Scoring",
      description: "AI classifies leads as Hot, Warm, or Cold in real-time, with instant alerts for sponsors.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Activity,
      title: "Gamification Engine",
      description: "Points, badges, leaderboards, and team competitions that transform passive attendees into active participants.",
      color: "from-red-500 to-pink-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full border border-cyan-500/20">
            <Zap className="h-4 w-4" />
            What We Build
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Not Just Another Event Platform—An{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Intelligent Operating System
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We combined the best of Cvent, Hopin, Bizzabo, and Zoom Events—then added AI that actually thinks.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {capabilities.map((capability) => (
            <motion.div
              key={capability.title}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <div className={cn(
                  "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-5",
                  capability.color
                )}>
                  <capability.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{capability.title}</h3>
                <p className="text-muted-foreground">{capability.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Button asChild size="lg" variant="outline" className="group">
            <Link href="/solutions/engagement-conductor">
              Explore All Solutions
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// DIFFERENTIATORS SECTION
// ============================================================================
function DifferentiatorsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const differentiators = [
    {
      title: "AI That Actually Thinks",
      description: "Thompson Sampling reinforcement learning means our platform gets smarter with every event. It's not just automation—it's intelligence.",
      icon: Brain,
      stat: "5s",
      statLabel: "Detection Speed",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      title: "Real-Time Everything",
      description: "12+ WebSocket gateways ensure nothing is delayed. Chat, Q&A, polls, notifications, gamification—all instant.",
      icon: Zap,
      stat: "12+",
      statLabel: "Live Gateways",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Africa-First, Global-Ready",
      description: "Built with African needs in mind—Paystack payments, mobile-first design, low-bandwidth optimization—but powerful enough for anywhere.",
      icon: Globe,
      stat: "100+",
      statLabel: "Languages",
      gradient: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-background -z-10" />
      <div className="absolute inset-0 -z-5">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
            <Target className="h-4 w-4" />
            What Sets Us Apart
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            We Don't Just Host Events—We{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Transform Them
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Other platforms give you tools. We give you an intelligent system that works alongside you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="relative group"
            >
              <div className="h-full rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-slate-600 hover:bg-slate-900/80">
                {/* Gradient line at top */}
                <motion.div
                  className={cn("absolute top-0 left-6 right-6 h-1 rounded-full bg-gradient-to-r", item.gradient)}
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.15 }}
                />

                {/* Icon */}
                <div className={cn(
                  "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6",
                  item.gradient
                )}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">{item.description}</p>

                {/* Stat */}
                <div className="pt-6 border-t border-slate-700/50">
                  <div className={cn("text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent", item.gradient)}>
                    {item.stat}
                  </div>
                  <div className="text-sm text-slate-500">{item.statLabel}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CORE VALUES SECTION
// ============================================================================
function CoreValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const values = [
    {
      icon: Heart,
      title: "Connection First",
      description: "Everything we build serves human connection. Features don't matter if they don't bring people together.",
      color: "bg-rose-500",
    },
    {
      icon: Globe,
      title: "African Innovation, Global Standards",
      description: "Built in Africa, for the world. We prove that world-class technology can come from anywhere.",
      color: "bg-green-500",
    },
    {
      icon: Brain,
      title: "Intelligence Over Features",
      description: "Smart beats more. We'd rather have one brilliant AI-powered feature than ten mediocre ones.",
      color: "bg-purple-500",
    },
    {
      icon: Zap,
      title: "Real-Time or Nothing",
      description: "If it's not instant, it's not good enough. Delay kills engagement, and we refuse to accept that.",
      color: "bg-amber-500",
    },
    {
      icon: TrendingUp,
      title: "Relentless Improvement",
      description: "Our AI learns from every event. So do we. Yesterday's best is today's baseline.",
      color: "bg-cyan-500",
    },
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
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full border border-rose-500/20">
            <Heart className="h-4 w-4" />
            Our Values
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            What We{" "}
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Believe In
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            These aren't just words on a wall. They're the decisions we make every day.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              variants={fadeInUp}
              className={cn(
                "group relative",
                index === values.length - 1 && "lg:col-start-2"
              )}
            >
              <div className="h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                {/* Icon */}
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-white",
                    value.color
                  )}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <value.icon className="h-6 w-6" />
                </motion.div>

                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
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
// STATS SECTION
// ============================================================================
function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { value: "12+", label: "Real-Time Gateways", description: "WebSocket connections" },
    { value: "100+", label: "Languages", description: "AI Translation Support" },
    { value: "5s", label: "Detection Speed", description: "Engagement Monitoring" },
    { value: "6", label: "Data Sources", description: "Profile Enrichment" },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
        animate={{ x: [0, 60], y: [0, 60] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              className="text-center text-white"
            >
              <motion.div
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1, type: "spring" }}
              >
                {stat.value}
              </motion.div>
              <div className="font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-white/70">{stat.description}</div>
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
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 -z-10" />
      <div className="absolute inset-0 -z-5">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto text-white"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-8"
            animate={{ boxShadow: ["0 0 0 0 rgba(255,255,255,0)", "0 0 0 8px rgba(255,255,255,0.1)", "0 0 0 0 rgba(255,255,255,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Rocket className="h-4 w-4" />
            Join the Journey
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to Transform How You{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Experience Events?
            </span>
          </h2>

          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Whether you're organizing your first meetup or your hundredth conference,
            Event Dynamics is ready to make it your best one yet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-purple-700 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-xl"
              asChild
            >
              <Link href="/auth/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 text-lg backdrop-blur-sm"
              asChild
            >
              <Link href="/contact">
                <MessageSquare className="mr-2 h-5 w-5" />
                Contact Us
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Free forever plan available
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Setup in minutes
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
export default function CompanyPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <OriginStorySection />
      <WhatWeDoSection />
      <DifferentiatorsSection />
      <CoreValuesSection />
      <StatsSection />
      <CTASection />
    </main>
  );
}
