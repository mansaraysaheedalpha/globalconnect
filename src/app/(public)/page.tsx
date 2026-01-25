// src/app/(public)/page.tsx
import { Metadata } from 'next';
import { HeroSection } from "./_components/hero-section";
import { FeaturesSection } from "./_components/features-section";
import { HowItWorksSection } from "./_components/how-it-works-section";
import { ForOrganizersSection } from "./_components/for-organizers-section";
import { ForAttendeesSection } from "./_components/for-attendees-section";
import { VisualShowcaseSection } from "./_components/showcase-section";
import { BenefitsSection } from "./_components/benefits-section";
import { CtaSection } from "./_components/cta-section";
import { generateSEOMetadata, getCanonicalUrl } from '@/lib/seo/metadata';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateWebPageSchema,
  combineSchemas,
  renderJsonLd,
} from '@/lib/seo/json-ld';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://globalconnect.com';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'GlobalConnect - Virtual Event Platform',
    description:
      'The ultimate virtual event platform for immersive conferences, expos, and networking. Connect globally with video chat, virtual booths, and interactive sessions.',
    path: '/',
    keywords: [
      'virtual events',
      'online conferences',
      'virtual event platform',
      'expo hall',
      'networking platform',
      'video conferencing',
      'event management',
      'virtual booth',
      'online networking',
    ],
    type: 'website',
  });
}

export default function Home() {
  // JSON-LD structured data
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const webPageSchema = generateWebPageSchema({
    title: 'GlobalConnect - Virtual Event Platform',
    description:
      'The ultimate virtual event platform for immersive conferences, expos, and networking.',
    url: getCanonicalUrl('/'),
  });

  const combinedSchema = combineSchemas(
    organizationSchema,
    websiteSchema,
    webPageSchema
  );

  return (
    <>
      {renderJsonLd(combinedSchema)}
      <div>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ForOrganizersSection />
        <ForAttendeesSection />
        <VisualShowcaseSection />
        <BenefitsSection />
        <CtaSection />
      </div>
    </>
  );
}
