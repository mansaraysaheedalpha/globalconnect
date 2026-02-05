// src/app/(public)/solutions/matchmaking/page.tsx
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
  Users,
  Heart,
  Target,
  Linkedin,
  Github,
  Twitter,
  Youtube,
  Instagram,
  Facebook,
  MessageSquare,
  Zap,
  MapPin,
  Bell,
  CheckCircle,
  TrendingUp,
  Clock,
  Shield,
  Activity,
  Briefcase,
  GraduationCap,
  Handshake,
  DollarSign,
  UserPlus,
  Search,
  Layers,
  Network,
  ChevronRight,
  Scan,
  Share2,
  Star,
  Award,
  Globe,
  RefreshCw,
  BarChart3,
  Lock,
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
        <source src="/Futuristic_Network_Visualization.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-purple-900/50 to-black/80 -z-10" />

      {/* Animated Gradient Orbs - subtle enhancement over video */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 text-sm font-medium">
            <Network className="h-4 w-4 text-cyan-400" />
            Smart Networking
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
            For Attendees
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-tight"
        >
          Meet the Right People at{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Every Event
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-full"
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
          Our AI analyzes profiles from 6 data sources, finds your perfect matches,
          and even suggests conversation starters—turning every event into a networking goldmine.
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
            <Link href="/contact?demo=matchmaking">
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
            { value: "6", label: "Data Sources" },
            { value: "0-100", label: "Match Score" },
            { value: "100m", label: "Proximity Range" },
            { value: "24h", label: "Fresh Recommendations" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
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
      icon: Users,
      stat: "76%",
      title: "Missed Connections",
      description: "of event attendees leave without meeting the people most relevant to their goals",
    },
    {
      icon: Clock,
      stat: "2.3hrs",
      title: "Wasted Time",
      description: "Average time spent on unproductive conversations at a single conference",
    },
    {
      icon: Search,
      stat: "89%",
      title: "No Discovery Tools",
      description: "of events provide no intelligent way to find relevant people to connect with",
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
            Networking Shouldn't Feel Like Finding a Needle in a Haystack
          </h2>
          <p className="text-lg text-muted-foreground">
            Traditional events leave you wandering, hoping to stumble into the right conversations.
            It's inefficient, exhausting, and often disappointing.
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
// PLATFORM SHOWCASE SECTION - Bento Grid
// ============================================================================
function PlatformShowcaseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const capabilities = [
    { icon: Brain, label: "AI-Powered Matching", color: "text-purple-500" },
    { icon: Scan, label: "Profile Enrichment", color: "text-cyan-500" },
    { icon: MapPin, label: "Proximity Discovery", color: "text-pink-500" },
    { icon: MessageSquare, label: "Conversation Starters", color: "text-green-500" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full">
            The Platform
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Your AI Networking Concierge
          </h2>
          <p className="text-lg text-muted-foreground">
            From deep profile analysis to real-time recommendations—see intelligent networking in action
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop Bento Grid */}
          <div className="hidden lg:grid grid-cols-12 grid-rows-6 gap-4 h-[700px]">
            {/* Main Dashboard - Large Left Panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="col-span-7 row-span-6 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative h-full rounded-2xl overflow-hidden border-2 border-border/50 bg-background shadow-2xl">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-background/50 text-xs text-muted-foreground">
                      app.eventdynamics.com/networking
                    </div>
                  </div>
                </div>
                <div className="relative h-[calc(100%-44px)] bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
                  {/* Mockup Recommendations UI */}
                  <div className="w-full max-w-md p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold text-lg">Your Top Matches</h3>
                      <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">AI-Powered</span>
                    </div>
                    {/* Match Cards */}
                    {[
                      { name: "Sarah Chen", role: "VP Engineering", score: 94, reason: "Shared: AI, Leadership" },
                      { name: "Marcus Johnson", role: "Startup Founder", score: 87, reason: "Both seeking: Investors" },
                      { name: "Emily Rodriguez", role: "Product Manager", score: 82, reason: "Attended same sessions" },
                    ].map((match, i) => (
                      <motion.div
                        key={match.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 0.5 + i * 0.15 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {match.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{match.name}</span>
                            <span className="text-xs text-green-400 font-bold">{match.score}%</span>
                          </div>
                          <div className="text-white/60 text-sm">{match.role}</div>
                          <div className="text-purple-300 text-xs mt-1">{match.reason}</div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Live Recommendations
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Visualization - Top Right */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="col-span-5 row-span-4 relative group"
            >
              <div className="h-full rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-slate-800 to-purple-900 shadow-xl relative p-6">
                {/* Network visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-full h-full opacity-30" viewBox="0 0 200 200">
                    {/* Central node */}
                    <circle cx="100" cy="100" r="8" fill="#a855f7" />
                    {/* Connected nodes */}
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                      const x = 100 + 60 * Math.cos((angle * Math.PI) / 180);
                      const y = 100 + 60 * Math.sin((angle * Math.PI) / 180);
                      return (
                        <g key={angle}>
                          <motion.line
                            x1="100" y1="100" x2={x} y2={y}
                            stroke="#06b6d4"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                          />
                          <motion.circle
                            cx={x} cy={y} r="5"
                            fill="#06b6d4"
                            initial={{ scale: 0 }}
                            animate={isInView ? { scale: 1 } : { scale: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-white font-semibold">Jaccard Similarity AI</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Intelligent matching that finds meaningful connections based on shared interests, goals, and context
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Capabilities Cards - Bottom Right */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="col-span-5 row-span-2 grid grid-cols-2 gap-4"
            >
              {capabilities.map((cap, index) => (
                <motion.div
                  key={cap.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex items-center gap-3 hover:border-primary/30 hover:bg-card transition-all"
                >
                  <div className={cn("h-10 w-10 rounded-lg bg-muted flex items-center justify-center", cap.color)}>
                    <cap.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{cap.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mobile/Tablet Stacked Layout */}
          <div className="lg:hidden space-y-6">
            {/* Main Visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden border-2 border-border/50 bg-gradient-to-br from-slate-900 to-purple-900 shadow-xl p-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Your Top Matches</h3>
                  <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">AI</span>
                </div>
                {[
                  { name: "Sarah Chen", role: "VP Engineering", score: 94 },
                  { name: "Marcus Johnson", role: "Startup Founder", score: 87 },
                ].map((match) => (
                  <div
                    key={match.name}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                      {match.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{match.name}</span>
                        <span className="text-xs text-green-400 font-bold">{match.score}%</span>
                      </div>
                      <div className="text-white/60 text-xs">{match.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Capabilities Grid */}
            <div className="grid grid-cols-2 gap-3">
              {capabilities.map((cap, index) => (
                <motion.div
                  key={cap.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                  className="rounded-xl border bg-card p-3 flex items-center gap-2"
                >
                  <cap.icon className={cn("h-5 w-5", cap.color)} />
                  <span className="text-xs font-medium">{cap.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create Profile",
      description: "Set your interests, goals, and what you're looking for",
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "02",
      icon: Scan,
      title: "AI Enrichment",
      description: "We analyze 6 platforms to build your comprehensive profile",
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "03",
      icon: Brain,
      title: "Smart Matching",
      description: "AI finds your ideal connections with match scores",
      color: "from-pink-500 to-rose-500",
    },
    {
      number: "04",
      icon: MessageSquare,
      title: "Conversation Starters",
      description: "Get personalized ice-breakers for every recommendation",
      color: "from-amber-500 to-orange-500",
    },
    {
      number: "05",
      icon: Handshake,
      title: "Connect & Meet",
      description: "Ping, message, or schedule meetings with your matches",
      color: "from-green-500 to-emerald-500",
    },
    {
      number: "06",
      icon: TrendingUp,
      title: "Track Outcomes",
      description: "Report connection outcomes to improve future matches",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
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
            From Profile to Perfect Match
          </h2>
          <p className="text-lg text-muted-foreground">
            A seamless journey from creating your profile to making meaningful connections
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line - Desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 via-pink-500 via-amber-500 via-green-500 to-indigo-500" />

            {/* Steps */}
            <div className="space-y-12 md:space-y-0">
              {steps.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -50 : 50 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={cn(
                      "relative md:flex items-center",
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    )}
                  >
                    {/* Content */}
                    <div className={cn(
                      "md:w-1/2 p-6 rounded-2xl border bg-card",
                      isEven ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
                    )}>
                      <div className={cn(
                        "flex items-center gap-3 mb-3",
                        isEven ? "md:flex-row-reverse" : "md:flex-row"
                      )}>
                        <div className={cn(
                          "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                          step.color
                        )}>
                          <step.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">STEP {step.number}</span>
                          <h3 className="text-lg font-semibold">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>

                    {/* Center node - Desktop only */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-4 border-primary z-10" />

                    {/* Empty space for opposite side */}
                    <div className="hidden md:block md:w-1/2" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PROFILE ENRICHMENT SECTION - Modern Data Flow Design
// ============================================================================
function ProfileEnrichmentSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const sources = [
    {
      icon: Linkedin,
      name: "LinkedIn",
      data: ["Experience", "Skills", "Endorsements"],
      color: "#0A66C2",
      angle: -60,
    },
    {
      icon: Github,
      name: "GitHub",
      data: ["Repos", "Languages", "Contributions"],
      color: "#333333",
      angle: 0,
    },
    {
      icon: Twitter,
      name: "Twitter/X",
      data: ["Interests", "Influence", "Topics"],
      color: "#000000",
      angle: 60,
    },
    {
      icon: Youtube,
      name: "YouTube",
      data: ["Content", "Expertise", "Reach"],
      color: "#FF0000",
      angle: 120,
    },
    {
      icon: Instagram,
      name: "Instagram",
      data: ["Brand", "Aesthetic", "Network"],
      color: "#E4405F",
      angle: 180,
    },
    {
      icon: Facebook,
      name: "Facebook",
      data: ["Connections", "Groups", "Interests"],
      color: "#1877F2",
      angle: 240,
    },
  ];

  const outputData = [
    "Professional Background",
    "Technical Skills",
    "Industry Interests",
    "Communication Style",
    "Network Strength",
    "Content Expertise",
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Glow effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
            <Scan className="h-4 w-4" />
            LangGraph AI Agent
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            We Know You Better Than You Think
          </h2>
          <p className="text-lg text-slate-400">
            Our AI agent autonomously searches 6 platforms, extracts key insights,
            and builds a rich profile that powers intelligent matchmaking.
          </p>
        </motion.div>

        {/* Main Visualization - Data Flow Pipeline */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop: Horizontal Flow */}
          <div className="hidden lg:block">
            <div className="relative flex items-center justify-between gap-8">
              {/* Left: Source Platforms */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.6 }}
                className="flex-1"
              >
                <div className="grid grid-cols-2 gap-3">
                  {sources.map((source, index) => (
                    <motion.div
                      key={source.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className="group relative"
                    >
                      <div className="relative p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
                        {/* Platform icon */}
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: source.color }}
                          >
                            <source.icon className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-semibold text-white text-sm">{source.name}</span>
                        </div>

                        {/* Data points */}
                        <div className="flex flex-wrap gap-1.5">
                          {source.data.map((item) => (
                            <span
                              key={item}
                              className="px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-slate-300"
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        {/* Animated pulse on hover */}
                        <motion.div
                          className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                          style={{ backgroundColor: source.color }}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Center: AI Processing Unit */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative flex-shrink-0"
              >
                {/* Animated data streams - Left */}
                <svg className="absolute -left-16 top-1/2 -translate-y-1/2 w-16 h-32" viewBox="0 0 60 120">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.circle
                      key={`left-${i}`}
                      cx="0"
                      cy={10 + i * 20}
                      r="3"
                      fill="#06b6d4"
                      initial={{ cx: 0, opacity: 0 }}
                      animate={isInView ? {
                        cx: [0, 60],
                        opacity: [0, 1, 1, 0],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "linear"
                      }}
                    />
                  ))}
                  {/* Connection lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={`line-left-${i}`}
                      x1="0"
                      y1={10 + i * 20}
                      x2="60"
                      y2="60"
                      stroke="rgba(6, 182, 212, 0.2)"
                      strokeWidth="1"
                    />
                  ))}
                </svg>

                {/* Central AI Core */}
                <div className="relative">
                  {/* Outer ring animation */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
                    style={{ width: 160, height: 160, margin: -20 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-purple-500/20"
                    style={{ width: 180, height: 180, margin: -30 }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Pulsing glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl"
                    style={{ width: 120, height: 120 }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* Core */}
                  <div className="relative w-[120px] h-[120px] rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500/50 flex flex-col items-center justify-center shadow-2xl shadow-cyan-500/20">
                    <Brain className="h-10 w-10 text-cyan-400 mb-1" />
                    <span className="text-xs font-semibold text-cyan-400">AI Engine</span>
                  </div>
                </div>

                {/* Animated data streams - Right */}
                <svg className="absolute -right-16 top-1/2 -translate-y-1/2 w-16 h-32" viewBox="0 0 60 120">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.circle
                      key={`right-${i}`}
                      cx="0"
                      cy="60"
                      r="3"
                      fill="#a855f7"
                      initial={{ cx: 0, opacity: 0 }}
                      animate={isInView ? {
                        cx: [0, 60],
                        cy: [60, 10 + i * 20],
                        opacity: [0, 1, 1, 0],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.8 + i * 0.3,
                        ease: "linear"
                      }}
                    />
                  ))}
                  {/* Connection lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={`line-right-${i}`}
                      x1="0"
                      y1="60"
                      x2="60"
                      y2={10 + i * 20}
                      stroke="rgba(168, 85, 247, 0.2)"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </motion.div>

              {/* Right: Enriched Profile Output */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex-1"
              >
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 backdrop-blur-sm">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Enriched Profile</h4>
                      <p className="text-xs text-slate-400">AI-generated insights</p>
                    </div>
                  </div>

                  {/* Output data items */}
                  <div className="space-y-2">
                    {outputData.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                        <span className="text-sm text-slate-300">{item}</span>
                        <motion.div
                          className="ml-auto h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${60 + Math.random() * 40}%` } : { width: 0 }}
                          transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                          style={{ maxWidth: 80 }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quality badge */}
                  <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Star className="h-4 w-4 text-green-400 fill-green-400" />
                    <span className="text-sm font-semibold text-green-400">Tier 1: Rich Profile</span>
                    <span className="text-xs text-green-400/70">(6/6 sources)</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile: Beautiful Vertical Flow */}
          <div className="lg:hidden">
            {/* Section Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              className="text-center mb-6"
            >
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Data Sources</span>
            </motion.div>

            {/* Source Platforms - Hexagonal-inspired Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              className="relative mb-8"
            >
              {/* Background glow for sources */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent rounded-3xl blur-xl" />

              <div className="relative grid grid-cols-3 gap-2 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm">
                {sources.map((source, index) => (
                  <motion.div
                    key={source.name}
                    initial={{ opacity: 0, scale: 0, rotate: -10 }}
                    animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -10 }}
                    transition={{ delay: 0.1 + index * 0.08, type: "spring", stiffness: 200 }}
                    className="relative group"
                  >
                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-slate-600 transition-all duration-300">
                      {/* Glow effect on each card */}
                      <motion.div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `radial-gradient(circle at center, ${source.color}20 0%, transparent 70%)`
                        }}
                      />

                      {/* Icon with ring */}
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          style={{ backgroundColor: source.color }}
                          animate={{
                            boxShadow: [
                              `0 0 0 0 ${source.color}40`,
                              `0 0 0 4px ${source.color}00`,
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                        />
                        <div
                          className="relative h-11 w-11 rounded-lg flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: source.color }}
                        >
                          <source.icon className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-white text-center">{source.name}</span>

                      {/* Mini data preview */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((dot) => (
                          <motion.div
                            key={dot}
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: source.color }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Animated Flow Connection */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={isInView ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="relative flex flex-col items-center"
              >
                {/* Flowing particles */}
                <div className="relative h-16 w-8">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400"
                      animate={{
                        y: [0, 64],
                        opacity: [0, 1, 1, 0],
                        scale: [0.5, 1, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "linear",
                      }}
                    />
                  ))}
                  {/* Static line */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-purple-500/50" />
                </div>
              </motion.div>
            </div>

            {/* AI Core - Enhanced Mobile Version */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                {/* Multiple orbital rings */}
                <motion.div
                  className="absolute rounded-full border border-cyan-500/20"
                  style={{ width: 120, height: 120, left: -20, top: -20 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute rounded-full border border-purple-500/15"
                  style={{ width: 140, height: 140, left: -30, top: -30 }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />

                {/* Pulsing glow layers */}
                <motion.div
                  className="absolute rounded-full bg-cyan-500/20 blur-2xl"
                  style={{ width: 100, height: 100, left: -10, top: -10 }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute rounded-full bg-purple-500/15 blur-xl"
                  style={{ width: 80, height: 80 }}
                  animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />

                {/* Core */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border-2 border-cyan-500/50 flex flex-col items-center justify-center shadow-2xl shadow-cyan-500/20">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Brain className="h-8 w-8 text-cyan-400" />
                  </motion.div>
                  <span className="text-[10px] font-bold text-cyan-400 mt-0.5">AI</span>
                </div>
              </div>
            </motion.div>

            {/* Animated Flow Connection - Down */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={isInView ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
                transition={{ delay: 0.8, duration: 0.3 }}
                className="relative flex flex-col items-center"
              >
                <div className="relative h-16 w-8">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-400"
                      animate={{
                        y: [0, 64],
                        opacity: [0, 1, 1, 0],
                        scale: [0.5, 1, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: 0.5 + i * 0.4,
                        ease: "linear",
                      }}
                    />
                  ))}
                  <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-green-500/50" />
                </div>
              </motion.div>
            </div>

            {/* Section Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center mb-4"
            >
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Enriched Output</span>
            </motion.div>

            {/* Output Card - Premium Mobile Design */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
              transition={{ delay: 1, type: "spring", stiffness: 100 }}
              className="relative"
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/30 via-cyan-500/20 to-green-500/30 blur-sm" />

              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/10 to-transparent" />

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <motion.div
                    className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  >
                    <Users className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-white">Enriched Profile</h4>
                    <p className="text-xs text-slate-400">AI-generated insights ready</p>
                  </div>
                </div>

                {/* Output data items with animations */}
                <div className="space-y-2 mb-5">
                  {outputData.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/30"
                    >
                      <motion.div
                        className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      />
                      <span className="text-sm text-slate-300 flex-1">{item}</span>
                      <motion.div
                        className="h-1.5 rounded-full bg-gradient-to-r from-purple-500/70 to-cyan-500/70"
                        initial={{ width: 0 }}
                        animate={isInView ? { width: 40 + index * 8 } : { width: 0 }}
                        transition={{ delay: 1.3 + index * 0.1, duration: 0.4 }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Quality badge - Prominent */}
                <motion.div
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/20"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0)",
                      "0 0 20px 2px rgba(34, 197, 94, 0.1)",
                      "0 0 0 0 rgba(34, 197, 94, 0)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="h-4 w-4 text-green-400 fill-green-400" />
                  <span className="text-sm font-bold text-green-400">Tier 1: Rich Profile</span>
                  <span className="text-xs text-green-400/60 ml-1">(6/6)</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <Zap className="h-5 w-5 text-cyan-400" />
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">Automatic enrichment</span>
              {" "}in the background — no manual input required
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MATCH QUALITY SECTION
// ============================================================================
function MatchQualitySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const matchReasons = [
    { icon: Briefcase, label: "Same Industry" },
    { icon: GraduationCap, label: "Shared Sessions" },
    { icon: Target, label: "Aligned Goals" },
    { icon: Users, label: "Mutual Connections" },
    { icon: MessageSquare, label: "Q&A Interactions" },
    { icon: Award, label: "Similar Expertise" },
  ];

  const goals = [
    { icon: GraduationCap, label: "Learn", color: "text-blue-500" },
    { icon: Network, label: "Network", color: "text-purple-500" },
    { icon: Briefcase, label: "Hire", color: "text-green-500" },
    { icon: Search, label: "Get Hired", color: "text-amber-500" },
    { icon: Handshake, label: "Find Partners", color: "text-pink-500" },
    { icon: DollarSign, label: "Find Investors", color: "text-emerald-500" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Match Score Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Circular Score Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="relative w-64 h-64"
                  initial={{ rotate: -90 }}
                  animate={{ rotate: -90 }}
                >
                  {/* Background circle */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/30"
                    />
                    <motion.circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="url(#score-gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      initial={{ strokeDashoffset: 283 }}
                      animate={isInView ? { strokeDashoffset: 283 * 0.06 } : { strokeDashoffset: 283 }}
                      transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
                {/* Score number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    94
                  </motion.span>
                  <span className="text-muted-foreground text-sm">Match Score</span>
                </div>
              </div>

              {/* Floating match reasons */}
              {matchReasons.map((reason, index) => {
                const angle = (index * 60 - 90) * (Math.PI / 180);
                const x = 50 + 42 * Math.cos(angle);
                const y = 50 + 42 * Math.sin(angle);
                return (
                  <motion.div
                    key={reason.label}
                    className="absolute"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div className="relative -translate-x-1/2 -translate-y-1/2 group">
                      <div className="h-10 w-10 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                        <reason.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-popover border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {reason.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-full">
              Smart Matching
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Every Match Score Has a Story
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We don't just show you a number. Every recommendation comes with detailed
              reasoning—shared sessions, aligned goals, mutual connections, and more.
            </p>

            {/* Goals Section */}
            <div className="mb-8">
              <h4 className="font-semibold mb-4">Match by Your Goals</h4>
              <div className="flex flex-wrap gap-3">
                {goals.map((goal) => (
                  <div
                    key={goal.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border hover:border-primary/30 transition-colors"
                  >
                    <goal.icon className={cn("h-4 w-4", goal.color)} />
                    <span className="text-sm font-medium">{goal.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation Starters Preview */}
            <div className="p-5 rounded-xl border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold">AI Conversation Starters</h4>
              </div>
              <div className="space-y-2">
                {[
                  "\"I noticed you both attended the AI in Healthcare session—what was your key takeaway?\"",
                  "\"You're both working on developer tools. Have you faced similar challenges with adoption?\"",
                ].map((starter, i) => (
                  <motion.p
                    key={i}
                    className="text-sm text-muted-foreground italic p-3 rounded-lg bg-muted/50"
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ delay: 1 + i * 0.2 }}
                  >
                    {starter}
                  </motion.p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PROXIMITY NETWORKING SECTION
// ============================================================================
function ProximityNetworkingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="order-2 lg:order-1"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-full">
              For In-Person & Hybrid Events
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Discover Who's Right Next to You
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              At physical events, our proximity networking uses real-time location to show
              you relevant people within 100 meters. Perfect for conference halls, expo floors,
              and networking lounges.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: MapPin,
                  title: "Real-Time Location",
                  description: "Redis GEO-powered tracking updates your position continuously",
                },
                {
                  icon: Bell,
                  title: "Proximity Alerts",
                  description: "Get notified when a top match is nearby—never miss a connection",
                },
                {
                  icon: Zap,
                  title: "Instant Pings",
                  description: "Send a ping to nearby matches with one tap to request a meetup",
                },
                {
                  icon: Lock,
                  title: "Privacy Controls",
                  description: "Go invisible anytime. You're always in control of your visibility",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Proximity Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="relative order-1 lg:order-2"
          >
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Radar-like visualization */}
              <div className="absolute inset-0">
                {/* Radar rings */}
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute rounded-full border border-pink-500/20"
                    style={{
                      inset: `${(ring - 1) * 15}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.2 + ring * 0.1 }}
                  />
                ))}

                {/* Radar sweep animation */}
                <motion.div
                  className="absolute inset-[5%] rounded-full overflow-hidden"
                  style={{
                    background: "conic-gradient(from 0deg, transparent 0deg, rgba(236, 72, 153, 0.2) 30deg, transparent 60deg)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Center point (You) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-pink-500"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">YOU</span>
                    </div>
                  </div>
                </div>

                {/* Nearby people */}
                {[
                  { x: 30, y: 25, score: 92, name: "SK", distance: "15m" },
                  { x: 70, y: 35, score: 87, name: "MJ", distance: "42m" },
                  { x: 25, y: 65, score: 78, name: "AR", distance: "68m" },
                  { x: 75, y: 70, score: 85, name: "LC", distance: "85m" },
                ].map((person, index) => (
                  <motion.div
                    key={person.name}
                    className="absolute"
                    style={{ left: `${person.x}%`, top: `${person.y}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.8 + index * 0.15 }}
                  >
                    <div className="relative -translate-x-1/2 -translate-y-1/2 group">
                      <motion.div
                        className="w-10 h-10 rounded-full bg-card border-2 border-cyan-500 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      >
                        <span className="font-medium text-xs">{person.name}</span>
                      </motion.div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        <div className="text-xs">
                          <span className="font-bold text-green-500">{person.score}% match</span>
                          <span className="text-muted-foreground"> · {person.distance} away</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Distance label */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-card border rounded-full text-sm">
                <span className="text-muted-foreground">Search radius:</span>{" "}
                <span className="font-semibold text-pink-500">100 meters</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CONNECTION TRACKING SECTION
// ============================================================================
function ConnectionTrackingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stages = [
    { label: "Recommended", icon: Sparkles, count: 10, color: "bg-purple-500" },
    { label: "Viewed", icon: Activity, count: 8, color: "bg-blue-500" },
    { label: "Pinged", icon: Bell, count: 5, color: "bg-amber-500" },
    { label: "Connected", icon: Handshake, count: 3, color: "bg-green-500" },
    { label: "Meeting Held", icon: Users, count: 2, color: "bg-emerald-500" },
  ];

  const connectionTypes = [
    { type: "PROXIMITY_PING", label: "Met in Person", icon: MapPin },
    { type: "DM_INITIATED", label: "Messaged First", icon: MessageSquare },
    { type: "SESSION_QA", label: "Q&A Interaction", icon: GraduationCap },
    { type: "MANUAL_EXCHANGE", label: "Exchanged Info", icon: Share2 },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
            Track Your Networking ROI
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            From First Ping to Business Outcome
          </h2>
          <p className="text-lg text-muted-foreground">
            Every connection is tracked through its journey. Know your conversion rates,
            identify your best networking strategies, and measure real business impact.
          </p>
        </motion.div>

        {/* Funnel Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="flex items-end justify-center gap-4 h-64">
            {stages.map((stage, index) => {
              const height = 100 - (index * 18);
              return (
                <motion.div
                  key={stage.label}
                  className="flex flex-col items-center"
                  initial={{ height: 0 }}
                  animate={isInView ? { height: "auto" } : { height: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div
                    className={cn("w-16 md:w-24 rounded-t-lg flex items-end justify-center pb-2 transition-all", stage.color)}
                    style={{ height: `${height}%` }}
                  >
                    <span className="text-white font-bold text-lg">{stage.count}</span>
                  </div>
                  <div className="mt-2 text-center">
                    <stage.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{stage.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Connection Types */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {connectionTypes.map((type) => (
            <motion.div
              key={type.type}
              variants={fadeInUp}
              className="p-4 rounded-xl border bg-card text-center hover:border-primary/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-muted mx-auto mb-3 flex items-center justify-center">
                <type.icon className="h-5 w-5 text-foreground" />
              </div>
              <h4 className="font-medium text-sm">{type.label}</h4>
            </motion.div>
          ))}
        </motion.div>

        {/* Insight Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500/5 via-background to-emerald-500/5 border">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <p className="text-sm md:text-base">
              <span className="font-semibold">Track connection strength</span>
              <span className="text-muted-foreground"> from WEAK → MODERATE → STRONG based on interactions</span>
            </p>
          </div>
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
    { icon: Shield, title: "Privacy First", description: "Opt-out anytime, data deletion on request" },
    { icon: Globe, title: "Event-Scoped", description: "Recommendations isolated per event" },
    { icon: RefreshCw, title: "24h Refresh", description: "Fresh recommendations every day" },
    { icon: BarChart3, title: "Analytics Export", description: "CSV/JSON export for all connection data" },
    { icon: Lock, title: "Visibility Controls", description: "Go invisible or limit who can see you" },
    { icon: Activity, title: "Real-Time Sync", description: "WebSocket-powered instant updates" },
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
            Built for Privacy, Scale, and Trust
          </h2>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade infrastructure with user privacy at its core
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-white/10 rounded-full blur-[100px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px]"
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
            <Heart className="h-4 w-4" />
            Start Making Meaningful Connections
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Transform Your Event Networking?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who've stopped wandering and started connecting.
            Let AI handle the matchmaking while you focus on building relationships.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-purple-700 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-xl"
              asChild
            >
              <Link href="/contact?demo=matchmaking">
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
              Privacy-first design
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
export default function MatchmakingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <PlatformShowcaseSection />
      <HowItWorksSection />
      <ProfileEnrichmentSection />
      <MatchQualitySection />
      <ProximityNetworkingSection />
      <ConnectionTrackingSection />
      <EnterpriseFeaturesSection />
      <CTASection />
    </div>
  );
}
