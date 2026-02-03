// src/app/(public)/solutions/payments/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Multi-Currency Payments - Event Dynamics Solutions',
    description: 'Process payments worldwide with multiple providers. Support for multiple currencies, refunds, and financial tracking.',
    path: '/solutions/payments',
    keywords: [
      'multi-currency payments',
      'event management',
      'enterprise',
      
    ],
  });
}

export default function PaymentsPage() {
  return (
    <SolutionPlaceholder
      title="Multi-Currency Payments"
      subtitle="Accept payments globally with Stripe and Paystack"
      description="Process payments worldwide with multiple providers. Support for multiple currencies, refunds, and financial tracking."
      category="enterprise"
      
      
      features={[
        "Stripe integration",
        "Paystack for Africa",
        "Multi-currency support",
        "Automated refund processing",
        "Webhook handling",
        "Financial analytics"
]}
    />
  );
}
