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
        title: "Event Management",
        items: [
          {
            name: "Event Creation & Templates",
            description: "Launch events faster with reusable blueprints",
            href: "/solutions/event-creation",
          },
          {
            name: "Session & Agenda Builder",
            description: "Multi-track scheduling with smart capacity control",
            href: "/solutions/session-builder",
          },
          {
            name: "Speaker Management",
            description: "Coordinate presenters and presentations effortlessly",
            href: "/solutions/speaker-management",
          },
          {
            name: "Registration & Ticketing",
            description: "Multi-tier ticketing with dynamic pricing",
            href: "/solutions/registration-ticketing",
            isPopular: true,
          },
        ],
      },
      {
        title: "Live Event Control",
        items: [
          {
            name: "Producer Dashboard",
            description: "Hollywood-style real-time event command center",
            href: "/solutions/producer-dashboard",
            isHighlight: true,
          },
          {
            name: "Green Room",
            description: "Pre-session speaker staging area",
            href: "/solutions/green-room",
          },
          {
            name: "Chat & Q&A Moderation",
            description: "Approve and manage audience interactions",
            href: "/solutions/moderation",
          },
        ],
      },
      {
        title: "Engagement Tools",
        items: [
          {
            name: "AI Engagement Conductor",
            description: "Autonomous engagement monitoring and recovery",
            href: "/solutions/engagement-conductor",
            isAI: true,
            isHighlight: true,
            isNew: true,
          },
          {
            name: "Live Polls & Quizzes",
            description: "Interactive polling with giveaway system",
            href: "/solutions/polls-quizzes",
          },
          {
            name: "Gamification Engine",
            description: "Points, badges, and leaderboards that drive engagement",
            href: "/solutions/gamification",
          },
          {
            name: "Breakout Rooms",
            description: "Facilitated small-group discussions with video",
            href: "/solutions/breakout-rooms",
          },
        ],
      },
      {
        title: "Analytics",
        items: [
          {
            name: "Real-Time Analytics",
            description: "Live attendance and engagement metrics",
            href: "/solutions/analytics",
          },
          {
            name: "A/B Testing",
            description: "Optimize conversions with variant testing",
            href: "/solutions/ab-testing",
          },
          {
            name: "Custom Reports",
            description: "Export data your way - CSV, Excel, PDF",
            href: "/solutions/reports",
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
            name: "Intent-Based Lead Scoring",
            description: "AI-powered Hot/Warm/Cold classification",
            href: "/solutions/lead-scoring",
            isAI: true,
            isHighlight: true,
          },
          {
            name: "Real-Time Lead Alerts",
            description: "Instant notifications with sound alerts for hot leads",
            href: "/solutions/lead-alerts",
            isHighlight: true,
            isPopular: true,
          },
          {
            name: "Lead Management Pipeline",
            description: "Track from New → Contacted → Qualified → Converted",
            href: "/solutions/lead-pipeline",
          },
          {
            name: "Advanced Lead Export",
            description: "Export with custom fields in any format",
            href: "/solutions/lead-export",
          },
        ],
      },
      {
        title: "Virtual Booth",
        items: [
          {
            name: "Custom Booth Pages",
            description: "Branded virtual booth with marketing assets",
            href: "/solutions/virtual-booth",
          },
          {
            name: "Live Booth Interaction",
            description: "Real-time attendee engagement and demos",
            href: "/solutions/booth-interaction",
          },
          {
            name: "Resource Distribution",
            description: "Deliver brochures and materials instantly",
            href: "/solutions/resource-distribution",
          },
        ],
      },
      {
        title: "Sponsor Tools",
        items: [
          {
            name: "Direct Attendee Messaging",
            description: "Tier-based permissions for outreach",
            href: "/solutions/sponsor-messaging",
          },
          {
            name: "Sponsor Analytics",
            description: "ROI tracking and performance metrics",
            href: "/solutions/sponsor-analytics",
          },
          {
            name: "Team Management",
            description: "Multi-role representative access control",
            href: "/solutions/sponsor-team",
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
            name: "AI-Powered Matchmaking",
            description: "Smart recommendations based on shared interests",
            href: "/solutions/matchmaking",
            isAI: true,
            isHighlight: true,
          },
          {
            name: "Proximity Networking",
            description: "Location-based discovery with instant pinging",
            href: "/solutions/proximity-networking",
            isHighlight: true,
          },
          {
            name: "Huddles",
            description: "Join topic-based facilitated discussions",
            href: "/solutions/huddles",
          },
          {
            name: "Direct Messaging",
            description: "Private 1:1 chats with read receipts",
            href: "/solutions/direct-messaging",
          },
        ],
      },
      {
        title: "Engagement",
        items: [
          {
            name: "Live Chat & Reactions",
            description: "Real-time conversations with emoji reactions",
            href: "/solutions/chat-reactions",
          },
          {
            name: "Q&A System",
            description: "Submit, upvote, and get answers to your questions",
            href: "/solutions/qa-system",
          },
          {
            name: "Interactive Polls",
            description: "Vote and see results in real-time",
            href: "/solutions/interactive-polls",
          },
          {
            name: "Gamification",
            description: "Earn points and compete on leaderboards",
            href: "/solutions/attendee-gamification",
          },
        ],
      },
      {
        title: "Personalization",
        items: [
          {
            name: "Session Recommendations",
            description: "AI-suggested sessions based on your interests",
            href: "/solutions/session-recommendations",
            isAI: true,
          },
          {
            name: "My Tickets & Offers",
            description: "Manage registrations and exclusive deals",
            href: "/solutions/tickets-offers",
          },
          {
            name: "Smart Notifications",
            description: "Never miss important moments",
            href: "/solutions/notifications",
          },
        ],
      },
    ],
    cta: {
      text: "Experience It Live",
      href: "/solutions/for-attendees",
    },
  },

  // Column 4: Enterprise & Technology
  {
    title: "Enterprise & Technology",
    subtitle: "Built for scale, security, and any event type",
    groups: [
      {
        title: "Event Types",
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
        title: "AI & Automation",
        badge: "What Makes Us Different",
        items: [
          {
            name: "Engagement Conductor",
            description: "Autonomous anomaly detection and intervention",
            href: "/solutions/ai-conductor",
            isAI: true,
          },
          {
            name: "Intelligent Interventions",
            description: "Auto-generated polls and engagement prompts",
            href: "/solutions/intelligent-interventions",
            isAI: true,
          },
          {
            name: "Profile Enrichment",
            description: "Auto-research from LinkedIn and GitHub",
            href: "/solutions/profile-enrichment",
            isAI: true,
          },
          {
            name: "Real-Time Translation",
            description: "Break language barriers with 100+ languages",
            href: "/solutions/translation",
            isAI: true,
          },
        ],
      },
      {
        title: "Enterprise",
        items: [
          {
            name: "White-Label Branding",
            description: "Custom branding for your organization",
            href: "/solutions/white-label",
          },
          {
            name: "Role-Based Access",
            description: "Granular permissions for team management",
            href: "/solutions/rbac",
          },
          {
            name: "Advanced Security",
            description: "2FA, audit logs, and encryption at rest",
            href: "/solutions/security",
          },
          {
            name: "Multi-Currency Payments",
            description: "Accept payments globally with Stripe and Paystack",
            href: "/solutions/payments",
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
  title: "New: AI Engagement Conductor",
  description: "Autonomous engagement monitoring that prevents audience drop-off",
  buttonText: "See How It Works",
  buttonHref: "/solutions/engagement-conductor",
};
