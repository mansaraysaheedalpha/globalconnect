// src/app/(public)/solutions/moderation/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Chat & Q&A Moderation - Event Dynamics Solutions',
    description: 'Maintain a professional environment with powerful moderation tools. Review and approve messages, manage Q&A, and handle disruptive behavior.',
    path: '/solutions/moderation',
    keywords: [
      'chat & q&a moderation',
      'event management',
      'organizers',
      
    ],
  });
}

export default function ModerationPage() {
  return (
    <SolutionPlaceholder
      title="Chat & Q&A Moderation"
      subtitle="Approve and manage audience interactions"
      description="Maintain a professional environment with powerful moderation tools. Review and approve messages, manage Q&A, and handle disruptive behavior."
      category="organizers"
      
      
      features={[
        "Message approval queue",
        "Keyword filtering",
        "User muting and blocking",
        "Q&A question moderation",
        "Moderator assignments",
        "Audit logs and reporting"
]}
    />
  );
}
