// src/app/(public)/solutions/green-room/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Green Room - Event Dynamics Solutions',
    description: 'Give speakers a dedicated space to prepare before going live. Test equipment, review presentations, and coordinate with producers.',
    path: '/solutions/green-room',
    keywords: [
      'green room',
      'event management',
      'organizers',
      
    ],
  });
}

export default function GreenRoomPage() {
  return (
    <SolutionPlaceholder
      title="Green Room"
      subtitle="Pre-session speaker staging area"
      description="Give speakers a dedicated space to prepare before going live. Test equipment, review presentations, and coordinate with producers."
      category="organizers"
      
      
      features={[
        "Pre-session staging area",
        "Audio/video equipment check",
        "Presentation preview",
        "Countdown to session start",
        "Producer communication channel",
        "Speaker instructions and notes"
]}
    />
  );
}
