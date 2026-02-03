// src/app/(public)/solutions/lead-pipeline/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Lead Management Pipeline - Event Dynamics Solutions',
    description: 'Organize and track your leads through every stage. Collaborate with your team and ensure no lead falls through the cracks.',
    path: '/solutions/lead-pipeline',
    keywords: [
      'lead management pipeline',
      'event management',
      'sponsors',
      
    ],
  });
}

export default function LeadPipelinePage() {
  return (
    <SolutionPlaceholder
      title="Lead Management Pipeline"
      subtitle="Track from New → Contacted → Qualified → Converted"
      description="Organize and track your leads through every stage. Collaborate with your team and ensure no lead falls through the cracks."
      category="sponsors"
      
      
      features={[
        "Kanban-style pipeline view",
        "Status tracking (New, Contacted, Qualified, Converted)",
        "Lead tagging and categorization",
        "Notes and follow-up reminders",
        "Team collaboration",
        "Conversion tracking"
]}
    />
  );
}
