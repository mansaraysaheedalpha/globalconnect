// src/app/(public)/solutions/for-organizers/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Solutions for Event Organizers - Event Dynamics Solutions',
    description: 'From initial planning to post-event analytics, our comprehensive suite of tools helps you create unforgettable events that engage audiences and deliver measurable results.',
    path: '/solutions/for-organizers',
    keywords: [
      'solutions for event organizers',
      'event management',
      'organizers',
      
    ],
  });
}

export default function ForOrganizersPage() {
  return (
    <SolutionPlaceholder
      title="Solutions for Event Organizers"
      subtitle="Everything you need to plan, execute, and optimize professional events"
      description="From initial planning to post-event analytics, our comprehensive suite of tools helps you create unforgettable events that engage audiences and deliver measurable results."
      category="organizers"
      
      
      features={[]}
    />
  );
}
