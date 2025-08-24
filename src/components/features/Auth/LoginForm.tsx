// src/components/features/Auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TwoFactorForm } from './TwoFactorForm';
import { toast } from 'sonner'; 

const LOGIN_USER_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        first_name
      }
      requires2FA
      userIdFor2FA
    }
  }
`;

export function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loginState, setLoginState] = useState({
    requires2FA: false,
    userIdFor2FA: null as string | null,
  });

  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [login, { loading }] = useMutation(LOGIN_USER_MUTATION, {
    onCompleted: (data) => {
      const { token, user, requires2FA, userIdFor2FA } = data.login;
      if (requires2FA) {
        setLoginState({ requires2FA: true, userIdFor2FA });
      } else if (token && user) {
        toast.success('Login Successful!');
        setAuth(token, user);
        router.push('/dashboard');
      }
    },
    
    onError: (error) => {
      // We display the clean error message from GraphQL in a toast
      toast.error(error.message);
    },
  });

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ variables: { input: formData } });
  };

  if (loginState.requires2FA && loginState.userIdFor2FA) {
    return <TwoFactorForm userId={loginState.userIdFor2FA} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                Forgot Password?
            </Link>
        </div>
        <PasswordInput id="password" name="password" value={formData.password} onChange={handleChange} required />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
}