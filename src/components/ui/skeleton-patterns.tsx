// src/components/ui/skeleton-patterns.tsx
// Comprehensive skeleton loading patterns for world-class UX
"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

// ============================================
// Base Enhanced Skeleton with Shimmer
// ============================================

interface ShimmerSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "pulse" | "shimmer" | "wave";
}

export function ShimmerSkeleton({
  className,
  variant = "shimmer",
  ...props
}: ShimmerSkeletonProps) {
  const variants = {
    pulse: "animate-pulse",
    shimmer: "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
    wave: "animate-wave",
  };

  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// ============================================
// Avatar Skeleton
// ============================================

interface AvatarSkeletonProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AvatarSkeleton({ size = "md", className }: AvatarSkeletonProps) {
  const sizes = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <ShimmerSkeleton
      className={cn("rounded-full", sizes[size], className)}
    />
  );
}

// ============================================
// Text Skeleton
// ============================================

interface TextSkeletonProps {
  lines?: number;
  lastLineWidth?: "full" | "3/4" | "1/2" | "1/4";
  className?: string;
}

export function TextSkeleton({
  lines = 3,
  lastLineWidth = "3/4",
  className,
}: TextSkeletonProps) {
  const lastWidths = {
    full: "w-full",
    "3/4": "w-3/4",
    "1/2": "w-1/2",
    "1/4": "w-1/4",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerSkeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? lastWidths[lastLineWidth] : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// ============================================
// Card Skeleton
// ============================================

interface CardSkeletonProps {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
  className?: string;
}

export function CardSkeleton({
  hasImage = false,
  hasAvatar = false,
  lines = 2,
  className,
}: CardSkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 space-y-4", className)}>
      {hasImage && (
        <ShimmerSkeleton className="h-40 w-full rounded-md" />
      )}
      <div className="space-y-3">
        {hasAvatar && (
          <div className="flex items-center gap-3">
            <AvatarSkeleton size="md" />
            <div className="flex-1 space-y-2">
              <ShimmerSkeleton className="h-4 w-1/2" />
              <ShimmerSkeleton className="h-3 w-1/3" />
            </div>
          </div>
        )}
        <ShimmerSkeleton className="h-5 w-3/4" />
        <TextSkeleton lines={lines} lastLineWidth="1/2" />
      </div>
    </div>
  );
}

// ============================================
// List Item Skeleton
// ============================================

interface ListItemSkeletonProps {
  hasAvatar?: boolean;
  hasActions?: boolean;
  className?: string;
}

export function ListItemSkeleton({
  hasAvatar = true,
  hasActions = false,
  className,
}: ListItemSkeletonProps) {
  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      {hasAvatar && <AvatarSkeleton size="md" />}
      <div className="flex-1 space-y-2">
        <ShimmerSkeleton className="h-4 w-1/2" />
        <ShimmerSkeleton className="h-3 w-1/3" />
      </div>
      {hasActions && (
        <ShimmerSkeleton className="h-8 w-20 rounded-md" />
      )}
    </div>
  );
}

// ============================================
// Table Skeleton
// ============================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("rounded-lg border", className)}>
      {hasHeader && (
        <div className="flex gap-4 p-4 border-b bg-muted/30">
          {Array.from({ length: columns }).map((_, i) => (
            <ShimmerSkeleton
              key={`header-${i}`}
              className="h-4 flex-1"
            />
          ))}
        </div>
      )}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <ShimmerSkeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  "h-4 flex-1",
                  colIndex === 0 && "max-w-[200px]"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Stats Card Skeleton
// ============================================

export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <div className="flex items-center justify-between">
        <ShimmerSkeleton className="h-4 w-24" />
        <ShimmerSkeleton className="h-5 w-5 rounded" />
      </div>
      <ShimmerSkeleton className="h-8 w-20 mt-3" />
      <ShimmerSkeleton className="h-3 w-32 mt-2" />
    </div>
  );
}

// ============================================
// Session Card Skeleton (Event-specific)
// ============================================

export function SessionCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <ShimmerSkeleton className="h-5 w-16 rounded-full" />
          </div>
          <ShimmerSkeleton className="h-5 w-3/4" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShimmerSkeleton className="h-4 w-4 rounded" />
              <ShimmerSkeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <ShimmerSkeleton className="h-4 w-4 rounded" />
              <ShimmerSkeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <ShimmerSkeleton className="h-8 w-20 rounded-md" />
          <ShimmerSkeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Event Header Skeleton
// ============================================

export function EventHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      <ShimmerSkeleton className="h-48 md:h-64 w-full" />
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <ShimmerSkeleton className="h-5 w-5 rounded" />
              <div className="space-y-1.5">
                <ShimmerSkeleton className="h-3 w-12" />
                <ShimmerSkeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Chat Message Skeleton
// ============================================

interface ChatMessageSkeletonProps {
  isOwn?: boolean;
  className?: string;
}

export function ChatMessageSkeleton({
  isOwn = false,
  className,
}: ChatMessageSkeletonProps) {
  return (
    <div
      className={cn(
        "flex gap-2 mb-2",
        isOwn ? "justify-end" : "justify-start",
        className
      )}
    >
      {!isOwn && <AvatarSkeleton size="sm" />}
      <div className={cn("space-y-1", isOwn ? "items-end" : "items-start")}>
        <ShimmerSkeleton
          className={cn(
            "h-10 rounded-lg",
            isOwn ? "w-32 bg-primary/20" : "w-40"
          )}
        />
        <ShimmerSkeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

// ============================================
// Chat List Skeleton
// ============================================

export function ChatListSkeleton({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ChatMessageSkeleton key={i} isOwn={i % 3 === 0} />
      ))}
    </div>
  );
}

// ============================================
// Conversation List Skeleton
// ============================================

export function ConversationListSkeleton({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <AvatarSkeleton size="lg" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <ShimmerSkeleton className="h-4 w-24" />
              <ShimmerSkeleton className="h-3 w-10" />
            </div>
            <ShimmerSkeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Leaderboard Skeleton
// ============================================

export function LeaderboardSkeleton({
  count = 10,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <div className="p-4 border-b">
        <ShimmerSkeleton className="h-5 w-32" />
      </div>
      <div className="divide-y">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <ShimmerSkeleton className="h-6 w-6 rounded-full" />
            <AvatarSkeleton size="sm" />
            <div className="flex-1">
              <ShimmerSkeleton className="h-4 w-24" />
            </div>
            <ShimmerSkeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Poll Skeleton
// ============================================

export function PollSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 space-y-4", className)}>
      <div className="space-y-2">
        <ShimmerSkeleton className="h-5 w-3/4" />
        <ShimmerSkeleton className="h-3 w-1/2" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-md border">
            <ShimmerSkeleton className="h-4 w-4 rounded" />
            <ShimmerSkeleton className="h-4 flex-1" />
            <ShimmerSkeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
      <ShimmerSkeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

// ============================================
// Notification Item Skeleton
// ============================================

export function NotificationItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 p-3", className)}>
      <ShimmerSkeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-3 w-2/3" />
        <ShimmerSkeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// ============================================
// Page Loading Skeleton
// ============================================

export function PageLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 space-y-6 animate-in fade-in duration-300", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-8 w-48" />
          <ShimmerSkeleton className="h-4 w-32" />
        </div>
        <ShimmerSkeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ShimmerSkeleton className="h-6 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} hasAvatar lines={2} />
          ))}
        </div>
        <div className="space-y-4">
          <ShimmerSkeleton className="h-6 w-32" />
          <CardSkeleton hasImage lines={3} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Inline Loading Spinner
// ============================================

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <svg
      className={cn("animate-spin text-primary", sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ============================================
// Loading Overlay
// ============================================

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  message = "Loading...",
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50",
        className
      )}
    >
      <Spinner size="lg" />
      <p className="mt-3 text-sm text-muted-foreground animate-pulse">
        {message}
      </p>
    </div>
  );
}

// ============================================
// Button Loading State
// ============================================

interface LoadingButtonContentProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButtonContent({
  isLoading,
  loadingText = "Loading...",
  children,
}: LoadingButtonContentProps) {
  if (isLoading) {
    return (
      <>
        <Spinner size="sm" className="mr-2" />
        {loadingText}
      </>
    );
  }
  return <>{children}</>;
}
