"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { HiSparkles } from "react-icons/hi2";

// Skill Tree Animation - Enhanced
function SkillTreeAnimation() {
  const nodes = [
    { x: 60, y: 15, size: 10, lit: true, label: "Core" },
    { x: 30, y: 45, size: 8, lit: true },
    { x: 90, y: 45, size: 8, lit: true },
    { x: 15, y: 75, size: 6, lit: true },
    { x: 45, y: 75, size: 6, lit: false },
    { x: 75, y: 75, size: 6, lit: false },
    { x: 105, y: 75, size: 6, lit: false },
  ];

  const connections: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
  ];

  return (
    <svg viewBox="0 0 120 95" className="w-full h-full">
      <defs>
        <linearGradient id="skillNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="skillGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connections with pulse effect */}
      {connections.map((conn, i) => {
        const fromNode = nodes[conn[0]]!;
        const toNode = nodes[conn[1]]!;
        return (
          <motion.g key={i}>
            <motion.line
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={toNode.lit ? "#fbbf24" : "#334155"}
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            />
            {/* Data flow particle */}
            {toNode.lit && (
              <motion.circle
                r="2"
                fill="#fbbf24"
                filter="url(#skillGlow)"
                initial={{ cx: fromNode.x, cy: fromNode.y }}
                animate={{
                  cx: [fromNode.x, toNode.x],
                  cy: [fromNode.y, toNode.y],
                  opacity: [1, 0],
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            )}
          </motion.g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.g key={i}>
          {/* Outer ring for lit nodes */}
          {node.lit && (
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size + 4}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1"
              strokeOpacity="0.3"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          )}
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill={node.lit ? "url(#skillNodeGrad)" : "#1e293b"}
            stroke={node.lit ? "#fbbf24" : "#475569"}
            strokeWidth="2"
            filter={node.lit ? "url(#skillGlow)" : "none"}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.08, type: "spring" }}
          />
          {/* Checkmark for completed */}
          {node.lit && node.size > 7 && (
            <motion.path
              d={`M${node.x - 3} ${node.y} L${node.x - 1} ${node.y + 2} L${node.x + 3} ${node.y - 2}`}
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            />
          )}
        </motion.g>
      ))}
    </svg>
  );
}

// Kai Chatbot Animation - Enhanced
function KaiChatAnimation() {
  return (
    <svg viewBox="0 0 120 95" className="w-full h-full">
      <defs>
        <linearGradient id="kaiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Chat container with glow */}
      <rect x="8" y="8" width="104" height="80" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

      {/* User message bubble */}
      <motion.g
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <rect x="45" y="15" width="58" height="18" rx="9" fill="#334155" />
        <rect x="52" y="21" width="35" height="3" rx="1.5" fill="#64748b" />
        <rect x="52" y="26" width="22" height="2" rx="1" fill="#475569" />
      </motion.g>

      {/* AI response bubble with gradient border */}
      <motion.g
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <rect x="12" y="38" width="70" height="22" rx="9" fill="#fbbf24" fillOpacity="0.1" stroke="url(#kaiGrad)" strokeWidth="1" />
        <rect x="18" y="45" width="45" height="3" rx="1.5" fill="#fbbf24" fillOpacity="0.6" />
        <rect x="18" y="51" width="35" height="2" rx="1" fill="#fbbf24" fillOpacity="0.4" />
      </motion.g>

      {/* Typing indicator with smoother animation */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={22 + i * 9}
            cy="72"
            r="3.5"
            fill="url(#kaiGrad)"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </motion.g>

      {/* Kai avatar with pulse */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6, type: "spring" }}
      >
        <motion.circle
          cx="100"
          cy="78"
          r="12"
          fill="#0f172a"
          stroke="url(#kaiGrad)"
          strokeWidth="2"
          animate={{ boxShadow: "0 0 10px rgba(251, 191, 36, 0.5)" }}
        />
        <motion.circle
          cx="100"
          cy="78"
          r="15"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1"
          strokeOpacity="0.3"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <text x="100" y="82" textAnchor="middle" fontSize="10" fill="#fbbf24" fontWeight="bold">K</text>
      </motion.g>
    </svg>
  );
}

// Manim Visualization Animation - Enhanced
function ManimAnimation() {
  return (
    <svg viewBox="0 0 120 95" className="w-full h-full">
      {/* Video frame with subtle gradient */}
      <defs>
        <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      <rect x="8" y="12" width="104" height="68" rx="8" fill="url(#frameGrad)" stroke="#334155" strokeWidth="1.5" />

      {/* Grid lines for math feel */}
      <g opacity="0.1">
        {[0, 1, 2, 3].map((i) => (
          <line key={`h${i}`} x1="12" y1={25 + i * 12} x2="108" y2={25 + i * 12} stroke="#fbbf24" strokeWidth="0.5" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`v${i}`} x1={24 + i * 20} y1="16" x2={24 + i * 20} y2="76" stroke="#fbbf24" strokeWidth="0.5" />
        ))}
      </g>

      {/* Animated graph/function */}
      <motion.path
        d="M20 55 Q40 25 60 45 T100 35"
        stroke="#fbbf24"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {/* Moving point along curve */}
      <motion.circle
        r="4"
        fill="#fbbf24"
        animate={{
          cx: [20, 40, 60, 80, 100],
          cy: [55, 30, 45, 40, 35],
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        filter="url(#skillGlow)"
      />

      {/* Play button pulse */}
      <motion.circle
        cx="60"
        cy="45"
        r="18"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1"
        strokeOpacity="0.3"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Progress bar */}
      <rect x="12" y="74" width="96" height="3" rx="1.5" fill="#1e293b" />
      <motion.rect
        x="12"
        y="74"
        width="0"
        height="3"
        rx="1.5"
        fill="#fbbf24"
        animate={{ width: [0, 96, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </svg>
  );
}

// Notion Integration Animation - Enhanced
function NotionAnimation() {
  return (
    <svg viewBox="0 0 120 95" className="w-full h-full">
      <defs>
        <linearGradient id="syncGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Kortex panel */}
      <motion.g
        initial={{ x: -15, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <rect x="8" y="22" width="42" height="52" rx="6" fill="#0f172a" stroke="url(#syncGrad)" strokeWidth="1.5" />
        <rect x="14" y="32" width="30" height="4" rx="2" fill="#fbbf24" fillOpacity="0.5" />
        <rect x="14" y="40" width="24" height="3" rx="1.5" fill="#fbbf24" fillOpacity="0.3" />
        <rect x="14" y="47" width="28" height="3" rx="1.5" fill="#fbbf24" fillOpacity="0.2" />
        <text x="29" y="65" textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">K</text>
      </motion.g>

      {/* Animated sync arrows */}
      <motion.g>
        {/* Right arrow (Kortex -> Notion) */}
        <motion.g>
          <motion.path
            d="M55 38 L65 38"
            stroke="url(#syncGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          />
          <motion.path
            d="M62 35 L66 38 L62 41"
            stroke="url(#syncGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          />
        </motion.g>

        {/* Left arrow (Notion -> Kortex) */}
        <motion.g>
          <motion.path
            d="M65 55 L55 55"
            stroke="#64748b"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          />
          <motion.path
            d="M58 52 L54 55 L58 58"
            stroke="#64748b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          />
        </motion.g>

        {/* Rotating sync icon */}
        <motion.circle
          cx="60"
          cy="47"
          r="7"
          fill="#0f172a"
          stroke="url(#syncGrad)"
          strokeWidth="1.5"
        />
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "60px 47px" }}
        >
          <path d="M57 47 A3 3 0 1 1 63 47" stroke="url(#syncGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="63" cy="47" r="1.5" fill="#fbbf24" />
        </motion.g>
      </motion.g>

      {/* Notion panel */}
      <motion.g
        initial={{ x: 15, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <rect x="70" y="22" width="42" height="52" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        <rect x="76" y="32" width="30" height="4" rx="2" fill="#64748b" fillOpacity="0.5" />
        <rect x="76" y="40" width="24" height="3" rx="1.5" fill="#64748b" fillOpacity="0.3" />
        <rect x="76" y="47" width="28" height="3" rx="1.5" fill="#64748b" fillOpacity="0.2" />
        <text x="91" y="65" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="bold">N</text>
      </motion.g>
    </svg>
  );
}

// XP/Gamification Animation - Enhanced
function ArcadeAnimation() {
  return (
    <svg viewBox="0 0 120 95" className="w-full h-full">
      <defs>
        <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="xpGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* XP Badge - bouncing */}
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.rect
          x="30"
          y="15"
          width="60"
          height="28"
          rx="14"
          fill="url(#xpGrad)"
          filter="url(#xpGlow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        />
        <text x="60" y="34" textAnchor="middle" fontSize="13" fill="#0f172a" fontWeight="bold">+150 XP</text>
      </motion.g>

      {/* Streak fire with glow */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3, type: "spring" }}
      >
        <motion.text
          x="22"
          y="68"
          fontSize="22"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          🔥
        </motion.text>
        <rect x="10" y="75" width="30" height="12" rx="6" fill="#1e293b" />
        <text x="25" y="84" textAnchor="middle" fontSize="7" fill="#fbbf24" fontWeight="bold">7 DAYS</text>
      </motion.g>

      {/* Leaderboard with animation */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <rect x="50" y="52" width="62" height="38" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <text x="81" y="65" textAnchor="middle" fontSize="6" fill="#64748b" fontWeight="bold">LEADERBOARD</text>

        {/* Bars with stagger */}
        <motion.rect x="56" y="72" width="40" height="5" rx="2.5" fill="url(#xpGrad)" initial={{ width: 0 }} animate={{ width: 40 }} transition={{ duration: 0.5, delay: 0.7 }} />
        <motion.rect x="56" y="80" width="28" height="5" rx="2.5" fill="#475569" initial={{ width: 0 }} animate={{ width: 28 }} transition={{ duration: 0.5, delay: 0.8 }} />

        {/* Trophy icon */}
        <text x="102" y="77" fontSize="10">🏆</text>
      </motion.g>
    </svg>
  );
}

const features = [
  {
    title: "Skill Tree Navigation",
    subtitle: "Visualize Your Progress",
    description: "Don't get lost in PDFs. See exactly where you stand. Unlock modules as you master prerequisites.",
    animation: SkillTreeAnimation,
    size: "large",
  },
  {
    title: '"Kai" — Your Lab Partner',
    subtitle: "A Tutor That Knows the Course",
    description: "Kai isn't a generic chatbot. It knows your lessons and can debug your specific problems.",
    animation: KaiChatAnimation,
    size: "large",
  },
  {
    title: "Manim Visualizations",
    subtitle: "See the Math Move",
    description: "Why read about state transitions when you can watch them? Real-time Python animations turn theory into visuals.",
    animation: ManimAnimation,
    size: "medium",
  },
  {
    title: "Productivity Bridge",
    subtitle: "Keep Your Notes Sync'd",
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
    <section ref={containerRef} id="features" className="relative py-32 bg-slate-950 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[120px]" />

      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
          >
            <HiSparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            What Students Can Do
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Tools designed to make learning feel like playing a game
          </motion.p>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Animation = feature.animation;
            const isLarge = feature.size === "large";

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 * index }}
                whileHover={{ y: -6 }}
                className={`group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 ${isLarge ? "md:col-span-1 lg:row-span-1" : ""}`}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/0 to-amber-600/0 group-hover:from-amber-500/5 group-hover:to-amber-600/5 transition-all duration-300" />

                {/* Animation container */}
                <div className="relative h-32 mb-5 rounded-xl bg-slate-800/30 p-2">
                  <Animation />
                </div>

                {/* Content */}
                <div className="relative">
                  <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">{feature.subtitle}</p>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
