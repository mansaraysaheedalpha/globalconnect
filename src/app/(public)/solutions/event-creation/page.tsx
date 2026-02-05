// src/app/(public)/solutions/event-creation/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Calendar,
  Clock,
  Users,
  Zap,
  Sparkles,
  CheckCircle,
  Layout,
  Copy,
  Globe,
  Palette,
  FileText,
  Eye,
  Layers,
  Settings,
  CalendarDays,
  Mic2,
  Ticket,
  BarChart3,
  Building2,
  Video,
  MapPin,
  Monitor,
  Shield,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  Grip,
  Plus,
  GripVertical,
  Timer,
  AlertCircle,
  MousePointer,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// ============================================================================
// ANIMATED BACKGROUND ELEMENTS
// ============================================================================
function AnimatedGridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Vertical scanning line */}
      <motion.div
        className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent"
        animate={{ left: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      {/* Horizontal scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ============================================================================
// LIVE BUILDER DEMO - Interactive drag-and-drop preview
// ============================================================================
function LiveBuilderDemo() {
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [items, setItems] = useState([
    { id: 1, type: "keynote", title: "Keynote Speech", time: "9:00 AM", duration: "45 min", speaker: "Dr. Sarah Chen" },
    { id: 2, type: "break", title: "Networking Break", time: "9:45 AM", duration: "15 min", speaker: null },
    { id: 3, type: "workshop", title: "Hands-on Workshop", time: "10:00 AM", duration: "90 min", speaker: "Team Alpha" },
    { id: 4, type: "panel", title: "Industry Panel", time: "11:30 AM", duration: "60 min", speaker: "Multiple" },
  ]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Simulate drag animation
    const interval = setInterval(() => {
      setDraggedIndex(prev => {
        if (prev === null) return 1;
        if (prev === 1) {
          // Swap items
          setItems(prev => {
            const newItems = [...prev];
            [newItems[1], newItems[2]] = [newItems[2], newItems[1]];
            return newItems;
          });
          return null;
        }
        return null;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
    keynote: { bg: "bg-purple-500/20", border: "border-purple-500/40", icon: "text-purple-400" },
    break: { bg: "bg-green-500/20", border: "border-green-500/40", icon: "text-green-400" },
    workshop: { bg: "bg-blue-500/20", border: "border-blue-500/40", icon: "text-blue-400" },
    panel: { bg: "bg-amber-500/20", border: "border-amber-500/40", icon: "text-amber-400" },
  };

  const typeIcons: Record<string, React.ReactNode> = {
    keynote: <Mic2 className="h-4 w-4" />,
    break: <Clock className="h-4 w-4" />,
    workshop: <Users className="h-4 w-4" />,
    panel: <Layout className="h-4 w-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative max-w-lg mx-auto lg:mx-0"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl blur-2xl opacity-60" />

      {/* Demo Panel */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-black/70 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="h-2 w-2 rounded-full bg-green-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-white">Visual Agenda Builder</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 border-b border-white/10 flex items-center gap-3">
          <Button size="sm" variant="ghost" className="h-7 text-xs text-white/70 hover:text-white hover:bg-white/10">
            <Plus className="h-3 w-3 mr-1" />
            Add Session
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-white/70 hover:text-white hover:bg-white/10">
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-white/40">Drag to reorder</span>
        </div>

        {/* Session List */}
        <div className="p-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const colors = typeColors[item.type];
              const icon = typeIcons[item.type];
              const isDragging = draggedIndex === index;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isDragging ? 1.02 : 1,
                    boxShadow: isDragging ? "0 10px 40px rgba(0,0,0,0.3)" : "0 0 0 rgba(0,0,0,0)",
                    zIndex: isDragging ? 10 : 1,
                  }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "relative rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-colors",
                    colors.bg,
                    colors.border,
                    isDragging && "ring-2 ring-blue-500/50"
                  )}
                  onMouseEnter={() => setActiveItem(item.id)}
                  onMouseLeave={() => setActiveItem(null)}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-white/30" />
                    <div className={cn("p-1.5 rounded", colors.bg, colors.icon)}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{item.title}</div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span>{item.time}</span>
                        <span>•</span>
                        <span>{item.duration}</span>
                        {item.speaker && (
                          <>
                            <span>•</span>
                            <span className="truncate">{item.speaker}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <AnimatePresence>
                      {activeItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-1"
                        >
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/50 hover:text-white">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Drag indicator */}
                  {isDragging && (
                    <motion.div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded bg-blue-500 text-white text-xs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <MousePointer className="h-3 w-3" />
                      Moving...
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer status */}
        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>4 sessions • 3h 30m total</span>
          <motion.span
            className="text-green-400 flex items-center gap-1"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle className="h-3 w-3" />
            Auto-saved
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: "url('/event-planning-hero.png')" }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-blue-950/60 to-black/90 -z-10" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-500/25 rounded-full blur-[150px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px]"
          animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/15 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Animated Grid Lines */}
      <AnimatedGridLines />

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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-sm font-medium">
                <Calendar className="h-4 w-4 text-blue-400" />
                Event Planning Suite
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Smart Templates
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
                For Organizers
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              Create Stunning Events{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  in Minutes
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full"
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
              From intimate workshops to global conferences—our visual event builder
              with reusable templates turns weeks of planning into a seamless,
              drag-and-drop experience.
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
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-14 px-8 text-lg shadow-lg shadow-blue-500/25"
                asChild
              >
                <Link href="/auth/register">
                  Start Creating Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 text-lg backdrop-blur-sm"
                asChild
              >
                <Link href="/contact?demo=event-planning">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0"
            >
              {[
                { value: "75%", label: "Time Saved" },
                { value: "50+", label: "Templates" },
                { value: "100K+", label: "Events Created" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Live Builder Demo */}
          <div className="hidden lg:block">
            <LiveBuilderDemo />
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
// PROBLEM SECTION - Event Planning Chaos
// ============================================================================
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: Timer,
      stat: "40+",
      suffix: " hours",
      title: "Manual Setup Time",
      description: "Traditional event planning tools require endless clicking, copying, and manual data entry across disconnected systems",
      color: "red",
    },
    {
      icon: AlertCircle,
      stat: "68",
      suffix: "%",
      title: "Scheduling Conflicts",
      description: "Without smart conflict detection, overlapping sessions and speaker double-bookings derail event quality",
      color: "orange",
    },
    {
      icon: RefreshCw,
      stat: "5x",
      suffix: "",
      title: "Repeated Work",
      description: "Every event starts from scratch—no templates, no blueprints, no way to leverage past success",
      color: "amber",
    },
  ];

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
            Event Planning{" "}
            <span className="relative">
              <span className="text-red-500">Shouldn't Be</span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>
            {" "}This Hard
          </h2>
          <p className="text-lg text-muted-foreground">
            Spreadsheets, email chains, scattered tools—traditional event planning
            is a maze of inefficiency that drains your team and delays your launch.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="group"
            >
              <div className={cn(
                "relative rounded-2xl border p-6 h-full transition-all duration-300 overflow-hidden",
                "bg-card/80 backdrop-blur-sm hover:shadow-xl",
                problem.color === "red" && "border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/10",
                problem.color === "orange" && "border-orange-500/20 hover:border-orange-500/40 hover:shadow-orange-500/10",
                problem.color === "amber" && "border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/10"
              )}>
                {/* Icon */}
                <div className="relative mb-4">
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

                {/* Stat */}
                <div className="flex items-baseline gap-1 mb-2">
                  <motion.span
                    className={cn(
                      "text-4xl font-bold tabular-nums",
                      problem.color === "red" && "text-red-500",
                      problem.color === "orange" && "text-orange-500",
                      problem.color === "amber" && "text-amber-500"
                    )}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {problem.stat}
                  </motion.span>
                  <span className={cn(
                    "text-xl font-bold",
                    problem.color === "red" && "text-red-500",
                    problem.color === "orange" && "text-orange-500",
                    problem.color === "amber" && "text-amber-500"
                  )}>
                    {problem.suffix}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <motion.div
              className="w-2 h-2 rounded-full bg-blue-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm text-muted-foreground">
              What if you could{" "}
              <span className="font-semibold text-foreground">launch events 75% faster</span>
              {" "}with built-in best practices?
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SOLUTION SHOWCASE SECTION
// ============================================================================
function SolutionShowcaseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { value: "Drag & Drop", label: "Visual Builder", icon: Grip, color: "from-blue-500 to-cyan-500" },
    { value: "50+", label: "Templates", icon: Layers, color: "from-purple-500 to-pink-500" },
    { value: "Real-time", label: "Collaboration", icon: Users, color: "from-green-500 to-emerald-500" },
    { value: "Smart", label: "Scheduling", icon: Calendar, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
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
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20"
            animate={{ boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0)", "0 0 0 8px rgba(59, 130, 246, 0.1)", "0 0 0 0 rgba(59, 130, 246, 0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            The Solution
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Your Complete{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Event Command Center
              </span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to plan, build, and launch world-class events—all in one intuitive platform
          </p>
        </motion.div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 8 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 8 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
            style={{ perspective: "1200px" }}
          >
            {/* Glow */}
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-3xl opacity-70" />

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
                    app.eventdynamics.com/events/create
                  </motion.div>
                </div>
              </div>

              {/* Screenshot placeholder */}
              <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                {/* Placeholder UI mockup */}
                <div className="absolute inset-0 p-6 flex gap-4">
                  {/* Sidebar */}
                  <div className="w-64 shrink-0 bg-slate-800/50 rounded-xl p-4 space-y-3">
                    <div className="h-8 w-3/4 bg-slate-700/50 rounded animate-pulse" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={cn("h-10 rounded-lg flex items-center px-3 gap-2", i === 1 ? "bg-blue-500/20 border border-blue-500/30" : "bg-slate-700/30")}>
                          <div className="h-4 w-4 rounded bg-slate-600/50" />
                          <div className="h-3 flex-1 bg-slate-600/50 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 bg-slate-800/30 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-48 bg-slate-700/50 rounded" />
                      <div className="flex gap-2">
                        <div className="h-9 w-24 bg-blue-500/30 rounded-lg" />
                        <div className="h-9 w-24 bg-slate-700/50 rounded-lg" />
                      </div>
                    </div>

                    {/* Timeline mockup */}
                    <div className="flex-1 grid grid-cols-4 gap-4 mt-6">
                      {["Track A", "Track B", "Track C", "Networking"].map((track, i) => (
                        <div key={track} className="space-y-3">
                          <div className="h-6 bg-slate-700/50 rounded text-xs text-slate-400 flex items-center justify-center">{track}</div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className={cn(
                              "rounded-lg p-3 space-y-2",
                              i === 0 ? "bg-purple-500/20 border border-purple-500/30 h-32" :
                              i === 1 ? "bg-blue-500/20 border border-blue-500/30 h-24" :
                              i === 2 ? "bg-green-500/20 border border-green-500/30 h-28" :
                              "bg-amber-500/20 border border-amber-500/30 h-20"
                            )}
                          >
                            <div className="h-3 w-3/4 bg-white/20 rounded" />
                            <div className="h-2 w-1/2 bg-white/10 rounded" />
                          </motion.div>
                          {i !== 3 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={isInView ? { opacity: 1, scale: 1 } : {}}
                              transition={{ delay: 0.7 + i * 0.1 }}
                              className="bg-slate-700/30 rounded-lg p-3 h-16 space-y-2"
                            >
                              <div className="h-2 w-2/3 bg-white/10 rounded" />
                              <div className="h-2 w-1/3 bg-white/10 rounded" />
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Animated scan line */}
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
              </div>
            </div>
          </motion.div>

          {/* Feature stats row */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="relative"
              >
                <div className="px-5 py-3 rounded-2xl bg-background/90 backdrop-blur-xl border shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center", feature.color)}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">{feature.value}</div>
                      <div className="text-xs text-muted-foreground">{feature.label}</div>
                    </div>
                  </div>
                </div>
                <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-15 blur-xl -z-10", feature.color)} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES SECTION - Core Capabilities
// ============================================================================
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Layout,
      title: "Drag-and-Drop Builder",
      description: "Visually design your event agenda with an intuitive drag-and-drop interface. No technical skills required.",
      color: "blue",
      items: ["Multi-track scheduling", "Conflict detection", "Time zone support"],
    },
    {
      icon: Copy,
      title: "Smart Templates",
      description: "Start from 50+ professionally designed templates or save your own as reusable blueprints.",
      color: "purple",
      items: ["Conference templates", "Workshop formats", "Webinar layouts"],
    },
    {
      icon: Globe,
      title: "Multi-Language Pages",
      description: "Create event pages in multiple languages to reach your global audience effectively.",
      color: "emerald",
      items: ["Auto-translation", "RTL support", "Regional formatting"],
    },
    {
      icon: Palette,
      title: "Custom Branding",
      description: "Match your brand perfectly with custom colors, logos, fonts, and complete white-label options.",
      color: "pink",
      items: ["Brand kit upload", "Custom domains", "Theme editor"],
    },
    {
      icon: FileText,
      title: "Clone & Duplicate",
      description: "Instantly duplicate past events as starting points. Never rebuild from scratch again.",
      color: "amber",
      items: ["Full event cloning", "Selective copying", "Version history"],
    },
    {
      icon: Eye,
      title: "Draft & Preview",
      description: "Work on drafts without affecting live events. Preview exactly how attendees will see it.",
      color: "cyan",
      items: ["Safe draft mode", "Live preview", "Mobile preview"],
    },
  ];

  const colorStyles: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-500", gradient: "from-blue-500 to-cyan-500" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-500", gradient: "from-purple-500 to-pink-500" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-500", gradient: "from-emerald-500 to-green-500" },
    pink: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-500", gradient: "from-pink-500 to-rose-500" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-500", gradient: "from-amber-500 to-yellow-500" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-500", gradient: "from-cyan-500 to-blue-500" },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Core Capabilities
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Everything You Need to Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to streamline every aspect of event creation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const styles = colorStyles[feature.color];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group"
              >
                <div className={cn(
                  "h-full rounded-2xl border p-6 transition-all duration-300",
                  "bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-xl",
                  styles.border
                )}>
                  {/* Icon */}
                  <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4", styles.bg)}>
                    <feature.icon className={cn("h-6 w-6", styles.text)} />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>

                  {/* Feature items */}
                  <ul className="space-y-2">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className={cn("h-4 w-4 shrink-0", styles.text)} />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EVENT FORMATS SECTION
// ============================================================================
function EventFormatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const formats = [
    {
      icon: Video,
      title: "Virtual Events",
      description: "Broadcast to thousands worldwide with HD streaming, breakout rooms, and full engagement tools.",
      features: ["HD live streaming", "Virtual breakout rooms", "Screen sharing", "Recording & replay"],
      color: "purple",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      icon: MapPin,
      title: "In-Person Events",
      description: "Powerful tools for physical events including badge printing, check-in, and venue management.",
      features: ["QR code check-in", "Badge printing", "Venue mapping", "Capacity management"],
      color: "blue",
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      icon: Monitor,
      title: "Hybrid Events",
      description: "The best of both worlds—seamlessly blend in-person and virtual attendee experiences.",
      features: ["Synchronized sessions", "Cross-format networking", "Unified analytics", "Flexible attendance"],
      color: "amber",
      gradient: "from-amber-600 to-orange-600",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[180px]"
          animate={{ x: [0, 100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]"
          animate={{ x: [0, -100, 0], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Event Formats
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Any Event, Any Format
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether your audience is around the corner or around the world, we've got you covered
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {formats.map((format, index) => (
            <motion.div
              key={format.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.15 * index }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* Card glow */}
              <div className={cn(
                "absolute -inset-px rounded-2xl bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm",
                format.gradient
              )} />

              <div className="relative h-full rounded-2xl border border-border/50 bg-card p-6 overflow-hidden">
                {/* Background gradient on hover */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500",
                  format.gradient
                )} />

                {/* Icon */}
                <div className={cn("relative mb-6")}>
                  <div className={cn(
                    "inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
                    format.gradient
                  )}>
                    <format.icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 relative">{format.title}</h3>
                <p className="text-muted-foreground mb-6 relative">{format.description}</p>

                {/* Features */}
                <ul className="space-y-3 relative">
                  {format.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className={cn("h-4 w-4 shrink-0",
                        format.color === "purple" && "text-purple-500",
                        format.color === "blue" && "text-blue-500",
                        format.color === "amber" && "text-amber-500"
                      )} />
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Learn more link */}
                <motion.div
                  className="mt-6 relative"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link
                    href={`/solutions/${format.title.toLowerCase().replace(" ", "-")}`}
                    className={cn(
                      "inline-flex items-center gap-1 text-sm font-medium transition-colors",
                      format.color === "purple" && "text-purple-500 hover:text-purple-400",
                      format.color === "blue" && "text-blue-500 hover:text-blue-400",
                      format.color === "amber" && "text-amber-500 hover:text-amber-400"
                    )}
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
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
    { icon: Mic2, label: "Speaker Management", desc: "Invite, manage, and coordinate with speakers", link: "/solutions/speaker-management" },
    { icon: CalendarDays, label: "Session Builder", desc: "Visual multi-track agenda creation", link: "/solutions/session-builder" },
    { icon: Ticket, label: "Registration & Ticketing", desc: "Multi-tier tickets with payments", link: "/solutions/registration-ticketing" },
    { icon: BarChart3, label: "Analytics", desc: "Real-time event performance insights", link: "/solutions/analytics" },
    { icon: Users, label: "Engagement Tools", desc: "Polls, Q&A, chat, and gamification", link: "/solutions/engagement-conductor" },
    { icon: Building2, label: "Virtual Booths", desc: "Sponsor exhibition spaces", link: "/solutions/virtual-booth" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Seamless Integration
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            One Platform, Complete Control
          </h2>
          <p className="text-lg text-muted-foreground">
            Event Planning Suite connects seamlessly with every other feature you need
          </p>
        </motion.div>

        {/* Central hub visualization */}
        <div className="relative max-w-4xl mx-auto">
          {/* Central node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mx-auto w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30"
          >
            <div className="text-center text-white">
              <Calendar className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2" />
              <span className="text-xs md:text-sm font-semibold">Event Planning</span>
            </div>
          </motion.div>

          {/* Integration cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 md:mt-12">
            {integrations.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
              >
                <Link href={item.link}>
                  <div className="relative h-full rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 hover:bg-card hover:shadow-lg transition-all cursor-pointer group">
                    {/* Connection line (visual only) */}
                    <motion.div
                      className="absolute top-0 left-1/2 w-px h-0 bg-gradient-to-b from-blue-500/50 to-transparent -translate-x-1/2 -translate-y-full"
                      animate={isInView ? { height: 24 } : { height: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    />

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{item.label}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>

                    <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// WHY CHOOSE US SECTION (Replaces Testimonials for new platform)
// ============================================================================
function WhyChooseUsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const reasons = [
    {
      icon: Zap,
      title: "Launch 75% Faster",
      description: "What used to take weeks now takes days. Our visual builder and templates eliminate repetitive setup work.",
      stat: "75%",
      statLabel: "Time Saved",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "SOC 2 compliant with end-to-end encryption, SSO support, and granular access controls for your team.",
      stat: "99.9%",
      statLabel: "Uptime SLA",
      color: "emerald",
    },
    {
      icon: TrendingUp,
      title: "Scales With You",
      description: "From 50-person workshops to 50,000-attendee conferences—the same intuitive platform handles it all.",
      stat: "50K+",
      statLabel: "Max Attendees",
      color: "purple",
    },
  ];

  const colorStyles: Record<string, { bg: string; text: string; gradient: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500", gradient: "from-blue-500 to-cyan-500" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", gradient: "from-emerald-500 to-green-500" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500", gradient: "from-purple-500 to-pink-500" },
  };

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Built for Modern Event Teams
          </h2>
          <p className="text-lg text-muted-foreground">
            The platform that grows with your ambitions—from your first event to your thousandth
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {reasons.map((reason, index) => {
            const styles = colorStyles[reason.color];
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.15 * index }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="relative group"
              >
                <div className="h-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card hover:shadow-xl transition-all text-center">
                  {/* Icon */}
                  <motion.div
                    className={cn("inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6 bg-gradient-to-br", styles.gradient)}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <reason.icon className="h-8 w-8 text-white" />
                  </motion.div>

                  {/* Stat */}
                  <div className="mb-4">
                    <motion.div
                      className={cn("text-4xl font-bold", styles.text)}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    >
                      {reason.stat}
                    </motion.div>
                    <div className="text-sm text-muted-foreground">{reason.statLabel}</div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-semibold mb-2">{reason.title}</h3>
                  <p className="text-sm text-muted-foreground">{reason.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA SECTION
// ============================================================================
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-950 via-slate-900 to-purple-950" />
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px]"
          animate={{ scale: [1.3, 1, 1.3], x: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-8 shadow-lg shadow-blue-500/30"
          >
            <Calendar className="h-10 w-10 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Transform Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Event Planning
            </span>
            ?
          </h2>

          <p className="text-lg md:text-xl text-neutral-300 mb-10 max-w-2xl mx-auto">
            Join thousands of event professionals who have streamlined their workflow
            with our Event Planning Suite. Start your free trial today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-slate-900 hover:bg-neutral-100 h-14 px-8 text-lg shadow-lg"
              asChild
            >
              <Link href="/auth/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg"
              asChild
            >
              <Link href="/contact?demo=event-planning">
                Schedule Demo
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-neutral-400 text-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Free for teams up to 5</span>
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
export default function EventCreationPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ProblemSection />
      <SolutionShowcaseSection />
      <FeaturesSection />
      <EventFormatsSection />
      <IntegrationSection />
      <WhyChooseUsSection />
      <CTASection />
    </div>
  );
}
