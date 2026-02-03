// src/app/(public)/solutions/polls-quizzes/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Live Polls & Quizzes - Event Dynamics Solutions',
    description: 'Engage your audience with interactive polls and quizzes. Run contests, gather feedback, and gamify learning with our powerful polling system.',
    path: '/solutions/polls-quizzes',
    keywords: [
      'live polls & quizzes',
      'event management',
      'organizers',
      
    ],
  });
}

export default function PollsQuizzesPage() {
  return (
    <SolutionPlaceholder
      title="Live Polls & Quizzes"
      subtitle="Interactive polling with giveaway system"
      description="Engage your audience with interactive polls and quizzes. Run contests, gather feedback, and gamify learning with our powerful polling system."
      category="organizers"
      
      
      features={[
        "Multiple choice polls",
        "Quiz mode with correct answers",
        "Real-time results display",
        "Giveaway winner selection",
        "Poll scheduling",
        "Response analytics"
]}
    />
  );
}
