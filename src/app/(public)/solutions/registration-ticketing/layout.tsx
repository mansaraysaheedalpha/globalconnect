// src/app/(public)/solutions/registration-ticketing/layout.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Registration & Ticketing - Seamless Event Registration & Multi-Tier Ticketing',
    description: 'Transform your event registration with multi-tier ticketing, dynamic pricing, promo codes, and waitlist management. Accept payments in 135+ currencies, deliver QR-coded tickets instantly, and check in attendees in under 3 seconds.',
    path: '/solutions/registration-ticketing',
    keywords: [
      'event registration',
      'ticketing system',
      'multi-tier tickets',
      'dynamic pricing',
      'promo codes',
      'waitlist management',
      'QR code tickets',
      'event check-in',
      'payment processing',
      'ticket sales',
      'early bird tickets',
      'VIP passes',
      'event management',
      'registration software',
      'online ticketing',
      'event checkout',
      'ticket analytics',
      'attendee management',
      'mobile tickets',
      'Apple Wallet tickets',
    ],
  });
}

export default function RegistrationTicketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
