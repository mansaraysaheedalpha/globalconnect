// src/app/(public)/solutions/hybrid-events/page.tsx
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
  MapPin,
  Video,
  MessageSquare,
  BarChart3,
  Globe,
  Wifi,
  CheckCircle,
  Zap,
  Radio,
  Layers,
  Settings,
  Shield,
  Clock,
  Activity,
  Eye,
  Mic,
  Camera,
  MonitorPlay,
  UserCheck,
  Building2,
  CalendarDays,
  ArrowUpRight,
  Smartphone,
  Laptop,
  AlertTriangle,
  Link2,
  Link2Off,
  TrendingUp,
  PieChart,
  ChevronRight,
  LayoutDashboard,
  Hand,
  ThumbsUp,
  Heart,
  Laugh,
  Send,
  QrCode,
  Headphones,
  Signal,
  Cast,
  ScreenShare,
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
// HYBRID EVENT VISUALIZATION - Split-Screen World
// ============================================================================
function HybridEventVisualization() {
  const [activeReaction, setActiveReaction] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReaction(Math.floor(Math.random() * 5));
      setTimeout(() => setActiveReaction(null), 1500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const reactions = [
    { icon: ThumbsUp, color: "blue" },
    { icon: Heart, color: "red" },
    { icon: Laugh, color: "amber" },
    { icon: Hand, color: "green" },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto perspective-1000">
      {/* Premium glow effect */}
      <motion.div
        className="absolute -inset-8 rounded-3xl opacity-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Split Screen Frame */}
      <motion.div
        className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        initial={{ rotateX: 5, rotateY: -5 }}
        animate={{ rotateX: 0, rotateY: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Hybrid Event</div>
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
          </div>
        </div>

        {/* Split Content Area */}
        <div className="grid grid-cols-2 divide-x divide-white/5">
          {/* In-Person Side */}
          <div className="p-4 relative">
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
              <MapPin className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-medium text-amber-400">IN-PERSON</span>
            </div>

            {/* Venue visualization */}
            <div className="mt-8 mb-4">
              <div className="relative h-24 bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-lg border border-white/5 overflow-hidden">
                {/* Stage */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded border border-purple-500/30" />
                {/* Audience dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 flex-wrap px-2">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-amber-500/60"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* In-person stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs text-white/60">Attendees</span>
                </div>
                <span className="text-xs font-bold text-white">847</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2">
                  <QrCode className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs text-white/60">Checked In</span>
                </div>
                <span className="text-xs font-bold text-white">812</span>
              </div>
            </div>
          </div>

          {/* Virtual Side */}
          <div className="p-4 relative">
            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
              <Monitor className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-medium text-blue-400">VIRTUAL</span>
            </div>

            {/* Stream preview */}
            <div className="mt-8 mb-4">
              <div className="relative h-24 bg-gradient-to-b from-blue-900/30 to-slate-900/50 rounded-lg border border-blue-500/20 overflow-hidden">
                {/* Video frame */}
                <div className="absolute inset-2 rounded bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="h-8 w-8 text-blue-400/50" />
                  </motion.div>
                </div>
                {/* Live indicator */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-500 text-[8px] font-bold text-white">
                  LIVE
                </div>
              </div>
            </div>

            {/* Virtual stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs text-white/60">Watching</span>
                </div>
                <motion.span
                  className="text-xs font-bold text-white"
                  key={Date.now()}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  2,156
                </motion.span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs text-white/60">Countries</span>
                </div>
                <span className="text-xs font-bold text-white">47</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Engagement Bar */}
        <div className="px-4 py-3 bg-slate-800/30 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50">Unified Engagement</span>
              <div className="flex items-center gap-1">
                {reactions.map((reaction, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center transition-all",
                      reaction.color === "blue" && "bg-blue-500/20",
                      reaction.color === "red" && "bg-red-500/20",
                      reaction.color === "amber" && "bg-amber-500/20",
                      reaction.color === "green" && "bg-green-500/20"
                    )}
                    animate={activeReaction === i ? { scale: [1, 1.3, 1] } : {}}
                  >
                    <reaction.icon className={cn(
                      "h-3 w-3",
                      reaction.color === "blue" && "text-blue-400",
                      reaction.color === "red" && "text-red-400",
                      reaction.color === "amber" && "text-amber-400",
                      reaction.color === "green" && "text-green-400"
                    )} />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-white/40" />
              <span className="text-xs font-medium text-white/70">1,247 messages</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// FRAGMENTED EXPERIENCE VISUALIZATION - Problem Section
// ============================================================================
function FragmentedExperienceVisualization() {
  return (
    <div className="relative w-full h-[400px] rounded-2xl border border-red-500/20 bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* Warning banner */}
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Link2Off className="h-4 w-4 text-red-400" />
          </motion.div>
          <span className="text-sm font-medium text-red-400">Disconnected Experiences</span>
        </div>
      </motion.div>

      {/* Two separate worlds */}
      <div className="absolute inset-4 top-16 grid grid-cols-2 gap-8">
        {/* In-Person Side - Isolated */}
        <motion.div
          className="relative rounded-xl bg-slate-900/80 border border-amber-500/20 p-4"
          animate={{ x: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-400">In-Person Only</span>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-3/4 bg-amber-500/20 rounded" />
            <div className="h-3 w-1/2 bg-amber-500/10 rounded" />
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-6 rounded-full bg-amber-500/30" />
              ))}
            </div>
          </div>
          {/* Isolation indicator */}
          <motion.div
            className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Link2Off className="h-4 w-4 text-red-400" />
          </motion.div>
        </motion.div>

        {/* Virtual Side - Isolated */}
        <motion.div
          className="relative rounded-xl bg-slate-900/80 border border-blue-500/20 p-4"
          animate={{ x: [5, -5, 5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-400">Virtual Only</span>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-3/4 bg-blue-500/20 rounded" />
            <div className="h-3 w-1/2 bg-blue-500/10 rounded" />
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-6 rounded-full bg-blue-500/30" />
              ))}
            </div>
          </div>
          {/* Isolation indicator */}
          <motion.div
            className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <Link2Off className="h-4 w-4 text-red-400" />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom stats showing poor performance */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-6">
        {[
          { label: "Engagement Sync", value: "0%", color: "red" },
          { label: "Data Unified", value: "No", color: "red" },
          { label: "Dual Analytics", value: "None", color: "orange" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50 text-center backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className={cn(
              "text-xl font-bold",
              stat.color === "red" ? "text-red-400" : "text-orange-400"
            )}>
              {stat.value}
            </div>
            <div className="text-[10px] text-slate-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// UNIFIED CONTROL CENTER MOCKUP
// ============================================================================
function UnifiedControlCenterMockup() {
  const [activeTab, setActiveTab] = useState("overview");
  const [viewerCount, setViewerCount] = useState({ inPerson: 847, virtual: 2156 });

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => ({
        inPerson: prev.inPerson + (Math.random() > 0.8 ? 1 : 0),
        virtual: prev.virtual + (Math.random() > 0.6 ? Math.floor(Math.random() * 5) : 0),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: PieChart },
    { id: "sessions", label: "Sessions", icon: CalendarDays },
    { id: "audience", label: "Audience", icon: Users },
    { id: "streaming", label: "Streaming", icon: Cast },
  ];

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-purple-500/10 rounded-3xl blur-3xl -z-10" />

      <motion.div
        className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/30 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/20">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Hybrid Control Center</h3>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>Tech Summit 2024</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">HYBRID</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <motion.div
                  key={viewerCount.inPerson + viewerCount.virtual}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-purple-400"
                >
                  {(viewerCount.inPerson + viewerCount.virtual).toLocaleString()} Total
                </motion.div>
                <div className="text-xs text-white/50">Live Attendees</div>
              </div>
              <motion.div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="h-2 w-2 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-emerald-400">LIVE</span>
              </motion.div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "In-Person", value: viewerCount.inPerson, icon: MapPin, color: "amber", badge: "Venue" },
              { label: "Virtual", value: viewerCount.virtual, icon: Monitor, color: "blue", badge: "Stream" },
              { label: "Engagement", value: "94%", icon: Activity, color: "green", badge: "+12%" },
              { label: "Sessions Live", value: "4", icon: Radio, color: "purple", badge: "Active" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    stat.color === "amber" && "bg-amber-500/10",
                    stat.color === "blue" && "bg-blue-500/10",
                    stat.color === "green" && "bg-green-500/10",
                    stat.color === "purple" && "bg-purple-500/10"
                  )}>
                    <stat.icon className={cn(
                      "h-5 w-5",
                      stat.color === "amber" && "text-amber-400",
                      stat.color === "blue" && "text-blue-400",
                      stat.color === "green" && "text-green-400",
                      stat.color === "purple" && "text-purple-400"
                    )} />
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    stat.color === "amber" && "bg-amber-500/10 text-amber-400",
                    stat.color === "blue" && "bg-blue-500/10 text-blue-400",
                    stat.color === "green" && "bg-emerald-500/10 text-emerald-400",
                    stat.color === "purple" && "bg-purple-500/10 text-purple-400"
                  )}>{stat.badge}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Session Stream Preview */}
            <div className="col-span-8 space-y-4">
              {/* Live Session Preview */}
              <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <Radio className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Main Stage: Keynote</div>
                      <div className="text-xs text-white/50">Dr. Sarah Chen • AI in 2024</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-red-500 text-[10px] font-bold text-white">LIVE</span>
                  </div>
                </div>
                <div className="aspect-video bg-gradient-to-br from-purple-900/30 via-slate-900 to-blue-900/30 flex items-center justify-center relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"
                  />
                  <div className="relative z-10 text-center">
                    <Play className="h-16 w-16 text-white/30 mx-auto mb-2" />
                    <div className="text-sm text-white/50">Stream Preview</div>
                  </div>
                  {/* Viewer counts overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
                      <MapPin className="h-3 w-3 text-amber-400" />
                      <span className="text-xs text-white">{viewerCount.inPerson} in venue</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
                      <Eye className="h-3 w-3 text-blue-400" />
                      <span className="text-xs text-white">{viewerCount.virtual.toLocaleString()} watching</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unified Engagement */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-white text-sm">Unified Engagement</h4>
                  <span className="text-xs text-white/40">Both audiences</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Chat", value: "1,247", icon: MessageSquare, color: "blue" },
                    { label: "Q&A", value: "89", icon: Hand, color: "purple" },
                    { label: "Reactions", value: "3.2K", icon: Heart, color: "red" },
                    { label: "Polls", value: "94%", icon: BarChart3, color: "green" },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center"
                      whileHover={{ scale: 1.03 }}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 mx-auto mb-2",
                        item.color === "blue" && "text-blue-400",
                        item.color === "purple" && "text-purple-400",
                        item.color === "red" && "text-red-400",
                        item.color === "green" && "text-green-400"
                      )} />
                      <div className="text-lg font-bold text-white">{item.value}</div>
                      <div className="text-[10px] text-white/50">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="col-span-4 space-y-4">
              {/* Audience Breakdown */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-medium text-white mb-4 text-sm">Audience Mix</h4>
                <div className="space-y-3">
                  {[
                    { label: "In-Person", count: viewerCount.inPerson, icon: MapPin, color: "amber", percentage: 28 },
                    { label: "Virtual", count: viewerCount.virtual, icon: Monitor, color: "blue", percentage: 72 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <item.icon className={cn(
                            "h-3.5 w-3.5",
                            item.color === "amber" && "text-amber-400",
                            item.color === "blue" && "text-blue-400"
                          )} />
                          <span className="text-xs text-white/60">{item.label}</span>
                        </div>
                        <span className="text-xs font-medium text-white">{item.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            item.color === "amber" && "bg-gradient-to-r from-amber-600 to-amber-400",
                            item.color === "blue" && "bg-gradient-to-r from-blue-600 to-blue-400"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, delay: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Producer Controls */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-medium text-white mb-3 text-sm">Quick Controls</h4>
                <div className="space-y-2">
                  {[
                    { icon: ScreenShare, label: "Share Screen", color: "blue" },
                    { icon: Mic, label: "Open Q&A", color: "green" },
                    { icon: BarChart3, label: "Launch Poll", color: "purple" },
                  ].map((action) => (
                    <motion.button
                      key={action.label}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all text-left"
                      whileHover={{ x: 4 }}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        action.color === "blue" && "bg-blue-500/10",
                        action.color === "green" && "bg-green-500/10",
                        action.color === "purple" && "bg-purple-500/10"
                      )}>
                        <action.icon className={cn(
                          "h-4 w-4",
                          action.color === "blue" && "text-blue-400",
                          action.color === "green" && "text-green-400",
                          action.color === "purple" && "text-purple-400"
                        )} />
                      </div>
                      <span className="text-sm text-white/70">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Green Room Status */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Headphones className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Green Room</div>
                      <div className="text-xs text-white/50">3 speakers ready</div>
                    </div>
                  </div>
                  <motion.div
                    className="h-3 w-3 rounded-full bg-emerald-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// FLOATING NOTIFICATION - Hybrid-specific
// ============================================================================
function FloatingHybridNotification({
  text,
  type,
  delay,
  position
}: {
  text: string;
  type: "in-person" | "virtual" | "unified";
  delay: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
}) {
  const typeConfig = {
    "in-person": { bg: "bg-amber-500/20", border: "border-amber-500/40", icon: MapPin, text: "text-amber-400" },
    "virtual": { bg: "bg-blue-500/20", border: "border-blue-500/40", icon: Monitor, text: "text-blue-400" },
    "unified": { bg: "bg-purple-500/20", border: "border-purple-500/40", icon: Link2, text: "text-purple-400" },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-transparent to-purple-950/30 -z-10" />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px]"
          animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[180px]"
          animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Floating Notifications */}
      <FloatingHybridNotification
        text="New York venue check-in"
        type="in-person"
        delay={0}
        position={{ top: "15%", left: "8%" }}
      />
      <FloatingHybridNotification
        text="Tokyo viewer joined"
        type="virtual"
        delay={2}
        position={{ top: "25%", right: "5%" }}
      />
      <FloatingHybridNotification
        text="Unified Q&A question"
        type="unified"
        delay={4}
        position={{ bottom: "30%", left: "5%" }}
      />
      <FloatingHybridNotification
        text="London stream active"
        type="virtual"
        delay={6}
        position={{ bottom: "20%", right: "8%" }}
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-sm font-medium">
                <Layers className="h-4 w-4 text-purple-400" />
                Hybrid Events
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-sm font-medium">
                <MapPin className="h-4 w-4 text-amber-400" />
                In-Person
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-sm font-medium">
                <Monitor className="h-4 w-4 text-blue-400" />
                Virtual
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              One Event,{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Two Worlds
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </span>
              <br />
              <span className="text-white/90">Unified</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg md:text-xl text-neutral-300 leading-relaxed"
            >
              Seamlessly blend in-person and virtual experiences. One registration,
              unified engagement, and analytics that span both worlds.
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
                className="group bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold h-14 px-8 text-lg shadow-lg shadow-purple-500/25"
                asChild
              >
                <Link href="/contact?demo=hybrid-events">
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
                { value: "3x", label: "Audience Reach" },
                { value: "100%", label: "Unified Analytics" },
                { value: "47+", label: "Countries Live" },
                { value: "< 1s", label: "Stream Latency" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Hybrid Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <HybridEventVisualization />
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
            className="w-1.5 h-1.5 rounded-full bg-purple-400"
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
      stat: "2x",
      title: "Separate Platforms",
      description: "Managing two systems means double the work, fragmented data, and disconnected attendees",
      icon: Link2Off,
      gradient: "from-red-500 to-rose-500",
    },
    {
      stat: "0%",
      title: "Unified Engagement",
      description: "In-person and virtual audiences can't interact, missing the power of combined networking",
      icon: Users,
      gradient: "from-orange-500 to-amber-500",
    },
    {
      stat: "Split",
      title: "Fragmented Analytics",
      description: "No single view of event success—impossible to measure true hybrid impact",
      icon: PieChart,
      gradient: "from-amber-500 to-yellow-500",
    },
  ];

  return (
    <section className="py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[200px]"
          animate={{ x: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
            <AlertTriangle className="h-4 w-4" />
            The Hybrid Challenge
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Running Hybrid Events{" "}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Shouldn&apos;t Mean Double the Work
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Traditional approaches force you to manage two separate events—one physical,
            one virtual—with no connection between them.
          </p>
        </motion.div>

        {/* Fragmented Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <FragmentedExperienceVisualization />
        </motion.div>

        {/* Problem Stats */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {problems.map((problem) => (
            <motion.div key={problem.title} variants={fadeInUp} className="group">
              <div className="h-full p-6 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                {/* Gradient accent */}
                <div className={cn(
                  "absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r rounded-full opacity-50",
                  problem.gradient
                )} />

                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                      problem.gradient
                    )}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <problem.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <div className={cn(
                    "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                    problem.gradient
                  )}>
                    {problem.stat}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{problem.title}</h3>
                <p className="text-slate-400">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SOLUTION OVERVIEW SECTION
// ============================================================================
function SolutionOverviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/20">
            <Link2 className="h-4 w-4" />
            Unified Platform
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            One Platform,{" "}
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Infinite Possibilities
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Manage in-person and virtual experiences from a single control center.
            Registration, engagement, and analytics—all unified.
          </p>
        </motion.div>

        {/* Control Center Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <UnifiedControlCenterMockup />
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
      icon: UserCheck,
      title: "Unified Registration",
      description: "One registration system for both audiences. Attendees choose their experience—physical, virtual, or switch between both.",
      href: "/solutions/registration-ticketing",
      gradient: "from-purple-500 to-violet-500",
      badge: "Popular",
    },
    {
      icon: Cast,
      title: "Multi-Provider Streaming",
      description: "Supports YouTube, Vimeo, Mux, AWS IVS, Cloudflare, and custom RTMP. Auto-captions and recording included.",
      href: "/solutions/virtual-events",
      gradient: "from-blue-500 to-cyan-500",
      badge: null,
    },
    {
      icon: Headphones,
      title: "Green Room",
      description: "Speakers prep backstage before going live. Producer notes, tech checks, and countdown timers—all in one place.",
      href: "/solutions/green-room",
      gradient: "from-emerald-500 to-teal-500",
      badge: "New",
    },
    {
      icon: MessageSquare,
      title: "Cross-Platform Chat",
      description: "In-person attendees on mobile and virtual viewers share the same chat, Q&A, and polls in real-time.",
      href: "/solutions/chat-reactions",
      gradient: "from-pink-500 to-rose-500",
      badge: null,
    },
    {
      icon: BarChart3,
      title: "Unified Analytics",
      description: "See both audiences in one dashboard. Track engagement, attendance patterns, and content performance across worlds.",
      href: "/solutions/analytics",
      gradient: "from-amber-500 to-orange-500",
      badge: null,
    },
    {
      icon: LayoutDashboard,
      title: "Producer Dashboard",
      description: "Control sessions, switch speakers, manage Q&A, and monitor both audiences from a single real-time interface.",
      href: "/solutions/producer-dashboard",
      gradient: "from-indigo-500 to-purple-500",
      badge: null,
    },
  ];

  return (
    <section className="py-28 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
            <Sparkles className="h-4 w-4" />
            Built for Hybrid
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Seamless Hybrid Events
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Purpose-built features that bridge the gap between physical venues
            and virtual attendees.
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
              <Link href={feature.href}>
                <div className="h-full p-6 rounded-2xl border bg-card hover:border-purple-500/30 hover:shadow-xl transition-all duration-300">
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
                        feature.badge === "New"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                      )}>
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                  <div className="flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:gap-2 transition-all">
                    Learn more
                    <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// DUAL EXPERIENCE SECTION
// ============================================================================
function DualExperienceSection() {
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-gradient-to-r from-amber-500/10 to-blue-500/10 text-white rounded-full border border-white/20">
            <Users className="h-4 w-4" />
            Dual Experience Design
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Tailored Experiences,{" "}
            <span className="bg-gradient-to-r from-amber-400 to-blue-400 bg-clip-text text-transparent">
              Unified Community
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Each audience gets an optimized experience while sharing the same event moments.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* In-Person Experience */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">In-Person</h3>
                <p className="text-muted-foreground">The venue experience</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                { icon: QrCode, text: "QR badge check-in with instant sync" },
                { icon: Smartphone, text: "Mobile app for live engagement" },
                { icon: MapPin, text: "Interactive venue maps & wayfinding" },
                { icon: Users, text: "Proximity-based networking" },
                { icon: MessageSquare, text: "Real-time chat with virtual attendees" },
                { icon: Hand, text: "Raise hand for mic access during Q&A" },
              ].map((item, i) => (
                <motion.li
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Virtual Experience */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Monitor className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Virtual</h3>
                <p className="text-muted-foreground">The stream experience</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                { icon: Video, text: "HD streaming with adaptive quality" },
                { icon: Globe, text: "Auto-captions in 50+ languages" },
                { icon: Laptop, text: "Works on any device, no downloads" },
                { icon: Clock, text: "Timezone-aware scheduling" },
                { icon: MessageSquare, text: "Live chat alongside the stream" },
                { icon: Play, text: "On-demand recordings after sessions" },
              ].map((item, i) => (
                <motion.li
                  key={item.text}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Unified Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 p-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Link2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Unified Across Both</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: MessageSquare, title: "Shared Chat", desc: "One conversation" },
                { icon: BarChart3, title: "Live Polls", desc: "Combined results" },
                { icon: Hand, title: "Q&A Queue", desc: "Fair rotation" },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="h-6 w-6 text-purple-500" />
                  </div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
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
// STREAMING PROVIDERS SECTION
// ============================================================================
function StreamingProvidersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const providers = [
    { name: "YouTube Live", logo: "▶", color: "red" },
    { name: "Vimeo", logo: "▷", color: "blue" },
    { name: "Mux", logo: "M", color: "pink" },
    { name: "AWS IVS", logo: "▸", color: "orange" },
    { name: "Cloudflare", logo: "☁", color: "amber" },
    { name: "Custom RTMP", logo: "⚡", color: "green" },
  ];

  return (
    <section className="py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:48px_48px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
            <Signal className="h-4 w-4" />
            Streaming Infrastructure
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Works with Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Streaming Stack
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Bring your own streaming provider or use our built-in integrations.
            We support all major platforms out of the box.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto mb-12"
        >
          {providers.map((provider) => (
            <motion.div
              key={provider.name}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <div className="h-full p-5 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm hover:border-white/10 transition-all text-center">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold",
                  provider.color === "red" && "bg-red-500/10 text-red-400",
                  provider.color === "blue" && "bg-blue-500/10 text-blue-400",
                  provider.color === "pink" && "bg-pink-500/10 text-pink-400",
                  provider.color === "orange" && "bg-orange-500/10 text-orange-400",
                  provider.color === "amber" && "bg-amber-500/10 text-amber-400",
                  provider.color === "green" && "bg-green-500/10 text-green-400"
                )}>
                  {provider.logo}
                </div>
                <div className="text-sm font-medium text-white">{provider.name}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technical Features */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto"
        >
          {[
            { icon: Zap, title: "Low Latency", description: "Sub-second streaming for live interaction", stat: "<1s" },
            { icon: Globe, title: "Auto Captions", description: "AI-powered captions in 50+ languages", stat: "50+" },
            { icon: Video, title: "Recording", description: "Automatic recording with instant replay", stat: "Auto" },
            { icon: Shield, title: "99.99% Uptime", description: "Enterprise SLA with redundancy", stat: "SLA" },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -3 }}
              className="group"
            >
              <div className="h-full p-5 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm hover:border-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {feature.stat}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      <motion.div
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[150px]"
        animate={{ x: [0, 60, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[150px]"
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
              <Layers className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to Unite Your Audiences?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join event organizers delivering world-class hybrid experiences—seamlessly
            connecting in-person and virtual attendees.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-purple-600 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-xl"
              asChild
            >
              <Link href="/contact?demo=hybrid-events">
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
export default function HybridEventsPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <ProblemSection />
      <SolutionOverviewSection />
      <KeyFeaturesSection />
      <DualExperienceSection />
      <StreamingProvidersSection />
      <CTASection />
    </main>
  );
}