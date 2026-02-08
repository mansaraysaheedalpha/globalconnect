// src/app/(public)/solutions/enterprise/page.tsx
"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Users,
  Building2,
  Key,
  FileCheck,
  Globe,
  Server,
  Database,
  Network,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Eye,
  EyeOff,
  UserCheck,
  Settings,
  Layers,
  GitBranch,
  Activity,
  Clock,
  Zap,
  BarChart3,
  Fingerprint,
  ShieldCheck,
  Scale,
  Cpu,
  HardDrive,
  Cloud,
  AlertTriangle,
  BookOpen,
  Workflow,
} from "lucide-react";
import Link from "next/link";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// ============================================================================
// RBAC PERMISSION DEMO
// ============================================================================

interface Role {
  name: string;
  color: string;
  permissions: string[];
}

function RBACDemo() {
  const [selectedRole, setSelectedRole] = useState<string>("organizer");

  const roles: Role[] = [
    {
      name: "Super Admin",
      color: "red",
      permissions: [
        "manage_organization",
        "manage_users",
        "manage_roles",
        "manage_events",
        "view_analytics",
        "manage_billing",
        "access_audit_logs",
        "manage_integrations",
      ],
    },
    {
      name: "Organizer",
      color: "purple",
      permissions: [
        "manage_events",
        "view_analytics",
        "manage_sessions",
        "manage_speakers",
        "manage_attendees",
        "send_notifications",
      ],
    },
    {
      name: "Moderator",
      color: "blue",
      permissions: [
        "moderate_chat",
        "manage_qa",
        "view_attendees",
        "send_notifications",
        "view_session_analytics",
      ],
    },
    {
      name: "Speaker",
      color: "green",
      permissions: [
        "manage_own_sessions",
        "view_attendee_questions",
        "upload_content",
        "view_session_analytics",
      ],
    },
    {
      name: "Attendee",
      color: "slate",
      permissions: [
        "view_sessions",
        "join_sessions",
        "participate_chat",
        "submit_questions",
        "vote_polls",
      ],
    },
  ];

  const allPermissions = [
    { key: "manage_organization", label: "Manage Organization", icon: Building2 },
    { key: "manage_users", label: "Manage Users", icon: Users },
    { key: "manage_roles", label: "Manage Roles", icon: Key },
    { key: "manage_events", label: "Manage Events", icon: Activity },
    { key: "view_analytics", label: "View Analytics", icon: BarChart3 },
    { key: "manage_billing", label: "Manage Billing", icon: FileCheck },
    { key: "access_audit_logs", label: "Access Audit Logs", icon: BookOpen },
    { key: "manage_integrations", label: "Manage Integrations", icon: GitBranch },
    { key: "manage_sessions", label: "Manage Sessions", icon: Layers },
    { key: "manage_speakers", label: "Manage Speakers", icon: UserCheck },
    { key: "manage_attendees", label: "Manage Attendees", icon: Users },
    { key: "send_notifications", label: "Send Notifications", icon: Zap },
    { key: "moderate_chat", label: "Moderate Chat", icon: Shield },
    { key: "manage_qa", label: "Manage Q&A", icon: Settings },
    { key: "view_attendees", label: "View Attendees", icon: Eye },
    { key: "view_session_analytics", label: "Session Analytics", icon: BarChart3 },
    { key: "manage_own_sessions", label: "Manage Own Sessions", icon: Activity },
    { key: "view_attendee_questions", label: "View Questions", icon: Eye },
    { key: "upload_content", label: "Upload Content", icon: HardDrive },
    { key: "view_sessions", label: "View Sessions", icon: Eye },
    { key: "join_sessions", label: "Join Sessions", icon: UserCheck },
    { key: "participate_chat", label: "Participate in Chat", icon: Activity },
    { key: "submit_questions", label: "Submit Questions", icon: Activity },
    { key: "vote_polls", label: "Vote in Polls", icon: CheckCircle },
  ];

  const currentRole = roles.find(
    (r) => r.name.toLowerCase().replace(" ", "_") === selectedRole
  ) || roles[1];

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Role-Based Access Control</h3>
          <p className="text-purple-400 text-sm">Granular permission management</p>
        </div>
      </div>

      {/* Role Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {roles.map((role) => (
          <button
            key={role.name}
            onClick={() =>
              setSelectedRole(role.name.toLowerCase().replace(" ", "_"))
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentRole.name === role.name
                ? `bg-${role.color}-500 text-white`
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {role.name}
          </button>
        ))}
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {allPermissions.slice(0, 12).map((perm) => {
          const hasPermission = currentRole.permissions.includes(perm.key);
          const IconComponent = perm.icon;

          return (
            <motion.div
              key={perm.key}
              initial={{ opacity: 0.5 }}
              animate={{
                opacity: hasPermission ? 1 : 0.3,
                scale: hasPermission ? 1 : 0.98,
              }}
              className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
                hasPermission
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-slate-800/50 border border-slate-700/30"
              }`}
            >
              {hasPermission ? (
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${hasPermission ? "text-slate-300" : "text-slate-600"}`}
              >
                {perm.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-slate-500 bg-slate-800/30 rounded-lg p-3">
        <span className="text-purple-400 font-medium">{currentRole.name}:</span>{" "}
        {currentRole.permissions.length} permissions granted. Create custom roles
        with any combination of 50+ granular permissions.
      </div>
    </div>
  );
}

// ============================================================================
// SECURITY FEATURES DEMO
// ============================================================================

function SecurityDemo() {
  const [showToken, setShowToken] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);

  const securityFeatures = [
    { label: "JWT Authentication", status: "active", icon: Key },
    { label: "2FA/MFA", status: mfaEnabled ? "enabled" : "disabled", icon: Fingerprint },
    { label: "Session Management", status: "active", icon: Clock },
    { label: "IP Allowlisting", status: "configured", icon: Shield },
    { label: "Rate Limiting", status: "active", icon: Activity },
    { label: "CORS Policies", status: "strict", icon: Globe },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Enterprise Security</h3>
          <p className="text-cyan-400 text-sm">Multi-layered protection</p>
        </div>
      </div>

      {/* Security Status Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {securityFeatures.map((feature) => {
          const IconComponent = feature.icon;
          const isActive =
            feature.status === "active" ||
            feature.status === "enabled" ||
            feature.status === "configured" ||
            feature.status === "strict";

          return (
            <div
              key={feature.label}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 text-sm">{feature.label}</span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {feature.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Token Preview */}
      <div className="bg-slate-800/30 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">JWT Token</span>
          <button
            onClick={() => setShowToken(!showToken)}
            className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1"
          >
            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showToken ? "Hide" : "Show"}
          </button>
        </div>
        <div className="font-mono text-xs text-slate-500 break-all bg-slate-900/50 p-3 rounded-lg">
          {showToken
            ? "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMzQ1Iiwib3JnIjoib3JnX2FiY2RlIiwicm9sZSI6Im9yZ2FuaXplciIsImlhdCI6MTcwOTEyMzQ1NiwiZXhwIjoxNzA5MTI3MDU2fQ.signature"
            : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
        </div>
      </div>

      {/* MFA Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
        <div>
          <div className="text-white font-medium">Two-Factor Authentication</div>
          <div className="text-slate-400 text-sm">
            Require 2FA for all admin accounts
          </div>
        </div>
        <button
          onClick={() => setMfaEnabled(!mfaEnabled)}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            mfaEnabled ? "bg-cyan-500" : "bg-slate-700"
          }`}
        >
          <motion.div
            animate={{ x: mfaEnabled ? 28 : 4 }}
            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
          />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// AUDIT LOG DEMO
// ============================================================================

function AuditLogDemo() {
  const [filter, setFilter] = useState<"all" | "security" | "admin" | "user">("all");

  const auditLogs = [
    {
      id: 1,
      action: "user.login",
      actor: "john.doe@company.com",
      type: "security",
      ip: "192.168.1.100",
      time: "2 minutes ago",
      details: "Successful login with 2FA",
    },
    {
      id: 2,
      action: "role.updated",
      actor: "admin@company.com",
      type: "admin",
      ip: "10.0.0.50",
      time: "15 minutes ago",
      details: "Changed permissions for Moderator role",
    },
    {
      id: 3,
      action: "event.created",
      actor: "organizer@company.com",
      type: "user",
      ip: "172.16.0.25",
      time: "1 hour ago",
      details: "Created event: Annual Conference 2026",
    },
    {
      id: 4,
      action: "user.mfa_enabled",
      actor: "sarah.smith@company.com",
      type: "security",
      ip: "192.168.1.105",
      time: "2 hours ago",
      details: "Enabled two-factor authentication",
    },
    {
      id: 5,
      action: "api.key_generated",
      actor: "developer@company.com",
      type: "admin",
      ip: "10.0.0.75",
      time: "3 hours ago",
      details: "Generated new API key for integration",
    },
  ];

  const filteredLogs =
    filter === "all"
      ? auditLogs
      : auditLogs.filter((log) => log.type === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "security":
        return "text-red-400 bg-red-500/20";
      case "admin":
        return "text-purple-400 bg-purple-500/20";
      case "user":
        return "text-blue-400 bg-blue-500/20";
      default:
        return "text-slate-400 bg-slate-500/20";
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Audit Logging</h3>
            <p className="text-amber-400 text-sm">Complete activity tracking</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "security", "admin", "user"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? "bg-amber-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Log Entries */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-slate-800/50 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(log.type)}`}
                  >
                    {log.type}
                  </span>
                  <code className="text-cyan-400 text-sm">{log.action}</code>
                </div>
                <span className="text-slate-500 text-xs">{log.time}</span>
              </div>
              <div className="text-slate-400 text-sm mb-1">{log.details}</div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Actor: {log.actor}</span>
                <span>IP: {log.ip}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        Logs retained for 7 years. Export to SIEM systems available.
      </div>
    </div>
  );
}

// ============================================================================
// INFRASTRUCTURE DIAGRAM
// ============================================================================

function InfrastructureDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const layers = [
    {
      name: "Edge Layer",
      icon: Globe,
      color: "cyan",
      items: ["Global CDN", "DDoS Protection", "WAF", "SSL/TLS"],
    },
    {
      name: "API Gateway",
      icon: Network,
      color: "purple",
      items: ["Rate Limiting", "Auth Middleware", "Request Validation", "Load Balancing"],
    },
    {
      name: "Application",
      icon: Server,
      color: "blue",
      items: ["GraphQL Federation", "WebSocket Servers", "Worker Queues", "Cache Layer"],
    },
    {
      name: "Data Layer",
      icon: Database,
      color: "green",
      items: ["PostgreSQL Cluster", "Redis Cluster", "S3 Storage", "Backup Systems"],
    },
  ];

  return (
    <div ref={ref} className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {layers.map((layer, idx) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            className="relative"
          >
            <div
              className={`bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-${layer.color}-500/30 p-5 h-full`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${layer.color}-500 to-${layer.color}-600 flex items-center justify-center`}
                >
                  <layer.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Layer {idx + 1}</div>
                  <div className="text-white font-semibold">{layer.name}</div>
                </div>
              </div>

              <div className="space-y-2">
                {layer.items.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: idx * 0.15 + i * 0.05 + 0.3 }}
                    className="flex items-center gap-2 text-sm text-slate-400"
                  >
                    <ChevronRight className={`w-3 h-3 text-${layer.color}-400`} />
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPLIANCE BADGES
// ============================================================================

function ComplianceBadges() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const certifications = [
    {
      name: "SOC 2 Type II",
      description: "Security, availability, and confidentiality controls",
      icon: ShieldCheck,
      color: "cyan",
    },
    {
      name: "GDPR",
      description: "EU data protection regulation compliance",
      icon: Scale,
      color: "purple",
    },
    {
      name: "CCPA",
      description: "California Consumer Privacy Act compliance",
      icon: FileCheck,
      color: "blue",
    },
    {
      name: "ISO 27001",
      description: "Information security management standard",
      icon: Shield,
      color: "green",
    },
    {
      name: "HIPAA",
      description: "Healthcare data protection ready",
      icon: Lock,
      color: "red",
    },
    {
      name: "PCI DSS",
      description: "Payment card industry security standard",
      icon: Key,
      color: "amber",
    },
  ];

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {certifications.map((cert) => (
        <motion.div
          key={cert.name}
          variants={fadeInUp}
          className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 text-center hover:border-cyan-500/50 transition-all"
        >
          <div
            className={`w-12 h-12 rounded-xl bg-${cert.color}-500/20 flex items-center justify-center mx-auto mb-3`}
          >
            <cert.icon className={`w-6 h-6 text-${cert.color}-400`} />
          </div>
          <div className="text-white font-semibold text-sm mb-1">{cert.name}</div>
          <div className="text-slate-500 text-xs">{cert.description}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// FEATURES GRID
// ============================================================================

const enterpriseFeatures = [
  {
    icon: Key,
    title: "Role-Based Access Control",
    description:
      "50+ granular permissions with custom roles. Control exactly who can access what across your organization.",
    color: "purple",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "JWT authentication, 2FA/MFA, SSO integration, IP allowlisting, and comprehensive session management.",
    color: "cyan",
  },
  {
    icon: BookOpen,
    title: "Audit Logging",
    description:
      "Complete activity tracking with 7-year retention. Export to SIEM systems for compliance reporting.",
    color: "amber",
  },
  {
    icon: Building2,
    title: "Multi-Tenancy",
    description:
      "Isolated data per organization with tenant-specific configurations and white-label capabilities.",
    color: "blue",
  },
  {
    icon: Globe,
    title: "Global Infrastructure",
    description:
      "Multi-region deployment with automatic failover, 99.99% uptime SLA, and edge caching.",
    color: "green",
  },
  {
    icon: GitBranch,
    title: "GraphQL Federation",
    description:
      "Unified API layer with Apollo Federation. Modular architecture for seamless integrations.",
    color: "pink",
  },
  {
    icon: Network,
    title: "WebSocket Infrastructure",
    description:
      "Real-time communication with Socket.io, Redis pub/sub, and horizontal scaling support.",
    color: "indigo",
  },
  {
    icon: Workflow,
    title: "Custom Integrations",
    description:
      "REST and GraphQL APIs, webhooks, and pre-built connectors for popular enterprise tools.",
    color: "red",
  },
];

function FeaturesGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {enterpriseFeatures.map((feature) => (
        <motion.div
          key={feature.title}
          variants={fadeInUp}
          className="group bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-cyan-500/50 transition-all duration-300"
        >
          <div
            className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
          >
            <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
          </div>
          <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

function PerformanceMetrics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const metrics = [
    { label: "Uptime SLA", value: "99.99%", icon: Activity },
    { label: "API Response", value: "<50ms", icon: Zap },
    { label: "Concurrent Users", value: "100K+", icon: Users },
    { label: "Data Centers", value: "12", icon: Server },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {metrics.map((metric, idx) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/20 p-6 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <metric.icon className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
          <div className="text-slate-400 text-sm">{metric.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// ENTERPRISE PRICING COMPARISON
// ============================================================================

function EnterprisePricingComparison() {
  const features = [
    { name: "Users", standard: "100", enterprise: "Unlimited" },
    { name: "Events per year", standard: "50", enterprise: "Unlimited" },
    { name: "Storage", standard: "100 GB", enterprise: "Unlimited" },
    { name: "Custom roles", standard: "5", enterprise: "Unlimited" },
    { name: "API access", standard: "Limited", enterprise: "Full access" },
    { name: "SSO/SAML", standard: "No", enterprise: "Yes" },
    { name: "Audit logs", standard: "30 days", enterprise: "7 years" },
    { name: "Support", standard: "Email", enterprise: "24/7 dedicated" },
    { name: "SLA", standard: "99.9%", enterprise: "99.99%" },
    { name: "Custom integrations", standard: "No", enterprise: "Yes" },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-700/50">
        <div className="p-4 text-slate-400 font-medium">Feature</div>
        <div className="p-4 text-center text-slate-400 font-medium border-x border-slate-700/50">
          Standard
        </div>
        <div className="p-4 text-center bg-purple-500/10">
          <span className="text-purple-400 font-semibold">Enterprise</span>
        </div>
      </div>
      {features.map((feature, idx) => (
        <div
          key={feature.name}
          className={`grid grid-cols-1 sm:grid-cols-3 ${idx < features.length - 1 ? "border-b border-slate-700/50" : ""}`}
        >
          <div className="p-4 text-slate-300">{feature.name}</div>
          <div className="p-4 text-center text-slate-400 border-x border-slate-700/50">
            {feature.standard}
          </div>
          <div className="p-4 text-center bg-purple-500/5">
            <span className="text-purple-300 font-medium">
              {feature.enterprise}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function EnterprisePage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source
              src="/Futuristic_Network_Visualization_Video.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/80 to-slate-950" />
        </div>

        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium mb-8"
            >
              <Building2 className="w-4 h-4" />
              Enterprise Grade
              <Shield className="w-4 h-4" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Enterprise</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                Suite
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Built for organizations that demand the highest standards of security,
              compliance, and scalability. Your events, protected and empowered.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
              >
                Contact Sales
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 backdrop-blur border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-700/50 transition-all"
              >
                Request Demo
              </Link>
            </div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: "99.99%", label: "Uptime SLA" },
              { value: "50+", label: "Permissions" },
              { value: "SOC 2", label: "Certified" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ height: ["0%", "30%", "0%"] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 bg-purple-400 rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Interactive Demos Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Security & Access{" "}
              <span className="text-purple-400">Control</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Experience enterprise-grade security features designed to protect
              your organization and give you complete control.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <RBACDemo />
            <SecurityDemo />
          </div>

          <div className="max-w-3xl mx-auto">
            <AuditLogDemo />
          </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise Infrastructure
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Multi-layered architecture designed for reliability, security, and
              global scale.
            </p>
          </motion.div>

          <InfrastructureDiagram />
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Meet your regulatory requirements with our comprehensive compliance
              framework.
            </p>
          </motion.div>

          <ComplianceBadges />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise Features
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to run secure, scalable events at any scale.
            </p>
          </motion.div>

          <FeaturesGrid />
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Performance at Scale
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Built to handle the most demanding enterprise requirements.
            </p>
          </motion.div>

          <PerformanceMetrics />
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Enterprise vs Standard
              </h2>
              <p className="text-slate-400 mb-8">
                See how Enterprise unlocks the full potential of your event
                management capabilities.
              </p>

              <div className="space-y-4">
                {[
                  "Unlimited users and events",
                  "Advanced security with SSO/SAML",
                  "7-year audit log retention",
                  "24/7 dedicated support team",
                  "Custom integrations and API access",
                ].map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <EnterprisePricingComparison />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-3xl border border-purple-500/30 p-12"
          >
            <Building2 className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready for Enterprise-Grade Events?
            </h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Join leading organizations that trust our Enterprise Suite for their
              most critical events. Custom pricing available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
              >
                Talk to Sales
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-700/50 transition-all"
              >
                View All Plans
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
