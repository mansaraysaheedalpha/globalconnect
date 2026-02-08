// src/app/(public)/solutions/virtual-booth/page.tsx
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
  Video,
  MessageSquare,
  Users,
  Download,
  Eye,
  MousePointer,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Layout,
  Zap,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  Star,
  Phone,
  Mail,
  Globe,
  Shield,
  Wifi,
  BarChart3,
  Layers,
  Settings,
  UserPlus,
  Crown,
  Award,
  Gift,
  Calendar,
  PlayCircle,
  Headphones,
  ExternalLink,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  Send,
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
// ANIMATED BOOTH PREVIEW - 3D-style booth visualization
// ============================================================================
function AnimatedBoothPreview() {
  const [activeVisitors, setActiveVisitors] = useState(12);
  const [chatMessages, setChatMessages] = useState(0);
  const [leadsCapture, setLeadsCaptured] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVisitors((prev) => Math.max(5, prev + Math.floor(Math.random() * 5) - 2));
      setChatMessages((prev) => prev + Math.floor(Math.random() * 3));
      setLeadsCaptured((prev) => prev + (Math.random() > 0.7 ? 1 : 0));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-4 bg-gradient-to-r from-violet-500/30 via-purple-500/30 to-fuchsia-500/30 rounded-3xl blur-2xl"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Booth Frame */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border-2 border-violet-500/30 overflow-hidden shadow-2xl">
        {/* Booth Header/Banner */}
        <div className="relative h-32 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Building2 className="h-6 w-6" />
                <span className="text-xl font-bold">TechCorp</span>
              </div>
              <p className="text-sm text-white/80">Innovation Partner</p>
            </div>
          </div>

          {/* Tier Badge */}
          <motion.div
            className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-xs font-bold text-black flex items-center gap-1"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="h-3 w-3" />
            PLATINUM
          </motion.div>

          {/* Live indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs text-white">
            <motion.div
              className="h-2 w-2 rounded-full bg-green-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            LIVE
          </div>
        </div>

        {/* Booth Content */}
        <div className="p-4 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Users, label: "Visitors", value: activeVisitors, color: "text-violet-400" },
              { icon: MessageSquare, label: "Chats", value: chatMessages, color: "text-fuchsia-400" },
              { icon: UserPlus, label: "Leads", value: leadsCapture, color: "text-green-400" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="text-center p-2 rounded-xl bg-slate-800/50 border border-slate-700/50"
                whileHover={{ scale: 1.05 }}
              >
                <stat.icon className={cn("h-4 w-4 mx-auto mb-1", stat.color)} />
                <motion.div
                  key={stat.value}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-white"
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Video className="h-4 w-4" />
              Video Call
            </motion.button>
            <motion.button
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare className="h-4 w-4" />
              Live Chat
            </motion.button>
          </div>

          {/* Resources Preview */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">Resources</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: FileText, label: "Product Guide" },
                { icon: PlayCircle, label: "Demo Video" },
              ].map((resource) => (
                <motion.div
                  key={resource.label}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300"
                  whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                >
                  <resource.icon className="h-3.5 w-3.5 text-violet-400" />
                  {resource.label}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Staff Online */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["SC", "MJ", "EW"].map((initials, i) => (
                  <motion.div
                    key={initials}
                    className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {initials}
                  </motion.div>
                ))}
              </div>
              <div className="text-xs">
                <div className="text-white font-medium">3 Staff Online</div>
                <div className="text-slate-400">Ready to help</div>
              </div>
            </div>
            <motion.div
              className="h-2.5 w-2.5 rounded-full bg-green-500"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LIVE CHAT SIMULATION
// ============================================================================
function LiveChatSimulation() {
  const [messages, setMessages] = useState<{ id: number; type: "visitor" | "staff"; text: string; name: string }[]>([
    { id: 1, type: "visitor", text: "Hi! Can you tell me more about your enterprise plan?", name: "Sarah C." },
    { id: 2, type: "staff", text: "Of course! Our enterprise plan includes unlimited users and dedicated support. Would you like a quick demo?", name: "Mike (Staff)" },
  ]);

  const sampleMessages = [
    { type: "visitor" as const, text: "That sounds great! How does the pricing work?", name: "Sarah C." },
    { type: "staff" as const, text: "We offer flexible pricing based on event size. I can share our pricing guide!", name: "Mike (Staff)" },
    { type: "visitor" as const, text: "Perfect! Can you also send me a case study?", name: "Sarah C." },
    { type: "staff" as const, text: "Absolutely! I'll send both right over. Want to schedule a follow-up call?", name: "Mike (Staff)" },
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < sampleMessages.length) {
        setMessages((prev) => [...prev, { ...sampleMessages[index], id: Date.now() }]);
        index++;
      } else {
        index = 0;
        setMessages([
          { id: 1, type: "visitor", text: "Hi! Can you tell me more about your enterprise plan?", name: "Sarah C." },
          { id: 2, type: "staff", text: "Of course! Our enterprise plan includes unlimited users and dedicated support.", name: "Mike (Staff)" },
        ]);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl border bg-card overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            TC
          </div>
          <div>
            <div className="text-sm font-semibold">TechCorp Booth</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              3 staff online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-muted">
            <Video className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-muted">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 h-[280px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn("flex gap-2", msg.type === "staff" && "flex-row-reverse")}
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                  msg.type === "visitor"
                    ? "bg-gradient-to-br from-blue-400 to-cyan-500"
                    : "bg-gradient-to-br from-violet-400 to-purple-500"
                )}
              >
                {(msg.name || "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-3 py-2",
                  msg.type === "visitor" ? "bg-muted rounded-tl-none" : "bg-violet-500 text-white rounded-tr-none"
                )}
              >
                <div className="text-xs font-medium mb-0.5 opacity-70">{msg.name}</div>
                <p className="text-sm">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-xl bg-background border text-sm"
          />
          <button className="p-2 rounded-xl bg-violet-500 text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VIDEO CALL SIMULATION
// ============================================================================
function VideoCallSimulation() {
  const [callStatus, setCallStatus] = useState<"ringing" | "connected" | "idle">("idle");

  useEffect(() => {
    const cycle = () => {
      setCallStatus("ringing");
      setTimeout(() => setCallStatus("connected"), 2000);
      setTimeout(() => setCallStatus("idle"), 8000);
    };
    cycle();
    const interval = setInterval(cycle, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl border bg-slate-900 overflow-hidden shadow-xl aspect-video">
      {callStatus === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <motion.div
            className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4"
            whileHover={{ scale: 1.1 }}
          >
            <Video className="h-10 w-10" />
          </motion.div>
          <p className="text-lg font-semibold">Start Video Call</p>
          <p className="text-sm text-slate-400">Connect with booth staff instantly</p>
        </div>
      )}

      {callStatus === "ringing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-violet-900 to-purple-900">
          <motion.div
            className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Phone className="h-10 w-10" />
          </motion.div>
          <p className="text-lg font-semibold">Connecting...</p>
          <p className="text-sm text-slate-400">Mike from TechCorp is joining</p>
        </div>
      )}

      {callStatus === "connected" && (
        <>
          {/* Main video (staff) */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-3">
                MJ
              </div>
              <p className="text-white font-semibold">Mike Johnson</p>
              <p className="text-sm text-slate-400">Sales Engineer @ TechCorp</p>
            </div>
          </div>

          {/* Self video (small) */}
          <motion.div
            className="absolute bottom-4 right-4 w-24 h-16 rounded-lg bg-slate-700 border-2 border-violet-500 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                SC
              </div>
            </div>
          </motion.div>

          {/* Call controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white">
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>

          {/* Duration */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm flex items-center gap-2">
            <motion.div
              className="h-2 w-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            00:05
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// LEAD CAPTURE ANIMATION
// ============================================================================
function LeadCaptureAnimation() {
  const [leads, setLeads] = useState<{ id: number; name: string; action: string; score: number }[]>([]);

  const sampleLeads = [
    { name: "Sarah Chen", action: "Downloaded whitepaper", score: 45 },
    { name: "James Wilson", action: "Requested demo", score: 85 },
    { name: "Emily Davis", action: "Started video call", score: 72 },
    { name: "Michael Brown", action: "Visited booth 3x", score: 58 },
    { name: "Lisa Anderson", action: "Submitted contact form", score: 90 },
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      const lead = { ...sampleLeads[index % sampleLeads.length], id: Date.now() };
      setLeads((prev) => [lead, ...prev.slice(0, 3)]);
      index++;
    }, 2500);

    // Initial leads
    setLeads([{ ...sampleLeads[0], id: Date.now() }]);

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
              lead.score >= 70 ? "bg-green-500/10 border-green-500/30" : "bg-violet-500/10 border-violet-500/30"
            )}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0",
                lead.score >= 70
                  ? "bg-gradient-to-br from-green-400 to-emerald-500"
                  : "bg-gradient-to-br from-violet-400 to-purple-500"
              )}
            >
              {(lead.name || "").split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{lead.name}</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold",
                    lead.score >= 70 ? "bg-green-500/20 text-green-400" : "bg-violet-500/20 text-violet-400"
                  )}
                >
                  {lead.score}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{lead.action}</div>
            </div>
            {lead.score >= 70 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold"
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
// TRADITIONAL BOOTH CHAOS VISUALIZATION
// ============================================================================
function TraditionalBoothChaos() {
  const [bouncingVisitors, setBouncingVisitors] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBouncingVisitors(prev => {
        const newId = Date.now();
        return [...prev.slice(-4), newId];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const staticElements = [
    { icon: FileText, label: "Product_Brochure_v3_FINAL.pdf", x: 10, y: 15, rotation: -5 },
    { icon: FileText, label: "Company_Overview_2023.pdf", x: 55, y: 10, rotation: 3 },
    { icon: LinkIcon, label: "broken-link.com/404", x: 75, y: 60, rotation: -8, broken: true },
    { icon: ImageIcon, label: "logo_lowres.jpg", x: 5, y: 55, rotation: 6 },
    { icon: FileText, label: "Pricing_OLD.xlsx", x: 60, y: 75, rotation: -4 },
    { icon: Globe, label: "generic-form.html", x: 25, y: 70, rotation: 2 },
  ];

  return (
    <div className="relative w-full h-[350px] rounded-2xl border border-red-500/20 bg-slate-900/50 overflow-hidden">
      {/* Static noise background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
      </div>

      {/* "No engagement" overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2 z-20">
        <X className="h-4 w-4" />
        No Live Engagement
      </div>

      {/* Static file dumps */}
      {staticElements.map((el, index) => (
        <motion.div
          key={el.label}
          className="absolute"
          style={{ left: `${el.x}%`, top: `${el.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: el.broken ? [0.5, 0.3, 0.5] : 0.7,
            scale: 1,
            rotate: el.rotation
          }}
          transition={{
            delay: index * 0.1,
            opacity: el.broken ? { duration: 1.5, repeat: Infinity } : {}
          }}
        >
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm text-xs",
            el.broken
              ? "bg-red-500/10 border-red-500/30 text-red-400 line-through"
              : "bg-slate-800/80 border-slate-700/50 text-slate-400"
          )}>
            <el.icon className="h-4 w-4 shrink-0" />
            <span className="truncate max-w-[120px]">{el.label}</span>
          </div>
        </motion.div>
      ))}

      {/* Bouncing visitors leaving */}
      <AnimatePresence>
        {bouncingVisitors.map((id, index) => (
          <motion.div
            key={id}
            className="absolute flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs"
            initial={{
              left: `${30 + index * 10}%`,
              top: "50%",
              opacity: 1,
              scale: 1
            }}
            animate={{
              left: "-10%",
              top: `${40 + index * 5}%`,
              opacity: 0,
              scale: 0.5
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeIn" }}
          >
            <Users className="h-3 w-3" />
            Visitor left
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Center "boring" indicator */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-slate-800/80 border-2 border-slate-600/50 flex items-center justify-center mx-auto mb-3"
          animate={{ scale: [1, 0.95, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Building2 className="h-10 w-10 text-slate-500" />
        </motion.div>
        <div className="text-slate-500 text-sm font-medium">Generic Booth</div>
        <div className="text-slate-600 text-xs">No branding • No interaction</div>
      </motion.div>

      {/* Stats showing poor performance */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
        {[
          { label: "Avg. Time", value: "28s", bad: true },
          { label: "Engagement", value: "0%", bad: true },
          { label: "Leads", value: "0", bad: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-center"
          >
            <div className={cn(
              "text-lg font-bold",
              stat.bad ? "text-red-400" : "text-white"
            )}>
              {stat.value}
            </div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>
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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 -z-10" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]"
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 backdrop-blur-sm border border-violet-500/30 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-violet-400" />
                Fully Customizable
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/20 backdrop-blur-sm border border-fuchsia-500/30 text-sm font-medium">
                <Zap className="h-4 w-4 text-fuchsia-400" />
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
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              Your Brand,{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Front & Center
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 rounded-full"
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
              Create stunning virtual booths with video calls, live chat, resource libraries,
              and lead capture—all in a fully branded experience that converts visitors into customers.
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
                className="group bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold h-14 px-8 text-lg shadow-lg shadow-violet-500/25"
                asChild
              >
                <Link href="/contact?demo=virtual-booth">
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
                { value: "4", label: "Booth Tiers" },
                { value: "∞", label: "Resources" },
                { value: "<1s", label: "Video Connect" },
                { value: "100%", label: "Lead Capture" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Booth Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <AnimatedBoothPreview />
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
            className="w-1.5 h-1.5 rounded-full bg-violet-400"
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
      stat: "68%",
      title: "Visitors Leave",
      description: "of virtual booth visitors leave within 30 seconds without any engagement",
      icon: Users,
      gradient: "from-red-500 to-orange-500",
    },
    {
      stat: "12%",
      title: "Resource Downloads",
      description: "Average download rate for booth materials buried in generic file lists",
      icon: Download,
      gradient: "from-orange-500 to-amber-500",
    },
    {
      stat: "0",
      title: "Real Conversations",
      description: "Most virtual booths have no live interaction—just static content",
      icon: MessageSquare,
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

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
            <X className="h-4 w-4" />
            The Challenge
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Traditional Booths{" "}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Fall Flat Online
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Static PDFs, unbranded pages, and no way to engage visitors in real-time.
            Your sponsors deserve better than a glorified link dump.
          </p>
        </motion.div>

        {/* Chaos Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <TraditionalBoothChaos />
        </motion.div>

        {/* Problem Stats */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {problems.map((item, index) => (
            <motion.div key={item.title} variants={fadeInUp} className="relative group">
              <div className="h-full rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 transition-all duration-500 hover:border-white/10 hover:bg-white/[0.04]">
                {/* Gradient line at top */}
                <div className={cn(
                  "absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r rounded-full opacity-60",
                  item.gradient
                )} />

                <div className="flex items-center gap-4 mb-4 mt-2">
                  <motion.div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br",
                      item.gradient
                    )}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <item.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <motion.div
                    className={cn(
                      "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      item.gradient
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {item.stat}
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// BOOTH BUILDER SECTION
// ============================================================================
function BoothBuilderSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [selectedTier, setSelectedTier] = useState(2);

  const tiers = [
    { name: "Bronze", features: 3, color: "from-amber-600 to-amber-700" },
    { name: "Silver", features: 5, color: "from-slate-400 to-slate-500" },
    { name: "Gold", features: 7, color: "from-yellow-400 to-amber-500" },
    { name: "Platinum", features: 10, color: "from-violet-400 to-purple-500" },
  ];

  const customizations = [
    { icon: Palette, label: "Brand Colors", description: "Match your brand identity" },
    { icon: ImageIcon, label: "Logo & Banner", description: "Upload custom visuals" },
    { icon: Layout, label: "Custom Layout", description: "Arrange your content" },
    { icon: LinkIcon, label: "Custom URL", description: "yourcompany.event.com" },
    { icon: Video, label: "Video Background", description: "Add dynamic visuals" },
    { icon: FileText, label: "Resource Library", description: "PDFs, videos, links" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.2, 1] }}
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
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full border border-violet-500/20">
            Booth Builder
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Design Your{" "}
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Perfect Booth
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Four sponsorship tiers with increasing features. Every booth is fully customizable
            to match your brand—from colors to custom URLs.
          </p>
        </motion.div>

        {/* Tier Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-4 mb-12"
        >
          {tiers.map((tier, index) => (
            <motion.button
              key={tier.name}
              onClick={() => setSelectedTier(index)}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold transition-all",
                selectedTier === index
                  ? `bg-gradient-to-r ${tier.color} text-white shadow-lg`
                  : "bg-muted hover:bg-muted/80"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tier.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Customization Options */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
        >
          {customizations.map((item, index) => {
            const isAvailable = index < tiers[selectedTier].features;
            return (
              <motion.div
                key={item.label}
                variants={fadeInUp}
                className={cn(
                  "relative rounded-xl border p-4 transition-all",
                  isAvailable
                    ? "bg-card hover:shadow-lg hover:border-violet-500/30"
                    : "bg-muted/30 opacity-50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
                      isAvailable
                        ? "bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30"
                        : "bg-muted"
                    )}
                  >
                    <item.icon className={cn("h-6 w-6", isAvailable ? "text-violet-400" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                {isAvailable && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// LIVE INTERACTIONS SECTION
// ============================================================================
function LiveInteractionsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-full border border-fuchsia-500/20">
            Live Engagement
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Real Conversations,{" "}
            <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Real Connections
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Video calls, live chat, and staff presence indicators bring the booth experience to life.
            No more static pages—engage visitors the moment they arrive.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Video Call Demo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Video className="h-5 w-5 text-violet-500" />
                Instant Video Calls
              </h3>
              <p className="text-muted-foreground">
                One-click video calls powered by Daily.co. Staff see incoming requests and can accept instantly.
              </p>
            </div>
            <VideoCallSimulation />
          </motion.div>

          {/* Chat Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-fuchsia-500" />
                Live Booth Chat
              </h3>
              <p className="text-muted-foreground">
                Real-time messaging with typing indicators, read receipts, and quick resource sharing.
              </p>
            </div>
            <LiveChatSimulation />
          </motion.div>
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
        >
          {[
            { icon: Users, text: "Staff presence indicators" },
            { icon: Clock, text: "Auto-route to available staff" },
            { icon: FileText, text: "Share resources in chat" },
            { icon: Phone, text: "Escalate to video anytime" },
          ].map((feature) => (
            <div key={feature.text} className="flex items-center gap-3 p-4 rounded-xl border bg-card">
              <feature.icon className="h-5 w-5 text-fuchsia-500 shrink-0" />
              <span className="text-sm">{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// LEAD CAPTURE SECTION
// ============================================================================
function LeadCaptureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeInUp}>
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20">
              Lead Capture
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Every Interaction{" "}
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                Becomes a Lead
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Automatic lead capture from every booth interaction. Downloads, chats, video calls,
              and form submissions—all tracked and scored in real-time.
            </p>

            <ul className="space-y-4">
              {[
                { icon: Eye, text: "Track booth visits and time spent" },
                { icon: Download, text: "Log every resource download" },
                { icon: Video, text: "Capture video call participants" },
                { icon: MessageSquare, text: "Record chat conversation history" },
                { icon: Target, text: "Auto-score leads by engagement" },
                { icon: Mail, text: "Sync to your CRM in real-time" },
              ].map((feature, i) => (
                <motion.li
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                    <feature.icon className="h-4 w-4 text-green-500" />
                  </div>
                  <span>{feature.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Lead Feed Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl border bg-card overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Live Lead Feed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-green-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    Capturing
                  </div>
                </div>

                <div className="p-4 min-h-[300px]">
                  <LeadCaptureAnimation />
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
// ANALYTICS DASHBOARD MOCKUP
// ============================================================================
function AnalyticsDashboardMockup() {
  const [visitors, setVisitors] = useState(1247);
  const [downloads, setDownloads] = useState(384);
  const [leads, setLeads] = useState(156);
  const [chartData, setChartData] = useState([35, 45, 42, 58, 62, 55, 70, 68, 75, 82, 78, 85]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors(prev => prev + Math.floor(Math.random() * 5));
      setDownloads(prev => prev + (Math.random() > 0.6 ? 1 : 0));
      setLeads(prev => prev + (Math.random() > 0.8 ? 1 : 0));
      setChartData(prev => {
        const newData = [...prev.slice(1), prev[prev.length - 1] + Math.floor(Math.random() * 10) - 4];
        return newData.map(v => Math.max(20, Math.min(100, v)));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const recentActivity = [
    { name: "Sarah C.", action: "Downloaded whitepaper", time: "2m ago", icon: Download },
    { name: "Mike J.", action: "Started video call", time: "5m ago", icon: Video },
    { name: "Emily D.", action: "Submitted lead form", time: "8m ago", icon: UserPlus },
  ];

  return (
    <div className="relative max-w-5xl mx-auto">
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Dashboard Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Booth Analytics</h3>
                <p className="text-xs text-white/60">TechCorp Platinum Booth • Live</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="h-2 w-2 rounded-full bg-green-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-green-400">Live Data</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="p-4 grid grid-cols-12 gap-4">
          {/* Main Stats */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Total Visitors", value: visitors, icon: Users, color: "violet", change: "+18%" },
                { label: "Downloads", value: downloads, icon: Download, color: "fuchsia", change: "+42%" },
                { label: "Leads Captured", value: leads, icon: UserPlus, color: "green", change: "+52%" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={cn(
                      "h-5 w-5",
                      stat.color === "violet" && "text-violet-400",
                      stat.color === "fuchsia" && "text-fuchsia-400",
                      stat.color === "green" && "text-green-400"
                    )} />
                    <span className="text-xs font-medium text-green-400">{stat.change}</span>
                  </div>
                  <motion.div
                    className="text-2xl font-bold text-white"
                    key={stat.value}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {stat.value.toLocaleString()}
                  </motion.div>
                  <div className="text-xs text-white/50">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Engagement Chart */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-white">Visitor Engagement</div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    Last 12 hours
                  </div>
                </div>
              </div>
              <div className="h-32 flex items-end gap-1">
                {chartData.map((value, index) => (
                  <motion.div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${value}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/30">
                <span>12h ago</span>
                <span>Now</span>
              </div>
            </div>

            {/* Resource Performance */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-sm font-medium text-white mb-3">Top Resources</div>
              <div className="space-y-2">
                {[
                  { name: "Product Guide 2024", downloads: 142, percentage: 85 },
                  { name: "Demo Video", downloads: 98, percentage: 65 },
                  { name: "Case Studies", downloads: 67, percentage: 45 },
                ].map((resource) => (
                  <div key={resource.name} className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-violet-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/80 truncate">{resource.name}</span>
                        <span className="text-white/50">{resource.downloads}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${resource.percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Engagement Score */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-sm font-medium text-white mb-3">Engagement Score</div>
              <div className="relative flex items-center justify-center py-4">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                  <motion.circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="url(#boothGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * 87) / 100 }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  />
                  <defs>
                    <linearGradient id="boothGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">87</div>
                    <div className="text-xs text-white/50">/ 100</div>
                  </div>
                </div>
              </div>
              <div className="text-center text-xs text-green-400 font-medium">
                +12 pts from yesterday
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-sm font-medium text-white mb-3">Recent Activity</div>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.name}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {(activity.name || "").split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white/80 truncate">{activity.name}</div>
                      <div className="text-xs text-white/40 truncate">{activity.action}</div>
                    </div>
                    <div className="text-xs text-white/30">{activity.time}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Avg. Time", value: "4:32", icon: Clock },
                { label: "Video Calls", value: "67", icon: Video },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                  <stat.icon className="h-4 w-4 text-violet-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-purple-500/10 to-fuchsia-500/20 rounded-3xl blur-3xl -z-10" />
    </div>
  );
}

// ============================================================================
// ANALYTICS SECTION
// ============================================================================
function AnalyticsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const metrics = [
    { label: "Total Visitors", value: "1,247", change: "+18%", icon: Users, gradient: "from-violet-500 to-purple-500" },
    { label: "Avg. Time in Booth", value: "4:32", change: "+25%", icon: Clock, gradient: "from-purple-500 to-fuchsia-500" },
    { label: "Resource Downloads", value: "384", change: "+42%", icon: Download, gradient: "from-fuchsia-500 to-pink-500" },
    { label: "Video Calls", value: "67", change: "+35%", icon: Video, gradient: "from-pink-500 to-rose-500" },
    { label: "Chat Sessions", value: "189", change: "+28%", icon: MessageSquare, gradient: "from-rose-500 to-red-500" },
    { label: "Leads Captured", value: "156", change: "+52%", icon: UserPlus, gradient: "from-green-500 to-emerald-500" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-slate-950/50 to-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[180px]"
          animate={{ x: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-fuchsia-500/5 rounded-full blur-[150px]"
          animate={{ x: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20">
            <BarChart3 className="h-4 w-4" />
            Booth Analytics
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Measure What{" "}
            <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              Matters Most
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Real-time analytics dashboard shows exactly how your booth is performing.
            Track visitors, engagement, and ROI at a glance.
          </p>
        </motion.div>

        {/* Analytics Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <AnalyticsDashboardMockup />
        </motion.div>

        {/* Metric Pills */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
        >
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -2 }}
              className="group"
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:border-violet-500/30 hover:bg-white/[0.05] transition-all">
                <div className={cn(
                  "h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center",
                  metric.gradient
                )}>
                  <metric.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white/90">{metric.value}</span>
                    <span className="text-xs font-medium text-green-400">{metric.change}</span>
                  </div>
                  <p className="text-xs text-white/50">{metric.label}</p>
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
// BOOTH INFRASTRUCTURE VISUALIZATION
// ============================================================================
function BoothInfrastructureVisualization() {
  const [dataPackets, setDataPackets] = useState<{ id: number; path: number }[]>([]);
  const [metrics, setMetrics] = useState({ connections: 847, latency: 28, uptime: 99.99 });

  useEffect(() => {
    let packetId = 0;
    const interval = setInterval(() => {
      setDataPackets(prev => {
        const newPackets = [...prev, { id: packetId++, path: Math.floor(Math.random() * 4) }];
        return newPackets.slice(-10);
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        connections: 840 + Math.floor(Math.random() * 30),
        latency: 20 + Math.floor(Math.random() * 15),
        uptime: 99.99,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nodes = [
    { id: "visitor", label: "Visitors", icon: Users, x: 10, y: 35, color: "blue" },
    { id: "staff", label: "Staff", icon: Headphones, x: 10, y: 65, color: "purple" },
    { id: "websocket", label: "WebSocket", icon: Wifi, x: 35, y: 50, color: "cyan" },
    { id: "daily", label: "Daily.co", icon: Video, x: 60, y: 30, color: "fuchsia" },
    { id: "chat", label: "Chat", icon: MessageSquare, x: 60, y: 70, color: "violet" },
    { id: "booth", label: "Booth", icon: Building2, x: 85, y: 50, color: "emerald" },
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    cyan: "from-cyan-500 to-cyan-600",
    fuchsia: "from-fuchsia-500 to-fuchsia-600",
    violet: "from-violet-500 to-violet-600",
    emerald: "from-emerald-500 to-emerald-600",
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      <motion.div
        className="rounded-2xl border border-violet-500/20 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl p-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Booth Infrastructure</h3>
              <p className="text-xs text-white/60">Real-time data flow</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">{metrics.connections}</div>
              <div className="text-xs text-white/40">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">{metrics.latency}ms</div>
              <div className="text-xs text-white/40">Latency</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-violet-400">{metrics.uptime}%</div>
              <div className="text-xs text-white/40">Uptime</div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="relative h-[280px] rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-violet-500/10 overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Visitor to WebSocket */}
            <line x1="15" y1="35" x2="32" y2="48" stroke="currentColor" strokeWidth="0.3" className="text-blue-500/30" />
            {/* Staff to WebSocket */}
            <line x1="15" y1="65" x2="32" y2="52" stroke="currentColor" strokeWidth="0.3" className="text-purple-500/30" />
            {/* WebSocket to Daily */}
            <line x1="40" y1="48" x2="55" y2="32" stroke="currentColor" strokeWidth="0.3" className="text-cyan-500/30" />
            {/* WebSocket to Chat */}
            <line x1="40" y1="52" x2="55" y2="68" stroke="currentColor" strokeWidth="0.3" className="text-cyan-500/30" />
            {/* Daily to Booth */}
            <line x1="65" y1="32" x2="80" y2="48" stroke="currentColor" strokeWidth="0.3" className="text-fuchsia-500/30" />
            {/* Chat to Booth */}
            <line x1="65" y1="68" x2="80" y2="52" stroke="currentColor" strokeWidth="0.3" className="text-violet-500/30" />
          </svg>

          {/* Data packets animation */}
          <AnimatePresence>
            {dataPackets.map((packet) => {
              const paths = [
                [{ x: 12, y: 35 }, { x: 35, y: 50 }, { x: 60, y: 30 }, { x: 85, y: 50 }],
                [{ x: 12, y: 65 }, { x: 35, y: 50 }, { x: 60, y: 70 }, { x: 85, y: 50 }],
                [{ x: 85, y: 50 }, { x: 60, y: 30 }, { x: 35, y: 50 }, { x: 12, y: 35 }],
                [{ x: 85, y: 50 }, { x: 60, y: 70 }, { x: 35, y: 50 }, { x: 12, y: 65 }],
              ];
              const path = paths[packet.path];
              const colors = ["bg-blue-400", "bg-purple-400", "bg-fuchsia-400", "bg-violet-400"];
              return (
                <motion.div
                  key={packet.id}
                  className={cn("absolute w-2 h-2 rounded-full shadow-lg", colors[packet.path])}
                  style={{ boxShadow: `0 0 10px ${packet.path < 2 ? '#60a5fa' : '#c084fc'}` }}
                  initial={{ left: `${path[0].x}%`, top: `${path[0].y}%`, opacity: 0, scale: 0 }}
                  animate={{
                    left: path.map(p => `${p.x}%`),
                    top: path.map(p => `${p.y}%`),
                    opacity: [0, 1, 1, 1, 0],
                    scale: [0, 1, 1, 1, 0],
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
                  "relative flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br border border-white/20",
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
            <span>Real-time Data</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-3 w-3 text-fuchsia-400" />
            <span>Video Calls via Daily.co</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </motion.div>

      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-3xl blur-3xl -z-10" />
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
    { icon: Wifi, title: "WebSocket Real-Time", description: "Live visitor counts, chat, and staff presence", stat: "<100ms", gradient: "from-cyan-500 to-blue-500" },
    { icon: Video, title: "Daily.co Integration", description: "HD video calls with recording", stat: "4K Ready", gradient: "from-fuchsia-500 to-pink-500" },
    { icon: Shield, title: "Role-Based Access", description: "Granular staff and organizer permissions", stat: "Secure", gradient: "from-emerald-500 to-green-500" },
    { icon: Layers, title: "4 Sponsorship Tiers", description: "Bronze to Platinum with progressive features", stat: "4 Tiers", gradient: "from-amber-500 to-orange-500" },
    { icon: BarChart3, title: "Real-Time Analytics", description: "Live visitor tracking and engagement", stat: "Live", gradient: "from-violet-500 to-purple-500" },
    { icon: Settings, title: "Full Customization", description: "Colors, logos, banners, and URLs", stat: "100%", gradient: "from-rose-500 to-red-500" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[180px]"
          animate={{ x: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-fuchsia-500/5 rounded-full blur-[150px]"
          animate={{ x: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-violet-500/20 text-violet-400 rounded-full border border-violet-500/30">
            <Layers className="h-4 w-4" />
            Enterprise-Ready
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Built for{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Scale & Reliability
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Enterprise-grade infrastructure powers every booth with real-time features,
            video calls, and comprehensive analytics.
          </p>
        </motion.div>

        {/* Infrastructure Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <BoothInfrastructureVisualization />
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
              <div className="h-full p-5 rounded-xl border border-violet-500/20 bg-slate-900/50 backdrop-blur-sm hover:border-violet-500/40 hover:bg-slate-900/70 transition-all">
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
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-pink-400/30 rounded-full blur-[120px]"
        animate={{ x: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/30 rounded-full blur-[120px]"
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
            <Building2 className="h-16 w-16 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Build Your Dream Booth Today
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join sponsors who&apos;ve transformed their virtual presence with immersive,
            interactive booths that convert visitors into customers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-violet-600 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-lg"
              asChild
            >
              <Link href="/contact?demo=virtual-booth">
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
export default function VirtualBoothPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <ProblemSection />
      <BoothBuilderSection />
      <LiveInteractionsSection />
      <LeadCaptureSection />
      <AnalyticsSection />
      <TechnicalSection />
      <CTASection />
    </main>
  );
}
