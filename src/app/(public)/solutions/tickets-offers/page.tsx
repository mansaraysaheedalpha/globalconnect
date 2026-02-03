// src/app/(public)/solutions/tickets-offers/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'My Tickets & Offers - Event Dynamics Solutions',
    description: 'Access all your tickets and exclusive offers in one place. Upgrade, transfer, or manage your registrations easily.',
    path: '/solutions/tickets-offers',
    keywords: [
      'my tickets & offers',
      'event management',
      'attendees',
      
    ],
  });
}

export default function TicketsOffersPage() {
  return (
    <SolutionPlaceholder
      title="My Tickets & Offers"
      subtitle="Manage registrations and exclusive deals"
      description="Access all your tickets and exclusive offers in one place. Upgrade, transfer, or manage your registrations easily."
      category="attendees"
      
      
      features={[
        "Digital ticket wallet",
        "QR code access",
        "Ticket transfer",
        "Exclusive offer browsing",
        "Purchase history",
        "Upgrade options"
]}
    />
  );
}
