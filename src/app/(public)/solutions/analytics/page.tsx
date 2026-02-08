// src/app/(public)/solutions/analytics/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Zap,
  Clock,
  RefreshCw,
  Download,
  Calendar,
  Target,
  Eye,
  MousePointer,
  DollarSign,
  ShoppingBag,
  MessageSquare,
  Share2,
  FileText,
  Mail,
  Bell,
  CheckCircle,
  AlertTriangle,
  Layers,
  Database,
  Shield,
  Globe,
  Wifi,
  LayoutDashboard,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Filter,
  Settings,
  Play,
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
// LIVE ANALYTICS DASHBOARD PREVIEW
// ============================================================================
function AnalyticsDashboardPreview() {
  const [metrics, setMetrics] = useState({
    totalAttendees: 2847,
    activeNow: 1523,
    engagement: 78.4,
    revenue: 42850,
  });

  const [chartData, setChartData] = useState([65, 72, 68, 85, 82, 90, 88, 95, 91, 97, 94, 100]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        totalAttendees: prev.totalAttendees + (Math.random() > 0.6 ? Math.floor(Math.random() * 3) : 0),
        activeNow: Math.floor(prev.totalAttendees * (0.5 + Math.random() * 0.1)),
        engagement: Math.min(99, prev.engagement + (Math.random() - 0.4) * 2),
        revenue: prev.revenue + (Math.random() > 0.7 ? Math.floor(Math.random() * 100) : 0),
      }));
      setChartData(prev => [...prev.slice(1), Math.floor(85 + Math.random() * 20)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto perspective-1000">
      {/* Premium glow effect */}
      <motion.div
        className="absolute -inset-8 rounded-3xl opacity-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Dashboard Frame */}
      <motion.div
        className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        initial={{ rotateX: 5, rotateY: -5 }}
        animate={{ rotateX: 0, rotateY: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Dashboard Header */}
        <div className="px-4 py-3 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Event Analytics</div>
              <div className="text-xs text-white/50">Tech Summit 2024</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[10px] font-medium text-emerald-400">LIVE</span>
            </motion.div>
            <div className="text-[10px] text-white/40">Updated 5s ago</div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {[
            { label: "Total Attendees", value: metrics.totalAttendees, icon: Users, color: "emerald", change: "+12%", up: true },
            { label: "Active Now", value: metrics.activeNow, icon: Activity, color: "cyan", change: null, up: true },
            { label: "Engagement", value: `${metrics.engagement.toFixed(1)}%`, icon: Target, color: "violet", change: "+5.2%", up: true },
            { label: "Revenue", value: `$${(metrics.revenue / 1000).toFixed(1)}k`, icon: DollarSign, color: "amber", change: "+18%", up: true },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <stat.icon className={cn(
                  "h-3.5 w-3.5",
                  stat.color === "emerald" && "text-emerald-400",
                  stat.color === "cyan" && "text-cyan-400",
                  stat.color === "violet" && "text-violet-400",
                  stat.color === "amber" && "text-amber-400"
                )} />
                {stat.change && (
                  <span className={cn(
                    "text-[9px] font-medium flex items-center gap-0.5",
                    stat.up ? "text-emerald-400" : "text-red-400"
                  )}>
                    {stat.up ? <TrendingUp className="h-2 w-2" /> : <TrendingDown className="h-2 w-2" />}
                    {stat.change}
                  </span>
                )}
              </div>
              <motion.div
                key={String(stat.value)}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-lg font-bold text-white"
              >
                {stat.value.toLocaleString()}
              </motion.div>
              <div className="text-[9px] text-white/40 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Live Chart */}
        <div className="px-4 pb-4">
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/70">Engagement Over Time</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] text-white/50">Live</span>
                </div>
              </div>
            </div>
            {/* Mini Chart Visualization */}
            <div className="h-20 flex items-end gap-1">
              {chartData.map((value, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/50 to-emerald-400/80"
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { label: "Sessions Viewed", value: "12.4k", icon: Eye },
            { label: "Messages Sent", value: "3.2k", icon: MessageSquare },
            { label: "Connections Made", value: "847", icon: Share2 },
          ].map((item) => (
            <div key={item.label} className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5">
                <item.icon className="h-3 w-3 text-white/40" />
                <span className="text-xs font-semibold text-white">{item.value}</span>
              </div>
              <div className="text-[8px] text-white/40 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// SCATTERED DATA CHAOS VISUALIZATION
// ============================================================================
function ScatteredDataVisualization() {
  const tools = [
    { name: "Spreadsheet", icon: FileText, x: 10, y: 15, delay: 0 },
    { name: "Email Reports", icon: Mail, x: 75, y: 20, delay: 0.2 },
    { name: "Manual Counts", icon: Users, x: 20, y: 70, delay: 0.4 },
    { name: "Survey Tool", icon: MessageSquare, x: 80, y: 65, delay: 0.6 },
    { name: "Registration", icon: Calendar, x: 45, y: 10, delay: 0.8 },
    { name: "Payment Data", icon: DollarSign, x: 50, y: 80, delay: 1.0 },
  ];

  return (
    <div className="relative h-64 w-full max-w-md mx-auto">
      {/* Confused organizer in center */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        animate={{ rotate: [0, -5, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center border-2 border-red-300">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-[10px] font-bold text-white">?!</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Scattered data sources */}
      {tools.map((tool) => (
        <motion.div
          key={tool.name}
          className="absolute"
          style={{ left: `${tool.x}%`, top: `${tool.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: tool.delay, duration: 0.5 }}
        >
          <motion.div
            className="relative"
            animate={{
              x: [0, Math.random() * 10 - 5, 0],
              y: [0, Math.random() * 10 - 5, 0],
            }}
            transition={{ duration: 2 + Math.random(), repeat: Infinity }}
          >
            <div className="h-12 w-12 rounded-lg bg-white shadow-lg border border-gray-200 flex items-center justify-center">
              <tool.icon className="h-5 w-5 text-gray-500" />
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-gray-500 font-medium">
              {tool.name}
            </div>
            {/* Disconnection line */}
            <motion.div
              className="absolute top-1/2 left-1/2 h-px bg-red-300"
              style={{
                width: "40px",
                transformOrigin: "left center",
                rotate: `${Math.random() * 360}deg`,
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: tool.delay }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// UNIFIED DASHBOARD MOCKUP
// ============================================================================
function UnifiedDashboardMockup() {
  return (
    <div className="relative">
      <motion.div
        className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-xl"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-white" />
            <span className="font-semibold text-white">Analytics Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Auto-refresh: 5s
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Large Chart */}
          <div className="col-span-2 h-40 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Attendance Trend</div>
            <div className="h-24 flex items-end gap-2">
              {[40, 55, 45, 70, 65, 85, 80, 95, 90, 100].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-teal-400"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                />
              ))}
            </div>
          </div>

          {/* Side Stats */}
          <div className="space-y-3">
            {[
              { label: "Peak Attendance", value: "2,847", change: "+15%" },
              { label: "Avg. Session Time", value: "34m", change: "+8%" },
              { label: "Return Rate", value: "67%", change: "+12%" },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-500">{stat.label}</div>
                <div className="flex items-end justify-between mt-1">
                  <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                  <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FLOATING NOTIFICATION
// ============================================================================
function FloatingAnalyticsNotification() {
  const [visible, setVisible] = useState(true);
  const notifications = [
    { icon: TrendingUp, text: "Engagement up 23% vs last hour", color: "emerald" },
    { icon: Users, text: "New milestone: 3,000 attendees!", color: "blue" },
    { icon: Target, text: "Session 'AI Workshop' trending", color: "violet" },
    { icon: DollarSign, text: "Revenue goal 85% achieved", color: "amber" },
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % notifications.length);
        setVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const notification = notifications[current];

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-8 right-8 z-50 hidden lg:block"
        >
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm",
            notification.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20",
            notification.color === "blue" && "bg-blue-500/10 border-blue-500/20",
            notification.color === "violet" && "bg-violet-500/10 border-violet-500/20",
            notification.color === "amber" && "bg-amber-500/10 border-amber-500/20"
          )}>
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              notification.color === "emerald" && "bg-emerald-500",
              notification.color === "blue" && "bg-blue-500",
              notification.color === "violet" && "bg-violet-500",
              notification.color === "amber" && "bg-amber-500"
            )}>
              <notification.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Live Insight</div>
              <div className="text-sm font-medium text-gray-900">{notification.text}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">Real-Time Analytics</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Turn Event Data Into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Actionable Insights
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
              Stop guessing, start knowing. Our real-time analytics dashboard gives you complete visibility into attendance, engagement, revenue, and networking - updated every 5 seconds.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/demo">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={fadeInUp} className="mt-10 flex items-center gap-8 justify-center lg:justify-start">
              {[
                { value: "5s", label: "Refresh Rate" },
                { value: "50+", label: "Metrics Tracked" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <AnalyticsDashboardPreview />
          </motion.div>
        </div>
      </div>
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
      icon: FileText,
      title: "Spreadsheet Chaos",
      description: "Manually exporting and combining data from multiple sources",
    },
    {
      icon: Clock,
      title: "Stale Information",
      description: "Reports that are hours or days old by the time you see them",
    },
    {
      icon: AlertTriangle,
      title: "Blind Spots",
      description: "Missing critical engagement drops until it's too late",
    },
    {
      icon: Layers,
      title: "Data Silos",
      description: "Registration, engagement, and revenue data scattered everywhere",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-4">
            <AlertTriangle className="h-4 w-4" />
            The Problem
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Flying Blind During Your Events
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
            Most organizers don't know what's happening until the event is over. By then, it's too late to fix engagement drops or optimize the experience.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Problems List */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="space-y-4"
          >
            {problems.map((problem) => (
              <motion.div
                key={problem.title}
                variants={fadeInUp}
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
              >
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <problem.icon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{problem.title}</h3>
                  <p className="text-sm text-gray-600">{problem.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Chaos Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            <ScatteredDataVisualization />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SOLUTION OVERVIEW SECTION
// ============================================================================
function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            The Solution
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            One Dashboard. Complete Visibility.
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to monitor, analyze, and optimize your event - in real-time. No more switching between tools or waiting for reports.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <UnifiedDashboardMockup />
        </motion.div>

        {/* Key Benefits */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 mt-16"
        >
          {[
            {
              icon: Zap,
              title: "5-Second Refresh",
              description: "See changes as they happen with near-instant data updates",
            },
            {
              icon: Layers,
              title: "Unified Data",
              description: "Attendance, engagement, revenue, and networking in one place",
            },
            {
              icon: Download,
              title: "Export Anywhere",
              description: "Download reports in PDF, CSV, or Excel with one click",
            },
          ].map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={fadeInUp}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <benefit.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// KEY FEATURES SECTION
// ============================================================================
function KeyFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Users,
      title: "Attendance Analytics",
      description: "Track registrations, check-ins, and live attendance across all sessions",
      metrics: ["Real-time headcount", "Session popularity", "Drop-off detection", "Peak time analysis"],
      color: "emerald",
    },
    {
      icon: Activity,
      title: "Engagement Metrics",
      description: "Measure how actively attendees participate throughout your event",
      metrics: ["Chat activity", "Poll participation", "Q&A engagement", "Reaction tracking"],
      color: "blue",
    },
    {
      icon: Share2,
      title: "Networking Analytics",
      description: "Understand how connections form and measure networking success",
      metrics: ["Connections made", "Messages exchanged", "Follow-up rates", "Network graph"],
      color: "violet",
    },
    {
      icon: DollarSign,
      title: "Revenue Tracking",
      description: "Monitor ticket sales, upsells, and sponsor ROI in real-time",
      metrics: ["Ticket revenue", "Offer conversions", "Sponsor impressions", "Ad performance"],
      color: "amber",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <BarChart3 className="h-4 w-4" />
            Complete Analytics Suite
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
            Every Metric That Matters
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-400 max-w-2xl mx-auto">
            From attendance to revenue, we track everything so you can make informed decisions during and after your event.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                  feature.color === "emerald" && "bg-emerald-500/20",
                  feature.color === "blue" && "bg-blue-500/20",
                  feature.color === "violet" && "bg-violet-500/20",
                  feature.color === "amber" && "bg-amber-500/20"
                )}>
                  <feature.icon className={cn(
                    "h-6 w-6",
                    feature.color === "emerald" && "text-emerald-400",
                    feature.color === "blue" && "text-blue-400",
                    feature.color === "violet" && "text-violet-400",
                    feature.color === "amber" && "text-amber-400"
                  )} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{feature.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {feature.metrics.map((metric) => (
                      <div key={metric} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        {metric}
                      </div>
                    ))}
                  </div>
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
// REPORTS & EXPORTS SECTION
// ============================================================================
function ReportsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4">
              <FileText className="h-4 w-4" />
              Reports & Exports
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Beautiful Reports, Zero Effort
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8">
              Generate professional reports with one click. Schedule automatic delivery to stakeholders. Export raw data for your own analysis.
            </motion.p>

            <motion.div variants={staggerContainer} className="space-y-4">
              {[
                {
                  icon: Download,
                  title: "One-Click Export",
                  description: "Download PDF, CSV, or Excel reports instantly",
                },
                {
                  icon: Calendar,
                  title: "Scheduled Reports",
                  description: "Automatically send reports daily, weekly, or post-event",
                },
                {
                  icon: Mail,
                  title: "Email Delivery",
                  description: "Reports delivered to your inbox and stakeholders",
                },
                {
                  icon: Filter,
                  title: "Custom Filters",
                  description: "Filter by date range, session, or attendee segment",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  className="flex items-start gap-4"
                >
                  <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Report Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Report Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-white" />
                  <span className="font-semibold text-white">Event Summary Report</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" className="h-7 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>

              {/* Report Content */}
              <div className="p-6 space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Total Attendees", value: "2,847" },
                    { label: "Avg. Engagement", value: "78%" },
                    { label: "Total Revenue", value: "$42.8k" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-lg bg-gray-50">
                      <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini Chart */}
                <div className="h-24 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 p-3">
                  <div className="text-xs font-medium text-gray-700 mb-2">Attendance by Day</div>
                  <div className="h-12 flex items-end gap-2">
                    {[60, 85, 100, 90, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-teal-500 to-emerald-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Top Sessions */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Top Sessions</div>
                  <div className="space-y-2">
                    {[
                      { name: "AI Workshop", attendees: 456, rating: 4.9 },
                      { name: "Keynote Address", attendees: 1203, rating: 4.8 },
                      { name: "Networking Lunch", attendees: 892, rating: 4.7 },
                    ].map((session, i) => (
                      <div key={session.name} className="flex items-center justify-between text-sm p-2 rounded bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-mono text-xs">{i + 1}</span>
                          <span className="font-medium text-gray-900">{session.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{session.attendees} attendees</span>
                          <span className="text-amber-600">{session.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-gradient-to-br from-teal-200 to-emerald-200"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 0.5 } : {}}
              transition={{ delay: 0.5 }}
            />
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

  const techFeatures = [
    {
      icon: Zap,
      title: "Real-Time Processing",
      description: "Sub-second data ingestion with Redis caching for instant updates",
    },
    {
      icon: Database,
      title: "Materialized Views",
      description: "Pre-computed aggregations for lightning-fast dashboard loads",
    },
    {
      icon: Globe,
      title: "Global CDN",
      description: "Analytics served from edge locations worldwide",
    },
    {
      icon: Shield,
      title: "Data Privacy",
      description: "GDPR compliant with anonymization options",
    },
    {
      icon: Wifi,
      title: "WebSocket Updates",
      description: "Live push updates without polling",
    },
    {
      icon: Settings,
      title: "API Access",
      description: "Full REST & GraphQL API for custom integrations",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-4">
            <Database className="h-4 w-4" />
            Technical Excellence
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built for Scale & Speed
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enterprise-grade infrastructure that handles millions of data points without breaking a sweat.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {techFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="p-6 rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
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
    <section ref={ref} className="py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
            Stop Guessing. Start Knowing.
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-emerald-100 mb-8">
            Join thousands of event organizers who use our analytics to make better decisions, faster. Start your free trial today - no credit card required.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/contact">
                Talk to Sales
              </Link>
            </Button>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-sm text-emerald-200 mt-6">
            14-day free trial. No credit card required. Cancel anytime.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function AnalyticsPage() {
  return (
    <main className="overflow-hidden">
      <FloatingAnalyticsNotification />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <KeyFeaturesSection />
      <ReportsSection />
      <TechnicalSection />
      <CTASection />
    </main>
  );
}
