// src/app/(platform)/dashboard/template.tsx
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

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
