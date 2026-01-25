// src/app/onboarding/template.tsx
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

export default function OnboardingTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
