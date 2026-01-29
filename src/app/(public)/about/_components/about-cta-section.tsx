// src/app/(public)/about/_components/about-cta-section.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar, Mail } from "lucide-react";

export function AboutCtaSection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(222,65%,10%)] to-[hsl(222,65%,8%)] -z-10" />

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] -z-5" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full"
          >
            Get Started
          </motion.span>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Ready to Transform{" "}
            <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
              Your Events?
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-neutral-300 mb-10 max-w-2xl mx-auto">
            Join the next generation of event organizers using AI-powered intelligence
            to create unforgettable experiences. See how Event Dynamics can transform
            your events.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="premium" className="group text-base h-14 px-10" asChild>
              <Link href="/auth/register">
                <Calendar className="mr-2 h-5 w-5" />
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-10 backdrop-blur-sm"
              asChild
            >
              <Link href="/auth/register">
                Start Free Trial
              </Link>
            </Button>
          </div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-neutral-400"
          >
            <a
              href="mailto:sales@eventdynamics.io"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              sales@eventdynamics.io
            </a>
            <span className="hidden sm:block text-neutral-600">|</span>
            <span>No credit card required for trial</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
