// src/app/(public)/solutions/translation/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Real-Time Translation - Event Dynamics Solutions',
    description: 'Enable global participation with real-time message translation. Support 100+ languages for chat, Q&A, and content.',
    path: '/solutions/translation',
    keywords: [
      'real-time translation',
      'event management',
      'enterprise',
      'AI-powered',
    ],
  });
}

export default function TranslationPage() {
  return (
    <SolutionPlaceholder
      title="Real-Time Translation"
      subtitle="Break language barriers with 100+ languages"
      description="Enable global participation with real-time message translation. Support 100+ languages for chat, Q&A, and content."
      category="enterprise"
      isAI={true}
      
      features={[
        "100+ language support",
        "Real-time message translation",
        "Auto-detect language",
        "Translation quality scoring",
        "Cultural context awareness",
        "Translation caching"
]}
    />
  );
}
