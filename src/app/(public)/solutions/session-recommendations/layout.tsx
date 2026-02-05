// src/app/(public)/solutions/session-recommendations/layout.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'AI Session Recommendations - Your Event, Personalized | Event Dynamics',
    description: 'Never miss relevant content or connections again. Our AI analyzes your profile, interests, and goals to recommend sessions and people with 92% average match accuracy. Includes conversation starters and schedule optimization.',
    path: '/solutions/session-recommendations',
    keywords: [
      'AI recommendations',
      'session recommendations',
      'personalized events',
      'AI matchmaking',
      'event personalization',
      'smart networking',
      'AI-powered events',
      'connection recommendations',
      'schedule optimization',
      'conversation starters',
      'interest matching',
      'goal-based matching',
      'skill exchange',
      'networking AI',
      'attendee matching',
      'personalized experience',
      'event AI',
      'smart event platform',
    ],
  });
}

export default function SessionRecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
