"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { HiXMark, HiCheck } from "react-icons/hi2";

const comparisons = [
  {
    feature: "The Goal",
    generic: "Finish your homework fast.",
    kortex: "Master the Course Outcome.",
  },
  {
    feature: "The Source",
    generic: "Random internet hallucinations.",
    kortex: "Curated MIT/IIT & Faculty Notes.",
  },
  {
    feature: "The Method",
    generic: "Dumps text blocks.",
    kortex: "Socratic Questioning & Visuals.",
  },
  {
    feature: "Retention",
    generic: "Gone in 24 hours.",
    kortex: "Spaced Repetition & Gamified XP.",
  },
];

export function Comparison() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-32 bg-slate-950">
      {/* Gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-amber-400 font-medium mb-4"
          >
            Why Kortex?
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Generic AI Makes You Lazy.
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold"
          >
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Kortex Makes You Unstoppable.
            </span>
          </motion.h2>
        </div>

        {/* Comparison cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Generic AI Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <HiXMark className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-400">
                Generic Chatbots
              </h3>
            </div>
            <div className="space-y-4">
              {comparisons.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="p-4 rounded-lg bg-slate-800/50"
                >
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    {item.feature}
                  </p>
                  <p className="text-slate-400">{item.generic}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Kortex Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-slate-900/50 border border-amber-500/20 relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <HiCheck className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Kortex (The Engine)
                </h3>
              </div>
              <div className="space-y-4">
                {comparisons.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg bg-slate-800/80 border border-amber-500/10 hover:border-amber-500/30 transition-colors"
                  >
                    <p className="text-xs text-amber-400/70 uppercase tracking-wider mb-1">
                      {item.feature}
                    </p>
                    <p className="text-white font-medium">{item.kortex}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
