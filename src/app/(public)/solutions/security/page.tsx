// src/app/(public)/solutions/security/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Advanced Security - Event Dynamics Solutions',
    description: 'Enterprise-grade security features protect your data and events. SOC 2 compliant with comprehensive audit trails.',
    path: '/solutions/security',
    keywords: [
      'advanced security',
      'event management',
      'enterprise',
      
    ],
  });
}

export default function SecurityPage() {
  return (
    <SolutionPlaceholder
      title="Advanced Security"
      subtitle="2FA, audit logs, and encryption at rest"
      description="Enterprise-grade security features protect your data and events. SOC 2 compliant with comprehensive audit trails."
      category="enterprise"
      
      
      features={[
        "2FA/MFA with TOTP",
        "Encryption at rest and in transit",
        "Comprehensive audit logs",
        "Rate limiting",
        "CORS protection",
        "Secure headers"
]}
    />
  );
}
