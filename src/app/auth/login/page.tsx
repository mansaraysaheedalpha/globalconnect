// src/app/auth/login/page.tsx
"use client";

import { LoginForm } from "@/components/features/Auth/LoginForm";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <motion.h1
          className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Welcome Back
        </motion.h1>
        <motion.p
          className="text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          Enter your credentials to access your dashboard.
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <LoginForm />
      </motion.div>
      <motion.p
        className="text-center text-sm text-muted-foreground mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-primary hover:underline transition-colors"
        >
          Sign Up
        </Link>
      </motion.p>
    </motion.div>
  );
}
