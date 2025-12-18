//src/app/onboarding/create-organization/page.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ONBOARDING_CREATE_ORGANIZATION_MUTATION } from "@/graphql/organization.graphql";
import { motion } from "framer-motion";
import { Building2, Check, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

// Step indicator component
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, label: "Account Created" },
    { number: 2, label: "Create Organization" },
    { number: 3, label: "Start Creating" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <motion.div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
              step.number < currentStep
                ? "bg-primary text-primary-foreground"
                : step.number === currentStep
                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                : "bg-muted text-muted-foreground"
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {step.number < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              step.number
            )}
          </motion.div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 transition-colors ${
                step.number < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Floating background shapes
function FloatingShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/5 blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/5 blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}

export default function CreateOrganizationPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [createOrganization, { loading }] = useMutation(
    ONBOARDING_CREATE_ORGANIZATION_MUTATION,
    {
      onCompleted: (data) => {
        toast.success("Organization created successfully!");
        const { token, user } = data.onboardingCreateOrganization;
        setAuth(token, user);
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createOrganization({ variables: { input: { name } } });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
      <FloatingShapes />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/logo.png"
                alt="GlobalConnect Logo"
                width={56}
                height={56}
              />
            </motion.div>
            <span className="text-2xl font-bold group-hover:text-primary transition-colors">
              GlobalConnect
            </span>
          </Link>
        </motion.div>

        {/* Step indicator */}
        <StepIndicator currentStep={2} />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 shadow-xl">
            <form onSubmit={handleSubmit}>
              <CardHeader className="text-center pb-4">
                <motion.div
                  className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <Building2 className="h-7 w-7 text-primary" />
                </motion.div>
                <CardTitle className="text-2xl">
                  Create Your Organization
                </CardTitle>
                <CardDescription className="text-base">
                  This is where you&apos;ll manage all your events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name" className="text-sm font-medium">
                    Organization Name
                  </Label>
                  <Input
                    id="org-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Acme Events, TechConf Inc."
                    required
                    className="h-12 text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can always change this later in settings
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium group"
                  disabled={loading || !name.trim()}
                >
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Continue to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* Bottom hint */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>You&apos;re almost ready to create your first event!</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
