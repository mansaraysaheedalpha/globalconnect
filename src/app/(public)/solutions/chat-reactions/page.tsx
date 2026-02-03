// src/app/(public)/solutions/chat-reactions/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Live Chat & Reactions - Event Dynamics Solutions',
    description: 'Engage with speakers and fellow attendees during sessions. Express yourself with emoji reactions and threaded conversations.',
    path: '/solutions/chat-reactions',
    keywords: [
      'live chat & reactions',
      'event management',
      'attendees',
      
    ],
  });
}

export default function ChatReactionsPage() {
  return (
    <SolutionPlaceholder
      title="Live Chat & Reactions"
      subtitle="Real-time conversations with emoji reactions"
      description="Engage with speakers and fellow attendees during sessions. Express yourself with emoji reactions and threaded conversations."
      category="attendees"
      
      
      features={[
        "Real-time session chat",
        "Message threading",
        "Emoji reactions",
        "Message editing (5-min window)",
        "Rate limiting for fairness",
        "Chat history"
]}
    />
  );
}
