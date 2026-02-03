// src/app/(public)/solutions/lead-alerts/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Real-Time Lead Alerts - Event Dynamics Solutions',
    description: 'Get notified the moment a hot lead engages. WebSocket-powered alerts ensure you never miss an opportunity to connect.',
    path: '/solutions/lead-alerts',
    keywords: [
      'real-time lead alerts',
      'event management',
      'sponsors',
      
    ],
  });
}

export default function LeadAlertsPage() {
  return (
    <SolutionPlaceholder
      title="Real-Time Lead Alerts"
      subtitle="Instant notifications with sound alerts for hot leads"
      description="Get notified the moment a hot lead engages. WebSocket-powered alerts ensure you never miss an opportunity to connect."
      category="sponsors"
      
      
      features={[
        "WebSocket-powered instant alerts",
        "Sound notifications for hot leads",
        "Desktop and mobile notifications",
        "Custom alert rules",
        "Lead activity feed",
        "Alert history"
]}
    />
  );
}
