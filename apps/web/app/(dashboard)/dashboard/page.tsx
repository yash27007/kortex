"use client";

import { motion } from "motion/react";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { useUser } from "@clerk/nextjs";
import { StatsCards } from "./_components/stats-cards";
import { StreakCalendar } from "./_components/streak-calendar";
import { RecentCourses } from "./_components/recent-courses";
import { BadgesShowcase } from "./_components/badges-showcase";
import { LearningAnalytics } from "./_components/learning-analytics";
import { LeaderboardPreview } from "./_components/leaderboard-preview";
import { DailyGoals } from "./_components/daily-goals";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user: clerkUser } = useUser();
  const api = useTRPC();

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery(api.user.getProfile.queryOptions(
    undefined,
    { staleTime: 1000 * 60 * 5 }
  ));

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery(api.user.getDashboardStats.queryOptions(
    undefined,
    { staleTime: 1000 * 60 }
  ));

  const isLoading = profileLoading || statsLoading;

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-10 px-4 md:px-8">
      {/* Welcome Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {clerkUser?.firstName || "Learner"} 👋
        </h1>
        <p className="text-slate-400">
          Track your progress and continue your learning journey.
        </p>
      </motion.header>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Learning Analytics Chart */}
            <LearningAnalytics />

            {/* Recent Courses */}
            <RecentCourses enrollments={profile?.enrollments ?? []} />

            {/* Badges Showcase */}
            <BadgesShowcase badges={profile?.badges ?? []} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Daily Goals */}
            <DailyGoals stats={stats} />

            {/* Streak Calendar */}
            <StreakCalendar
              currentStreak={profile?.currentStreak ?? 0}
              longestStreak={profile?.longestStreak ?? 0}
            />

            {/* Leaderboard Preview */}
            <LeaderboardPreview />
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 bg-slate-800 rounded-xl" />
        <Skeleton className="h-48 bg-slate-800 rounded-xl" />
      </div>
      <div className="lg:col-span-4 space-y-6">
        <Skeleton className="h-40 bg-slate-800 rounded-xl" />
        <Skeleton className="h-64 bg-slate-800 rounded-xl" />
        <Skeleton className="h-48 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}





