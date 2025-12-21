"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { HiXMark, HiCheck, HiSparkles } from "react-icons/hi2";

const comparisons = [
  {
    aspect: "When Stuck",
    oldWay: "Gives you the code/answer.",
    kortexWay: "Guides you to the solution.",
  },
  {
    aspect: "Reliability",
    oldWay: '"Hallucinations" are common.',
    kortexWay: "100% Grounded in course material.",
  },
  {
    aspect: "The Vibe",
    oldWay: "Boring text paragraphs.",
    kortexWay: "Interactive 3D Visualizations.",
  },
  {
    aspect: "Exam Day",
    oldWay: '"I forgot everything."',
    kortexWay: '"I\'ve seen this before."',
  },
];

export function Comparison() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-32 bg-slate-950 overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
          >
            <HiSparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">Why Kortex?</span>
          </motion.div>

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
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Kortex Makes You Unstoppable.
            </span>
          </motion.h2>
        </div>

        {/* Two Column Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-8 md:gap-12"
        >
          {/* Old Way Column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <HiXMark className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-400">The Old Way</h3>
            </div>

            <div className="space-y-1">
              {comparisons.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="group relative"
                >
                  {/* Glowing border line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800" />

                  <div className="pl-6 py-4 border-b border-slate-800/50">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">
                      {item.aspect}
                    </p>
                    <p className="text-slate-400">{item.oldWay}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Kortex Way Column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
                animate={{
                  boxShadow: [
                    "0 10px 25px -5px rgba(251, 191, 36, 0.3)",
                    "0 10px 35px -5px rgba(251, 191, 36, 0.5)",
                    "0 10px 25px -5px rgba(251, 191, 36, 0.3)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <HiCheck className="w-4 h-4 text-slate-900" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white">The Kortex Way</h3>
            </div>

            <div className="space-y-1">
              {comparisons.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="group relative"
                >
                  {/* Glowing amber border line */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-px"
                    style={{
                      background: "linear-gradient(to bottom, transparent, rgba(251, 191, 36, 0.5), transparent)",
                    }}
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  />

                  <div className="pl-6 py-4 border-b border-amber-500/10">
                    <p className="text-xs font-medium text-amber-500/70 uppercase tracking-wider mb-1">
                      {item.aspect}
                    </p>
                    <p className="text-white font-medium">{item.kortexWay}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
