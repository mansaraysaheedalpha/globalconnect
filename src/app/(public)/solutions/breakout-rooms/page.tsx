// src/app/(public)/solutions/breakout-rooms/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Breakout Rooms - Event Dynamics Solutions',
    description: 'Enable focused conversations with breakout rooms. Create topic-based discussions, assign facilitators, and manage room transitions seamlessly.',
    path: '/solutions/breakout-rooms',
    keywords: [
      'breakout rooms',
      'event management',
      'organizers',
      
    ],
  });
}

export default function BreakoutRoomsPage() {
  return (
    <SolutionPlaceholder
      title="Breakout Rooms"
      subtitle="Facilitated small-group discussions with video"
      description="Enable focused conversations with breakout rooms. Create topic-based discussions, assign facilitators, and manage room transitions seamlessly."
      category="organizers"
      
      
      features={[
        "Video-enabled breakout rooms",
        "Auto or manual participant assignment",
        "Facilitator management",
        "Room timers and countdown",
        "Participant tracking",
        "Integration with Daily.co and Twilio"
]}
    />
  );
}
