// src/app/(public)/solutions/analytics/layout.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Real-Time Analytics & Insights - Data-Driven Event Decisions | Event Dynamics',
    description: 'Turn event data into actionable insights with our real-time analytics dashboard. Track attendance, engagement, revenue, and networking metrics - updated every 5 seconds. Export reports in PDF, CSV, or Excel.',
    path: '/solutions/analytics',
    keywords: [
      'event analytics',
      'real-time analytics',
      'event metrics',
      'attendance tracking',
      'engagement analytics',
      'event reporting',
      'event dashboard',
      'data visualization',
      'event insights',
      'revenue tracking',
      'networking analytics',
      'event ROI',
      'scheduled reports',
      'export reports',
      'live event data',
      'event management analytics',
      'event performance',
      'attendee engagement metrics',
    ],
  });
}

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
