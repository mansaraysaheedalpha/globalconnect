// src/components/ui/error-boundary.tsx
// Comprehensive error boundary and error state components
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  ServerCrash,
  FileQuestion,
  Lock,
  Home,
  ArrowLeft,
  Bug,
  ShieldAlert,
} from "lucide-react";

// ============================================
// Error Boundary Class Component
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary caught an error", error, {
      componentStack: errorInfo.componentStack,
    });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          title="Something went wrong"
          description={this.state.error?.message || "An unexpected error occurred"}
          variant="error"
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================
// Error State Component
// ============================================

type ErrorVariant = "error" | "network" | "notFound" | "unauthorized" | "serverError" | "empty";

interface ErrorStateProps {
  title: string;
  description?: string;
  variant?: ErrorVariant;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
  className?: string;
  children?: ReactNode;
}

const variantConfig: Record<
  ErrorVariant,
  { icon: typeof AlertTriangle; iconColor: string; bgColor: string }
> = {
  error: {
    icon: AlertTriangle,
    iconColor: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  network: {
    icon: WifiOff,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  notFound: {
    icon: FileQuestion,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  unauthorized: {
    icon: Lock,
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  serverError: {
    icon: ServerCrash,
    iconColor: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  empty: {
    icon: FileQuestion,
    iconColor: "text-muted-foreground",
    bgColor: "bg-muted",
  },
};

export function ErrorState({
  title,
  description,
  variant = "error",
  onRetry,
  onGoBack,
  onGoHome,
  retryLabel = "Try again",
  showIcon = true,
  className,
  children,
}: ErrorStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center animate-fade-in",
        className
      )}
    >
      {showIcon && (
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4",
            config.bgColor
          )}
        >
          <Icon className={cn("h-8 w-8", config.iconColor)} />
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}

      {children}

      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {retryLabel}
          </Button>
        )}

        {onGoBack && (
          <Button variant="outline" onClick={onGoBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        )}

        {onGoHome && (
          <Button variant="outline" onClick={onGoHome} className="gap-2">
            <Home className="h-4 w-4" />
            Go home
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Inline Error Alert
// ============================================

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function InlineError({
  message,
  onRetry,
  onDismiss,
  className,
}: InlineErrorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm animate-slide-down",
        className
      )}
      role="alert"
    >
      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
      <p className="flex-1 text-destructive">{message}</p>
      <div className="flex gap-2">
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            &times;
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Error Card (for displaying in cards/modals)
// ============================================

interface ErrorCardProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function ErrorCard({
  title,
  description,
  onRetry,
  isRetrying = false,
  className,
}: ErrorCardProps) {
  return (
    <Card className={cn("border-destructive/50", className)}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h4 className="font-semibold text-destructive">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
      {onRetry && (
        <CardFooter className="justify-center pb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
            {isRetrying ? "Retrying..." : "Try again"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// ============================================
// Network Error State
// ============================================

interface NetworkErrorProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function NetworkError({
  onRetry,
  isRetrying = false,
  className,
}: NetworkErrorProps) {
  return (
    <ErrorState
      title="Connection lost"
      description="Please check your internet connection and try again."
      variant="network"
      onRetry={onRetry}
      retryLabel={isRetrying ? "Reconnecting..." : "Reconnect"}
      className={className}
    />
  );
}

// ============================================
// Not Found Error State
// ============================================

interface NotFoundErrorProps {
  resource?: string;
  onGoBack?: () => void;
  onGoHome?: () => void;
  className?: string;
}

export function NotFoundError({
  resource = "page",
  onGoBack,
  onGoHome,
  className,
}: NotFoundErrorProps) {
  return (
    <ErrorState
      title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`}
      description={`The ${resource} you're looking for doesn't exist or may have been removed.`}
      variant="notFound"
      onGoBack={onGoBack}
      onGoHome={onGoHome}
      className={className}
    />
  );
}

// ============================================
// Unauthorized Error State
// ============================================

interface UnauthorizedErrorProps {
  onLogin?: () => void;
  onGoBack?: () => void;
  className?: string;
}

export function UnauthorizedError({
  onLogin,
  onGoBack,
  className,
}: UnauthorizedErrorProps) {
  return (
    <ErrorState
      title="Access denied"
      description="You don't have permission to view this content. Please log in or contact support."
      variant="unauthorized"
      onGoBack={onGoBack}
      className={className}
    >
      {onLogin && (
        <Button onClick={onLogin} className="mb-4">
          Log in
        </Button>
      )}
    </ErrorState>
  );
}

// ============================================
// Server Error State
// ============================================

interface ServerErrorProps {
  onRetry?: () => void;
  onReportBug?: () => void;
  errorCode?: string;
  className?: string;
}

export function ServerError({
  onRetry,
  onReportBug,
  errorCode,
  className,
}: ServerErrorProps) {
  return (
    <ErrorState
      title="Server error"
      description="Something went wrong on our end. Our team has been notified and is working on it."
      variant="serverError"
      onRetry={onRetry}
      className={className}
    >
      {errorCode && (
        <p className="text-xs text-muted-foreground mb-4 font-mono">
          Error code: {errorCode}
        </p>
      )}
      {onReportBug && (
        <Button variant="outline" size="sm" onClick={onReportBug} className="gap-2 mb-4">
          <Bug className="h-4 w-4" />
          Report issue
        </Button>
      )}
    </ErrorState>
  );
}

// ============================================
// Async Error Handler Hook
// ============================================

interface UseAsyncErrorResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
  reset: () => void;
}

export function useAsyncError<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
): UseAsyncErrorResult<T> {
  const [state, setState] = React.useState<{
    data: T | null;
    error: Error | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: true,
  });

  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    asyncFn()
      .then((data) => {
        if (!cancelled) {
          setState({ data, error: null, isLoading: false });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ data: null, error, isLoading: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [...deps, retryCount]);

  const retry = React.useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  const reset = React.useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    isError: !!state.error,
    retry,
    reset,
  };
}

// ============================================
// Query Error Handler
// ============================================

interface QueryErrorHandlerProps {
  error: Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  compact?: boolean;
  className?: string;
}

export function QueryErrorHandler({
  error,
  onRetry,
  isRetrying = false,
  compact = false,
  className,
}: QueryErrorHandlerProps) {
  if (!error) return null;

  // Determine error type from message
  const errorMessage = error.message.toLowerCase();

  let variant: ErrorVariant = "error";
  let title = "Failed to load data";
  let description = error.message;

  if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
    variant = "network";
    title = "Connection error";
    description = "Please check your internet connection and try again.";
  } else if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
    variant = "unauthorized";
    title = "Session expired";
    description = "Please log in again to continue.";
  } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
    variant = "notFound";
    title = "Not found";
    description = "The requested resource could not be found.";
  } else if (errorMessage.includes("500") || errorMessage.includes("server")) {
    variant = "serverError";
    title = "Server error";
    description = "Something went wrong. Please try again later.";
  }

  if (compact) {
    return (
      <InlineError
        message={description}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  return (
    <ErrorState
      title={title}
      description={description}
      variant={variant}
      onRetry={onRetry}
      retryLabel={isRetrying ? "Retrying..." : "Try again"}
      className={className}
    />
  );
}

// ============================================
// Chart Error Boundary
// ============================================

interface ChartErrorBoundaryProps {
  children: ReactNode;
  chartName?: string;
  className?: string;
}

/**
 * Specialized error boundary for Recharts components.
 * Prevents a single chart crash from taking down the entire page.
 * Shows a compact fallback with a retry button.
 */
export function ChartErrorBoundary({
  children,
  chartName,
  className,
}: ChartErrorBoundaryProps) {
  const [key, setKey] = React.useState(0);

  return (
    <ErrorBoundary
      key={key}
      fallback={
        <Card className={cn("border-dashed", className)}>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">
              Failed to load {chartName || "chart"}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              An error occurred while rendering this component.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setKey((k) => k + 1)}
              className="gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </CardContent>
        </Card>
      }
      onError={(error) => {
        logger.error(`Chart rendering error (${chartName || "unknown"})`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
