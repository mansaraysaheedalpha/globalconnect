// src/app/(public)/solutions/hybrid-events/layout.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Hybrid Events - One Event, Two Worlds, Unified | Event Dynamics',
    description: 'Seamlessly blend in-person and virtual experiences with our unified hybrid event platform. One registration system, cross-platform engagement, multi-provider streaming (YouTube, Vimeo, Mux, AWS IVS, Cloudflare), green room for speakers, and unified analytics across both audiences.',
    path: '/solutions/hybrid-events',
    keywords: [
      'hybrid events',
      'hybrid event platform',
      'in-person and virtual events',
      'unified event management',
      'hybrid conference',
      'dual experience events',
      'streaming providers',
      'green room',
      'producer dashboard',
      'cross-platform engagement',
      'unified analytics',
      'event streaming',
      'virtual attendance',
      'enterprise hybrid events',
      'multi-provider streaming',
    ],
  });
}

export default function HybridEventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}