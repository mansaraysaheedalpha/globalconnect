'use client';

import Link from 'next/link';
import {
  Clock,
  XCircle,
  AlertTriangle,
  CheckCircle,
  CalendarX,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type JoinErrorType =
  | 'TOKEN_EXPIRED'
  | 'TOKEN_REVOKED'
  | 'TOKEN_INVALID'
  | 'TOKEN_USED'
  | 'SESSION_ENDED';

interface JoinErrorProps {
  error: JoinErrorType;
  eventId?: string;
  sessionId?: string;
}

interface ErrorConfig {
  title: string;
  description: string;
  icon: LucideIcon;
}

const errorMessages: Record<JoinErrorType, ErrorConfig> = {
  TOKEN_EXPIRED: {
    title: 'Link Expired',
    description: 'This join link has expired. Please log in to access the session.',
    icon: Clock,
  },
  TOKEN_REVOKED: {
    title: 'Link No Longer Valid',
    description: 'This link has been revoked. Please log in to access the session.',
    icon: XCircle,
  },
  TOKEN_INVALID: {
    title: 'Invalid Link',
    description: 'This link is not valid. Please check your email for the correct link.',
    icon: AlertTriangle,
  },
  TOKEN_USED: {
    title: 'Link Already Used',
    description: 'This link has already been used. Please log in to continue.',
    icon: CheckCircle,
  },
  SESSION_ENDED: {
    title: 'Session Has Ended',
    description: 'This session has already concluded.',
    icon: CalendarX,
  },
};

export function JoinError({ error, eventId }: JoinErrorProps) {
  const config = errorMessages[error] || errorMessages.TOKEN_INVALID;
  const { title, description, icon: Icon } = config;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
            {eventId && (
              <Button variant="outline" asChild>
                <Link href={`/events/${eventId}`}>View Event</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
