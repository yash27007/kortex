"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { HiSparkles } from "react-icons/hi2";

// Course Generation Animation - Enhanced
function CourseGenAnimation() {
  return (
    <svg viewBox="0 0 90 85" className="w-full h-full">
      <defs>
        <linearGradient id="adminGenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="adminGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* PDF icon */}
      <motion.g
        initial={{ x: -15, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <rect x="8" y="20" width="28" height="36" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        <rect x="8" y="20" width="28" height="10" rx="4" fill="#1e293b" />
        <motion.text
          x="22"
          y="42"
          textAnchor="middle"
          fontSize="9"
          fill="#64748b"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          PDF
        </motion.text>
      </motion.g>

      {/* Arrow with particles */}
      <motion.g>
        <motion.path
          d="M40 40 L54 40"
          stroke="url(#adminGenGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        />
        <motion.path
          d="M50 35 L55 40 L50 45"
          stroke="url(#adminGenGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        />
        {/* Data particles */}
        {[0, 1].map((i) => (
          <motion.circle
            key={i}
            r="2"
            fill="#fbbf24"
            filter="url(#adminGlow)"
            initial={{ cx: 40, cy: 40, opacity: 0 }}
            animate={{ cx: 54, cy: 40, opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </motion.g>

      {/* Generated course cards */}
      <motion.g
        initial={{ x: 15, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <rect x="60" y="15" width="22" height="16" rx="3" fill="url(#adminGenGrad)" filter="url(#adminGlow)" />
        <rect x="60" y="34" width="22" height="16" rx="3" fill="#334155" stroke="#475569" strokeWidth="0.5" />
        <rect x="60" y="53" width="22" height="16" rx="3" fill="#334155" stroke="#475569" strokeWidth="0.5" />
      </motion.g>

      {/* Sparkle */}
      <motion.path
        d="M77 8 L78 11 L81 12 L78 13 L77 16 L76 13 L73 12 L76 11 Z"
        fill="#fbbf24"
        filter="url(#adminGlow)"
        animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: "77px 12px" }}
      />
    </svg>
  );
}

// Outcome Mapping Animation - Enhanced
function OutcomeMappingAnimation() {
  return (
    <svg viewBox="0 0 90 85" className="w-full h-full">
      <defs>
        <linearGradient id="adminMapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* CO boxes */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {["CO1", "CO2", "CO3"].map((co, i) => (
          <motion.g key={co}>
            <rect x="8" y={20 + i * 18} width="22" height="14" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x="19" y={29 + i * 18} textAnchor="middle" fontSize="7" fill="#94a3b8" fontWeight="medium">{co}</text>
          </motion.g>
        ))}
      </motion.g>

      {/* Connecting lines with animation */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M30 ${27 + i * 18} L46 ${27 + i * 18}`}
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeOpacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
        />
      ))}

      {/* Quiz boxes */}
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <rect x="50" y="17" width="32" height="18" rx="4" fill="url(#adminMapGrad)" />
        <text x="66" y="29" textAnchor="middle" fontSize="6" fill="#0f172a" fontWeight="bold">Quiz 1</text>
        <motion.path
          d="M76 22 L78 24.5 L82 20"
          stroke="#0f172a"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        />

        <rect x="50" y="38" width="32" height="18" rx="4" fill="#334155" stroke="#475569" strokeWidth="0.5" />
        <text x="66" y="50" textAnchor="middle" fontSize="6" fill="#94a3b8">Quiz 2</text>

        <rect x="50" y="59" width="32" height="18" rx="4" fill="#334155" stroke="#475569" strokeWidth="0.5" />
        <text x="66" y="71" textAnchor="middle" fontSize="6" fill="#94a3b8">Quiz 3</text>
      </motion.g>
    </svg>
  );
}

// Hallucination Firewall Animation - Enhanced
function FirewallAnimation() {
  return (
    <svg viewBox="0 0 90 85" className="w-full h-full">
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="shieldGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shield */}
      <motion.path
        d="M45 12 L68 22 L68 46 C68 60 45 72 45 72 C45 72 22 60 22 46 L22 22 Z"
        fill="url(#shieldGradient)"
        stroke="#fbbf24"
        strokeWidth="1.5"
        filter="url(#shieldGlow)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        style={{ transformOrigin: "45px 42px" }}
      />

      {/* Lock icon */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <rect x="37" y="38" width="16" height="14" rx="3" fill="#0f172a" />
        <motion.path
          d="M40 38 L40 32 C40 27 50 27 50 32 L50 38"
          stroke="#0f172a"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        />
        <circle cx="45" cy="45" r="2" fill="#fbbf24" />
      </motion.g>

      {/* Blocked items */}
      {[35, 52].map((y, i) => (
        <motion.g
          key={i}
          animate={{ x: [0, -4, 0] }}
          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2.5, delay: i * 0.5 }}
        >
          <circle cx="10" cy={y} r="5" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5" />
          <path d={`M8 ${y - 2} L12 ${y + 2} M12 ${y - 2} L8 ${y + 2}`} stroke="#ef4444" strokeWidth="1.5" />
        </motion.g>
      ))}

      {/* Verified checkmark */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
      >
        <circle cx="78" cy="42" r="8" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1" />
        <motion.path
          d="M74 42 L77 45 L82 39"
          stroke="#10b981"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        />
      </motion.g>
    </svg>
  );
}

const adminFeatures = [
  {
    title: "Instant Course Gen",
    description: "Upload a PDF or YouTube playlist. Kortex generates a full syllabus, quizzes, and lesson plans in under 60 seconds.",
    animation: CourseGenAnimation,
  },
  {
    title: "Outcome Mapping",
    description: "Define your Course Outcomes, and Kortex ensures every quiz question maps back to a specific CO for accreditation.",
    animation: OutcomeMappingAnimation,
  },
  {
    title: "Hallucination Firewall",
    description: "Restrict the AI to answer only from the material you provide. No random guesses—only verified content.",
    animation: FirewallAnimation,
  },
];

const studentBenefits = [
  { metric: "3x", label: "Faster Mastery", description: "Visual learning + Socratic method" },
  { metric: "94%", label: "Quiz Pass Rate", description: "Adaptive difficulty matching" },
  { metric: "2hrs", label: "Saved Per Week", description: "No more searching for resources" },
  { metric: "100%", label: "Coverage", description: "AI ensures nothing is missed" },
];

export function Admin() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-32 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[180px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[150px]" />

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
            <span className="text-sm text-amber-300 font-medium">For Educators</span>
          </motion.div>

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
        <div className="grid md:grid-cols-3 gap-8 mb-28">
          {adminFeatures.map((feature, index) => {
            const Animation = feature.animation;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 + index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30 transition-all duration-300"
              >
                {/* Animation container */}
                <div className="h-24 mb-6 rounded-xl bg-slate-800/30 p-2">
                  <Animation />
                </div>

                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/5 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>

        {/* Student Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-14">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              How Your Students{" "}
              <motion.span
                className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto]"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                Benefit
              </motion.span>
            </h3>
            <p className="text-slate-400">Real results from AI-powered personalized learning</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {studentBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="text-center p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300"
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
                >
                  {benefit.metric}
                </motion.div>
                <div className="text-white font-semibold mb-1">{benefit.label}</div>
                <div className="text-xs text-slate-500">{benefit.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
