"use client";

import { motion, AnimatePresence } from "motion/react";
import { HiCheck, HiXMark } from "react-icons/hi2";

export interface GenerationStep {
  step_id: string;
  step_name: string;
  status: "pending" | "active" | "completed" | "error";
  message: string;
  progress: number;
}

interface ProgressVisualizationProps {
  steps: GenerationStep[];
  overallProgress: number;
}

export function ProgressVisualization({
  steps,
  overallProgress,
}: ProgressVisualizationProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Overall progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-400">
            Generating course...
          </span>
          <span className="text-sm font-medium text-amber-400">
            {overallProgress}%
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => (
            <motion.div
              key={step.step_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${step.status === "active"
                  ? "bg-amber-500/5 border-amber-500/30"
                  : step.status === "completed"
                    ? "bg-slate-800/30 border-slate-700/50"
                    : step.status === "error"
                      ? "bg-red-500/5 border-red-500/30"
                      : "bg-slate-900/50 border-slate-800/50"
                }`}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 mt-0.5">
                {step.status === "active" && (
                  <motion.div
                    className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                )}
                {step.status === "completed" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <HiCheck className="w-4 h-4 text-white" />
                  </motion.div>
                )}
                {step.status === "error" && (
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <HiXMark className="w-4 h-4 text-white" />
                  </div>
                )}
                {step.status === "pending" && (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium ${step.status === "active"
                      ? "text-white"
                      : step.status === "completed"
                        ? "text-slate-400"
                        : step.status === "error"
                          ? "text-red-400"
                          : "text-slate-500"
                    }`}
                >
                  {step.step_name}
                </p>
                <p
                  className={`text-sm mt-0.5 ${step.status === "active"
                      ? "text-amber-400"
                      : step.status === "error"
                        ? "text-red-400/70"
                        : "text-slate-500"
                    }`}
                >
                  {step.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}






