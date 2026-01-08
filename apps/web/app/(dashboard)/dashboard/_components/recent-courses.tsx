"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HiBookOpen, HiArrowRight, HiClock, HiChartBar } from "react-icons/hi2";
import { Progress } from "@/components/ui/progress";

interface Enrollment {
  id: string;
  progressPercent: number;
  lastAccessedAt: Date;
  course: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    category: string | null;
    estimatedHours: number;
  };
}

interface RecentCoursesProps {
  enrollments: Enrollment[];
}

export function RecentCourses({ enrollments }: RecentCoursesProps) {
  const recentCourses = enrollments.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HiBookOpen className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Continue Learning</h3>
        </div>
        <Link
          href="/courses"
          className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
        >
          View all <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {recentCourses.length === 0 ? (
        <div className="text-center py-8">
          <HiBookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No courses started yet</p>
          <Link
            href="/courses"
            className="inline-block mt-4 text-amber-400 hover:text-amber-300"
          >
            Browse courses →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentCourses.map((enrollment, index) => (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/learn/${enrollment.course.id}`}
                className="group block p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 transition-all"
              >
                {/* Course Image & Category */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
                    {enrollment.course.imageUrl ? (
                      <img
                        src={enrollment.course.imageUrl}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiBookOpen className="w-8 h-8 text-slate-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Category */}
                    {enrollment.course.category && (
                      <span className="text-xs text-amber-400">
                        {enrollment.course.category}
                      </span>
                    )}

                    {/* Title */}
                    <h4 className="font-medium text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {enrollment.course.title}
                    </h4>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <HiClock className="w-3 h-3" />
                        {enrollment.course.estimatedHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <HiChartBar className="w-3 h-3" />
                        {enrollment.progressPercent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <Progress
                        value={enrollment.progressPercent}
                        className="h-1.5 bg-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}





