// src/app/(public)/solutions/analytics/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Real-Time Analytics - Event Dynamics Solutions',
    description: 'Make data-driven decisions with comprehensive analytics. Track attendance, engagement, networking, and revenue in real-time.',
    path: '/solutions/analytics',
    keywords: [
      'real-time analytics',
      'event management',
      'organizers',
      
    ],
  });
}

export default function AnalyticsPage() {
  return (
    <SolutionPlaceholder
      title="Real-Time Analytics"
      subtitle="Live attendance and engagement metrics"
      description="Make data-driven decisions with comprehensive analytics. Track attendance, engagement, networking, and revenue in real-time."
      category="organizers"
      
      
      features={[
        "Live attendance dashboard (5-second refresh)",
        "Engagement metrics (chat, polls, Q&A)",
        "Session popularity tracking",
        "Networking activity",
        "Revenue and conversion funnels",
        "Materialized views for performance"
]}
    />
  );
}
