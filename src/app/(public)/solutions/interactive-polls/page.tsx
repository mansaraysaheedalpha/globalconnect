// src/app/(public)/solutions/interactive-polls/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Interactive Polls - Event Dynamics Solutions',
    description: 'Participate in live polls during sessions. See how your opinions compare with other attendees in real-time.',
    path: '/solutions/interactive-polls',
    keywords: [
      'interactive polls',
      'event management',
      'attendees',
      
    ],
  });
}

export default function InteractivePollsPage() {
  return (
    <SolutionPlaceholder
      title="Interactive Polls"
      subtitle="Vote and see results in real-time"
      description="Participate in live polls during sessions. See how your opinions compare with other attendees in real-time."
      category="attendees"
      
      
      features={[
        "Multiple choice voting",
        "Real-time results",
        "Single vote per user",
        "Quiz mode with scoring",
        "Giveaway participation",
        "Poll history"
]}
    />
  );
}
