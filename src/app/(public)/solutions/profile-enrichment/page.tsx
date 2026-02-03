// src/app/(public)/solutions/profile-enrichment/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Profile Enrichment - Event Dynamics Solutions',
    description: 'Automatically enrich attendee profiles with professional information from LinkedIn, GitHub, and other sources.',
    path: '/solutions/profile-enrichment',
    keywords: [
      'profile enrichment',
      'event management',
      'enterprise',
      'AI-powered',
    ],
  });
}

export default function ProfileEnrichmentPage() {
  return (
    <SolutionPlaceholder
      title="Profile Enrichment"
      subtitle="Auto-research from LinkedIn and GitHub"
      description="Automatically enrich attendee profiles with professional information from LinkedIn, GitHub, and other sources."
      category="enterprise"
      isAI={true}
      
      features={[
        "LinkedIn profile import",
        "GitHub contribution analysis",
        "Twitter profile enrichment",
        "Professional background extraction",
        "Interest identification",
        "Privacy-compliant processing"
]}
    />
  );
}
