// src/app/(public)/solutions/in-person-events/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'In-Person Events - Event Dynamics Solutions',
    description: 'Enhance in-person events with digital tools. Manage check-ins, enable proximity networking, and provide interactive venue maps.',
    path: '/solutions/in-person-events',
    keywords: [
      'in-person events',
      'event management',
      'enterprise',
      
    ],
  });
}

export default function InPersonEventsPage() {
  return (
    <SolutionPlaceholder
      title="In-Person Events"
      subtitle="Check-in, proximity networking, and venue maps"
      description="Enhance in-person events with digital tools. Manage check-ins, enable proximity networking, and provide interactive venue maps."
      category="enterprise"
      
      
      features={[
        "QR code check-in",
        "Badge printing integration",
        "Proximity-based networking",
        "Interactive venue maps",
        "Capacity tracking",
        "Real-time attendance"
]}
    />
  );
}
