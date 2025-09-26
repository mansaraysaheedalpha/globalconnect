// src/app/(platform)/auth/login/page.tsx
import { LoginForm } from "@/components/features/Auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your dashboard.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-primary hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </>
  );
}
