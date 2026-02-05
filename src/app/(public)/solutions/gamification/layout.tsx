// src/app/(public)/solutions/gamification/layout.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Gamification Engine - Turn Passive Attendees Into Active Champions',
    description: 'Award points for every action, unlock achievements with full-screen celebrations, and ignite competition with real-time leaderboards. Boost event engagement by 300%.',
    path: '/solutions/gamification',
    keywords: [
      'gamification engine',
      'event gamification',
      'leaderboards',
      'achievements',
      'points system',
      'team competition',
      'event engagement',
      'real-time updates',
      'attendee engagement',
      'event management',
    ],
  });
}

export default function GamificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
