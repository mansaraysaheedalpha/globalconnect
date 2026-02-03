// src/app/(public)/solutions/matchmaking/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'AI-Powered Matchmaking - Event Dynamics Solutions',
    description: 'Meet the right people at every event. Our AI analyzes profiles, interests, and behavior to recommend the most valuable connections.',
    path: '/solutions/matchmaking',
    keywords: [
      'ai-powered matchmaking',
      'event management',
      'attendees',
      'AI-powered',
    ],
  });
}

export default function MatchmakingPage() {
  return (
    <SolutionPlaceholder
      title="AI-Powered Matchmaking"
      subtitle="Smart recommendations based on shared interests"
      description="Meet the right people at every event. Our AI analyzes profiles, interests, and behavior to recommend the most valuable connections."
      category="attendees"
      isAI={true}
      
      features={[
        "LLM-driven match recommendations",
        "Context scoring (shared sessions, interests)",
        "Match score 0-100",
        "Explanation for each match",
        "Conversation starter suggestions",
        "Top 10 daily recommendations"
]}
    />
  );
}
