// src/components/features/floating-reactions.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingEmoji } from "@/hooks/use-session-reactions";

interface FloatingReactionsProps {
  emojis: FloatingEmoji[];
  className?: string;
}

/**
 * Displays floating emoji reactions that animate upward and fade out.
 * Similar to Instagram Live or Twitch reactions.
 */
export const FloatingReactions = ({
  emojis,
  className = "",
}: FloatingReactionsProps) => {
  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden z-50 ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {emojis.map((emoji) => (
          <FloatingEmojiItem key={emoji.id} emoji={emoji} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface FloatingEmojiItemProps {
  emoji: FloatingEmoji;
}

const FloatingEmojiItem = ({ emoji }: FloatingEmojiItemProps) => {
  // Random variations for natural feel
  const [randomValues] = useState(() => ({
    xOffset: (Math.random() - 0.5) * 40, // -20 to +20 px drift
    scale: 0.8 + Math.random() * 0.6, // 0.8 to 1.4
    duration: 3 + Math.random() * 1.5, // 3 to 4.5 seconds
    rotation: (Math.random() - 0.5) * 30, // -15 to +15 degrees
  }));

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: "100vh",
        x: `${emoji.x}vw`,
        scale: 0.5,
        rotate: 0,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: ["100vh", "60vh", "30vh", "-10vh"],
        x: `calc(${emoji.x}vw + ${randomValues.xOffset}px)`,
        scale: [0.5, randomValues.scale, randomValues.scale, 0.3],
        rotate: [0, randomValues.rotation, -randomValues.rotation, 0],
      }}
      exit={{
        opacity: 0,
        scale: 0,
      }}
      transition={{
        duration: randomValues.duration,
        ease: "easeOut",
        times: [0, 0.1, 0.7, 1],
      }}
      className="absolute text-4xl select-none"
      style={{
        left: 0,
        bottom: 0,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
      }}
    >
      {emoji.emoji}
    </motion.div>
  );
};

/**
 * Compact version for smaller containers (like sidebars)
 */
export const FloatingReactionsCompact = ({
  emojis,
  className = "",
}: FloatingReactionsProps) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {emojis.map((emoji) => (
          <CompactFloatingEmoji key={emoji.id} emoji={emoji} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const CompactFloatingEmoji = ({ emoji }: FloatingEmojiItemProps) => {
  const [randomValues] = useState(() => ({
    xOffset: (Math.random() - 0.5) * 20,
    scale: 0.6 + Math.random() * 0.4,
    duration: 2 + Math.random() * 1,
  }));

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: "100%",
        x: `${emoji.x}%`,
        scale: 0.3,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: ["100%", "50%", "20%", "-10%"],
        x: `calc(${emoji.x}% + ${randomValues.xOffset}px)`,
        scale: [0.3, randomValues.scale, randomValues.scale, 0.2],
      }}
      exit={{
        opacity: 0,
        scale: 0,
      }}
      transition={{
        duration: randomValues.duration,
        ease: "easeOut",
        times: [0, 0.1, 0.7, 1],
      }}
      className="absolute text-2xl select-none"
      style={{
        left: 0,
        bottom: 0,
      }}
    >
      {emoji.emoji}
    </motion.div>
  );
};
