"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  HiLockClosed,
  HiCheckCircle,
  HiTrophy,
  HiExclamationTriangle
} from "react-icons/hi2";
import { toast } from "sonner";

interface QuizData {
  id: string;
  title: string;
  passingScore: number;
  xpReward: number;
}

interface QuizItemProps {
  quiz: QuizData;
  moduleId: string;
  courseId: string;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export function QuizItem({
  quiz,
  moduleId,
  courseId,
  isUnlocked,
  isCompleted,
}: QuizItemProps) {
  const handleLockedClick = () => {
    toast.error("Complete all lessons first", {
      description: "You must complete all lessons in this module before taking the quiz.",
      icon: <HiLockClosed className="w-5 h-5" />,
    });
  };

  // Locked state with shake animation on click
  if (!isUnlocked) {
    return (
      <motion.button
        onClick={handleLockedClick}
        whileTap={{ x: [0, -10, 10, -10, 10, 0] }}
        transition={{ duration: 0.4 }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-not-allowed 
                   bg-slate-900/50 border border-red-500/20 opacity-60"
      >
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
          <HiLockClosed className="w-4 h-4 text-red-400/50" />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm text-slate-500 font-medium">{quiz.title}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-red-400/50">Complete lessons to unlock</span>
          </div>
        </div>
      </motion.button>
    );
  }

  // Completed state
  if (isCompleted) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"
        >
          <HiCheckCircle className="w-5 h-5 text-emerald-400" />
        </motion.div>
        <div className="flex-1">
          <span className="text-sm text-emerald-300 font-medium">{quiz.title}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-emerald-400/70">Module Complete!</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-emerald-400">
          <HiTrophy className="w-4 h-4" />
          <span className="text-xs font-medium">+{quiz.xpReward}</span>
        </div>
      </div>
    );
  }

  // Unlocked & Ready state (Boss Fight aesthetic)
  return (
    <Link
      href={`/learn/${courseId}/quiz/${moduleId}`}
      className="group block"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg 
                   bg-gradient-to-r from-amber-500/5 to-red-500/5 
                   border border-amber-500/30 hover:border-amber-400/50
                   transition-all duration-300 overflow-hidden"
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-amber-500/0"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Icon */}
        <div className="relative z-10 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-red-500/20 
                       flex items-center justify-center border border-amber-500/30">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <HiExclamationTriangle className="w-4 h-4 text-amber-400" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1">
          <span className="text-sm font-semibold bg-gradient-to-r from-amber-300 to-red-300 bg-clip-text text-transparent">
            {quiz.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-amber-400/70">
              Pass: {quiz.passingScore}%
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-amber-400/70">
              +{quiz.xpReward} XP
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <motion.div
          className="relative z-10"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-amber-400 text-lg">→</span>
        </motion.div>
      </motion.div>
    </Link>
  );
}





