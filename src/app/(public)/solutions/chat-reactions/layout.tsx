// src/app/(public)/solutions/chat-reactions/layout.tsx
import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title:
      "Live Engagement - Transform Passive Viewers Into Active Participants | Event Dynamics",
    description:
      "Create electric atmospheres with real-time chat, emoji reactions, interactive polls, and moderated Q&A. Keep your audience connected, engaged, and participating throughout your event.",
    path: "/solutions/chat-reactions",
    keywords: [
      "live engagement",
      "event chat",
      "emoji reactions",
      "interactive polls",
      "live Q&A",
      "audience engagement",
      "real-time interaction",
      "virtual event engagement",
      "hybrid event engagement",
      "attendee participation",
      "session chat",
      "message threading",
      "poll voting",
      "question moderation",
      "gamification",
    ],
  });
}

export default function LiveEngagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
