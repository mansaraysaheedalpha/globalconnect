// src/app/(public)/solutions/proximity-networking/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Proximity Networking - Event Dynamics Solutions',
    description: 'Discover nearby attendees in real-time. Perfect for in-person and hybrid events. Get notified when relevant people are close by.',
    path: '/solutions/proximity-networking',
    keywords: [
      'proximity networking',
      'event management',
      'attendees',
      
    ],
  });
}

export default function ProximityNetworkingPage() {
  return (
    <SolutionPlaceholder
      title="Proximity Networking"
      subtitle="Location-based discovery with instant pinging"
      description="Discover nearby attendees in real-time. Perfect for in-person and hybrid events. Get notified when relevant people are close by."
      category="attendees"
      
      
      features={[
        "Real-time location updates",
        "Redis-based proximity search",
        "Nearby attendee notifications",
        "Direct ping capability",
        "5-minute deduplication",
        "Privacy controls"
]}
    />
  );
}
