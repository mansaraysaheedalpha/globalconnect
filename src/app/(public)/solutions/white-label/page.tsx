// src/app/(public)/solutions/white-label/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'White-Label Branding - Event Dynamics Solutions',
    description: 'Make the platform your own with comprehensive white-labeling. Custom domains, branding, and themes.',
    path: '/solutions/white-label',
    keywords: [
      'white-label branding',
      'event management',
      'enterprise',
      
    ],
  });
}

export default function WhiteLabelPage() {
  return (
    <SolutionPlaceholder
      title="White-Label Branding"
      subtitle="Custom branding for your organization"
      description="Make the platform your own with comprehensive white-labeling. Custom domains, branding, and themes."
      category="enterprise"
      
      
      features={[
        "Custom domain support",
        "Full brand customization",
        "Custom themes and colors",
        "Logo and asset replacement",
        "Custom email templates",
        "Branded mobile experience"
]}
    />
  );
}
