"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HiXMark, HiBookOpen, HiClock, HiTrophy } from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { ModuleItem } from "./module-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface CourseSidebarProps {
  courseId: string;
  onClose: () => void;
}

export function CourseSidebar({ courseId, onClose }: CourseSidebarProps) {
  const api = useTRPC();

  // Fetch course structure with progress
  const { data: courseData, isLoading: courseLoading } = useQuery(api.course.getStructure.queryOptions(
    { courseId },
    { staleTime: 1000 * 60 * 5 } // 5 min cache
  ));

  // Fetch user's progress
  const { data: progressData, isLoading: progressLoading } = useQuery(api.course.getProgress.queryOptions(
    { courseId },
    { staleTime: 1000 * 60 } // 1 min cache
  ));

  const isLoading = courseLoading || progressLoading;

  return (
    <div className="h-full w-80 bg-slate-950/80 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <Skeleton className="h-6 w-48 bg-slate-800" />
            ) : (
              <Link
                href={`/courses/${courseData?.slug}`}
                className="text-lg font-semibold text-white hover:text-amber-400 transition-colors line-clamp-2"
              >
                {courseData?.title}
              </Link>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <HiXMark className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          {isLoading ? (
            <Skeleton className="h-2 w-full bg-slate-800" />
          ) : (
            <>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Course Progress</span>
                <span className="text-amber-400 font-medium">
                  {progressData?.progress ?? 0}%
                </span>
              </div>
              <Progress
                value={progressData?.progress ?? 0}
                className="h-2 bg-slate-800"
              />
            </>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <HiBookOpen className="w-4 h-4" />
            <span>
              {progressData?.completedLessons ?? 0}/{progressData?.totalLessons ?? 0} Lessons
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <HiTrophy className="w-4 h-4 text-amber-500" />
            <span>{progressData?.totalXpEarned ?? 0} XP</span>
          </div>
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {isLoading ? (
          <div className="px-4 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-12 w-full bg-slate-800 rounded-lg" />
                <div className="pl-4 space-y-2">
                  <Skeleton className="h-8 w-full bg-slate-800/50 rounded" />
                  <Skeleton className="h-8 w-full bg-slate-800/50 rounded" />
                  <Skeleton className="h-8 w-full bg-slate-800/50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-1"
          >
            {courseData?.modules.map((module, index) => (
              <ModuleItem
                key={module.id}
                module={module}
                moduleIndex={index}
                courseId={courseId}
                currentModuleId={progressData?.currentModuleId}
                currentLessonId={progressData?.currentLessonId}
                completedLessonIds={progressData?.completedLessonIds ?? []}
                completedModuleIds={progressData?.completedModuleIds ?? []}
                isUnlocked={isModuleUnlocked(
                  index,
                  progressData?.completedModuleIds ?? [],
                  courseData?.modules ?? []
                )}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Footer - Quick Navigation */}
      <div className="p-4 border-t border-white/10 bg-slate-900/50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <HiXMark className="w-4 h-4" />
          Exit Course
        </Link>
      </div>
    </div>
  );
}

// Helper to determine if a module is unlocked
function isModuleUnlocked(
  moduleIndex: number,
  completedModuleIds: string[],
  modules: Array<{ id: string }>
): boolean {
  // First module is always unlocked
  if (moduleIndex === 0) return true;

  // Check if all previous modules are completed
  for (let i = 0; i < moduleIndex; i++) {
    const prevModule = modules[i];
    if (prevModule && !completedModuleIds.includes(prevModule.id)) {
      return false;
    }
  }

  return true;
}





