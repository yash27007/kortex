"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { HiBookOpen, HiClock, HiUsers, HiMagnifyingGlass } from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const difficultyColors: Record<string, string> = {
  BEGINNER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  INTERMEDIATE: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  ADVANCED: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  EXPERT: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function CoursesCatalogPage() {
  const api = useTRPC();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);

  const { data, isLoading } = useQuery(
    api.course.getAll.queryOptions({ limit: 50, category }, { staleTime: 1000 * 60 })
  );
  const { data: categories } = useQuery(
    api.course.getCategories.queryOptions(undefined, { staleTime: 1000 * 60 * 5 })
  );

  const courses = (data?.courses ?? []).filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-10 px-4 md:px-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 max-w-6xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Browse Courses</h1>
        <p className="text-slate-400">
          Curated, AI-generated courses across every subject.
        </p>
      </motion.header>

      <div className="max-w-6xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="pl-9 bg-slate-900/50 border-white/10 text-white"
            />
          </div>
          {categories && categories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCategory(undefined)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${!category
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "text-slate-400 border-white/10 hover:text-white"
                  }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${category === c
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "text-slate-400 border-white/10 hover:text-white"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <HiBookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              {search ? "No courses match your search." : "No courses published yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/courses/${course.slug}`}
                  className="group flex flex-col h-full p-5 rounded-xl bg-slate-900/50 border border-white/10 hover:border-amber-500/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                    <HiBookOpen className="w-6 h-6 text-amber-400" />
                  </div>

                  {course.category && (
                    <span className="text-xs text-amber-400 mb-1">{course.category}</span>
                  )}

                  <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-2 mb-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <Badge variant="outline" className={difficultyColors[course.difficulty] ?? difficultyColors.BEGINNER}>
                      {course.difficulty}
                    </Badge>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <HiClock className="w-3.5 h-3.5" />
                        {course.estimatedHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <HiUsers className="w-3.5 h-3.5" />
                        {course._count.enrollments}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
