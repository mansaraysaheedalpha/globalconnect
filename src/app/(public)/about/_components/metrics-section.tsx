// src/app/(public)/about/_components/metrics-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Zap,
  Network,
  Clock,
  Server,
  Target,
  Shield,
} from "lucide-react";

const metrics = [
  {
    icon: Network,
    value: 20,
    suffix: "+",
    label: "WebSocket Gateways",
    description: "Real-time communication channels",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Clock,
    value: 200,
    prefix: "<",
    suffix: "ms",
    label: "Response Latency",
    description: "Real-time intervention speed",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Server,
    value: 5,
    suffix: "",
    label: "Microservices",
    description: "Distributed architecture",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: Target,
    value: 12,
    suffix: "+",
    label: "Intent Signals",
    description: "Lead scoring interaction types",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    value: 99.9,
    suffix: "%",
    label: "Uptime SLA",
    description: "Enterprise reliability",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Zap,
    value: 2,
    prefix: "<",
    suffix: "s",
    label: "Intervention Time",
    description: "AI response to engagement drops",
    gradient: "from-primary to-yellow-500",
  },
];

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2000,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(easeOutQuart * value);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  const displayValue = value % 1 === 0 ? Math.floor(count) : count.toFixed(1);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

export function MetricsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-secondary/30">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full"
          >
            By The Numbers
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Built for{" "}
            <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
              Scale & Speed
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our architecture is designed from the ground up for real-time performance
            and enterprise reliability.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative h-full rounded-2xl border bg-card p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 overflow-hidden text-center">
                {/* Gradient hover effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div
                  className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg mb-4`}
                >
                  <metric.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>

                {/* Value */}
                <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">
                  <AnimatedCounter
                    value={metric.value}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                  />
                </div>

                {/* Label */}
                <h3 className="text-base font-semibold mb-1 group-hover:text-primary transition-colors">
                  {metric.label}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
