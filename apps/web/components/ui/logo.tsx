"use client";

import { motion } from "motion/react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function Logo({ size = "md", animated = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className="flex items-center gap-2 group">
      {/* Animated AI Brain Logo */}
      <motion.svg
        viewBox="0 0 40 40"
        className={`${sizeClasses[size]} aspect-square`}
        initial={animated ? { opacity: 0, scale: 0.8 } : {}}
        animate={animated ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        <defs>
          {/* Main gradient */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer hexagon ring */}
        <motion.path
          d="M20 2 L35 10 L35 30 L20 38 L5 30 L5 10 Z"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="1.5"
          filter="url(#logoGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Inner neural network */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Center node */}
          <motion.circle
            cx="20"
            cy="20"
            r="4"
            fill="url(#logoGradient)"
            animate={animated ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Surrounding nodes */}
          <circle cx="12" cy="14" r="2" fill="#7c3aed" />
          <circle cx="28" cy="14" r="2" fill="#4f46e5" />
          <circle cx="12" cy="26" r="2" fill="#db2777" />
          <circle cx="28" cy="26" r="2" fill="#7c3aed" />
          <circle cx="20" cy="10" r="2" fill="#4f46e5" />
          <circle cx="20" cy="30" r="2" fill="#db2777" />

          {/* Neural connections */}
          <motion.g
            stroke="url(#logoGradient)"
            strokeWidth="0.8"
            strokeOpacity="0.6"
          >
            <line x1="20" y1="20" x2="12" y2="14" />
            <line x1="20" y1="20" x2="28" y2="14" />
            <line x1="20" y1="20" x2="12" y2="26" />
            <line x1="20" y1="20" x2="28" y2="26" />
            <line x1="20" y1="20" x2="20" y2="10" />
            <line x1="20" y1="20" x2="20" y2="30" />
          </motion.g>
        </motion.g>

        {/* Animated pulse ring */}
        <motion.circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          animate={animated ? { scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.svg>

      {/* Text */}
      <span className={`${textSizes[size]} font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:via-fuchsia-300 group-hover:to-indigo-300 transition-all`}>
        Kortex
      </span>
    </Link>
  );
}
