// src/app/(public)/solutions/gamification/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Trophy,
  Medal,
  Star,
  Users,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  BarChart2,
  Award,
  Crown,
  Heart,
  ThumbsUp,
  Layers,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Wifi,
  Shield,
  Settings,
  BarChart3,
  Send,
  ArrowUp,
  Eye,
  MousePointer,
  Coffee,
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
// ANIMATED FLOATING POINTS - Enhanced with variety
// ============================================================================
function AnimatedFloatingPoints() {
  const [points, setPoints] = useState<{ id: number; value: number; x: number; y: number; color: string; size: string }[]>([]);

  const pointConfigs = [
    { value: 10, color: "from-blue-400 to-cyan-400", size: "text-xl" },
    { value: 20, color: "from-purple-400 to-pink-400", size: "text-2xl" },
    { value: 5, color: "from-green-400 to-emerald-400", size: "text-lg" },
    { value: 15, color: "from-amber-400 to-yellow-400", size: "text-2xl" },
    { value: 25, color: "from-rose-400 to-red-400", size: "text-3xl" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const config = pointConfigs[Math.floor(Math.random() * pointConfigs.length)];
      const newPoint = {
        id: Date.now(),
        value: config.value,
        x: Math.random() * 70 + 15,
        y: Math.random() * 50 + 25,
        color: config.color,
        size: config.size,
      };
      setPoints(prev => [...prev.slice(-8), newPoint]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {points.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8], y: -80 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className={cn("absolute font-bold", point.size)}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span className={cn("bg-gradient-to-r bg-clip-text text-transparent drop-shadow-2xl", point.color)}>
              +{point.value}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// LIVE DEMO PANEL - Interactive gamification demo
// ============================================================================
function LiveDemoPanel() {
  const [demoStep, setDemoStep] = useState(0);
  const [score, setScore] = useState(1180);
  const [rank, setRank] = useState(5);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showPointsFloat, setShowPointsFloat] = useState(false);
  const [floatPoints, setFloatPoints] = useState(0);

  useEffect(() => {
    const steps = [
      // Step 0: Send message
      () => {
        setShowPointsFloat(true);
        setFloatPoints(10);
        setTimeout(() => {
          setScore(prev => prev + 10);
          setShowPointsFloat(false);
        }, 800);
      },
      // Step 1: Ask question
      () => {
        setShowPointsFloat(true);
        setFloatPoints(20);
        setTimeout(() => {
          setScore(prev => prev + 20);
          setRank(4);
          setShowPointsFloat(false);
        }, 800);
      },
      // Step 2: Vote in poll
      () => {
        setShowPointsFloat(true);
        setFloatPoints(10);
        setTimeout(() => {
          setScore(prev => prev + 10);
          setShowPointsFloat(false);
        }, 800);
      },
      // Step 3: Achievement unlocked!
      () => {
        setShowAchievement(true);
        setTimeout(() => {
          setShowAchievement(false);
        }, 2500);
      },
    ];

    const interval = setInterval(() => {
      steps[demoStep]();
      setDemoStep(prev => (prev + 1) % steps.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [demoStep]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative max-w-md mx-auto lg:mx-0"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-purple-500/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-60" />

      {/* Demo Panel */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-black/60 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="h-2 w-2 rounded-full bg-green-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-white">Live Demo</span>
          </div>
          <span className="text-xs text-white/60">Gamification Engine</span>
        </div>

        {/* Score Display */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="relative">
                <motion.div
                  key={score}
                  initial={{ scale: 1.2, color: "#fbbf24" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  className="text-3xl font-bold text-white"
                >
                  {score.toLocaleString()}
                </motion.div>
                <div className="text-xs text-white/60">Total Points</div>

                {/* Floating points animation */}
                <AnimatePresence>
                  {showPointsFloat && (
                    <motion.div
                      initial={{ opacity: 0, y: 0, x: 20 }}
                      animate={{ opacity: 1, y: -30, x: 30 }}
                      exit={{ opacity: 0, y: -50 }}
                      className="absolute top-0 right-0 text-lg font-bold text-green-400"
                    >
                      +{floatPoints}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-400">
                {rank <= 3 ? <Crown className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
                <motion.span
                  key={rank}
                  initial={{ scale: 1.3, color: "#22c55e" }}
                  animate={{ scale: 1, color: "#fbbf24" }}
                  className="font-bold"
                >
                  #{rank}
                </motion.span>
              </div>
              <div className="text-xs text-white/60">Your Rank</div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="p-4 space-y-2">
          <div className="text-xs text-white/60 uppercase tracking-wider mb-3">Live Activity</div>

          {/* Activity items */}
          <motion.div
            animate={{ opacity: demoStep === 0 ? 1 : 0.5 }}
            className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
          >
            <Send className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-white/80 flex-1">Sent a message</span>
            <span className="text-xs font-bold text-blue-400">+10</span>
          </motion.div>

          <motion.div
            animate={{ opacity: demoStep === 1 ? 1 : 0.5 }}
            className="flex items-center gap-3 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20"
          >
            <HelpCircle className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-white/80 flex-1">Asked a question</span>
            <span className="text-xs font-bold text-purple-400">+20</span>
          </motion.div>

          <motion.div
            animate={{ opacity: demoStep === 2 ? 1 : 0.5 }}
            className="flex items-center gap-3 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
          >
            <BarChart2 className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-white/80 flex-1">Voted in poll</span>
            <span className="text-xs font-bold text-cyan-400">+10</span>
          </motion.div>
        </div>

        {/* Achievement Popup */}
        <AnimatePresence>
          {showAchievement && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center p-6">
                {/* Confetti particles */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "absolute w-2 h-2 rounded-full",
                      i % 3 === 0 ? "bg-amber-400" : i % 3 === 1 ? "bg-purple-400" : "bg-cyan-400"
                    )}
                    initial={{ x: "50%", y: "50%", opacity: 1 }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 100}%`,
                      y: `${50 + (Math.random() - 0.5) * 100}%`,
                      opacity: 0,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                ))}

                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="inline-block mb-4"
                >
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/50">
                      <Star className="h-10 w-10 text-white" />
                    </div>
                    <motion.div
                      className="absolute -inset-2 rounded-2xl border-2 border-amber-400"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-amber-400 font-bold text-lg">Achievement Unlocked!</div>
                  <div className="text-white text-xl font-bold mt-1">Engaged Attendee</div>
                  <div className="text-white/60 text-sm mt-1">Earned 50+ points</div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ============================================================================
// HERO SECTION - Enhanced with Interactive Demo
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center text-white overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        poster="/gamification_dashboard.png"
      >
        <source src="/game_hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-purple-900/60 to-black/80 -z-10" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-[150px]"
          animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-amber-500/25 rounded-full blur-[150px]"
          animate={{ x: [0, -80, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Floating Points Animation */}
      <AnimatedFloatingPoints />

      {/* Content */}
      <div className="container px-4 md:px-6 max-w-7xl relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-sm font-medium">
                <Trophy className="h-4 w-4 text-amber-400" />
                Engagement Booster
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 text-sm font-medium">
                <Zap className="h-4 w-4 text-cyan-400" />
                Real-Time
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
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              Turn Passive Attendees Into{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  Active Champions
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full"
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
              className="mt-6 max-w-xl text-lg md:text-xl text-neutral-300 leading-relaxed"
            >
              Award points for every action, unlock achievements that create memorable moments,
              and ignite friendly competition with real-time leaderboards.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="group bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold h-14 px-8 text-lg shadow-lg shadow-amber-500/25"
                asChild
              >
                <Link href="/contact?demo=gamification">
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
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              {[
                { value: "7+", label: "Point Actions" },
                { value: "3+", label: "Achievements" },
                { value: "<1s", label: "Updates" },
                { value: "∞", label: "Team Size" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Live Demo Panel */}
          <div className="hidden lg:block">
            <LiveDemoPanel />
          </div>
        </div>
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
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// PROBLEM SECTION - Immersive Dark Design with Disengaged Visualization
// ============================================================================
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: Users,
      stat: 60,
      suffix: "%",
      title: "Passive Attendees",
      description: "of virtual event attendees never interact beyond watching—they attend but don't participate",
      gradient: "from-red-500 to-orange-500",
    },
    {
      icon: MessageSquare,
      stat: 12,
      suffix: "%",
      title: "Chat Participation",
      description: "Average rate of attendees who actively engage in chat without incentives or prompts",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: Target,
      stat: 45,
      suffix: "%",
      title: "Networking Missed",
      description: "of attendees leave without making a single meaningful connection at virtual events",
      gradient: "from-amber-500 to-red-500",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-background relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.1, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50 -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30"
            animate={{ boxShadow: ["0 0 20px rgba(239,68,68,0.2)", "0 0 40px rgba(239,68,68,0.4)", "0 0 20px rgba(239,68,68,0.2)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            The Problem
          </motion.span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
            Why Most Events Feel Like{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                One-Way Broadcasts
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Without proper incentives, attendees default to passive consumption.
            No competition, no rewards, no reason to engage.
          </p>
        </motion.div>

        {/* Main Content - Disengaged Visualization + Stats */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Disengaged Attendees Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative max-w-lg mx-auto">
              {/* Glow effect behind image */}
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              {/* Image container with border */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-red-500/20 shadow-2xl shadow-red-500/10">
                <Image
                  src="/disengaged.png"
                  alt="Disengaged attendees at virtual events"
                  width={800}
                  height={800}
                  className="w-full h-auto"
                  priority
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              </div>

              {/* Floating warning badges */}
              <motion.div
                className="absolute top-4 right-4 md:top-8 md:right-8 px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-sm border border-red-400/50 text-white text-xs font-medium shadow-lg"
                animate={{ y: [0, -5, 0], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Eye className="h-3 w-3 inline mr-1" />
                Low Engagement
              </motion.div>
              <motion.div
                className="absolute bottom-8 left-2 md:bottom-12 md:left-4 px-3 py-1.5 rounded-full bg-orange-500/90 backdrop-blur-sm border border-orange-400/50 text-white text-xs font-medium shadow-lg"
                animate={{ y: [0, 5, 0], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
              >
                <Coffee className="h-3 w-3 inline mr-1" />
                Passive Viewing
              </motion.div>
              <motion.div
                className="absolute top-1/3 left-2 md:left-4 px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-sm border border-amber-400/50 text-white text-xs font-medium shadow-lg"
                animate={{ y: [0, -3, 0], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              >
                <MousePointer className="h-3 w-3 inline mr-1" />
                No Interaction
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Statistics Cards */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="space-y-6 order-1 lg:order-2"
          >
            {problems.map((problem, index) => (
              <motion.div
                key={problem.title}
                variants={fadeInUp}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-red-500/30 hover:bg-slate-900">
                  {/* Animated gradient line on left */}
                  <motion.div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b",
                      problem.gradient
                    )}
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.2 }}
                  />

                  <div className="flex items-start gap-4 md:gap-6">
                    {/* Icon with glow */}
                    <div className="relative shrink-0">
                      <div className={cn(
                        "w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                        problem.gradient
                      )}>
                        <problem.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                      </div>
                      <motion.div
                        className={cn(
                          "absolute inset-0 rounded-xl bg-gradient-to-br opacity-50 blur-lg -z-10",
                          problem.gradient
                        )}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-2">
                        <motion.span
                          className={cn(
                            "text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                            problem.gradient
                          )}
                          initial={{ opacity: 0 }}
                          animate={isInView ? { opacity: 1 } : {}}
                          transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                        >
                          {problem.stat}
                        </motion.span>
                        <span className={cn(
                          "text-lg md:text-xl font-semibold bg-gradient-to-r bg-clip-text text-transparent",
                          problem.gradient
                        )}>
                          {problem.suffix}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-white mb-1">
                        {problem.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {problem.description}
                      </p>
                    </div>

                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
                      <div className={cn(
                        "absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br opacity-10",
                        problem.gradient
                      )} style={{ transform: "rotate(45deg)" }} />
                    </div>
                  </div>

                  {/* Progress bar at bottom */}
                  <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full bg-gradient-to-r", problem.gradient)}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${problem.stat}%` } : {}}
                      transition={{ duration: 1.5, delay: 1 + index * 0.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Bottom CTA hint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="flex items-center justify-center gap-2 pt-4 text-slate-500"
            >
              <span className="text-sm">There's a better way</span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// POINTS SYSTEM SECTION - Visual Pipeline Flow
// ============================================================================
function PointsSystemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const userActions = [
    { icon: MessageSquare, label: "Send Message", points: 10, color: "bg-blue-500" },
    { icon: HelpCircle, label: "Ask Question", points: 20, color: "bg-purple-500" },
    { icon: BarChart2, label: "Vote in Poll", points: 10, color: "bg-cyan-500" },
    { icon: Heart, label: "React", points: 5, color: "bg-pink-500" },
  ];

  const [activeAction, setActiveAction] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; progress: number }[]>([]);

  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setActiveAction(prev => (prev + 1) % userActions.length);
      // Add new particle
      setParticles(prev => [
        ...prev.slice(-5),
        { id: Date.now(), x: 0, progress: 0 }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
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
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
            Points Engine
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            See How Points{" "}
            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
              Flow in Real-Time
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every action triggers our points engine—instantly updating scores,
            checking achievements, and refreshing leaderboards.
          </p>
        </motion.div>

        {/* Visual Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative">
            {/* Pipeline Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent rounded-3xl" />

            {/* Desktop Pipeline */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-11 gap-4 items-center py-12">
                {/* User Actions Column */}
                <div className="col-span-3 space-y-3">
                  {userActions.map((action, index) => (
                    <motion.div
                      key={action.label}
                      animate={{
                        scale: activeAction === index ? 1.05 : 1,
                        borderColor: activeAction === index ? "rgba(251, 191, 36, 0.5)" : "rgba(255,255,255,0.1)",
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border bg-card/50 backdrop-blur-sm transition-all",
                        activeAction === index && "shadow-lg shadow-amber-500/20"
                      )}
                    >
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", action.color)}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{action.label}</div>
                        <div className="text-xs text-muted-foreground">+{action.points} pts</div>
                      </div>
                      {activeAction === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-2 w-2 rounded-full bg-green-500"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Arrow 1 */}
                <div className="col-span-1 flex justify-center relative">
                  <div className="w-full h-1 bg-gradient-to-r from-amber-500/50 to-amber-500 rounded-full" />
                  {/* Animated particles */}
                  <AnimatePresence>
                    {particles.map(particle => (
                      <motion.div
                        key={particle.id}
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: "100%", opacity: [0, 1, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "linear" }}
                        className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"
                      />
                    ))}
                  </AnimatePresence>
                  <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                </div>

                {/* Points Engine */}
                <div className="col-span-3">
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                  >
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-purple-500/30 rounded-2xl blur-xl" />
                    <div className="relative p-6 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-purple-500/10 backdrop-blur-sm">
                      <div className="flex items-center justify-center mb-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
                        >
                          <Zap className="h-8 w-8 text-white" />
                        </motion.div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">Points Engine</div>
                        <div className="text-sm text-muted-foreground mt-1">Processing...</div>
                      </div>
                      {/* Processing indicators */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="h-1.5 w-1.5 rounded-full bg-green-500"
                          />
                          <span className="text-muted-foreground">Calculating points</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                            className="h-1.5 w-1.5 rounded-full bg-purple-500"
                          />
                          <span className="text-muted-foreground">Checking achievements</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Arrow 2 */}
                <div className="col-span-1 flex justify-center relative">
                  <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500/50 rounded-full" />
                  <AnimatePresence>
                    {particles.map(particle => (
                      <motion.div
                        key={`p2-${particle.id}`}
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: "100%", opacity: [0, 1, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "linear", delay: 0.8 }}
                        className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50"
                      />
                    ))}
                  </AnimatePresence>
                  <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500" />
                </div>

                {/* Results Column */}
                <div className="col-span-3 space-y-3">
                  {/* Leaderboard Update */}
                  <motion.div
                    animate={{
                      boxShadow: particles.length > 0
                        ? ["0 0 0 rgba(6, 182, 212, 0)", "0 0 20px rgba(6, 182, 212, 0.3)", "0 0 0 rgba(6, 182, 212, 0)"]
                        : "0 0 0 rgba(6, 182, 212, 0)"
                    }}
                    transition={{ duration: 1, delay: 1.5 }}
                    className="p-3 rounded-xl border bg-card/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-cyan-500 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Leaderboard</div>
                        <div className="text-xs text-green-500">Position updated!</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Achievement Check */}
                  <motion.div
                    animate={{
                      boxShadow: particles.length > 0
                        ? ["0 0 0 rgba(168, 85, 247, 0)", "0 0 20px rgba(168, 85, 247, 0.3)", "0 0 0 rgba(168, 85, 247, 0)"]
                        : "0 0 0 rgba(168, 85, 247, 0)"
                    }}
                    transition={{ duration: 1, delay: 1.8 }}
                    className="p-3 rounded-xl border bg-card/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Achievements</div>
                        <div className="text-xs text-muted-foreground">Checking milestones...</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Score Display */}
                  <motion.div
                    className="p-3 rounded-xl border bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">New Score</div>
                        <motion.div
                          key={activeAction}
                          initial={{ scale: 1.2, color: "#22c55e" }}
                          animate={{ scale: 1, color: "#fbbf24" }}
                          className="text-lg font-bold"
                        >
                          +{userActions[activeAction].points}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Mobile Pipeline */}
            <div className="lg:hidden">
              <div className="space-y-6 py-8">
                {/* User Actions */}
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-3">User Actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    {userActions.map((action, index) => (
                      <motion.div
                        key={action.label}
                        animate={{
                          scale: activeAction === index ? 1.02 : 1,
                          borderColor: activeAction === index ? "rgba(251, 191, 36, 0.5)" : "rgba(255,255,255,0.1)",
                        }}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border bg-card/50",
                          activeAction === index && "shadow-lg shadow-amber-500/20"
                        )}
                      >
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", action.color)}>
                          <action.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-xs">{action.label}</div>
                          <div className="text-xs text-amber-500">+{action.points}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Arrow Down */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronDown className="h-8 w-8 text-amber-500" />
                  </motion.div>
                </div>

                {/* Points Engine */}
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative mx-auto max-w-xs"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-purple-500/30 rounded-2xl blur-xl" />
                  <div className="relative p-4 rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-purple-500/10">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center"
                      >
                        <Zap className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <div className="font-bold">Points Engine</div>
                        <div className="text-xs text-muted-foreground">Processing in real-time</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Arrow Down */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronDown className="h-8 w-8 text-purple-500" />
                  </motion.div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg border bg-card/50 text-center">
                    <TrendingUp className="h-6 w-6 text-cyan-500 mx-auto mb-1" />
                    <div className="text-xs font-medium">Leaderboard</div>
                  </div>
                  <div className="p-2 rounded-lg border bg-card/50 text-center">
                    <Award className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                    <div className="text-xs font-medium">Achievements</div>
                  </div>
                  <div className="p-2 rounded-lg border bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-center">
                    <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                    <motion.div
                      key={activeAction}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-xs font-bold text-amber-500"
                    >
                      +{userActions[activeAction].points}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Point Cards Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Image container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10">
              <Image
                src="/point_cards.png"
                alt="Point actions and rewards system"
                width={1200}
                height={600}
                className="w-full h-auto"
                priority
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// PLATFORM SHOWCASE SECTION - Dashboard Preview
// ============================================================================
function PlatformShowcaseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-amber-500/5 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
            The Platform
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Powerful Dashboard,{" "}
            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
              Simple Experience
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Monitor engagement, track leaderboards, and celebrate achievements—all from one intuitive interface.
          </p>
        </motion.div>

        {/* Dashboard Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Browser frame */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-border/50 bg-background shadow-2xl">
              {/* Browser header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-background/50 text-xs text-muted-foreground flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    app.eventdynamics.com/gamification
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              <div className="relative">
                <Image
                  src="/gamification_dashboard.png"
                  alt="Gamification Dashboard"
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  priority
                />

                {/* Gradient fade at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
              </div>
            </div>
          </div>

          {/* Feature highlights below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: Trophy, label: "Live Leaderboards", color: "text-amber-500" },
              { icon: Award, label: "Achievement Tracking", color: "text-purple-500" },
              { icon: TrendingUp, label: "Real-time Stats", color: "text-cyan-500" },
              { icon: Users, label: "Team Management", color: "text-green-500" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-card/50 border"
              >
                <item.icon className={cn("h-5 w-5", item.color)} />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// LEADERBOARD SECTION - Enhanced with Animations
// ============================================================================
function LeaderboardSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [leaderboardData, setLeaderboardData] = useState([
    { rank: 1, name: "Sarah Chen", points: 2450, avatar: "SC", change: 0 },
    { rank: 2, name: "Mike Johnson", points: 2180, avatar: "MJ", change: 0 },
    { rank: 3, name: "Emma Williams", points: 1950, avatar: "EW", change: 0 },
    { rank: 4, name: "Alex Rivera", points: 1820, avatar: "AR", change: 0 },
    { rank: 5, name: "You", points: 1650, avatar: "YO", isUser: true, change: 0 },
  ]);

  const [recentGains, setRecentGains] = useState<{ id: number; name: string; points: number }[]>([]);
  const [showRankUp, setShowRankUp] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    // Simulate position changes
    const interval = setInterval(() => {
      setLeaderboardData(prev => {
        const newData = [...prev];
        // User gains points and might move up
        const userIndex = newData.findIndex(d => d.isUser);
        if (userIndex > 0 && Math.random() > 0.5) {
          const gained = Math.floor(Math.random() * 30) + 10;
          newData[userIndex].points += gained;
          newData[userIndex].change = gained;

          // Check if should swap
          if (newData[userIndex].points > newData[userIndex - 1].points) {
            const temp = { ...newData[userIndex - 1] };
            newData[userIndex - 1] = { ...newData[userIndex], rank: userIndex };
            newData[userIndex] = { ...temp, rank: userIndex + 1 };
            setShowRankUp(true);
            setTimeout(() => setShowRankUp(false), 2000);
          }
        }

        // Add to recent gains ticker
        const randomUser = newData[Math.floor(Math.random() * newData.length)];
        const gainedPoints = Math.floor(Math.random() * 20) + 5;
        setRecentGains(prev => [
          ...prev.slice(-4),
          { id: Date.now(), name: randomUser.name, points: gainedPoints }
        ]);

        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isInView]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-bold">#{rank}</span>;
  };

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full border border-cyan-500/20">
              Competition
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Watch Positions Shift{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                In Real-Time
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nothing motivates participation like seeing your name climb the ranks.
              Our live leaderboards update instantly, creating exciting competition.
            </p>

            <ul className="space-y-4">
              {[
                "Instant position updates via WebSocket",
                "Individual and team leaderboards",
                "Visual rank change notifications",
                "Live activity ticker",
              ].map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                  </div>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Leaderboard Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl border bg-card overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <span className="font-semibold">Live Leaderboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-green-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    Live
                  </div>
                </div>

                {/* Recent Gains Ticker */}
                <div className="px-4 md:px-6 py-2 bg-muted/30 border-b overflow-hidden">
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="h-3 w-3 text-amber-500 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <motion.div
                        className="flex gap-4 whitespace-nowrap"
                        animate={{ x: [0, -100] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      >
                        {recentGains.map(gain => (
                          <span key={gain.id} className="text-muted-foreground">
                            <span className="text-foreground font-medium">{gain.name}</span> earned{" "}
                            <span className="text-green-500">+{gain.points}</span>
                          </span>
                        ))}
                        {recentGains.length === 0 && (
                          <span className="text-muted-foreground">Waiting for activity...</span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Entries */}
                <div className="divide-y">
                  <AnimatePresence mode="popLayout">
                    {leaderboardData.map((entry, i) => (
                      <motion.div
                        key={entry.name}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={cn(
                          "px-4 md:px-6 py-4 flex items-center gap-3 md:gap-4 transition-colors relative",
                          entry.isUser && "bg-cyan-500/5"
                        )}
                      >
                        <div className="w-6 md:w-8 flex justify-center flex-shrink-0">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div className={cn(
                          "h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0",
                          entry.rank === 1 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white" :
                          entry.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800" :
                          entry.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                          entry.isUser ? "bg-cyan-500 text-white" : "bg-muted text-muted-foreground"
                        )}>
                          {entry.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-medium text-sm md:text-base truncate", entry.isUser && "text-cyan-500")}>
                              {entry.name}
                            </span>
                            {entry.isUser && (
                              <span className="px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs rounded-full bg-cyan-500/20 text-cyan-500 flex-shrink-0">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <motion.div
                            key={entry.points}
                            initial={{ scale: entry.change > 0 ? 1.2 : 1 }}
                            animate={{ scale: 1 }}
                            className="font-bold text-sm md:text-base"
                          >
                            {entry.points.toLocaleString()}
                          </motion.div>
                          {entry.change > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-green-500"
                            >
                              +{entry.change}
                            </motion.div>
                          )}
                        </div>

                        {/* Rank up notification */}
                        {entry.isUser && showRankUp && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: -20 }}
                            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 px-2 md:px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <ArrowUp className="h-3 w-3" />
                            <span className="hidden md:inline">Rank Up!</span>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ACHIEVEMENTS SECTION - Enhanced with Celebration Preview
// ============================================================================
function AchievementsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setShowCelebration(true), 1500);
    return () => clearTimeout(timer);
  }, [isInView]);

  const achievements = [
    { icon: HelpCircle, name: "Question Asker", description: "Asked your first question", color: "from-purple-500 to-indigo-500" },
    { icon: Star, name: "Engaged Attendee", description: "Earned 50+ points", color: "from-amber-500 to-orange-500" },
    { icon: Target, name: "Super Voter", description: "Voted in 5+ polls", color: "from-cyan-500 to-blue-500" },
    { icon: MessageSquare, name: "Chatterbox", description: "Sent 25+ messages", color: "from-pink-500 to-rose-500" },
    { icon: ThumbsUp, name: "Supporter", description: "Reacted 50+ times", color: "from-green-500 to-emerald-500" },
    { icon: Trophy, name: "Champion", description: "Reached #1 rank", color: "from-yellow-500 to-amber-500" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-500/5 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/20">
            Achievements
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Celebrate{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Every Milestone
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Transform achievements into unforgettable moments with full-screen celebrations,
            animated badges, and confetti that make attendees feel like champions.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Achievement Badge Showcase */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.name}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="h-full rounded-2xl border p-4 md:p-6 text-center transition-all duration-300 bg-card hover:shadow-xl">
                  {/* Badge */}
                  <motion.div
                    className={cn(
                      "relative mx-auto w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 md:mb-4",
                      achievement.color
                    )}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <achievement.icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
                    <motion.div
                      className={cn("absolute -inset-1 rounded-2xl bg-gradient-to-r -z-10", achievement.color)}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      style={{ opacity: 0.3 }}
                    />
                  </motion.div>

                  <h3 className="text-sm md:text-base font-bold mb-1">{achievement.name}</h3>
                  <p className="text-muted-foreground text-xs">{achievement.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Celebration Preview - Achievement Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mx-auto max-w-md"
          >
            {/* Glow behind image */}
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-amber-500/30 rounded-3xl blur-2xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Achievement Image */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
              <Image
                src="/achievement.png"
                alt="Achievement celebration screen"
                width={800}
                height={800}
                className="w-full h-auto"
                priority
              />

              {/* Animated overlay effects */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Confetti overlay animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "absolute w-2 h-2 rounded-full",
                      i % 4 === 0 ? "bg-amber-400" :
                      i % 4 === 1 ? "bg-purple-400" :
                      i % 4 === 2 ? "bg-cyan-400" : "bg-pink-400"
                    )}
                    initial={{
                      x: `${50 + (Math.random() - 0.5) * 30}%`,
                      y: "110%",
                      opacity: 0,
                    }}
                    animate={{
                      y: "-10%",
                      opacity: [0, 1, 1, 0],
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Caption */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
              className="text-center mt-6"
            >
              <div className="text-sm font-medium">Full-Screen Celebration</div>
              <div className="text-xs text-muted-foreground mt-1">
                Confetti, animations, and that winning feeling
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TEAM COMPETITION SECTION
// ============================================================================
function TeamSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const teams = [
    { name: "Team Alpha", members: 12, points: 8450, color: "from-red-500 to-orange-500" },
    { name: "Team Beta", members: 10, points: 7820, color: "from-blue-500 to-cyan-500" },
    { name: "Team Gamma", members: 11, points: 7340, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Team Competition Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              {/* Glow effect */}
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-green-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              {/* Image container */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-green-500/20 shadow-2xl shadow-green-500/10">
                <Image
                  src="/team.png"
                  alt="Team competition and collaboration"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  priority
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="order-1 lg:order-2"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20">
              Team Mode
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Competition Meets{" "}
              <span className="bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
                Collaboration
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Foster networking through team-based competition. Attendees join forces,
              combine their scores, and work together to claim the top spot.
            </p>

            <ul className="space-y-4">
              {[
                "Create and join teams with one click",
                "Collective scoring aggregates all member points",
                "Team rosters update in real-time",
                "Switch teams seamlessly during events",
              ].map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TECHNICAL FEATURES SECTION
// ============================================================================
function TechnicalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: Wifi, title: "WebSocket-Based", description: "Real-time updates via WebSocket—no polling, no lag" },
    { icon: Zap, title: "Sub-Second Updates", description: "Points and leaderboards update instantly" },
    { icon: Shield, title: "Transaction-Safe", description: "Database transactions prevent race conditions" },
    { icon: Settings, title: "Customizable Rules", description: "Define your own point values and criteria" },
    { icon: Layers, title: "Scalable Architecture", description: "Handle thousands of concurrent participants" },
    { icon: BarChart3, title: "Analytics Ready", description: "Complete audit trail for engagement reporting" },
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
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-full border border-slate-500/20">
            Technical Excellence
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent">
              Performance
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade infrastructure ensures reliable gamification at any scale.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="p-4 md:p-6 rounded-2xl border bg-card hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base mb-1">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
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
// CTA SECTION
// ============================================================================
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-yellow-400/30 rounded-full blur-[120px]"
        animate={{ x: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-500/30 rounded-full blur-[120px]"
        animate={{ x: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto text-white"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-6"
          >
            <Trophy className="h-12 w-12 md:h-16 md:w-16 text-yellow-300" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to Gamify Your Events?
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of event organizers who have transformed passive attendees
            into engaged participants.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-amber-600 hover:bg-white/90 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold shadow-lg"
              asChild
            >
              <Link href="/contact?demo=gamification">
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg"
              asChild
            >
              <Link href="/auth/register">
                Start Free Trial
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-white/60 text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              14-day free trial
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
export default function GamificationPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <ProblemSection />
      <PlatformShowcaseSection />
      <PointsSystemSection />
      <LeaderboardSection />
      <AchievementsSection />
      <TeamSection />
      <TechnicalSection />
      <CTASection />
    </main>
  );
}
