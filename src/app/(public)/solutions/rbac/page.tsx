// src/app/(public)/solutions/rbac/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Role-Based Access Control - Event Dynamics Solutions',
    description: 'Secure your event with enterprise-grade permissions. Define roles, assign permissions, and manage access at scale.',
    path: '/solutions/rbac',
    keywords: [
      'role-based access control',
      'event management',
      'enterprise',
      
    ],
  });
}

export default function RbacPage() {
  return (
    <SolutionPlaceholder
      title="Role-Based Access Control"
      subtitle="Granular permissions for team management"
      description="Secure your event with enterprise-grade permissions. Define roles, assign permissions, and manage access at scale."
      category="enterprise"
      
      
      features={[
        "Granular permission system",
        "Custom role definition",
        "Multi-level hierarchy",
        "Permission inheritance",
        "Audit logging",
        "Team management"
]}
    />
  );
}
