// src/app/(public)/solutions/page.tsx
import { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Users, Building2 } from "lucide-react";
import { solutionsMenuData } from "@/components/navigation/solutions-menu-data";
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Solutions - Event Dynamics',
    description:
      'Comprehensive event management solutions for organizers, sponsors, and attendees. AI-powered engagement, intelligent networking, and enterprise-grade security.',
    path: '/solutions',
    keywords: [
      'event management solutions',
      'event technology',
      'AI-powered events',
      'hybrid events',
      'virtual events',
      'event engagement',
      'sponsor lead generation',
      'event networking',
    ],
  });
}

const categoryIcons = {
  organizers: "🎯",
  sponsors: "🎪",
  attendees: "👥",
  enterprise: "🏢",
};

const categoryColors = {
  organizers: "blue",
  sponsors: "purple",
  attendees: "emerald",
  enterprise: "slate",
};

export default function SolutionsOverviewPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background py-20 md:py-32">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Complete Event Management Platform
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Solutions Built for Every Role
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              From AI-powered engagement to intelligent networking, discover how Event Dynamics
              transforms events for organizers, sponsors, and attendees.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions by Category */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Solutions by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose your role to discover tailored solutions that solve your specific challenges
            </p>
          </div>

          {/* Category Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {solutionsMenuData.map((column) => {
              const category = column.title.toLowerCase().includes('organizer') ? 'organizers'
                : column.title.toLowerCase().includes('sponsor') ? 'sponsors'
                : column.title.toLowerCase().includes('attendee') ? 'attendees'
                : 'enterprise';

              const totalSolutions = column.groups.reduce((acc, group) => acc + group.items.length, 0);

              return (
                <Link
                  key={column.title}
                  href={column.cta.href}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl transition-all group-hover:bg-primary/10" />

                  <div className="relative">
                    <div className="text-4xl mb-4">{categoryIcons[category]}</div>
                    <h3 className="text-xl font-semibold mb-2">{column.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{column.subtitle}</p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{totalSolutions} Solutions</span>
                      <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* All Solutions by Column */}
          <div className="space-y-20">
            {solutionsMenuData.map((column) => {
              const category = column.title.toLowerCase().includes('organizer') ? 'organizers'
                : column.title.toLowerCase().includes('sponsor') ? 'sponsors'
                : column.title.toLowerCase().includes('attendee') ? 'attendees'
                : 'enterprise';

              return (
                <div key={column.title} id={column.title.toLowerCase().replace(/\s+/g, '-')}>
                  {/* Column Header */}
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{categoryIcons[category]}</span>
                      <div>
                        <h2 className="text-3xl font-bold">{column.title}</h2>
                        <p className="text-muted-foreground">{column.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Groups */}
                  {column.groups.map((group) => (
                    <div key={group.title} className="mb-10">
                      <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-xl font-semibold">{group.title}</h3>
                        {group.badge && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            {group.badge}
                          </span>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                                {item.name}
                              </h4>
                              <div className="flex gap-1">
                                {item.isAI && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/20 text-primary">
                                    AI
                                  </span>
                                )}
                                {item.isNew && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                    NEW
                                  </span>
                                )}
                                {item.isPopular && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-orange-500/20 text-orange-600 dark:text-orange-400">
                                    POPULAR
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Column CTA */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <Button asChild variant="outline">
                      <Link href={column.cta.href}>
                        {column.cta.text}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Events?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of event organizers, sponsors, and attendees who trust Event Dynamics
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
