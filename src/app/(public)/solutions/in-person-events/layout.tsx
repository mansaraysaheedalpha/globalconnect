// src/app/(public)/solutions/in-person-events/layout.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'In-Person Events - From Chaos to Seamless Operations | Event Dynamics',
    description: 'Transform your in-person events with instant QR check-in (under 3 seconds), real-time venue management, capacity monitoring, proximity networking, badge printing, and on-site staff coordination. One platform for conferences, trade shows, and corporate events.',
    path: '/solutions/in-person-events',
    keywords: [
      'in-person events',
      'event check-in',
      'QR code check-in',
      'venue management',
      'event registration',
      'conference management',
      'trade show platform',
      'badge printing',
      'capacity management',
      'proximity networking',
      'on-site events',
      'event staff coordination',
      'real-time attendance',
      'corporate events',
      'event operations',
      'attendee management',
      'venue capacity monitoring',
      'event logistics',
    ],
  });
}

export default function InPersonEventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
