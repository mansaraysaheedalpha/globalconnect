// src/app/(public)/_components/how-it-works-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  UserPlus,
  Calendar,
  Ticket,
  PartyPopper,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Create Account",
    description: "Sign up in seconds with your email or social accounts. No credit card required to get started.",
    icon: UserPlus,
    gradient: "from-blue-500 to-cyan-500",
    details: ["Quick registration", "Social login options", "Free tier available"],
  },
  {
    number: "02",
    title: "Create or Discover",
    description: "Organizers can create stunning events in minutes. Attendees can browse and discover events they love.",
    icon: Calendar,
    gradient: "from-violet-500 to-purple-500",
    details: ["Intuitive event builder", "Smart recommendations", "Powerful search filters"],
  },
  {
    number: "03",
    title: "Register & Engage",
    description: "Seamless ticketing and registration. Join sessions, network with attendees, and engage with content.",
    icon: Ticket,
    gradient: "from-amber-500 to-orange-500",
    details: ["One-click registration", "Multiple ticket types", "Interactive sessions"],
  },
  {
    number: "04",
    title: "Experience & Connect",
    description: "Attend amazing events, participate in live polls and Q&A, connect with like-minded people.",
    icon: PartyPopper,
    gradient: "from-pink-500 to-rose-500",
    details: ["Live interactions", "Networking features", "Post-event resources"],
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-16 sm:py-24 relative overflow-hidden scroll-mt-20">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16 px-2"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full"
          >
            Simple Process
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How It{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes. Whether you're organizing or attending, the journey is seamless.
          </p>
        </motion.div>

        {/* Steps - Desktop */}
        <div ref={ref} className="hidden lg:block">
          {/* Timeline */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-border">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-violet-500 via-amber-500 to-pink-500"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                style={{ transformOrigin: "left" }}
              />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                  className="relative"
                  onMouseEnter={() => setActiveStep(index)}
                >
                  {/* Icon Circle */}
                  <div className="flex justify-center mb-8">
                    <motion.div
                      className={cn(
                        "relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-all duration-300",
                        step.gradient,
                        activeStep === index ? "scale-110 shadow-xl" : ""
                      )}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <step.icon className="h-9 w-9 text-white" />
                      {/* Pulse ring */}
                      <div className={cn(
                        "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50 animate-ping",
                        step.gradient,
                        activeStep === index ? "block" : "hidden"
                      )} style={{ animationDuration: "2s" }} />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <span className={cn(
                      "text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2 block",
                      step.gradient
                    )}>
                      Step {step.number}
                    </span>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Details */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={activeStep === index ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-2 pt-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className={cn("h-4 w-4 bg-gradient-to-r bg-clip-text", step.gradient.replace("from-", "text-").split(" ")[0])} />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>

                  {/* Arrow to next */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-20 -right-4 transform translate-x-1/2">
                      <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps - Mobile */}
        <div className="lg:hidden space-y-5">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-4 bg-card border border-border/60 rounded-2xl p-4 shadow-sm"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                  step.gradient
                )}>
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-border ml-7 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <span className={cn(
                  "text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent",
                  step.gradient
                )}>
                  Step {step.number}
                </span>
                <h3 className="text-lg font-semibold mt-1">{step.title}</h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
