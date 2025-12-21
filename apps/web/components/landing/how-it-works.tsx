"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

// Step illustrations with beautiful animations - using static values to avoid hydration errors
const StepOneIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full">
    <defs>
      <linearGradient id="inputGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      <clipPath id="textClip">
        <rect x="30" y="68" width="120" height="24" />
      </clipPath>
    </defs>
    {/* Input field */}
    <rect x="20" y="60" width="160" height="40" rx="20" fill="#1f2937" />
    <rect x="20" y="60" width="160" height="40" rx="20" stroke="#374151" strokeWidth="1" fill="none" />
    {/* Typing animation - clipped to stay inside */}
    <g clipPath="url(#textClip)">
      <motion.text
        x="35"
        y="85"
        fontSize="11"
        fill="#9ca3af"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Automata and compiler design
      </motion.text>
    </g>
    {/* Cursor */}
    <motion.rect
      x="158"
      y="70"
      width="2"
      height="20"
      fill="#8b5cf6"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
    {/* Sparkle decoration */}
    <motion.path
      d="M170 40 L172 46 L178 48 L172 50 L170 56 L168 50 L162 48 L168 46 Z"
      fill="#a78bfa"
      animate={{ scale: [1, 1.3, 1], rotate: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ transformOrigin: "170px 48px" }}
    />
  </svg>
);

const StepTwoIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full">
    <defs>
      <linearGradient id="processGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    {/* Central brain/AI icon */}
    <motion.circle
      cx="100"
      cy="80"
      r="35"
      fill="url(#processGrad)"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    {/* Neural connections - using pre-calculated static values */}
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: "100px 80px" }}
    >
      {/* Pre-calculated positions for angles: 0, 60, 120, 180, 240, 300 degrees */}
      <motion.circle cx="150" cy="80" r="6" fill="#4b5563" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} />
      <motion.circle cx="125" cy="123" r="6" fill="#4b5563" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
      <motion.circle cx="75" cy="123" r="6" fill="#4b5563" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
      <motion.circle cx="50" cy="80" r="6" fill="#4b5563" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} />
      <motion.circle cx="75" cy="37" r="6" fill="#4b5563" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }} />
      <motion.circle cx="125" cy="37" r="6" fill="#4b5563" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }} />
    </motion.g>
    {/* Connection lines - static values */}
    <line x1="100" y1="80" x2="150" y2="80" stroke="#374151" strokeWidth="1" />
    <line x1="100" y1="80" x2="125" y2="123" stroke="#374151" strokeWidth="1" />
    <line x1="100" y1="80" x2="75" y2="123" stroke="#374151" strokeWidth="1" />
    <line x1="100" y1="80" x2="50" y2="80" stroke="#374151" strokeWidth="1" />
    <line x1="100" y1="80" x2="75" y2="37" stroke="#374151" strokeWidth="1" />
    <line x1="100" y1="80" x2="125" y2="37" stroke="#374151" strokeWidth="1" />
    {/* Center icon */}
    <motion.path
      d="M92 80 L98 86 L108 74"
      stroke="white"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    />
  </svg>
);

const StepThreeIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full">
    <defs>
      <linearGradient id="learnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Course cards stack */}
    <motion.g
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <rect x="30" y="90" width="140" height="50" rx="8" fill="#1f2937" />
      <rect x="40" y="100" width="60" height="4" rx="2" fill="#4b5563" />
      <rect x="40" y="110" width="40" height="3" rx="1.5" fill="#374151" />
      <rect x="40" y="118" width="50" height="3" rx="1.5" fill="#374151" />
      <motion.rect
        x="120"
        y="105"
        width="35"
        height="20"
        rx="4"
        fill="url(#learnGrad)"
        whileHover={{ scale: 1.05 }}
      />
      <text x="137" y="118" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">
        START
      </text>
    </motion.g>
    {/* Progress indicator */}
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <circle cx="100" cy="50" r="25" fill="#1f2937" />
      <motion.circle
        cx="100"
        cy="50"
        r="20"
        fill="none"
        stroke="#374151"
        strokeWidth="4"
      />
      <motion.circle
        cx="100"
        cy="50"
        r="20"
        fill="none"
        stroke="url(#learnGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="126"
        initial={{ strokeDashoffset: 126 }}
        animate={{ strokeDashoffset: 30 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "100px 50px" }}
      />
      <text x="100" y="54" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        75%
      </text>
    </motion.g>
    {/* XP badge */}
    <motion.g
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <rect x="145" y="30" width="40" height="20" rx="10" fill="#8b5cf6" />
      <text x="165" y="44" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
        +50 XP
      </text>
    </motion.g>
  </svg>
);

const steps = [
  {
    number: "01",
    title: "Tell us what to learn",
    description: "Enter any topic. AI understands context and creates the perfect curriculum for you.",
    illustration: StepOneIllustration,
  },
  {
    number: "02",
    title: "AI generates your course",
    description: "Watch as AI crafts personalized lessons, quizzes, and projects tailored to your level.",
    illustration: StepTwoIllustration,
  },
  {
    number: "03",
    title: "Start learning",
    description: "Dive in, earn XP, chat with your AI tutor, and track your progress as you master new skills.",
    illustration: StepThreeIllustration,
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-32 bg-gray-950">
      {/* Top gradient line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-violet-400 font-medium mb-4"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            Three simple steps
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, index) => {
            const Illustration = step.illustration;
            const isEven = index % 2 === 1;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                className={`flex flex-col ${isEven ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12`}
              >
                {/* Illustration */}
                <div className="w-full md:w-1/2 h-48">
                  <Illustration />
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <span className="inline-block text-6xl font-bold text-white/5 mb-4">
                    {step.number}
                  </span>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
