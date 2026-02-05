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
// ANIMATED SPONSOR DASHBOARD PREVIEW
// ============================================================================
function SponsorDashboardPreview() {
  const [leads, setLeads] = useState(156);
  const [visitors, setVisitors] = useState(1247);
  const [meetings, setMeetings] = useState(34);
  const [roi, setRoi] = useState(847);

  useEffect(() => {
    const interval = setInterval(() => {
      setLeads(prev => prev + (Math.random() > 0.6 ? 1 : 0));
      setVisitors(prev => prev + Math.floor(Math.random() * 5));
      setMeetings(prev => prev + (Math.random() > 0.85 ? 1 : 0));
      setRoi(prev => Math.min(999, prev + Math.floor(Math.random() * 10)));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const recentLeads = [
    { name: "Sarah Chen", company: "TechCorp", score: 92, action: "Requested demo" },
    { name: "Michael Brown", company: "InnovateCo", score: 87, action: "Downloaded whitepaper" },
    { name: "Emily Davis", company: "FutureTech", score: 78, action: "Visited booth 3x" },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 rounded-3xl blur-2xl"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Dashboard Frame */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border-2 border-emerald-500/30 overflow-hidden shadow-2xl">
        {/* Dashboard Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Sponsor Hub</div>
              <div className="text-xs text-white/60">TechCorp • Platinum</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[10px] font-medium text-emerald-400">LIVE</span>
            </motion.div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {[
            { label: "Leads", value: leads, icon: UserPlus, color: "emerald" },
            { label: "Visitors", value: visitors, icon: Users, color: "teal" },
            { label: "Meetings", value: meetings, icon: Calendar, color: "cyan" },
            { label: "ROI %", value: roi, icon: TrendingUp, color: "green" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="text-center p-2 rounded-lg bg-white/5 border border-white/5"
              whileHover={{ scale: 1.05 }}
            >
              <stat.icon className={cn(
                "h-4 w-4 mx-auto mb-1",
                stat.color === "emerald" && "text-emerald-400",
                stat.color === "teal" && "text-teal-400",
                stat.color === "cyan" && "text-cyan-400",
                stat.color === "green" && "text-green-400"
              )} />
              <motion.div
                key={stat.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-lg font-bold text-white"
              >
                {stat.value.toLocaleString()}
              </motion.div>
              <div className="text-[10px] text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Leads */}
        <div className="px-4 pb-4">
          <div className="text-xs text-white/50 mb-2">Hot Leads</div>
          <div className="space-y-2">
            {recentLeads.map((lead, index) => (
              <motion.div
                key={lead.name}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {lead.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white truncate">{lead.name}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold",
                      lead.score >= 85 ? "bg-emerald-500/20 text-emerald-400" : "bg-teal-500/20 text-teal-400"
                    )}>
                      {lead.score}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/40 truncate">{lead.company} • {lead.action}</div>
                </div>
                {lead.score >= 85 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="h-4 w-4 text-amber-400" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SPONSOR CHAOS VISUALIZATION - Problems sponsors face
// ============================================================================
function SponsorChaosVisualization() {
  const [scatteredData, setScatteredData] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setScatteredData(prev => {
        const newId = Date.now();
        return [...prev.slice(-5), newId];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const painPoints = [
    { icon: FileText, label: "Manual spreadsheets", x: 8, y: 20, rotation: -6 },
    { icon: Mail, label: "Lost in email", x: 65, y: 15, rotation: 4 },
    { icon: Users, label: "No lead tracking", x: 75, y: 65, rotation: -5 },
    { icon: BarChart3, label: "No ROI data", x: 10, y: 70, rotation: 8 },
    { icon: Clock, label: "Delayed follow-ups", x: 55, y: 80, rotation: -3 },
  ];

  return (
    <div className="relative w-full h-[350px] rounded-2xl border border-red-500/20 bg-slate-900/50 overflow-hidden">
      {/* Warning overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2 z-20">
        <AlertTriangle className="h-4 w-4" />
        Leads Slipping Away
      </div>

      {/* Scattered pain points */}
      {painPoints.map((point, index) => (
        <motion.div
          key={point.label}
          className="absolute"
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7, scale: 1, rotate: point.rotation }}
          transition={{ delay: index * 0.15 }}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <point.icon className="h-4 w-4 shrink-0" />
            <span>{point.label}</span>
          </div>
        </motion.div>
      ))}

      {/* Leads escaping animation */}
      <AnimatePresence>
        {scatteredData.map((id, index) => (
          <motion.div
            key={id}
            className="absolute flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs"
            initial={{
              left: "45%",
              top: "45%",
              opacity: 1,
              scale: 1
            }}
            animate={{
              left: `${20 + index * 15}%`,
              top: "-10%",
              opacity: 0,
              scale: 0.5
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          >
            <DollarSign className="h-3 w-3" />
            Lead lost
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Center frustrated indicator */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-slate-800/80 border-2 border-red-500/30 flex items-center justify-center"
          animate={{ scale: [1, 0.95, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Briefcase className="h-10 w-10 text-slate-500" />
        </motion.div>
        <div className="text-center mt-3">
          <div className="text-slate-500 text-sm font-medium">Traditional Sponsorship</div>
          <div className="text-slate-600 text-xs">Zero visibility • Manual work</div>
        </div>
      </motion.div>

      {/* Poor stats */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
        {[
          { label: "Lead Capture", value: "23%", bad: true },
          { label: "Follow-up Rate", value: "12%", bad: true },
          { label: "ROI Tracked", value: "0%", bad: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-center"
          >
            <div className="text-lg font-bold text-red-400">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// UNIFIED DASHBOARD MOCKUP
// ============================================================================
function UnifiedDashboardMockup() {
  const [activeTab, setActiveTab] = useState("overview");
  const [leadCount, setLeadCount] = useState(156);
  const [engagement, setEngagement] = useState(87);

  useEffect(() => {
    const interval = setInterval(() => {
      setLeadCount(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      setEngagement(prev => Math.min(100, Math.max(70, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: PieChart },
    { id: "leads", label: "Leads", icon: UserPlus },
    { id: "booth", label: "Booth", icon: Building2 },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="relative max-w-5xl mx-auto">
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Sponsor Hub</h3>
                <p className="text-xs text-white/60">Tech Summit 2024 • Platinum Sponsor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-400">{leadCount} Leads</div>
                <div className="text-xs text-white/50">+24 today</div>
              </div>
              <motion.div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="h-2 w-2 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.2, 1] }}
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
                    : "text-white/50 hover:text-white/80"
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
        <div className="p-6 grid grid-cols-12 gap-4">
          {/* Main metrics */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Leads", value: leadCount, change: "+18%", icon: UserPlus, color: "emerald" },
                { label: "Booth Visits", value: "1,247", change: "+32%", icon: Eye, color: "teal" },
                { label: "Meetings", value: "34", change: "+45%", icon: Video, color: "cyan" },
                { label: "Downloads", value: "384", change: "+28%", icon: Download, color: "blue" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={cn(
                      "h-5 w-5",
                      stat.color === "emerald" && "text-emerald-400",
                      stat.color === "teal" && "text-teal-400",
                      stat.color === "cyan" && "text-cyan-400",
                      stat.color === "blue" && "text-blue-400"
                    )} />
                    <span className="text-xs font-medium text-emerald-400">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
                  <div className="text-xs text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Lead funnel */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-white">Lead Pipeline</div>
                <div className="text-xs text-white/50">This event</div>
              </div>
              <div className="space-y-3">
                {[
                  { stage: "Visitors", count: 1247, percentage: 100, color: "from-slate-500 to-slate-600" },
                  { stage: "Engaged", count: 456, percentage: 37, color: "from-teal-500 to-cyan-500" },
                  { stage: "Leads", count: 156, percentage: 12, color: "from-emerald-500 to-green-500" },
                  { stage: "Hot Leads", count: 42, percentage: 3, color: "from-amber-500 to-orange-500" },
                ].map((item) => (
                  <div key={item.stage} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-white/60">{item.stage}</div>
                    <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full bg-gradient-to-r rounded-full", item.color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-white">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Engagement Score */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-sm font-medium text-white mb-3">Booth Engagement</div>
              <div className="relative flex items-center justify-center py-2">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                  <motion.circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="url(#sponsorGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * engagement) / 100 }}
                    transition={{ duration: 1 }}
                  />
                  <defs>
                    <linearGradient id="sponsorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      className="text-2xl font-bold text-white"
                      key={engagement}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                    >
                      {engagement}%
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="text-center text-xs text-emerald-400 font-medium mt-1">
                Above average
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-sm font-medium text-white mb-3">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { icon: Send, label: "Message Attendees", color: "emerald" },
                  { icon: Download, label: "Export Leads", color: "teal" },
                  { icon: BarChart3, label: "View Reports", color: "cyan" },
                ].map((action) => (
                  <motion.button
                    key={action.label}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                  >
                    <action.icon className={cn(
                      "h-4 w-4",
                      action.color === "emerald" && "text-emerald-400",
                      action.color === "teal" && "text-teal-400",
                      action.color === "cyan" && "text-cyan-400"
                    )} />
                    <span className="text-sm text-white/80">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Team Online */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["JD", "SM", "AK"].map((initials, i) => (
                      <div
                        key={initials}
                        className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs">
                    <div className="text-white font-medium">3 Team Online</div>
                    <div className="text-white/50">At booth</div>
                  </div>
                </div>
                <motion.div
                  className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/20 rounded-3xl blur-3xl -z-10" />
    </div>
  );
}

// ============================================================================
// LIVE LEAD FEED COMPONENT
// ============================================================================
function LiveLeadFeed() {
  const [leads, setLeads] = useState<{ id: number; name: string; company: string; action: string; score: number; time: string }[]>([
    { id: 1, name: "Sarah Chen", company: "TechCorp", action: "Requested demo", score: 92, time: "Just now" },
    { id: 2, name: "Michael Brown", company: "InnovateCo", action: "Downloaded whitepaper", score: 85, time: "2m ago" },
  ]);

  const sampleLeads = [
    { name: "Emily Davis", company: "FutureTech", action: "Started video call", score: 78, time: "Just now" },
    { name: "James Wilson", company: "DataDriven", action: "Submitted contact form", score: 94, time: "Just now" },
    { name: "Lisa Anderson", company: "CloudFirst", action: "Visited booth 5x", score: 67, time: "Just now" },
    { name: "Robert Taylor", company: "AIStartup", action: "Downloaded case study", score: 82, time: "Just now" },
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      const newLead = { ...sampleLeads[index % sampleLeads.length], id: Date.now() };
      setLeads(prev => [newLead, ...prev.slice(0, 4)]);
      index++;
    }, 4000);
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
              "flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm",
              lead.score >= 85
                ? "bg-emerald-500/10 border-emerald-500/30"
                : lead.score >= 70
                  ? "bg-teal-500/10 border-teal-500/30"
                  : "bg-white/5 border-white/10"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0",
              lead.score >= 85
                ? "bg-gradient-to-br from-emerald-400 to-green-500"
                : "bg-gradient-to-br from-teal-400 to-cyan-500"
            )}>
              {lead.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{lead.name}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-bold",
                  lead.score >= 85 ? "bg-emerald-500/20 text-emerald-400" : "bg-teal-500/20 text-teal-400"
                )}>
                  {lead.score}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{lead.company} • {lead.action}</div>
            </div>
            <div className="text-xs text-muted-foreground shrink-0">{lead.time}</div>
            {lead.score >= 85 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0"
              >
                HOT
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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 -z-10" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Content */}
      <div className="container px-4 md:px-6 max-w-7xl relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left text-white">
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-sm font-medium">
                <Crown className="h-4 w-4 text-emerald-400" />
                For Sponsors
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 backdrop-blur-sm border border-teal-500/30 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-teal-400" />
                AI-Powered
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
                <Zap className="h-4 w-4 text-amber-400" />
                Real-Time
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              Your Sponsor{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Command Center
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full"
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
              One unified dashboard for leads, booth analytics, team coordination, and attendee messaging.
              Maximize ROI with AI-powered insights and real-time engagement tools.
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
                className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold h-14 px-8 text-lg shadow-lg shadow-emerald-500/25"
                asChild
              >
                <Link href="/contact?demo=sponsor-hub">
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
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              {[
                { value: "3.2x", label: "More Leads" },
                { value: "847%", label: "Avg. ROI" },
                { value: "<1s", label: "Lead Alerts" },
                { value: "100%", label: "Visibility" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
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
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
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
      title: "Leads Lost",
      description: "of potential leads are never followed up due to manual tracking",
      icon: UserPlus,
      gradient: "from-red-500 to-orange-500",
    },
    {
      stat: "0%",
      title: "ROI Visibility",
      description: "Most sponsors can't measure actual return on their investment",
      icon: TrendingUp,
      gradient: "from-orange-500 to-amber-500",
    },
    {
      stat: "5+",
      title: "Disconnected Tools",
      description: "Spreadsheets, email, CRM, and event app with no integration",
      icon: Layers,
      gradient: "from-amber-500 to-yellow-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[180px]"
          animate={{ x: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px]"
          animate={{ x: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
            <AlertTriangle className="h-4 w-4" />
            The Challenge
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Sponsorship Without{" "}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Visibility is Guesswork
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Traditional event sponsorships leave you flying blind—no real-time data,
            no lead tracking, and no way to prove ROI.
          </p>
        </motion.div>

        {/* Chaos Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <SponsorChaosVisualization />
        </motion.div>

        {/* Problem Stats */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {problems.map((problem, index) => (
            <motion.div key={problem.title} variants={fadeInUp} className="relative group">
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
// DASHBOARD OVERVIEW SECTION
// ============================================================================
function DashboardOverviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
            <Crown className="h-4 w-4" />
            Unified Dashboard
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Everything in{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              One Place
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Leads, analytics, booth management, team coordination, and messaging—all
            unified in a single, powerful dashboard designed for sponsors.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
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
      icon: UserPlus,
      title: "AI Lead Intelligence",
      description: "Automatic lead capture with AI scoring, real-time alerts for hot leads, and pipeline tracking",
      href: "/solutions/lead-scoring",
      gradient: "from-emerald-500 to-green-500",
      badge: "AI-Powered",
    },
    {
      icon: Building2,
      title: "Virtual Booth",
      description: "Branded booth pages with video calls, live chat, resource library, and staff presence",
      href: "/solutions/virtual-booth",
      gradient: "from-teal-500 to-cyan-500",
      badge: "Popular",
    },
    {
      icon: MessageSquare,
      title: "Direct Messaging",
      description: "Message attendees directly, send targeted announcements, and schedule follow-ups",
      href: "#",
      gradient: "from-blue-500 to-indigo-500",
      badge: null,
    },
    {
      icon: BarChart3,
      title: "ROI Analytics",
      description: "Track booth visits, engagement metrics, lead conversion, and calculate true sponsorship ROI",
      href: "#",
      gradient: "from-violet-500 to-purple-500",
      badge: null,
    },
    {
      icon: UsersRound,
      title: "Team Management",
      description: "Invite team members, assign booth shifts, share leads, and coordinate in real-time",
      href: "#",
      gradient: "from-pink-500 to-rose-500",
      badge: null,
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Export leads to your CRM, download reports, and sync with your existing tools",
      href: "#",
      gradient: "from-amber-500 to-orange-500",
      badge: null,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full border border-teal-500/20">
            <Sparkles className="h-4 w-4" />
            Complete Toolkit
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Everything Sponsors{" "}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
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
                <div className="h-full p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-card hover:border-emerald-500/30 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br",
                      feature.gradient
                    )}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    {feature.badge && (
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        feature.badge === "AI-Powered"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                      )}>
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                  <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
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
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
              <Target className="h-4 w-4" />
              AI Lead Intelligence
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Never Miss a{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                Hot Lead Again
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              AI automatically scores every interaction—booth visits, downloads, video calls,
              chat messages—and alerts you instantly when a high-value lead engages.
            </p>

            <ul className="space-y-4">
              {[
                { icon: Sparkles, text: "AI-powered lead scoring based on engagement signals" },
                { icon: Bell, text: "Instant push notifications for hot leads" },
                { icon: TrendingUp, text: "Visual pipeline tracking from visitor to customer" },
                { icon: Download, text: "One-click export to Salesforce, HubSpot, or CSV" },
              ].map((feature, i) => (
                <motion.li
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                    <feature.icon className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span>{feature.text}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
              className="mt-8"
            >
              <Button asChild className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
                <Link href="/solutions/lead-scoring">
                  Explore Lead Intelligence
                  <ArrowRight className="ml-2 h-4 w-4" />
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
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl border bg-card overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-emerald-500" />
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

                <div className="p-4 min-h-[350px]">
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
    { icon: Wifi, title: "Real-Time Sync", description: "WebSocket connections for instant updates", stat: "<100ms", gradient: "from-emerald-500 to-teal-500" },
    { icon: Shield, title: "Enterprise Security", description: "SOC 2 compliant with end-to-end encryption", stat: "SOC 2", gradient: "from-teal-500 to-cyan-500" },
    { icon: Globe, title: "CRM Integration", description: "Native sync with Salesforce, HubSpot, Marketo", stat: "10+ CRMs", gradient: "from-cyan-500 to-blue-500" },
    { icon: Activity, title: "99.99% Uptime", description: "Enterprise SLA with dedicated support", stat: "99.99%", gradient: "from-blue-500 to-indigo-500" },
    { icon: Users, title: "Unlimited Team", description: "Add as many team members as you need", stat: "Unlimited", gradient: "from-indigo-500 to-violet-500" },
    { icon: BarChart3, title: "Custom Reports", description: "Build custom dashboards and exports", stat: "Custom", gradient: "from-violet-500 to-purple-500" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:40px_40px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
            <Shield className="h-4 w-4" />
            Enterprise-Ready
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Built for{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
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
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group"
            >
              <div className="h-full p-5 rounded-xl border border-emerald-500/20 bg-slate-900/50 backdrop-blur-sm hover:border-emerald-500/40 transition-all">
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
                <h3 className="font-semibold text-white/90 mb-1">{feature.title}</h3>
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
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-green-400/30 rounded-full blur-[120px]"
        animate={{ x: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/30 rounded-full blur-[120px]"
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
            <Crown className="h-16 w-16 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to Maximize Your Sponsorship ROI?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join sponsors who&apos;ve transformed their event presence with AI-powered lead capture,
            real-time analytics, and unified team management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-emerald-600 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-lg"
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
