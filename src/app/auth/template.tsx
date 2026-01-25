// src/app/auth/template.tsx
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

export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
