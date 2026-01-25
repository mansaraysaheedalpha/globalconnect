// src/app/accept-invitation/template.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AcceptInvitationTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
