// src/app/auth/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($input: RequestResetInput!) {
    requestPasswordReset(input: $input)
  }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [requestPasswordReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET_MUTATION, {
    onCompleted: (data) => {
      setMessage(data.requestPasswordReset);
    },
    onError: (error) => {
      // Even on error, we show a generic message to prevent email enumeration
      setMessage('If an account with this email exists, a password reset link has been sent.');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    requestPasswordReset({ variables: { input: { email } } });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/auth">
            <Image src="/logo.png" alt="GlobalConnect Logo" width={80} height={80} />
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Forgot Password</h1>
        <p className="text-center text-gray-400 mb-6">Enter your email to receive a reset link.</p>

        {message ? (
          <div className="text-center p-4 bg-secondary rounded-md">
            <p>{message}</p>
            <Link href="/auth/login" className="font-semibold text-primary hover:underline mt-4 inline-block">
                Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}