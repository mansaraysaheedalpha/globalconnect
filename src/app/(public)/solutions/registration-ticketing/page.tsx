// src/app/(public)/solutions/registration-ticketing/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Ticket,
  CreditCard,
  Users,
  QrCode,
  Clock,
  TrendingUp,
  CheckCircle,
  Shield,
  Zap,
  Globe,
  DollarSign,
  Tag,
  UserPlus,
  BarChart3,
  RefreshCw,
  Lock,
  Mail,
  Settings,
  Star,
  BadgePercent,
  Timer,
  CalendarCheck,
  Smartphone,
  Scan,
  UserCheck,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Layers,
  Wallet,
  Receipt,
  Gift,
  Crown,
  Sparkles,
  LineChart,
  Building2,
  HeartHandshake,
  PartyPopper,
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// ============================================================================
// ANIMATED TICKET SHOWCASE - 3D Ticket Cards with dynamic data
// ============================================================================
function AnimatedTicketShowcase() {
  const [activeTicket, setActiveTicket] = useState(0);
  const [soldCount, setSoldCount] = useState({ vip: 47, general: 234, earlyBird: 150 });

  const tickets = [
    {
      name: "VIP Pass",
      price: "$299",
      color: "from-amber-400 via-yellow-500 to-amber-600",
      borderColor: "border-amber-400/50",
      icon: Crown,
      perks: ["Front Row Seating", "VIP Lounge Access", "Meet & Greet"],
      sold: soldCount.vip,
      total: 50,
    },
    {
      name: "General Admission",
      price: "$99",
      color: "from-blue-400 via-cyan-500 to-blue-600",
      borderColor: "border-blue-400/50",
      icon: Ticket,
      perks: ["Full Event Access", "Digital Program", "Networking Sessions"],
      sold: soldCount.general,
      total: 500,
    },
    {
      name: "Early Bird",
      price: "$69",
      color: "from-emerald-400 via-green-500 to-emerald-600",
      borderColor: "border-emerald-400/50",
      icon: Timer,
      perks: ["30% Discount", "Priority Entry", "Exclusive Merch"],
      sold: soldCount.earlyBird,
      total: 200,
    },
  ];

  useEffect(() => {
    const ticketInterval = setInterval(() => {
      setActiveTicket((prev) => (prev + 1) % tickets.length);
    }, 4000);

    const salesInterval = setInterval(() => {
      setSoldCount((prev) => ({
        vip: Math.min(50, prev.vip + (Math.random() > 0.7 ? 1 : 0)),
        general: Math.min(500, prev.general + Math.floor(Math.random() * 3)),
        earlyBird: Math.min(200, prev.earlyBird + (Math.random() > 0.5 ? 1 : 0)),
      }));
    }, 3000);

    return () => {
      clearInterval(ticketInterval);
      clearInterval(salesInterval);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000">
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl blur-3xl"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Ticket Cards Stack */}
      <div className="relative h-[400px]">
        <AnimatePresence mode="popLayout">
          {tickets.map((ticket, index) => {
            const isActive = index === activeTicket;
            const offset = (index - activeTicket + tickets.length) % tickets.length;

            return (
              <motion.div
                key={ticket.name}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                animate={{
                  opacity: isActive ? 1 : 0.6,
                  y: offset * 20,
                  scale: 1 - offset * 0.08,
                  rotateX: isActive ? 0 : -10,
                  zIndex: tickets.length - offset,
                }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={cn(
                    "relative h-full rounded-3xl border-2 overflow-hidden",
                    ticket.borderColor,
                    "bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl"
                  )}
                >
                  {/* Ticket Header */}
                  <div className={cn("relative px-6 py-5 bg-gradient-to-r", ticket.color)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ticket.icon className="h-8 w-8 text-white" />
                        <div>
                          <h3 className="text-xl font-bold text-white">{ticket.name}</h3>
                          <p className="text-white/80 text-sm">Tech Conference 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">{ticket.price}</div>
                        <div className="text-white/80 text-xs">per ticket</div>
                      </div>
                    </div>

                    {/* Decorative pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6 space-y-4">
                    {/* Perks */}
                    <div className="space-y-2">
                      {ticket.perks.map((perk, i) => (
                        <motion.div
                          key={perk}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-sm text-white/90"
                        >
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          {perk}
                        </motion.div>
                      ))}
                    </div>

                    {/* Sales Progress */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Tickets Sold</span>
                        <motion.span
                          key={ticket.sold}
                          initial={{ scale: 1.2, color: "#22c55e" }}
                          animate={{ scale: 1, color: "#ffffff" }}
                          className="font-semibold"
                        >
                          {ticket.sold}/{ticket.total}
                        </motion.span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full bg-gradient-to-r", ticket.color)}
                          initial={{ width: 0 }}
                          animate={{ width: `${(ticket.sold / ticket.total) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      {ticket.sold / ticket.total > 0.8 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-1 mt-2 text-amber-400 text-xs"
                        >
                          <AlertCircle className="h-3 w-3" />
                          Almost sold out!
                        </motion.div>
                      )}
                    </div>

                    {/* QR Code Preview */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <QrCode className="h-4 w-4" />
                        QR Code Included
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-semibold text-white",
                          "bg-gradient-to-r",
                          ticket.color
                        )}
                      >
                        Select
                      </motion.button>
                    </div>
                  </div>

                  {/* Perforated edge */}
                  <div className="absolute top-[100px] left-0 right-0 flex justify-between px-0">
                    <div className="w-4 h-8 bg-slate-950 rounded-r-full" />
                    <div className="flex-1 border-t-2 border-dashed border-white/20 my-4" />
                    <div className="w-4 h-8 bg-slate-950 rounded-l-full" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Ticket selector dots */}
      <div className="flex justify-center gap-2 mt-4">
        {tickets.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveTicket(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              index === activeTicket
                ? "bg-white w-8"
                : "bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// LIVE SALES DASHBOARD - Real-time metrics simulation
// ============================================================================
function LiveSalesDashboard() {
  const [metrics, setMetrics] = useState({
    totalSales: 48750,
    ticketsSold: 431,
    conversionRate: 67.8,
    averageOrderValue: 113.11,
  });

  const [recentSales, setRecentSales] = useState([
    { id: 1, name: "Sarah M.", ticket: "VIP Pass", amount: "$299", time: "2m ago" },
    { id: 2, name: "John D.", ticket: "General x2", amount: "$198", time: "5m ago" },
    { id: 3, name: "Emily R.", ticket: "Early Bird", amount: "$69", time: "8m ago" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new sales
      setMetrics((prev) => {
        const newSale = Math.random() > 0.5;
        if (newSale) {
          const saleAmount = [69, 99, 198, 299][Math.floor(Math.random() * 4)];
          return {
            totalSales: prev.totalSales + saleAmount,
            ticketsSold: prev.ticketsSold + (saleAmount > 150 ? 2 : 1),
            conversionRate: Math.min(99, prev.conversionRate + (Math.random() * 0.2 - 0.1)),
            averageOrderValue: (prev.totalSales + saleAmount) / (prev.ticketsSold + 1),
          };
        }
        return prev;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-60" />

      <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Live Sales Dashboard</h3>
                <p className="text-xs text-white/60">Real-time event revenue tracking</p>
              </div>
            </div>
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              LIVE
            </motion.div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 p-6">
          {[
            {
              label: "Total Revenue",
              value: `$${metrics.totalSales.toLocaleString()}`,
              change: "+12.5%",
              icon: DollarSign,
              color: "text-emerald-400",
            },
            {
              label: "Tickets Sold",
              value: metrics.ticketsSold.toString(),
              change: "+8.3%",
              icon: Ticket,
              color: "text-blue-400",
            },
            {
              label: "Conversion Rate",
              value: `${metrics.conversionRate.toFixed(1)}%`,
              change: "+2.1%",
              icon: TrendingUp,
              color: "text-purple-400",
            },
            {
              label: "Avg. Order Value",
              value: `$${metrics.averageOrderValue.toFixed(2)}`,
              change: "+5.7%",
              icon: Receipt,
              color: "text-amber-400",
            },
          ].map((metric) => (
            <motion.div
              key={metric.label}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={cn("h-5 w-5", metric.color)} />
                <span className="text-xs text-emerald-400 font-medium">{metric.change}</span>
              </div>
              <motion.div
                key={metric.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-white"
              >
                {metric.value}
              </motion.div>
              <div className="text-xs text-white/60 mt-1">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Sales Feed */}
        <div className="px-6 pb-6">
          <div className="text-xs text-white/60 uppercase tracking-wider mb-3">Recent Sales</div>
          <div className="space-y-2">
            {recentSales.map((sale, index) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                    {sale.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{sale.name}</div>
                    <div className="text-xs text-white/60">{sale.ticket}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-400">{sale.amount}</div>
                  <div className="text-xs text-white/40">{sale.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROMO CODE DEMO - Interactive discount system
// ============================================================================
function PromoCodeDemo() {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);
  const [discount, setDiscount] = useState<{ type: string; value: number } | null>(null);

  const promoCodes: Record<string, { type: string; value: number; label: string }> = {
    EARLY20: { type: "percentage", value: 20, label: "20% OFF" },
    SAVE50: { type: "fixed", value: 50, label: "$50 OFF" },
    VIP10: { type: "percentage", value: 10, label: "10% OFF" },
  };

  const handleApply = () => {
    const upperCode = code.toUpperCase();
    if (promoCodes[upperCode]) {
      setDiscount(promoCodes[upperCode]);
      setApplied(true);
    }
  };

  const basePrice = 99;
  const finalPrice = discount
    ? discount.type === "percentage"
      ? basePrice * (1 - discount.value / 100)
      : basePrice - discount.value
    : basePrice;

  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <BadgePercent className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Promo Code System</h3>
            <p className="text-xs text-white/60">Dynamic discounts & offers</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Code Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter promo code (try EARLY20)"
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-purple-500/50"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApply}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-sm"
          >
            Apply
          </motion.button>
        </div>

        {/* Price Display */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/60">General Admission</span>
            <span className={cn("text-white", applied && "line-through text-white/40")}>
              ${basePrice.toFixed(2)}
            </span>
          </div>

          <AnimatePresence>
            {applied && discount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex justify-between items-center mb-3 text-emerald-400">
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {code.toUpperCase()}
                  </span>
                  <span>-{discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center">
            <span className="text-white font-medium">Total</span>
            <motion.span
              key={finalPrice}
              initial={{ scale: 1.2, color: "#22c55e" }}
              animate={{ scale: 1, color: applied ? "#22c55e" : "#ffffff" }}
              className="text-2xl font-bold"
            >
              ${finalPrice.toFixed(2)}
            </motion.span>
          </div>

          {applied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-emerald-400 text-sm"
            >
              <CheckCircle className="h-4 w-4" />
              You saved ${(basePrice - finalPrice).toFixed(2)}!
            </motion.div>
          )}
        </div>

        {/* Available Codes */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(promoCodes).map(([c, data]) => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.05 }}
              onClick={() => setCode(c)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-white/60 hover:text-white hover:border-purple-500/50 transition-all"
            >
              {c} - {data.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center text-white overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        poster="/hero-poster.jpg"
      >
        <source src="/hero-background.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-blue-900/50 to-black/80 -z-10" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[150px]"
          animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[150px]"
          animate={{ x: [0, -80, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/15 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

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
                <Ticket className="h-4 w-4 text-blue-400" />
                For Organizers
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-sm font-medium">
                <Star className="h-4 w-4 text-amber-400" />
                Popular
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              Seamless{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Registration
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>{" "}
              & Ticketing
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-neutral-300 leading-relaxed max-w-2xl lg:max-w-none"
            >
              Multi-tier ticketing with dynamic pricing, promo codes, and waitlist management.
              Accept payments globally and deliver QR-coded tickets instantly.
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
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-14 px-8 text-lg shadow-lg shadow-blue-500/25"
                asChild
              >
                <Link href="/contact?demo=registration-ticketing">
                  Start Selling Tickets
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
                  Watch Demo
                </Link>
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { value: "135+", label: "Currencies" },
                { value: "99.9%", label: "Uptime" },
                { value: "2M+", label: "Tickets Sold" },
                { value: "<3s", label: "Checkout Time" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Animated Ticket Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <AnimatedTicketShowcase />
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
      icon: Clock,
      stat: "47%",
      title: "Abandoned Checkouts",
      description: "Nearly half of event registrations are abandoned due to complicated checkout processes",
      gradient: "from-red-500 to-orange-500",
    },
    {
      icon: CreditCard,
      stat: "68%",
      title: "Payment Friction",
      description: "Attendees give up when their preferred payment method isn't available",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: RefreshCw,
      stat: "3.2hrs",
      title: "Manual Work",
      description: "Average weekly time organizers spend on manual registration management",
      gradient: "from-amber-500 to-red-500",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30"
            animate={{
              boxShadow: [
                "0 0 20px rgba(239,68,68,0.2)",
                "0 0 40px rgba(239,68,68,0.4)",
                "0 0 20px rgba(239,68,68,0.2)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            The Problem
          </motion.span>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
            Traditional Registration is{" "}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Broken
            </span>
          </h2>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Spreadsheets, manual confirmations, and clunky checkout flows cost you attendees and revenue.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              variants={fadeInUp}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-8 rounded-2xl bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl">
                <div
                  className={cn(
                    "inline-flex p-3 rounded-xl bg-gradient-to-r mb-6",
                    problem.gradient
                  )}
                >
                  <problem.icon className="h-6 w-6 text-white" />
                </div>

                <div
                  className={cn(
                    "text-5xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent",
                    problem.gradient
                  )}
                >
                  {problem.stat}
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">{problem.title}</h3>
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
// FEATURES SECTION
// ============================================================================
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Layers,
      title: "Multi-Tier Ticketing",
      description:
        "Create unlimited ticket types with custom pricing, benefits, and availability windows. VIP, Early Bird, Group rates - all in one place.",
      color: "from-blue-500 to-cyan-500",
      demo: "ticket",
    },
    {
      icon: BadgePercent,
      title: "Promo Codes & Discounts",
      description:
        "Percentage or fixed discounts, usage limits, time-sensitive offers, and automatic code validation at checkout.",
      color: "from-purple-500 to-pink-500",
      demo: "promo",
    },
    {
      icon: Globe,
      title: "Global Payments",
      description:
        "Accept 135+ currencies with support for credit cards, digital wallets, bank transfers, and local payment methods.",
      color: "from-emerald-500 to-teal-500",
      demo: "payment",
    },
    {
      icon: QrCode,
      title: "QR Code Tickets",
      description:
        "Auto-generated secure QR codes for easy check-in. Supports Apple Wallet and Google Wallet integration.",
      color: "from-amber-500 to-orange-500",
      demo: "qr",
    },
    {
      icon: UserPlus,
      title: "Waitlist Management",
      description:
        "Automatic waitlist when tickets sell out. Smart queue management with priority rules and auto-notifications.",
      color: "from-rose-500 to-red-500",
      demo: "waitlist",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description:
        "Track sales, revenue, conversion rates, and attendee demographics with beautiful, actionable dashboards.",
      color: "from-indigo-500 to-violet-500",
      demo: "analytics",
    },
  ];

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-900/50 to-background -z-10" />

      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
            <Sparkles className="h-4 w-4" />
            Powerful Features
          </span>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Sell Out
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete registration and ticketing solution built for modern events of any size.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={scaleIn}
              className="group relative"
            >
              <div
                className={cn(
                  "absolute -inset-1 bg-gradient-to-r rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity",
                  feature.color
                )}
              />

              <div className="relative h-full p-8 rounded-2xl bg-card border border-border/50 hover:border-border transition-all">
                <div
                  className={cn(
                    "inline-flex p-3 rounded-xl bg-gradient-to-r mb-6",
                    feature.color
                  )}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// INTERACTIVE DEMO SECTION
// ============================================================================
function InteractiveDemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-background via-slate-900/50 to-background relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[200px]"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
            <Zap className="h-4 w-4" />
            See It In Action
          </span>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Real Results
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience our live dashboard and see how easy it is to manage your event's ticketing.
          </p>
        </motion.div>

        {/* Demo Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-8"
        >
          <motion.div variants={fadeInUp}>
            <LiveSalesDashboard />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <PromoCodeDemo />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "01",
      icon: Settings,
      title: "Configure Your Tickets",
      description:
        "Set up ticket types, pricing tiers, early bird offers, and group discounts in minutes with our intuitive dashboard.",
    },
    {
      number: "02",
      icon: Globe,
      title: "Go Live & Sell",
      description:
        "Embed our checkout widget or use your branded registration page. Start accepting payments instantly.",
    },
    {
      number: "03",
      icon: Mail,
      title: "Automated Delivery",
      description:
        "Tickets with QR codes are sent automatically. Add to Apple/Google Wallet with one tap.",
    },
    {
      number: "04",
      icon: Scan,
      title: "Fast Check-In",
      description:
        "Scan QR codes at the door with our mobile app. Real-time attendance tracking and capacity management.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 relative" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
            <RefreshCw className="h-4 w-4" />
            Simple Process
          </span>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            From Setup to{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Sold Out
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get your event registration live in under 10 minutes with our streamlined workflow.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="relative"
        >
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="relative group"
              >
                {/* Card */}
                <div className="relative p-8 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/30 transition-all text-center">
                  {/* Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-6 mt-4">
                    <step.icon className="h-8 w-8 text-indigo-400" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                    <ChevronRight className="h-8 w-8 text-indigo-500/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// USE CASES SECTION
// ============================================================================
function UseCasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const useCases = [
    {
      icon: Building2,
      title: "Corporate Conferences",
      description: "Multi-track sessions, VIP packages, sponsor passes, and enterprise invoicing.",
      stats: "50K+ attendees supported",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: PartyPopper,
      title: "Festivals & Concerts",
      description: "Day passes, weekend bundles, early bird pricing, and merchandise add-ons.",
      stats: "100K+ tickets per event",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: HeartHandshake,
      title: "Charity Galas",
      description: "Donation tiers, table sponsorships, auction integrations, and tax receipts.",
      stats: "$2M+ raised per event",
      color: "from-rose-500 to-red-500",
    },
    {
      icon: Users,
      title: "Community Meetups",
      description: "Free and paid tiers, RSVP tracking, recurring events, and member discounts.",
      stats: "10K+ communities served",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-background via-slate-900/30 to-background" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
            <Target className="h-4 w-4" />
            Use Cases
          </span>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Perfect for{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Every Event
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            From intimate workshops to massive festivals, our platform scales with your needs.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8"
        >
          {useCases.map((useCase) => (
            <motion.div
              key={useCase.title}
              variants={scaleIn}
              className="group relative"
            >
              <div
                className={cn(
                  "absolute -inset-1 bg-gradient-to-r rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity",
                  useCase.color
                )}
              />

              <div className="relative p-8 rounded-2xl bg-card border border-border/50 hover:border-border transition-all flex gap-6">
                <div
                  className={cn(
                    "shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-r flex items-center justify-center",
                    useCase.color
                  )}
                >
                  <useCase.icon className="h-8 w-8 text-white" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-4">{useCase.description}</p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent",
                      useCase.color
                    )}
                  >
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    {useCase.stats}
                  </span>
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
// INTEGRATIONS SECTION
// ============================================================================
function IntegrationsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const integrations = [
    { name: "Stripe", category: "Payments" },
    { name: "PayPal", category: "Payments" },
    { name: "Apple Pay", category: "Wallets" },
    { name: "Google Pay", category: "Wallets" },
    { name: "Mailchimp", category: "Marketing" },
    { name: "HubSpot", category: "CRM" },
    { name: "Salesforce", category: "CRM" },
    { name: "Zapier", category: "Automation" },
  ];

  return (
    <section className="py-24 lg:py-32 relative" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-violet-500/20 text-violet-400 rounded-full border border-violet-500/30">
              <Layers className="h-4 w-4" />
              Integrations
            </span>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Connect Your{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Entire Stack
              </span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Seamlessly integrate with your existing tools. Payment processors, CRMs, marketing
              platforms, and more - all working together.
            </p>

            <div className="space-y-4">
              {[
                { icon: Shield, text: "PCI-DSS Level 1 compliant payment processing" },
                { icon: Lock, text: "End-to-end encryption for all transactions" },
                { icon: RefreshCw, text: "Real-time sync with your favorite tools" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <item.icon className="h-4 w-4 text-violet-400" />
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Integration Grid */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-2 gap-4"
          >
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-violet-500/30 transition-all text-center"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <Wallet className="h-6 w-6 text-violet-400" />
                </div>
                <div className="font-semibold">{integration.name}</div>
                <div className="text-xs text-muted-foreground">{integration.category}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ SECTION
// ============================================================================
function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What payment methods do you support?",
      answer:
        "We support all major credit cards (Visa, Mastercard, Amex), digital wallets (Apple Pay, Google Pay), PayPal, bank transfers, and local payment methods in 135+ countries. Enterprise clients can also request custom payment integrations.",
    },
    {
      question: "How do promo codes and discounts work?",
      answer:
        "Create unlimited promo codes with percentage or fixed discounts, usage limits, expiration dates, and minimum purchase requirements. Codes can be applied automatically at checkout or entered manually by attendees.",
    },
    {
      question: "Can I sell tickets for free events?",
      answer:
        "Yes! Free events are completely free to host with no platform fees. You only pay when you charge for tickets, with transparent pricing starting at 2% + $0.50 per paid ticket.",
    },
    {
      question: "How does the waitlist work?",
      answer:
        "When tickets sell out, interested attendees can join an automated waitlist. If tickets become available (through cancellations or added inventory), waitlisted users are notified in order and given a time-limited window to purchase.",
    },
    {
      question: "What about refunds and cancellations?",
      answer:
        "You have full control over your refund policy. Process full or partial refunds with one click, or let our system handle automatic refunds for cancelled events. Refund fees are returned when the original transaction is refunded.",
    },
    {
      question: "Is there a check-in app?",
      answer:
        "Yes! Our free iOS and Android apps let you scan QR codes for instant check-in. View real-time attendance, search attendees, and manage walk-ins. Works offline too for venues with limited connectivity.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-background via-slate-900/30 to-background" ref={ref}>
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </span>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Got{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Questions?
            </span>
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="rounded-2xl border border-border/50 bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-muted-foreground">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
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
    <section className="py-24 lg:py-32 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
            Ready to Sell Out Your Next Event?
          </h2>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of organizers who trust Event Dynamics for seamless registration and ticketing.
            Start free, scale infinitely.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-white/90 h-14 px-8 text-lg shadow-xl"
              asChild
            >
              <Link href="/auth/register">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 border border-white/30 text-white hover:bg-white/20 h-14 px-8 text-lg backdrop-blur-sm"
              asChild
            >
              <Link href="/contact?demo=registration-ticketing">
                Talk to Sales
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <span className="text-sm">256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm">135+ Currencies</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm">99.9% Uptime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MISSING ICON COMPONENT
// ============================================================================
function HelpCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function Target(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function RegistrationTicketingPage() {
  return (
    <main className="relative">
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <InteractiveDemoSection />
      <HowItWorksSection />
      <UseCasesSection />
      <IntegrationsSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
