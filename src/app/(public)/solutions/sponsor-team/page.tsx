// src/app/(public)/solutions/sponsor-team/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Team Management - Event Dynamics Solutions',
    description: 'Manage your booth staff effectively with granular permissions. Assign roles, track activity, and coordinate your team.',
    path: '/solutions/sponsor-team',
    keywords: [
      'team management',
      'event management',
      'sponsors',
      
    ],
  });
}

export default function SponsorTeamPage() {
  return (
    <SolutionPlaceholder
      title="Team Management"
      subtitle="Multi-role representative access control"
      description="Manage your booth staff effectively with granular permissions. Assign roles, track activity, and coordinate your team."
      category="sponsors"
      
      
      features={[
        "Role-based access control",
        "Team member invitations",
        "Activity tracking",
        "Permission management",
        "Team analytics",
        "Representative assignment"
]}
    />
  );
}
