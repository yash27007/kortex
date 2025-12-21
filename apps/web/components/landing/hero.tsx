"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { HiArrowRight, HiPlay } from "react-icons/hi2";

// Knowledge Graph Animation - nodes connecting and lighting up
function KnowledgeGraph() {
  // Pre-calculated node positions
  const nodes = [
    { x: 100, y: 80 },
    { x: 180, y: 50 },
    { x: 260, y: 90 },
    { x: 140, y: 140 },
    { x: 220, y: 150 },
    { x: 300, y: 130 },
    { x: 60, y: 140 },
    { x: 340, y: 70 },
    { x: 280, y: 180 },
    { x: 160, y: 200 },
  ];

  // Connections between nodes
  const connections: [number, number][] = [
    [0, 1], [1, 2], [0, 3], [3, 4], [2, 5],
    [0, 6], [2, 7], [4, 8], [3, 9], [4, 5],
    [1, 4], [6, 3], [5, 7], [8, 9],
  ];

  return (
    <motion.svg
      viewBox="0 0 400 260"
      className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[325px] opacity-40 hidden lg:block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      transition={{ duration: 1 }}
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connection lines */}
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
            stroke="#fbbf24"
            strokeWidth="1"
            strokeOpacity="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.g key={`node-${i}`}>
          {/* Outer glow */}
          <motion.circle
            cx={node.x}
            cy={node.y}
            r="12"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
          />
          {/* Core node */}
          <motion.circle
            cx={node.x}
            cy={node.y}
            r="6"
            fill="#1e293b"
            stroke="url(#goldGrad)"
            strokeWidth="2"
            filter="url(#glow)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
          />
          {/* Pulsing center */}
          <motion.circle
            cx={node.x}
            cy={node.y}
            r="3"
            fill="#fbbf24"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2 + i * 0.2, repeat: Infinity, delay: i * 0.1 }}
          />
        </motion.g>
      ))}
    </motion.svg>
  );
}

// Animated grid pattern with squares
function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251, 191, 36, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Animated highlight squares */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="squareGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Floating squares */}
        {[
          { x: "10%", y: "20%", size: 40, delay: 0 },
          { x: "80%", y: "30%", size: 30, delay: 1 },
          { x: "20%", y: "70%", size: 25, delay: 2 },
          { x: "70%", y: "60%", size: 35, delay: 0.5 },
          { x: "50%", y: "40%", size: 20, delay: 1.5 },
        ].map((sq, i) => (
          <motion.rect
            key={i}
            x={sq.x}
            y={sq.y}
            width={sq.size}
            height={sq.size}
            fill="url(#squareGlow)"
            stroke="#fbbf24"
            strokeWidth="0.5"
            strokeOpacity="0.1"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{
              opacity: [0, 0.3, 0],
              rotate: 45,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: sq.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </div>
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

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* Grid pattern with squares */}
      <GridPattern />

      {/* Gradient orb */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[120px]" />

      {/* Knowledge Graph */}
      <KnowledgeGraph />

      {/* Content */}
      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-20"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8"
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-amber-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm text-amber-300 font-medium">
            AI-Powered Learning Engine
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-[clamp(2rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight mb-6"
        >
          <span className="block text-white">Stop Memorizing.</span>
          <span className="block text-white">Start{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
              Engineering.
            </span>
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

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-start gap-4"
        >
          <SignedOut>
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/20"
            >
              <span>Start Learning</span>
              <HiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#demo"
              className="group inline-flex items-center gap-2 px-8 py-4 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-medium rounded-xl transition-all duration-300"
            >
              <HiPlay className="w-4 h-4" />
              <span>View the Demo</span>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/20"
            >
              <span>Go to Dashboard</span>
              <HiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </SignedIn>
        </motion.div>
      </motion.div>
    </section>
  );
}
