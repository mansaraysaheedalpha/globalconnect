// src/app/(public)/solutions/session-builder/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Session & Agenda Builder - Event Dynamics Solutions',
    description: 'Build complex multi-track agendas with ease. Manage session capacity, speaker assignments, and time slots all in one intuitive interface.',
    path: '/solutions/session-builder',
    keywords: [
      'session & agenda builder',
      'event management',
      'organizers',
      
    ],
  });
}

export default function SessionBuilderPage() {
  return (
    <SolutionPlaceholder
      title="Session & Agenda Builder"
      subtitle="Multi-track scheduling with smart capacity control"
      description="Build complex multi-track agendas with ease. Manage session capacity, speaker assignments, and time slots all in one intuitive interface."
      category="organizers"
      
      
      features={[
        "Visual timeline builder",
        "Multi-track scheduling",
        "Automatic conflict detection",
        "Capacity management per session",
        "Speaker assignment and management",
        "Break and networking time blocks"
]}
    />
  );
}
