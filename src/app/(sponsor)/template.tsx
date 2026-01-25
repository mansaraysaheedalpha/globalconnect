// src/app/(sponsor)/template.tsx
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

export default function SponsorTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
