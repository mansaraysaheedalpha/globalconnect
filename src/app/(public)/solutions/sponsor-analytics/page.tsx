// src/app/(public)/solutions/sponsor-analytics/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Sponsor Analytics - Event Dynamics Solutions',
    description: 'Measure your sponsorship ROI with comprehensive analytics. Track booth traffic, lead quality, and conversion rates.',
    path: '/solutions/sponsor-analytics',
    keywords: [
      'sponsor analytics',
      'event management',
      'sponsors',
      
    ],
  });
}

export default function SponsorAnalyticsPage() {
  return (
    <SolutionPlaceholder
      title="Sponsor Analytics"
      subtitle="ROI tracking and performance metrics"
      description="Measure your sponsorship ROI with comprehensive analytics. Track booth traffic, lead quality, and conversion rates."
      category="sponsors"
      
      
      features={[
        "Booth traffic analytics",
        "Lead source tracking",
        "Engagement metrics",
        "Conversion funnel analysis",
        "ROI calculation",
        "Comparative benchmarks"
]}
    />
  );
}
