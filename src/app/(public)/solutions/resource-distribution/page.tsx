// src/app/(public)/solutions/resource-distribution/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Resource Distribution - Event Dynamics Solutions',
    description: 'Share your marketing materials with interested attendees. Track downloads and measure engagement with your content.',
    path: '/solutions/resource-distribution',
    keywords: [
      'resource distribution',
      'event management',
      'sponsors',
      
    ],
  });
}

export default function ResourceDistributionPage() {
  return (
    <SolutionPlaceholder
      title="Resource Distribution"
      subtitle="Deliver brochures and materials instantly"
      description="Share your marketing materials with interested attendees. Track downloads and measure engagement with your content."
      category="sponsors"
      
      
      features={[
        "PDF and document hosting",
        "Download tracking",
        "Resource categorization",
        "Access gating options",
        "Email follow-up automation",
        "Engagement analytics"
]}
    />
  );
}
