"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { HiArrowRight } from "react-icons/hi2";

export function CTA() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} id="demo" className="relative py-32 bg-slate-950 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Floating grid squares */}
      <motion.div
        className="absolute top-20 left-20 w-16 h-16 border border-amber-500/10 rounded-lg"
        animate={{ rotate: 45, y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-12 h-12 border border-amber-500/10 rounded-lg"
        animate={{ rotate: -45, y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
            Prove Your Skills.
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Own the Leaderboard.
            </span>
          </h2>

          <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto">
            Don't just read the textbook—engineer the solution. See how fast you can climb the Kortex Leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/20"
              >
                <span>Start the Challenge</span>
                <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/20"
              >
                <span>Start the Challenge</span>
                <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </SignedIn>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
