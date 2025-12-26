// src/app/(public)/_components/cta-section.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Check } from "lucide-react";

const highlights = [
  "Free to get started",
  "No credit card required",
  "Cancel anytime",
];

export function CtaSection() {
  return (
    <section className="relative bg-background py-16 sm:py-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Main CTA Card */}
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />

            {/* Pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Content */}
            <div className="relative px-6 py-14 sm:px-10 md:px-16 md:py-20 lg:py-24 text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white">
                  <Sparkles className="h-4 w-4" />
                  Start Your Journey
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
              >
                Ready to redefine your
                <br className="hidden sm:block" />{" "}
                <span className="relative">
                  event experience?
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-white/30 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  />
                </span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-white/80 leading-relaxed px-2"
              >
                Join the next generation of event creators and start building
                unforgettable moments today.
              </motion.p>

              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mt-7 sm:mt-8 px-1"
              >
                {highlights.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-white/90"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2"
              >
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/20 h-13 sm:h-14 px-6 sm:px-8 text-base font-semibold group"
                  asChild
                >
                  <Link href="/auth/register">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-13 sm:h-14 px-6 sm:px-8 text-base backdrop-blur-sm"
                  asChild
                >
                  <Link href="/events">Explore Events</Link>
                </Button>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute top-8 left-8 w-20 h-20 border border-white/10 rounded-full" />
              <div className="absolute bottom-8 right-8 w-32 h-32 border border-white/10 rounded-full" />
              <div className="absolute top-1/2 right-16 w-4 h-4 bg-white/20 rounded-full hidden lg:block" />
              <div className="absolute bottom-16 left-16 w-3 h-3 bg-white/20 rounded-full hidden lg:block" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
