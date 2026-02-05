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
// TOOL SPRAWL CHAOS VISUALIZATION
// ============================================================================
function ToolSprawlChaosVisualization() {
  const [notifications, setNotifications] = useState({
    chat: 12,
    qa: 8,
    polls: 3,
    stream: 2,
    analytics: 5,
  });
  const [activeAlerts, setActiveAlerts] = useState<number[]>([0, 2]);

  // Simulate incoming notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => {
        const keys = Object.keys(prev) as (keyof typeof prev)[];
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return { ...prev, [randomKey]: prev[randomKey] + 1 };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlerts(prev => {
        const next = prev.map(i => (i + 1) % 5);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tools = [
    { name: "Chat Tool", icon: MessageSquare, color: "blue", notifications: notifications.chat, position: { top: "5%", left: "5%" }, rotation: -8 },
    { name: "Q&A Manager", icon: HelpCircle, color: "purple", notifications: notifications.qa, position: { top: "15%", right: "8%" }, rotation: 6 },
    { name: "Poll Dashboard", icon: BarChart3, color: "green", notifications: notifications.polls, position: { bottom: "25%", left: "2%" }, rotation: -4 },
    { name: "Stream Monitor", icon: Video, color: "red", notifications: notifications.stream, position: { bottom: "10%", right: "5%" }, rotation: 10 },
    { name: "Analytics", icon: TrendingUp, color: "orange", notifications: notifications.analytics, position: { top: "45%", right: "0%" }, rotation: -6 },
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    green: "from-green-500/20 to-green-600/10 border-green-500/30",
    red: "from-red-500/20 to-red-600/10 border-red-500/30",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
  };

  const iconColorMap: Record<string, string> = {
    blue: "text-blue-500",
    purple: "text-purple-500",
    green: "text-green-500",
    red: "text-red-500",
    orange: "text-orange-500",
  };

  const badgeColorMap: Record<string, string> = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px]">
      {/* Chaos background lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400">
        <motion.path
          d="M50,200 Q150,100 200,200 T350,200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.path
          d="M100,50 Q200,150 200,250 T100,350"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.path
          d="M300,50 Q250,200 300,350"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </svg>

      {/* Floating tool windows */}
      {tools.map((tool, index) => (
        <motion.div
          key={tool.name}
          className="absolute w-48 md:w-56"
          style={{ ...tool.position }}
          initial={{ opacity: 0, scale: 0.8, rotate: tool.rotation }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -8, 0],
            rotate: [tool.rotation, tool.rotation + 2, tool.rotation],
          }}
          transition={{
            duration: 0.5,
            delay: index * 0.15,
            y: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className={cn(
            "relative rounded-lg border bg-gradient-to-br backdrop-blur-sm shadow-2xl overflow-hidden",
            colorMap[tool.color]
          )}>
            {/* Window header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-black/20">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <span className="text-xs font-medium text-white/70 truncate flex-1">{tool.name}</span>
              <tool.icon className={cn("h-3.5 w-3.5", iconColorMap[tool.color])} />
            </div>

            {/* Window content - fake UI */}
            <div className="p-3 space-y-2">
              <div className="h-2 w-3/4 bg-white/10 rounded" />
              <div className="h-2 w-1/2 bg-white/10 rounded" />
              <div className="flex gap-2 mt-3">
                <div className="h-6 w-16 bg-white/5 rounded" />
                <div className="h-6 w-12 bg-white/5 rounded" />
              </div>
            </div>

            {/* Notification badge */}
            <AnimatePresence>
              {tool.notifications > 0 && (
                <motion.div
                  key={tool.notifications}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={cn(
                    "absolute -top-2 -right-2 min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs font-bold text-white px-1.5",
                    badgeColorMap[tool.color]
                  )}
                >
                  <motion.span
                    key={tool.notifications}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {tool.notifications}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active alert indicator */}
            {activeAlerts.includes(index) && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ boxShadow: `inset 0 0 30px ${tool.color === 'red' ? '#ef4444' : '#f59e0b'}40` }}
              />
            )}
          </div>
        </motion.div>
      ))}

      {/* Center chaos indicator */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
              borderColor: ["rgba(239,68,68,0.5)", "rgba(239,68,68,0.8)", "rgba(239,68,68,0.5)"],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500/30"
            animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500/30"
            animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Floating question marks / confusion indicators */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-muted-foreground/30"
          style={{
            top: `${20 + i * 15}%`,
            left: `${15 + i * 18}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          <RefreshCw className="h-6 w-6" />
        </motion.div>
      ))}
    </div>
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
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Clock,
      stat: "8min",
      title: "Slow Response Time",
      description: "Average time to detect and address engagement issues manually",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Layers,
      stat: "5+",
      title: "Tool Sprawl",
      description: "Different tools to manage chat, Q&A, polls, streaming, and analytics",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-slate-950/50 to-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[180px]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
            <AlertTriangle className="h-4 w-4" />
            The Challenge
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Running Live Events is{" "}
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Flying Blind
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Without a unified command center, you&apos;re switching between tools, missing
            critical moments, and reacting instead of leading.
          </p>
        </motion.div>

        {/* Chaos Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <ToolSprawlChaosVisualization />
        </motion.div>

        {/* Problem Stats */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              variants={fadeInUp}
              className="relative group"
            >
              <div className="h-full rounded-2xl border border-slate-200 dark:border-white/5 bg-card p-6 transition-all duration-500 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-lg">
                {/* Gradient line at top */}
                <div className={cn(
                  "absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r rounded-full opacity-60",
                  problem.gradient
                )} />

                <div className="flex items-center gap-4 mb-4 mt-2">
                  <motion.div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br",
                      problem.gradient
                    )}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <problem.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <motion.div
                    className={cn(
                      "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      problem.gradient
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {problem.stat}
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// COMMAND CENTER DASHBOARD MOCKUP
// ============================================================================
function CommandCenterDashboard() {
  const [activeSession, setActiveSession] = useState(0);
  const [engagement, setEngagement] = useState(78);
  const [chatMessages, setChatMessages] = useState(142);
  const [qaCount, setQaCount] = useState(23);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEngagement(prev => Math.min(100, Math.max(60, prev + (Math.random() > 0.5 ? 1 : -1))));
      setChatMessages(prev => prev + Math.floor(Math.random() * 3));
      setQaCount(prev => prev + (Math.random() > 0.7 ? 1 : 0));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sessions = [
    { name: "Main Stage", viewers: 1247, status: "live", engagement: 82 },
    { name: "Workshop A", viewers: 342, status: "live", engagement: 91 },
    { name: "Breakout 1", viewers: 89, status: "live", engagement: 74 },
    { name: "Networking", viewers: 156, status: "scheduled", engagement: 0 },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Main dashboard container */}
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Dashboard Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Command className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Producer Command Center</h3>
              <p className="text-xs text-white/60">Tech Summit 2024 • Live Now</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="h-2 w-2 rounded-full bg-red-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs font-medium text-red-400">LIVE</span>
            </motion.div>
            <span className="text-sm text-white/60">4 Sessions Active</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="p-4 grid grid-cols-12 gap-4">
          {/* Sessions Panel */}
          <div className="col-span-12 md:col-span-4 space-y-3">
            <div className="text-xs font-medium text-white/50 uppercase tracking-wider px-2">Sessions</div>
            {sessions.map((session, index) => (
              <motion.div
                key={session.name}
                className={cn(
                  "p-3 rounded-xl cursor-pointer transition-all",
                  activeSession === index
                    ? "bg-blue-500/20 border border-blue-500/40"
                    : "bg-white/5 border border-white/5 hover:bg-white/10"
                )}
                onClick={() => setActiveSession(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-white">{session.name}</span>
                  {session.status === "live" ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      Live
                    </span>
                  ) : (
                    <span className="text-xs text-white/40">Scheduled</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {session.viewers.toLocaleString()}
                  </span>
                  {session.status === "live" && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-cyan-400" />
                      <span className="text-cyan-400">{session.engagement}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Monitor */}
          <div className="col-span-12 md:col-span-5 space-y-3">
            <div className="text-xs font-medium text-white/50 uppercase tracking-wider px-2">Live Monitor</div>
            <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 p-4 aspect-video relative overflow-hidden">
              {/* Fake video preview */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
              <motion.div
                className="absolute inset-4 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center"
                animate={{ opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Video className="h-12 w-12 text-white/20" />
              </motion.div>
              {/* Overlay controls */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="h-2 w-2 rounded-full bg-red-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-xs text-white/80">REC</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Wifi className="h-3 w-3 text-emerald-400" />
                  <span>1080p • 60fps</span>
                </div>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: MessageSquare, label: "Chat", active: true },
                { icon: HelpCircle, label: "Q&A", active: true },
                { icon: BarChart3, label: "Polls", active: false },
                { icon: Film, label: "Record", active: true },
              ].map((control) => (
                <motion.button
                  key={control.label}
                  className={cn(
                    "p-2 rounded-lg text-xs flex flex-col items-center gap-1 transition-colors",
                    control.active
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-white/5 text-white/40 border border-white/5"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <control.icon className="h-4 w-4" />
                  <span>{control.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="col-span-12 md:col-span-3 space-y-3">
            <div className="text-xs font-medium text-white/50 uppercase tracking-wider px-2">Live Metrics</div>

            {/* Engagement Gauge */}
            <div className="rounded-xl bg-white/5 border border-white/5 p-4">
              <div className="text-xs text-white/50 mb-2">Engagement Score</div>
              <div className="relative h-24 flex items-center justify-center">
                <svg className="absolute w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                  <motion.circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="url(#engagementGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * engagement) / 100 }}
                    transition={{ duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="engagementGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <motion.div
                  className="text-2xl font-bold text-white"
                  key={engagement}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {engagement}%
                </motion.div>
              </div>
            </div>

            {/* Live Counters */}
            <div className="space-y-2">
              <motion.div
                className="rounded-lg bg-white/5 border border-white/5 p-3 flex items-center justify-between"
                key={chatMessages}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-white/60">Chat</span>
                </div>
                <motion.span
                  className="text-sm font-medium text-white"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {chatMessages}
                </motion.span>
              </motion.div>

              <motion.div
                className="rounded-lg bg-white/5 border border-white/5 p-3 flex items-center justify-between"
                key={qaCount}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-white/60">Q&A</span>
                </div>
                <motion.span
                  className="text-sm font-medium text-white"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {qaCount}
                </motion.span>
              </motion.div>

              <div className="rounded-lg bg-white/5 border border-white/5 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-white/60">Reactions</span>
                </div>
                <span className="text-sm font-medium text-white">847</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-blue-500/20 rounded-3xl blur-3xl -z-10" />
    </div>
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
      description: "See all sessions at a glance with live viewer counts and engagement scores",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Activity,
      title: "Real-Time Metrics",
      description: "Track chat, Q&A, polls, and reactions as they happen",
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      icon: SlidersHorizontal,
      title: "Instant Controls",
      description: "Toggle features on any session with one click",
      gradient: "from-teal-500 to-emerald-500",
    },
    {
      icon: Camera,
      title: "Green Room Management",
      description: "Monitor speaker readiness and coordinate transitions",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      icon: Film,
      title: "Recording & Clips",
      description: "Start/stop recordings and create highlight clips",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Bell,
      title: "Live Alerts",
      description: "Instant notifications for issues and anomalies",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.15, 1], x: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
            <Command className="h-4 w-4" />
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

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <CommandCenterDashboard />
        </motion.div>

        {/* Capability Pills */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
        >
          {capabilities.map((cap) => (
            <motion.div
              key={cap.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -2 }}
              className="group"
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-card hover:border-blue-500/30 hover:shadow-lg transition-all">
                <div className={cn(
                  "h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center",
                  cap.gradient
                )}>
                  <cap.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-sm">{cap.title}</h3>
                  <p className="text-xs text-muted-foreground max-w-[180px]">{cap.description}</p>
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
// INTERACTIVE RUNSHEET COMPONENT
// ============================================================================
function InteractiveRunsheet() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sessions = [
    { time: "9:00 AM", duration: "90 min", title: "Opening Keynote", status: "completed", speaker: "Sarah Chen", engagement: 89, viewers: 1247 },
    { time: "10:30 AM", duration: "60 min", title: "AI Workshop", status: "live", speaker: "Michael Brown", engagement: 92, viewers: 342 },
    { time: "12:00 PM", duration: "60 min", title: "Networking Lunch", status: "upcoming", speaker: null, engagement: 0, viewers: 0 },
    { time: "1:30 PM", duration: "45 min", title: "Panel: Future of Events", status: "upcoming", speaker: "Multiple", engagement: 0, viewers: 0 },
    { time: "2:30 PM", duration: "30 min", title: "Closing Remarks", status: "upcoming", speaker: "Alex Johnson", engagement: 0, viewers: 0 },
  ];

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Main Container */}
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Clapperboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Live Production Runsheet</h3>
                <p className="text-xs text-white/60">Tech Summit 2024 • Day 1</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Current time indicator */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Timer className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-mono text-white/80">Session: {formatTime(elapsedTime)}</span>
              </div>
              <motion.div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="h-2 w-2 rounded-full bg-red-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-red-400">ON AIR</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4">
          {sessions.map((session, index) => (
            <motion.div
              key={index}
              className={cn(
                "relative mb-3 last:mb-0 rounded-xl transition-all cursor-pointer overflow-hidden",
                activeIndex === index
                  ? "bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-purple-500/20 border border-purple-500/40"
                  : session.status === "completed"
                    ? "bg-white/[0.02] border border-white/5 opacity-60"
                    : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]"
              )}
              onClick={() => session.status !== "completed" && setActiveIndex(index)}
              whileHover={{ scale: session.status !== "completed" ? 1.005 : 1 }}
            >
              {/* Progress indicator for live session */}
              {session.status === "live" && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500/20 to-transparent"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(100, (elapsedTime / 36))}%` }}
                />
              )}

              <div className="relative p-4 flex items-center gap-4">
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center shrink-0">
                  <motion.div
                    className={cn(
                      "h-4 w-4 rounded-full border-2",
                      session.status === "live" && "bg-purple-500 border-purple-400",
                      session.status === "completed" && "bg-emerald-500/50 border-emerald-500/50",
                      session.status === "upcoming" && "bg-transparent border-white/30"
                    )}
                    animate={session.status === "live" ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  {index < sessions.length - 1 && (
                    <div className={cn(
                      "w-0.5 h-8 mt-1",
                      session.status === "completed" ? "bg-emerald-500/30" : "bg-white/10"
                    )} />
                  )}
                </div>

                {/* Time column */}
                <div className="w-24 shrink-0">
                  <div className="text-sm font-medium text-white/90">{session.time}</div>
                  <div className="text-xs text-white/40">{session.duration}</div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white truncate">{session.title}</h4>
                    {session.status === "live" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-medium shrink-0">
                        <motion.div
                          className="h-1.5 w-1.5 rounded-full bg-red-500"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        LIVE
                      </span>
                    )}
                  </div>
                  {session.speaker && (
                    <p className="text-sm text-white/50">{session.speaker}</p>
                  )}
                </div>

                {/* Stats for live/completed */}
                {(session.status === "live" || session.status === "completed") && (
                  <div className="hidden md:flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{session.viewers.toLocaleString()}</div>
                      <div className="text-xs text-white/40">Viewers</div>
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        "text-lg font-semibold",
                        session.engagement >= 80 ? "text-emerald-400" : session.engagement >= 60 ? "text-yellow-400" : "text-red-400"
                      )}>
                        {session.engagement}%
                      </div>
                      <div className="text-xs text-white/40">Engagement</div>
                    </div>
                  </div>
                )}

                {/* Action buttons for active */}
                {activeIndex === index && session.status !== "completed" && (
                  <div className="hidden lg:flex items-center gap-2 shrink-0">
                    <motion.button
                      className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </motion.button>
                  </div>
                )}

                {/* Status icon */}
                <div className="shrink-0">
                  {session.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                  {session.status === "upcoming" && (
                    <Clock className="h-5 w-5 text-white/30" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Footer */}
        <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Quick Actions:</span>
            <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors">
              Go Live Next
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-medium hover:bg-white/10 transition-colors">
              Add Break
            </button>
          </div>
          <div className="text-xs text-white/40">
            3 sessions remaining
          </div>
        </div>
      </motion.div>

      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-purple-500/20 rounded-3xl blur-3xl -z-10" />
    </div>
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
      description: "Seamlessly switch between sessions and coordinate transitions",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Breakout Rooms",
      description: "Create and manage breakout rooms on the fly",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Headphones,
      title: "Green Room",
      description: "Monitor and prep speakers before they go live",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: BarChart3,
      title: "Live Analytics",
      description: "Real-time audience insights and engagement heatmaps",
      color: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-slate-950/50 to-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[180px]"
          animate={{ x: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[150px]"
          animate={{ x: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.02)_1px,transparent_1px)] bg-[size:40px_40px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
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

        {/* Feature Pills */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {productionFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -2 }}
              className="group"
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-card hover:border-purple-500/30 hover:shadow-lg transition-all">
                <div className={cn(
                  "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                  feature.color
                )}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Runsheet */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <InteractiveRunsheet />
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
// REAL-TIME INFRASTRUCTURE VISUALIZATION
// ============================================================================
function InfrastructureVisualization() {
  const [dataPackets, setDataPackets] = useState<{ id: number; path: number }[]>([]);
  const [metrics, setMetrics] = useState({ latency: 42, throughput: 12847, uptime: 99.99 });

  useEffect(() => {
    let packetId = 0;
    const interval = setInterval(() => {
      setDataPackets(prev => {
        const newPackets = [...prev, { id: packetId++, path: Math.floor(Math.random() * 3) }];
        return newPackets.slice(-8);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        latency: 35 + Math.floor(Math.random() * 20),
        throughput: 12000 + Math.floor(Math.random() * 2000),
        uptime: 99.99,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nodes = [
    { id: "client", label: "Clients", icon: Users, x: 10, y: 50, color: "blue" },
    { id: "gateway", label: "API Gateway", icon: Radio, x: 30, y: 50, color: "cyan" },
    { id: "websocket", label: "WebSocket", icon: Wifi, x: 50, y: 25, color: "purple" },
    { id: "kafka", label: "Kafka", icon: Activity, x: 50, y: 75, color: "orange" },
    { id: "dashboard", label: "Dashboard", icon: Monitor, x: 75, y: 50, color: "emerald" },
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    cyan: "from-cyan-500 to-cyan-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    emerald: "from-emerald-500 to-emerald-600",
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl p-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-700">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Real-Time Infrastructure</h3>
              <p className="text-xs text-white/60">Live data flow visualization</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">{metrics.latency}ms</div>
              <div className="text-xs text-white/40">Latency</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">{metrics.throughput.toLocaleString()}</div>
              <div className="text-xs text-white/40">Events/sec</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">{metrics.uptime}%</div>
              <div className="text-xs text-white/40">Uptime</div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="relative h-[280px] rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Client to Gateway */}
            <line x1="15" y1="50" x2="28" y2="50" stroke="currentColor" strokeWidth="0.3" className="text-white/20" />
            {/* Gateway to WebSocket */}
            <line x1="35" y1="48" x2="47" y2="28" stroke="currentColor" strokeWidth="0.3" className="text-white/20" />
            {/* Gateway to Kafka */}
            <line x1="35" y1="52" x2="47" y2="72" stroke="currentColor" strokeWidth="0.3" className="text-white/20" />
            {/* WebSocket to Dashboard */}
            <line x1="55" y1="28" x2="70" y2="48" stroke="currentColor" strokeWidth="0.3" className="text-white/20" />
            {/* Kafka to Dashboard */}
            <line x1="55" y1="72" x2="70" y2="52" stroke="currentColor" strokeWidth="0.3" className="text-white/20" />
          </svg>

          {/* Data packets animation */}
          <AnimatePresence>
            {dataPackets.map((packet) => {
              const paths = [
                { start: { x: 15, y: 50 }, end: { x: 75, y: 50 }, via: [{ x: 32, y: 50 }, { x: 50, y: 25 }] },
                { start: { x: 15, y: 50 }, end: { x: 75, y: 50 }, via: [{ x: 32, y: 50 }, { x: 50, y: 75 }] },
                { start: { x: 15, y: 50 }, end: { x: 75, y: 50 }, via: [{ x: 32, y: 50 }, { x: 50, y: 50 }] },
              ];
              const path = paths[packet.path];
              return (
                <motion.div
                  key={packet.id}
                  className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
                  initial={{ left: `${path.start.x}%`, top: `${path.start.y}%`, opacity: 0, scale: 0 }}
                  animate={{
                    left: [`${path.start.x}%`, `${path.via[0].x}%`, `${path.via[1].x}%`, `${path.end.x}%`],
                    top: [`${path.start.y}%`, `${path.via[0].y}%`, `${path.via[1].y}%`, `${path.end.y}%`],
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              );
            })}
          </AnimatePresence>

          {/* Nodes */}
          {nodes.map((node, index) => (
            <motion.div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={cn(
                  "relative flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br border border-white/10",
                  colorMap[node.color]
                )}
                whileHover={{ scale: 1.1 }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
              >
                <node.icon className="h-5 w-5 text-white" />
                <span className="text-[10px] font-medium text-white whitespace-nowrap">{node.label}</span>
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-white/30"
                  animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-cyan-400"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span>Data Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-white/20" />
            <span>Connections</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-emerald-400" />
            <span>All Systems Healthy</span>
          </div>
        </div>
      </motion.div>

      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-slate-500/10 via-cyan-500/10 to-slate-500/10 rounded-3xl blur-3xl -z-10" />
    </div>
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
      description: "Sub-100ms latency for live metrics and controls",
      stat: "<100ms",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Cpu,
      title: "Scalable Architecture",
      description: "Redis Pub/Sub and Kafka for millions of events",
      stat: "10M+",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Activity,
      title: "GraphQL Subscriptions",
      description: "Live data streaming for instant updates",
      stat: "Real-time",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      icon: Shield,
      title: "Circuit Breakers",
      description: "Automatic fallbacks prevent cascade failures",
      stat: "99.99%",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: RefreshCw,
      title: "Crash Recovery",
      description: "Pending approvals persisted to Redis",
      stat: "0 Loss",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      icon: Timer,
      title: "15s Polling Cycle",
      description: "Dashboard refreshes with optimistic UI",
      stat: "15sec",
      gradient: "from-rose-500 to-red-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-slate-950/50 to-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-slate-500/5 rounded-full blur-[180px]"
          animate={{ x: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]"
          animate={{ x: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:40px_40px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-slate-500/10 text-slate-400 rounded-full border border-slate-500/20">
            <Cpu className="h-4 w-4" />
            Enterprise-Grade
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-transparent">
              Production Scale
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The same infrastructure that powers broadcasting giants—now available
            for your live events.
          </p>
        </motion.div>

        {/* Infrastructure Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <InfrastructureVisualization />
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group"
            >
              <div className="h-full p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-card hover:border-slate-300 dark:hover:border-white/10 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                    feature.gradient
                  )}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={cn(
                    "text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent",
                    feature.gradient
                  )}>
                    {feature.stat}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
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
