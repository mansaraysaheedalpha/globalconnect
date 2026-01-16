// src/app/auth/layout.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// Animated floating shapes for the background
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient orbs */}
      <motion.div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-600/20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/25 to-cyan-500/15 blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/15 blur-3xl"
        animate={{
          x: [0, 25, 0],
          y: [0, -25, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-20 right-20 w-4 h-4 rounded-full bg-white/40"
        animate={{
          y: [0, -15, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 right-32 w-3 h-3 rounded-full bg-white/30"
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute bottom-1/3 left-20 w-2 h-2 rounded-full bg-white/50"
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background px-4 sm:px-6 py-6 sm:py-8">
      {/* --- FORM SIDE (LEFT) --- */}
      <motion.div
        className="flex flex-1 flex-col items-center justify-center gap-6 rounded-2xl bg-card/60 border border-border/50 shadow-sm px-4 py-6 sm:p-8 lg:p-10 backdrop-blur-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-3 lg:hidden mb-4">
          <Image
            src="/logo.png"
            alt="Event Dynamics Logo"
            width={40}
            height={40}
          />
          <span className="text-xl font-bold">Event Dynamics</span>
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </motion.div>

      {/* --- VISUAL SIDE (RIGHT) --- */}
      <div className="relative hidden lg:flex lg:w-1/2 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ml-4">
        {/* Animated background */}
        <FloatingShapes />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Content */}
        <motion.div
          className="relative z-10 flex flex-col justify-between h-full w-full p-12 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/logo.png"
                alt="Event Dynamics Logo"
                width={44}
                height={44}
              />
            </motion.div>
            <span className="text-2xl font-bold group-hover:text-purple-300 transition-colors">
              Event Dynamics
            </span>
          </Link>

          <div className="space-y-6">
            <motion.h2
              className="text-4xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                The Intelligent OS
              </span>
              <br />
              <span className="text-white/90">for World-Class Events</span>
            </motion.h2>
            <motion.p
              className="max-w-lg text-lg text-neutral-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Create, manage, and deliver unforgettable event experiences
              with our comprehensive platform.
            </motion.p>

            {/* Feature highlights */}
            <motion.div
              className="flex flex-wrap gap-3 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {["Live Streaming", "Real-time Analytics", "Attendee Engagement"].map((feature, i) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 text-sm rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80"
                >
                  {feature}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
