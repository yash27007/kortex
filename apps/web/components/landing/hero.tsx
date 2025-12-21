"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { HiArrowRight } from "react-icons/hi2";

// Animated gradient orb SVG component
function GradientOrb() {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-60"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.6 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <defs>
        <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
        </filter>
      </defs>
      <motion.circle
        cx="200"
        cy="200"
        r="180"
        fill="url(#orbGradient)"
        filter="url(#blur)"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

// Abstract wave decoration
function WaveDecoration() {
  return (
    <motion.svg
      viewBox="0 0 1200 120"
      className="absolute bottom-0 left-0 w-full h-24 opacity-10"
      preserveAspectRatio="none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 0.1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      <path
        d="M0,60 C300,120 400,0 600,60 C800,120 900,0 1200,60 L1200,120 L0,120 Z"
        fill="url(#waveGradient)"
      />
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gray-950" />

      {/* Animated gradient orb */}
      <GradientOrb />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8"
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-violet-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm text-violet-300 font-medium">
            AI-Powered Learning
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1] tracking-tight mb-8"
        >
          <span className="block text-white">Learn anything</span>
          <motion.span
            className="block bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
          >
            with AI
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed"
        >
          Personalized courses crafted by AI. Chat with your tutor,
          take adaptive quizzes, and sync with Notion.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <SignedOut>
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/20"
            >
              <span className="relative z-10">Start Learning</span>
              <HiArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 text-gray-400 hover:text-white font-medium transition-colors duration-300"
            >
              See how it works
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/20"
            >
              <span className="relative z-10">Go to Dashboard</span>
              <HiArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </SignedIn>
        </motion.div>
      </motion.div>

      {/* Wave decoration */}
      <WaveDecoration />
    </section>
  );
}
