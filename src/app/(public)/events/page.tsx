// src/app/(public)/events/page.tsx
import { Metadata } from 'next';
import { EventsListView } from './_components/EventsListView';
import {
  generateSEOMetadata,
  getCanonicalUrl,
} from '@/lib/seo/metadata';
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  combineSchemas,
  renderJsonLd,
} from '@/lib/seo/json-ld';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventdynamics.io';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Browse Events',
    description:
      'Discover and register for exciting in-person, virtual, and hybrid events. From conferences to workshops, networking sessions to expos - find your next immersive experience.',
    path: '/events',
    keywords: [
      'in-person events',
      'virtual events',
      'hybrid events',
      'online conferences',
      'workshops',
      'networking events',
      'browse events',
      'event registration',
    ],
    type: 'website',
  });
}

export default function EventsPage() {
  // JSON-LD structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Events', url: `${SITE_URL}/events` },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: 'Browse Events - Event Dynamics',
    description:
      'Discover and register for exciting in-person, virtual, and hybrid events on Event Dynamics.',
    url: getCanonicalUrl('/events'),
  });

  const combinedSchema = combineSchemas(breadcrumbSchema, webPageSchema);

  return (
    <>
      {renderJsonLd(combinedSchema)}
      <EventsListView />
    </>
  );
}
