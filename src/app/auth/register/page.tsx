// src/app/(platform)/auth/register/page.tsx
import { RegistrationForm } from "@/components/features/Auth/RegistrationForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Create Your Account</h1>
        <p className="text-muted-foreground">
          Join GlobalConnect and redefine events.
        </p>
      </div>
      <RegistrationForm />
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary hover:underline"
        >
          Sign In
        </Link>
      </p>
    </>
  );
}
