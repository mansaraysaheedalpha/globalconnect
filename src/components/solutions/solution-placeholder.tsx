// src/components/solutions/solution-placeholder.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolutionPlaceholderProps {
  title: string;
  subtitle: string;
  description: string;
  category: "organizers" | "sponsors" | "attendees" | "enterprise";
  isAI?: boolean;
  isNew?: boolean;
  features?: string[];
}

const categoryConfig = {
  organizers: {
    gradient: "from-blue-600 to-indigo-600",
    icon: "🎯",
    color: "blue",
  },
  sponsors: {
    gradient: "from-purple-600 to-pink-600",
    icon: "🎪",
    color: "purple",
  },
  attendees: {
    gradient: "from-emerald-600 to-teal-600",
    icon: "👥",
    color: "emerald",
  },
  enterprise: {
    gradient: "from-slate-600 to-zinc-600",
    icon: "🏢",
    color: "slate",
  },
};

export function SolutionPlaceholder({
  title,
  subtitle,
  description,
  category,
  isAI = false,
  isNew = false,
  features = [],
}: SolutionPlaceholderProps) {
  const config = categoryConfig[category];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-10",
          config.gradient
        )} />

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badges */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
                `bg-${config.color}-500/10 text-${config.color}-600 dark:text-${config.color}-400`
              )}>
                <span className="text-lg">{config.icon}</span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
              {isAI && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  New Feature
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              {subtitle}
            </p>

            {/* Description */}
            <p className="text-lg text-muted-foreground/80 mb-10 max-w-2xl mx-auto">
              {description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (if provided) */}
      {features.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">
                Key Capabilities
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                  >
                    <CheckCircle2 className={cn(
                      "h-5 w-5 shrink-0 mt-0.5",
                      `text-${config.color}-600 dark:text-${config.color}-400`
                    )} />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon Notice */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-primary/5 border border-primary/20 rounded-xl p-8">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold mb-3">
              Detailed Content Coming Soon
            </h3>
            <p className="text-muted-foreground mb-6">
              We're currently building out comprehensive documentation, case studies, and interactive demos for this solution. Check back soon!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/solutions">
                  Browse All Solutions
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register">
                  Start Free Trial
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
