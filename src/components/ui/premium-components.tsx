// src/components/ui/premium-components.tsx
// Premium UI components with world-class visual polish
"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// ============================================
// Premium Card
// ============================================

const premiumCardVariants = cva(
  "rounded-xl transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-elevation-1",
        elevated: "bg-card border border-border shadow-elevation-2 hover:shadow-elevation-3",
        glass: "glass-card",
        gradient: "bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-lg",
        glow: "bg-card border border-primary/20 shadow-glow-sm hover:shadow-glow",
        outline: "bg-transparent border-2 border-border hover:border-primary/50",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-lg",
        glow: "hover:shadow-glow hover:border-primary/30",
        scale: "hover:scale-[1.02]",
        shine: "card-shine",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      hover: "none",
    },
  }
);

interface PremiumCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof premiumCardVariants> {
  animate?: boolean;
}

export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant, padding, hover, animate = false, children, ...props }, ref) => {
    const cardClassName = cn(premiumCardVariants({ variant, padding, hover }), className);

    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={cardClassName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          {...(props as HTMLMotionProps<"div">)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cardClassName} {...props}>
        {children}
      </div>
    );
  }
);
PremiumCard.displayName = "PremiumCard";

// ============================================
// Stats Card
// ============================================

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: React.ReactNode;
  trend?: React.ReactNode;
  className?: string;
}

export function StatsCard({
  label,
  value,
  change,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <PremiumCard
      variant="elevated"
      padding="md"
      hover="lift"
      className={cn("relative overflow-hidden", className)}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5">
        {icon && <div className="w-full h-full">{icon}</div>}
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {change && (
            <span
              className={cn(
                "text-sm font-medium flex items-center gap-1",
                change.type === "increase" && "text-green-500",
                change.type === "decrease" && "text-red-500",
                change.type === "neutral" && "text-muted-foreground"
              )}
            >
              {change.type === "increase" && "↑"}
              {change.type === "decrease" && "↓"}
              {change.value}%
            </span>
          )}
        </div>

        {trend && <div className="mt-4">{trend}</div>}
      </div>
    </PremiumCard>
  );
}

// ============================================
// Feature Card
// ============================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  action,
  className,
}: FeatureCardProps) {
  return (
    <PremiumCard
      variant="elevated"
      padding="lg"
      hover="lift"
      className={cn("group", className)}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4 p-3 w-fit rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm flex-grow">{description}</p>
        {action && <div className="mt-4 pt-4 border-t">{action}</div>}
      </div>
    </PremiumCard>
  );
}

// ============================================
// Gradient Border Card
// ============================================

interface GradientBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientFrom?: string;
  gradientTo?: string;
}

export function GradientBorderCard({
  children,
  className,
  gradientFrom = "from-primary",
  gradientTo = "to-primary/30",
  ...props
}: GradientBorderCardProps) {
  return (
    <div className={cn("relative p-[1px] rounded-xl", className)} {...props}>
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-br opacity-100",
          gradientFrom,
          gradientTo
        )}
      />
      <div className="relative bg-card rounded-xl p-6">{children}</div>
    </div>
  );
}

// ============================================
// Page Transition Wrapper
// ============================================

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Stagger Container
// ============================================

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Stagger Item
// ============================================

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: "easeOut" },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Animated Section Header
// ============================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-start justify-between mb-6", className)}
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}

// ============================================
// Animated List Item
// ============================================

interface AnimatedListItemProps extends HTMLMotionProps<"div"> {
  index?: number;
}

export function AnimatedListItem({
  children,
  index = 0,
  className,
  ...props
}: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut",
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Hero Section
// ============================================

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  backgroundVariant?: "gradient" | "mesh" | "dots" | "grid" | "none";
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  children,
  backgroundVariant = "mesh",
  className,
}: HeroSectionProps) {
  const bgClasses = {
    gradient: "gradient-radial",
    mesh: "gradient-mesh",
    dots: "pattern-dots",
    grid: "pattern-grid",
    none: "",
  };

  return (
    <section
      className={cn(
        "relative py-16 px-6 rounded-2xl overflow-hidden",
        bgClasses[backgroundVariant],
        className
      )}
    >
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground mb-8"
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ============================================
// Animated Badge
// ============================================

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  pulse?: boolean;
  className?: string;
}

export function AnimatedBadge({
  children,
  variant = "default",
  pulse = false,
  className,
}: AnimatedBadgeProps) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        pulse && "animate-pulse-soft",
        className
      )}
    >
      {children}
    </motion.span>
  );
}

// ============================================
// Metric Display
// ============================================

interface MetricDisplayProps {
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MetricDisplay({
  value,
  label,
  prefix,
  suffix,
  size = "md",
  className,
}: MetricDisplayProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <div className={cn("text-center", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={cn("font-bold tracking-tight", sizes[size])}
      >
        {prefix}
        {value}
        {suffix}
      </motion.div>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

// ============================================
// Spotlight Card (with mouse tracking glow)
// ============================================

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SpotlightCard({ children, className, ...props }: SpotlightCardProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card overflow-hidden transition-all duration-300",
        isHovered && "border-primary/30",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, hsl(var(--primary) / 0.1), transparent 40%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
