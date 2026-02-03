// src/app/(public)/solutions/speaker-management/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Speaker Management - Event Dynamics Solutions',
    description: 'Streamline speaker coordination with automated invitations, presentation uploads, and speaker profiles. Keep your speakers informed and prepared.',
    path: '/solutions/speaker-management',
    keywords: [
      'speaker management',
      'event management',
      'organizers',
      
    ],
  });
}

export default function SpeakerManagementPage() {
  return (
    <SolutionPlaceholder
      title="Speaker Management"
      subtitle="Coordinate presenters and presentations effortlessly"
      description="Streamline speaker coordination with automated invitations, presentation uploads, and speaker profiles. Keep your speakers informed and prepared."
      category="organizers"
      
      
      features={[
        "Speaker invitation workflow",
        "Profile and bio management",
        "Presentation upload and preview",
        "Speaker notifications and reminders",
        "Green room access",
        "Speaker analytics"
]}
    />
  );
}
