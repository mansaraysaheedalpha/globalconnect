// src/app/(public)/solutions/in-person-events/page.tsx
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
  MapPin,
  MessageSquare,
  BarChart3,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  Activity,
  ArrowUpRight,
  Smartphone,
  Building2,
  CalendarDays,
  Hand,
  Heart,
  QrCode,
  Wifi,
  Navigation,
  Ticket,
  UserCheck,
  BadgeCheck,
  Printer,
  Scan,
  Map,
  Users2,
  Coffee,
  Utensils,
  ParkingCircle,
  DoorOpen,
  Bell,
  Handshake,
  Network,
  SignalHigh,
  Timer,
  TrendingUp,
  Target,
  Gauge,
  LocateFixed,
  Footprints,
  PersonStanding,
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
// CHECK-IN VISUALIZATION
// ============================================================================
function CheckInVisualization() {
  const [checkedIn, setCheckedIn] = useState(812);
  const [recentCheckIns, setRecentCheckIns] = useState([
    { id: 1, name: "Sarah Chen", time: "Just now", badge: "VIP" },
    { id: 2, name: "Michael Brown", time: "30s ago", badge: "Speaker" },
    { id: 3, name: "Emily Davis", time: "1m ago", badge: "Attendee" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCheckedIn(prev => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const names = [
      { name: "James Wilson", badge: "Attendee" },
      { name: "Lisa Anderson", badge: "VIP" },
      { name: "Robert Taylor", badge: "Sponsor" },
      { name: "Jennifer Lee", badge: "Attendee" },
      { name: "David Kim", badge: "Media" },
    ];
    let index = 0;
    const interval = setInterval(() => {
      const newCheckIn = { ...names[index % names.length], id: Date.now(), time: "Just now" };
      setRecentCheckIns(prev => [newCheckIn, ...prev.slice(0, 2)]);
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
          background: "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.2) 0%, rgba(234, 88, 12, 0.1) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Check-in Dashboard Frame */}
      <motion.div
        className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        initial={{ rotateX: 5, rotateY: -5 }}
        animate={{ rotateX: 0, rotateY: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scan className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Check-In Station</div>
              <div className="text-xs text-white/50">Main Entrance</div>
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
              <span className="text-[10px] font-medium text-emerald-400">ACTIVE</span>
            </motion.div>
          </div>
        </div>

        {/* QR Scanner Area */}
        <div className="p-4">
          <div className="relative h-40 bg-gradient-to-br from-amber-900/30 to-slate-900 rounded-xl border border-amber-500/20 overflow-hidden flex items-center justify-center">
            {/* Scanner corners */}
            <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-amber-500" />
            <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-amber-500" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-amber-500" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-amber-500" />

            {/* Scanning line animation */}
            <motion.div
              className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
              animate={{ y: [-50, 50, -50] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Center QR placeholder */}
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <QrCode className="h-16 w-16 text-amber-500/50 mx-auto" />
              </motion.div>
              <div className="text-xs text-white/50 mt-2">Scan badge to check in</div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { label: "Checked In", value: checkedIn, icon: UserCheck, color: "emerald" },
            { label: "Remaining", value: 847 - checkedIn + 35, icon: Clock, color: "amber" },
            { label: "VIP", value: 42, icon: BadgeCheck, color: "purple" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/5"
              whileHover={{ scale: 1.02 }}
            >
              <stat.icon className={cn(
                "h-4 w-4 mb-1",
                stat.color === "emerald" && "text-emerald-400",
                stat.color === "amber" && "text-amber-400",
                stat.color === "purple" && "text-purple-400"
              )} />
              <motion.div
                key={stat.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-lg font-bold text-white"
              >
                {stat.value}
              </motion.div>
              <div className="text-[10px] text-white/40">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Check-ins */}
        <div className="px-4 pb-4">
          <div className="text-xs font-medium text-white/50 mb-2">Recent Check-ins</div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {recentCheckIns.map((person) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {person.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{person.name}</div>
                    <div className="text-[10px] text-white/40">{person.time}</div>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-medium",
                    person.badge === "VIP" && "bg-purple-500/20 text-purple-400",
                    person.badge === "Speaker" && "bg-blue-500/20 text-blue-400",
                    person.badge === "Sponsor" && "bg-amber-500/20 text-amber-400",
                    person.badge === "Media" && "bg-pink-500/20 text-pink-400",
                    person.badge === "Attendee" && "bg-slate-500/20 text-slate-400"
                  )}>
                    {person.badge}
                  </span>
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
// VENUE MAP VISUALIZATION
// ============================================================================
function VenueMapVisualization() {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const zones = [
    { id: "main", label: "Main Hall", capacity: 500, current: 342, x: 40, y: 30, color: "amber" },
    { id: "breakout1", label: "Room A", capacity: 100, current: 78, x: 15, y: 60, color: "blue" },
    { id: "breakout2", label: "Room B", capacity: 100, current: 45, x: 65, y: 60, color: "purple" },
    { id: "expo", label: "Expo Hall", capacity: 300, current: 156, x: 40, y: 80, color: "green" },
  ];

  return (
    <div className="relative w-full h-64 bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Zones */}
      {zones.map((zone) => (
        <motion.div
          key={zone.id}
          className="absolute"
          style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: "translate(-50%, -50%)" }}
          onMouseEnter={() => setActiveZone(zone.id)}
          onMouseLeave={() => setActiveZone(null)}
        >
          <motion.div
            className={cn(
              "relative w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer transition-all",
              zone.color === "amber" && "bg-amber-500/20 border border-amber-500/40",
              zone.color === "blue" && "bg-blue-500/20 border border-blue-500/40",
              zone.color === "purple" && "bg-purple-500/20 border border-purple-500/40",
              zone.color === "green" && "bg-green-500/20 border border-green-500/40"
            )}
            animate={activeZone === zone.id ? { scale: 1.1 } : { scale: 1 }}
            whileHover={{ scale: 1.1 }}
          >
            <div className="text-center">
              <div className={cn(
                "text-lg font-bold",
                zone.color === "amber" && "text-amber-400",
                zone.color === "blue" && "text-blue-400",
                zone.color === "purple" && "text-purple-400",
                zone.color === "green" && "text-green-400"
              )}>
                {zone.current}
              </div>
              <div className="text-[8px] text-white/50">/{zone.capacity}</div>
            </div>

            {/* Pulse effect */}
            <motion.div
              className={cn(
                "absolute inset-0 rounded-xl",
                zone.color === "amber" && "bg-amber-500/20",
                zone.color === "blue" && "bg-blue-500/20",
                zone.color === "purple" && "bg-purple-500/20",
                zone.color === "green" && "bg-green-500/20"
              )}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: zones.indexOf(zone) * 0.5 }}
            />
          </motion.div>

          {/* Label */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white/60">
            {zone.label}
          </div>
        </motion.div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex items-center gap-3 text-[9px] text-white/40">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Busy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>Full</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FLOATING NOTIFICATION
// ============================================================================
function FloatingInPersonNotification({
  text,
  icon: Icon,
  delay,
  position,
  color = "amber"
}: {
  text: string;
  icon: React.ElementType;
  delay: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  color?: "amber" | "green" | "blue";
}) {
  const colors = {
    amber: { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400" },
    green: { bg: "bg-green-500/20", border: "border-green-500/40", text: "text-green-400" },
    blue: { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-400" },
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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-amber-950/40 to-slate-950 -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/20 via-transparent to-amber-950/30 -z-10" />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[150px]"
          animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-orange-500/15 rounded-full blur-[180px]"
          animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Floating Notifications */}
      <FloatingInPersonNotification
        text="VIP badge scanned"
        icon={BadgeCheck}
        delay={0}
        position={{ top: "15%", left: "8%" }}
        color="amber"
      />
      <FloatingInPersonNotification
        text="Main Hall: 342/500"
        icon={Users}
        delay={2}
        position={{ top: "25%", right: "5%" }}
        color="green"
      />
      <FloatingInPersonNotification
        text="Session starting in 5m"
        icon={Bell}
        delay={4}
        position={{ bottom: "30%", left: "5%" }}
        color="blue"
      />
      <FloatingInPersonNotification
        text="New connection request"
        icon={Handshake}
        delay={6}
        position={{ bottom: "20%", right: "8%" }}
        color="amber"
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-sm font-medium">
                <MapPin className="h-4 w-4 text-amber-400" />
                In-Person Events
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-sm font-medium">
                <QrCode className="h-4 w-4 text-green-400" />
                QR Check-In
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-sm font-medium">
                <Network className="h-4 w-4 text-blue-400" />
                Smart Networking
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Elevate Your{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Venue
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </span>
              <br />
              <span className="text-white/90">Experience</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg md:text-xl text-neutral-300 leading-relaxed"
            >
              Transform physical events with digital superpowers. QR check-in,
              real-time capacity tracking, proximity networking, and interactive venue maps.
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
                className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-14 px-8 text-lg shadow-lg shadow-amber-500/25"
                asChild
              >
                <Link href="/contact?demo=in-person-events">
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
                { value: "< 2s", label: "Check-In Time" },
                { value: "100%", label: "Attendance Tracked" },
                { value: "Real-time", label: "Capacity Updates" },
                { value: "3x", label: "More Connections" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Check-in Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <CheckInVisualization />
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
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// CHECK-IN FEATURES SECTION
// ============================================================================
function CheckInFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: QrCode,
      title: "QR Code Check-In",
      description: "Instant badge scanning with any smartphone. Works offline too—syncs when connection returns.",
      gradient: "from-amber-500 to-orange-500",
      badge: "Popular",
    },
    {
      icon: Printer,
      title: "Badge Printing",
      description: "Integration with major badge printers. Print on-demand or pre-print with QR codes embedded.",
      gradient: "from-blue-500 to-cyan-500",
      badge: null,
    },
    {
      icon: UserCheck,
      title: "Self Check-In Kiosks",
      description: "Deploy branded kiosk mode on tablets. Attendees check themselves in with confirmation emails.",
      gradient: "from-purple-500 to-pink-500",
      badge: "New",
    },
    {
      icon: Users2,
      title: "Group Check-In",
      description: "Check in entire delegations at once. Perfect for corporate groups and tour buses.",
      gradient: "from-green-500 to-emerald-500",
      badge: null,
    },
    {
      icon: Timer,
      title: "Session Check-In",
      description: "Track attendance per session, not just at the door. Know exactly who attended what.",
      gradient: "from-rose-500 to-red-500",
      badge: null,
    },
    {
      icon: Wifi,
      title: "Offline Mode",
      description: "Keep checking in even without internet. All data syncs automatically when back online.",
      gradient: "from-indigo-500 to-violet-500",
      badge: null,
    },
  ];

  return (
    <section className="py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:48px_48px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
            <Scan className="h-4 w-4" />
            Frictionless Check-In
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Check-In That{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Just Works
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            No more lines, no more manual lists. Scan, confirm, done—in under 2 seconds.
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
              <div className="h-full p-6 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm hover:border-amber-500/30 hover:shadow-xl transition-all duration-300">
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
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    )}>
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {feature.title}
                </h3>
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
// VENUE MANAGEMENT SECTION
// ============================================================================
function VenueManagementSection() {
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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20">
              <Map className="h-4 w-4" />
              Venue Intelligence
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Know Your Venue{" "}
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                In Real-Time
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Live capacity tracking, heat maps, and flow analytics. Know exactly
              where attendees are and prevent overcrowding before it happens.
            </p>

            <ul className="space-y-4">
              {[
                { icon: Gauge, text: "Real-time capacity per room/zone", color: "green" },
                { icon: Footprints, text: "Attendee flow patterns and heat maps", color: "amber" },
                { icon: Bell, text: "Automatic alerts when nearing capacity", color: "red" },
                { icon: Navigation, text: "Interactive wayfinding for attendees", color: "blue" },
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
                    feature.color === "green" && "bg-green-500/10",
                    feature.color === "amber" && "bg-amber-500/10",
                    feature.color === "red" && "bg-red-500/10",
                    feature.color === "blue" && "bg-blue-500/10"
                  )}>
                    <feature.icon className={cn(
                      "h-5 w-5",
                      feature.color === "green" && "text-green-500",
                      feature.color === "amber" && "text-amber-500",
                      feature.color === "red" && "text-red-500",
                      feature.color === "blue" && "text-blue-500"
                    )} />
                  </div>
                  <span>{feature.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 via-amber-500/5 to-blue-500/10 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border bg-card overflow-hidden shadow-2xl">
              <div className="px-4 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">Venue Map</span>
                </div>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
              <div className="p-4">
                <VenueMapVisualization />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// NETWORKING SECTION
// ============================================================================
function NetworkingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const networkingFeatures = [
    { icon: LocateFixed, label: "Proximity Detection", desc: "Find nearby attendees", color: "amber" },
    { icon: Handshake, label: "Smart Matching", desc: "AI-powered suggestions", color: "purple" },
    { icon: MessageSquare, label: "In-App Chat", desc: "Connect before meeting", color: "blue" },
    { icon: CalendarDays, label: "Meeting Scheduler", desc: "Book 1:1 meetings", color: "green" },
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
            <Network className="h-4 w-4" />
            Proximity Networking
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Turn Attendees Into{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Connections
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Smart networking that uses location to help attendees find the right people—
            when they&apos;re actually nearby and available.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {networkingFeatures.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="p-5 rounded-xl border bg-card"
              >
                <div className={cn(
                  "h-12 w-12 rounded-lg flex items-center justify-center mb-3",
                  feature.color === "amber" && "bg-amber-500/10",
                  feature.color === "purple" && "bg-purple-500/10",
                  feature.color === "blue" && "bg-blue-500/10",
                  feature.color === "green" && "bg-green-500/10"
                )}>
                  <feature.icon className={cn(
                    "h-6 w-6",
                    feature.color === "amber" && "text-amber-500",
                    feature.color === "purple" && "text-purple-500",
                    feature.color === "blue" && "text-blue-500",
                    feature.color === "green" && "text-green-500"
                  )} />
                </div>
                <h3 className="font-semibold mb-1">{feature.label}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile App Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-amber-500/10 rounded-3xl blur-2xl" />
            <div className="relative mx-auto w-64">
              {/* Phone frame */}
              <div className="rounded-[2.5rem] border-4 border-slate-700 bg-slate-900 p-2 shadow-2xl">
                <div className="rounded-[2rem] bg-slate-800 overflow-hidden">
                  {/* Status bar */}
                  <div className="h-6 bg-slate-900 flex items-center justify-center">
                    <div className="w-20 h-1 bg-slate-700 rounded-full" />
                  </div>
                  {/* App content */}
                  <div className="p-4 space-y-4">
                    <div className="text-center">
                      <div className="text-xs text-slate-400">Nearby Attendees</div>
                      <div className="text-2xl font-bold text-amber-400">12</div>
                    </div>
                    {/* Nearby list */}
                    <div className="space-y-2">
                      {[
                        { name: "Sarah Chen", role: "CEO, TechCorp", distance: "5m" },
                        { name: "Mike Johnson", role: "VP Engineering", distance: "12m" },
                        { name: "Lisa Wang", role: "Product Lead", distance: "18m" },
                      ].map((person, i) => (
                        <motion.div
                          key={person.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/50"
                        >
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {person.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">{person.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{person.role}</div>
                          </div>
                          <div className="text-[10px] text-amber-400">{person.distance}</div>
                        </motion.div>
                      ))}
                    </div>
                    <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                      Find Matches
                    </Button>
                  </div>
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
// ON-SITE FEATURES SECTION
// ============================================================================
function OnSiteFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: Coffee, title: "Refreshment Tracking", description: "Monitor F&B consumption and prevent shortages" },
    { icon: ParkingCircle, title: "Parking Management", description: "Track parking availability and guide attendees" },
    { icon: DoorOpen, title: "Room Scheduling", description: "Real-time room availability and booking" },
    { icon: SignalHigh, title: "WiFi Management", description: "Monitor network load and optimize connectivity" },
    { icon: PersonStanding, title: "Staff Coordination", description: "Assign and track staff across the venue" },
    { icon: BarChart3, title: "Live Analytics", description: "Real-time dashboards for event managers" },
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
            <Building2 className="h-4 w-4" />
            On-Site Operations
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Every Detail,{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Under Control
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From catering to parking to WiFi—manage every aspect of your physical
            event from one dashboard.
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
              whileHover={{ scale: 1.03, y: -3 }}
              className="group"
            >
              <div className="h-full p-5 rounded-xl border bg-card hover:border-blue-500/30 hover:shadow-lg transition-all">
                <div className="h-11 w-11 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                  <feature.icon className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-blue-500 transition-colors">{feature.title}</h3>
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
// MOBILE APP SECTION
// ============================================================================
function MobileAppSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:48px_48px] -z-5" />

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
            <Smartphone className="h-4 w-4" />
            Attendee Mobile App
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Your Event,{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              In Their Pocket
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            A branded mobile app that enhances the on-site experience—schedule,
            maps, networking, engagement, all in one place.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto"
        >
          {[
            { icon: CalendarDays, title: "Personal Agenda", description: "Build custom schedules" },
            { icon: Map, title: "Venue Maps", description: "Interactive wayfinding" },
            { icon: MessageSquare, title: "Live Chat", description: "Connect with attendees" },
            { icon: Bell, title: "Push Notifications", description: "Real-time updates" },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -3 }}
              className="group"
            >
              <div className="h-full p-5 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm hover:border-amber-500/30 transition-all">
                <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg">
                  <feature.icon className="h-5 w-5 text-white" />
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
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      <motion.div
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[150px]"
        animate={{ x: [0, 60, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[150px]"
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
              <MapPin className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to Transform Your Venue?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join event organizers delivering unforgettable in-person experiences
            powered by smart digital tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-white text-amber-600 hover:bg-white/90 h-14 px-8 text-lg font-semibold shadow-xl"
              asChild
            >
              <Link href="/contact?demo=in-person-events">
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
export default function InPersonEventsPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <CheckInFeaturesSection />
      <VenueManagementSection />
      <NetworkingSection />
      <OnSiteFeaturesSection />
      <MobileAppSection />
      <CTASection />
    </main>
  );
}
