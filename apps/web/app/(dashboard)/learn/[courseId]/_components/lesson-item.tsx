"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  HiLockClosed,
  HiCheckCircle,
  HiPlayCircle,
  HiDocumentText,
  HiVideoCamera,
  HiCube,
  HiClock
} from "react-icons/hi2";

interface LessonData {
  id: string;
  title: string;
  order: number;
  duration: number;
  type: string;
  xpReward: number;
}

interface LessonItemProps {
  lesson: LessonData;
  courseId: string;
  isActive: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
}

const lessonTypeIcons = {
  TEXT: HiDocumentText,
  VIDEO: HiVideoCamera,
  INTERACTIVE: HiCube,
  QUIZ: HiDocumentText,
  PROJECT: HiCube,
};

export function LessonItem({
  lesson,
  courseId,
  isActive,
  isCompleted,
  isUnlocked,
}: LessonItemProps) {
  const Icon = lessonTypeIcons[lesson.type as keyof typeof lessonTypeIcons] || HiDocumentText;

  // Locked state
  if (!isUnlocked) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed opacity-40 grayscale select-none">
        <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-800">
          <HiLockClosed className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <span className="text-sm text-slate-500 truncate flex-1">{lesson.title}</span>
      </div>
    );
  }

  // Active/Completed/Available states
  return (
    <Link
      href={`/learn/${courseId}/lesson/${lesson.id}`}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
          ? "bg-amber-500/10 border-l-2 border-amber-500"
          : isCompleted
            ? "hover:bg-white/5"
            : "hover:bg-white/5"
        }`}
    >
      {/* Status Icon */}
      <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isActive
          ? "bg-amber-500/20 text-amber-400"
          : isCompleted
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
        }`}>
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <HiCheckCircle className="w-4 h-4" />
          </motion.div>
        ) : isActive ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <HiPlayCircle className="w-4 h-4" />
          </motion.div>
        ) : (
          <Icon className="w-3.5 h-3.5" />
        )}
      </div>

      {/* Lesson Title */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm truncate block ${isActive
            ? "text-violet-200 font-medium"
            : isCompleted
              ? "text-slate-400 line-through decoration-slate-700"
              : "text-slate-300 group-hover:text-white"
          }`}>
          {lesson.title}
        </span>
      </div>

      {/* Duration & XP */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <HiClock className="w-3 h-3" />
          <span>{lesson.duration}m</span>
        </div>
        {!isCompleted && (
          <span className="text-xs text-amber-500/70">+{lesson.xpReward}</span>
        )}
      </div>
    </Link>
  );
}





