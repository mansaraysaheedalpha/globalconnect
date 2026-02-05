// src/components/navigation/solutions-menu-data.ts

export interface MenuItem {
  name: string;
  description: string;
  href: string;
  isAI?: boolean;
  isHighlight?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface MenuGroup {
  title: string;
  badge?: string;
  items: MenuItem[];
}

export interface MenuColumn {
  title: string;
  subtitle: string;
  groups: MenuGroup[];
  cta: {
    text: string;
    href: string;
  };
}

export const solutionsMenuData: MenuColumn[] = [
  // Column 1: For Organizers
  {
    title: "For Organizers",
    subtitle: "Plan, execute, and optimize your events",
    groups: [
      {
        title: "Event Planning",
        items: [
          {
            name: "Event Planning Suite",
            description: "Create events, build agendas, and manage speakers in one place",
            href: "/solutions/event-creation",
          },
          {
            name: "Registration & Ticketing",
            description: "Multi-tier ticketing with dynamic pricing and payments",
            href: "/solutions/registration-ticketing",
            isPopular: true,
          },
        ],
      },
      {
        title: "Live Event Control",
        items: [
          {
            name: "Live Control Center",
            description: "Producer dashboard, green room, and moderation tools",
            href: "/solutions/producer-dashboard",
            isHighlight: true,
          },
        ],
      },
      {
        title: "Engagement",
        items: [
          {
            name: "Engagement Engine",
            description: "AI-powered engagement monitoring with smart interventions",
            href: "/solutions/engagement-conductor",
            isAI: true,
            isHighlight: true,
            isNew: true,
          },
          {
            name: "Gamification",
            description: "Points, badges, leaderboards, and team competitions",
            href: "/solutions/gamification",
            isPopular: true,
          },
        ],
      },
      {
        title: "Analytics",
        items: [
          {
            name: "Analytics & Insights",
            description: "Real-time metrics, A/B testing, and custom reports",
            href: "/solutions/analytics",
          },
        ],
      },
    ],
    cta: {
      text: "Start Planning",
      href: "/solutions/for-organizers",
    },
  },

  // Column 2: For Sponsors
  {
    title: "For Sponsors",
    subtitle: "Maximize ROI and capture qualified leads",
    groups: [
      {
        title: "Lead Generation",
        items: [
          {
            name: "Lead Intelligence",
            description: "AI-powered scoring, real-time alerts, pipeline tracking, and export",
            href: "/solutions/lead-scoring",
            isAI: true,
            isHighlight: true,
          },
        ],
      },
      {
        title: "Virtual Presence",
        items: [
          {
            name: "Sponsor Booth",
            description: "Branded booth pages, live interactions, and resource distribution",
            href: "/solutions/virtual-booth",
          },
        ],
      },
      {
        title: "Sponsor Tools",
        items: [
          {
            name: "Sponsor Hub",
            description: "Direct messaging, analytics dashboard, and team management",
            href: "/solutions/for-sponsors",
          },
        ],
      },
    ],
    cta: {
      text: "Generate More Leads",
      href: "/solutions/for-sponsors",
    },
  },

  // Column 3: For Attendees
  {
    title: "For Attendees",
    subtitle: "Connect, engage, and get the most from events",
    groups: [
      {
        title: "Networking",
        items: [
          {
            name: "Smart Networking",
            description: "AI matchmaking, proximity discovery, huddles, and messaging",
            href: "/solutions/matchmaking",
            isAI: true,
            isHighlight: true,
          },
        ],
      },
      {
        title: "Engagement",
        items: [
          {
            name: "Live Engagement",
            description: "Real-time chat, Q&A, polls, and emoji reactions",
            href: "/solutions/chat-reactions",
          },
          {
            name: "Gamification",
            description: "Earn points, unlock achievements, and climb leaderboards",
            href: "/solutions/gamification",
          },
        ],
      },
      {
        title: "Personalization",
        items: [
          {
            name: "Personal Experience",
            description: "AI session recommendations, tickets, and smart notifications",
            href: "/solutions/session-recommendations",
            isAI: true,
          },
        ],
      },
    ],
    cta: {
      text: "Experience It Live",
      href: "/solutions/for-attendees",
    },
  },

  // Column 4: Platform & Enterprise
  {
    title: "Platform & Enterprise",
    subtitle: "Built for scale, security, and any event type",
    groups: [
      {
        title: "Event Formats",
        items: [
          {
            name: "Virtual Events",
            description: "Full-featured streaming, recording, and live captions",
            href: "/solutions/virtual-events",
          },
          {
            name: "In-Person Events",
            description: "Check-in, proximity networking, and venue maps",
            href: "/solutions/in-person-events",
          },
          {
            name: "Hybrid Events",
            description: "Unified experience for physical and virtual attendees",
            href: "/solutions/hybrid-events",
            isPopular: true,
          },
        ],
      },
      {
        title: "AI Platform",
        badge: "What Makes Us Different",
        items: [
          {
            name: "AI Capabilities",
            description: "Engagement AI, smart matching, profile enrichment, and translation",
            href: "/solutions/ai-conductor",
            isAI: true,
            isHighlight: true,
          },
        ],
      },
      {
        title: "Enterprise",
        items: [
          {
            name: "Enterprise Suite",
            description: "White-label, RBAC, security, and multi-currency payments",
            href: "/solutions/enterprise",
          },
        ],
      },
    ],
    cta: {
      text: "Book a Demo",
      href: "/solutions/enterprise",
    },
  },
];

// Featured banner data
export const megaMenuBanner = {
  icon: "✨",
  title: "New: AI Engagement Engine",
  description: "Autonomous engagement monitoring that prevents audience drop-off with smart interventions",
  buttonText: "See How It Works",
  buttonHref: "/solutions/engagement-conductor",
};