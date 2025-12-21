"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

// Step 1: Ingestion - PDF to binary animation
function IngestionAnimation() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Document icon */}
      <motion.g
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <rect x="15" y="20" width="30" height="40" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <rect x="20" y="28" width="20" height="2" rx="1" fill="#475569" />
        <rect x="20" y="34" width="15" height="2" rx="1" fill="#475569" />
        <rect x="20" y="40" width="18" height="2" rx="1" fill="#475569" />
        <rect x="20" y="46" width="12" height="2" rx="1" fill="#475569" />
      </motion.g>

      {/* Arrow */}
      <motion.path
        d="M50 40 L65 40"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.path
        d="M62 36 L66 40 L62 44"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />

      {/* Binary code */}
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {["101", "010", "110", "001"].map((binary, i) => (
          <motion.text
            key={i}
            x="80"
            y={28 + i * 12}
            fontSize="10"
            fill="#fbbf24"
            fontFamily="monospace"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          >
            {binary}
          </motion.text>
        ))}
      </motion.g>
    </svg>
  );
}

// Step 2: Bloom's Taxonomy Pyramid
function BloomsPyramidAnimation() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="pyramidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      {/* Pyramid layers */}
      {[
        { y: 70, width: 80, label: "Remember", delay: 0 },
        { y: 55, width: 65, label: "Understand", delay: 0.1 },
        { y: 40, width: 50, label: "Apply", delay: 0.2 },
        { y: 25, width: 35, label: "Analyze", delay: 0.3 },
        { y: 10, width: 20, label: "Create", delay: 0.4 },
      ].map((layer, i) => (
        <motion.g key={i}>
          <motion.rect
            x={(120 - layer.width) / 2}
            y={layer.y}
            width={layer.width}
            height="12"
            rx="2"
            fill={i === 4 ? "url(#pyramidGrad)" : "#1e293b"}
            stroke={i === 4 ? "#fbbf24" : "#334155"}
            strokeWidth="1"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: layer.delay }}
          />
          <motion.text
            x="60"
            y={layer.y + 9}
            textAnchor="middle"
            fontSize="6"
            fill={i === 4 ? "#fbbf24" : "#64748b"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: layer.delay + 0.2 }}
          >
            {layer.label}
          </motion.text>
        </motion.g>
      ))}

      {/* Sparkle at top */}
      <motion.path
        d="M60 5 L61 8 L64 9 L61 10 L60 13 L59 10 L56 9 L59 8 Z"
        fill="#fbbf24"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: "60px 9px" }}
      />
    </svg>
  );
}

// Step 3: Socratic Loop - Chat to lightbulb
function SocraticLoopAnimation() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="bulbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Chat bubble */}
      <motion.g
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <rect x="10" y="25" width="35" height="30" rx="8" fill="#1e293b" stroke="#334155" />
        <polygon points="20,55 25,62 30,55" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <text x="27" y="44" textAnchor="middle" fontSize="16" fill="#64748b">?</text>
      </motion.g>

      {/* Arrow with loop */}
      <motion.path
        d="M50 40 C60 40, 65 30, 65 40 C65 50, 70 40, 75 40"
        stroke="#fbbf24"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {/* Lightbulb */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {/* Bulb shape */}
        <motion.circle
          cx="95"
          cy="35"
          r="15"
          fill="url(#bulbGrad)"
          animate={{
            filter: ["drop-shadow(0 0 5px #fbbf24)", "drop-shadow(0 0 15px #fbbf24)", "drop-shadow(0 0 5px #fbbf24)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <rect x="90" y="50" width="10" height="8" rx="2" fill="#334155" />
        {/* Light rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.line
            key={i}
            x1={95 + 20 * Math.cos((angle * Math.PI) / 180)}
            y1={35 + 20 * Math.sin((angle * Math.PI) / 180)}
            x2={95 + 25 * Math.cos((angle * Math.PI) / 180)}
            y2={35 + 25 * Math.sin((angle * Math.PI) / 180)}
            stroke="#fbbf24"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
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
    title: "The Bloom's Filter (The Structure)",
    description: "Our AI doesn't just read; it structures. It breaks every course into a Skill Tree mapped to Bloom's Taxonomy—from 'Remembering' definitions to 'Creating' new systems.",
    animation: BloomsPyramidAnimation,
  },
  {
    number: "03",
    title: "The Socratic Loop (The Guide)",
    description: "When you get stuck, Kortex doesn't give the answer. It asks the right question to nudge you toward the solution, reinforcing your neural pathways.",
    animation: SocraticLoopAnimation,
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-32 bg-slate-950">
      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-amber-400 font-medium mb-4"
          >
            The Context Engine
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Powered by the{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              "Twin-Engine"
            </span>{" "}
            Architecture
          </motion.h2>
        </div>

        {/* Steps - horizontal flow */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Animation = step.animation;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/20 transition-colors"
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">{step.number}</span>
                </div>

                {/* Animation */}
                <div className="h-28 mb-6">
                  <Animation />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>

                {/* Arrow connector (hidden on last) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8">
                    <motion.svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-500/30">
                      <path
                        d="M9 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
