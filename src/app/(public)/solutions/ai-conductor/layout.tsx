// src/app/(public)/solutions/ai-conductor/layout.tsx
import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title:
      "AI-Powered Engagement Conductor - Autonomous Event Intelligence | Event Dynamics",
    description:
      "Revolutionary AI that monitors engagement patterns, detects anomalies in real-time, and intervenes automatically to prevent audience drop-off. Powered by Thompson Sampling, LangGraph orchestration, and Claude AI.",
    path: "/solutions/ai-conductor",
    keywords: [
      "AI engagement conductor",
      "autonomous event AI",
      "engagement monitoring",
      "anomaly detection",
      "Thompson Sampling",
      "AI interventions",
      "real-time analytics",
      "engagement prediction",
      "audience retention AI",
      "event intelligence",
      "machine learning events",
      "LangGraph orchestration",
      "Claude AI integration",
      "predictive engagement",
      "automated moderation",
      "content generation AI",
      "signal collection",
      "intervention engine",
    ],
  });
}

export default function AIConductorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
