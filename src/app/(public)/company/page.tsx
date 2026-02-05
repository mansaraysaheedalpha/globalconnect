// src/app/(public)/company/page.tsx
"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
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
  TrendingUp,
  Lightbulb,
  CheckCircle,
  Wifi,
  MessageSquare,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// HERO SECTION - Cinematic Full-Screen
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center text-white overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 -z-10" />

      {/* Large animated gradient orbs */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] bg-purple-500/20 rounded-full blur-[200px]"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] bg-amber-500/15 rounded-full blur-[180px]"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] bg-cyan-500/10 rounded-full blur-[250px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -150, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container px-4 md:px-6 max-w-5xl relative z-10">
        {/* Location badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
            <MapPin className="h-4 w-4 text-purple-400" />
            Freetown, Sierra Leone
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
            <Globe className="h-4 w-4 text-amber-400" />
            Built for Africa
          </span>
        </motion.div>

        {/* Main headline - single line with gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 px-2"
        >
          We're Building the Future of{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            Human Connection
          </span>
        </motion.h1>

        {/* Mission statement */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto text-lg md:text-xl text-white/70 leading-relaxed px-2"
        >
          <span className="text-white font-semibold">Our Mission:</span> To transform every event into the best networking opportunity of your life—powered by AI that understands, connects, and engages in real-time.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="group bg-white text-slate-900 hover:bg-white/90 h-12 px-8 text-base font-semibold shadow-2xl shadow-white/10"
            asChild
          >
            <Link href="/events">
              Explore Platform
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            className="bg-white/5 border border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base backdrop-blur-sm"
            asChild
          >
            <Link href="#story">
              <Sparkles className="mr-2 h-4 w-4" />
              Our Story
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator - traditional circle with dot */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
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
// ORIGIN STORY - Immersive Narrative Flow
// ============================================================================
function OriginStorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const chapters = [
    {
      number: "01",
      title: "The Spark",
      content: "It started with a simple observation: people want to connect. Real connections—the kind that change careers, spark partnerships, and create lifelong relationships.",
      highlight: "But where do these connections happen?",
      icon: Lightbulb,
      color: "text-amber-400",
    },
    {
      number: "02",
      title: "The Realization",
      content: "Events. Conferences, meetups, summits—these are where meaningful connections are made.",
      highlight: "But existing platforms treat networking as an afterthought.",
      icon: Users,
      color: "text-purple-400",
    },
    {
      number: "03",
      title: "The Vision",
      content: "Why settle for just another event app? We dreamed bigger. An all-in-one platform combining the best of Cvent, Hopin, Bizzabo, and Zoom Events.",
      highlight: "But smarter. With AI that actually helps people connect.",
      icon: Target,
      color: "text-cyan-400",
    },
    {
      number: "04",
      title: "Africa First",
      content: "We chose to build from Africa, for Africa first. Not because we can't compete globally—but because innovation shouldn't only flow one way.",
      highlight: "Africa deserves world-class technology built with its needs in mind.",
      icon: Globe,
      color: "text-green-400",
    },
  ];

  return (
    <section id="story" className="relative bg-background" ref={ref}>
      {/* Section header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-4"
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Our Story</span>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* Chapters */}
      {chapters.map((chapter, index) => (
        <ChapterBlock key={chapter.number} chapter={chapter} index={index} />
      ))}
    </section>
  );
}

function ChapterBlock({ chapter, index }: { chapter: any; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30%" });

  return (
    <div ref={ref} className="min-h-[70vh] flex items-center relative overflow-hidden">
      {/* Background gradient for each chapter */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
      >
        <div className={cn(
          "absolute w-[800px] h-[800px] rounded-full blur-[200px] opacity-20",
          index % 2 === 0 ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
          index === 0 && "bg-amber-500",
          index === 1 && "bg-purple-500",
          index === 2 && "bg-cyan-500",
          index === 3 && "bg-green-500",
        )} style={{ top: "50%", transform: `translateY(-50%) ${index % 2 === 0 ? 'translateX(-50%)' : 'translateX(50%)'}` }} />
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 py-24">
        <div className={cn(
          "grid lg:grid-cols-2 gap-16 items-center",
          index % 2 === 1 && "lg:grid-flow-col-dense"
        )}>
          {/* Number & Icon */}
          <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className={cn(
              "relative",
              index % 2 === 1 && "lg:col-start-2"
            )}
          >
            <span className="text-[12rem] md:text-[16rem] font-bold text-muted-foreground/10 leading-none select-none">
              {chapter.number}
            </span>
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-32 h-32 rounded-full border border-dashed border-muted-foreground/20" />
            </motion.div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <chapter.icon className={cn("w-16 h-16", chapter.color)} />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}
          >
            <h2 className={cn("text-4xl md:text-5xl font-bold mb-6", chapter.color)}>
              {chapter.title}
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-4">
              {chapter.content}
            </p>
            <p className="text-xl md:text-2xl font-semibold text-foreground">
              {chapter.highlight}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CAPABILITY NODE COMPONENT
// ============================================================================
interface CapabilityNodeProps {
  cap: {
    icon: React.ElementType;
    label: string;
    sublabel: string;
    color: string;
  };
  index: number;
  isInView: boolean;
}

function CapabilityNode({ cap, index, isInView }: CapabilityNodeProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="relative group cursor-pointer"
    >
      {/* Glow */}
      <div className={cn(
        "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50 blur-xl group-hover:opacity-80 transition-opacity",
        cap.color
      )} />

      {/* Node */}
      <div className={cn(
        "relative w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br flex flex-col items-center justify-center shadow-2xl",
        cap.color
      )}>
        <cap.icon className="w-7 h-7 md:w-8 md:h-8 text-white mb-1" />
        <span className="text-[10px] md:text-xs font-semibold text-white text-center leading-tight px-1">
          {cap.label}
        </span>
        <span className="text-[9px] md:text-[10px] text-white/80 text-center">
          {cap.sublabel}
        </span>
      </div>
    </motion.div>
  );
}

// ============================================================================
// WHAT WE BUILD - Animated Visual Diagram
// ============================================================================
function WhatWeBuildSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const capabilities = [
    { icon: Brain, label: "AI Engagement", sublabel: "Conductor", color: "from-purple-500 to-indigo-500" },
    { icon: Network, label: "Smart", sublabel: "Matchmaking", color: "from-pink-500 to-rose-500" },
    { icon: Wifi, label: "12+ Real-Time", sublabel: "Gateways", color: "from-cyan-500 to-blue-500" },
    { icon: MapPin, label: "Proximity", sublabel: "Networking", color: "from-green-500 to-emerald-500" },
    { icon: Activity, label: "Gamification", sublabel: "Engine", color: "from-amber-500 to-orange-500" },
    { icon: TrendingUp, label: "Lead", sublabel: "Scoring", color: "from-red-500 to-pink-500" },
  ];

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-950 to-background -z-10" />

      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-4xl mx-auto mb-24"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20"
          >
            <Zap className="h-4 w-4" />
            What We Build
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Not Another Event App
          </h2>
          <p className="text-xl md:text-2xl text-white/70">
            An intelligent operating system that combines Cvent + Hopin + Bizzabo + Zoom Events—
            <span className="text-white font-semibold">then adds AI that thinks.</span>
          </p>
        </motion.div>

        {/* Central visualization - Grid-based layout for reliability */}
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Grid container */}
          <div className="grid grid-cols-5 gap-4 md:gap-6 items-center justify-items-center py-8">
            {/* Row 1: AI Engagement at top center */}
            <div className="col-span-5 flex justify-center">
              <CapabilityNode cap={capabilities[0]} index={0} isInView={isInView} />
            </div>

            {/* Row 2: Lead Scoring (left) and Smart Matchmaking (right) */}
            <div className="col-span-2 flex justify-end w-full">
              <CapabilityNode cap={capabilities[5]} index={5} isInView={isInView} />
            </div>
            <div className="col-span-1" /> {/* Spacer */}
            <div className="col-span-2 flex justify-start w-full">
              <CapabilityNode cap={capabilities[1]} index={1} isInView={isInView} />
            </div>

            {/* Row 3: Center - Event Dynamics */}
            <div className="col-span-5 flex justify-center py-6">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                {/* Pulsing rings */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-48 md:h-48 rounded-full bg-white/10"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-48 md:h-48 rounded-full bg-white/5"
                  animate={{ scale: [1.2, 1.6, 1.2], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />

                {/* Core */}
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white mx-auto mb-1" />
                    <span className="text-xs md:text-sm font-semibold text-white">Event</span>
                    <span className="block text-[10px] md:text-xs text-white/70">Dynamics</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Row 4: Gamification (left) and 12+ Real-Time (right) */}
            <div className="col-span-2 flex justify-end w-full">
              <CapabilityNode cap={capabilities[4]} index={4} isInView={isInView} />
            </div>
            <div className="col-span-1" /> {/* Spacer */}
            <div className="col-span-2 flex justify-start w-full">
              <CapabilityNode cap={capabilities[2]} index={2} isInView={isInView} />
            </div>

            {/* Row 5: Proximity at bottom center */}
            <div className="col-span-5 flex justify-center">
              <CapabilityNode cap={capabilities[3]} index={3} isInView={isInView} />
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <Button asChild size="lg" className="group bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
            <Link href="/solutions/engagement-conductor">
              Explore All Solutions
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// DIFFERENTIATORS - Large Typography Blocks
// ============================================================================
function DifferentiatorsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const differentiators = [
    {
      stat: "5s",
      title: "AI That Actually Thinks",
      description: "Thompson Sampling reinforcement learning means our platform gets smarter with every event. It's not just automation—it's intelligence.",
      color: "text-purple-400",
      gradient: "from-purple-500/20",
    },
    {
      stat: "12+",
      title: "Real-Time Everything",
      description: "WebSocket gateways ensure nothing is delayed. Chat, Q&A, polls, notifications, gamification—all instant, all the time.",
      color: "text-amber-400",
      gradient: "from-amber-500/20",
    },
    {
      stat: "100+",
      title: "Africa-First, Global-Ready",
      description: "Built with African needs in mind—Paystack payments, mobile-first design, low-bandwidth optimization—but powerful enough for anywhere.",
      color: "text-green-400",
      gradient: "from-green-500/20",
    },
  ];

  return (
    <section ref={ref} className="relative">
      {/* Section header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-4"
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">What Sets Us Apart</span>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </motion.div>
        </div>
      </div>

      {differentiators.map((item, index) => (
        <DifferentiatorBlock key={item.title} item={item} index={index} />
      ))}
    </section>
  );
}

function DifferentiatorBlock({ item, index }: { item: any; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30%" });

  return (
    <div ref={ref} className="min-h-[60vh] flex items-center relative overflow-hidden border-b border-border/30">
      {/* Background gradient */}
      <motion.div
        className={cn("absolute inset-0 bg-gradient-to-r to-transparent -z-10", item.gradient)}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
      />

      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          {/* Stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <span className={cn("text-[8rem] md:text-[12rem] font-bold leading-none", item.color)}>
              {item.stat}
            </span>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h3 className="text-3xl md:text-5xl font-bold mb-6">{item.title}</h3>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
              {item.description}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CORE VALUES - Horizontal Scroll / Flow
// ============================================================================
function CoreValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const values = [
    { icon: Heart, title: "Connection First", description: "Everything we build serves human connection", color: "bg-rose-500" },
    { icon: Globe, title: "African Innovation", description: "Built in Africa, for the world", color: "bg-green-500" },
    { icon: Brain, title: "Intelligence Over Features", description: "Smart beats more, always", color: "bg-purple-500" },
    { icon: Zap, title: "Real-Time or Nothing", description: "Delay kills engagement", color: "bg-amber-500" },
    { icon: TrendingUp, title: "Relentless Improvement", description: "Yesterday's best is today's baseline", color: "bg-cyan-500" },
  ];

  return (
    <section ref={ref} className="py-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="max-w-3xl"
        >
          <span className="text-sm font-medium text-rose-400 uppercase tracking-widest mb-4 block">Our Values</span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            What We Believe
          </h2>
          <p className="text-xl text-muted-foreground">
            Not just words on a wall. The decisions we make every day.
          </p>
        </motion.div>
      </div>

      {/* Horizontal flowing values */}
      <div className="relative">
        <motion.div
          className="flex gap-8 px-4 md:px-6"
          initial={{ x: 0 }}
          animate={{ x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[...values, ...values].map((value, index) => (
            <motion.div
              key={`${value.title}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: (index % 5) * 0.1 }}
              className="flex-shrink-0 w-72 md:w-80"
            >
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0", value.color)}>
                  <value.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA SECTION - Cinematic
// ============================================================================
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section ref={ref} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-950 to-slate-950 -z-10" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[200px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[180px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white mb-10"
            animate={{ boxShadow: ["0 0 0 0 rgba(255,255,255,0)", "0 0 0 12px rgba(255,255,255,0.1)", "0 0 0 0 rgba(255,255,255,0)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Rocket className="h-4 w-4" />
            Join the Journey
          </motion.div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Ready to Transform<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              How You Connect?
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto font-light">
            Whether it's your first meetup or your hundredth conference,
            Event Dynamics makes it your best one yet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-slate-900 hover:bg-white/90 h-14 px-10 text-lg font-semibold shadow-2xl shadow-white/10"
              asChild
            >
              <Link href="/auth/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/5 border border-white/20 text-white hover:bg-white/10 h-14 px-10 text-lg"
              asChild
            >
              <Link href="/contact">
                <MessageSquare className="mr-2 h-5 w-5" />
                Talk to Us
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white/50 text-sm"
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Free forever plan
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Setup in minutes
            </span>
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
      <WhatWeBuildSection />
      <DifferentiatorsSection />
      <CoreValuesSection />
      <CTASection />
    </main>
  );
}
