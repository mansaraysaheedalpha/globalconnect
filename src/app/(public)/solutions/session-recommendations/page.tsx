// src/app/(public)/solutions/session-recommendations/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Session Recommendations - Event Dynamics Solutions',
    description: 'Never miss relevant content. Our AI analyzes your profile and behavior to recommend sessions you will find most valuable.',
    path: '/solutions/session-recommendations',
    keywords: [
      'session recommendations',
      'event management',
      'attendees',
      'AI-powered',
    ],
  });
}

export default function SessionRecommendationsPage() {
  return (
    <SolutionPlaceholder
      title="Session Recommendations"
      subtitle="AI-suggested sessions based on your interests"
      description="Never miss relevant content. Our AI analyzes your profile and behavior to recommend sessions you will find most valuable."
      category="attendees"
      isAI={true}
      
      features={[
        "Personalized session suggestions",
        "Interest-based matching",
        "Collaborative filtering",
        "Schedule optimization",
        "Conflict detection",
        "Recommendation explanations"
]}
    />
  );
}
