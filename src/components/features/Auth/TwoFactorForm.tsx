// src/components/features/Auth/TwoFactorForm.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Smartphone, ArrowLeft } from 'lucide-react';
import {
  LOGIN_2FA_MUTATION,
  SEND_2FA_EMAIL_CODE_MUTATION,
  LOGIN_2FA_WITH_EMAIL_MUTATION,
} from './auth.graphql';

interface TwoFactorFormProps {
  userId: string;
}

type VerificationMode = 'authenticator' | 'email-request' | 'email-verify';

export function TwoFactorForm({ userId }: TwoFactorFormProps) {
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<VerificationMode>('authenticator');
  const [emailSentMessage, setEmailSentMessage] = useState<string | null>(null);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Authenticator app login
  const [login2FA, { loading: loadingAuth, error: errorAuth }] = useMutation(
    LOGIN_2FA_MUTATION,
    {
      onCompleted: (data) => {
        const { token, user } = data.login2FA;
        if (token && user) {
          setAuth(token, user);
          router.push('/dashboard');
        }
      },
    }
  );

  // Send email backup code
  const [sendEmailCode, { loading: loadingSend, error: errorSend }] = useMutation(
    SEND_2FA_EMAIL_CODE_MUTATION,
    {
      onCompleted: (data) => {
        setEmailSentMessage(data.send2FAEmailBackupCode.message);
        setMode('email-verify');
        setCode('');
      },
    }
  );

  // Login with email backup code
  const [loginWithEmail, { loading: loadingEmail, error: errorEmail }] = useMutation(
    LOGIN_2FA_WITH_EMAIL_MUTATION,
    {
      onCompleted: (data) => {
        const { token, user } = data.login2FAWithEmailCode;
        if (token && user) {
          setAuth(token, user);
          router.push('/dashboard');
        }
      },
    }
  );

  const handleAuthenticatorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login2FA({ variables: { input: { userId, code } } });
  };

  const handleRequestEmailCode = () => {
    sendEmailCode({ variables: { input: { userId } } });
  };

  const handleEmailCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginWithEmail({ variables: { input: { userId, code } } });
  };

  const handleBackToAuthenticator = () => {
    setMode('authenticator');
    setCode('');
    setEmailSentMessage(null);
  };

  // Authenticator mode
  if (mode === 'authenticator') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-center mb-4">
          Two-Factor Authentication
        </h2>
        <p className="text-center text-muted-foreground mb-6">
          Enter the code from your authenticator app.
        </p>
        <form onSubmit={handleAuthenticatorSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">6-Digit Code</Label>
            <Input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-widest font-mono"
              autoComplete="one-time-code"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loadingAuth}>
            {loadingAuth ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Smartphone className="mr-2 h-4 w-4" />
                Verify & Sign In
              </>
            )}
          </Button>
          {errorAuth && (
            <Alert variant="destructive">
              <AlertDescription>{errorAuth.message}</AlertDescription>
            </Alert>
          )}
        </form>

        {/* Email backup option */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-center text-muted-foreground mb-3">
            Can&apos;t access your authenticator app?
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleRequestEmailCode}
            disabled={loadingSend}
          >
            {loadingSend ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending code...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send code to my email
              </>
            )}
          </Button>
          {errorSend && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errorSend.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  // Email verification mode
  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={handleBackToAuthenticator}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to authenticator
      </Button>

      <h2 className="text-2xl font-bold text-center mb-4">
        Email Verification
      </h2>

      {emailSentMessage && (
        <Alert className="mb-4">
          <Mail className="h-4 w-4" />
          <AlertDescription>{emailSentMessage}</AlertDescription>
        </Alert>
      )}

      <p className="text-center text-muted-foreground mb-6">
        Enter the 6-digit code sent to your email.
      </p>

      <form onSubmit={handleEmailCodeSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emailCode">Verification Code</Label>
          <Input
            id="emailCode"
            name="emailCode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-widest font-mono"
            autoComplete="one-time-code"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loadingEmail}>
          {loadingEmail ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify & Sign In'
          )}
        </Button>
        {errorEmail && (
          <Alert variant="destructive">
            <AlertDescription>{errorEmail.message}</AlertDescription>
          </Alert>
        )}
      </form>

      {/* Resend option */}
      <div className="mt-4 text-center">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={handleRequestEmailCode}
          disabled={loadingSend}
        >
          {loadingSend ? 'Sending...' : "Didn't receive the code? Send again"}
        </Button>
      </div>
    </div>
  );
}
