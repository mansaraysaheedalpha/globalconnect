// src/app/(public)/about/_components/technology-stack-section.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Layers,
  Code2,
  Server,
  Brain,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";

const techLayers = [
  {
    name: "Frontend",
    icon: Code2,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500",
    technologies: [
      { name: "Next.js 15", role: "Framework" },
      { name: "React 19", role: "UI Library" },
      { name: "TypeScript", role: "Type Safety" },
      { name: "Tailwind CSS", role: "Styling" },
      { name: "Framer Motion", role: "Animations" },
      { name: "Apollo Client", role: "GraphQL" },
    ],
  },
  {
    name: "Backend",
    icon: Server,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-500",
    technologies: [
      { name: "NestJS", role: "API Framework" },
      { name: "FastAPI", role: "Python Services" },
      { name: "GraphQL", role: "Query Language" },
      { name: "PostgreSQL", role: "5 DB Instances" },
      { name: "Redis", role: "Caching" },
      { name: "Kafka", role: "Event Streaming" },
    ],
  },
  {
    name: "AI/ML",
    icon: Brain,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-500",
    technologies: [
      { name: "LangGraph", role: "Agent Workflows" },
      { name: "Claude API", role: "LLM Provider" },
      { name: "Tavily", role: "Web Search" },
      { name: "Thompson Sampling", role: "Optimization" },
      { name: "River ML", role: "Online Learning" },
      { name: "Transformers", role: "NLP Models" },
    ],
  },
  {
    name: "Infrastructure",
    icon: Cloud,
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-500",
    technologies: [
      { name: "Socket.IO", role: "20+ Gateways" },
      { name: "Docker", role: "Containerization" },
      { name: "Event Sourcing", role: "Audit Trails" },
      { name: "Daily.co", role: "Video Calls" },
      { name: "MinIO/S3", role: "Object Storage" },
      { name: "Resend", role: "Email Delivery" },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export function TechnologyStackSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-secondary/30">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/5 rounded-full blur-[200px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

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
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full"
          >
            <Layers className="h-4 w-4" />
            Technology Stack
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Modern Architecture,{" "}
            <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
              Built to Scale
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A microservices architecture with best-in-class technologies at every layer,
            designed for real-time performance and enterprise reliability.
          </p>
        </motion.div>

        {/* Tech Stack Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {techLayers.map((layer, layerIndex) => (
            <motion.div
              key={layer.name}
              variants={itemVariants}
              className="group"
            >
              <div className="relative h-full rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/30 overflow-hidden">
                {/* Gradient hover effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${layer.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                      layer.color
                    )}
                  >
                    <layer.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{layer.name}</h3>
                    <p className="text-sm text-muted-foreground">Layer {layerIndex + 1}</p>
                  </div>
                </div>

                {/* Technologies Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {layer.technologies.map((tech, techIndex) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.3 + layerIndex * 0.1 + techIndex * 0.05 }}
                      className={cn(
                        "rounded-lg border p-3 transition-all duration-200 hover:border-primary/30",
                        layer.bgColor,
                        "border-transparent"
                      )}
                    >
                      <p className={cn("font-medium text-sm", layer.textColor)}>
                        {tech.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tech.role}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Architecture Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            <span className="font-medium text-foreground">5 microservices</span> communicate
            via GraphQL federation and Kafka event streaming, with{" "}
            <span className="font-medium text-foreground">5 PostgreSQL instances</span> for
            data isolation and{" "}
            <span className="font-medium text-foreground">20+ WebSocket gateways</span> for
            real-time features.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
