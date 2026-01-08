"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  HiChevronLeft,
  HiChevronRight,
  HiCheckCircle,
  HiClock,
  HiAcademicCap,
  HiSparkles,
} from "react-icons/hi2";
import { useTRPC, useQuery, useMutation } from "@/server/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { BloomBadge } from "../../_components/bloom-badge";
import { XPGainAnimation, dispatchXPGain } from "../../_components/gamification-hud";
import { ModuleCompleteOverlay } from "../../_components/module-complete-overlay";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LessonContent } from "./_components/lesson-content";
import confetti from "canvas-confetti";

interface LessonPageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = use(params);
  const router = useRouter();
  const api = useTRPC();
  const queryClient = useQueryClient();

  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [showModuleComplete, setShowModuleComplete] = useState(false);

  // Fetch lesson data
  const { data: lesson, isLoading } = useQuery(api.lesson.getById.queryOptions(
    { lessonId },
    { staleTime: 1000 * 60 * 5 }
  ));

  // Fetch navigation context
  const { data: navigation } = useQuery(api.lesson.getNavigation.queryOptions(
    { lessonId, courseId },
    { staleTime: 1000 * 60 * 5 }
  ));

  // Fetch progress status
  const { data: progress } = useQuery(api.lesson.getProgress.queryOptions(
    { lessonId },
    { staleTime: 1000 * 30 }
  ));

  // Mark complete mutation
  const markComplete = useMutation(api.lesson.markComplete.mutationOptions({
    onSuccess: (data) => {
      // Show XP animation
      setXpAmount(data.xpAwarded);
      setShowXPAnimation(true);
      dispatchXPGain(data.xpAwarded);

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#fbbf24", "#7c3aed", "#8b5cf6"],
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [["course", "getProgress"]] });
      queryClient.invalidateQueries({ queryKey: [["lesson", "getProgress"]] });

      // Check if module is now complete
      if (data.moduleComplete) {
        setTimeout(() => {
          setShowXPAnimation(false);
          setShowModuleComplete(true);
        }, 2000);
      } else {
        // Navigate to next lesson after animation
        setTimeout(() => {
          setShowXPAnimation(false);
          if (navigation?.nextLesson) {
            router.push(`/learn/${courseId}/lesson/${navigation.nextLesson.id}`);
          }
        }, 2000);
      }
    },
  }));

  const handleMarkComplete = () => {
    if (progress?.status !== "COMPLETED") {
      markComplete.mutate({ lessonId, courseId });
    } else if (navigation?.nextLesson) {
      router.push(`/learn/${courseId}/lesson/${navigation.nextLesson.id}`);
    }
  };

  const handleModuleCompleteClose = () => {
    setShowModuleComplete(false);
    // Navigate to quiz or next module
    if (navigation?.quiz) {
      router.push(`/learn/${courseId}/quiz/${navigation.quiz.moduleId}`);
    } else if (navigation?.nextLesson) {
      router.push(`/learn/${courseId}/lesson/${navigation.nextLesson.id}`);
    }
  };

  if (isLoading) {
    return <LessonSkeleton />;
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Lesson not found</h2>
          <Link href={`/learn/${courseId}`} className="text-amber-400 hover:underline">
            Return to course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* XP Animation */}
      <AnimatePresence>
        {showXPAnimation && <XPGainAnimation amount={xpAmount} />}
      </AnimatePresence>

      {/* Module Complete Overlay */}
      <AnimatePresence>
        {showModuleComplete && (
          <ModuleCompleteOverlay
            moduleName={navigation?.currentModule?.title ?? "Module"}
            xpEarned={xpAmount}
            onContinue={handleModuleCompleteClose}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href={`/courses/${lesson.module?.course?.slug}`} className="hover:text-white transition-colors">
            {lesson.module?.course?.title}
          </Link>
          <span>/</span>
          <span className="text-slate-500">{lesson.module?.title}</span>
          <span>/</span>
          <span className="text-white">{lesson.title}</span>
        </nav>

        {/* Lesson Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <BloomBadge level={lesson.bloomLevel} size="md" showLabel />
            {progress?.status === "COMPLETED" && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                <HiCheckCircle className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">{lesson.title}</h1>

          {lesson.description && (
            <p className="text-slate-400 text-lg">{lesson.description}</p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <HiClock className="w-4 h-4" />
              <span>{lesson.duration} min read</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HiSparkles className="w-4 h-4 text-amber-500" />
              <span>{lesson.xpReward} XP</span>
            </div>
          </div>
        </header>

        {/* Lesson Content - MDX Rendered */}
        <article className="mb-12">
          <LessonContent content={lesson.mdxContent} />
        </article>

        {/* Key Concepts */}
        {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
          <div className="mb-8 p-6 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <HiAcademicCap className="w-5 h-5" />
              <h3 className="font-semibold">Key Concepts</h3>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {lesson.keyConcepts.map((concept, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {concept}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Footer */}
        <footer className="flex items-center justify-between pt-8 border-t border-slate-800">
          {/* Previous */}
          {navigation?.prevLesson ? (
            <Link
              href={`/learn/${courseId}/lesson/${navigation.prevLesson.id}`}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <HiChevronLeft className="w-5 h-5" />
              <div className="text-left">
                <span className="text-xs text-slate-500 block">Previous</span>
                <span className="text-sm">{navigation.prevLesson.title}</span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {/* Mark Complete / Continue */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleMarkComplete}
              disabled={markComplete.isPending}
              className={`gap-2 ${progress?.status === "COMPLETED"
                ? "bg-slate-700 hover:bg-slate-600"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900"
                }`}
              size="lg"
            >
              {markComplete.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                  Saving...
                </>
              ) : progress?.status === "COMPLETED" ? (
                <>
                  Continue
                  <HiChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <HiCheckCircle className="w-5 h-5" />
                  Mark Complete & Continue
                </>
              )}
            </Button>
          </motion.div>
        </footer>
      </div>
    </>
  );
}

function LessonSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Skeleton className="h-4 w-64 bg-slate-800 mb-6" />
      <Skeleton className="h-8 w-48 bg-slate-800 mb-4" />
      <Skeleton className="h-12 w-full bg-slate-800 mb-4" />
      <Skeleton className="h-6 w-3/4 bg-slate-800 mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full bg-slate-800" />
        <Skeleton className="h-4 w-full bg-slate-800" />
        <Skeleton className="h-4 w-3/4 bg-slate-800" />
        <Skeleton className="h-4 w-full bg-slate-800" />
        <Skeleton className="h-4 w-5/6 bg-slate-800" />
      </div>
    </div>
  );
}





