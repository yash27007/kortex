"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HiBookOpen, HiClock, HiTrophy, HiArrowRight } from "react-icons/hi2";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Enrollment {
  id: string;
  progressPercent: number;
  completedLessons: number;
  totalXpEarned: number;
  status: string;
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt: Date | null;
  course: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    category: string | null;
    estimatedHours: number;
  };
}

interface ProfileCoursesProps {
  enrollments: Enrollment[];
}

export function ProfileCourses({ enrollments }: ProfileCoursesProps) {
  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/50 border border-white/10 rounded-xl">
        <HiBookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No courses enrolled yet</p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 mt-2"
        >
          Browse courses <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const completedCourses = enrollments.filter(e => e.status === "COMPLETED");
  const inProgressCourses = enrollments.filter(e => e.status !== "COMPLETED");

  return (
    <div className="space-y-8">
      {/* In Progress */}
      {inProgressCourses.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <HiBookOpen className="w-5 h-5 text-amber-400" />
            In Progress ({inProgressCourses.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressCourses.map((enrollment, index) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedCourses.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <HiTrophy className="w-5 h-5 text-emerald-400" />
            Completed ({completedCourses.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedCourses.map((enrollment, index) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCard({ enrollment, index }: { enrollment: Enrollment; index: number }) {
  const isCompleted = enrollment.status === "COMPLETED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={`/learn/${enrollment.course.id}`}
        className={`block p-5 rounded-xl border transition-all group ${isCompleted
          ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
          : "bg-slate-900/50 border-white/10 hover:border-amber-500/30"
          }`}
      >
        <div className="flex gap-4">
          {/* Course Image */}
          <div className="w-20 h-20 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
            {enrollment.course.imageUrl ? (
              <img
                src={enrollment.course.imageUrl}
                alt={enrollment.course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <HiBookOpen className="w-10 h-10 text-slate-500" />
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            {/* Category */}
            {enrollment.course.category && (
              <span className="text-xs text-amber-400">{enrollment.course.category}</span>
            )}

            {/* Title */}
            <h4 className="font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
              {enrollment.course.title}
            </h4>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <HiClock className="w-4 h-4" />
                {enrollment.course.estimatedHours}h
              </span>
              <span className="flex items-center gap-1">
                <HiTrophy className="w-4 h-4 text-amber-500" />
                +{enrollment.totalXpEarned} XP
              </span>
            </div>

            {/* Progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-400">
                  {enrollment.completedLessons} lessons completed
                </span>
                <span className={isCompleted ? "text-emerald-400" : "text-white"}>
                  {enrollment.progressPercent}%
                </span>
              </div>
              <Progress
                value={enrollment.progressPercent}
                className={`h-2 ${isCompleted ? "bg-emerald-900/30" : "bg-slate-800"}`}
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            <Badge
              className={
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }
            >
              {isCompleted ? "Completed" : "In Progress"}
            </Badge>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}





