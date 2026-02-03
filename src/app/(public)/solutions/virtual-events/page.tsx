// src/app/(public)/solutions/virtual-events/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Virtual Events - Event Dynamics Solutions',
    description: 'Host professional virtual events with enterprise-grade streaming, recording, and accessibility features.',
    path: '/solutions/virtual-events',
    keywords: [
      'virtual events',
      'event management',
      'enterprise',
      
    ],
  });
}

export default function VirtualEventsPage() {
  return (
    <SolutionPlaceholder
      title="Virtual Events"
      subtitle="Full-featured streaming, recording, and live captions"
      description="Host professional virtual events with enterprise-grade streaming, recording, and accessibility features."
      category="enterprise"
      
      
      features={[
        "HD streaming with multiple providers",
        "Automatic recording",
        "Live captions and subtitles",
        "Max viewer capacity management",
        "Lobby and waiting room",
        "Geo-restrictions"
]}
    />
  );
}
