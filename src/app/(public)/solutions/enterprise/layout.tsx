// src/app/(public)/solutions/enterprise/layout.tsx
import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title:
      "Enterprise Suite - Scalable, Secure Event Platform | Event Dynamics",
    description:
      "Enterprise-grade event management platform with advanced security, RBAC permissions, audit logging, multi-tenancy, and compliance features. Built for organizations that demand the highest standards.",
    path: "/solutions/enterprise",
    keywords: [
      "enterprise event platform",
      "enterprise security",
      "RBAC permissions",
      "role-based access control",
      "audit logging",
      "multi-tenancy",
      "SOC 2 compliance",
      "GDPR compliance",
      "SSO integration",
      "enterprise authentication",
      "JWT security",
      "two-factor authentication",
      "GraphQL federation",
      "WebSocket infrastructure",
      "scalable events",
      "enterprise API",
      "white-label events",
      "custom branding",
    ],
  });
}

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
