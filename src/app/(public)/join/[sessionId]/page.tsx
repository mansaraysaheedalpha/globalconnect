'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { JoinLoading } from '../_components/JoinLoading';
import { JoinError } from '../_components/JoinError';
import { JoinSuccess } from '../_components/JoinSuccess';

type JoinErrorType =
  | 'TOKEN_EXPIRED'
  | 'TOKEN_REVOKED'
  | 'TOKEN_INVALID'
  | 'TOKEN_USED'
  | 'SESSION_ENDED';

interface ValidationResponse {
  valid: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  redirect?: {
    sessionId: string;
    eventId: string;
    sessionStatus?: 'LIVE' | 'UPCOMING' | 'ENDED';
    sessionTitle?: string;
    hasRecording?: boolean;
  };
  error?: JoinErrorType;
}

type JoinState =
  | { status: 'loading' }
  | { status: 'success'; userName: string; sessionTitle: string }
  | { status: 'error'; error: JoinErrorType; eventId?: string; sessionId?: string };

async function validateMagicLink(token: string): Promise<ValidationResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/auth/magic-link/validate?token=${encodeURIComponent(token)}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    return { valid: false, error: 'TOKEN_INVALID' };
  }

  return response.json();
}

function determineRedirectUrl(
  sessionId: string,
  eventId: string,
  sessionStatus?: string,
  hasRecording?: boolean
): string {
  const base = `/attendee/events/${eventId}`;

  if (sessionStatus === 'LIVE') {
    return `${base}?session=${sessionId}&autoJoin=true`;
  }

  if (sessionStatus === 'UPCOMING') {
    return `${base}?session=${sessionId}&autoJoin=true`;
  }

  if (sessionStatus === 'ENDED' && hasRecording) {
    return `${base}?session=${sessionId}&autoJoin=true`;
  }

  return `${base}?session=${sessionId}`;
}

interface JoinSessionPageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default function JoinSessionPage({
  params,
  searchParams,
}: JoinSessionPageProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [state, setState] = useState<JoinState>({ status: 'loading' });
  const [resolvedParams, setResolvedParams] = useState<{
    sessionId: string;
    token?: string;
  } | null>(null);

  useEffect(() => {
    Promise.all([params, searchParams]).then(([p, sp]) => {
      setResolvedParams({ sessionId: p.sessionId, token: sp.token });
    });
  }, [params, searchParams]);

  const handleJoin = useCallback(async (sessionId: string, token?: string) => {
    if (!token) {
      setState({
        status: 'error',
        error: 'TOKEN_INVALID',
        sessionId,
      });
      return;
    }

    try {
      const result = await validateMagicLink(token);

      if (!result.valid || result.error) {
        setState({
          status: 'error',
          error: result.error || 'TOKEN_INVALID',
          eventId: result.redirect?.eventId,
          sessionId,
        });
        return;
      }

      if (result.accessToken && result.user) {
        setAuth(result.accessToken, {
          id: result.user.id,
          email: result.user.email,
          first_name: result.user.firstName,
          last_name: result.user.lastName,
        });
      }

      const userName = result.user
        ? `${result.user.firstName}`
        : 'there';
      const sessionTitle = result.redirect?.sessionTitle || 'session';

      setState({
        status: 'success',
        userName,
        sessionTitle,
      });

      const redirectUrl = result.redirect
        ? determineRedirectUrl(
            result.redirect.sessionId,
            result.redirect.eventId,
            result.redirect.sessionStatus,
            result.redirect.hasRecording
          )
        : `/attendee`;

      // Clear token from URL for security
      window.history.replaceState({}, '', `/join/${sessionId}`);

      // Brief delay to show success state
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    } catch (error) {
      console.error('Magic link validation failed:', error);
      setState({
        status: 'error',
        error: 'TOKEN_INVALID',
        sessionId,
      });
    }
  }, [router, setAuth]);

  useEffect(() => {
    if (resolvedParams) {
      handleJoin(resolvedParams.sessionId, resolvedParams.token);
    }
  }, [resolvedParams, handleJoin]);

  switch (state.status) {
    case 'loading':
      return <JoinLoading />;
    case 'success':
      return (
        <JoinSuccess
          userName={state.userName}
          sessionTitle={state.sessionTitle}
        />
      );
    case 'error':
      return (
        <JoinError
          error={state.error}
          eventId={state.eventId}
          sessionId={state.sessionId}
        />
      );
  }
}
