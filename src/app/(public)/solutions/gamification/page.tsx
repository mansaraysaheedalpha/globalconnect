// src/app/(public)/solutions/gamification/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Gamification Engine - Event Dynamics Solutions',
    description: 'Boost participation with comprehensive gamification. Award points for actions, unlock achievements, and display leaderboards to motivate attendees.',
    path: '/solutions/gamification',
    keywords: [
      'gamification engine',
      'event management',
      'organizers',
      
    ],
  });
}

export default function GamificationPage() {
  return (
    <SolutionPlaceholder
      title="Gamification Engine"
      subtitle="Points, badges, and leaderboards that drive engagement"
      description="Boost participation with comprehensive gamification. Award points for actions, unlock achievements, and display leaderboards to motivate attendees."
      category="organizers"
      
      
      features={[
        "Action-based point system",
        "Custom achievements and badges",
        "Individual leaderboards",
        "Team leaderboards",
        "Real-time updates (5-second refresh)",
        "Customizable scoring rules"
]}
    />
  );
}
