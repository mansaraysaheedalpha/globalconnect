// src/app/(public)/solutions/virtual-events/layout.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Virtual Events - Broadcast-Quality Streaming, Zero Complexity | Event Dynamics',
    description: 'Host stunning virtual events with multi-provider streaming support (YouTube, Vimeo, Mux, AWS IVS, Cloudflare), auto-captions, HD recording, live chat, Q&A, polls, and breakout rooms. Enterprise-grade reliability with unlimited concurrent viewers.',
    path: '/solutions/virtual-events',
    keywords: [
      'virtual events',
      'virtual event platform',
      'online event hosting',
      'live streaming events',
      'webinar platform',
      'virtual conference',
      'online events',
      'streaming providers',
      'auto captions',
      'HD recording',
      'live chat',
      'Q&A sessions',
      'polls',
      'breakout rooms',
      'virtual networking',
      'enterprise streaming',
      'multi-provider streaming',
      'virtual event management',
    ],
  });
}

export default function VirtualEventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
