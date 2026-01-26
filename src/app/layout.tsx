// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloProvider } from '@/lib/apollo-provider';
import { Toaster } from "@/components/ui/sonner";
import { LiveRegionProvider, SkipLink } from "@/components/ui/accessibility";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Event Dynamics',
  description: 'The Intelligent Event Platform',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Event Dynamics',
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
          <ApolloProvider>{children}</ApolloProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
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