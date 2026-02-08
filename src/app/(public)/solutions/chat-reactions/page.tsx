// src/app/(public)/solutions/chat-reactions/page.tsx
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  MessageSquare,
  Heart,
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
  Frown,
  AlertCircle,
  Eye,
  Lock,
  Settings,
  Wifi,
  Filter,
  Award,
  Radio,
  Activity,
  Crown,
  Medal,
  RefreshCw,
  Server,
  Globe,
  Gauge,
  Calendar,
  Rocket,
  Gift,
  Headphones,
  Code,
  Database,
  Monitor,
  Smartphone,
  MousePointer,
  ArrowDown,
  Map,
  Flame,
  Timer,
  Target,
  Flag,
  Lightbulb,
  MessageCircle,
  Video,
  Mic,
  Hand,
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
// GLOBAL ENGAGEMENT CONTEXT - Shared state for interactive demos
// ============================================================================
interface EngagementContextType {
  score: number;
  addPoints: (points: number) => void;
  reactions: number;
  messages: number;
  votes: number;
  questions: number;
}

function useEngagementScore() {
  const [score, setScore] = useState(0);
  const [reactions, setReactions] = useState(0);
  const [messages, setMessages] = useState(0);
  const [votes, setVotes] = useState(0);
  const [questions, setQuestions] = useState(0);

  const addPoints = useCallback((points: number, type?: string) => {
    setScore((prev) => prev + points);
    if (type === "reaction") setReactions((prev) => prev + 1);
    if (type === "message") setMessages((prev) => prev + 1);
    if (type === "vote") setVotes((prev) => prev + 1);
    if (type === "question") setQuestions((prev) => prev + 1);
  }, []);

  return { score, addPoints, reactions, messages, votes, questions };
}

// ============================================================================
// INTERACTIVE FLOATING EMOJI REACTIONS - Now clickable!
// ============================================================================
function InteractiveFloatingReactions({
  onReaction,
}: {
  onReaction?: (emoji: string) => void;
}) {
  const [emojis, setEmojis] = useState<
    { id: number; emoji: string; x: number; size: number; duration: number; isUser?: boolean }[]
  >([]);

  const emojiSet = [
    "❤️", "🔥", "👏", "🎉", "💯", "👍", "😍", "🚀", "⭐", "💪", "🙌", "✨",
  ];

  const addEmoji = useCallback((emoji: string, isUser = false) => {
    const newEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.random() * 80 + 10,
      size: isUser ? 2.5 : Math.random() * 1 + 1.5,
      duration: Math.random() * 1 + 2,
      isUser,
    };
    setEmojis((prev) => [...prev.slice(-20), newEmoji]);
    if (isUser && onReaction) {
      onReaction(emoji);
    }
  }, [onReaction]);

  useEffect(() => {
    const emojis = ["❤️", "🔥", "👏", "🎉", "💯", "👍", "😍", "🚀", "⭐", "💪", "🙌", "✨"];
    const interval = setInterval(() => {
      addEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }, 600);
    return () => clearInterval(interval);
  }, [addEmoji]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Clickable emoji buttons at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20">
        {["❤️", "🔥", "👏", "🎉", "🚀", "💯"].map((emoji) => (
          <motion.button
            key={emoji}
            onClick={() => addEmoji(emoji, true)}
            className="text-2xl p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {/* Floating emojis */}
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
            className={cn(
              "absolute bottom-20 text-2xl pointer-events-none",
              emoji.isUser && "drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            )}
          >
            {emoji.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// LIVE ENGAGEMENT SCORE METER
// ============================================================================
function EngagementScoreMeter({
  score,
  reactions,
  messages,
  votes,
  questions,
}: {
  score: number;
  reactions: number;
  messages: number;
  votes: number;
  questions: number;
}) {
  const level = score < 50 ? "warming" : score < 150 ? "engaged" : score < 300 ? "energized" : "on fire";
  const levelColor = {
    warming: "from-blue-500 to-cyan-500",
    engaged: "from-emerald-500 to-teal-500",
    energized: "from-amber-500 to-orange-500",
    "on fire": "from-red-500 to-pink-500",
  }[level];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block"
    >
      <div className="bg-card/95 backdrop-blur-xl border rounded-2xl p-4 shadow-2xl w-48">
        <div className="text-center mb-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Your Engagement
          </div>
          <motion.div
            key={score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className={cn(
              "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
              levelColor
            )}
          >
            {score}
          </motion.div>
          <div className={cn(
            "text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block bg-gradient-to-r text-white",
            levelColor
          )}>
            {level.toUpperCase()}
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          {[
            { icon: Heart, value: reactions, label: "Reacts" },
            { icon: MessageSquare, value: messages, label: "Chats" },
            { icon: BarChart3, value: votes, label: "Votes" },
            { icon: HelpCircle, value: questions, label: "Q&A" },
          ].map((stat) => (
            <div key={stat.label} className="p-2 rounded-lg bg-muted/50">
              <stat.icon className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
              <motion.div
                key={stat.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-sm font-bold"
              >
                {stat.value}
              </motion.div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-center text-muted-foreground mt-3">
          Interact with demos below to earn points!
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// LIVE CHAT DEMO PANEL - Enhanced with distinct colors
// ============================================================================
interface ChatMessage {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
  reactions: Record<string, number>;
}

function LiveChatDemo({ onInteraction }: { onInteraction?: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
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
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages((prev) => [
        ...prev.slice(-3),
        {
          id: Date.now(),
          author: "You",
          avatar: "YO",
          text: inputValue,
          time: "Just now",
          reactions: {},
        },
      ]);
      setInputValue("");
      onInteraction?.();
    }
  };

  useEffect(() => {
    const newMessages: Omit<ChatMessage, "id" | "time">[] = [
      { author: "Michael T.", avatar: "MT", text: "Great point about scalability! 👏", reactions: { "👏": 3 } },
      { author: "Lisa P.", avatar: "LP", text: "This is exactly what we needed for our hybrid events!", reactions: { "❤️": 6, "🚀": 4 } },
      { author: "David W.", avatar: "DW", text: "The engagement metrics are impressive 📊", reactions: { "💯": 8 } },
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
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 overflow-hidden shadow-xl shadow-emerald-500/10"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              Session Chat
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-500 font-medium">
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              247 participants
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
          <Activity className="h-3.5 w-3.5" />
          32 msgs/min
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 h-[260px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-3"
            >
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                msg.author === "You"
                  ? "bg-gradient-to-br from-purple-400 to-pink-500"
                  : "bg-gradient-to-br from-emerald-400 to-teal-500"
              )}>
                {msg.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{msg.author}</span>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{msg.text}</p>
                {Object.keys(msg.reactions).length > 0 && (
                  <div className="flex gap-1.5 mt-1.5">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <motion.span
                        key={emoji}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-xs border border-emerald-500/20"
                      >
                        {emoji} {count}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

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

      {/* Input - Now functional! */}
      <div className="p-3 border-t border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Try sending a message..."
            className="flex-1 px-3 py-2 rounded-xl bg-background border border-emerald-500/30 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          <motion.button
            onClick={handleSend}
            className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// LIVE POLL DEMO - Enhanced with distinct purple theme
// ============================================================================
function LivePollDemo({ onInteraction }: { onInteraction?: () => void }) {
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
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleVote = (key: string) => {
    if (!hasVoted) {
      setSelectedOption(key);
      setVotes((prev) => ({ ...prev, [key]: prev[key as keyof typeof prev] + 1 }));
      setHasVoted(true);
      onInteraction?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-violet-500/5 overflow-hidden shadow-xl shadow-purple-500/10"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              Live Poll
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-500/20 text-purple-500 font-medium">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-purple-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              Voting open
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
          {hasVoted ? "Thanks for voting! Watch results update live." : "Click to vote and see real-time results"}
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
                "w-full relative rounded-xl border-2 p-3 text-left transition-all overflow-hidden",
                selectedOption === option.key
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/5"
              )}
              whileHover={{ scale: hasVoted ? 1 : 1.01 }}
              whileTap={{ scale: hasVoted ? 1 : 0.99 }}
              disabled={hasVoted}
            >
              <motion.div
                className={cn("absolute inset-0 bg-gradient-to-r opacity-20", option.color)}
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
                      className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center"
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
                  className="text-sm font-bold text-purple-500"
                >
                  {percentage}%
                </motion.span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================================
// LIVE Q&A DEMO - Enhanced with distinct amber theme
// ============================================================================
function LiveQADemo({ onInteraction }: { onInteraction?: () => void }) {
  const [questions, setQuestions] = useState([
    { id: 1, author: "Alex C.", text: "How does the AI detect engagement drops in real-time?", upvotes: 47, answered: true },
    { id: 2, author: "Maria S.", text: "Can we integrate this with our existing CRM systems?", upvotes: 32, answered: false },
    { id: 3, author: "John D.", text: "What is the maximum number of concurrent participants supported?", upvotes: 28, answered: false },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleUpvote = (id: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q))
    );
    onInteraction?.();
  };

  const handleAsk = () => {
    if (inputValue.trim()) {
      setQuestions((prev) => [
        ...prev,
        { id: Date.now(), author: "You", text: inputValue, upvotes: 1, answered: false },
      ]);
      setInputValue("");
      onInteraction?.();
    }
  };

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
      className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 overflow-hidden shadow-xl shadow-amber-500/10"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              Q&A Session
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                MODERATED
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Sorted by popular
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="p-4 space-y-3 h-[260px] overflow-hidden">
        {questions
          .sort((a, b) => b.upvotes - a.upvotes)
          .slice(0, 3)
          .map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex gap-3 p-3 rounded-xl border-2",
                q.answered
                  ? "bg-green-500/5 border-green-500/30"
                  : "bg-amber-500/5 border-amber-500/20"
              )}
            >
              <motion.button
                onClick={() => handleUpvote(q.id)}
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
                <p className="text-sm text-muted-foreground line-clamp-2">{q.text}</p>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Input - Now functional! */}
      <div className="p-3 border-t border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Try asking a question..."
            className="flex-1 px-3 py-2 rounded-xl bg-background border border-amber-500/30 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
          <motion.button
            onClick={handleAsk}
            className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// ANIMATED LEADERBOARD - With position changes
// ============================================================================
function AnimatedLeaderboard() {
  const [users, setUsers] = useState([
    { id: 1, name: "Sarah Mitchell", points: 2450, badge: Crown },
    { id: 2, name: "James Chen", points: 2180, badge: Medal },
    { id: 3, name: "Elena Rodriguez", points: 1950, badge: Award },
    { id: 4, name: "Michael Park", points: 1720, badge: Star },
    { id: 5, name: "Lisa Thompson", points: 1540, badge: Star },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prev) => {
        const updated = prev.map((user) => ({
          ...user,
          points: user.points + Math.floor(Math.random() * 50),
        }));
        return updated.sort((a, b) => b.points - a.points);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="font-bold">Live Leaderboard</span>
          <motion.span
            className="ml-auto px-2 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            UPDATING
          </motion.span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl",
                index < 3 ? "bg-gradient-to-r from-amber-500/10 to-transparent" : "bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm",
                  index === 0 && "bg-gradient-to-br from-amber-400 to-yellow-500 text-white",
                  index === 1 && "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800",
                  index === 2 && "bg-gradient-to-br from-orange-400 to-amber-600 text-white",
                  index > 2 && "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{user.name}</span>
                  <user.badge
                    className={cn(
                      "h-4 w-4",
                      index === 0 && "text-amber-500",
                      index === 1 && "text-slate-400",
                      index === 2 && "text-orange-500",
                      index > 2 && "text-muted-foreground"
                    )}
                  />
                </div>
              </div>
              <motion.span
                key={user.points}
                initial={{ scale: 1.2, color: "#22c55e" }}
                animate={{ scale: 1, color: "#f59e0b" }}
                className="font-bold"
              >
                {user.points.toLocaleString()}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// ENGAGEMENT HEATMAP VISUALIZATION
// ============================================================================
function EngagementHeatmap() {
  const [cells, setCells] = useState<number[][]>([]);

  useEffect(() => {
    // Initialize grid
    const initialGrid = Array.from({ length: 8 }, () =>
      Array.from({ length: 12 }, () => Math.random() * 0.3)
    );
    setCells(initialGrid);

    const interval = setInterval(() => {
      setCells((prev) =>
        prev.map((row) =>
          row.map((cell) => {
            const change = (Math.random() - 0.5) * 0.2;
            return Math.max(0, Math.min(1, cell + change));
          })
        )
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getColor = (value: number) => {
    if (value < 0.25) return "bg-blue-500/20";
    if (value < 0.5) return "bg-emerald-500/40";
    if (value < 0.75) return "bg-amber-500/60";
    return "bg-red-500/80";
  };

  return (
    <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold flex items-center gap-2">
            <Map className="h-4 w-4 text-emerald-500" />
            Live Engagement Heatmap
          </h4>
          <p className="text-xs text-muted-foreground">Real-time activity across session timeline</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500/30" />
            Low
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500/50" />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500/70" />
            High
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/90" />
            Peak
          </span>
        </div>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(12, 1fr)` }}>
        {cells.map((row, i) =>
          row.map((cell, j) => (
            <motion.div
              key={`${i}-${j}`}
              className={cn("h-6 rounded-sm transition-colors", getColor(cell))}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: (i + j) * 0.05 }}
            />
          ))
        )}
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
        <span>Session Start</span>
        <span>Current</span>
      </div>
    </div>
  );
}

// ============================================================================
// SPEAKER VS ATTENDEE VIEW SPLIT SCREEN
// ============================================================================
function SpeakerAttendeeView() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gradient-to-b from-background via-slate-950/50 to-background relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-full border border-slate-500/20">
            <Monitor className="h-4 w-4" />
            Dual Perspectives
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            One Platform,{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Two Experiences
            </span>
          </h2>
          <p className="text-muted-foreground">
            See how speakers and attendees experience the same session differently
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Speaker/Presenter View */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-violet-500/5 overflow-hidden"
          >
            <div className="px-4 py-3 bg-purple-500/10 border-b border-purple-500/20 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Mic className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <div className="font-bold text-sm">Speaker Dashboard</div>
                <div className="text-xs text-muted-foreground">Control & Monitor</div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Live Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Live Viewers", value: "1,247", icon: Users, trend: "+12" },
                  { label: "Engagement", value: "87%", icon: Activity, trend: "+5%" },
                  { label: "Questions", value: "34", icon: HelpCircle, trend: "+8" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                    <stat.icon className="h-4 w-4 text-purple-500 mb-2" />
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {stat.label}
                      <span className="text-green-500">{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Moderation Queue */}
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pending Questions</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-500">5 new</span>
                </div>
                <div className="space-y-2">
                  {["How does pricing work for large events?", "Can we white-label the platform?"].map((q, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background/50 text-xs">
                      <span className="flex-1 truncate">{q}</span>
                      <button className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-[10px]">Approve</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button className="flex-1 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm font-medium hover:bg-purple-500/20 transition-colors">
                  Launch Poll
                </button>
                <button className="flex-1 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium hover:bg-emerald-500/20 transition-colors">
                  Start Q&A
                </button>
              </div>
            </div>
          </motion.div>

          {/* Attendee View */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 overflow-hidden"
          >
            <div className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <div className="font-bold text-sm">Attendee Experience</div>
                <div className="text-xs text-muted-foreground">Engage & Participate</div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Engagement Prompt */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Active Poll</span>
                </div>
                <p className="text-sm mb-3">What feature excites you most?</p>
                <div className="space-y-2">
                  {["Real-time reactions", "Live Q&A", "Gamification"].map((opt, i) => (
                    <div key={i} className="p-2 rounded-lg bg-background/50 border border-emerald-500/20 text-sm hover:border-emerald-500 cursor-pointer transition-colors">
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Score */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <div>
                    <div className="font-bold">1,180 Points</div>
                    <div className="text-xs text-muted-foreground">Rank #5 of 247</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Next reward</div>
                  <div className="text-sm font-medium text-amber-500">+20 pts away</div>
                </div>
              </div>

              {/* Quick Reactions */}
              <div className="flex justify-center gap-2 p-2 rounded-xl bg-muted/30">
                {["❤️", "🔥", "👏", "🎉", "🚀"].map((emoji) => (
                  <motion.button
                    key={emoji}
                    className="text-xl p-2 rounded-lg hover:bg-background transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {emoji}
                  </motion.button>
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
// TECHNICAL INFRASTRUCTURE SECTION
// ============================================================================
function InfrastructureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const specs = [
    { icon: Zap, value: "<50ms", label: "Message Latency", description: "Real-time delivery across the globe" },
    { icon: Server, value: "WebSocket", label: "Infrastructure", description: "Persistent bi-directional connections" },
    { icon: Globe, value: "∞", label: "Concurrent Users", description: "Horizontally scalable architecture" },
    { icon: Shield, value: "99.99%", label: "Uptime SLA", description: "Enterprise-grade reliability" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 via-slate-950/50 to-background relative overflow-hidden" ref={ref}>
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">
            <Server className="h-4 w-4" />
            Enterprise Infrastructure
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Unlimited Scale
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The same infrastructure that powers the world&apos;s largest virtual events,
            available from day one.
          </p>
        </motion.div>

        {/* Specs Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {specs.map((spec) => (
            <motion.div
              key={spec.label}
              variants={fadeInUp}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6 rounded-2xl border bg-card/80 backdrop-blur-sm text-center">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <spec.icon className="h-7 w-7 text-blue-500" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-1">
                  {spec.value}
                </div>
                <div className="font-medium mb-2">{spec.label}</div>
                <p className="text-sm text-muted-foreground">{spec.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Infrastructure Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h3 className="font-bold text-lg mb-2">Global Edge Network</h3>
              <p className="text-sm text-muted-foreground">Messages delivered in milliseconds, anywhere in the world</p>
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              {/* Users */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Users className="h-8 w-8 text-emerald-500" />
                </div>
                <span className="text-xs text-muted-foreground">Attendees</span>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />

              {/* Edge */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-blue-500" />
                </div>
                <span className="text-xs text-muted-foreground">Edge Network</span>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />

              {/* WebSocket */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Wifi className="h-8 w-8 text-purple-500" />
                </div>
                <span className="text-xs text-muted-foreground">WebSocket</span>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />

              {/* Redis */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Database className="h-8 w-8 text-red-500" />
                </div>
                <span className="text-xs text-muted-foreground">Redis Pub/Sub</span>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />

              {/* Broadcast */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Radio className="h-8 w-8 text-amber-500" />
                </div>
                <span className="text-xs text-muted-foreground">Broadcast</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex flex-wrap justify-center gap-6 text-sm">
              {[
                { icon: RefreshCw, text: "Idempotent delivery" },
                { icon: Shield, text: "JWT authentication" },
                { icon: Filter, text: "Rate limiting" },
                { icon: Eye, text: "Audit logging" },
              ].map((feature) => (
                <div key={feature.text} className="flex items-center gap-2 text-muted-foreground">
                  <feature.icon className="h-4 w-4" />
                  {feature.text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// INDUSTRY BENCHMARKS SECTION
// ============================================================================
function IndustryBenchmarksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benchmarks = [
    { metric: "Average Chat Participation", industry: "12%", withPlatform: "67%", improvement: "5.6x" },
    { metric: "Poll Response Rate", industry: "23%", withPlatform: "89%", improvement: "3.9x" },
    { metric: "Q&A Engagement", industry: "8%", withPlatform: "45%", improvement: "5.6x" },
    { metric: "Session Completion Rate", industry: "54%", withPlatform: "91%", improvement: "1.7x" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-emerald-950/10 to-muted/30" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
            <TrendingUp className="h-4 w-4" />
            Industry Research
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Beat the{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Industry Benchmarks
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Based on research from 10,000+ virtual events, here is what interactive features achieve
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
              <div>Metric</div>
              <div className="text-center text-muted-foreground">Industry Avg</div>
              <div className="text-center text-emerald-500">With Live Engagement</div>
              <div className="text-center">Improvement</div>
            </div>

            {/* Rows */}
            {benchmarks.map((benchmark, index) => (
              <motion.div
                key={benchmark.metric}
                variants={fadeInUp}
                className={cn(
                  "grid grid-cols-4 gap-4 p-4 items-center",
                  index < benchmarks.length - 1 && "border-b"
                )}
              >
                <div className="font-medium text-sm">{benchmark.metric}</div>
                <div className="text-center">
                  <span className="text-lg text-muted-foreground">{benchmark.industry}</span>
                </div>
                <div className="text-center">
                  <span className="text-xl font-bold text-emerald-500">{benchmark.withPlatform}</span>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                    <ArrowUp className="h-4 w-4" />
                    {benchmark.improvement}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            * Based on industry research from EventMB, Bizzabo, and internal platform data
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// PRODUCT ROADMAP TEASER
// ============================================================================
function RoadmapTeaserSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const roadmapItems = [
    { quarter: "Q1 2026", title: "AI Moderation", description: "Smart content filtering and auto-moderation", status: "in-progress" },
    { quarter: "Q1 2026", title: "Breakout Rooms Chat", description: "Persistent chat across breakout sessions", status: "in-progress" },
    { quarter: "Q2 2026", title: "Sentiment Analysis", description: "Real-time mood tracking and insights", status: "planned" },
    { quarter: "Q2 2026", title: "Multi-language Support", description: "Live translation for global events", status: "planned" },
    { quarter: "Q3 2026", title: "AR Reactions", description: "Augmented reality emoji overlays", status: "exploring" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-purple-950/10 to-muted/30" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-purple-500/10 text-purple-500 rounded-full border border-purple-500/20">
            <Rocket className="h-4 w-4" />
            Coming Soon
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            What&apos;s on the{" "}
            <span className="bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent">
              Roadmap
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A peek at what we&apos;re building next—founding customers get early access
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="max-w-3xl mx-auto space-y-4"
        >
          {roadmapItems.map((item, index) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              className="flex items-start gap-4 p-4 rounded-xl border bg-card/50 backdrop-blur-sm"
            >
              <div className="shrink-0 w-20 text-xs text-muted-foreground font-medium">
                {item.quarter}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold">{item.title}</h4>
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] rounded-full font-medium",
                    item.status === "in-progress" && "bg-emerald-500/20 text-emerald-500",
                    item.status === "planned" && "bg-blue-500/20 text-blue-500",
                    item.status === "exploring" && "bg-purple-500/20 text-purple-500"
                  )}>
                    {item.status === "in-progress" ? "IN PROGRESS" : item.status === "planned" ? "PLANNED" : "EXPLORING"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Have a feature idea?{" "}
          <Link href="/contact?feedback=true" className="text-purple-500 hover:underline">
            We&apos;d love to hear it
          </Link>
        </motion.p>
      </div>
    </section>
  );
}

// ============================================================================
// BETA TESTER / COMMUNITY SECTION
// ============================================================================
function BetaTesterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl border-2 border-dashed border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 p-8 md:p-12">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-4 w-4" />
                Help Shape the Product
              </span>
            </div>

            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Join Our Beta Community
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                We&apos;re building this for event professionals like you. Get early access to new features,
                share feedback directly with our team, and help us create the engagement tools you actually need.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  asChild
                >
                  <Link href="/auth/register?beta=true">
                    Join Beta Program
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-emerald-500/30 hover:bg-emerald-500/5"
                  asChild
                >
                  <Link href="/community">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Join Discord Community
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-center gap-8 mt-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  500+ beta testers
                </span>
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  Active feedback loop
                </span>
                <span className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-emerald-500" />
                  Weekly updates
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// HERO SECTION - Enhanced with interactive reactions
// ============================================================================
function HeroSection({ onReaction }: { onReaction?: (emoji: string) => void }) {
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
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      {/* Interactive Floating Emoji Reactions */}
      <InteractiveFloatingReactions onReaction={onReaction} />

      {/* Content */}
      <div className="container px-4 md:px-6 max-w-6xl relative z-10 py-20">
        {/* Beta Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Now in Public Beta
            <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-[10px] font-bold">NEW</span>
          </span>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-sm font-medium">
            <Radio className="h-4 w-4 text-emerald-400" />
            Real-Time
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 backdrop-blur-sm border border-teal-500/30 text-sm font-medium">
            <Zap className="h-4 w-4 text-teal-400" />
            &lt;50ms Latency
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
            Enterprise Ready
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-neutral-300 leading-relaxed text-center"
        >
          Built for modern events. Real-time chat, emoji reactions, interactive polls,
          and moderated Q&A—all with sub-50ms latency and unlimited scale.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-14 px-8 text-lg shadow-lg shadow-emerald-500/25"
            asChild
          >
            <Link href="/contact?demo=live-engagement">
              See It In Your Event
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 text-lg backdrop-blur-sm"
            asChild
          >
            <Link href="/auth/register?beta=true">
              <Play className="mr-2 h-5 w-5" />
              Start Free Beta
            </Link>
          </Button>
        </motion.div>

        {/* Try it prompt */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-white/60 mt-6"
        >
          <span className="inline-flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Click the emojis below to try live reactions
          </span>
        </motion.p>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "<50ms", label: "Message Latency" },
            { value: "30+", label: "Reaction Types" },
            { value: "WebSocket", label: "Infrastructure" },
            { value: "∞", label: "Concurrent Users" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
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
    <section className="py-24 bg-gradient-to-b from-background via-red-950/5 to-muted/30 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-500/8 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 rounded-full border border-red-500/20"
            animate={{ boxShadow: ["0 0 0 0 rgba(239,68,68,0)", "0 0 0 8px rgba(239,68,68,0.1)", "0 0 0 0 rgba(239,68,68,0)"] }}
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
            Legacy Tools{" "}
            <span className="relative">
              <span className="text-red-500">Weren&apos;t Built</span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>{" "}
            for This
          </h2>
          <p className="text-lg text-muted-foreground">
            Traditional webinar platforms treat engagement as an afterthought.
            One-way broadcasts with clunky Q&amp;A don&apos;t cut it for modern audiences.
          </p>
        </motion.div>

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
              <stat.icon className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-red-500 mb-2">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.5 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border border-red-500/20">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Signs you need modern engagement tools:
            </h3>
            <ul className="space-y-3">
              {[
                "Your chat feature feels like an afterthought bolted on",
                "Polls take 5 clicks to launch and kill the momentum",
                "Q&A gets buried and speakers never see the best questions",
                "No real-time feedback on whether content is landing",
                "Enterprise features require expensive upgrades",
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
// TRY IT LIVE SECTION - Interactive demos
// ============================================================================
function TryItLiveSection({
  onChatInteraction,
  onVoteInteraction,
  onQuestionInteraction,
}: {
  onChatInteraction?: () => void;
  onVoteInteraction?: () => void;
  onQuestionInteraction?: () => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
            <MousePointer className="h-4 w-4" />
            Try It Live
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Experience It{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Right Now
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            These aren&apos;t mockups—they&apos;re working demos. Send a message, cast a vote, or ask a question.
            <br />
            <span className="text-emerald-500 font-medium">Your engagement score updates in real-time.</span>
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <LiveChatDemo onInteraction={onChatInteraction} />
          <LivePollDemo onInteraction={onVoteInteraction} />
          <LiveQADemo onInteraction={onQuestionInteraction} />
        </div>

        {/* Engagement Heatmap */}
        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <EngagementHeatmap />
          <AnimatedLeaderboard />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SOLUTION SECTION - Four Pillars (kept for feature overview)
// ============================================================================
function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const pillars = [
    {
      icon: MessageSquare,
      title: "Real-Time Chat",
      description: "Threaded conversations that let attendees discuss, share insights, and connect—all without disrupting the session.",
      color: "from-emerald-500 to-teal-500",
      features: ["Message threading", "5-min edit window", "Reactions on messages"],
    },
    {
      icon: Heart,
      title: "Emoji Reactions",
      description: "Express emotions instantly with 30+ floating reactions that create a visible wave of audience sentiment.",
      color: "from-pink-500 to-rose-500",
      features: ["30+ emoji options", "Real-time visualization", "Sentiment analytics"],
    },
    {
      icon: BarChart3,
      title: "Interactive Polls",
      description: "Launch polls in seconds and watch live results stream in. Perfect for decisions, feedback, and keeping attention.",
      color: "from-purple-500 to-violet-500",
      features: ["Multiple choice & quiz", "Live results display", "Giveaway integration"],
    },
    {
      icon: HelpCircle,
      title: "Moderated Q&A",
      description: "Crowdsource the best questions through upvoting. Moderate submissions to keep discussions focused and productive.",
      color: "from-amber-500 to-orange-500",
      features: ["Community upvoting", "Moderation queue", "Anonymous option"],
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
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
            Built from the ground up for real-time interaction—not bolted on as an afterthought.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.title}
              variants={fadeInUp}
              className="group relative"
            >
              <div className="relative h-full p-6 rounded-2xl border bg-card/80 backdrop-blur-sm hover:border-emerald-500/50 transition-colors">
                <motion.div
                  className={cn("h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4", pillar.color)}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <pillar.icon className="h-7 w-7 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{pillar.description}</p>

                <ul className="space-y-2">
                  {pillar.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
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
// CTA SECTION - Enhanced for launch
// ============================================================================
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] -z-5" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
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
            Ready to Transform Your Events?
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join our beta program and be among the first to experience
            truly modern event engagement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-white/90 h-14 px-8 text-lg shadow-xl shadow-black/20"
              asChild
            >
              <Link href="/contact?demo=live-engagement">
                See It In Your Event
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-14 px-8 text-lg backdrop-blur-sm"
              asChild
            >
              <Link href="/auth/register?beta=true">
                <Play className="mr-2 h-5 w-5" />
                Start Free Beta
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
              { value: "500+", label: "Beta Testers" },
              { value: "<50ms", label: "Latency" },
              { value: "99.99%", label: "Uptime SLA" },
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
  const engagement = useEngagementScore();

  const handleReaction = () => {
    engagement.addPoints(5, "reaction");
  };

  const handleChat = () => {
    engagement.addPoints(10, "message");
  };

  const handleVote = () => {
    engagement.addPoints(10, "vote");
  };

  const handleQuestion = () => {
    engagement.addPoints(20, "question");
  };

  return (
    <main className="min-h-screen">
      {/* Engagement Score Meter - Fixed sidebar */}
      <EngagementScoreMeter
        score={engagement.score}
        reactions={engagement.reactions}
        messages={engagement.messages}
        votes={engagement.votes}
        questions={engagement.questions}
      />

      <HeroSection onReaction={handleReaction} />
      <ProblemSection />
      <SolutionSection />
      <TryItLiveSection
        onChatInteraction={handleChat}
        onVoteInteraction={handleVote}
        onQuestionInteraction={handleQuestion}
      />
      <SpeakerAttendeeView />
      <IndustryBenchmarksSection />
      <InfrastructureSection />
      <RoadmapTeaserSection />
      <BetaTesterSection />
      <CTASection />
    </main>
  );
}
