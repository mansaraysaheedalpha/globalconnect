// src/app/(public)/solutions/lead-scoring/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Intent-Based Lead Scoring - Event Dynamics Solutions',
    description: 'Never miss a hot lead again. Our AI analyzes attendee interactions to score leads automatically, helping you prioritize your follow-ups.',
    path: '/solutions/lead-scoring',
    keywords: [
      'intent-based lead scoring',
      'event management',
      'sponsors',
      'AI-powered',
    ],
  });
}

export default function LeadScoringPage() {
  return (
    <SolutionPlaceholder
      title="Intent-Based Lead Scoring"
      subtitle="AI-powered Hot/Warm/Cold classification"
      description="Never miss a hot lead again. Our AI analyzes attendee interactions to score leads automatically, helping you prioritize your follow-ups."
      category="sponsors"
      isAI={true}
      
      features={[
        "Intent scoring 0-100",
        "Hot (70+), Warm (40-69), Cold (0-39) classification",
        "Interaction tracking (booth visits, downloads, demos)",
        "Real-time score updates",
        "Score history and trends",
        "Custom scoring rules"
]}
    />
  );
}
