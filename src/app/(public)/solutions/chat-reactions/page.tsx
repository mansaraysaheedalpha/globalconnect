// src/app/(public)/solutions/chat-reactions/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  MessageSquare,
  Heart,
  ThumbsUp,
  Smile,
  Users,
  Zap,
  BarChart3,
  HelpCircle,
  CheckCircle,
  ChevronRight,
  Send,
  ArrowUp,
  Shield,
  Clock,
  TrendingUp,
  Star,
  Trophy,
  Sparkles,
  MessageCircle,
  Vote,
  Hand,
  Flame,
  PartyPopper,
  Laugh,
  Frown,
  AlertCircle,
  Eye,
  Lock,
  Settings,
  Wifi,
  Filter,
  Award,
  Target,
  Radio,
  Activity,
  Crown,
  Medal,
  RefreshCw,
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// ============================================================================
// FLOATING EMOJI REACTIONS - Live reaction visualization
// ============================================================================
function FloatingEmojiReactions() {
  const [emojis, setEmojis] = useState<
    { id: number; emoji: string; x: number; size: number; duration: number }[]
  >([]);

  const emojiSet = [
    "❤️",
    "🔥",
    "👏",
    "🎉",
    "💯",
    "👍",
    "😍",
    "🚀",
    "⭐",
    "💪",
    "🙌",
    "✨",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const newEmoji = {
        id: Date.now() + Math.random(),
        emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)],
        x: Math.random() * 80 + 10,
        size: Math.random() * 1 + 1.5,
        duration: Math.random() * 1 + 2,
      };
      setEmojis((prev) => [...prev.slice(-15), newEmoji]);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {emojis.map((emoji) => (
          <motion.div
            key={emoji.id}
            initial={{ opacity: 0, y: "100%", scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: "-100%",
              scale: emoji.size,
              x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: emoji.duration, ease: "easeOut" }}
            style={{ left: `${emoji.x}%` }}
            className="absolute bottom-0 text-2xl"
          >
            {emoji.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// LIVE CHAT DEMO PANEL
// ============================================================================
function LiveChatDemo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: "Sarah M.",
      avatar: "SM",
      text: "This keynote is incredible! 🔥",
      time: "2m ago",
      reactions: { "❤️": 12, "🔥": 8 },
    },
    {
      id: 2,
      author: "James K.",
      avatar: "JK",
      text: "Can someone share the link to the resources mentioned?",
      time: "1m ago",
      reactions: { "👍": 5 },
    },
    {
      id: 3,
      author: "Elena R.",
      avatar: "ER",
      text: "The AI demo was mind-blowing! Looking forward to the Q&A",
      time: "30s ago",
      reactions: { "🎉": 15, "💯": 7 },
    },
  ]);

  const [typingIndicator, setTypingIndicator] = useState(false);

  useEffect(() => {
    const newMessages = [
      {
        author: "Michael T.",
        avatar: "MT",
        text: "Great point about scalability! 👏",
        reactions: { "👏": 3 },
      },
      {
        author: "Lisa P.",
        avatar: "LP",
        text: "This is exactly what we needed for our hybrid events!",
        reactions: { "❤️": 6, "🚀": 4 },
      },
      {
        author: "David W.",
        avatar: "DW",
        text: "The engagement metrics are impressive 📊",
        reactions: { "💯": 8 },
      },
    ];

    let index = 0;
    const interval = setInterval(() => {
      setTypingIndicator(true);
      setTimeout(() => {
        setTypingIndicator(false);
        setMessages((prev) => [
          ...prev.slice(-3),
          { ...newMessages[index % newMessages.length], id: Date.now(), time: "Just now" },
        ]);
        index++;
      }, 1500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border bg-card overflow-hidden shadow-xl"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold">Session Chat</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              247 participants
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          32 msgs/min
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 h-[280px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {msg.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{msg.author}</span>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{msg.text}</p>
                <div className="flex gap-1.5 mt-1.5">
                  {Object.entries(msg.reactions).map(([emoji, count]) => (
                    <motion.span
                      key={emoji}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-xs"
                    >
                      {emoji} {count}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typingIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              Someone is typing...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Join the conversation..."
            className="flex-1 px-3 py-2 rounded-xl bg-background border text-sm"
            readOnly
          />
          <button className="p-2 rounded-xl bg-emerald-500 text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// LIVE POLL DEMO
// ============================================================================
function LivePollDemo() {
  const [votes, setVotes] = useState({ a: 42, b: 31, c: 18, d: 9 });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const total = Object.values(votes).reduce((a, b) => a + b, 0);

  const options = [
    { key: "a", label: "AI & Machine Learning", color: "from-purple-500 to-violet-500" },
    { key: "b", label: "Cloud Architecture", color: "from-blue-500 to-cyan-500" },
    { key: "c", label: "DevOps & Automation", color: "from-amber-500 to-orange-500" },
    { key: "d", label: "Cybersecurity", color: "from-red-500 to-pink-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const keys = ["a", "b", "c", "d"] as const;
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setVotes((prev) => ({ ...prev, [randomKey]: prev[randomKey] + 1 }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = (key: string) => {
    if (!hasVoted) {
      setSelectedOption(key);
      setVotes((prev) => ({ ...prev, [key]: prev[key as keyof typeof prev] + 1 }));
      setHasVoted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative rounded-2xl border bg-card overflow-hidden shadow-xl"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold">Live Poll</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              Active now
            </div>
          </div>
        </div>
        <motion.div
          key={total}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-sm font-bold text-purple-500"
        >
          {total} votes
        </motion.div>
      </div>

      {/* Question */}
      <div className="px-4 pt-4 pb-2">
        <h4 className="font-semibold text-sm mb-1">What topic interests you most?</h4>
        <p className="text-xs text-muted-foreground">
          Select one option to see live results
        </p>
      </div>

      {/* Options */}
      <div className="p-4 space-y-2">
        {options.map((option) => {
          const percentage = Math.round(
            (votes[option.key as keyof typeof votes] / total) * 100
          );
          return (
            <motion.button
              key={option.key}
              onClick={() => handleVote(option.key)}
              className={cn(
                "w-full relative rounded-xl border p-3 text-left transition-all overflow-hidden",
                selectedOption === option.key
                  ? "border-purple-500 bg-purple-500/5"
                  : "hover:border-purple-500/50 hover:bg-muted/50"
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={hasVoted}
            >
              {/* Progress bar */}
              <motion.div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r opacity-20",
                  option.color
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedOption === option.key && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center"
                    >
                      <CheckCircle className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                <motion.span
                  key={percentage}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-bold"
                >
                  {percentage}%
                </motion.span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          Results update in real-time as votes come in
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// LIVE Q&A DEMO
// ============================================================================
function LiveQADemo() {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      author: "Alex C.",
      text: "How does the AI detect engagement drops in real-time?",
      upvotes: 47,
      answered: true,
    },
    {
      id: 2,
      author: "Maria S.",
      text: "Can we integrate this with our existing CRM systems?",
      upvotes: 32,
      answered: false,
    },
    {
      id: 3,
      author: "John D.",
      text: "What's the maximum number of concurrent participants supported?",
      upvotes: 28,
      answered: false,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuestions((prev) =>
        prev.map((q) => ({
          ...q,
          upvotes: q.upvotes + (Math.random() > 0.7 ? 1 : 0),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative rounded-2xl border bg-card overflow-hidden shadow-xl"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold">Q&A Session</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              Moderated
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Sorted by popular
        </div>
      </div>

      {/* Questions */}
      <div className="p-4 space-y-3 h-[280px] overflow-hidden">
        {questions
          .sort((a, b) => b.upvotes - a.upvotes)
          .map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex gap-3 p-3 rounded-xl border",
                q.answered ? "bg-green-500/5 border-green-500/20" : "bg-muted/30"
              )}
            >
              <motion.button
                className="flex flex-col items-center gap-1 shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowUp className="h-4 w-4 text-amber-500" />
                <motion.span
                  key={q.upvotes}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-bold text-amber-500"
                >
                  {q.upvotes}
                </motion.span>
              </motion.button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{q.author}</span>
                  {q.answered && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-medium">
                      <CheckCircle className="h-2.5 w-2.5" />
                      Answered
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {q.text}
                </p>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 rounded-xl bg-background border text-sm"
            readOnly
          />
          <button className="p-2 rounded-xl bg-amber-500 text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// REACTION BAR DEMO
// ============================================================================
function ReactionBarDemo() {
  const [reactionCounts, setReactionCounts] = useState({
    "❤️": 0,
    "🔥": 0,
    "👏": 0,
    "🎉": 0,
    "💯": 0,
    "🚀": 0,
  });

  const [bursts, setBursts] = useState<
    { id: number; emoji: string; x: number; y: number }[]
  >([]);

  const handleReaction = (emoji: string) => {
    setReactionCounts((prev) => ({ ...prev, [emoji]: prev[emoji as keyof typeof prev] + 1 }));

    // Create burst effect
    const newBurst = {
      id: Date.now(),
      emoji,
      x: Math.random() * 60 + 20,
      y: Math.random() * 40 + 30,
    };
    setBursts((prev) => [...prev, newBurst]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== newBurst.id));
    }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const emojis = Object.keys(reactionCounts);
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      handleReaction(randomEmoji);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Floating bursts */}
      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.div
            key={burst.id}
            initial={{ opacity: 1, scale: 1, y: 0 }}
            animate={{ opacity: 0, scale: 2, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
            className="absolute text-3xl pointer-events-none"
          >
            {burst.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Reaction buttons */}
      <div className="flex flex-wrap justify-center gap-3 p-4 rounded-2xl bg-card/80 backdrop-blur-sm border">
        {Object.entries(reactionCounts).map(([emoji, count]) => (
          <motion.button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="relative flex flex-col items-center gap-1 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-2xl">{emoji}</span>
            <motion.span
              key={count}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-xs font-bold text-muted-foreground"
            >
              {count}
            </motion.span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center text-white overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        poster="/placeholder-image.png"
      >
        <source src="/Futuristic_Network_Visualization_Video.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-emerald-900/50 to-black/80 -z-10" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-emerald-500/30 rounded-full blur-[150px]"
          animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-teal-500/25 rounded-full blur-[150px]"
          animate={{ x: [0, -80, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/15 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Floating Emoji Reactions */}
      <FloatingEmojiReactions />

      {/* Content */}
      <div className="container px-4 md:px-6 max-w-6xl relative z-10 py-20">
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-sm font-medium">
            <Radio className="h-4 w-4 text-emerald-400" />
            Real-Time
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 backdrop-blur-sm border border-teal-500/30 text-sm font-medium">
            <Zap className="h-4 w-4 text-teal-400" />
            Interactive
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
            For Attendees
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-tight text-center"
        >
          Transform Passive Viewers Into{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Active Participants
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-neutral-300 leading-relaxed text-center"
        >
          Create electric atmospheres with real-time chat, emoji reactions, interactive
          polls, and moderated Q&A. Keep your audience connected, engaged, and
          participating throughout every session.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-14 px-8 text-lg shadow-lg shadow-emerald-500/25"
            asChild
          >
            <Link href="/contact?demo=live-engagement">
              Book a Demo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 text-lg backdrop-blur-sm"
            asChild
          >
            <Link href="/auth/register">
              <Play className="mr-2 h-5 w-5" />
              Start Free Trial
            </Link>
          </Button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "<50ms", label: "Message Latency" },
            { value: "30+", label: "Reaction Types" },
            { value: "95%", label: "Poll Participation" },
            { value: "∞", label: "Concurrent Users" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-white"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// PROBLEM SECTION
// ============================================================================
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const disconnectionStats = [
    { icon: Users, value: "68%", label: "of virtual attendees multitask during sessions" },
    { icon: Clock, value: "10 min", label: "average attention span before disengagement" },
    { icon: TrendingUp, value: "3x", label: "higher drop-off in non-interactive events" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-red-950/5 to-muted/30 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-500/8 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-[150px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.4, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 rounded-full border border-red-500/20"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(239, 68, 68, 0)",
                "0 0 0 8px rgba(239, 68, 68, 0.1)",
                "0 0 0 0 rgba(239, 68, 68, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            The Problem
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            The{" "}
            <span className="relative">
              <span className="text-red-500">Silent Audience</span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>{" "}
            Syndrome
          </h2>
          <p className="text-lg text-muted-foreground">
            Without real-time interaction, virtual and hybrid events feel like watching
            a video alone. Attendees become passive spectators instead of active
            participants—and they quickly lose interest.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {disconnectionStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              className="relative p-6 rounded-2xl border border-red-500/20 bg-card/50 backdrop-blur-sm text-center"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
              />
              <stat.icon className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-red-500 mb-2">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pain Points */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border border-red-500/20">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Common symptoms of disengaged events:
            </h3>
            <ul className="space-y-3">
              {[
                "One-way broadcasts that feel like pre-recorded videos",
                "Attendees leave cameras off and mentally check out",
                "Questions go unanswered because no one sees them",
                "No way to gauge audience sentiment in real-time",
                "Speakers can't tell if their content is resonating",
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <Frown className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SOLUTION SECTION - Four Pillars
// ============================================================================
function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const pillars = [
    {
      icon: MessageSquare,
      title: "Real-Time Chat",
      description:
        "Threaded conversations that let attendees discuss, share insights, and connect—all without disrupting the session.",
      color: "from-emerald-500 to-teal-500",
      features: ["Message threading", "Rich media sharing", "Reactions on messages"],
    },
    {
      icon: Heart,
      title: "Emoji Reactions",
      description:
        "Express emotions instantly with 30+ floating reactions that create a visible wave of audience sentiment.",
      color: "from-pink-500 to-rose-500",
      features: ["30+ emoji options", "Real-time visualization", "Sentiment analytics"],
    },
    {
      icon: BarChart3,
      title: "Interactive Polls",
      description:
        "Launch polls in seconds and watch live results stream in. Perfect for decisions, feedback, and keeping attention.",
      color: "from-purple-500 to-violet-500",
      features: ["Multiple choice & quiz", "Live results display", "Giveaway integration"],
    },
    {
      icon: HelpCircle,
      title: "Moderated Q&A",
      description:
        "Crowdsource the best questions through upvoting. Moderate submissions to keep discussions focused and productive.",
      color: "from-amber-500 to-orange-500",
      features: ["Community upvoting", "Moderation queue", "Anonymous option"],
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
            <Sparkles className="h-4 w-4" />
            The Solution
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Four Pillars of{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Live Engagement
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to transform silent viewers into an engaged community
            that actively participates in every moment of your event.
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              variants={fadeInUp}
              className="group relative"
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-3xl blur-lg transition-opacity duration-500"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                }}
              />
              <div className="relative h-full p-6 rounded-2xl border bg-card/80 backdrop-blur-sm hover:border-emerald-500/50 transition-colors">
                <motion.div
                  className={cn(
                    "h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
                    pillar.color
                  )}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <pillar.icon className="h-7 w-7 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {pillar.description}
                </p>

                <ul className="space-y-2">
                  {pillar.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// INTERACTIVE DEMO SECTION
// ============================================================================
function InteractiveDemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
            <Eye className="h-4 w-4" />
            See It In Action
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Experience{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Live Engagement
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            These aren't static mockups—they're live simulations showing exactly how
            your attendees will interact during sessions.
          </p>
        </motion.div>

        {/* Demo Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <LiveChatDemo />
          <LivePollDemo />
          <LiveQADemo />
        </div>

        {/* Reaction Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-4">
            <h3 className="font-semibold mb-1">Try the Reaction Bar</h3>
            <p className="text-sm text-muted-foreground">
              Click any emoji to send a reaction
            </p>
          </div>
          <ReactionBarDemo />
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES DEEP DIVE SECTION
// ============================================================================
function FeaturesDeepDiveSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      category: "Chat Features",
      icon: MessageSquare,
      color: "emerald",
      items: [
        { title: "Message Threading", description: "Keep conversations organized with threaded replies" },
        { title: "5-Minute Edit Window", description: "Fix typos without losing context" },
        { title: "Message Reactions", description: "React to specific messages with emojis" },
        { title: "Rich Media Support", description: "Share links, images, and resources" },
        { title: "Chat History", description: "Access full conversation history anytime" },
      ],
    },
    {
      category: "Poll Features",
      icon: BarChart3,
      color: "purple",
      items: [
        { title: "Multiple Choice", description: "Standard voting with single or multiple selection" },
        { title: "Quiz Mode", description: "Test knowledge with scored questions" },
        { title: "Live Results", description: "Watch votes stream in real-time" },
        { title: "Giveaway Integration", description: "Randomly select winners from participants" },
        { title: "Poll Analytics", description: "Detailed breakdown of responses" },
      ],
    },
    {
      category: "Q&A Features",
      icon: HelpCircle,
      color: "amber",
      items: [
        { title: "Community Upvoting", description: "Best questions rise to the top" },
        { title: "Moderation Queue", description: "Approve questions before display" },
        { title: "Anonymous Mode", description: "Let shy attendees ask freely" },
        { title: "Official Answers", description: "Mark responses from speakers" },
        { title: "Question Tags", description: "Organize by topic or priority" },
      ],
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
            <Settings className="h-4 w-4" />
            Deep Dive
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Powerful Features,{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Zero Complexity
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every feature is designed to work seamlessly out of the box while giving
            you the flexibility to customize for your specific needs.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((category) => (
            <motion.div
              key={category.category}
              variants={fadeInUp}
              className="rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              {/* Category Header */}
              <div
                className={cn(
                  "p-6 border-b",
                  category.color === "emerald" && "bg-emerald-500/5",
                  category.color === "purple" && "bg-purple-500/5",
                  category.color === "amber" && "bg-amber-500/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      category.color === "emerald" && "bg-emerald-500/20 text-emerald-500",
                      category.color === "purple" && "bg-purple-500/20 text-purple-500",
                      category.color === "amber" && "bg-amber-500/20 text-amber-500"
                    )}
                  >
                    <category.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg">{category.category}</h3>
                </div>
              </div>

              {/* Feature Items */}
              <div className="p-4 space-y-3">
                {category.items.map((item) => (
                  <div
                    key={item.title}
                    className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle
                        className={cn(
                          "h-5 w-5 shrink-0 mt-0.5",
                          category.color === "emerald" && "text-emerald-500",
                          category.color === "purple" && "text-purple-500",
                          category.color === "amber" && "text-amber-500"
                        )}
                      />
                      <div>
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </div>
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
// GAMIFICATION INTEGRATION SECTION
// ============================================================================
function GamificationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const pointActions = [
    { action: "Send a chat message", points: "+10", icon: MessageSquare },
    { action: "Ask a question", points: "+20", icon: HelpCircle },
    { action: "Vote in a poll", points: "+10", icon: BarChart3 },
    { action: "Upvote a question", points: "+5", icon: ArrowUp },
    { action: "First to react", points: "+15", icon: Zap },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-amber-950/5 to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
              <Trophy className="h-4 w-4" />
              Gamification Built-In
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Reward Engagement,{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Drive Participation
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Every interaction earns points. Attendees climb leaderboards, unlock
              achievements, and compete for recognition—turning passive viewing into
              an engaging game.
            </p>

            {/* Point Actions */}
            <div className="space-y-3">
              {pointActions.map((item, index) => (
                <motion.div
                  key={item.action}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="text-sm font-medium">{item.action}</span>
                  </div>
                  <span className="text-sm font-bold text-amber-500">{item.points}</span>
                </motion.div>
              ))}
            </div>

            <Button
              className="mt-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              asChild
            >
              <Link href="/solutions/gamification">
                Explore Gamification Engine
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border bg-card/80 backdrop-blur-sm overflow-hidden">
              {/* Leaderboard Header */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <span className="font-bold">Live Leaderboard</span>
                </div>
              </div>

              {/* Leaderboard Items */}
              <div className="p-4 space-y-3">
                {[
                  { rank: 1, name: "Sarah Mitchell", points: 2450, badge: Crown },
                  { rank: 2, name: "James Chen", points: 2180, badge: Medal },
                  { rank: 3, name: "Elena Rodriguez", points: 1950, badge: Award },
                  { rank: 4, name: "Michael Park", points: 1720, badge: Star },
                  { rank: 5, name: "Lisa Thompson", points: 1540, badge: Star },
                ].map((user, index) => (
                  <motion.div
                    key={user.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl",
                      user.rank <= 3 ? "bg-gradient-to-r from-amber-500/10 to-transparent" : "bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center font-bold",
                        user.rank === 1 && "bg-gradient-to-br from-amber-400 to-yellow-500 text-white",
                        user.rank === 2 && "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800",
                        user.rank === 3 && "bg-gradient-to-br from-orange-400 to-amber-600 text-white",
                        user.rank > 3 && "bg-muted text-muted-foreground"
                      )}
                    >
                      {user.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{user.name}</span>
                        <user.badge
                          className={cn(
                            "h-4 w-4",
                            user.rank === 1 && "text-amber-500",
                            user.rank === 2 && "text-slate-400",
                            user.rank === 3 && "text-orange-500",
                            user.rank > 3 && "text-muted-foreground"
                          )}
                        />
                      </div>
                    </div>
                    <motion.span
                      key={user.points}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="font-bold text-amber-500"
                    >
                      {user.points.toLocaleString()}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ENTERPRISE FEATURES SECTION
// ============================================================================
function EnterpriseFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const enterpriseFeatures = [
    {
      icon: Shield,
      title: "Rate Limiting",
      description: "100 messages/min standard, 500 for VIP. Prevent spam while keeping conversations flowing.",
    },
    {
      icon: Filter,
      title: "Smart Moderation",
      description: "Velocity-based alerts detect high-volume Q&A submissions for quick moderator response.",
    },
    {
      icon: Lock,
      title: "Permission Controls",
      description: "Granular controls for who can chat, moderate, create polls, and answer questions.",
    },
    {
      icon: Eye,
      title: "Audit Logging",
      description: "Complete audit trail of all messages, moderations, and administrative actions.",
    },
    {
      icon: Wifi,
      title: "Infinite Scale",
      description: "WebSocket infrastructure handles unlimited concurrent users with <50ms latency.",
    },
    {
      icon: RefreshCw,
      title: "Message Idempotency",
      description: "Duplicate detection prevents message spam from network retries.",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-full border border-slate-500/20">
            <Shield className="h-4 w-4" />
            Enterprise Ready
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent">
              Scale & Security
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The same infrastructure that powers major virtual events, built with
            enterprise-grade security and reliability from day one.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {enterpriseFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:border-slate-500/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-500/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
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
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Floating reactions background */}
      <FloatingEmojiReactions />

      <div className="container mx-auto px-4 md:px-6 relative z-10" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-8"
          >
            <Sparkles className="h-10 w-10" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Electrify Your Events?
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of event organizers who've transformed passive audiences
            into engaged communities with Live Engagement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-white/90 h-14 px-8 text-lg shadow-xl shadow-black/20"
              asChild
            >
              <Link href="/contact?demo=live-engagement">
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 text-lg backdrop-blur-sm"
              asChild
            >
              <Link href="/auth/register">
                <Play className="mr-2 h-5 w-5" />
                Start Free Trial
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60"
          >
            {[
              { value: "10K+", label: "Events Powered" },
              { value: "5M+", label: "Messages Sent" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function LiveEngagementPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <InteractiveDemoSection />
      <FeaturesDeepDiveSection />
      <GamificationSection />
      <EnterpriseFeaturesSection />
      <CTASection />
    </main>
  );
}
