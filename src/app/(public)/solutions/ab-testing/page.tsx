// src/app/(public)/solutions/ab-testing/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'A/B Testing - Event Dynamics Solutions',
    description: 'Run experiments to optimize your event conversion rates. Test different pricing, content, and layouts with statistical validation.',
    path: '/solutions/ab-testing',
    keywords: [
      'a/b testing',
      'event management',
      'organizers',
      
    ],
  });
}

export default function AbTestingPage() {
  return (
    <SolutionPlaceholder
      title="A/B Testing"
      subtitle="Optimize conversions with variant testing"
      description="Run experiments to optimize your event conversion rates. Test different pricing, content, and layouts with statistical validation."
      category="organizers"
      
      
      features={[
        "Variant configuration",
        "Goal metric tracking",
        "Audience segmentation",
        "Sample size calculation",
        "Statistical significance testing",
        "Results analysis dashboard"
]}
    />
  );
}
