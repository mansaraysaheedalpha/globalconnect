// src/app/(public)/solutions/huddles/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Huddles - Event Dynamics Solutions',
    description: 'Participate in organized small-group discussions around topics you care about. RSVP, get confirmed, and connect with like-minded attendees.',
    path: '/solutions/huddles',
    keywords: [
      'huddles',
      'event management',
      'attendees',
      
    ],
  });
}

export default function HuddlesPage() {
  return (
    <SolutionPlaceholder
      title="Huddles"
      subtitle="Join topic-based facilitated discussions"
      description="Participate in organized small-group discussions around topics you care about. RSVP, get confirmed, and connect with like-minded attendees."
      category="attendees"
      
      
      features={[
        "Topic-based group creation",
        "RSVP and confirmation workflow",
        "Scheduled meeting times",
        "Physical location support",
        "Facilitator coordination",
        "Post-huddle follow-up"
]}
    />
  );
}
