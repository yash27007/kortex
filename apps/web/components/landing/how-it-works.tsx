"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { HiSparkles } from "react-icons/hi2";

// Step 1: Ingestion - PDF to structured data animation
function IngestionAnimation() {
  return (
    <svg viewBox="0 0 120 95" className="w-full h-full">
      <defs>
        <linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="docGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Document icon with shadow */}
      <motion.g
        initial={{ x: -15, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <rect x="12" y="18" width="32" height="42" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        <rect x="12" y="18" width="32" height="10" rx="4" fill="#1e293b" />
        <rect x="18" y="32" width="20" height="3" rx="1.5" fill="#475569" />
        <rect x="18" y="38" width="16" height="2" rx="1" fill="#3f4f63" />
        <rect x="18" y="43" width="18" height="2" rx="1" fill="#3f4f63" />
        <rect x="18" y="48" width="12" height="2" rx="1" fill="#3f4f63" />
      </motion.g>

      {/* Animated arrow with particles */}
      <motion.g>
        <motion.path
          d="M48 40 L68 40"
          stroke="url(#docGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
        <motion.path
          d="M64 35 L69 40 L64 45"
          stroke="url(#docGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
        {/* Data particles */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            r="2"
            fill="#fbbf24"
            filter="url(#docGlow)"
            initial={{ cx: 48, cy: 40, opacity: 0 }}
            animate={{ cx: 68, cy: 40, opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </motion.g>

      {/* Binary/structured output */}
      <motion.g
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <rect x="74" y="22" width="36" height="36" rx="4" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.3" />
        {["101", "010", "110"].map((binary, i) => (
          <motion.text
            key={i}
            x="92"
            y={35 + i * 10}
            textAnchor="middle"
            fontSize="9"
            fill="#fbbf24"
            fontFamily="monospace"
            fontWeight="bold"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          >
            {binary}
          </motion.text>
        ))}
      </motion.g>
    </svg>
  );
}

// Step 2: Bloom's Taxonomy Pyramid - Enhanced
function BloomsPyramidAnimation() {
  const layers = [
    { y: 72, width: 90, label: "Remember", color: "#334155" },
    { y: 58, width: 72, label: "Understand", color: "#3f4f63" },
    { y: 44, width: 56, label: "Apply", color: "#475569" },
    { y: 30, width: 40, label: "Analyze", color: "#64748b" },
    { y: 16, width: 24, label: "Create", color: "#fbbf24", active: true },
  ];

  return (
    <svg viewBox="0 0 120 95" className="w-full h-full">
      <defs>
        <linearGradient id="pyramidGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <filter id="pyramidGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Pyramid layers with stagger animation */}
      {layers.map((layer, i) => (
        <motion.g key={i}>
          <motion.rect
            x={(120 - layer.width) / 2}
            y={layer.y}
            width={layer.width}
            height="12"
            rx="3"
            fill={layer.active ? "url(#pyramidGradient)" : layer.color}
            stroke={layer.active ? "#fbbf24" : "transparent"}
            strokeWidth={layer.active ? "1.5" : "0"}
            filter={layer.active ? "url(#pyramidGlow)" : "none"}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
          {layer.active && (
            <motion.rect
              x={(120 - layer.width) / 2}
              y={layer.y}
              width={layer.width}
              height="12"
              rx="3"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <motion.text
            x="60"
            y={layer.y + 9}
            textAnchor="middle"
            fontSize="6"
            fontWeight={layer.active ? "bold" : "normal"}
            fill={layer.active ? "#0f172a" : "#94a3b8"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 + 0.3 }}
          >
            {layer.label}
          </motion.text>
        </motion.g>
      ))}

      {/* Sparkle at top */}
      <motion.g
        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: "60px 8px" }}
      >
        <motion.path
          d="M60 4 L61 7 L64 8 L61 9 L60 12 L59 9 L56 8 L59 7 Z"
          fill="#fbbf24"
          filter="url(#pyramidGlow)"
        />
      </motion.g>
    </svg>
  );
}

// Step 3: Socratic Loop - Question to insight
function SocraticLoopAnimation() {
  return (
    <svg viewBox="0 0 120 95" className="w-full h-full">
      <defs>
        <linearGradient id="bulbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="bulbGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Chat bubble with question */}
      <motion.g
        initial={{ x: -15, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <rect x="8" y="22" width="38" height="32" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        <polygon points="18,54 24,62 30,54" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <motion.text
          x="27"
          y="44"
          textAnchor="middle"
          fontSize="20"
          fill="#64748b"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ?
        </motion.text>
      </motion.g>

      {/* Curved arrow with loop effect */}
      <motion.path
        d="M50 40 C58 35, 62 30, 65 38 C68 46, 72 40, 78 40"
        stroke="#fbbf24"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {/* Lightbulb with glow */}
      <motion.g
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
      >
        {/* Outer glow ring */}
        <motion.circle
          cx="96"
          cy="35"
          r="22"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1"
          strokeOpacity="0.2"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Bulb */}
        <motion.circle
          cx="96"
          cy="35"
          r="16"
          fill="url(#bulbGradient)"
          filter="url(#bulbGlow)"
          animate={{ filter: ["drop-shadow(0 0 8px #fbbf24)", "drop-shadow(0 0 16px #fbbf24)", "drop-shadow(0 0 8px #fbbf24)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Inner highlight */}
        <circle cx="92" cy="31" r="5" fill="rgba(255,255,255,0.3)" />
        {/* Base */}
        <rect x="90" y="51" width="12" height="8" rx="2" fill="#334155" />

        {/* Light rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.line
            key={i}
            x1={96 + 22 * Math.cos((angle * Math.PI) / 180)}
            y1={35 + 22 * Math.sin((angle * Math.PI) / 180)}
            x2={96 + 28 * Math.cos((angle * Math.PI) / 180)}
            y2={35 + 28 * Math.sin((angle * Math.PI) / 180)}
            stroke="#fbbf24"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
      </motion.g>
    </svg>
  );
}

const steps = [
  {
    number: "01",
    title: "Ingestion (The Truth)",
    description: "Your faculty uploads the 'Gold Standard' material—textbooks, MIT OpenCourseWare notes, and verified research. We don't guess; we know.",
    animation: IngestionAnimation,
  },
  {
    number: "02",
    title: "The Bloom's Filter",
    description: "Our AI structures every course into a Skill Tree mapped to Bloom's Taxonomy—from 'Remembering' definitions to 'Creating' new systems.",
    animation: BloomsPyramidAnimation,
  },
  {
    number: "03",
    title: "The Socratic Loop",
    description: "When you get stuck, Kortex doesn't give the answer. It asks the right question to nudge you toward the solution, reinforcing your neural pathways.",
    animation: SocraticLoopAnimation,
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-32 bg-slate-950 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-0 w-[250px] h-[250px] bg-amber-600/5 rounded-full blur-[100px]" />

      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
          >
            <HiSparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">The Context Engine</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Powered by the{" "}
            <motion.span
              className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto]"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              "Twin-Engine"
            </motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-400"
          >
            Architecture
          </motion.p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Animation = step.animation;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                whileHover={{ y: -6 }}
                className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30 transition-all duration-300"
              >
                {/* Step number badge */}
                <motion.div
                  className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-sm font-bold text-slate-900">{step.number}</span>
                </motion.div>

                {/* Animation container */}
                <div className="h-32 mb-6 rounded-xl bg-slate-800/30 p-2">
                  <Animation />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>

                {/* Connector arrow (hidden on last) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-5 z-10">
                    <motion.svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path
                        d="M9 5l7 7-7 7"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeOpacity="0.4"
                      />
                    </motion.svg>
                  </div>
                )}

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/0 to-amber-600/0 group-hover:from-amber-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
