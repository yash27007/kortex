"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Show } from "@clerk/nextjs";
import { HiArrowRight, HiPlay } from "react-icons/hi2";

// Animated Knowledge Graph - More complex and beautiful
function KnowledgeGraph() {
  const nodes = [
    { x: 80, y: 60, size: 8 }, { x: 160, y: 35, size: 6 }, { x: 240, y: 70, size: 10 },
    { x: 320, y: 45, size: 7 }, { x: 400, y: 80, size: 9 }, { x: 120, y: 110, size: 6 },
    { x: 200, y: 130, size: 8 }, { x: 280, y: 100, size: 7 }, { x: 360, y: 140, size: 8 },
    { x: 100, y: 170, size: 5 }, { x: 180, y: 190, size: 6 }, { x: 260, y: 160, size: 7 },
    { x: 340, y: 180, size: 6 }, { x: 420, y: 130, size: 5 },
  ];

  const connections: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 7], [3, 8],
    [5, 6], [6, 7], [7, 8], [5, 9], [6, 10], [7, 11], [8, 12],
    [9, 10], [10, 11], [11, 12], [12, 13], [4, 13], [2, 6], [7, 12],
  ];

  return (
    <motion.svg
      viewBox="0 0 500 240"
      className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[260px] opacity-30 hidden lg:block pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 1.5 }}
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connection lines with animation */}
      {connections.map((conn, i) => {
        const fromNode = nodes[conn[0]]!;
        const toNode = nodes[conn[1]]!;
        return (
          <motion.line
            key={`line-${i}`}
            x1={fromNode.x}
            y1={fromNode.y}
            x2={toNode.x}
            y2={toNode.y}
            stroke="url(#goldGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 1.5, delay: 0.3 + i * 0.05 }}
          />
        );
      })}

      {/* Data flow particles along connections */}
      {[0, 3, 6, 10, 14].map((connIndex) => {
        const conn = connections[connIndex]!;
        const fromNode = nodes[conn[0]]!;
        const toNode = nodes[conn[1]]!;
        return (
          <motion.circle
            key={`particle-${connIndex}`}
            r="2"
            fill="#fbbf24"
            filter="url(#softGlow)"
            initial={{ cx: fromNode.x, cy: fromNode.y, opacity: 0 }}
            animate={{
              cx: [fromNode.x, toNode.x, fromNode.x],
              cy: [fromNode.y, toNode.y, fromNode.y],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: connIndex * 0.4,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.g key={`node-${i}`}>
          {/* Outer glow ring */}
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.size + 6}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
          />
          {/* Node background */}
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill="#0f172a"
            stroke="url(#goldGrad)"
            strokeWidth="2"
            filter="url(#glow)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 + i * 0.05 }}
          />
          {/* Node center pulse */}
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.size * 0.5}
            fill="#fbbf24"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2 + i * 0.1, repeat: Infinity, delay: i * 0.1 }}
          />
        </motion.g>
      ))}
    </motion.svg>
  );
}

// Floating particles background - using static values to avoid hydration mismatch
const PARTICLES = [
  { id: 0, x: 12, y: 8, size: 2, duration: 18, delay: 1 },
  { id: 1, x: 85, y: 15, size: 3, duration: 22, delay: 3 },
  { id: 2, x: 45, y: 25, size: 1.5, duration: 16, delay: 0 },
  { id: 3, x: 72, y: 42, size: 2.5, duration: 20, delay: 2 },
  { id: 4, x: 28, y: 55, size: 2, duration: 19, delay: 4 },
  { id: 5, x: 92, y: 68, size: 3, duration: 24, delay: 1.5 },
  { id: 6, x: 18, y: 78, size: 1.8, duration: 17, delay: 2.5 },
  { id: 7, x: 55, y: 88, size: 2.2, duration: 21, delay: 0.5 },
  { id: 8, x: 38, y: 12, size: 2.8, duration: 23, delay: 3.5 },
  { id: 9, x: 68, y: 32, size: 1.6, duration: 15, delay: 4.5 },
  { id: 10, x: 5, y: 45, size: 2.4, duration: 18, delay: 1.2 },
  { id: 11, x: 78, y: 58, size: 3.2, duration: 20, delay: 2.8 },
  { id: 12, x: 42, y: 72, size: 1.9, duration: 22, delay: 0.8 },
  { id: 13, x: 95, y: 35, size: 2.6, duration: 16, delay: 3.2 },
  { id: 14, x: 22, y: 92, size: 2.1, duration: 19, delay: 4.2 },
];

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Gradient orbs with movement
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary amber orb */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 40%, transparent 70%)",
          left: "10%",
          top: "20%",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary orb */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.03) 50%, transparent 70%)",
          right: "5%",
          bottom: "10%",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Accent orb */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 60%)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Grid pattern
function GridPattern() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(251, 191, 36, 0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(251, 191, 36, 0.15) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    />
  );
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-slate-950" />
      <GradientOrbs />
      <GridPattern />
      <FloatingParticles />
      <KnowledgeGraph />

      {/* Content */}
      <motion.div
        style={{ opacity, y, scale }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-20"
      >
        {/* Badge with shimmer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 animate-shimmer" />
          <motion.span
            className="relative w-2 h-2 rounded-full bg-amber-400"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="relative text-sm text-amber-300 font-medium">
            AI-Powered Learning Engine
          </span>
        </motion.div>

        {/* Main headline with enhanced typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight mb-6"
        >
          <span className="block text-white">Stop Memorizing.</span>
          <span className="block whitespace-nowrap">
            <span className="text-white">Start </span>
            <motion.span
              className="inline bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto] pr-1"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              Engineering.
            </motion.span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed"
        >
          Most AI tools just give you the answer. Kortex builds your intuition
          using adaptive curriculum, visual simulations, and personalized feedback loops.
        </motion.p>

        {/* CTA Buttons with glow effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-start gap-4"
        >
          <Show when="signed-out">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <Link
                href="/sign-up"
                className="relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl shadow-lg"
              >
                <span>Start Learning</span>
                <HiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <Link
              href="#demo"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-800/50 border border-slate-700 hover:border-amber-500/30 text-slate-300 hover:text-white font-medium rounded-xl transition-all duration-300"
            >
              <HiPlay className="w-4 h-4" />
              <span>View the Demo</span>
            </Link>
          </Show>
          <Show when="signed-in">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <Link
                href="/dashboard"
                className="relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl shadow-lg"
              >
                <span>Go to Dashboard</span>
                <HiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </Show>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 h-px w-32 bg-gradient-to-r from-amber-500/50 to-transparent origin-left"
        />
      </motion.div>
    </section>
  );
}
