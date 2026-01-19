// src/app/sponsor/invitation/accept/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useAuthStore } from "@/store/auth.store";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, CheckCircle2, AlertCircle, LogIn } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

function AcceptSponsorInvitationComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { user, token: authToken } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sponsorName, setSponsorName] = useState("");

  // Check authentication and accept invitation
  useEffect(() => {
    if (!token) {
      setError("No invitation token provided. Please use the link from your invitation email.");
      return;
    }

    // If not logged in, redirect to login with return URL
    if (!user || !authToken) {
      const returnUrl = `/sponsor/invitation/accept?token=${encodeURIComponent(token)}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // User is logged in, accept the invitation
    const acceptInvitation = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/sponsors/sponsor-invitations/accept`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to accept invitation");
        }

        // Success - get sponsor info if available
        if (data.sponsor_id) {
          setSponsorName(data.sponsor_name || "the sponsor");
        }
        setSuccess(true);

        // Redirect to sponsor dashboard after a short delay
        setTimeout(() => router.push("/sponsor"), 2500);
      } catch (err) {
        console.error("[AcceptSponsorInvitation] Error:", err);
        setError(err instanceof Error ? err.message : "An error occurred while accepting the invitation");
      } finally {
        setLoading(false);
      }
    };

    acceptInvitation();
  }, [token, user, authToken, router]);

  // Loading state while checking auth
  if (!token) {
    return (
      <motion.div
        className="flex flex-col items-center gap-4 p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive font-medium">{error || "Invalid invitation link"}</p>
        <Link href="/">
          <Button variant="outline">Go to Home</Button>
        </Link>
      </motion.div>
    );
  }

  // Redirecting to login
  if (!user || !authToken) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader className="h-8 w-8 mb-4" />
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loading"
          className="flex flex-col items-center justify-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader className="h-8 w-8 mb-4" />
          <p className="text-muted-foreground">Accepting invitation...</p>
        </motion.div>
      )}

      {error && !loading && (
        <motion.div
          key="error"
          className="flex flex-col items-center gap-4 p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive font-medium">{error}</p>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline">
                <LogIn className="h-4 w-4 mr-2" />
                Try Logging In Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">Go to Home</Button>
            </Link>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          key="success"
          className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-foreground font-medium text-lg">
            You&apos;re now a sponsor representative!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {sponsorName ? `Welcome to ${sponsorName}.` : "Welcome to the team."} Redirecting to your dashboard...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AcceptSponsorInvitationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
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
              <Building2 className="h-7 w-7 text-primary" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Sponsor Invitation
            </motion.h1>
            <motion.p
              className="text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Join as a sponsor representative.
            </motion.p>
          </div>
          <Suspense
            fallback={
              <div className="flex justify-center">
                <Loader className="h-6 w-6" />
              </div>
            }
          >
            <AcceptSponsorInvitationComponent />
          </Suspense>
          <motion.p
            className="text-center text-sm text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Need help?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              Contact Support
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
