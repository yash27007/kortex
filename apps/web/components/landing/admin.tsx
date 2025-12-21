"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

// Course Generation Animation
function CourseGenAnimation() {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="adminGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* PDF icon */}
      <motion.rect
        x="10"
        y="15"
        width="25"
        height="32"
        rx="3"
        fill="#1e293b"
        stroke="#475569"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 10, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.text
        x="22"
        y="35"
        textAnchor="middle"
        fontSize="8"
        fill="#64748b"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        PDF
      </motion.text>
      {/* Arrow */}
      <motion.path
        d="M40 32 L50 32"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      />
      <motion.path
        d="M47 28 L51 32 L47 36"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      />
      {/* Generated course cards */}
      <motion.g
        initial={{ x: 10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <rect x="55" y="12" width="18" height="14" rx="2" fill="url(#adminGrad1)" />
        <rect x="55" y="29" width="18" height="14" rx="2" fill="#334155" />
        <rect x="55" y="46" width="18" height="14" rx="2" fill="#334155" />
      </motion.g>
      {/* Sparkle */}
      <motion.path
        d="M68 8 L69 11 L72 12 L69 13 L68 16 L67 13 L64 12 L67 11 Z"
        fill="#fbbf24"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: "68px 12px" }}
      />
    </svg>
  );
}

// Outcome Mapping Animation
function OutcomeMappingAnimation() {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="adminGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* CO boxes */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <rect x="8" y="20" width="20" height="12" rx="2" fill="#334155" />
        <text x="18" y="28" textAnchor="middle" fontSize="6" fill="#94a3b8">CO1</text>
        <rect x="8" y="36" width="20" height="12" rx="2" fill="#334155" />
        <text x="18" y="44" textAnchor="middle" fontSize="6" fill="#94a3b8">CO2</text>
        <rect x="8" y="52" width="20" height="12" rx="2" fill="#334155" />
        <text x="18" y="60" textAnchor="middle" fontSize="6" fill="#94a3b8">CO3</text>
      </motion.g>
      {/* Connecting lines */}
      <motion.path
        d="M28 26 L42 26 M28 42 L42 42 M28 58 L42 58"
        stroke="#fbbf24"
        strokeWidth="1"
        strokeDasharray="3 2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      {/* Quiz icons */}
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <rect x="45" y="18" width="28" height="16" rx="3" fill="url(#adminGrad2)" />
        <text x="59" y="28" textAnchor="middle" fontSize="5" fill="#0f172a" fontWeight="bold">Quiz 1</text>
        <rect x="45" y="38" width="28" height="16" rx="3" fill="#475569" />
        <text x="59" y="48" textAnchor="middle" fontSize="5" fill="#94a3b8">Quiz 2</text>
        <rect x="45" y="58" width="28" height="16" rx="3" fill="#475569" />
        <text x="59" y="68" textAnchor="middle" fontSize="5" fill="#94a3b8">Quiz 3</text>
      </motion.g>
      {/* Check marks */}
      <motion.path
        d="M69 22 L71 24 L75 20"
        stroke="#0f172a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      />
    </svg>
  );
}

// Hallucination Firewall Animation
function FirewallAnimation() {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <motion.path
        d="M40 12 L60 20 L60 42 C60 55 40 65 40 65 C40 65 20 55 20 42 L20 20 Z"
        fill="url(#shieldGrad)"
        stroke="#fbbf24"
        strokeWidth="1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        style={{ transformOrigin: "40px 40px" }}
      />
      {/* Lock icon */}
      <motion.rect
        x="33"
        y="35"
        width="14"
        height="12"
        rx="2"
        fill="#0f172a"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      />
      <motion.path
        d="M36 35 L36 30 C36 26 44 26 44 30 L44 35"
        stroke="#0f172a"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      />
      {/* Blocked items */}
      <motion.g
        animate={{ x: [0, -3, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        <circle cx="10" cy="35" r="4" fill="#ef4444" fillOpacity="0.3" />
        <path d="M8 33 L12 37 M12 33 L8 37" stroke="#ef4444" strokeWidth="1" />
      </motion.g>
      <motion.g
        animate={{ x: [0, -3, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2, delay: 0.5 }}
      >
        <circle cx="10" cy="50" r="4" fill="#ef4444" fillOpacity="0.3" />
        <path d="M8 48 L12 52 M12 48 L8 52" stroke="#ef4444" strokeWidth="1" />
      </motion.g>
      {/* Checkmark for verified */}
      <motion.path
        d="M65 35 L68 38 L74 32"
        stroke="#10b981"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      />
      <text x="70" y="50" textAnchor="middle" fontSize="6" fill="#10b981">Verified</text>
    </svg>
  );
}

const adminFeatures = [
  {
    title: "Instant Course Gen",
    description: "Upload a single PDF or YouTube playlist. Kortex generates a full 4-week syllabus, quizzes, and lesson plans in under 60 seconds.",
    animation: CourseGenAnimation,
  },
  {
    title: "Outcome Mapping",
    description: "Define your 'Course Outcomes' (COs), and Kortex ensures every quiz question maps back to a specific CO for accreditation.",
    animation: OutcomeMappingAnimation,
  },
  {
    title: "Hallucination Firewall",
    description: "Restrict the AI to answer only from the material you provide. No random internet guesses—only verified content.",
    animation: FirewallAnimation,
  },
];

const studentBenefits = [
  {
    metric: "3x",
    label: "Faster Concept Mastery",
    description: "Visual learning + Socratic method",
  },
  {
    metric: "94%",
    label: "Quiz Pass Rate",
    description: "Adaptive difficulty matching",
  },
  {
    metric: "2hrs",
    label: "Saved Per Week",
    description: "No more searching for resources",
  },
  {
    metric: "100%",
    label: "Syllabus Coverage",
    description: "AI ensures nothing is missed",
  },
];

export function Admin() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[120px]" />

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
            For Educators
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Turn Content into Curriculum
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-400"
          >
            in Minutes, Not Months
          </motion.p>
        </div>

        {/* Educator Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {adminFeatures.map((feature, index) => {
            const Animation = feature.animation;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all"
              >
                {/* Animation */}
                <div className="h-20 mb-6">
                  <Animation />
                </div>

                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Student Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative"
        >
          {/* Section header */}
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              How Your Students{" "}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Benefit
              </span>
            </h3>
            <p className="text-slate-400">
              Real results from AI-powered personalized learning
            </p>
          </div>

          {/* Benefits grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {studentBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/20 transition-all"
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                >
                  {benefit.metric}
                </motion.div>
                <div className="text-white font-medium mb-1">{benefit.label}</div>
                <div className="text-xs text-slate-500">{benefit.description}</div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}
