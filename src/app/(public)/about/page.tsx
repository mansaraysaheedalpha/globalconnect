// src/app/(public)/about/page.tsx
import { Metadata } from 'next';
import { AboutHeroSection } from "./_components/about-hero-section";
import { ProblemSolutionSection } from "./_components/problem-solution-section";
import { AIArchitectureSection } from "./_components/ai-architecture-section";
import { PlatformCapabilitiesSection } from "./_components/platform-capabilities-section";
import { TechnologyStackSection } from "./_components/technology-stack-section";
import { MetricsSection } from "./_components/metrics-section";
import { TeamCultureSection } from "./_components/team-culture-section";
import { AboutCtaSection } from "./_components/about-cta-section";
import { generateSEOMetadata, getCanonicalUrl } from '@/lib/seo/metadata';
import {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
  combineSchemas,
  renderJsonLd,
} from '@/lib/seo/json-ld';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventdynamics.io';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'About Us - The Future of Event Intelligence',
    description:
      'Event Dynamics is building the world\'s first AI-powered Event Intelligence Operating System. Learn about our mission to transform passive event tools into proactive, intelligent systems.',
    path: '/about',
    keywords: [
      'event intelligence platform',
      'AI event management',
      'real-time engagement',
      'autonomous event agents',
      'LangGraph event AI',
      'Thompson Sampling optimization',
      'enterprise event software',
      'event technology company',
      'WebSocket real-time events',
      'intelligent lead scoring',
    ],
    type: 'website',
  });
}

export default function AboutPage() {
  // JSON-LD structured data
  const organizationSchema = generateOrganizationSchema();
  const webPageSchema = generateWebPageSchema({
    title: 'About Event Dynamics - AI-Powered Event Intelligence',
    description:
      'Learn about Event Dynamics, the company building the world\'s first AI-powered Event Intelligence Operating System with real-time engagement and autonomous agents.',
    url: getCanonicalUrl('/about'),
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'About', url: `${SITE_URL}/about` },
  ]);

  const combinedSchema = combineSchemas(
    organizationSchema,
    webPageSchema,
    breadcrumbSchema
  );

  return (
    <>
      {renderJsonLd(combinedSchema)}
      <div>
        <AboutHeroSection />
        <ProblemSolutionSection />
        <AIArchitectureSection />
        <PlatformCapabilitiesSection />
        <MetricsSection />
        <TechnologyStackSection />
        <TeamCultureSection />
        <AboutCtaSection />
      </div>
    </>
  );
}
