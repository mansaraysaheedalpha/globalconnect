// src/app/(public)/solutions/for-sponsors/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Solutions for Sponsors & Exhibitors - Event Dynamics Solutions',
    description: 'Transform sponsorships into revenue with AI-powered lead scoring, real-time alerts, and comprehensive analytics. Never miss a hot lead again.',
    path: '/solutions/for-sponsors',
    keywords: [
      'solutions for sponsors & exhibitors',
      'event management',
      'sponsors',
      
    ],
  });
}

export default function ForSponsorsPage() {
  return (
    <SolutionPlaceholder
      title="Solutions for Sponsors & Exhibitors"
      subtitle="Maximize ROI with intelligent lead capture and engagement tools"
      description="Transform sponsorships into revenue with AI-powered lead scoring, real-time alerts, and comprehensive analytics. Never miss a hot lead again."
      category="sponsors"
      
      
      features={[]}
    />
  );
}
