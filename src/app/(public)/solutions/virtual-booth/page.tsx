// src/app/(public)/solutions/virtual-booth/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Custom Booth Pages - Event Dynamics Solutions',
    description: 'Create an immersive brand experience with fully customizable virtual booths. Showcase products, share resources, and capture leads.',
    path: '/solutions/virtual-booth',
    keywords: [
      'custom booth pages',
      'event management',
      'sponsors',
      
    ],
  });
}

export default function VirtualBoothPage() {
  return (
    <SolutionPlaceholder
      title="Custom Booth Pages"
      subtitle="Branded virtual booth with marketing assets"
      description="Create an immersive brand experience with fully customizable virtual booths. Showcase products, share resources, and capture leads."
      category="sponsors"
      
      
      features={[
        "Fully branded booth pages",
        "Custom booth URL",
        "Logo and banner customization",
        "Video and image galleries",
        "Resource library",
        "Live chat integration"
]}
    />
  );
}
