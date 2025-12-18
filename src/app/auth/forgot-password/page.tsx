//src/app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($input: RequestResetInput!) {
    requestPasswordReset(input: $input)
  }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [requestPasswordReset, { loading }] = useMutation(
    REQUEST_PASSWORD_RESET_MUTATION,
    {
      onCompleted: (data) => {
        setMessage(data.requestPasswordReset);
      },
      onError: () => {
        setMessage(
          "If an account with this email exists, a password reset link has been sent."
        );
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    requestPasswordReset({ variables: { input: { email } } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href="/auth/login"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to login
      </Link>

      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <Mail className="h-7 w-7 text-primary" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Forgot Password
        </motion.h1>
        <motion.p
          className="text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Enter your email to receive a reset link.
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {message ? (
          <motion.div
            key="success"
            className="text-center p-6 bg-primary/5 border border-primary/20 rounded-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-foreground">{message}</p>
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:underline mt-4 inline-block"
            >
              Back to Login
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader className="mr-2 h-4 w-4" /> : null}
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
