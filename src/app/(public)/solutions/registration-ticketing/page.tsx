// src/app/(public)/solutions/registration-ticketing/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Registration & Ticketing - Event Dynamics Solutions',
    description: 'Flexible ticketing system with multiple tiers, dynamic pricing, promo codes, and waitlist management. Accept payments globally with ease.',
    path: '/solutions/registration-ticketing',
    keywords: [
      'registration & ticketing',
      'event management',
      'organizers',
      
    ],
  });
}

export default function RegistrationTicketingPage() {
  return (
    <SolutionPlaceholder
      title="Registration & Ticketing"
      subtitle="Multi-tier ticketing with dynamic pricing"
      description="Flexible ticketing system with multiple tiers, dynamic pricing, promo codes, and waitlist management. Accept payments globally with ease."
      category="organizers"
      
      
      features={[
        "Multi-tier ticket types (VIP, General, Early Bird)",
        "Dynamic pricing and promo codes",
        "Automated waitlist management",
        "Guest and authenticated registration",
        "QR code ticket generation",
        "Multi-currency payment processing"
]}
    />
  );
}
