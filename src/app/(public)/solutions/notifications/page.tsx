// src/app/(public)/solutions/notifications/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Smart Notifications - Event Dynamics Solutions',
    description: 'Stay informed with intelligent notifications. Get alerts for session starts, networking opportunities, and important updates.',
    path: '/solutions/notifications',
    keywords: [
      'smart notifications',
      'event management',
      'attendees',
      
    ],
  });
}

export default function NotificationsPage() {
  return (
    <SolutionPlaceholder
      title="Smart Notifications"
      subtitle="Never miss important moments"
      description="Stay informed with intelligent notifications. Get alerts for session starts, networking opportunities, and important updates."
      category="attendees"
      
      
      features={[
        "Real-time push notifications",
        "Session reminders",
        "Networking opportunity alerts",
        "Message notifications",
        "Custom notification preferences",
        "Multi-channel delivery"
]}
    />
  );
}
