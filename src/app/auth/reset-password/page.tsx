// src/app/auth/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { PERFORM_PASSWORD_RESET_MUTATION } from "@/components/features/Auth/auth.graphql";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setAppError] = useState("");

  const [performPasswordReset, { loading }] = useMutation(
    PERFORM_PASSWORD_RESET_MUTATION,
    {
      onCompleted: (data) => {
        setMessage(data.performPasswordReset);
        setTimeout(() => router.push("/auth/login"), 3000);
      },
      onError: (err) => {
        setAppError(err.message);
      },
    }
  );

  useEffect(() => {
    if (!token) {
      setAppError("No reset token provided. Please request a new link.");
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAppError("");
    setMessage("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setAppError("Passwords do not match.");
      return;
    }
    if (!token) {
      setAppError("Missing reset token.");
      return;
    }

    performPasswordReset({
      variables: {
        input: {
          resetToken: token,
          newPassword: passwords.newPassword,
        },
      },
    });
  };

  return (
    <AnimatePresence mode="wait">
      {message ? (
        <motion.div
          key="success"
          className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-foreground font-medium">{message}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Redirecting to login...
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading || !token}>
            {loading ? <Loader className="mr-2 h-4 w-4" /> : null}
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
          {error && (
            <motion.div
              className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  );
}

export default function ResetPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <KeyRound className="h-7 w-7 text-primary" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Set a New Password
        </motion.h1>
        <motion.p
          className="text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Create a strong password for your account.
        </motion.p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Loader className="h-6 w-6" />
          </div>
        }
      >
        <ResetPasswordComponent />
      </Suspense>
      <motion.p
        className="text-center text-sm text-muted-foreground mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Remember your password?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary hover:underline transition-colors"
        >
          Sign In
        </Link>
      </motion.p>
    </motion.div>
  );
}
