// src/app/(platform)/template.tsx
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

export default function PlatformTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
