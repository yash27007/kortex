"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HiChevronDown,
  HiLockClosed,
  HiCheckCircle,
  HiPlayCircle,
  HiAcademicCap
} from "react-icons/hi2";
import { LessonItem } from "./lesson-item";
import { BloomBadge } from "./bloom-badge";
import { QuizItem } from "./quiz-item";

interface ModuleData {
  id: string;
  title: string;
  description: string | null;
  order: number;
  bloomLevel: string;
  courseOutcome: string;
  estimatedMinutes: number;
  lessons: Array<{
    id: string;
    title: string;
    order: number;
    duration: number;
    type: string;
    xpReward: number;
  }>;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    xpReward: number;
  } | null;
}

interface ModuleItemProps {
  module: ModuleData;
  moduleIndex: number;
  courseId: string;
  currentModuleId?: string | null;
  currentLessonId?: string | null;
  completedLessonIds: string[];
  completedModuleIds: string[];
  isUnlocked: boolean;
}

export function ModuleItem({
  module,
  moduleIndex,
  courseId,
  currentModuleId,
  currentLessonId,
  completedLessonIds,
  completedModuleIds,
  isUnlocked,
}: ModuleItemProps) {
  const isCurrentModule = currentModuleId === module.id;
  const isCompleted = completedModuleIds.includes(module.id);

  // Auto-expand current module
  const [isExpanded, setIsExpanded] = useState(isCurrentModule);

  // Calculate module progress
  const completedLessonsInModule = module.lessons.filter(
    (l) => completedLessonIds.includes(l.id)
  ).length;
  const totalLessons = module.lessons.length;
  const moduleProgress = totalLessons > 0
    ? Math.round((completedLessonsInModule / totalLessons) * 100)
    : 0;

  // Check if quiz is unlocked (all lessons completed)
  const quizUnlocked = completedLessonsInModule === totalLessons && totalLessons > 0;

  return (
    <div className="px-2">
      {/* Module Header */}
      <button
        onClick={() => isUnlocked && setIsExpanded(!isExpanded)}
        disabled={!isUnlocked}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${!isUnlocked
            ? "cursor-not-allowed opacity-50 grayscale"
            : isCurrentModule
              ? "bg-amber-500/10 border border-amber-500/30"
              : isCompleted
                ? "bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10"
                : "hover:bg-white/5 border border-transparent"
          }`}
      >
        {/* Module Status Icon */}
        <div className="flex-shrink-0">
          {!isUnlocked ? (
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <HiLockClosed className="w-4 h-4 text-slate-500" />
            </div>
          ) : isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"
            >
              <HiCheckCircle className="w-5 h-5 text-emerald-400" />
            </motion.div>
          ) : isCurrentModule ? (
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <HiPlayCircle className="w-5 h-5 text-amber-400" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-400">
              {moduleIndex + 1}
            </div>
          )}
        </div>

        {/* Module Info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium truncate ${isCurrentModule ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-200"
              }`}>
              {module.title}
            </span>
            <BloomBadge level={module.bloomLevel} size="sm" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500">
              {completedLessonsInModule}/{totalLessons} lessons
            </span>
            {moduleProgress > 0 && moduleProgress < 100 && (
              <div className="flex-1 max-w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${moduleProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Expand Icon */}
        {isUnlocked && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <HiChevronDown className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </motion.div>
        )}
      </button>

      {/* Module Content (Lessons) */}
      <AnimatePresence>
        {isExpanded && isUnlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="py-1 pl-4 space-y-0.5">
              {/* Lessons */}
              {module.lessons.map((lesson, lessonIndex) => {
                const isLessonUnlocked = isLessonAccessible(
                  lessonIndex,
                  module.lessons,
                  completedLessonIds
                );

                return (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    courseId={courseId}
                    isActive={currentLessonId === lesson.id}
                    isCompleted={completedLessonIds.includes(lesson.id)}
                    isUnlocked={isLessonUnlocked}
                  />
                );
              })}

              {/* Module Quiz (if exists) */}
              {module.quiz && (
                <QuizItem
                  quiz={module.quiz}
                  moduleId={module.id}
                  courseId={courseId}
                  isUnlocked={quizUnlocked}
                  isCompleted={completedModuleIds.includes(module.id)}
                />
              )}
            </div>

            {/* Course Outcome */}
            <div className="mx-4 my-2 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <HiAcademicCap className="w-3.5 h-3.5" />
                <span>Learning Outcome</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">
                {module.courseOutcome}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to check if a lesson is accessible
function isLessonAccessible(
  lessonIndex: number,
  lessons: Array<{ id: string }>,
  completedLessonIds: string[]
): boolean {
  // First lesson is always accessible
  if (lessonIndex === 0) return true;

  // Previous lesson must be completed
  const prevLesson = lessons[lessonIndex - 1];
  return prevLesson ? completedLessonIds.includes(prevLesson.id) : false;
}





