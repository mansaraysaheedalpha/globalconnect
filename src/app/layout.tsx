// src/app/layout.tsx
import type { Metadata } from 'next';
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
  title: 'GlobalConnect',
  description: 'The Intelligent Event Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <LiveRegionProvider>
          <SkipLink href="#main-content" />
          <ApolloProvider>{children}</ApolloProvider>
          <Toaster />
        </LiveRegionProvider>
      </body>
    </html>
  );
}