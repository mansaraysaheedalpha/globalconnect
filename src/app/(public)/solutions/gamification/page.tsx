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
  Sparkles,
  Trophy,
  Medal,
  Star,
  Users,
  Zap,
  Target,
  TrendingUp,
  Clock,
  MessageSquare,
  HelpCircle,
  BarChart2,
  Award,
  Crown,
  Flame,
  Heart,
  ThumbsUp,
  Gift,
  Gamepad2,
  Timer,
  Layers,
  Workflow,
  CheckCircle,
  ChevronRight,
  Wifi,
  Shield,
  Settings,
  BarChart3,
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
// ANIMATED POINTS DISPLAY - Shows floating point notifications
// ============================================================================
function AnimatedPoints() {
  const [points, setPoints] = useState<{ id: number; value: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPoint = {
        id: Date.now(),
        value: [5, 10, 15, 20, 25][Math.floor(Math.random() * 5)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
      };
      setPoints(prev => [...prev.slice(-5), newPoint]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {points.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -50 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute text-2xl font-bold"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
              +{point.value}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center text-center text-white overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 -z-10" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/30 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Floating Points Animation */}
      <AnimatedPoints />

      {/* Content */}
      <div className="container px-4 md:px-6 max-w-6xl relative z-10 py-20">
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
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
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-tight"
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
          className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-neutral-300 leading-relaxed"
        >
          Award points for every action, unlock achievements that create memorable moments,
          and ignite friendly competition with real-time leaderboards that keep attendees
          engaged from start to finish.
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
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "7+", label: "Point Actions" },
            { value: "3+", label: "Achievement Types" },
            { value: "<1s", label: "Update Speed" },
            { value: "∞", label: "Team Size" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">
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
// PROBLEM SECTION
// ============================================================================
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: Users,
      stat: "60%",
      title: "Passive Attendees",
      description: "of virtual event attendees never interact beyond watching—they attend but don't participate",
    },
    {
      icon: MessageSquare,
      stat: "12%",
      title: "Chat Participation",
      description: "Average rate of attendees who actively engage in chat without incentives or prompts",
    },
    {
      icon: Target,
      stat: "45%",
      title: "Networking Missed",
      description: "of attendees leave without making a single meaningful connection at virtual events",
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
            Why Most Events Feel Like One-Way Broadcasts
          </h2>
          <p className="text-lg text-muted-foreground">
            Without proper incentives, attendees default to passive consumption.
            No competition, no rewards, no reason to engage—just another forgettable webinar.
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
// POINTS SYSTEM SECTION
// ============================================================================
function PointsSystemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const pointActions = [
    { icon: MessageSquare, action: "Send a message", points: 10, color: "from-blue-500 to-cyan-500" },
    { icon: Heart, action: "React to message", points: 5, color: "from-pink-500 to-rose-500" },
    { icon: HelpCircle, action: "Ask a question", points: 20, color: "from-purple-500 to-indigo-500" },
    { icon: ThumbsUp, action: "Upvote question", points: 5, color: "from-green-500 to-emerald-500" },
    { icon: BarChart2, action: "Create a poll", points: 15, color: "from-amber-500 to-orange-500" },
    { icon: Target, action: "Vote in poll", points: 10, color: "from-cyan-500 to-teal-500" },
    { icon: Users, action: "Join waitlist", points: 5, color: "from-violet-500 to-purple-500" },
  ];

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
            Points System
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Every Action{" "}
            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
              Earns Rewards
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Transform mundane interactions into exciting opportunities. Every message, vote,
            and question brings attendees closer to the top of the leaderboard.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
        >
          {pointActions.map((item, index) => (
            <motion.div
              key={item.action}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className="h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br", item.color)}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <motion.div
                    className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent"
                    animate={isInView ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    +{item.points}
                  </motion.div>
                </div>
                <p className="font-medium">{item.action}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Visual Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Instant Feedback Loop</h3>
                <p className="text-muted-foreground max-w-md">
                  Watch points float up with every action. Attendees see their progress
                  immediately, creating an addictive engagement cycle.
                </p>
              </div>
              <div className="relative">
                <motion.div
                  className="flex items-center gap-4 px-6 py-4 rounded-xl bg-background border shadow-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">1,250</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                  <motion.span
                    className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-green-500 text-white text-sm font-bold shadow-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.3 }}
                  >
                    +20
                  </motion.span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// LEADERBOARD SECTION
// ============================================================================
function LeaderboardSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const leaderboardData = [
    { rank: 1, name: "Sarah Chen", points: 2450, avatar: "SC", change: "+3" },
    { rank: 2, name: "Mike Johnson", points: 2180, avatar: "MJ", change: "+1" },
    { rank: 3, name: "Emma Williams", points: 1950, avatar: "EW", change: "-1" },
    { rank: 4, name: "Alex Rivera", points: 1820, avatar: "AR", change: "+5" },
    { rank: 5, name: "You", points: 1650, avatar: "YO", isUser: true, change: "+2" },
  ];

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
              Real-Time{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Leaderboards
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Watch positions shift in real-time as attendees compete for the top spot.
              Nothing motivates participation like seeing your name climb the ranks.
            </p>

            <ul className="space-y-4">
              {[
                "Live ranking updates without page refresh",
                "Individual and team leaderboards",
                "Visual indicators for top 3 positions",
                "Current user rank always visible",
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
                <div className="px-6 py-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b flex items-center justify-between">
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

                {/* Entries */}
                <div className="divide-y">
                  {leaderboardData.map((entry, i) => (
                    <motion.div
                      key={entry.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className={cn(
                        "px-6 py-4 flex items-center gap-4 transition-colors",
                        entry.isUser && "bg-cyan-500/5"
                      )}
                    >
                      <div className="w-8 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold",
                        entry.rank === 1 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white" :
                        entry.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800" :
                        entry.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                        entry.isUser ? "bg-cyan-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {entry.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", entry.isUser && "text-cyan-500")}>
                            {entry.name}
                          </span>
                          {entry.isUser && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-500">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{entry.points.toLocaleString()}</div>
                        <div className="text-xs text-green-500">{entry.change} today</div>
                      </div>
                    </motion.div>
                  ))}
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
// ACHIEVEMENTS SECTION
// ============================================================================
function AchievementsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const achievements = [
    {
      icon: HelpCircle,
      name: "Question Asker",
      description: "Asked your first question",
      color: "from-purple-500 to-indigo-500",
      unlocked: true,
    },
    {
      icon: Star,
      name: "Engaged Attendee",
      description: "Earned 50+ points",
      color: "from-amber-500 to-orange-500",
      unlocked: true,
    },
    {
      icon: Target,
      name: "Super Voter",
      description: "Voted in 5+ polls",
      color: "from-cyan-500 to-blue-500",
      unlocked: false,
    },
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

        {/* Achievement Cards */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16"
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className={cn(
                "h-full rounded-2xl border p-8 text-center transition-all duration-300",
                achievement.unlocked
                  ? "bg-card hover:shadow-xl"
                  : "bg-muted/30 opacity-60"
              )}>
                {/* Badge */}
                <motion.div
                  className={cn(
                    "relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6",
                    achievement.color
                  )}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <achievement.icon className="h-10 w-10 text-white" />
                  {achievement.unlocked && (
                    <motion.div
                      className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 -z-10"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      style={{ padding: "2px" }}
                    />
                  )}
                </motion.div>

                <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
                <p className="text-muted-foreground text-sm">{achievement.description}</p>

                {achievement.unlocked && (
                  <motion.div
                    className="mt-4 inline-flex items-center gap-1 text-sm text-green-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Unlocked
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Celebration Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/20 bg-gradient-to-b from-purple-900/20 to-background p-8 text-center">
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
            >
              {/* Confetti effect */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "absolute w-2 h-2 rounded-full",
                    i % 3 === 0 ? "bg-amber-400" : i % 3 === 1 ? "bg-purple-400" : "bg-cyan-400"
                  )}
                  initial={{
                    x: "50%",
                    y: "50%",
                    opacity: 0
                  }}
                  animate={isInView ? {
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    opacity: [0, 1, 0],
                  } : {}}
                  transition={{
                    duration: 2,
                    delay: 1 + i * 0.05,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              ))}
            </motion.div>

            <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Full-Screen Celebrations</h3>
            <p className="text-muted-foreground">
              When attendees unlock achievements, they get a full-screen celebration
              with animated confetti and their badge prominently displayed.
            </p>
          </div>
        </motion.div>
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
          {/* Team Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl border bg-card overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-400" />
                    <span className="font-semibold">Team Standings</span>
                  </div>
                </div>

                <div className="divide-y">
                  {teams.map((team, i) => (
                    <motion.div
                      key={team.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="px-6 py-4 flex items-center gap-4"
                    >
                      <div className="w-8 text-center font-bold text-lg">
                        {i === 0 ? "🏆" : i === 1 ? "🥈" : "🥉"}
                      </div>
                      <div className={cn(
                        "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                        team.color
                      )}>
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">{team.members} members</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{team.points.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">total points</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
              combine their scores, and work together to claim the top spot—creating
              lasting connections along the way.
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
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
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
// INTEGRATION SECTION
// ============================================================================
function IntegrationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const integrations = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Points for every message and reaction",
    },
    {
      icon: HelpCircle,
      title: "Q&A Sessions",
      description: "Reward questions and upvotes",
    },
    {
      icon: BarChart2,
      title: "Polls & Quizzes",
      description: "Incentivize participation",
    },
    {
      icon: Users,
      title: "Networking",
      description: "Points for connections made",
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
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20">
            Seamless Integration
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Works With Everything{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Out of the Box
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No configuration needed. Gamification automatically tracks engagement
            across all platform features and awards points instantly.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
        >
          {integrations.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="text-center p-6 rounded-2xl border bg-card hover:shadow-lg transition-all"
            >
              <div className="h-14 w-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                <item.icon className="h-7 w-7 text-indigo-500" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
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
    {
      icon: Wifi,
      title: "WebSocket-Based",
      description: "Real-time updates via WebSocket connections—no polling, no lag",
    },
    {
      icon: Zap,
      title: "Sub-Second Updates",
      description: "Points and leaderboards update instantly across all connected clients",
    },
    {
      icon: Shield,
      title: "Transaction-Safe",
      description: "Database transactions prevent race conditions and ensure accurate scoring",
    },
    {
      icon: Settings,
      title: "Customizable Rules",
      description: "Define your own point values and achievement criteria",
    },
    {
      icon: Layers,
      title: "Scalable Architecture",
      description: "Built to handle thousands of concurrent participants",
    },
    {
      icon: BarChart3,
      title: "Analytics Ready",
      description: "Complete audit trail for engagement analytics and reporting",
    },
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
            Enterprise-grade infrastructure ensures reliable, real-time gamification
            at any scale.
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
              className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
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
            <Trophy className="h-16 w-16 text-yellow-300" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to Gamify Your Events?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of event organizers who have transformed passive attendees
            into engaged participants with our gamification engine.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-amber-600 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-lg"
              asChild
            >
              <Link href="/contact?demo=gamification">
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 h-14 px-8 text-lg"
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
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm"
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
      <PointsSystemSection />
      <LeaderboardSection />
      <AchievementsSection />
      <TeamSection />
      <IntegrationSection />
      <TechnicalSection />
      <CTASection />
    </main>
  );
}
