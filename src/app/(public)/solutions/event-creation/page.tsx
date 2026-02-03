// src/app/(public)/solutions/event-creation/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Event Creation & Templates - Event Dynamics Solutions',
    description: 'Create professional events in minutes with our intuitive event builder. Save time with reusable templates and blueprints that capture your best practices.',
    path: '/solutions/event-creation',
    keywords: [
      'event creation & templates',
      'event management',
      'organizers',
      
    ],
  });
}

export default function EventCreationPage() {
  return (
    <SolutionPlaceholder
      title="Event Creation & Templates"
      subtitle="Launch events faster with reusable blueprints"
      description="Create professional events in minutes with our intuitive event builder. Save time with reusable templates and blueprints that capture your best practices."
      category="organizers"
      
      
      features={[
        "Drag-and-drop event builder",
        "Reusable event templates and blueprints",
        "Multi-language event pages",
        "Custom branding and themes",
        "Event cloning and duplication",
        "Draft and preview modes"
]}
    />
  );
}
