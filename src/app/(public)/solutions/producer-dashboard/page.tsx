// src/app/(public)/solutions/producer-dashboard/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Sparkles,
  Radio,
  Activity,
  Monitor,
  Users,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  Eye,
  Video,
  Bell,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Layers,
  Command,
  Film,
  Clapperboard,
  Camera,
  Wifi,
  SlidersHorizontal,
  HelpCircle,
  ThumbsUp,
  Bot,
  Cpu,
  Timer,
  Headphones,
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
// LIVE ENGAGEMENT METER
// ============================================================================
function LiveEngagementMeter({ value = 78 }: { value?: number }) {
  const [score, setScore] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setScore(value);
        clearInterval(interval);
      } else {
        setScore(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [isInView, value]);

  const getColor = (score: number) => {
    if (score >= 70) return "from-emerald-500 to-green-500";
    if (score >= 40) return "from-amber-500 to-yellow-500";
    return "from-red-500 to-orange-500";
  };

  return (
    <div ref={ref} className="relative">
      <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full bg-gradient-to-r rounded-full", getColor(score))}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-400">
        <span>Low</span>
        <span className="font-bold text-white">{score}%</span>
        <span>High</span>
      </div>
    </div>
  );
}

// ============================================================================
// LIVE SESSION CARD (Command Center Style)
// ============================================================================
function LiveSessionCard({ session, index }: { session: { name: string; viewers: number; status: string; engagement: number }; index: number }) {
  const [viewers, setViewers] = useState(session.viewers);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 10) - 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative rounded-xl border border-slate-700 bg-slate-900/80 p-4 backdrop-blur-sm"
    >
      {/* Live Indicator */}
      {session.status === "live" && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <motion.div
            className="h-2 w-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs font-bold text-red-400 uppercase">Live</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
          session.status === "live" ? "bg-red-500/20" : "bg-slate-800"
        )}>
          <Video className={cn("h-5 w-5", session.status === "live" ? "text-red-400" : "text-slate-500")} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{session.name}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {viewers.toLocaleString()}
            </span>
            <span className={cn(
              "px-1.5 py-0.5 rounded text-xs font-medium",
              session.engagement >= 70 ? "bg-emerald-500/20 text-emerald-400" :
              session.engagement >= 40 ? "bg-amber-500/20 text-amber-400" :
              "bg-red-500/20 text-red-400"
            )}>
              {session.engagement}% engaged
            </span>
          </div>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
        <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <MessageSquare className="h-4 w-4 text-emerald-400" />
        </button>
        <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <HelpCircle className="h-4 w-4 text-blue-400" />
        </button>
        <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <BarChart3 className="h-4 w-4 text-purple-400" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// LIVE ALERT FEED
// ============================================================================
function LiveAlertFeed() {
  const [alerts, setAlerts] = useState<{ id: number; type: string; message: string; time: string; severity: string }[]>([]);

  useEffect(() => {
    const sampleAlerts = [
      { type: "engagement", message: "Keynote engagement up 15%", severity: "success" },
      { type: "warning", message: "Workshop A chat activity low", severity: "warning" },
      { type: "ai", message: "AI launched engagement poll", severity: "info" },
      { type: "success", message: "Q&A question featured", severity: "success" },
      { type: "viewer", message: "Peak viewership reached: 4,521", severity: "info" },
    ];

    let index = 0;
    const interval = setInterval(() => {
      const alert = { ...sampleAlerts[index % sampleAlerts.length], id: Date.now(), time: "Just now" };
      setAlerts(prev => [alert, ...prev.slice(0, 4)]);
      index++;
    }, 3500);

    setAlerts([{ ...sampleAlerts[0], id: Date.now(), time: "Just now" }]);

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "engagement": return TrendingUp;
      case "warning": return AlertTriangle;
      case "ai": return Bot;
      case "success": return CheckCircle;
      default: return Bell;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "success": return "border-emerald-500/30 bg-emerald-500/10";
      case "warning": return "border-amber-500/30 bg-amber-500/10";
      case "info": return "border-blue-500/30 bg-blue-500/10";
      default: return "border-slate-500/30 bg-slate-500/10";
    }
  };

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("flex items-center gap-3 p-3 rounded-lg border", getSeverityColor(alert.severity))}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm flex-1">{alert.message}</span>
              <span className="text-xs text-slate-500">{alert.time}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Dark Tech Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -z-10" />

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Scan Lines Effect */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] -z-5 opacity-50" />

      {/* Content */}
      <div className="container px-4 md:px-6 max-w-7xl relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-left text-white">
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-sm font-medium">
                <Command className="h-4 w-4 text-blue-400" />
                Command Center
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-purple-400" />
                AI-Powered
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-sm font-medium">
                <Radio className="h-4 w-4 text-emerald-400" />
                Real-Time
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
            >
              Your{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Mission Control
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>
              {" "}for Live Events
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg text-slate-300 leading-relaxed"
            >
              Hollywood-style production controls at your fingertips. Monitor every session,
              moderate content in real-time, and let AI automatically recover engagement
              drops before they impact your event.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold h-12 px-6 shadow-lg shadow-blue-500/25"
                asChild
              >
                <Link href="/contact?demo=producer-dashboard">
                  See It Live
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 h-12 px-6 backdrop-blur-sm"
                asChild
              >
                <Link href="/auth/register">
                  <Play className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Link>
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 grid grid-cols-3 gap-6"
            >
              {[
                { value: "<100ms", label: "Latency" },
                { value: "24/7", label: "AI Monitoring" },
                { value: "100+", label: "Controls" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Live Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />

            {/* Dashboard Frame */}
            <div className="relative rounded-2xl border border-slate-700 bg-slate-900/90 backdrop-blur-xl overflow-hidden shadow-2xl">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="ml-3 text-sm font-medium text-slate-300">Producer Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 border border-red-500/30"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-xs font-medium text-red-400">LIVE</span>
                  </motion.div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 space-y-4">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Viewers", value: "4,521", icon: Eye, color: "text-blue-400" },
                    { label: "Messages", value: "1,234", icon: MessageSquare, color: "text-emerald-400" },
                    { label: "Questions", value: "89", icon: HelpCircle, color: "text-purple-400" },
                    { label: "Reactions", value: "2.3K", icon: ThumbsUp, color: "text-amber-400" },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-lg bg-slate-800/50 p-3 text-center">
                      <metric.icon className={cn("h-4 w-4 mx-auto mb-1", metric.color)} />
                      <div className="text-lg font-bold text-white">{metric.value}</div>
                      <div className="text-xs text-slate-500">{metric.label}</div>
                    </div>
                  ))}
                </div>

                {/* Engagement Meter */}
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Overall Engagement</span>
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <TrendingUp className="h-3 w-3" /> +12%
                    </span>
                  </div>
                  <LiveEngagementMeter value={78} />
                </div>

                {/* Live Sessions Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "Opening Keynote", viewers: 3240, status: "live", engagement: 82 },
                    { name: "AI Workshop", viewers: 890, status: "live", engagement: 45 },
                  ].map((session, index) => (
                    <LiveSessionCard key={session.name} session={session} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
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
          className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-blue-400"
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
      icon: Eye,
      stat: "47%",
      title: "Engagement Blind Spots",
      description: "of organizers can't see when audiences disengage until it's too late",
    },
    {
      icon: Clock,
      stat: "8min",
      title: "Slow Response Time",
      description: "Average time to detect and address engagement issues manually",
    },
    {
      icon: Layers,
      stat: "5+",
      title: "Tool Sprawl",
      description: "Different tools to manage chat, Q&A, polls, streaming, and analytics",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-full">
            The Challenge
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Running Live Events is{" "}
            <span className="text-blue-500">Flying Blind</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Without a unified command center, you&apos;re switching between tools, missing
            critical moments, and reacting instead of leading.
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
              <div className="h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-8 transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
                    <problem.icon className="h-7 w-7 text-blue-500" />
                  </div>
                  <div className="text-4xl font-bold text-blue-500">
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
// COMMAND CENTER SECTION
// ============================================================================
function CommandCenterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const capabilities = [
    {
      icon: Monitor,
      title: "Multi-Session View",
      description: "See all sessions at a glance with live viewer counts, engagement scores, and status indicators",
    },
    {
      icon: Activity,
      title: "Real-Time Metrics",
      description: "Track chat activity, Q&A submissions, poll participation, and reactions as they happen",
    },
    {
      icon: SlidersHorizontal,
      title: "Instant Controls",
      description: "Toggle chat, Q&A, and polls on any session with one click—changes apply instantly",
    },
    {
      icon: Camera,
      title: "Green Room Management",
      description: "Monitor speaker readiness, manage green room access, and coordinate transitions",
    },
    {
      icon: Film,
      title: "Recording & Clips",
      description: "Start/stop recordings, create highlight clips, and manage session archives",
    },
    {
      icon: Bell,
      title: "Live Alerts",
      description: "Instant notifications for technical issues, moderation flags, and engagement anomalies",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]"
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
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
            Command Center
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              One Screen
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No more tab-switching. The Producer Dashboard unifies monitoring, moderation,
            and control into a single, powerful interface.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {capabilities.map((cap) => (
            <motion.div
              key={cap.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -3 }}
              className="relative group"
            >
              <div className="h-full rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-500/30">
                <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4")}>
                  <cap.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground">{cap.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// LIVE PRODUCTION CONTROLS SECTION
// ============================================================================
function LiveProductionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const productionFeatures = [
    {
      icon: Video,
      title: "Session Switching",
      description: "Seamlessly switch between live sessions, manage the runsheet, and coordinate transitions",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Breakout Rooms",
      description: "Create, assign, and manage breakout rooms on the fly during live sessions",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Headphones,
      title: "Green Room",
      description: "Monitor speaker readiness, manage green room access, and prep speakers before they go live",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: BarChart3,
      title: "Live Analytics",
      description: "Real-time audience insights—device breakdown, connection quality, and engagement heatmaps",
      color: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/20">
            <Clapperboard className="h-4 w-4" />
            Production Tools
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Professional{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Broadcast Controls
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything a production team needs to run flawless live events—session management,
            speaker coordination, breakout rooms, and real-time audience analytics.
          </p>
        </motion.div>

        {/* Production Features Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12"
        >
          {productionFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <div className="h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-purple-500/30">
                <div className="flex items-start gap-4">
                  <div className={cn("h-14 w-14 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", feature.color)}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Runsheet Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">Live Runsheet</span>
              </div>
              <span className="text-sm text-muted-foreground">Tech Summit 2024</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { time: "9:00 AM", title: "Opening Keynote", status: "completed", speaker: "Sarah Chen" },
                { time: "10:30 AM", title: "AI Workshop", status: "live", speaker: "Michael Brown" },
                { time: "12:00 PM", title: "Networking Lunch", status: "upcoming", speaker: null },
                { time: "1:30 PM", title: "Panel Discussion", status: "upcoming", speaker: "Multiple" },
              ].map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl transition-all",
                    item.status === "live" && "bg-purple-500/10 border border-purple-500/30",
                    item.status === "completed" && "opacity-60",
                    item.status === "upcoming" && "bg-muted/30"
                  )}
                >
                  <span className="text-sm font-mono text-muted-foreground w-20">{item.time}</span>
                  <div className="flex-1">
                    <span className="font-medium">{item.title}</span>
                    {item.speaker && (
                      <span className="text-sm text-muted-foreground ml-2">• {item.speaker}</span>
                    )}
                  </div>
                  {item.status === "live" && (
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-medium">
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-red-500"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      LIVE
                    </span>
                  )}
                  {item.status === "completed" && (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  )}
                  {item.status === "upcoming" && (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MODERATION SECTION
// ============================================================================
function ModerationSection() {
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
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
              Moderation Tools
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Keep Your Event{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                Safe & Focused
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Unified moderation across all sessions. Search messages, feature great questions,
              remove inappropriate content, and manage participants—all from one place.
            </p>

            <ul className="space-y-4">
              {[
                { icon: MessageSquare, text: "Combined chat view from all sessions with color-coded badges" },
                { icon: HelpCircle, text: "Q&A queue with upvotes, featuring, and answer tracking" },
                { icon: Shield, text: "One-click delete, mute, or remove participants" },
                { icon: Eye, text: "Real-time message filtering and keyword search" },
              ].map((feature, i) => (
                <motion.li
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 shrink-0 mt-0.5">
                    <feature.icon className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span>{feature.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Alert Feed Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl border bg-card overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-emerald-400" />
                    <span className="font-semibold">Live Activity Feed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-emerald-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    Live
                  </div>
                </div>

                <div className="p-4 min-h-[300px]">
                  <LiveAlertFeed />
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
// TECHNICAL SECTION
// ============================================================================
function TechnicalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Wifi,
      title: "WebSocket Real-Time",
      description: "Sub-100ms latency for live metrics and controls via WebSocket connections",
    },
    {
      icon: Cpu,
      title: "Scalable Architecture",
      description: "Redis Pub/Sub and Kafka for handling millions of concurrent events",
    },
    {
      icon: Activity,
      title: "GraphQL Subscriptions",
      description: "Live data streaming via GraphQL subscriptions for instant dashboard updates",
    },
    {
      icon: Shield,
      title: "Circuit Breakers",
      description: "Automatic fallbacks prevent cascade failures across services",
    },
    {
      icon: RefreshCw,
      title: "Crash Recovery",
      description: "Pending approvals persisted to Redis—no data lost on restarts",
    },
    {
      icon: Timer,
      title: "15s Polling Cycle",
      description: "Dashboard refreshes every 15 seconds with optimistic UI updates",
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
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-full border border-slate-500/20">
            Enterprise-Grade
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent">
              Production Scale
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The same infrastructure that powers broadcasting giants—now available
            for your live events.
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
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shrink-0">
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-400/30 rounded-full blur-[120px]"
        animate={{ x: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px]"
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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-6"
          >
            <Command className="h-16 w-16 text-cyan-300" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Take Command of Your Events
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join the organizers who&apos;ve transformed chaotic live events into
            seamlessly orchestrated experiences. See the difference a command center makes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-blue-600 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-lg"
              asChild
            >
              <Link href="/contact?demo=producer-dashboard">
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
              Full feature access
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
export default function ProducerDashboardPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <ProblemSection />
      <CommandCenterSection />
      <LiveProductionSection />
      <ModerationSection />
      <TechnicalSection />
      <CTASection />
    </main>
  );
}
