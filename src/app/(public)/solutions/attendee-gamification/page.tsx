// src/app/(public)/solutions/attendee-gamification/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Gamification - Event Dynamics Solutions',
    description: 'Make events more fun and rewarding. Earn points for participation, unlock achievements, and compete on leaderboards.',
    path: '/solutions/attendee-gamification',
    keywords: [
      'gamification',
      'event management',
      'attendees',
      
    ],
  });
}

export default function AttendeeGamificationPage() {
  return (
    <SolutionPlaceholder
      title="Gamification"
      subtitle="Earn points and compete on leaderboards"
      description="Make events more fun and rewarding. Earn points for participation, unlock achievements, and compete on leaderboards."
      category="attendees"
      
      
      features={[
        "Action-based points (chat, polls, Q&A)",
        "Achievement badges",
        "Individual leaderboard ranking",
        "Team competitions",
        "Point history tracking",
        "Reward redemption"
]}
    />
  );
}
