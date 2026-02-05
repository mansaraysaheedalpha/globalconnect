// src/app/(public)/solutions/event-creation/page.tsx
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
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
  Undo2,
  Redo2,
  LayoutGrid,
  List,
  Star,
  Rocket,
  Gift,
  Lock,
  Server,
  Cloud,
  Database,
  Award,
  Target,
  Milestone,
  CircleDot,
  CheckCircle2,
  ArrowDown,
  PhoneCall,
  Mail,
  MessageSquare,
  Crown,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// ============================================================================
// ANIMATED NUMBER COUNTER
// ============================================================================
function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.floor(latest).toLocaleString()}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// ============================================================================
// FLOATING PARTICLES
// ============================================================================
function FloatingParticles() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// ANIMATED GRID LINES
// ============================================================================
function AnimatedGridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent"
        animate={{ left: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ============================================================================
// GRADIENT BORDER CARD
// ============================================================================
function GradientBorderCard({
  children,
  className,
  gradientClassName = "from-blue-500 via-purple-500 to-pink-500"
}: {
  children: React.ReactNode;
  className?: string;
  gradientClassName?: string;
}) {
  return (
    <div className={cn("relative group", className)}>
      {/* Animated gradient border */}
      <motion.div
        className={cn(
          "absolute -inset-[1px] rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm",
          gradientClassName
        )}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />
      <div className="relative rounded-2xl border border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCED LIVE BUILDER DEMO
// ============================================================================
function LiveBuilderDemo() {
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  const [history, setHistory] = useState<number[][]>([[1, 2, 3, 4]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [items, setItems] = useState([
    { id: 1, type: "keynote", title: "Opening Keynote", time: "9:00 AM", duration: "45 min", speaker: "Dr. Sarah Chen", track: "Main Stage" },
    { id: 2, type: "break", title: "Networking Break", time: "9:45 AM", duration: "15 min", speaker: null, track: "All" },
    { id: 3, type: "workshop", title: "Hands-on Workshop", time: "10:00 AM", duration: "90 min", speaker: "Team Alpha", track: "Room A" },
    { id: 4, type: "panel", title: "Industry Panel", time: "11:30 AM", duration: "60 min", speaker: "Multiple", track: "Main Stage" },
  ]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Simulate drag animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDraggedIndex(prev => {
        if (prev === null) return 1;
        if (prev === 1) {
          setItems(prevItems => {
            const newItems = [...prevItems];
            [newItems[1], newItems[2]] = [newItems[2], newItems[1]];
            return newItems;
          });
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 1500);
          return null;
        }
        return null;
      });
    }, 5000);
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
            {/* Beta badge */}
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
              BETA
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Enhanced Toolbar */}
        <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-white/50 hover:text-white hover:bg-white/10"
              disabled={historyIndex === 0}
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-white/50 hover:text-white hover:bg-white/10"
              disabled={historyIndex === history.length - 1}
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <Button size="sm" variant="ghost" className="h-7 text-xs text-white/70 hover:text-white hover:bg-white/10">
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-white/70 hover:text-white hover:bg-white/10">
            <Copy className="h-3 w-3 mr-1" />
            Clone
          </Button>
          <div className="flex-1" />
          {/* View toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-white/10">
            <Button
              size="sm"
              variant="ghost"
              className={cn("h-6 w-6 p-0", viewMode === "list" ? "bg-white/20 text-white" : "text-white/50")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn("h-6 w-6 p-0", viewMode === "timeline" ? "bg-white/20 text-white" : "text-white/50")}
              onClick={() => setViewMode("timeline")}
            >
              <LayoutGrid className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Session List */}
        <div className="p-4 space-y-2 min-h-[280px]">
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
                        <span>•</span>
                        <span className="text-white/40">{item.track}</span>
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

          {/* Success notification */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/90 text-white text-sm shadow-lg"
              >
                <CheckCircle className="h-4 w-4" />
                Session reordered
              </motion.div>
            )}
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
      <Image
        src="/event-planning-hero.png"
        alt="Event Planning Hero"
        fill
        priority
        className="object-cover object-center"
        style={{ zIndex: -20 }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-blue-950/50 to-black/80" style={{ zIndex: -15 }} />

      {/* Floating Particles */}
      <FloatingParticles />

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
            {/* Early Access Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8"
            >
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 text-sm font-medium"
                animate={{ boxShadow: ["0 0 0 0 rgba(251, 191, 36, 0)", "0 0 0 8px rgba(251, 191, 36, 0.1)", "0 0 0 0 rgba(251, 191, 36, 0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gift className="h-4 w-4 text-amber-400" />
                Free During Beta
              </motion.span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-sm font-medium">
                <Calendar className="h-4 w-4 text-blue-400" />
                Event Planning Suite
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
                  <Rocket className="mr-2 h-5 w-5" />
                  Join Early Access
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 text-lg backdrop-blur-sm"
                asChild
              >
                <Link href="/contact?demo=event-planning">
                  <PhoneCall className="mr-2 h-5 w-5" />
                  Book Personal Demo
                </Link>
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-neutral-400"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-blue-400" />
                <span>SOC 2 Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-purple-400" />
                <span>GDPR Compliant</span>
              </div>
            </motion.div>

            {/* Stats Row with Animated Counters */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0"
            >
              {[
                { value: 75, suffix: "%", label: "Time Saved" },
                { value: 50, suffix: "+", label: "Templates" },
                { value: 50000, suffix: "", label: "Max Attendees", prefix: "" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix || ""} />
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
// PROBLEM SECTION
// ============================================================================
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: Timer,
      stat: 40,
      suffix: "+",
      unit: " hours",
      title: "Manual Setup Time",
      description: "Traditional event planning tools require endless clicking, copying, and manual data entry across disconnected systems",
      color: "red",
    },
    {
      icon: AlertCircle,
      stat: 68,
      suffix: "%",
      unit: "",
      title: "Scheduling Conflicts",
      description: "Without smart conflict detection, overlapping sessions and speaker double-bookings derail event quality",
      color: "orange",
    },
    {
      icon: RefreshCw,
      stat: 5,
      suffix: "x",
      unit: "",
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
              <span className="text-red-500">Shouldn&apos;t Be</span>
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
              <GradientBorderCard gradientClassName={
                problem.color === "red" ? "from-red-500 to-orange-500" :
                problem.color === "orange" ? "from-orange-500 to-amber-500" :
                "from-amber-500 to-yellow-500"
              }>
                <div className="p-6">
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

                  {/* Animated Stat */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={cn(
                      "text-4xl font-bold tabular-nums",
                      problem.color === "red" && "text-red-500",
                      problem.color === "orange" && "text-orange-500",
                      problem.color === "amber" && "text-amber-500"
                    )}>
                      <AnimatedCounter value={problem.stat} suffix={problem.suffix} />
                    </span>
                    <span className={cn(
                      "text-xl font-bold",
                      problem.color === "red" && "text-red-500",
                      problem.color === "orange" && "text-orange-500",
                      problem.color === "amber" && "text-amber-500"
                    )}>
                      {problem.unit}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground">{problem.description}</p>
                </div>
              </GradientBorderCard>
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

              {/* Dashboard UI Mockup */}
              <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 p-6 flex gap-4">
                  {/* Sidebar */}
                  <div className="w-64 shrink-0 bg-slate-800/50 rounded-xl p-4 space-y-3">
                    <div className="h-8 w-3/4 bg-slate-700/50 rounded animate-pulse" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                          key={i}
                          className={cn("h-10 rounded-lg flex items-center px-3 gap-2", i === 1 ? "bg-blue-500/20 border border-blue-500/30" : "bg-slate-700/30")}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <div className="h-4 w-4 rounded bg-slate-600/50" />
                          <div className="h-3 flex-1 bg-slate-600/50 rounded" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 bg-slate-800/30 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-48 bg-slate-700/50 rounded" />
                      <div className="flex gap-2">
                        <motion.div
                          className="h-9 w-24 bg-blue-500/30 rounded-lg"
                          whileHover={{ scale: 1.05 }}
                        />
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
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                              "rounded-lg p-3 space-y-2 cursor-pointer transition-all",
                              i === 0 ? "bg-purple-500/20 border border-purple-500/30 h-32 hover:border-purple-500/50" :
                              i === 1 ? "bg-blue-500/20 border border-blue-500/30 h-24 hover:border-blue-500/50" :
                              i === 2 ? "bg-green-500/20 border border-green-500/30 h-28 hover:border-green-500/50" :
                              "bg-amber-500/20 border border-amber-500/30 h-20 hover:border-amber-500/50"
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
                <GradientBorderCard gradientClassName={styles.gradient}>
                  <div className="p-6">
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
                </GradientBorderCard>
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
            Whether your audience is around the corner or around the world, we&apos;ve got you covered
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
              <GradientBorderCard gradientClassName={format.gradient}>
                <div className="p-6">
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
              </GradientBorderCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// INTEGRATION PARTNERS SECTION
// ============================================================================
function IntegrationPartnersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const integrations = [
    { name: "Zoom", category: "Video" },
    { name: "Google Calendar", category: "Calendar" },
    { name: "Slack", category: "Communication" },
    { name: "Stripe", category: "Payments" },
    { name: "HubSpot", category: "CRM" },
    { name: "Salesforce", category: "CRM" },
    { name: "Mailchimp", category: "Email" },
    { name: "Zapier", category: "Automation" },
  ];

  return (
    <section className="py-16 bg-muted/30 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-10"
        >
          <span className="text-sm text-muted-foreground uppercase tracking-wider">
            Integrates with your favorite tools
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
        >
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-all shadow-sm">
                <span className="text-lg font-bold">{integration.name[0]}</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{integration.name}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          + 50 more integrations coming soon
        </motion.p>
      </div>
    </section>
  );
}

// ============================================================================
// BUILT BY EXPERTS SECTION
// ============================================================================
function BuiltByExpertsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const credentials = [
    { icon: Award, stat: "20+", label: "Years Combined Experience" },
    { icon: Calendar, stat: "500+", label: "Events Organized" },
    { icon: Users, stat: "1M+", label: "Attendees Served" },
    { icon: Building2, stat: "Fortune 500", label: "Enterprise Background" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            <Heart className="h-4 w-4" />
            Built by Event Professionals
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            We&apos;ve Been in Your Shoes
          </h2>
          <p className="text-lg text-muted-foreground">
            Our team has organized hundreds of events—from startup meetups to 10,000+ attendee conferences.
            We built the tool we wished existed.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {credentials.map((cred, index) => (
            <motion.div
              key={cred.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index }}
              className="text-center"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <cred.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">
                <AnimatedCounter value={parseInt(cred.stat) || 0} suffix={cred.stat.replace(/[0-9]/g, '')} />
              </div>
              <div className="text-sm text-muted-foreground">{cred.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ROADMAP PREVIEW SECTION
// ============================================================================
function RoadmapSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const roadmapItems = [
    {
      phase: "Now",
      status: "live",
      title: "Core Platform",
      items: ["Event Builder", "Session Management", "Speaker Portal", "Registration"],
      icon: CheckCircle2,
    },
    {
      phase: "Q1 2026",
      status: "building",
      title: "Engagement Suite",
      items: ["Live Polls", "Q&A System", "Chat", "Gamification"],
      icon: Rocket,
    },
    {
      phase: "Q2 2026",
      status: "planned",
      title: "AI Features",
      items: ["Smart Scheduling", "Attendee Matching", "Content Recommendations", "Auto-Captions"],
      icon: Sparkles,
    },
    {
      phase: "Q3 2026",
      status: "planned",
      title: "Enterprise",
      items: ["SSO/SAML", "Custom Contracts", "Dedicated Support", "On-Premise Option"],
      icon: Building2,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            <Milestone className="h-4 w-4" />
            Product Roadmap
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            What We&apos;re Building
          </h2>
          <p className="text-lg text-muted-foreground">
            Join us on the journey. Early adopters get to shape the product with their feedback.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {roadmapItems.map((item, index) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 * index }}
              >
                <GradientBorderCard gradientClassName={
                  item.status === "live" ? "from-green-500 to-emerald-500" :
                  item.status === "building" ? "from-blue-500 to-purple-500" :
                  "from-slate-500 to-slate-400"
                }>
                  <div className="p-5">
                    {/* Status badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        item.status === "live" && "bg-green-500/20 text-green-500",
                        item.status === "building" && "bg-blue-500/20 text-blue-500",
                        item.status === "planned" && "bg-slate-500/20 text-slate-400"
                      )}>
                        {item.status === "live" ? "Live" : item.status === "building" ? "In Progress" : "Planned"}
                      </span>
                      <item.icon className={cn(
                        "h-5 w-5",
                        item.status === "live" && "text-green-500",
                        item.status === "building" && "text-blue-500",
                        item.status === "planned" && "text-slate-400"
                      )} />
                    </div>

                    <div className="text-sm text-muted-foreground mb-1">{item.phase}</div>
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>

                    <ul className="space-y-2">
                      {item.items.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CircleDot className={cn(
                            "h-3 w-3",
                            item.status === "live" && "text-green-500",
                            item.status === "building" && "text-blue-500",
                            item.status === "planned" && "text-slate-400"
                          )} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </GradientBorderCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TECHNOLOGY STACK SECTION
// ============================================================================
function TechStackSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const techHighlights = [
    { icon: Server, title: "Enterprise Infrastructure", description: "Built on AWS with auto-scaling" },
    { icon: Shield, title: "SOC 2 Ready", description: "Security-first architecture" },
    { icon: Database, title: "99.9% Uptime SLA", description: "Multi-region redundancy" },
    { icon: Cloud, title: "Global CDN", description: "Fast load times worldwide" },
  ];

  return (
    <section className="py-16 bg-slate-950 text-white relative overflow-hidden" ref={ref}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-10"
        >
          <span className="text-sm text-slate-400 uppercase tracking-wider">
            Enterprise-Grade Infrastructure
          </span>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {techHighlights.map((tech, index) => (
            <motion.div
              key={tech.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index }}
              className="text-center"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 mb-3">
                <tech.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="font-semibold mb-1">{tech.title}</h4>
              <p className="text-sm text-slate-400">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EARLY ACCESS CTA SECTION
// ============================================================================
function EarlyAccessSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    "Lock in founding member pricing forever",
    "Direct access to the founding team",
    "Shape the product roadmap with your feedback",
    "Priority support and onboarding",
  ];

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

      {/* Floating particles */}
      <FloatingParticles />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            {/* Founding member badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
              animate={{ boxShadow: ["0 0 0 0 rgba(251, 191, 36, 0)", "0 0 0 12px rgba(251, 191, 36, 0.1)", "0 0 0 0 rgba(251, 191, 36, 0)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="h-5 w-5 text-amber-400" />
              <span className="text-amber-300 font-semibold">Founding Member Offer</span>
            </motion.div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Join Our{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Early Access
              </span>
              {" "}Program
            </h2>

            <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Be among the first to experience the future of event planning.
              Free during beta, with exclusive benefits for founding members.
            </p>

            {/* Benefits */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-10 text-left">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  <span className="text-neutral-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-14 px-8 text-lg shadow-lg shadow-amber-500/25"
              asChild
            >
              <Link href="/auth/register">
                <Rocket className="mr-2 h-5 w-5" />
                Join Early Access — It&apos;s Free
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
                <PhoneCall className="mr-2 h-5 w-5" />
                Book Personal Demo
              </Link>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-neutral-400 text-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>SOC 2 Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              <span>Free during beta</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <span>GDPR Compliant</span>
            </div>
          </motion.div>
        </div>
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
      <IntegrationPartnersSection />
      <BuiltByExpertsSection />
      <RoadmapSection />
      <TechStackSection />
      <EarlyAccessSection />
    </div>
  );
}
