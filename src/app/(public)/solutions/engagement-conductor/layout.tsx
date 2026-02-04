// src/app/(public)/solutions/engagement-conductor/layout.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'AI Engagement Conductor - Never Lose Your Audience Again | Event Dynamics',
    description: 'Revolutionary AI that monitors audience engagement in real-time and automatically intervenes when attention drops. Detect anomalies in 5 seconds, deploy 4 intervention types, and choose from 3 operating modes. Prevent audience drop-off before it happens.',
    path: '/solutions/engagement-conductor',
    keywords: [
      'ai engagement conductor',
      'event engagement',
      'audience engagement',
      'real-time monitoring',
      'event management ai',
      'audience retention',
      'virtual event engagement',
      'engagement analytics',
      'automated interventions',
      'thompson sampling',
      'event organizers',
      'AI-powered events',
    ],
  });
}

export default function EngagementConductorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}