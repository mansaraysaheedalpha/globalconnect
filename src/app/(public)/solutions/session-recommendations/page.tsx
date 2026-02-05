// src/app/(public)/solutions/session-recommendations/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Brain,
  User,
  Users,
  Star,
  Heart,
  MessageCircle,
  Calendar,
  Clock,
  Target,
  Zap,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Compass,
  Lightbulb,
  Trophy,
  Briefcase,
  GraduationCap,
  Network,
  Shuffle,
  ThumbsUp,
  ArrowUpRight,
  Play,
  Shield,
  Globe,
  Cpu,
  Database,
  RefreshCw,
  ChevronRight,
  Linkedin,
  Github,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// ============================================================================
// AI RECOMMENDATION CARD PREVIEW
// ============================================================================
function RecommendationCardPreview() {
  const [matchScore, setMatchScore] = useState(92);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMatchScore(prev => Math.floor(88 + Math.random() * 10));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const recommendations = [
    {
      name: "Sarah Chen",
      role: "AI Research Lead",
      company: "TechCorp",
      score: matchScore,
      avatar: "SC",
      reasons: [
        "Both interested in machine learning applications",
        "Complementary goals: hiring/seeking opportunities",
        "Same industry: Technology",
      ],
      starters: [
        "I noticed we're both into ML - what projects are you working on?",
        "I'd love to hear about AI research at TechCorp.",
      ],
    },
  ];

  const rec = recommendations[0];

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000">
      {/* Premium glow effect */}
      <motion.div
        className="absolute -inset-8 rounded-3xl opacity-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Main Card */}
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        initial={{ rotateX: 5, rotateY: -5 }}
        animate={{ rotateX: 0, rotateY: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-pink-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">AI Recommendation</span>
          </div>
          <motion.div
            className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Just for you
          </motion.div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          {/* User Info Row */}
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-semibold shrink-0">
              {rec.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-gray-900 truncate">{rec.name}</h4>
                <motion.div
                  key={rec.score}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                    rec.score >= 90 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}
                >
                  {rec.score}% match
                </motion.div>
              </div>
              <p className="text-sm text-gray-500">
                {rec.role} at {rec.company}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                <Github className="h-3.5 w-3.5 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Why Connect */}
          <div className="mt-3 p-2.5 bg-gradient-to-r from-violet-50 to-pink-50 rounded-lg border border-violet-100">
            <p className="text-sm">
              <span className="font-medium text-violet-700">Why connect:</span>{" "}
              <span className="text-gray-700">{rec.reasons[0]}</span>
            </p>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Additional Reasons */}
                <div className="mt-2 space-y-1.5">
                  {rec.reasons.slice(1).map((reason, i) => (
                    <p key={i} className="text-sm text-gray-600 pl-3 border-l-2 border-violet-200">
                      {reason}
                    </p>
                  ))}
                </div>

                {/* Conversation Starters */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Conversation Starters
                  </p>
                  {rec.starters.map((starter, i) => (
                    <motion.button
                      key={i}
                      className="w-full p-2.5 bg-white border rounded-lg text-sm text-left hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <span className="flex items-start gap-2">
                        <Send className="h-3.5 w-3.5 mt-0.5 text-violet-400" />
                        <span className="text-gray-700">"{starter}"</span>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-600 hover:text-violet-600 flex items-center gap-1"
            >
              <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
              {isExpanded ? "Less" : "Why connect"}
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8">
                Ping
              </Button>
              <Button size="sm" className="h-8 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700">
                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                Chat
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stacked cards effect */}
      <div className="absolute -z-10 top-4 left-4 right-4 h-full rounded-2xl bg-violet-100/50 border border-violet-200/50" />
      <div className="absolute -z-20 top-8 left-8 right-8 h-full rounded-2xl bg-pink-100/30 border border-pink-200/30" />
    </div>
  );
}

// ============================================================================
// INFORMATION OVERLOAD VISUALIZATION
// ============================================================================
function InformationOverloadVisualization() {
  const sessions = [
    { name: "AI Workshop", time: "9:00 AM", track: "Tech" },
    { name: "Marketing Talk", time: "9:00 AM", track: "Business" },
    { name: "Design Sprint", time: "9:30 AM", track: "Design" },
    { name: "Sales Keynote", time: "10:00 AM", track: "Business" },
    { name: "Cloud Security", time: "10:00 AM", track: "Tech" },
    { name: "UX Research", time: "10:30 AM", track: "Design" },
    { name: "Data Science", time: "11:00 AM", track: "Tech" },
    { name: "Growth Hacking", time: "11:00 AM", track: "Business" },
  ];

  return (
    <div className="relative h-72 w-full max-w-md mx-auto overflow-hidden">
      {/* Confused attendee */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        animate={{ rotate: [0, -3, 3, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-300">
            <User className="h-8 w-8 text-gray-500" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-[10px] font-bold text-white">?</span>
          </motion.div>
        </div>
        <motion.p
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap font-medium"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Too many choices...
        </motion.p>
      </motion.div>

      {/* Flying session cards */}
      {sessions.map((session, i) => {
        const angle = (i / sessions.length) * 360;
        const radius = 100;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        return (
          <motion.div
            key={session.name}
            className="absolute left-1/2 top-1/2"
            style={{ x: x - 50, y: y - 20 }}
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.02, 0.98, 1],
            }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.2 }}
          >
            <div className="w-24 p-2 bg-white rounded-lg shadow-md border border-gray-100 text-center">
              <div className="text-[10px] text-gray-400">{session.time}</div>
              <div className="text-xs font-medium text-gray-700 truncate">{session.name}</div>
              <div className="text-[9px] text-violet-500">{session.track}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================================================
// AI PERSONALIZATION FLOW
// ============================================================================
function AIPersonalizationFlow() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { icon: User, label: "Your Profile", color: "violet" },
    { icon: Brain, label: "AI Analysis", color: "pink" },
    { icon: Target, label: "Match Scoring", color: "amber" },
    { icon: Sparkles, label: "Recommendations", color: "emerald" },
  ];

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center relative z-10">
            <motion.div
              className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                step >= i
                  ? s.color === "violet" ? "bg-violet-500 shadow-lg shadow-violet-500/30" :
                    s.color === "pink" ? "bg-pink-500 shadow-lg shadow-pink-500/30" :
                    s.color === "amber" ? "bg-amber-500 shadow-lg shadow-amber-500/30" :
                    "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                  : "bg-gray-200"
              )}
              animate={step === i ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <s.icon className={cn(
                "h-7 w-7 transition-colors",
                step >= i ? "text-white" : "text-gray-400"
              )} />
            </motion.div>
            <span className={cn(
              "text-sm font-medium mt-2 transition-colors",
              step >= i ? "text-gray-900" : "text-gray-400"
            )}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Connecting Lines */}
      <div className="absolute top-8 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-0">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-500"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// FLOATING NOTIFICATION
// ============================================================================
function FloatingRecommendationNotification() {
  const [visible, setVisible] = useState(true);
  const notifications = [
    { icon: Sparkles, text: "New match: 94% compatibility", color: "violet" },
    { icon: Target, text: "Found 5 sessions for your interests", color: "pink" },
    { icon: Users, text: "3 people share your goals nearby", color: "emerald" },
    { icon: Heart, text: "Your schedule has been optimized", color: "amber" },
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % notifications.length);
        setVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const notification = notifications[current];

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-8 right-8 z-50 hidden lg:block"
        >
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm",
            notification.color === "violet" && "bg-violet-500/10 border-violet-500/20",
            notification.color === "pink" && "bg-pink-500/10 border-pink-500/20",
            notification.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20",
            notification.color === "amber" && "bg-amber-500/10 border-amber-500/20"
          )}>
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              notification.color === "violet" && "bg-violet-500",
              notification.color === "pink" && "bg-pink-500",
              notification.color === "emerald" && "bg-emerald-500",
              notification.color === "amber" && "bg-amber-500"
            )}>
              <notification.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-gray-500">AI Insight</div>
              <div className="text-sm font-medium text-gray-900">{notification.text}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-pink-950" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">AI-Powered Personalization</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Your Event,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                Personalized
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
              Never miss relevant content or connections again. Our AI analyzes your profile, interests, and goals to recommend sessions you'll love and people you should meet.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white shadow-lg shadow-violet-500/25" asChild>
                <Link href="/signup">
                  Experience AI Matching
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/demo">
                  <Play className="mr-2 h-4 w-4" />
                  See It In Action
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={fadeInUp} className="mt-10 flex items-center gap-8 justify-center lg:justify-start">
              {[
                { value: "92%", label: "Avg. Match Score" },
                { value: "10", label: "Recs Per Event" },
                { value: "5s", label: "Generation Time" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Recommendation Card Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <RecommendationCardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PROBLEM SECTION
// ============================================================================
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: Shuffle,
      title: "Information Overload",
      description: "100+ sessions, panels, and workshops - where do you even start?",
    },
    {
      icon: Clock,
      title: "Time Wasted",
      description: "Sitting through sessions that aren't relevant to your goals",
    },
    {
      icon: Users,
      title: "Missed Connections",
      description: "Walking past the perfect mentor or partner without knowing",
    },
    {
      icon: X,
      title: "Generic Experience",
      description: "Every attendee gets the same schedule, regardless of interests",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
            <AlertTriangle className="h-4 w-4" />
            The Problem
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Events Are Overwhelming Without Guidance
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
            Large events offer incredible opportunities, but without personalization, attendees miss the content and connections that matter most to them.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Problems List */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="space-y-4"
          >
            {problems.map((problem) => (
              <motion.div
                key={problem.title}
                variants={fadeInUp}
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
              >
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <problem.icon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{problem.title}</h3>
                  <p className="text-sm text-gray-600">{problem.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Chaos Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            <InformationOverloadVisualization />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            How It Works
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI That Understands You
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our recommendation engine uses multiple signals to find perfect matches - not just basic interests, but goals, skills, and potential value exchange.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-16"
        >
          <AIPersonalizationFlow />
        </motion.div>

        {/* Matching Criteria */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              icon: Target,
              title: "Goal Matching",
              description: "Hiring with job seekers, mentors with mentees, buyers with sellers",
              examples: ["Hire ↔ Get Hired", "Mentor ↔ Mentee", "Partner ↔ Partner"],
            },
            {
              icon: Heart,
              title: "Interest Overlap",
              description: "Connect over shared passions and professional interests",
              examples: ["AI/ML", "Sustainability", "Leadership"],
            },
            {
              icon: Lightbulb,
              title: "Skills Exchange",
              description: "Match people who can teach what others want to learn",
              examples: ["Offering ↔ Seeking", "Expert ↔ Learner"],
            },
            {
              icon: Briefcase,
              title: "Industry Context",
              description: "Same industry connections for relevant business discussions",
              examples: ["Tech", "Healthcare", "Finance"],
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.examples.map((ex) => (
                  <span key={ex} className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs">
                    {ex}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES SECTION
// ============================================================================
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Recommendations",
      description: "Our LLM analyzes profiles to find meaningful matches beyond simple filters",
      benefits: ["Match scores with explanations", "Conversation starters included", "Improves with feedback"],
      color: "violet",
    },
    {
      icon: Calendar,
      title: "Session Suggestions",
      description: "Personalized session recommendations based on your interests and goals",
      benefits: ["Conflict detection", "Schedule optimization", "Track-based filtering"],
      color: "pink",
    },
    {
      icon: MessageCircle,
      title: "Conversation Starters",
      description: "AI-generated ice breakers based on shared interests and context",
      benefits: ["Natural opening lines", "Based on common ground", "Easy one-tap sending"],
      color: "emerald",
    },
    {
      icon: RefreshCw,
      title: "Continuous Learning",
      description: "Recommendations improve based on your interactions and feedback",
      benefits: ["Learns preferences", "Adapts in real-time", "Better over time"],
      color: "amber",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI Features
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
            Personalization at Every Level
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-400 max-w-2xl mx-auto">
            From who you meet to what sessions you attend, our AI ensures every aspect of your event experience is tailored to you.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                  feature.color === "violet" && "bg-violet-500/20",
                  feature.color === "pink" && "bg-pink-500/20",
                  feature.color === "emerald" && "bg-emerald-500/20",
                  feature.color === "amber" && "bg-amber-500/20"
                )}>
                  <feature.icon className={cn(
                    "h-6 w-6",
                    feature.color === "violet" && "text-violet-400",
                    feature.color === "pink" && "text-pink-400",
                    feature.color === "emerald" && "text-emerald-400",
                    feature.color === "amber" && "text-amber-400"
                  )} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle className="h-3.5 w-3.5 text-violet-400" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// TECHNICAL SECTION
// ============================================================================
function TechnicalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const techFeatures = [
    {
      icon: Brain,
      title: "LLM-Powered Matching",
      description: "Advanced language models understand context and nuance in profiles",
    },
    {
      icon: Zap,
      title: "Circuit Breaker Pattern",
      description: "Graceful fallbacks ensure recommendations always work",
    },
    {
      icon: Database,
      title: "Redis Caching",
      description: "5-minute cache for instant subsequent lookups",
    },
    {
      icon: Shield,
      title: "Privacy-First",
      description: "No sensitive data in recommendations, GDPR compliant",
    },
    {
      icon: Cpu,
      title: "Fallback Algorithms",
      description: "Heuristic matching when AI is unavailable",
    },
    {
      icon: Globe,
      title: "24-Hour Expiry",
      description: "Fresh recommendations regenerated daily",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-4">
            <Cpu className="h-4 w-4" />
            Under the Hood
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Enterprise-Grade AI Infrastructure
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built with reliability and privacy in mind. Our recommendation system handles millions of users with sub-second response times.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {techFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="p-6 rounded-xl bg-white border border-gray-200 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA SECTION
// ============================================================================
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-violet-600 via-pink-600 to-rose-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
            Make Every Event Personal
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-violet-100 mb-8">
            Stop wandering through events hoping to find relevant content and connections. Let our AI guide you to exactly what you're looking for.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-violet-600 hover:bg-violet-50 shadow-lg" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/contact">
                Talk to Sales
              </Link>
            </Button>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-sm text-violet-200 mt-6">
            AI recommendations included in all plans. No credit card required.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function SessionRecommendationsPage() {
  return (
    <main className="overflow-hidden">
      <FloatingRecommendationNotification />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TechnicalSection />
      <CTASection />
    </main>
  );
}
