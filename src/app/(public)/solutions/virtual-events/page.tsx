// src/app/(public)/solutions/virtual-events/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Sparkles,
  Users,
  Monitor,
  Video,
  MessageSquare,
  BarChart3,
  Globe,
  Wifi,
  CheckCircle,
  Zap,
  Radio,
  Shield,
  Clock,
  Activity,
  Eye,
  Mic,
  Camera,
  ArrowUpRight,
  Laptop,
  AlertTriangle,
  TrendingUp,
  PieChart,
  ChevronRight,
  LayoutDashboard,
  Hand,
  ThumbsUp,
  Heart,
  Laugh,
  Headphones,
  Signal,
  Cast,
  ScreenShare,
  Captions,
  HardDrive,
  Lock,
  MapPin,
  Timer,
  Tv,
  Volume2,
  Settings,
  PlayCircle,
  PauseCircle,
  Maximize,
  Languages,
  CloudOff,
  Smartphone,
  Tablet,
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
// VIRTUAL EVENT STREAM PREVIEW
// ============================================================================
function VirtualEventStreamPreview() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewerCount, setViewerCount] = useState(2847);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "Sarah M.", message: "Great presentation!", time: "now" },
    { id: 2, user: "John D.", message: "Can you share the slides?", time: "1m" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) : -Math.floor(Math.random() * 2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const messages = [
      { user: "Emma W.", message: "This is so insightful!" },
      { user: "Michael R.", message: "Thanks for the demo" },
      { user: "Lisa T.", message: "How do I access recordings?" },
      { user: "David K.", message: "Amazing quality!" },
      { user: "Anna S.", message: "Love the captions feature" },
    ];
    let index = 0;
    const interval = setInterval(() => {
      const newMessage = { ...messages[index % messages.length], id: Date.now(), time: "now" };
      setChatMessages(prev => [newMessage, ...prev.slice(0, 3)]);
      index++;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto perspective-1000">
      {/* Premium glow effect */}
      <motion.div
        className="absolute -inset-8 rounded-3xl opacity-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Stream Frame */}
      <motion.div
        className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        initial={{ rotateX: 5, rotateY: -5 }}
        animate={{ rotateX: 0, rotateY: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Video Area */}
        <div className="relative aspect-video bg-gradient-to-br from-blue-900/40 via-slate-900 to-purple-900/40">
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Center play/content area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-center"
            >
              <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
              <div className="text-white/60 text-sm">Live Stream Preview</div>
            </motion.div>
          </div>

          {/* Live badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 shadow-lg shadow-red-500/30"
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                className="h-2 w-2 rounded-full bg-white"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs font-bold text-white">LIVE</span>
            </motion.div>
          </div>

          {/* Viewer count */}
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
            <Eye className="h-4 w-4 text-white/70" />
            <motion.span
              key={viewerCount}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-sm font-medium text-white"
            >
              {viewerCount.toLocaleString()}
            </motion.span>
          </div>

          {/* Captions */}
          <div className="absolute bottom-16 left-4 right-4">
            <motion.div
              className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-white text-sm">
                &quot;...and that&apos;s how we achieved 3x engagement with our virtual events...&quot;
              </span>
            </motion.div>
          </div>

          {/* Video controls */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsPlaying(!isPlaying)} className="text-white/80 hover:text-white">
                {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
              </button>
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <Volume2 className="h-5 w-5 text-white/60" />
              <Captions className="h-5 w-5 text-blue-400" />
              <Settings className="h-5 w-5 text-white/60" />
              <Maximize className="h-5 w-5 text-white/60" />
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="border-t border-white/5">
          <div className="px-4 py-2 bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Live Chat</span>
            </div>
            <span className="text-xs text-white/50">847 chatting</span>
          </div>
          <div className="p-3 space-y-2 max-h-32 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {chatMessages.slice(0, 3).map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-start gap-2"
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {msg.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-blue-400">{msg.user}</span>
                    <span className="text-xs text-white/70 ml-2">{msg.message}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// STREAMING PROVIDER VISUALIZATION
// ============================================================================
function StreamingProvidersVisualization() {
  const providers = [
    { name: "YouTube", color: "red", icon: "▶" },
    { name: "Vimeo", color: "blue", icon: "▷" },
    { name: "Mux", color: "pink", icon: "M" },
    { name: "AWS IVS", color: "orange", icon: "▸" },
    { name: "Cloudflare", color: "amber", icon: "☁" },
    { name: "RTMP", color: "green", icon: "⚡" },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Central hub */}
      <div className="flex items-center justify-center mb-8">
        <motion.div
          className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Cast className="h-10 w-10 text-white" />
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-white/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Provider grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group"
          >
            <div className="p-4 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm hover:border-white/10 transition-all text-center">
              <motion.div
                className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-2 text-xl font-bold",
                  provider.color === "red" && "bg-red-500/10 text-red-400",
                  provider.color === "blue" && "bg-blue-500/10 text-blue-400",
                  provider.color === "pink" && "bg-pink-500/10 text-pink-400",
                  provider.color === "orange" && "bg-orange-500/10 text-orange-400",
                  provider.color === "amber" && "bg-amber-500/10 text-amber-400",
                  provider.color === "green" && "bg-green-500/10 text-green-400"
                )}
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                {provider.icon}
              </motion.div>
              <div className="text-xs font-medium text-white/80">{provider.name}</div>
            </div>
            {/* Connection line */}
            <motion.div
              className="h-4 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent mx-auto -mt-1"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, delay: index * 0.2, repeat: Infinity }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DEVICE COMPATIBILITY VISUALIZATION
// ============================================================================
function DeviceCompatibilitySection() {
  const devices = [
    { icon: Monitor, label: "Desktop", detail: "Chrome, Safari, Firefox, Edge" },
    { icon: Laptop, label: "Laptop", detail: "Any modern browser" },
    { icon: Tablet, label: "Tablet", detail: "iPad, Android tablets" },
    { icon: Smartphone, label: "Mobile", detail: "iOS & Android" },
    { icon: Tv, label: "Smart TV", detail: "Cast supported" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {devices.map((device, index) => (
        <motion.div
          key={device.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="text-center"
        >
          <div className="h-16 w-16 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
            <device.icon className="h-8 w-8 text-blue-400" />
          </div>
          <div className="text-sm font-medium text-white">{device.label}</div>
          <div className="text-xs text-white/50">{device.detail}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// FLOATING NOTIFICATION
// ============================================================================
function FloatingVirtualNotification({
  text,
  icon: Icon,
  delay,
  position,
  color = "blue"
}: {
  text: string;
  icon: React.ElementType;
  delay: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  color?: "blue" | "purple" | "green";
}) {
  const colors = {
    blue: { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-400" },
    purple: { bg: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-400" },
    green: { bg: "bg-green-500/20", border: "border-green-500/40", text: "text-green-400" },
  };

  const config = colors[color];

  return (
    <motion.div
      className={cn(
        "absolute hidden xl:flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md border shadow-2xl",
        config.bg,
        config.border
      )}
      style={position}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1, 1, 0.9],
        y: [20, 0, 0, -10]
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatDelay: 8,
        times: [0, 0.1, 0.9, 1]
      }}
    >
      <Icon className={cn("h-4 w-4", config.text)} />
      <span className={cn("text-sm font-medium", config.text)}>{text}</span>
    </motion.div>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center text-white overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/50 to-slate-950 -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 via-transparent to-blue-950/30 -z-10" />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-500/25 rounded-full blur-[150px]"
          animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[180px]"
          animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Floating Notifications */}
      <FloatingVirtualNotification
        text="Tokyo viewer joined"
        icon={Globe}
        delay={0}
        position={{ top: "15%", left: "8%" }}
        color="blue"
      />
      <FloatingVirtualNotification
        text="HD stream active"
        icon={Signal}
        delay={2}
        position={{ top: "25%", right: "5%" }}
        color="green"
      />
      <FloatingVirtualNotification
        text="Auto-captions enabled"
        icon={Captions}
        delay={4}
        position={{ bottom: "30%", left: "5%" }}
        color="purple"
      />
      <FloatingVirtualNotification
        text="Recording started"
        icon={HardDrive}
        delay={6}
        position={{ bottom: "20%", right: "8%" }}
        color="blue"
      />

      {/* Content */}
      <div className="container px-4 md:px-6 max-w-7xl relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left text-white">
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-sm font-medium">
                <Monitor className="h-4 w-4 text-blue-400" />
                Virtual Events
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-sm font-medium">
                <Cast className="h-4 w-4 text-purple-400" />
                Multi-Provider
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-sm font-medium">
                <Captions className="h-4 w-4 text-green-400" />
                Auto-Captions
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Stream to the{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  World
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </span>
              <br />
              <span className="text-white/90">Flawlessly</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg md:text-xl text-neutral-300 leading-relaxed"
            >
              Enterprise-grade virtual events with HD streaming, automatic recording,
              live captions in 50+ languages, and seamless audience engagement.
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
                className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-14 px-8 text-lg shadow-lg shadow-blue-500/25"
                asChild
              >
                <Link href="/contact?demo=virtual-events">
                  Book a Demo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 h-14 px-8 text-lg backdrop-blur-sm"
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
              className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-8"
            >
              {[
                { value: "50+", label: "Languages" },
                { value: "99.99%", label: "Uptime SLA" },
                { value: "< 1s", label: "Latency" },
                { value: "4K", label: "Stream Quality" },
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

          {/* Right: Stream Preview */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <VirtualEventStreamPreview />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
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
// STREAMING PROVIDERS SECTION
// ============================================================================
function StreamingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:48px_48px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
            <Cast className="h-4 w-4" />
            Multi-Provider Streaming
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Your Stream,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Your Provider
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Bring your existing streaming infrastructure or use our built-in integrations.
            Switch providers anytime without changing your workflow.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <StreamingProvidersVisualization />
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
      icon: Video,
      title: "HD & 4K Streaming",
      description: "Adaptive bitrate streaming that automatically adjusts quality based on viewer bandwidth. Support for up to 4K resolution.",
      gradient: "from-blue-500 to-cyan-500",
      badge: null,
    },
    {
      icon: HardDrive,
      title: "Automatic Recording",
      description: "Every session is automatically recorded in HD. Instant access to recordings for on-demand playback.",
      gradient: "from-purple-500 to-pink-500",
      badge: "Popular",
    },
    {
      icon: Languages,
      title: "Live Captions",
      description: "AI-powered real-time captions in 50+ languages. Improve accessibility and reach global audiences.",
      gradient: "from-green-500 to-emerald-500",
      badge: "AI",
    },
    {
      icon: Timer,
      title: "Lobby & Waiting Room",
      description: "Branded waiting rooms with countdown timers, promo videos, and early engagement features.",
      gradient: "from-amber-500 to-orange-500",
      badge: null,
    },
    {
      icon: Lock,
      title: "Geo-Restrictions",
      description: "Control which regions can access your stream. Built-in compliance for regional content requirements.",
      gradient: "from-red-500 to-rose-500",
      badge: null,
    },
    {
      icon: Headphones,
      title: "Green Room",
      description: "Speakers prep backstage before going live. Producer notes, tech checks, and private communication.",
      gradient: "from-indigo-500 to-violet-500",
      badge: "New",
    },
  ];

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/20">
            <Sparkles className="h-4 w-4" />
            Enterprise Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Everything for{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Professional Virtual Events
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From streaming to recording to accessibility—all the tools you need
            to deliver world-class virtual experiences.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl border bg-card hover:border-blue-500/30 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                    feature.gradient
                  )}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  {feature.badge && (
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      feature.badge === "AI"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                        : feature.badge === "New"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    )}>
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
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
// ENGAGEMENT SECTION
// ============================================================================
function EngagementSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const engagementFeatures = [
    { icon: MessageSquare, label: "Live Chat", value: "Real-time", color: "blue" },
    { icon: Hand, label: "Q&A", value: "Moderated", color: "purple" },
    { icon: BarChart3, label: "Polls", value: "Instant", color: "green" },
    { icon: Heart, label: "Reactions", value: "Animated", color: "red" },
  ];

  return (
    <section className="py-28 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-full border border-pink-500/20">
              <Heart className="h-4 w-4" />
              Real-Time Engagement
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Keep Your Audience{" "}
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Connected & Engaged
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Virtual doesn&apos;t mean distant. Our real-time engagement tools create
              interactive experiences that rival in-person events.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {engagementFeatures.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="p-4 rounded-xl border bg-card"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      feature.color === "blue" && "bg-blue-500/10",
                      feature.color === "purple" && "bg-purple-500/10",
                      feature.color === "green" && "bg-green-500/10",
                      feature.color === "red" && "bg-red-500/10"
                    )}>
                      <feature.icon className={cn(
                        "h-5 w-5",
                        feature.color === "blue" && "text-blue-500",
                        feature.color === "purple" && "text-purple-500",
                        feature.color === "green" && "text-green-500",
                        feature.color === "red" && "text-red-500"
                      )} />
                    </div>
                    <div>
                      <div className="font-semibold">{feature.label}</div>
                      <div className="text-xs text-muted-foreground">{feature.value}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
              className="mt-8"
            >
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                <Link href="/solutions/chat-reactions">
                  Explore Engagement Features
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-blue-500/10 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border bg-card overflow-hidden shadow-2xl p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  94%
                </div>
                <div className="text-sm text-muted-foreground">Average Engagement Rate</div>
              </div>

              {/* Engagement visualization */}
              <div className="space-y-4">
                {[
                  { label: "Chat Messages", value: 85, color: "blue" },
                  { label: "Poll Responses", value: 92, color: "green" },
                  { label: "Q&A Participation", value: 78, color: "purple" },
                  { label: "Reaction Clicks", value: 96, color: "pink" },
                ].map((item, index) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          item.color === "blue" && "bg-blue-500",
                          item.color === "green" && "bg-green-500",
                          item.color === "purple" && "bg-purple-500",
                          item.color === "pink" && "bg-pink-500"
                        )}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${item.value}%` } : {}}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
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
// DEVICE COMPATIBILITY SECTION
// ============================================================================
function CompatibilitySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20">
            <Globe className="h-4 w-4" />
            Universal Access
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Works{" "}
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Everywhere
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            No downloads required. Your virtual event works on any device,
            any browser, anywhere in the world.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <DeviceCompatibilitySection />
          </motion.div>
        </motion.div>
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

  const specs = [
    { icon: Zap, title: "Low Latency", value: "< 1s", description: "Glass-to-glass streaming" },
    { icon: Shield, title: "Uptime SLA", value: "99.99%", description: "Enterprise reliability" },
    { icon: Users, title: "Concurrent", value: "100K+", description: "Viewers per stream" },
    { icon: Globe, title: "CDN Nodes", value: "200+", description: "Global edge network" },
    { icon: Lock, title: "Encryption", value: "AES-256", description: "End-to-end security" },
    { icon: Activity, title: "Bitrate", value: "Up to 8K", description: "Adaptive quality" },
  ];

  return (
    <section className="py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:48px_48px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
            <Shield className="h-4 w-4" />
            Enterprise Infrastructure
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Built for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Scale & Reliability
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            The same infrastructure trusted by the world&apos;s largest virtual events—
            now powering yours.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {specs.map((spec) => (
            <motion.div
              key={spec.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -3 }}
              className="group"
            >
              <div className="h-full p-5 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm hover:border-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <spec.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {spec.value}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-1">{spec.title}</h3>
                <p className="text-sm text-slate-400">{spec.description}</p>
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
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      <motion.div
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[150px]"
        animate={{ x: [0, 60, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[150px]"
        animate={{ x: [0, -60, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 14, repeat: Infinity }}
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
            className="inline-block mb-8"
          >
            <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto">
              <Monitor className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to Go Virtual?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join thousands of organizations hosting professional virtual events
            with enterprise-grade streaming and engagement tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-blue-600 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-xl"
              asChild
            >
              <Link href="/contact?demo=virtual-events">
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 h-14 px-8 text-lg"
              asChild
            >
              <Link href="/auth/register">Start Free Trial</Link>
            </Button>
          </div>

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
export default function VirtualEventsPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <StreamingSection />
      <KeyFeaturesSection />
      <EngagementSection />
      <CompatibilitySection />
      <TechnicalSection />
      <CTASection />
    </main>
  );
}