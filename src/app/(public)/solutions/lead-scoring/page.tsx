// src/app/(public)/solutions/lead-scoring/page.tsx
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
  Brain,
  Flame,
  Thermometer,
  Snowflake,
  Bell,
  CheckCircle,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap,
  Download,
  Mail,
  MessageSquare,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  Shield,
  Wifi,
  Database,
  ChevronRight,
  Eye,
  MousePointer,
  Video,
  FileText,
  QrCode,
  Calendar,
  Phone,
  Building2,
  Star,
  Filter,
  Search,
  ArrowUpRight,
  Volume2,
  Layers,
  GitBranch,
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
// ANIMATED LEAD SCORE COUNTER
// ============================================================================
function AnimatedScoreCounter({ targetScore, delay = 0 }: { targetScore: number; delay?: number }) {
  const [score, setScore] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = targetScore / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
          setScore(targetScore);
          clearInterval(interval);
        } else {
          setScore(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [isInView, targetScore, delay]);

  return <span ref={ref}>{score}</span>;
}

// ============================================================================
// LIVE LEAD FEED ANIMATION
// ============================================================================
function LiveLeadFeed() {
  const [leads, setLeads] = useState<{ id: number; name: string; company: string; score: number; intent: string; action: string }[]>([]);

  useEffect(() => {
    const sampleLeads = [
      { name: "Sarah Chen", company: "TechCorp", score: 85, intent: "hot", action: "Requested demo" },
      { name: "Michael Brown", company: "InnovateCo", score: 62, intent: "warm", action: "Downloaded whitepaper" },
      { name: "Emily Davis", company: "StartupXYZ", score: 78, intent: "hot", action: "Visited booth 3x" },
      { name: "James Wilson", company: "Enterprise Inc", score: 45, intent: "warm", action: "Watched video" },
      { name: "Lisa Anderson", company: "Global Systems", score: 92, intent: "hot", action: "Contact request" },
    ];

    let index = 0;
    const interval = setInterval(() => {
      const lead = { ...sampleLeads[index % sampleLeads.length], id: Date.now() };
      setLeads(prev => [lead, ...prev.slice(0, 3)]);
      index++;
    }, 3000);

    // Initial lead
    setLeads([{ ...sampleLeads[0], id: Date.now() }]);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {leads.map((lead) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm",
              lead.intent === "hot" && "bg-red-500/10 border-red-500/30",
              lead.intent === "warm" && "bg-amber-500/10 border-amber-500/30"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white",
              lead.intent === "hot" ? "bg-gradient-to-br from-red-500 to-orange-500" : "bg-gradient-to-br from-amber-500 to-yellow-500"
            )}>
              {lead.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{lead.name}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-bold",
                  lead.intent === "hot" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                )}>
                  {lead.score}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{lead.action}</div>
            </div>
            {lead.intent === "hot" && (
              <Flame className="h-4 w-4 text-red-500 animate-pulse" />
            )}
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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 -z-10" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-red-500/20 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/15 rounded-full blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-red-400" />
            AI-Powered
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-sm font-medium">
            <Zap className="h-4 w-4 text-amber-400" />
            Real-Time
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
            For Sponsors
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-tight"
        >
          Never Miss a{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Hot Lead
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </span>
          {" "}Again
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-neutral-300 leading-relaxed"
        >
          Our AI analyzes every attendee interaction—booth visits, downloads, demos watched—and
          instantly scores leads from 0-100. Get real-time alerts when hot prospects engage,
          so your team can strike while the iron is hot.
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
            className="group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold h-14 px-8 text-lg shadow-lg shadow-red-500/25"
            asChild
          >
            <Link href="/contact?demo=lead-intelligence">
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
            { value: "0-100", label: "Intent Score" },
            { value: "<1s", label: "Alert Speed" },
            { value: "12+", label: "Interaction Types" },
            { value: "100%", label: "Capture Rate" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
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
            className="w-1.5 h-1.5 rounded-full bg-red-400"
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
      stat: "71%",
      title: "Leads Go Cold",
      description: "of event leads are never followed up within the critical 24-hour window",
    },
    {
      icon: Clock,
      stat: "4.2",
      suffix: "hrs",
      title: "Manual Scoring Time",
      description: "Average time sponsors spend manually qualifying leads per event",
    },
    {
      icon: Target,
      stat: "23%",
      title: "Missed Opportunities",
      description: "of high-intent buyers leave booths without being identified as hot leads",
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
            Manual Lead Management is{" "}
            <span className="text-red-500">Costing You Deals</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            While you're busy collecting business cards and manually entering data,
            your hottest prospects are being ignored—or worse, scooped up by competitors.
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
                    {problem.stat}{problem.suffix || ""}
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
// INTENT SCORING SECTION
// ============================================================================
function IntentScoringSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const interactions = [
    { icon: Phone, action: "Contact Request", points: 35, color: "from-red-500 to-orange-500" },
    { icon: Video, action: "Demo Request", points: 30, color: "from-red-500 to-pink-500" },
    { icon: MessageSquare, action: "Contact Form", points: 25, color: "from-orange-500 to-amber-500" },
    { icon: Eye, action: "Demo Watched", points: 20, color: "from-amber-500 to-yellow-500" },
    { icon: FileText, action: "Content Download", points: 15, color: "from-yellow-500 to-lime-500" },
    { icon: Calendar, action: "Session Attended", points: 15, color: "from-lime-500 to-green-500" },
    { icon: Building2, action: "Booth Visit", points: 10, color: "from-green-500 to-emerald-500" },
    { icon: QrCode, action: "QR Scan", points: 10, color: "from-emerald-500 to-teal-500" },
    { icon: MousePointer, action: "CTA Click", points: 10, color: "from-teal-500 to-cyan-500" },
  ];

  const intentLevels = [
    { level: "Hot", range: "70-100", icon: Flame, color: "from-red-500 to-orange-500", bgColor: "bg-red-500/10", textColor: "text-red-500", description: "High-intent buyers ready to purchase" },
    { level: "Warm", range: "40-69", icon: Thermometer, color: "from-amber-500 to-yellow-500", bgColor: "bg-amber-500/10", textColor: "text-amber-500", description: "Interested prospects needing nurture" },
    { level: "Cold", range: "0-39", icon: Snowflake, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10", textColor: "text-blue-500", description: "Early-stage awareness building" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[150px]"
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
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 rounded-full border border-red-500/20">
            AI Intent Scoring
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Every Interaction{" "}
            <span className="bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">
              Tells a Story
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our AI weighs 12+ interaction types to calculate intent scores in real-time.
            High-value actions like demo requests score higher than passive content views.
          </p>
        </motion.div>

        {/* Interaction Points Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-16"
        >
          {interactions.map((item, index) => (
            <motion.div
              key={item.action}
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -3 }}
              className="relative group"
            >
              <div className="h-full rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-lg flex items-center gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shrink-0", item.color)}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.action}</p>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">
                  +{item.points}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Intent Levels */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {intentLevels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="relative group"
              >
                <div className={cn("h-full rounded-2xl border p-6 text-center transition-all duration-300", level.bgColor, "border-current/20 hover:shadow-xl")}>
                  <div className={cn("h-16 w-16 rounded-2xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center", level.color)}>
                    <level.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className={cn("text-2xl font-bold mb-1", level.textColor)}>{level.level}</h3>
                  <p className="text-sm font-medium text-muted-foreground mb-3">{level.range} points</p>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// REAL-TIME ALERTS SECTION
// ============================================================================
function RealTimeAlertsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
              Instant Notifications
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Real-Time{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Lead Alerts
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              The moment a lead crosses the hot threshold, your entire team gets notified.
              Push notifications, sound alerts, and email—so you never miss a high-intent buyer.
            </p>

            <ul className="space-y-4">
              {[
                { icon: Bell, text: "Push notifications to all booth staff instantly" },
                { icon: Volume2, text: "Audio alerts with customizable sounds" },
                { icon: Mail, text: "Email notifications for off-site team members" },
                { icon: Wifi, text: "WebSocket-powered sub-second delivery" },
              ].map((feature, i) => (
                <motion.li
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                    <feature.icon className="h-4 w-4 text-amber-500" />
                  </div>
                  <span>{feature.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Live Feed Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-red-500/20 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl border bg-card overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 to-red-500/10 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-amber-400" />
                    <span className="font-semibold">Live Lead Feed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-green-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    Connected
                  </div>
                </div>

                {/* Live Feed */}
                <div className="p-4 min-h-[280px]">
                  <LiveLeadFeed />
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
// PIPELINE SECTION
// ============================================================================
function PipelineSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stages = [
    { name: "New", color: "from-blue-500 to-cyan-500", description: "Fresh leads captured", count: 142 },
    { name: "Contacted", color: "from-purple-500 to-pink-500", description: "Initial outreach sent", count: 89 },
    { name: "Qualified", color: "from-amber-500 to-orange-500", description: "Sales-ready prospects", count: 47 },
    { name: "Converted", color: "from-green-500 to-emerald-500", description: "Deals closed", count: 23 },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-500/5 rounded-full blur-[200px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/20">
            Lead Pipeline
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Track Every Lead From{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Capture to Close
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Visual pipeline management with drag-and-drop stage updates. Add notes,
            set follow-up reminders, and track conversion rates in real-time.
          </p>
        </motion.div>

        {/* Pipeline Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative">
            {/* Connection Lines - Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-amber-500 to-green-500 -translate-y-1/2 z-0 rounded-full" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              {stages.map((stage, index) => (
                <motion.div
                  key={stage.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={cn("h-24 w-24 rounded-2xl bg-gradient-to-br mx-auto mb-4 flex flex-col items-center justify-center shadow-lg", stage.color)}>
                    <div className="text-3xl font-bold text-white">{stage.count}</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{stage.name}</h3>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { icon: GitBranch, text: "Drag-and-drop stage updates" },
              { icon: MessageSquare, text: "Follow-up notes & history" },
              { icon: Star, text: "Star priority leads" },
              { icon: Filter, text: "Filter by intent & status" },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3 p-4 rounded-xl border bg-card">
                <feature.icon className="h-5 w-5 text-purple-500 shrink-0" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// EXPORT & INTEGRATION SECTION
// ============================================================================
function ExportSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const crms = [
    { name: "Salesforce", logo: "/logos/salesforce.svg" },
    { name: "HubSpot", logo: "/logos/hubspot.svg" },
    { name: "Marketo", logo: "/logos/marketo.svg" },
    { name: "Outreach", logo: "/logos/outreach.svg" },
  ];

  const exportFields = [
    "Name & Contact Info",
    "Company & Title",
    "Intent Score & Level",
    "All Interactions",
    "Follow-up Status",
    "Custom Tags",
    "Timestamps",
    "Notes & Preferences",
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Export Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl border bg-card overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Export Preview</span>
                  </div>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>

                {/* Table Preview */}
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Company</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Score</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Sarah Chen", company: "TechCorp", score: 85, status: "Contacted" },
                        { name: "Michael Brown", company: "InnovateCo", score: 72, status: "Qualified" },
                        { name: "Emily Davis", company: "StartupXYZ", score: 91, status: "New" },
                      ].map((lead, i) => (
                        <tr key={lead.name} className="border-b last:border-0">
                          <td className="py-3 px-3">{lead.name}</td>
                          <td className="py-3 px-3 text-muted-foreground">{lead.company}</td>
                          <td className="py-3 px-3">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-bold",
                              lead.score >= 70 ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"
                            )}>
                              {lead.score}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">{lead.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20">
              Export & Integrate
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              CRM-Ready{" "}
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                In One Click
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Export your leads with all interaction data in CSV format,
              perfectly formatted for your CRM. Filter by intent level, status,
              or date range before exporting.
            </p>

            {/* Export Fields */}
            <div className="grid grid-cols-2 gap-2 mb-8">
              {exportFields.map((field) => (
                <div key={field} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span>{field}</span>
                </div>
              ))}
            </div>

            {/* CRM Logos */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-muted-foreground">Compatible with:</span>
              <div className="flex items-center gap-4">
                {["Salesforce", "HubSpot", "Marketo", "Outreach"].map((crm) => (
                  <div key={crm} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium">
                    {crm}
                  </div>
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
// TECHNICAL FEATURES SECTION
// ============================================================================
function TechnicalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Wifi,
      title: "WebSocket Real-Time",
      description: "Sub-second lead delivery via WebSocket connections—no polling required",
    },
    {
      icon: Database,
      title: "Guaranteed Delivery",
      description: "Redis Streams ensure no lead events are lost, even during service restarts",
    },
    {
      icon: Zap,
      title: "O(1) Stats Lookup",
      description: "PostgreSQL triggers maintain cached stats for instant dashboard loads",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Granular permissions for viewing, exporting, and managing leads",
    },
    {
      icon: Layers,
      title: "Scalable Architecture",
      description: "Kafka-powered pipeline handles thousands of interactions per second",
    },
    {
      icon: RefreshCw,
      title: "Automatic Retries",
      description: "Failed lead captures are automatically retried with exponential backoff",
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
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-full border border-slate-500/20">
            Enterprise-Grade
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent">
              Reliability & Scale
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade infrastructure ensures every lead is captured, scored,
            and delivered—no matter how large your event.
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
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 -z-10" />
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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-6"
          >
            <Flame className="h-16 w-16 text-yellow-300" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Start Capturing Hot Leads Today
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of sponsors who've transformed their event ROI with
            AI-powered lead intelligence. See the difference real-time scoring makes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-red-600 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-lg"
              asChild
            >
              <Link href="/contact?demo=lead-intelligence">
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
export default function LeadIntelligencePage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <ProblemSection />
      <IntentScoringSection />
      <RealTimeAlertsSection />
      <PipelineSection />
      <ExportSection />
      <TechnicalSection />
      <CTASection />
    </main>
  );
}