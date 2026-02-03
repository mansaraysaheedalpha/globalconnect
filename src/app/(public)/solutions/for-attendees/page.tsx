// src/app/(public)/solutions/for-attendees/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Solutions for Attendees - Event Dynamics Solutions',
    description: 'AI-powered matchmaking, proximity networking, and personalized recommendations ensure you make valuable connections and discover relevant content.',
    path: '/solutions/for-attendees',
    keywords: [
      'solutions for attendees',
      'event management',
      'attendees',
      
    ],
  });
}

export default function ForAttendeesPage() {
  return (
    <SolutionPlaceholder
      title="Solutions for Attendees"
      subtitle="Connect with the right people and get the most from every event"
      description="AI-powered matchmaking, proximity networking, and personalized recommendations ensure you make valuable connections and discover relevant content."
      category="attendees"
      
      
      features={[]}
    />
  );
}
