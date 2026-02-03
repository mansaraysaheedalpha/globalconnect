// src/app/(public)/solutions/booth-interaction/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Live Booth Interaction - Event Dynamics Solutions',
    description: 'Engage attendees in real-time with live demos, Q&A, and one-on-one conversations. Track every interaction automatically.',
    path: '/solutions/booth-interaction',
    keywords: [
      'live booth interaction',
      'event management',
      'sponsors',
      
    ],
  });
}

export default function BoothInteractionPage() {
  return (
    <SolutionPlaceholder
      title="Live Booth Interaction"
      subtitle="Real-time attendee engagement and demos"
      description="Engage attendees in real-time with live demos, Q&A, and one-on-one conversations. Track every interaction automatically."
      category="sponsors"
      
      
      features={[
        "Live video demos",
        "Real-time chat",
        "Screen sharing capability",
        "Interaction tracking",
        "Demo scheduling",
        "Attendee browsing notifications"
]}
    />
  );
}
