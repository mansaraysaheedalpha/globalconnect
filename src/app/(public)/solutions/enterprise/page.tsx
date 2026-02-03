// src/app/(public)/solutions/enterprise/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Enterprise Solutions & Technology - Event Dynamics Solutions',
    description: 'Enterprise-grade platform supporting virtual, in-person, and hybrid events with advanced AI, security, and customization capabilities.',
    path: '/solutions/enterprise',
    keywords: [
      'enterprise solutions & technology',
      'event management',
      'enterprise',
      
    ],
  });
}

export default function EnterprisePage() {
  return (
    <SolutionPlaceholder
      title="Enterprise Solutions & Technology"
      subtitle="Built for scale, security, and any event type"
      description="Enterprise-grade platform supporting virtual, in-person, and hybrid events with advanced AI, security, and customization capabilities."
      category="enterprise"
      
      
      features={[]}
    />
  );
}
