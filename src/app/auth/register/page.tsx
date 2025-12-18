// src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { RegistrationForm } from "@/components/features/Auth/RegistrationForm";
import { AttendeeRegistrationForm } from "@/components/features/Auth/AttendeeRegistrationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Building2, User, ArrowLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type UserRole = "organizer" | "attendee" | null;

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.1, duration: 0.4 },
  }),
  hover: {
    scale: 1.02,
    transition: { type: "spring" as const, stiffness: 300 },
  },
};

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  return (
    <AnimatePresence mode="wait">
      {selectedRole === "organizer" && (
        <motion.div
          key="organizer"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRole(null)}
            className="mb-4 -ml-2 group"
          >
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Building2 className="h-3.5 w-3.5" />
              Organizer Account
            </motion.div>
            <motion.h1
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Create Your Account
            </motion.h1>
            <motion.p
              className="text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Set up your organization and start creating events.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <RegistrationForm />
          </motion.div>
          <motion.p
            className="text-center text-sm text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              Sign In
            </Link>
          </motion.p>
        </motion.div>
      )}

      {selectedRole === "attendee" && (
        <motion.div
          key="attendee"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRole(null)}
            className="mb-4 -ml-2 group"
          >
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <User className="h-3.5 w-3.5" />
              Attendee Account
            </motion.div>
            <motion.h1
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Create Your Account
            </motion.h1>
            <motion.p
              className="text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Join events and connect with others.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <AttendeeRegistrationForm />
          </motion.div>
          <motion.p
            className="text-center text-sm text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              Sign In
            </Link>
          </motion.p>
        </motion.div>
      )}

      {selectedRole === null && (
        <motion.div
          key="selection"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary text-sm mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Get Started
            </motion.div>
            <motion.h1
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Join GlobalConnect
            </motion.h1>
            <motion.p
              className="text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              How would you like to use GlobalConnect?
            </motion.p>
          </div>

          <div className="space-y-4">
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Card
                className="cursor-pointer transition-all hover:border-primary hover:shadow-lg border-2"
                onClick={() => setSelectedRole("organizer")}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 group-hover:scale-110 transition-transform">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">I&apos;m an Organizer</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create and manage events, track registrations, and engage with
                        attendees.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              custom={1}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Card
                className="cursor-pointer transition-all hover:border-primary hover:shadow-lg border-2"
                onClick={() => setSelectedRole("attendee")}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">I&apos;m an Attendee</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Discover events, register to attend, and participate in live
                        sessions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.p
            className="text-center text-sm text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              Sign In
            </Link>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
