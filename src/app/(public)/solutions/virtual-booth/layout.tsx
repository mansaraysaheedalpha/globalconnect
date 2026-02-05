// src/app/(public)/solutions/virtual-booth/layout.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Virtual Booth - Immersive Branded Experiences That Convert',
    description: 'Create stunning virtual booths with video calls, live chat, resource libraries, and automatic lead capture. Four sponsorship tiers with full customization—your brand, front and center.',
    path: '/solutions/virtual-booth',
    keywords: [
      'virtual booth',
      'sponsor booth',
      'expo booth',
      'virtual expo',
      'booth customization',
      'lead capture',
      'video calls',
      'live chat',
      'sponsor engagement',
      'event sponsorship',
      'branded booth',
      'resource library',
      'booth analytics',
      'visitor tracking',
    ],
  });
}

export default function VirtualBoothLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
