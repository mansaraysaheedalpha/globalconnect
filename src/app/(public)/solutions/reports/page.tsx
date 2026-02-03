// src/app/(public)/solutions/reports/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Custom Reports - Event Dynamics Solutions',
    description: 'Get the data you need in the format you want. Create custom reports, schedule automated delivery, and export to multiple formats.',
    path: '/solutions/reports',
    keywords: [
      'custom reports',
      'event management',
      'organizers',
      
    ],
  });
}

export default function ReportsPage() {
  return (
    <SolutionPlaceholder
      title="Custom Reports"
      subtitle="Export data your way - CSV, Excel, PDF"
      description="Get the data you need in the format you want. Create custom reports, schedule automated delivery, and export to multiple formats."
      category="organizers"
      
      
      features={[
        "CSV, Excel, and PDF export",
        "Custom field selection",
        "Scheduled report delivery",
        "Pre-built report templates",
        "Materialized view queries",
        "API access for automation"
]}
    />
  );
}
