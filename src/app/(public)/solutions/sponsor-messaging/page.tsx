// src/app/(public)/solutions/sponsor-messaging/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Direct Attendee Messaging - Event Dynamics Solutions',
    description: 'Connect directly with interested attendees. Tier-based messaging ensures premium sponsors get enhanced access.',
    path: '/solutions/sponsor-messaging',
    keywords: [
      'direct attendee messaging',
      'event management',
      'sponsors',
      
    ],
  });
}

export default function SponsorMessagingPage() {
  return (
    <SolutionPlaceholder
      title="Direct Attendee Messaging"
      subtitle="Tier-based permissions for outreach"
      description="Connect directly with interested attendees. Tier-based messaging ensures premium sponsors get enhanced access."
      category="sponsors"
      
      
      features={[
        "Direct messaging capability",
        "Tier-based permissions",
        "Message templates",
        "Read receipts",
        "Message analytics",
        "Opt-in/opt-out management"
]}
    />
  );
}
