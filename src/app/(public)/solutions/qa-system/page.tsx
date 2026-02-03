// src/app/(public)/solutions/qa-system/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Q&A System - Event Dynamics Solutions',
    description: 'Make your voice heard during sessions. Submit questions, upvote the ones you care about, and get answers from speakers.',
    path: '/solutions/qa-system',
    keywords: [
      'q&a system',
      'event management',
      'attendees',
      
    ],
  });
}

export default function QaSystemPage() {
  return (
    <SolutionPlaceholder
      title="Q&A System"
      subtitle="Submit, upvote, and get answers to your questions"
      description="Make your voice heard during sessions. Submit questions, upvote the ones you care about, and get answers from speakers."
      category="attendees"
      
      
      features={[
        "Question submission",
        "Community upvoting",
        "Anonymous option",
        "Moderation queue",
        "Official answers from speakers",
        "Question tagging"
]}
    />
  );
}
