"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { HiArrowRight, HiRocketLaunch } from "react-icons/hi2";

export function CTA() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} id="demo" className="relative py-40 bg-slate-950 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Central glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px]"
          style={{
            background: "radial-gradient(ellipse, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.03) 50%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(251, 191, 36, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(251, 191, 36, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating geometric elements */}
      <motion.div
        className="absolute top-20 left-20 w-24 h-24 border border-amber-500/10 rounded-xl"
        animate={{ rotate: 45, y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-16 h-16 border border-amber-500/15 rounded-xl"
        animate={{ rotate: -45, y: [0, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-32 w-3 h-3 bg-amber-400/30 rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/3 left-24 w-2 h-2 bg-amber-500/40 rounded-full"
        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Icon with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, type: "spring" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-10 shadow-xl shadow-amber-500/30"
        >
          <HiRocketLaunch className="w-10 h-10 text-slate-900" />
        </motion.div>

        {/* Headlines */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Prove Your Skills.
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            <motion.span
              className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto]"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              Own the Leaderboard.
            </motion.span>
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-400 mb-10 max-w-xl mx-auto"
        >
          Join thousands of learners who are mastering concepts faster than ever before.
        </motion.p>

        {/* CTA Button with glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SignedOut>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block relative group"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <Link
                href="/sign-up"
                className="relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold text-lg rounded-xl shadow-2xl shadow-amber-500/30"
              >
                <span>Start the Challenge</span>
                <HiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </SignedOut>
          <SignedIn>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block relative group"
            >
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <Link
                href="/dashboard"
                className="relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold text-lg rounded-xl shadow-2xl shadow-amber-500/30"
              >
                <span>Continue Learning</span>
                <HiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </SignedIn>
        </motion.div>

        {/* Trust badge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-sm text-slate-500"
        >
          Free to start • No credit card required
        </motion.p>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
    </section>
  );
}
