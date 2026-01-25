import { MetadataRoute } from 'next';
import { getPublishedEventsForSEO } from '@/lib/seo/server-data';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://globalconnect.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published events
  const events = await getPublishedEventsForSEO();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Dynamic event routes
  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${SITE_URL}/events/${event.id}`,
    lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic checkout routes
  const checkoutRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${SITE_URL}/events/${event.id}/checkout`,
    lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...eventRoutes, ...checkoutRoutes];
}
