// src/app/(public)/solutions/lead-export/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Advanced Lead Export - Event Dynamics Solutions',
    description: 'Get your leads into your CRM instantly. Export with custom fields, filters, and formats that match your workflow.',
    path: '/solutions/lead-export',
    keywords: [
      'advanced lead export',
      'event management',
      'sponsors',
      
    ],
  });
}

export default function LeadExportPage() {
  return (
    <SolutionPlaceholder
      title="Advanced Lead Export"
      subtitle="Export with custom fields in any format"
      description="Get your leads into your CRM instantly. Export with custom fields, filters, and formats that match your workflow."
      category="sponsors"
      
      
      features={[
        "CSV and Excel export",
        "Custom field selection",
        "Advanced filtering",
        "Bulk export",
        "Scheduled exports",
        "CRM integration ready"
]}
    />
  );
}
