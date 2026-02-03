// src/app/(public)/solutions/direct-messaging/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Direct Messaging - Event Dynamics Solutions',
    description: 'Have meaningful conversations with other attendees. Real-time messaging with delivery and read receipts keeps you connected.',
    path: '/solutions/direct-messaging',
    keywords: [
      'direct messaging',
      'event management',
      'attendees',
      
    ],
  });
}

export default function DirectMessagingPage() {
  return (
    <SolutionPlaceholder
      title="Direct Messaging"
      subtitle="Private 1:1 chats with read receipts"
      description="Have meaningful conversations with other attendees. Real-time messaging with delivery and read receipts keeps you connected."
      category="attendees"
      
      
      features={[
        "1:1 private conversations",
        "Delivery and read receipts",
        "Message editing",
        "Multi-device sync",
        "Search message history",
        "File sharing"
]}
    />
  );
}
