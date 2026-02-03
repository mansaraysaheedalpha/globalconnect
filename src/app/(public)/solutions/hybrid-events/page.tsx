// src/app/(public)/solutions/hybrid-events/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Hybrid Events - Event Dynamics Solutions',
    description: 'Deliver seamless hybrid events where in-person and virtual attendees have equally engaging experiences.',
    path: '/solutions/hybrid-events',
    keywords: [
      'hybrid events',
      'event management',
      'enterprise',
      
    ],
  });
}

export default function HybridEventsPage() {
  return (
    <SolutionPlaceholder
      title="Hybrid Events"
      subtitle="Unified experience for physical and virtual attendees"
      description="Deliver seamless hybrid events where in-person and virtual attendees have equally engaging experiences."
      category="enterprise"
      
      
      features={[
        "Unified registration system",
        "Dual experience design",
        "Cross-platform networking",
        "Hybrid session management",
        "Unified analytics",
        "Content synchronization"
]}
    />
  );
}
