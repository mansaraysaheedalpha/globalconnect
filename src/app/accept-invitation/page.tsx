// src/app/accept-invitation/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { useAuthStore } from "@/store/auth.store";
import { clientEnv } from "@/lib/env";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, CheckCircle2, AlertCircle, LogIn } from "lucide-react";

interface InvitationPreview {
  email: string;
  organizationName: string;
  inviterName: string;
  roleName: string;
  userExists: boolean;
  existingUserFirstName?: string;
  expiresAt: string;
}

function AcceptInvitationComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const setAuth = useAuthStore((state) => state.setAuth);

  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch invitation preview on mount
  useEffect(() => {
    if (!token) {
      setError("No invitation token provided. Please use the link from your invitation email.");
      setPreviewLoading(false);
      return;
    }

    const fetchPreview = async () => {
      try {
        const apiBaseUrl = clientEnv.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const url = `${apiBaseUrl}/auth/invitations/${token}/preview`;
        console.log("[AcceptInvitation] Fetching preview:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("[AcceptInvitation] Preview response:", response.status, data);

        if (!response.ok) {
          throw new Error(data.message || "Invalid or expired invitation");
        }

        setPreview(data);
      } catch (err) {
        console.error("[AcceptInvitation] Preview error:", err);
        setError(err instanceof Error ? err.message : "Failed to load invitation");
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!preview?.userExists && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Missing invitation token.");
      return;
    }

    setLoading(true);

    try {
      const apiBaseUrl = clientEnv.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      // Use the appropriate endpoint based on whether user exists
      const endpoint = preview?.userExists
        ? `${apiBaseUrl}/auth/invitations/${token}/accept/existing-user`
        : `${apiBaseUrl}/auth/invitations/${token}/accept/new-user`;

      // Build request body based on user type
      const body = preview?.userExists
        ? { password: formData.password }
        : {
            first_name: formData.first_name,
            last_name: formData.last_name,
            password: formData.password,
          };

      console.log("[AcceptInvitation] Calling:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("[AcceptInvitation] Response:", response.status, data);

      if (!response.ok) {
        // Handle validation errors array from NestJS
        if (data.message && Array.isArray(data.message)) {
          throw new Error(data.message.join(". "));
        }
        throw new Error(data.message || "Failed to accept invitation");
      }

      // Set auth state with the returned token and user
      if (data.access_token && data.user) {
        setAuth(data.access_token, data.user);
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      console.error("[AcceptInvitation] Error:", err);
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Unable to connect to server. Please check your internet connection.");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state while fetching preview
  if (previewLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader className="h-8 w-8 mb-4" />
        <p className="text-muted-foreground">Loading invitation details...</p>
      </div>
    );
  }

  // Error state (no token or invalid invitation)
  if (error && !preview) {
    return (
      <motion.div
        className="flex flex-col items-center gap-4 p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive font-medium">{error}</p>
        <Link href="/auth/login">
          <Button variant="outline">Go to Login</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {success ? (
        <motion.div
          key="success"
          className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-foreground font-medium">
            {preview?.userExists ? "Welcome back!" : "Welcome to the team!"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Redirecting to dashboard...
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Invitation details card */}
          {preview && (
            <motion.div
              className="mb-6 p-4 bg-muted/50 border rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{preview.inviterName}</span> invited you to join
              </p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {preview.organizationName}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                You&apos;ll be added as: <span className="font-medium">{preview.roleName}</span>
              </p>
            </motion.div>
          )}

          {/* Form - different based on user type */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {preview?.userExists ? (
              // Existing user form - password only
              <>
                <motion.div
                  className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <LogIn className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-500">Welcome back{preview.existingUserFirstName ? `, ${preview.existingUserFirstName}` : ""}!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You already have an account with <span className="font-medium">{preview.email}</span>.
                    Enter your password to join this organization.
                  </p>
                </motion.div>
                <div className="space-y-2">
                  <Label htmlFor="password">Your Password</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your existing password"
                    required
                    className="h-11"
                  />
                </div>
              </>
            ) : (
              // New user form - full registration
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Min 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading || !token}>
              {loading ? <Loader className="mr-2 h-4 w-4" /> : null}
              {loading
                ? (preview?.userExists ? "Joining..." : "Creating Account...")
                : (preview?.userExists ? "Join Organization" : "Accept Invitation")
              }
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
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AcceptInvitationPage() {
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
              <UserPlus className="h-7 w-7 text-primary" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Accept Your Invitation
            </motion.h1>
            <motion.p
              className="text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Join your team in just a moment.
            </motion.p>
          </div>
          <Suspense
            fallback={
              <div className="flex justify-center">
                <Loader className="h-6 w-6" />
              </div>
            }
          >
            <AcceptInvitationComponent />
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
