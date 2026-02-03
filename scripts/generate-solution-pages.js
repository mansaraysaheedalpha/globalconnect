// scripts/generate-solution-pages.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const solutionsData = [
  // For Organizers
  {
    slug: 'event-creation',
    title: 'Event Creation & Templates',
    subtitle: 'Launch events faster with reusable blueprints',
    description: 'Create professional events in minutes with our intuitive event builder. Save time with reusable templates and blueprints that capture your best practices.',
    category: 'organizers',
    features: [
      'Drag-and-drop event builder',
      'Reusable event templates and blueprints',
      'Multi-language event pages',
      'Custom branding and themes',
      'Event cloning and duplication',
      'Draft and preview modes',
    ],
  },
  {
    slug: 'session-builder',
    title: 'Session & Agenda Builder',
    subtitle: 'Multi-track scheduling with smart capacity control',
    description: 'Build complex multi-track agendas with ease. Manage session capacity, speaker assignments, and time slots all in one intuitive interface.',
    category: 'organizers',
    features: [
      'Visual timeline builder',
      'Multi-track scheduling',
      'Automatic conflict detection',
      'Capacity management per session',
      'Speaker assignment and management',
      'Break and networking time blocks',
    ],
  },
  {
    slug: 'speaker-management',
    title: 'Speaker Management',
    subtitle: 'Coordinate presenters and presentations effortlessly',
    description: 'Streamline speaker coordination with automated invitations, presentation uploads, and speaker profiles. Keep your speakers informed and prepared.',
    category: 'organizers',
    features: [
      'Speaker invitation workflow',
      'Profile and bio management',
      'Presentation upload and preview',
      'Speaker notifications and reminders',
      'Green room access',
      'Speaker analytics',
    ],
  },
  {
    slug: 'registration-ticketing',
    title: 'Registration & Ticketing',
    subtitle: 'Multi-tier ticketing with dynamic pricing',
    description: 'Flexible ticketing system with multiple tiers, dynamic pricing, promo codes, and waitlist management. Accept payments globally with ease.',
    category: 'organizers',
    features: [
      'Multi-tier ticket types (VIP, General, Early Bird)',
      'Dynamic pricing and promo codes',
      'Automated waitlist management',
      'Guest and authenticated registration',
      'QR code ticket generation',
      'Multi-currency payment processing',
    ],
    isPopular: true,
  },
  {
    slug: 'producer-dashboard',
    title: 'Producer Dashboard',
    subtitle: 'Hollywood-style real-time event command center',
    description: 'Take control of your live event with our comprehensive producer dashboard. Monitor engagement, moderate content, and manage sessions in real-time.',
    category: 'organizers',
    features: [
      'Real-time event metrics',
      'Live audience monitoring',
      'Content moderation controls',
      'Session switching and management',
      'Incident response tools',
      'Engagement intervention controls',
    ],
    isHighlight: true,
  },
  {
    slug: 'green-room',
    title: 'Green Room',
    subtitle: 'Pre-session speaker staging area',
    description: 'Give speakers a dedicated space to prepare before going live. Test equipment, review presentations, and coordinate with producers.',
    category: 'organizers',
    features: [
      'Pre-session staging area',
      'Audio/video equipment check',
      'Presentation preview',
      'Countdown to session start',
      'Producer communication channel',
      'Speaker instructions and notes',
    ],
  },
  {
    slug: 'moderation',
    title: 'Chat & Q&A Moderation',
    subtitle: 'Approve and manage audience interactions',
    description: 'Maintain a professional environment with powerful moderation tools. Review and approve messages, manage Q&A, and handle disruptive behavior.',
    category: 'organizers',
    features: [
      'Message approval queue',
      'Keyword filtering',
      'User muting and blocking',
      'Q&A question moderation',
      'Moderator assignments',
      'Audit logs and reporting',
    ],
  },
  {
    slug: 'engagement-conductor',
    title: 'AI Engagement Conductor',
    subtitle: 'Autonomous engagement monitoring and recovery',
    description: 'Revolutionary AI system that monitors audience engagement in real-time and automatically intervenes when attention drops. Prevent audience drop-off before it happens.',
    category: 'organizers',
    isAI: true,
    isHighlight: true,
    isNew: true,
    features: [
      'Real-time engagement scoring (0-100%)',
      'Anomaly detection (sudden drops, mass exits)',
      'Automated poll generation',
      'Intelligent chat prompts',
      'Three operating modes (Manual, Semi-Auto, Auto)',
      'Thompson Sampling reinforcement learning',
    ],
  },
  {
    slug: 'polls-quizzes',
    title: 'Live Polls & Quizzes',
    subtitle: 'Interactive polling with giveaway system',
    description: 'Engage your audience with interactive polls and quizzes. Run contests, gather feedback, and gamify learning with our powerful polling system.',
    category: 'organizers',
    features: [
      'Multiple choice polls',
      'Quiz mode with correct answers',
      'Real-time results display',
      'Giveaway winner selection',
      'Poll scheduling',
      'Response analytics',
    ],
  },
  {
    slug: 'gamification',
    title: 'Gamification Engine',
    subtitle: 'Points, badges, and leaderboards that drive engagement',
    description: 'Boost participation with comprehensive gamification. Award points for actions, unlock achievements, and display leaderboards to motivate attendees.',
    category: 'organizers',
    features: [
      'Action-based point system',
      'Custom achievements and badges',
      'Individual leaderboards',
      'Team leaderboards',
      'Real-time updates (5-second refresh)',
      'Customizable scoring rules',
    ],
  },
  {
    slug: 'breakout-rooms',
    title: 'Breakout Rooms',
    subtitle: 'Facilitated small-group discussions with video',
    description: 'Enable focused conversations with breakout rooms. Create topic-based discussions, assign facilitators, and manage room transitions seamlessly.',
    category: 'organizers',
    features: [
      'Video-enabled breakout rooms',
      'Auto or manual participant assignment',
      'Facilitator management',
      'Room timers and countdown',
      'Participant tracking',
      'Integration with Daily.co and Twilio',
    ],
  },
  {
    slug: 'analytics',
    title: 'Real-Time Analytics',
    subtitle: 'Live attendance and engagement metrics',
    description: 'Make data-driven decisions with comprehensive analytics. Track attendance, engagement, networking, and revenue in real-time.',
    category: 'organizers',
    features: [
      'Live attendance dashboard (5-second refresh)',
      'Engagement metrics (chat, polls, Q&A)',
      'Session popularity tracking',
      'Networking activity',
      'Revenue and conversion funnels',
      'Materialized views for performance',
    ],
  },
  {
    slug: 'ab-testing',
    title: 'A/B Testing',
    subtitle: 'Optimize conversions with variant testing',
    description: 'Run experiments to optimize your event conversion rates. Test different pricing, content, and layouts with statistical validation.',
    category: 'organizers',
    features: [
      'Variant configuration',
      'Goal metric tracking',
      'Audience segmentation',
      'Sample size calculation',
      'Statistical significance testing',
      'Results analysis dashboard',
    ],
  },
  {
    slug: 'reports',
    title: 'Custom Reports',
    subtitle: 'Export data your way - CSV, Excel, PDF',
    description: 'Get the data you need in the format you want. Create custom reports, schedule automated delivery, and export to multiple formats.',
    category: 'organizers',
    features: [
      'CSV, Excel, and PDF export',
      'Custom field selection',
      'Scheduled report delivery',
      'Pre-built report templates',
      'Materialized view queries',
      'API access for automation',
    ],
  },

  // For Sponsors
  {
    slug: 'lead-scoring',
    title: 'Intent-Based Lead Scoring',
    subtitle: 'AI-powered Hot/Warm/Cold classification',
    description: 'Never miss a hot lead again. Our AI analyzes attendee interactions to score leads automatically, helping you prioritize your follow-ups.',
    category: 'sponsors',
    isAI: true,
    isHighlight: true,
    features: [
      'Intent scoring 0-100',
      'Hot (70+), Warm (40-69), Cold (0-39) classification',
      'Interaction tracking (booth visits, downloads, demos)',
      'Real-time score updates',
      'Score history and trends',
      'Custom scoring rules',
    ],
  },
  {
    slug: 'lead-alerts',
    title: 'Real-Time Lead Alerts',
    subtitle: 'Instant notifications with sound alerts for hot leads',
    description: 'Get notified the moment a hot lead engages. WebSocket-powered alerts ensure you never miss an opportunity to connect.',
    category: 'sponsors',
    isHighlight: true,
    isPopular: true,
    features: [
      'WebSocket-powered instant alerts',
      'Sound notifications for hot leads',
      'Desktop and mobile notifications',
      'Custom alert rules',
      'Lead activity feed',
      'Alert history',
    ],
  },
  {
    slug: 'lead-pipeline',
    title: 'Lead Management Pipeline',
    subtitle: 'Track from New → Contacted → Qualified → Converted',
    description: 'Organize and track your leads through every stage. Collaborate with your team and ensure no lead falls through the cracks.',
    category: 'sponsors',
    features: [
      'Kanban-style pipeline view',
      'Status tracking (New, Contacted, Qualified, Converted)',
      'Lead tagging and categorization',
      'Notes and follow-up reminders',
      'Team collaboration',
      'Conversion tracking',
    ],
  },
  {
    slug: 'lead-export',
    title: 'Advanced Lead Export',
    subtitle: 'Export with custom fields in any format',
    description: 'Get your leads into your CRM instantly. Export with custom fields, filters, and formats that match your workflow.',
    category: 'sponsors',
    features: [
      'CSV and Excel export',
      'Custom field selection',
      'Advanced filtering',
      'Bulk export',
      'Scheduled exports',
      'CRM integration ready',
    ],
  },
  {
    slug: 'virtual-booth',
    title: 'Custom Booth Pages',
    subtitle: 'Branded virtual booth with marketing assets',
    description: 'Create an immersive brand experience with fully customizable virtual booths. Showcase products, share resources, and capture leads.',
    category: 'sponsors',
    features: [
      'Fully branded booth pages',
      'Custom booth URL',
      'Logo and banner customization',
      'Video and image galleries',
      'Resource library',
      'Live chat integration',
    ],
  },
  {
    slug: 'booth-interaction',
    title: 'Live Booth Interaction',
    subtitle: 'Real-time attendee engagement and demos',
    description: 'Engage attendees in real-time with live demos, Q&A, and one-on-one conversations. Track every interaction automatically.',
    category: 'sponsors',
    features: [
      'Live video demos',
      'Real-time chat',
      'Screen sharing capability',
      'Interaction tracking',
      'Demo scheduling',
      'Attendee browsing notifications',
    ],
  },
  {
    slug: 'resource-distribution',
    title: 'Resource Distribution',
    subtitle: 'Deliver brochures and materials instantly',
    description: 'Share your marketing materials with interested attendees. Track downloads and measure engagement with your content.',
    category: 'sponsors',
    features: [
      'PDF and document hosting',
      'Download tracking',
      'Resource categorization',
      'Access gating options',
      'Email follow-up automation',
      'Engagement analytics',
    ],
  },
  {
    slug: 'sponsor-messaging',
    title: 'Direct Attendee Messaging',
    subtitle: 'Tier-based permissions for outreach',
    description: 'Connect directly with interested attendees. Tier-based messaging ensures premium sponsors get enhanced access.',
    category: 'sponsors',
    features: [
      'Direct messaging capability',
      'Tier-based permissions',
      'Message templates',
      'Read receipts',
      'Message analytics',
      'Opt-in/opt-out management',
    ],
  },
  {
    slug: 'sponsor-analytics',
    title: 'Sponsor Analytics',
    subtitle: 'ROI tracking and performance metrics',
    description: 'Measure your sponsorship ROI with comprehensive analytics. Track booth traffic, lead quality, and conversion rates.',
    category: 'sponsors',
    features: [
      'Booth traffic analytics',
      'Lead source tracking',
      'Engagement metrics',
      'Conversion funnel analysis',
      'ROI calculation',
      'Comparative benchmarks',
    ],
  },
  {
    slug: 'sponsor-team',
    title: 'Team Management',
    subtitle: 'Multi-role representative access control',
    description: 'Manage your booth staff effectively with granular permissions. Assign roles, track activity, and coordinate your team.',
    category: 'sponsors',
    features: [
      'Role-based access control',
      'Team member invitations',
      'Activity tracking',
      'Permission management',
      'Team analytics',
      'Representative assignment',
    ],
  },

  // For Attendees
  {
    slug: 'matchmaking',
    title: 'AI-Powered Matchmaking',
    subtitle: 'Smart recommendations based on shared interests',
    description: 'Meet the right people at every event. Our AI analyzes profiles, interests, and behavior to recommend the most valuable connections.',
    category: 'attendees',
    isAI: true,
    isHighlight: true,
    features: [
      'LLM-driven match recommendations',
      'Context scoring (shared sessions, interests)',
      'Match score 0-100',
      'Explanation for each match',
      'Conversation starter suggestions',
      'Top 10 daily recommendations',
    ],
  },
  {
    slug: 'proximity-networking',
    title: 'Proximity Networking',
    subtitle: 'Location-based discovery with instant pinging',
    description: 'Discover nearby attendees in real-time. Perfect for in-person and hybrid events. Get notified when relevant people are close by.',
    category: 'attendees',
    isHighlight: true,
    features: [
      'Real-time location updates',
      'Redis-based proximity search',
      'Nearby attendee notifications',
      'Direct ping capability',
      '5-minute deduplication',
      'Privacy controls',
    ],
  },
  {
    slug: 'huddles',
    title: 'Huddles',
    subtitle: 'Join topic-based facilitated discussions',
    description: 'Participate in organized small-group discussions around topics you care about. RSVP, get confirmed, and connect with like-minded attendees.',
    category: 'attendees',
    features: [
      'Topic-based group creation',
      'RSVP and confirmation workflow',
      'Scheduled meeting times',
      'Physical location support',
      'Facilitator coordination',
      'Post-huddle follow-up',
    ],
  },
  {
    slug: 'direct-messaging',
    title: 'Direct Messaging',
    subtitle: 'Private 1:1 chats with read receipts',
    description: 'Have meaningful conversations with other attendees. Real-time messaging with delivery and read receipts keeps you connected.',
    category: 'attendees',
    features: [
      '1:1 private conversations',
      'Delivery and read receipts',
      'Message editing',
      'Multi-device sync',
      'Search message history',
      'File sharing',
    ],
  },
  {
    slug: 'chat-reactions',
    title: 'Live Chat & Reactions',
    subtitle: 'Real-time conversations with emoji reactions',
    description: 'Engage with speakers and fellow attendees during sessions. Express yourself with emoji reactions and threaded conversations.',
    category: 'attendees',
    features: [
      'Real-time session chat',
      'Message threading',
      'Emoji reactions',
      'Message editing (5-min window)',
      'Rate limiting for fairness',
      'Chat history',
    ],
  },
  {
    slug: 'qa-system',
    title: 'Q&A System',
    subtitle: 'Submit, upvote, and get answers to your questions',
    description: 'Make your voice heard during sessions. Submit questions, upvote the ones you care about, and get answers from speakers.',
    category: 'attendees',
    features: [
      'Question submission',
      'Community upvoting',
      'Anonymous option',
      'Moderation queue',
      'Official answers from speakers',
      'Question tagging',
    ],
  },
  {
    slug: 'interactive-polls',
    title: 'Interactive Polls',
    subtitle: 'Vote and see results in real-time',
    description: 'Participate in live polls during sessions. See how your opinions compare with other attendees in real-time.',
    category: 'attendees',
    features: [
      'Multiple choice voting',
      'Real-time results',
      'Single vote per user',
      'Quiz mode with scoring',
      'Giveaway participation',
      'Poll history',
    ],
  },
  {
    slug: 'attendee-gamification',
    title: 'Gamification',
    subtitle: 'Earn points and compete on leaderboards',
    description: 'Make events more fun and rewarding. Earn points for participation, unlock achievements, and compete on leaderboards.',
    category: 'attendees',
    features: [
      'Action-based points (chat, polls, Q&A)',
      'Achievement badges',
      'Individual leaderboard ranking',
      'Team competitions',
      'Point history tracking',
      'Reward redemption',
    ],
  },
  {
    slug: 'session-recommendations',
    title: 'Session Recommendations',
    subtitle: 'AI-suggested sessions based on your interests',
    description: 'Never miss relevant content. Our AI analyzes your profile and behavior to recommend sessions you\'ll find most valuable.',
    category: 'attendees',
    isAI: true,
    features: [
      'Personalized session suggestions',
      'Interest-based matching',
      'Collaborative filtering',
      'Schedule optimization',
      'Conflict detection',
      'Recommendation explanations',
    ],
  },
  {
    slug: 'tickets-offers',
    title: 'My Tickets & Offers',
    subtitle: 'Manage registrations and exclusive deals',
    description: 'Access all your tickets and exclusive offers in one place. Upgrade, transfer, or manage your registrations easily.',
    category: 'attendees',
    features: [
      'Digital ticket wallet',
      'QR code access',
      'Ticket transfer',
      'Exclusive offer browsing',
      'Purchase history',
      'Upgrade options',
    ],
  },
  {
    slug: 'notifications',
    title: 'Smart Notifications',
    subtitle: 'Never miss important moments',
    description: 'Stay informed with intelligent notifications. Get alerts for session starts, networking opportunities, and important updates.',
    category: 'attendees',
    features: [
      'Real-time push notifications',
      'Session reminders',
      'Networking opportunity alerts',
      'Message notifications',
      'Custom notification preferences',
      'Multi-channel delivery',
    ],
  },

  // Enterprise & Technology
  {
    slug: 'virtual-events',
    title: 'Virtual Events',
    subtitle: 'Full-featured streaming, recording, and live captions',
    description: 'Host professional virtual events with enterprise-grade streaming, recording, and accessibility features.',
    category: 'enterprise',
    features: [
      'HD streaming with multiple providers',
      'Automatic recording',
      'Live captions and subtitles',
      'Max viewer capacity management',
      'Lobby and waiting room',
      'Geo-restrictions',
    ],
  },
  {
    slug: 'in-person-events',
    title: 'In-Person Events',
    subtitle: 'Check-in, proximity networking, and venue maps',
    description: 'Enhance in-person events with digital tools. Manage check-ins, enable proximity networking, and provide interactive venue maps.',
    category: 'enterprise',
    features: [
      'QR code check-in',
      'Badge printing integration',
      'Proximity-based networking',
      'Interactive venue maps',
      'Capacity tracking',
      'Real-time attendance',
    ],
  },
  {
    slug: 'hybrid-events',
    title: 'Hybrid Events',
    subtitle: 'Unified experience for physical and virtual attendees',
    description: 'Deliver seamless hybrid events where in-person and virtual attendees have equally engaging experiences.',
    category: 'enterprise',
    isPopular: true,
    features: [
      'Unified registration system',
      'Dual experience design',
      'Cross-platform networking',
      'Hybrid session management',
      'Unified analytics',
      'Content synchronization',
    ],
  },
  {
    slug: 'ai-conductor',
    title: 'Engagement Conductor',
    subtitle: 'Autonomous anomaly detection and intervention',
    description: 'Revolutionary AI that monitors engagement and intervenes automatically to prevent audience drop-off.',
    category: 'enterprise',
    isAI: true,
    features: [
      'Real-time engagement monitoring',
      'ML-based anomaly detection',
      'Automated interventions',
      'Thompson Sampling learning',
      'Three operating modes',
      'Decision transparency',
    ],
  },
  {
    slug: 'intelligent-interventions',
    title: 'Intelligent Interventions',
    subtitle: 'Auto-generated polls and engagement prompts',
    description: 'AI-generated content that re-engages your audience at the perfect moment with contextually relevant interactions.',
    category: 'enterprise',
    isAI: true,
    features: [
      'Context-aware poll generation',
      'Intelligent chat prompts',
      'Targeted nudges',
      'Q&A promotion',
      'Confidence scoring',
      'Success rate tracking',
    ],
  },
  {
    slug: 'profile-enrichment',
    title: 'Profile Enrichment',
    subtitle: 'Auto-research from LinkedIn and GitHub',
    description: 'Automatically enrich attendee profiles with professional information from LinkedIn, GitHub, and other sources.',
    category: 'enterprise',
    isAI: true,
    features: [
      'LinkedIn profile import',
      'GitHub contribution analysis',
      'Twitter profile enrichment',
      'Professional background extraction',
      'Interest identification',
      'Privacy-compliant processing',
    ],
  },
  {
    slug: 'translation',
    title: 'Real-Time Translation',
    subtitle: 'Break language barriers with 100+ languages',
    description: 'Enable global participation with real-time message translation. Support 100+ languages for chat, Q&A, and content.',
    category: 'enterprise',
    isAI: true,
    features: [
      '100+ language support',
      'Real-time message translation',
      'Auto-detect language',
      'Translation quality scoring',
      'Cultural context awareness',
      'Translation caching',
    ],
  },
  {
    slug: 'white-label',
    title: 'White-Label Branding',
    subtitle: 'Custom branding for your organization',
    description: 'Make the platform your own with comprehensive white-labeling. Custom domains, branding, and themes.',
    category: 'enterprise',
    features: [
      'Custom domain support',
      'Full brand customization',
      'Custom themes and colors',
      'Logo and asset replacement',
      'Custom email templates',
      'Branded mobile experience',
    ],
  },
  {
    slug: 'rbac',
    title: 'Role-Based Access Control',
    subtitle: 'Granular permissions for team management',
    description: 'Secure your event with enterprise-grade permissions. Define roles, assign permissions, and manage access at scale.',
    category: 'enterprise',
    features: [
      'Granular permission system',
      'Custom role definition',
      'Multi-level hierarchy',
      'Permission inheritance',
      'Audit logging',
      'Team management',
    ],
  },
  {
    slug: 'security',
    title: 'Advanced Security',
    subtitle: '2FA, audit logs, and encryption at rest',
    description: 'Enterprise-grade security features protect your data and events. SOC 2 compliant with comprehensive audit trails.',
    category: 'enterprise',
    features: [
      '2FA/MFA with TOTP',
      'Encryption at rest and in transit',
      'Comprehensive audit logs',
      'Rate limiting',
      'CORS protection',
      'Secure headers',
    ],
  },
  {
    slug: 'payments',
    title: 'Multi-Currency Payments',
    subtitle: 'Accept payments globally with Stripe and Paystack',
    description: 'Process payments worldwide with multiple providers. Support for multiple currencies, refunds, and financial tracking.',
    category: 'enterprise',
    features: [
      'Stripe integration',
      'Paystack for Africa',
      'Multi-currency support',
      'Automated refund processing',
      'Webhook handling',
      'Financial analytics',
    ],
  },
];

// Category overview pages
const categoryPages = [
  {
    slug: 'for-organizers',
    title: 'Solutions for Event Organizers',
    subtitle: 'Everything you need to plan, execute, and optimize professional events',
    description: 'From initial planning to post-event analytics, our comprehensive suite of tools helps you create unforgettable events that engage audiences and deliver measurable results.',
    category: 'organizers',
  },
  {
    slug: 'for-sponsors',
    title: 'Solutions for Sponsors & Exhibitors',
    subtitle: 'Maximize ROI with intelligent lead capture and engagement tools',
    description: 'Transform sponsorships into revenue with AI-powered lead scoring, real-time alerts, and comprehensive analytics. Never miss a hot lead again.',
    category: 'sponsors',
  },
  {
    slug: 'for-attendees',
    title: 'Solutions for Attendees',
    subtitle: 'Connect with the right people and get the most from every event',
    description: 'AI-powered matchmaking, proximity networking, and personalized recommendations ensure you make valuable connections and discover relevant content.',
    category: 'attendees',
  },
  {
    slug: 'enterprise',
    title: 'Enterprise Solutions & Technology',
    subtitle: 'Built for scale, security, and any event type',
    description: 'Enterprise-grade platform supporting virtual, in-person, and hybrid events with advanced AI, security, and customization capabilities.',
    category: 'enterprise',
  },
];

// Generate page content
function generatePageContent(data) {
  const { slug, title, subtitle, description, category, features = [], isAI = false, isNew = false } = data;

  return `// src/app/(public)/solutions/${slug}/page.tsx
import { Metadata } from 'next';
import { SolutionPlaceholder } from '@/components/solutions/solution-placeholder';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: '${title} - Event Dynamics Solutions',
    description: '${description}',
    path: '/solutions/${slug}',
    keywords: [
      '${title.toLowerCase()}',
      'event management',
      '${category}',
      ${isAI ? "'AI-powered'," : ''}
    ],
  });
}

export default function ${slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}Page() {
  return (
    <SolutionPlaceholder
      title="${title}"
      subtitle="${subtitle}"
      description="${description}"
      category="${category}"
      ${isAI ? 'isAI={true}' : ''}
      ${isNew ? 'isNew={true}' : ''}
      features={${JSON.stringify(features, null, 8)}}
    />
  );
}
`;
}

// Create directories and files
const solutionsDir = path.join(__dirname, '..', 'src', 'app', '(public)', 'solutions');

// Ensure base solutions directory exists
if (!fs.existsSync(solutionsDir)) {
  fs.mkdirSync(solutionsDir, { recursive: true });
}

// Generate solution pages
[...solutionsData, ...categoryPages].forEach((data) => {
  const pageDir = path.join(solutionsDir, data.slug);
  const pagePath = path.join(pageDir, 'page.tsx');

  // Create directory
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  // Write page file
  const content = generatePageContent(data);
  fs.writeFileSync(pagePath, content, 'utf8');

  console.log(`✓ Created ${data.slug}/page.tsx`);
});

console.log(`\n✅ Generated ${solutionsData.length + categoryPages.length} solution pages!`);
