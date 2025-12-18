// src/app/(public)/_components/benefits-section.tsx
"use client";

import { Sparkles, ShieldCheck, Globe, Zap, Clock, Heart } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const benefits = [
  {
    name: "Unparalleled Simplicity",
    description:
      "Create stunning events in minutes, not days. Our powerful, intuitive interface requires no coding or complex training.",
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "Enterprise-Grade Power",
    description:
      "Global-scale analytics, robust security, and seamless integrations. Professional tools you can trust.",
    icon: ShieldCheck,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Global Reach",
    description:
      "Connect with attendees worldwide. Multi-language support, timezone handling, and currency flexibility built-in.",
    icon: Globe,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "Lightning Fast",
    description:
      "Optimized performance ensures your events load instantly. No waiting, no friction, just results.",
    icon: Zap,
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    name: "Save Time",
    description:
      "Automate repetitive tasks and workflows. Focus on what matters most—creating memorable experiences.",
    icon: Clock,
    gradient: "from-emerald-500 to-green-500",
  },
  {
    name: "Loved by Users",
    description:
      "Join thousands of event creators who trust GlobalConnect to deliver exceptional experiences.",
    icon: Heart,
    gradient: "from-pink-500 to-rose-500",
  },
];

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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

export function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="benefits" className="relative py-24 sm:py-32 overflow-hidden scroll-mt-20">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-secondary to-secondary/50" />

      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full"
          >
            Why GlobalConnect
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            The GlobalConnect{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Advantage
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We built a platform that's both incredibly powerful and beautifully
            simple. Here's why teams love us.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.name}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative h-full rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 overflow-hidden">
                {/* Gradient hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Icon with gradient background */}
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.gradient} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-7 w-7 text-white" aria-hidden="true" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {benefit.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Bottom line accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
