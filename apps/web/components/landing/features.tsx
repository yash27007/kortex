"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

// Skill Tree Animation
function SkillTreeAnimation() {
  const nodes = [
    { x: 60, y: 20, size: 8, lit: true },
    { x: 30, y: 50, size: 6, lit: true },
    { x: 90, y: 50, size: 6, lit: true },
    { x: 15, y: 80, size: 5, lit: true },
    { x: 45, y: 80, size: 5, lit: false },
    { x: 75, y: 80, size: 5, lit: false },
    { x: 105, y: 80, size: 5, lit: false },
  ];

  const connections: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
  ];

  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Connections */}
      {connections.map((conn, i) => {
        const fromNode = nodes[conn[0]]!;
        const toNode = nodes[conn[1]]!;
        return (
          <motion.line
            key={i}
            x1={fromNode.x}
            y1={fromNode.y}
            x2={toNode.x}
            y2={toNode.y}
            stroke={toNode.lit ? "#fbbf24" : "#334155"}
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={node.size}
          fill={node.lit ? "url(#nodeGrad)" : "#1e293b"}
          stroke={node.lit ? "#fbbf24" : "#334155"}
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
          style={{ filter: node.lit ? "drop-shadow(0 0 4px #fbbf24)" : "none" }}
        />
      ))}
    </svg>
  );
}

// Kai Chatbot Animation
function KaiChatAnimation() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      {/* Chat container */}
      <rect x="10" y="10" width="100" height="80" rx="8" fill="#1e293b" stroke="#334155" />

      {/* User message */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <rect x="40" y="18" width="60" height="16" rx="8" fill="#334155" />
        <rect x="45" y="23" width="30" height="3" rx="1" fill="#64748b" />
        <rect x="45" y="28" width="20" height="2" rx="1" fill="#475569" />
      </motion.g>

      {/* AI response */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <rect x="15" y="40" width="65" height="20" rx="8" fill="#fbbf24" fillOpacity="0.1" stroke="#fbbf24" strokeWidth="0.5" />
        <rect x="20" y="46" width="40" height="3" rx="1" fill="#fbbf24" fillOpacity="0.5" />
        <rect x="20" y="52" width="30" height="2" rx="1" fill="#fbbf24" fillOpacity="0.3" />
      </motion.g>

      {/* Typing indicator */}
      <motion.g>
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={25 + i * 8}
            cy="72"
            r="3"
            fill="#fbbf24"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.g>

      {/* Kai badge */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <circle cx="100" cy="80" r="10" fill="#1e293b" stroke="#fbbf24" strokeWidth="1" />
        <text x="100" y="84" textAnchor="middle" fontSize="8" fill="#fbbf24" fontWeight="bold">K</text>
      </motion.g>
    </svg>
  );
}

// Manim Visualization Animation
function ManimAnimation() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      {/* Video frame */}
      <rect x="10" y="15" width="100" height="70" rx="6" fill="#0f172a" stroke="#334155" />

      {/* Play button hint */}
      <motion.circle
        cx="60"
        cy="50"
        r="12"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Morphing shape - circle to square */}
      <motion.rect
        x="48"
        y="38"
        width="24"
        height="24"
        rx="12"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2"
        animate={{
          rx: [12, 2, 12],
          rotate: [0, 45, 0],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "60px 50px" }}
      />

      {/* DFA states animation */}
      <motion.g>
        {/* State 1 */}
        <motion.circle
          cx="30"
          cy="50"
          r="6"
          fill="#1e293b"
          stroke="#fbbf24"
          strokeWidth="1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Arrow */}
        <motion.path
          d="M38 50 L52 50"
          stroke="#fbbf24"
          strokeWidth="1"
          strokeOpacity="0.5"
          animate={{ strokeOpacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* State 2 */}
        <motion.circle
          cx="90"
          cy="50"
          r="6"
          fill="#1e293b"
          stroke="#fbbf24"
          strokeWidth="1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
        {/* Arrow */}
        <motion.path
          d="M68 50 L82 50"
          stroke="#fbbf24"
          strokeWidth="1"
          strokeOpacity="0.5"
          animate={{ strokeOpacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
      </motion.g>

      {/* Progress bar */}
      <rect x="15" y="78" width="90" height="3" rx="1" fill="#334155" />
      <motion.rect
        x="15"
        y="78"
        width="0"
        height="3"
        rx="1"
        fill="#fbbf24"
        animate={{ width: [0, 90, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </svg>
  );
}

// Notion Integration Animation
function NotionAnimation() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      {/* Kortex side */}
      <motion.g
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <rect x="10" y="25" width="35" height="50" rx="4" fill="#1e293b" stroke="#fbbf24" strokeWidth="1" />
        <text x="27" y="55" textAnchor="middle" fontSize="10" fill="#fbbf24" fontWeight="bold">K</text>
      </motion.g>

      {/* Sync arrows */}
      <motion.g>
        <motion.path
          d="M50 45 L70 45"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
        <motion.path
          d="M70 55 L50 55"
          stroke="#64748b"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        {/* Sync icon */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "60px 50px" }}
        >
          <circle cx="60" cy="50" r="8" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />
          <path d="M57 50 A3 3 0 1 1 63 50" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
          <path d="M62 48 L63 50 L61 51" stroke="#fbbf24" strokeWidth="1" fill="none" />
        </motion.g>
      </motion.g>

      {/* Notion side */}
      <motion.g
        initial={{ x: 10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <rect x="75" y="25" width="35" height="50" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <text x="92" y="55" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">N</text>
      </motion.g>
    </svg>
  );
}

// XP/Gamification Animation
function ArcadeAnimation() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      {/* XP Badge */}
      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.rect
          x="35"
          y="20"
          width="50"
          height="25"
          rx="12"
          fill="#fbbf24"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, type: "spring" }}
        />
        <text x="60" y="37" textAnchor="middle" fontSize="12" fill="#0f172a" fontWeight="bold">+150 XP</text>
      </motion.g>

      {/* Streak fire */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.text
          x="25"
          y="70"
          fontSize="20"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          🔥
        </motion.text>
        <text x="25" y="85" textAnchor="middle" fontSize="8" fill="#64748b">7 day</text>
      </motion.g>

      {/* Leaderboard */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <rect x="55" y="55" width="55" height="35" rx="4" fill="#1e293b" stroke="#334155" />
        <text x="82" y="68" textAnchor="middle" fontSize="6" fill="#64748b">LEADERBOARD</text>
        <rect x="60" y="73" width="30" height="4" rx="2" fill="#fbbf24" />
        <rect x="60" y="80" width="22" height="4" rx="2" fill="#64748b" />
      </motion.g>
    </svg>
  );
}

const features = [
  {
    title: "The Skill Tree Navigation",
    subtitle: "Visualize Your Progress",
    description: "Don't get lost in PDFs. See exactly where you stand. Unlock modules as you master prerequisites.",
    animation: SkillTreeAnimation,
    size: "large",
  },
  {
    title: '"Kai" — Your Socratic Lab Partner',
    subtitle: "A Tutor That Actually Knows the Course",
    description: "Kai isn't a general chatbot. It knows exactly which lesson you are reading and can debug your specific problems.",
    animation: KaiChatAnimation,
    size: "large",
  },
  {
    title: "Dynamic Manim Visualizations",
    subtitle: "See the Math Move",
    description: "Why read about 'State Transitions' when you can watch them? Real-time Python animations turn theory into visuals.",
    animation: ManimAnimation,
    size: "medium",
  },
  {
    title: "The Productivity Bridge",
    subtitle: "Keep Your Second Brain Sync'd",
    description: "Found a key insight? Send it directly to Notion or Google Docs with one click.",
    animation: NotionAnimation,
    size: "medium",
  },
  {
    title: "The Arcade",
    subtitle: "Play to Learn",
    description: "Earn XP, keep your streak alive, and climb the weekly leaderboard.",
    animation: ArcadeAnimation,
    size: "medium",
  },
];

export function Features() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} id="features" className="relative py-32 bg-slate-950">
      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-amber-400 font-medium mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            What Students Can Do
          </motion.h2>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Animation = feature.animation;
            const isLarge = feature.size === "large";

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all ${isLarge ? "md:col-span-1 lg:row-span-1" : ""
                  }`}
              >
                {/* Animation */}
                <div className="h-28 mb-4">
                  <Animation />
                </div>

                {/* Content */}
                <p className="text-amber-400 text-sm font-medium mb-1">{feature.subtitle}</p>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>

                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
