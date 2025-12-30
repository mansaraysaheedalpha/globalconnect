// src/lib/logger.ts

/**
 * Centralized logging utility
 *
 * Provides structured logging with different levels and automatic error tracking integration.
 * In development: logs to console
 * In production: should integrate with error tracking service (Sentry, LogRocket, etc.)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log informational messages
   * Only shown in development mode
   */
  info(message: string, data?: LogData) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
    }
    this.sendToMonitoring('info', message, data);
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: LogData) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }
    this.sendToMonitoring('warn', message, data);
  }

  /**
   * Log error messages
   * Always logged and sent to error tracking
   */
  error(message: string, error?: Error | any, data?: LogData) {
    console.error(`[ERROR] ${message}`, error || '', data || '');
    this.sendToErrorTracking(message, error, data);
  }

  /**
   * Log debug messages
   * Only in development mode
   */
  debug(message: string, data?: LogData) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Send logs to monitoring service in production
   */
  private sendToMonitoring(level: LogLevel, message: string, data?: LogData) {
    if (typeof window === 'undefined') return;

    // Integration point for analytics services
    if ((window as any).analytics?.track) {
      (window as any).analytics.track('log', {
        level,
        message,
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send errors to error tracking service
   */
  private sendToErrorTracking(message: string, error?: Error | any, data?: LogData) {
    if (typeof window === 'undefined') return;

    // Integration point for Sentry
    if ((window as any).Sentry?.captureException) {
      (window as any).Sentry.captureException(error || new Error(message), {
        tags: { context: message },
        extra: data,
      });
    }

    // Integration point for LogRocket
    if ((window as any).LogRocket?.captureException) {
      (window as any).LogRocket.captureException(error || new Error(message), {
        tags: { context: message },
        extra: data,
      });
    }
  }
}

export const logger = new Logger();
