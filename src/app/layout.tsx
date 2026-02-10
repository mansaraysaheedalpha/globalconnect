// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloProvider } from '@/lib/apollo-provider';
import { Toaster } from "@/components/ui/sonner";
import { LiveRegionProvider, SkipLink } from "@/components/ui/accessibility";
import { OfflineProvider } from "@/components/providers/offline-provider";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Event Dynamics',
  description: 'Intelligent Event Orchestration Platform',
  manifest: '/site.webmanifest?v=2',
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/favicon-96x96.png?v=2', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Event Dynamics',
    startupImage: '/apple-touch-icon.png?v=2',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  // WCAG 2.1 AA Compliance: Allow users to zoom up to 500%
  // This is required for users with visual impairments
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground no-text-adjust`}>
        <LiveRegionProvider>
          <SkipLink href="#main-content" />
          <ApolloProvider>
            <OfflineProvider>{children}</OfflineProvider>
          </ApolloProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={10000}
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
              className: 'text-sm',
            }}
          />
        </LiveRegionProvider>
      </body>
    </html>
  );
}