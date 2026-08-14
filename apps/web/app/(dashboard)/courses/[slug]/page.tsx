"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  HiArrowLeft,
  HiBookOpen,
  HiClock,
  HiUsers,
  HiCheckCircle,
  HiAcademicCap,
  HiPlay,
} from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BloomBadge } from "../../learn/[courseId]/_components/bloom-badge";

const difficultyColors: Record<string, string> = {
  BEGINNER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  INTERMEDIATE: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  ADVANCED: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  EXPERT: "bg-red-500/10 text-red-400 border-red-500/30",
};

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = use(params);
  const api = useTRPC();

  const { data: course, isLoading } = useQuery(
    api.course.getBySlug.queryOptions({ slug }, { staleTime: 1000 * 60 })
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-6 w-40 bg-slate-800" />
          <Skeleton className="h-10 w-2/3 bg-slate-800" />
          <Skeleton className="h-24 w-full bg-slate-800 rounded-xl" />
          <Skeleton className="h-96 w-full bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Course not found</h2>
          <Link href="/courses" className="text-amber-400 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {course.category && (
            <span className="text-sm text-amber-400 mb-2 block">{course.category}</span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{course.title}</h1>
          <p className="text-lg text-slate-400 mb-5">{course.description}</p>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge variant="outline" className={difficultyColors[course.difficulty] ?? difficultyColors.BEGINNER}>
              {course.difficulty}
            </Badge>
            <span className="flex items-center gap-1.5 text-sm text-slate-400">
              <HiBookOpen className="w-4 h-4" />
              {course.modules.length} modules · {totalLessons} lessons
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-400">
              <HiClock className="w-4 h-4" />
              {course.estimatedHours}h
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-400">
              <HiUsers className="w-4 h-4" />
              {course._count.enrollments} enrolled
            </span>
          </div>

          <Link
            href={`/learn/${course.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            <HiPlay className="w-5 h-5" />
            Start Learning
          </Link>
        </motion.header>

        {/* Outcomes / Prerequisites */}
        {(course.courseOutcomes.length > 0 || course.prerequisites.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {course.courseOutcomes.length > 0 && (
              <div className="p-5 rounded-xl bg-slate-900/50 border border-white/10">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <HiAcademicCap className="w-5 h-5 text-amber-400" />
                  What you&apos;ll learn
                </h3>
                <ul className="space-y-2">
                  {course.courseOutcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <HiCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {course.prerequisites.length > 0 && (
              <div className="p-5 rounded-xl bg-slate-900/50 border border-white/10">
                <h3 className="font-semibold text-white mb-3">Prerequisites</h3>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, i) => (
                    <li key={i} className="text-sm text-slate-300">
                      • {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Curriculum */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Curriculum</h2>
          <div className="space-y-3">
            {course.modules.map((module) => (
              <div
                key={module.id}
                className="rounded-xl bg-slate-900/50 border border-white/10 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">
                    Module {module.order}: {module.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {module.bloomLevel}
                  </Badge>
                </div>
                {module.description && (
                  <p className="text-sm text-slate-400 mb-3">{module.description}</p>
                )}
                <ul className="space-y-1.5">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-3 text-sm text-slate-300 py-1.5 px-2 rounded-lg hover:bg-slate-800/50"
                    >
                      <BloomBadge level={lesson.bloomLevel} size="sm" />
                      <span className="flex-1">{lesson.title}</span>
                      <span className="text-xs text-slate-500">{lesson.duration} min</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
