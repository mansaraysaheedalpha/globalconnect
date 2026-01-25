// src/app/(public)/events/[eventId]/checkout/page.tsx
import { Metadata } from 'next';
import { CheckoutView } from './_components/CheckoutView';
import { generateSEOMetadata } from '@/lib/seo/metadata';
import { getEventMetadata } from '@/lib/seo/server-data';
import {
  generateBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/seo/json-ld';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://globalconnect.com';

interface PageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEventMetadata(eventId);

  const title = event ? `Checkout - ${event.name}` : 'Checkout';
  const description = event
    ? `Complete your registration for ${event.name}. Secure checkout powered by Stripe.`
    : 'Complete your event registration';

  return generateSEOMetadata({
    title,
    description,
    path: `/events/${eventId}/checkout`,
    noIndex: true, // Transactional page - don't index
  });
}

export default async function CheckoutPage({ params }: PageProps) {
  const { eventId } = await params;
  const event = await getEventMetadata(eventId);

  // JSON-LD breadcrumb for navigation
  const breadcrumbSchema = event
    ? generateBreadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Events', url: `${SITE_URL}/events` },
        { name: event.name, url: `${SITE_URL}/events/${event.id}` },
        { name: 'Checkout', url: `${SITE_URL}/events/${event.id}/checkout` },
      ])
    : null;

  return (
    <>
      {breadcrumbSchema && renderJsonLd(breadcrumbSchema)}
      <CheckoutView eventId={eventId} />
    </>
  );
}
