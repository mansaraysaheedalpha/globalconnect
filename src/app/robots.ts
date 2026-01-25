import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://globalconnect.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/events',
          '/events/*',
        ],
        disallow: [
          '/dashboard/*',
          '/admin/*',
          '/organizer/*',
          '/attendee/*',
          '/sponsor/*',
          '/creator/*',
          '/api/*',
          '/_next/*',
          '/static/*',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
