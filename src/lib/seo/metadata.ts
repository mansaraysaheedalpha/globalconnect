import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventdynamics.io';
const SITE_NAME = 'Event Dynamics';
const SITE_DESCRIPTION = 'Intelligent Event Orchestration Platform - Create, manage, and orchestrate world-class in-person, virtual, and hybrid events with AI-powered engagement, real-time interactions, and comprehensive analytics.';

export interface SEOConfig {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: 'website' | 'article';
}

/**
 * Generate canonical URL for a given path
 */
export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Generate comprehensive metadata for a page
 */
export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    path = '',
    image = '/og-default.png',
    noIndex = false,
    keywords = [],
    author,
    publishedTime,
    modifiedTime,
    type = 'website',
  } = config;

  const canonicalUrl = getCanonicalUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: author ? [{ name: author }] : undefined,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type,
      url: canonicalUrl,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@eventdynamics',
      site: '@eventdynamics',
    },
  };

  return metadata;
}

/**
 * Default metadata for the site
 */
export const defaultMetadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'event management platform',
    'in-person events',
    'virtual events',
    'hybrid events',
    'online conferences',
    'expo hall',
    'networking platform',
    'event registration',
    'video conferencing',
    'sponsor booths',
  ].join(', '),
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico?v=2',
    apple: '/apple-touch-icon.png?v=2',
  },
  manifest: '/site.webmanifest?v=2',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-default.png?v=2`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-default.png?v=2`],
    creator: '@eventdynamics',
    site: '@eventdynamics',
  },
};

/**
 * Merge custom metadata with defaults
 */
export function mergeMetadata(custom: Metadata): Metadata {
  return {
    ...defaultMetadata,
    ...custom,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...custom.openGraph,
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...custom.twitter,
    },
  };
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Generate keywords from text content
 */
export function extractKeywords(text: string, baseKeywords: string[] = []): string[] {
  // Remove common words and extract meaningful terms
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  const uniqueWords = Array.from(new Set(words)).slice(0, 10);
  return [...baseKeywords, ...uniqueWords];
}
