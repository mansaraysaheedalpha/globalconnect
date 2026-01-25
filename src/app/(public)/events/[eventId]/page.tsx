// src/app/(public)/events/[eventId]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventDetailsView } from './_components/EventDetailsView';
import {
  generateSEOMetadata,
  truncateDescription,
  getCanonicalUrl,
} from '@/lib/seo/metadata';
import {
  generateEventSchema,
  generateBreadcrumbSchema,
  combineSchemas,
  renderJsonLd,
  type EventForSchema,
} from '@/lib/seo/json-ld';
import { getEventForSEO } from '@/lib/seo/server-data';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventdynamics.io';

interface PageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEventForSEO(eventId);

  if (!event) {
    return generateSEOMetadata({
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
      path: `/events/${eventId}`,
      noIndex: true,
    });
  }

  const description = event.description
    ? truncateDescription(event.description, 160)
    : `Join ${event.name} on Event Dynamics. Register now for this event.`;

  return generateSEOMetadata({
    title: event.name,
    description,
    path: `/events/${eventId}`,
    image: event.bannerUrl || undefined,
    keywords: [
      'event',
      event.name,
      'conference',
      'event registration',
      'networking',
    ],
    type: 'website',
    publishedTime: event.startTime,
    modifiedTime: event.updatedAt,
  });
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { eventId } = await params;
  const event = await getEventForSEO(eventId);

  if (!event) {
    notFound();
  }

  // JSON-LD structured data
  const eventSchema = generateEventSchema(event as EventForSchema);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Events', url: `${SITE_URL}/events` },
    { name: event.name, url: `${SITE_URL}/events/${event.id}` },
  ]);

  const combinedSchema = combineSchemas(eventSchema, breadcrumbSchema);

  return (
    <>
      {renderJsonLd(combinedSchema)}
      <EventDetailsView eventId={eventId} />
    </>
  );
}
