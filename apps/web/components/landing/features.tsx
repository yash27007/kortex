"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

// SVG Illustrations for each feature
const ChatbotIllustration = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full">
    <defs>
      <linearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    {/* Chat bubbles */}
    <motion.rect
      x="15"
      y="30"
      width="55"
      height="25"
      rx="12"
      fill="#374151"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    />
    <motion.rect
      x="50"
      y="65"
      width="55"
      height="25"
      rx="12"
      fill="url(#chatGrad)"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    />
    {/* Typing dots */}
    <motion.circle
      cx="35"
      cy="42"
      r="3"
      fill="#9ca3af"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
    />
    <motion.circle
      cx="45"
      cy="42"
      r="3"
      fill="#9ca3af"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
    />
    <motion.circle
      cx="55"
      cy="42"
      r="3"
      fill="#9ca3af"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
    />
    {/* AI sparkle */}
    <motion.path
      d="M95 25 L97 30 L102 32 L97 34 L95 39 L93 34 L88 32 L93 30 Z"
      fill="#a78bfa"
      animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ transformOrigin: "95px 32px" }}
    />
  </svg>
);

const QuizIllustration = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full">
    <defs>
      <linearGradient id="quizGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Card background */}
    <rect x="20" y="20" width="80" height="80" rx="12" fill="#1f2937" />
    {/* Question mark */}
    <motion.text
      x="60"
      y="55"
      textAnchor="middle"
      fontSize="28"
      fontWeight="bold"
      fill="#6b7280"
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      ?
    </motion.text>
    {/* Checkboxes */}
    <rect x="30" y="65" width="14" height="14" rx="3" fill="#374151" />
    <rect x="50" y="65" width="14" height="14" rx="3" fill="#374151" />
    <motion.rect
      x="70"
      y="65"
      width="14"
      height="14"
      rx="3"
      fill="url(#quizGrad)"
      initial={{ scale: 0.8 }}
      animate={{ scale: [0.8, 1, 0.8] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{ transformOrigin: "77px 72px" }}
    />
    {/* Checkmark */}
    <motion.path
      d="M73 72 L76 75 L81 69"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    />
    {/* Progress bar */}
    <rect x="30" y="85" width="60" height="4" rx="2" fill="#374151" />
    <motion.rect
      x="30"
      y="85"
      width="40"
      height="4"
      rx="2"
      fill="url(#quizGrad)"
      initial={{ width: 0 }}
      animate={{ width: 40 }}
      transition={{ duration: 1, delay: 0.3 }}
    />
  </svg>
);

const NotionIllustration = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full">
    <defs>
      <linearGradient id="notionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
    </defs>
    {/* Notion-style page */}
    <rect x="25" y="20" width="70" height="80" rx="8" fill="#1f2937" />
    {/* Icon placeholder */}
    <motion.rect
      x="35"
      y="30"
      width="20"
      height="20"
      rx="4"
      fill="url(#notionGrad)"
      animate={{ rotate: [0, 5, 0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity }}
      style={{ transformOrigin: "45px 40px" }}
    />
    {/* Title line */}
    <rect x="60" y="35" width="25" height="4" rx="2" fill="#4b5563" />
    <rect x="60" y="43" width="18" height="3" rx="1.5" fill="#374151" />
    {/* Content lines with animation */}
    <motion.rect
      x="35"
      y="60"
      width="50"
      height="3"
      rx="1.5"
      fill="#374151"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    />
    <motion.rect
      x="35"
      y="68"
      width="40"
      height="3"
      rx="1.5"
      fill="#374151"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    />
    <motion.rect
      x="35"
      y="76"
      width="45"
      height="3"
      rx="1.5"
      fill="#374151"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    />
    {/* Sync arrows */}
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: "100px 25px" }}
    >
      <circle cx="100" cy="25" r="10" fill="#374151" />
      <path
        d="M96 25 A4 4 0 1 1 104 25"
        stroke="#10b981"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M103 23 L104 25 L102 26" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" />
    </motion.g>
  </svg>
);

const CourseIllustration = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full">
    <defs>
      <linearGradient id="courseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    {/* Book/Course stack */}
    <motion.rect
      x="30"
      y="70"
      width="60"
      height="12"
      rx="3"
      fill="#4b5563"
      initial={{ y: 80 }}
      animate={{ y: 70 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    />
    <motion.rect
      x="28"
      y="55"
      width="64"
      height="12"
      rx="3"
      fill="#6b7280"
      initial={{ y: 70 }}
      animate={{ y: 55 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    />
    <motion.rect
      x="26"
      y="40"
      width="68"
      height="12"
      rx="3"
      fill="url(#courseGrad)"
      initial={{ y: 60 }}
      animate={{ y: 40 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    />
    {/* AI magic effect */}
    <motion.g
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.path
        d="M60 20 L62 28 L70 30 L62 32 L60 40 L58 32 L50 30 L58 28 Z"
        fill="#a78bfa"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: "60px 30px" }}
      />
    </motion.g>
    {/* Small sparkles */}
    <motion.circle
      cx="40"
      cy="28"
      r="2"
      fill="#c4b5fd"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
    <motion.circle
      cx="80"
      cy="35"
      r="1.5"
      fill="#c4b5fd"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
    />
  </svg>
);

const features = [
  {
    title: "AI Chatbot Tutor",
    description:
      "Ask questions anytime. Our AI tutor explains concepts, provides examples, and guides you through difficult topics.",
    illustration: ChatbotIllustration,
  },
  {
    title: "Personalized Quizzes",
    description:
      "Adaptive assessments that learn from your progress. Questions adjust to your level for optimal learning.",
    illustration: QuizIllustration,
  },
  {
    title: "Notion Integration",
    description:
      "Sync your learning notes directly to Notion. Keep everything organized in your favorite workspace.",
    illustration: NotionIllustration,
  },
  {
    title: "AI-Generated Courses",
    description:
      "Tell us what you want to learn. Our AI creates comprehensive, structured courses tailored to your goals.",
    illustration: CourseIllustration,
  },
];

export function Features() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      id="features"
      className="relative py-32 bg-gray-950"
    >
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-violet-400 font-medium mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Everything you need to learn
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 max-w-lg mx-auto"
          >
            A complete learning ecosystem powered by AI
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  isInView,
}: {
  feature: (typeof features)[0];
  index: number;
  isInView: boolean;
}) {
  const Illustration = feature.illustration;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      whileHover={{ y: -4 }}
      className="group relative p-8 rounded-3xl bg-gray-900/50 border border-white/5 hover:border-white/10 transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Illustration */}
        <div className="w-24 h-24 flex-shrink-0">
          <Illustration />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-3">
            {feature.title}
          </h3>
          <p className="text-gray-400 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
