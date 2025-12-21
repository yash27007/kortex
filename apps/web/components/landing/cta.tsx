"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { HiArrowRight } from "react-icons/hi2";

// Decorative floating shapes
const FloatingShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Animated circles */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-violet-600/20 to-transparent blur-3xl"
      animate={{
        x: [0, 30, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-purple-600/20 to-transparent blur-3xl"
      animate={{
        x: [0, -20, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Floating geometric shapes */}
    <motion.svg
      className="absolute top-20 right-20 w-16 h-16 opacity-20"
      viewBox="0 0 100 100"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <polygon points="50,10 90,90 10,90" fill="none" stroke="#8b5cf6" strokeWidth="2" />
    </motion.svg>

    <motion.svg
      className="absolute bottom-32 left-16 w-12 h-12 opacity-20"
      viewBox="0 0 100 100"
      animate={{ rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    >
      <rect x="20" y="20" width="60" height="60" fill="none" stroke="#a78bfa" strokeWidth="2" />
    </motion.svg>

    <motion.svg
      className="absolute top-1/3 left-10 w-8 h-8 opacity-30"
      viewBox="0 0 100 100"
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle cx="50" cy="50" r="40" fill="#8b5cf6" />
    </motion.svg>
  </div>
);

export function CTA() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-32 bg-gray-950 overflow-hidden">
      <FloatingShapes />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Animated icon */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 mb-8"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(139, 92, 246, 0)",
                "0 0 0 20px rgba(139, 92, 246, 0.1)",
                "0 0 0 0 rgba(139, 92, 246, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.svg
              viewBox="0 0 40 40"
              className="w-10 h-10"
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path
                d="M20 5 L22 15 L32 17 L22 19 L20 29 L18 19 L8 17 L18 15 Z"
                fill="#a78bfa"
              />
              <motion.circle
                cx="20"
                cy="17"
                r="4"
                fill="#8b5cf6"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.svg>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to start?
          </h2>

          <p className="text-lg text-gray-400 mb-10 max-w-md mx-auto">
            Join learners using AI to accelerate their education.
          </p>

          <SignedOut>
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/20"
            >
              <span>Get Started Free</span>
              <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/20"
            >
              <span>Go to Dashboard</span>
              <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </SignedIn>

          <p className="mt-6 text-sm text-gray-500">
            No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
