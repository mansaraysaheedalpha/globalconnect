// src/app/(public)/solutions/for-sponsors/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Sparkles,
  Building2,
  Users,
  TrendingUp,
  Target,
  MessageSquare,
  BarChart3,
  UserPlus,
  Mail,
  Bell,
  Eye,
  Download,
  Video,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Crown,
  Award,
  DollarSign,
  PieChart,
  LineChart,
  Send,
  Star,
  AlertTriangle,
  Layers,
  Settings,
  Globe,
  Phone,
  FileText,
  Calendar,
  UsersRound,
  Briefcase,
  BadgeCheck,
  ArrowUpRight,
  Activity,
  Wifi,
  QrCode,
  MousePointer,
  Radio,
  Flame,
  ThermometerSun,
  Snowflake,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  LayoutDashboard,
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
// REALISTIC SPONSOR DASHBOARD PREVIEW - Matches actual dashboard
// ============================================================================
function SponsorDashboardPreview() {
  const [stats, setStats] = useState({
    totalLeads: 156,
    hotLeads: 42,
    warmLeads: 67,
    coldLeads: 47,
    conversionRate: 28,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalLeads: prev.totalLeads + (Math.random() > 0.7 ? 1 : 0),
        hotLeads: prev.hotLeads + (Math.random() > 0.85 ? 1 : 0),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const recentLeads = [
    { name: "Sarah Chen", company: "TechCorp Inc.", intent: "hot", time: "2m ago", starred: true },
    { name: "Michael Brown", company: "InnovateCo", intent: "warm", time: "5m ago", starred: false },
    { name: "Emily Davis", company: "FutureTech", intent: "hot", time: "8m ago", starred: true },
    { name: "James Wilson", company: "DataDriven", intent: "cold", time: "12m ago", starred: false },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto perspective-1000">
      {/* Premium glow effect */}
      <motion.div
        className="absolute -inset-8 rounded-3xl opacity-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, rgba(239, 68, 68, 0.1) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Dashboard Frame with 3D effect */}
      <motion.div
        className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        initial={{ rotateX: 5, rotateY: -5 }}
        animate={{ rotateX: 0, rotateY: 0 }}
        transition={{ duration: 1 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Dashboard Header - matches real sidebar */}
        <div className="px-4 py-3 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Sponsor Dashboard</div>
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

        {/* Stats Grid - matches real dashboard 4-column layout */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {[
            { label: "Total Leads", value: stats.totalLeads, icon: Users, color: "blue", change: "+18%" },
            { label: "Hot Leads", value: stats.hotLeads, icon: Flame, color: "red", change: "+24%" },
            { label: "Conversion", value: `${stats.conversionRate}%`, icon: Activity, color: "green", change: "+5%" },
            { label: "Starred", value: 23, icon: Star, color: "amber", change: null },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <stat.icon className={cn(
                  "h-3.5 w-3.5",
                  stat.color === "blue" && "text-blue-400",
                  stat.color === "red" && "text-red-400",
                  stat.color === "green" && "text-green-400",
                  stat.color === "amber" && "text-amber-400"
                )} />
                {stat.change && (
                  <span className="text-[9px] font-medium text-emerald-400">{stat.change}</span>
                )}
              </div>
              <motion.div
                key={typeof stat.value === 'number' ? stat.value : stat.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-lg font-bold text-white"
              >
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </motion.div>
              <div className="text-[9px] text-white/40 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Two column layout like real dashboard */}
        <div className="px-4 pb-4 grid grid-cols-5 gap-3">
          {/* Recent Leads - matches real component */}
          <div className="col-span-3 rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-medium text-white/70">Recent Leads</span>
              <ChevronRight className="h-3 w-3 text-white/30" />
            </div>
            <div className="divide-y divide-white/5">
              {recentLeads.slice(0, 3).map((lead, index) => (
                <motion.div
                  key={lead.name}
                  className="px-3 py-2 flex items-center gap-2 hover:bg-white/[0.02] transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                    lead.intent === "hot" ? "bg-gradient-to-br from-red-500 to-red-600" :
                    lead.intent === "warm" ? "bg-gradient-to-br from-orange-500 to-orange-600" :
                    "bg-gradient-to-br from-blue-500 to-blue-600"
                  )}>
                    {lead.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-white truncate">{lead.name}</span>
                      {lead.starred && <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />}
                    </div>
                    <div className="text-[10px] text-white/40 truncate">{lead.company}</div>
                  </div>
                  {/* Intent badge - matches real colors */}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-medium border",
                    lead.intent === "hot" && "bg-red-500/10 text-red-400 border-red-500/20",
                    lead.intent === "warm" && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                    lead.intent === "cold" && "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  )}>
                    {lead.intent.charAt(0).toUpperCase() + lead.intent.slice(1)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Lead Intent Distribution - matches real dashboard */}
          <div className="col-span-2 rounded-xl bg-white/[0.02] border border-white/5 p-3">
            <div className="text-xs font-medium text-white/70 mb-3">Intent Distribution</div>
            <div className="space-y-2.5">
              {[
                { label: "Hot", count: stats.hotLeads, color: "red", percentage: 27 },
                { label: "Warm", count: stats.warmLeads, color: "orange", percentage: 43 },
                { label: "Cold", count: stats.coldLeads, color: "blue", percentage: 30 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {item.color === "red" && <Flame className="h-3 w-3 text-red-400" />}
                      {item.color === "orange" && <ThermometerSun className="h-3 w-3 text-orange-400" />}
                      {item.color === "blue" && <Snowflake className="h-3 w-3 text-blue-400" />}
                      <span className="text-[10px] text-white/60">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-medium text-white/80">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        item.color === "red" && "bg-gradient-to-r from-red-500 to-red-400",
                        item.color === "orange" && "bg-gradient-to-r from-orange-500 to-orange-400",
                        item.color === "blue" && "bg-gradient-to-r from-blue-500 to-blue-400"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// PREMIUM CHAOS VISUALIZATION - Tool Sprawl Problem
// ============================================================================
function SponsorChaosVisualization() {
  const [lostLeads, setLostLeads] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLostLeads(prev => [...prev.slice(-4), Date.now()]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const scatteredTools = [
    { icon: FileText, label: "Spreadsheets", x: 5, y: 15, rotation: -8, delay: 0 },
    { icon: Mail, label: "Email threads", x: 70, y: 10, rotation: 5, delay: 0.1 },
    { icon: MessageSquare, label: "Slack DMs", x: 75, y: 60, rotation: -4, delay: 0.2 },
    { icon: Phone, label: "Call notes", x: 8, y: 65, rotation: 6, delay: 0.3 },
    { icon: Clock, label: "Manual follow-ups", x: 50, y: 75, rotation: -3, delay: 0.4 },
  ];

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
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </motion.div>
          <span className="text-sm font-medium text-red-400">Leads Slipping Through the Cracks</span>
        </div>
      </motion.div>

      {/* Scattered tool cards */}
      {scatteredTools.map((tool, index) => (
        <motion.div
          key={tool.label}
          className="absolute"
          style={{ left: `${tool.x}%`, top: `${tool.y}%` }}
          initial={{ opacity: 0, scale: 0, rotate: tool.rotation }}
          animate={{
            opacity: 0.8,
            scale: 1,
            rotate: tool.rotation,
            y: [0, -5, 0],
          }}
          transition={{
            delay: tool.delay,
            y: { duration: 3, repeat: Infinity, delay: index * 0.5 }
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-red-500/20 text-white/70 text-xs backdrop-blur-sm shadow-lg">
            <tool.icon className="h-4 w-4 text-red-400/70 shrink-0" />
            <span>{tool.label}</span>
          </div>
        </motion.div>
      ))}

      {/* Center frustrated state */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="relative"
          animate={{ scale: [1, 0.98, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-red-500/20 flex items-center justify-center shadow-2xl">
            <Briefcase className="h-12 w-12 text-slate-600" />
          </div>
          {/* Disconnected lines */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <motion.div
              key={angle}
              className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-red-500/40 to-transparent origin-left"
              style={{ rotate: `${angle}deg` }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
        <div className="text-center mt-4">
          <div className="text-slate-500 text-sm font-medium">Disconnected Tools</div>
          <div className="text-slate-600 text-xs">No single source of truth</div>
        </div>
      </motion.div>

      {/* Leads escaping animation */}
      <AnimatePresence>
        {lostLeads.map((id, index) => (
          <motion.div
            key={id}
            className="absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium"
            initial={{
              left: "45%",
              top: "50%",
              opacity: 1,
              scale: 1
            }}
            animate={{
              left: `${15 + index * 18}%`,
              top: "-5%",
              opacity: 0,
              scale: 0.6
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            <DollarSign className="h-3 w-3" />
            Lost lead
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Bottom stats showing poor performance */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-6">
        {[
          { label: "Lead Follow-up", value: "< 20%", color: "red" },
          { label: "Data Accuracy", value: "~40%", color: "orange" },
          { label: "ROI Tracked", value: "0%", color: "red" },
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
// UNIFIED DASHBOARD MOCKUP - Full Featured
// ============================================================================
function UnifiedDashboardMockup() {
  const [activeTab, setActiveTab] = useState("overview");
  const [leads, setLeads] = useState({ total: 156, hot: 42, warm: 67, cold: 47 });

  useEffect(() => {
    const interval = setInterval(() => {
      setLeads(prev => ({
        ...prev,
        total: prev.total + (Math.random() > 0.7 ? 1 : 0),
        hot: prev.hot + (Math.random() > 0.9 ? 1 : 0),
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: PieChart },
    { id: "leads", label: "Leads", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "booth", label: "Booth", icon: Building2 },
  ];

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-blue-500/10 rounded-3xl blur-3xl -z-10" />

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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Sponsor Hub</h3>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>Tech Summit 2024</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">Platinum</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <motion.div
                  key={leads.total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-blue-400"
                >
                  {leads.total} Leads
                </motion.div>
                <div className="text-xs text-white/50">+24 today</div>
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
          {/* Stats Row - matches real dashboard */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Leads", value: leads.total, change: "+18%", icon: Users, color: "blue" },
              { label: "Hot Leads", value: leads.hot, change: "+24%", icon: Flame, color: "red" },
              { label: "Booth Visits", value: "1,247", change: "+32%", icon: Eye, color: "purple" },
              { label: "Meetings Booked", value: "34", change: "+45%", icon: Video, color: "green" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    stat.color === "blue" && "bg-blue-500/10",
                    stat.color === "red" && "bg-red-500/10",
                    stat.color === "purple" && "bg-purple-500/10",
                    stat.color === "green" && "bg-green-500/10"
                  )}>
                    <stat.icon className={cn(
                      "h-5 w-5",
                      stat.color === "blue" && "text-blue-400",
                      stat.color === "red" && "text-red-400",
                      stat.color === "purple" && "text-purple-400",
                      stat.color === "green" && "text-green-400"
                    )} />
                  </div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.change}</span>
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
            {/* Lead Pipeline - left side */}
            <div className="col-span-8 space-y-6">
              {/* Lead Funnel */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-white">Lead Pipeline</h4>
                  <span className="text-xs text-white/40">This event</span>
                </div>
                <div className="space-y-4">
                  {[
                    { stage: "Booth Visitors", count: 1247, percentage: 100, color: "slate" },
                    { stage: "Engaged", count: 456, percentage: 37, color: "blue" },
                    { stage: "Qualified Leads", count: leads.total, percentage: 12, color: "purple" },
                    { stage: "Hot Leads", count: leads.hot, percentage: 3, color: "red" },
                  ].map((item, index) => (
                    <div key={item.stage} className="flex items-center gap-4">
                      <div className="w-28 text-xs text-white/60">{item.stage}</div>
                      <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
                        <motion.div
                          className={cn(
                            "h-full rounded-lg flex items-center justify-end pr-3",
                            item.color === "slate" && "bg-gradient-to-r from-slate-600 to-slate-500",
                            item.color === "blue" && "bg-gradient-to-r from-blue-600 to-blue-500",
                            item.color === "purple" && "bg-gradient-to-r from-purple-600 to-purple-500",
                            item.color === "red" && "bg-gradient-to-r from-red-600 to-red-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, delay: 0.3 + index * 0.15 }}
                        >
                          {item.percentage > 15 && (
                            <span className="text-xs font-medium text-white">{item.percentage}%</span>
                          )}
                        </motion.div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium text-white">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini chart area */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-white">Leads Over Time</h4>
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Hot</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" /> Warm</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Cold</span>
                  </div>
                </div>
                {/* Simulated area chart */}
                <div className="h-32 flex items-end gap-1">
                  {[40, 55, 45, 65, 50, 70, 85, 75, 90, 80, 95, 100].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-500/20 via-blue-500/40 to-blue-500"
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="col-span-4 space-y-4">
              {/* Intent Distribution */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-medium text-white mb-4 text-sm">Intent Distribution</h4>
                <div className="space-y-3">
                  {[
                    { label: "Hot", count: leads.hot, icon: Flame, color: "red", percentage: 27 },
                    { label: "Warm", count: leads.warm, icon: ThermometerSun, color: "orange", percentage: 43 },
                    { label: "Cold", count: leads.cold, icon: Snowflake, color: "blue", percentage: 30 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <item.icon className={cn(
                            "h-3.5 w-3.5",
                            item.color === "red" && "text-red-400",
                            item.color === "orange" && "text-orange-400",
                            item.color === "blue" && "text-blue-400"
                          )} />
                          <span className="text-xs text-white/60">{item.label}</span>
                        </div>
                        <span className="text-xs font-medium text-white">{item.count}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            item.color === "red" && "bg-gradient-to-r from-red-600 to-red-400",
                            item.color === "orange" && "bg-gradient-to-r from-orange-600 to-orange-400",
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

              {/* Quick Actions */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-medium text-white mb-3 text-sm">Quick Actions</h4>
                <div className="space-y-2">
                  {[
                    { icon: QrCode, label: "Scan Lead", color: "blue" },
                    { icon: Download, label: "Export to CRM", color: "green" },
                    { icon: Send, label: "Send Campaign", color: "purple" },
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

              {/* Team Online */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {["SC", "MB", "JW"].map((initials) => (
                        <div
                          key={initials}
                          className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white"
                        >
                          {initials}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">3 Team Online</div>
                      <div className="text-xs text-white/50">At booth now</div>
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
// LIVE LEAD FEED - Real-time Animation
// ============================================================================
function LiveLeadFeed() {
  const [leads, setLeads] = useState([
    { id: 1, name: "Sarah Chen", company: "TechCorp Inc.", action: "Requested demo", intent: "hot", time: "Just now" },
    { id: 2, name: "Michael Brown", company: "InnovateCo", action: "Downloaded whitepaper", intent: "warm", time: "2m ago" },
  ]);

  const sampleLeads = [
    { name: "Emily Davis", company: "FutureTech", action: "Started video call", intent: "hot" },
    { name: "James Wilson", company: "DataDriven", action: "Submitted contact form", intent: "hot" },
    { name: "Lisa Anderson", company: "CloudFirst", action: "Visited booth 5x", intent: "warm" },
    { name: "Robert Taylor", company: "AIStartup", action: "Downloaded case study", intent: "warm" },
    { name: "Jennifer Lee", company: "ScaleUp", action: "Scanned QR code", intent: "cold" },
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      const newLead = { ...sampleLeads[index % sampleLeads.length], id: Date.now(), time: "Just now" };
      setLeads(prev => [newLead, ...prev.slice(0, 4)]);
      index++;
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {leads.map((lead) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, x: -30, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, x: 30, height: 0 }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm",
              lead.intent === "hot"
                ? "bg-red-500/10 border-red-500/20"
                : lead.intent === "warm"
                  ? "bg-orange-500/10 border-orange-500/20"
                  : "bg-blue-500/10 border-blue-500/20"
            )}
          >
            <div className={cn(
              "h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0",
              lead.intent === "hot"
                ? "bg-gradient-to-br from-red-500 to-red-600"
                : lead.intent === "warm"
                  ? "bg-gradient-to-br from-orange-500 to-orange-600"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
            )}>
              {lead.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{lead.name}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-bold border",
                  lead.intent === "hot" && "bg-red-500/20 text-red-500 border-red-500/30",
                  lead.intent === "warm" && "bg-orange-500/20 text-orange-500 border-orange-500/30",
                  lead.intent === "cold" && "bg-blue-500/20 text-blue-500 border-blue-500/30"
                )}>
                  {lead.intent.charAt(0).toUpperCase() + lead.intent.slice(1)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground truncate">{lead.company} • {lead.action}</div>
            </div>
            <div className="text-xs text-muted-foreground shrink-0">{lead.time}</div>
            {lead.intent === "hot" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30"
              >
                <Flame className="h-3 w-3 text-red-500" />
                <span className="text-xs font-bold text-red-500">HOT</span>
              </motion.div>
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
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 -z-10" />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[150px]"
          animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[180px]"
          animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] -z-5" />

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
                <Crown className="h-4 w-4 text-blue-400" />
                For Sponsors
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-purple-400" />
                AI Lead Scoring
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-sm font-medium">
                <Flame className="h-4 w-4 text-red-400" />
                Hot Lead Alerts
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Your Unified{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Sponsor Hub
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
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
              One dashboard for lead capture, booth analytics, team coordination, and ROI tracking.
              Know exactly who&apos;s hot, warm, or cold—in real-time.
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
                <Link href="/contact?demo=sponsor-hub">
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
                { value: "3.2x", label: "More Leads Captured" },
                { value: "< 1s", label: "Hot Lead Alerts" },
                { value: "100%", label: "ROI Visibility" },
                { value: "Zero", label: "Lost Leads" },
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

          {/* Right: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <SponsorDashboardPreview />
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
// PROBLEM SECTION
// ============================================================================
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      stat: "67%",
      title: "Leads Never Followed Up",
      description: "Without real-time alerts, most leads go cold before your team even knows they existed",
      icon: Users,
      gradient: "from-red-500 to-rose-500",
    },
    {
      stat: "5+",
      title: "Disconnected Tools",
      description: "Spreadsheets, email, CRM, and event apps with no integration or single source of truth",
      icon: Layers,
      gradient: "from-orange-500 to-amber-500",
    },
    {
      stat: "0%",
      title: "ROI Visibility",
      description: "No way to prove sponsorship value or track which leads converted to customers",
      icon: TrendingUp,
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
            The Sponsor&apos;s Dilemma
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Sponsoring Without{" "}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Visibility is Expensive Guesswork
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Traditional event sponsorships leave you flying blind—scattered data,
            no lead prioritization, and no way to prove ROI.
          </p>
        </motion.div>

        {/* Chaos Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <SponsorChaosVisualization />
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
              <div className="h-full p-6 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm hover:border-white/10 transition-all duration-500">
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
// DASHBOARD OVERVIEW SECTION
// ============================================================================
function DashboardOverviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[200px]"
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
            <LayoutDashboard className="h-4 w-4" />
            One Unified Dashboard
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Nothing You Don&apos;t
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Leads, analytics, booth management, team coordination, and messaging—all
            unified in a dashboard designed specifically for sponsors.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <UnifiedDashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES SECTION
// ============================================================================
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Target,
      title: "AI Lead Intelligence",
      description: "Automatic Hot/Warm/Cold scoring based on engagement signals. Get instant alerts when high-value leads engage.",
      href: "/solutions/lead-scoring",
      gradient: "from-red-500 to-orange-500",
      badge: "AI-Powered",
    },
    {
      icon: QrCode,
      title: "Instant Lead Capture",
      description: "Scan badges or QR codes for instant lead capture. Manual entry fallback with smart field suggestions.",
      href: "/solutions/lead-scoring",
      gradient: "from-blue-500 to-cyan-500",
      badge: "Popular",
    },
    {
      icon: Building2,
      title: "Virtual Booth",
      description: "Branded booth with video calls, live chat, resource downloads, and real-time staff presence indicators.",
      href: "/solutions/virtual-booth",
      gradient: "from-purple-500 to-pink-500",
      badge: null,
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track booth visits, lead pipeline, conversion rates, and engagement trends with exportable reports.",
      href: "#",
      gradient: "from-green-500 to-emerald-500",
      badge: null,
    },
    {
      icon: UsersRound,
      title: "Team Management",
      description: "Invite team members, assign booth shifts, share leads, and coordinate in real-time during events.",
      href: "#",
      gradient: "from-amber-500 to-orange-500",
      badge: null,
    },
    {
      icon: Send,
      title: "Email Campaigns",
      description: "Send targeted follow-ups to leads, track open rates and clicks, and integrate with your CRM.",
      href: "#",
      gradient: "from-indigo-500 to-violet-500",
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/20">
            <Sparkles className="h-4 w-4" />
            Complete Toolkit
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Everything Sponsors{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Need to Succeed
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From lead capture to ROI reporting, the Sponsor Hub gives you complete
            control over your event presence.
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
                        feature.badge === "AI-Powered"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      )}>
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                  <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
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
// LEAD INTELLIGENCE SECTION
// ============================================================================
function LeadIntelligenceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 rounded-full border border-red-500/20">
              <Flame className="h-4 w-4" />
              AI Lead Intelligence
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Know Who&apos;s{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Hot, Warm, or Cold
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              AI automatically scores every lead based on engagement signals—booth visits,
              downloads, video calls, chat messages—and categorizes them instantly.
            </p>

            <ul className="space-y-4">
              {[
                { icon: Flame, text: "Hot leads trigger instant push notifications", color: "red" },
                { icon: ThermometerSun, text: "Warm leads get prioritized follow-up suggestions", color: "orange" },
                { icon: Snowflake, text: "Cold leads are nurtured with automated drip campaigns", color: "blue" },
                { icon: Download, text: "One-click export to Salesforce, HubSpot, or CSV", color: "green" },
              ].map((feature, i) => (
                <motion.li
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    feature.color === "red" && "bg-red-500/10",
                    feature.color === "orange" && "bg-orange-500/10",
                    feature.color === "blue" && "bg-blue-500/10",
                    feature.color === "green" && "bg-green-500/10"
                  )}>
                    <feature.icon className={cn(
                      "h-5 w-5",
                      feature.color === "red" && "text-red-500",
                      feature.color === "orange" && "text-orange-500",
                      feature.color === "blue" && "text-blue-500",
                      feature.color === "green" && "text-green-500"
                    )} />
                  </div>
                  <span>{feature.text}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
              className="mt-10"
            >
              <Button asChild size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                <Link href="/solutions/lead-scoring">
                  Explore Lead Intelligence
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Lead Feed Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/15 via-orange-500/10 to-blue-500/15 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl border bg-card overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-blue-500/10 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">Live Lead Feed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-emerald-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    Capturing
                  </div>
                </div>

                <div className="p-4 min-h-[380px]">
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
// TECHNICAL SECTION
// ============================================================================
function TechnicalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: Wifi, title: "Real-Time Sync", description: "WebSocket connections for instant lead updates", stat: "<100ms", gradient: "from-blue-500 to-cyan-500" },
    { icon: Shield, title: "Enterprise Security", description: "SOC 2 Type II compliant infrastructure", stat: "SOC 2", gradient: "from-purple-500 to-pink-500" },
    { icon: Globe, title: "CRM Integration", description: "Native sync with Salesforce, HubSpot, Marketo", stat: "10+", gradient: "from-green-500 to-emerald-500" },
    { icon: Activity, title: "99.99% Uptime", description: "Enterprise SLA with dedicated support", stat: "99.99%", gradient: "from-amber-500 to-orange-500" },
    { icon: Users, title: "Unlimited Team", description: "Add as many team members as needed", stat: "∞", gradient: "from-indigo-500 to-violet-500" },
    { icon: BarChart3, title: "Custom Reports", description: "Build custom dashboards and exports", stat: "Custom", gradient: "from-red-500 to-rose-500" },
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
            Enterprise-Ready
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Built for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Enterprise Scale
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            The same infrastructure trusted by Fortune 500 companies—now powering
            your sponsorship success.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -3 }}
              className="group"
            >
              <div className="h-full p-5 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm hover:border-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "h-11 w-11 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg",
                    feature.gradient
                  )}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={cn(
                    "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
                    feature.gradient
                  )}>
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 -z-10" />
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
              <Crown className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to Maximize Your Sponsorship ROI?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join sponsors who&apos;ve transformed their event presence with AI-powered
            lead scoring, real-time analytics, and unified team management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-blue-600 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-xl"
              asChild
            >
              <Link href="/contact?demo=sponsor-hub">
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
export default function ForSponsorsPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <ProblemSection />
      <DashboardOverviewSection />
      <FeaturesSection />
      <LeadIntelligenceSection />
      <TechnicalSection />
      <CTASection />
    </main>
  );
}
