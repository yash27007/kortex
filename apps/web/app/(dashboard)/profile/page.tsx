"use client";

import { motion } from "motion/react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  HiTrophy,
  HiFire,
  HiSparkles,
  HiBookOpen,
  HiAcademicCap,
  HiCog,
  HiArrowRightOnRectangle,
  HiEnvelope,
  HiCalendar,
  HiChartBar,
} from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ProfileStats } from "./_components/profile-stats";
import { ProfileBadges } from "./_components/profile-badges";
import { ProfileCourses } from "./_components/profile-courses";
import { ProfileSettings } from "./_components/profile-settings";

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const api = useTRPC();
  const { signOut } = useClerk();

  // Fetch user profile
  const { data: profile, isLoading } = useQuery(api.user.getProfile.queryOptions(undefined, {
    staleTime: 1000 * 60 * 5,
  }));

  // Fetch gamification stats
  const { data: stats } = useQuery(api.user.getGamificationStats.queryOptions(undefined, {
    staleTime: 1000 * 60,
  }));

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/10 to-amber-500/10 border border-white/10 rounded-2xl p-6 md:p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-slate-800 overflow-hidden border-4 border-amber-500/30">
              {clerkUser?.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt={clerkUser.firstName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-400">
                  {(clerkUser?.firstName?.charAt(0) || "?").toUpperCase()}
                </div>
              )}
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center border-2 border-slate-950">
              <span className="text-sm font-bold text-slate-900">{stats?.level ?? 1}</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">
              {clerkUser?.firstName} {clerkUser?.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-slate-400">
              <span className="flex items-center gap-1">
                <HiEnvelope className="w-4 h-4" />
                {clerkUser?.primaryEmailAddress?.emailAddress}
              </span>
              {profile?.createdAt && (
                <span className="flex items-center gap-1">
                  <HiCalendar className="w-4 h-4" />
                  Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
                </span>
              )}
            </div>

            {/* Level Progress */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Level {stats?.level ?? 1}</span>
                <span className="text-amber-400">
                  {stats?.xpToNextLevel ?? 0} XP to Level {(stats?.level ?? 1) + 1}
                </span>
              </div>
              <Progress value={stats?.levelProgress ?? 0} className="h-3 bg-slate-800" />
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1">
                <HiTrophy className="w-3 h-3" />
                {(stats?.totalXp ?? 0).toLocaleString()} XP
              </Badge>
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 gap-1">
                <HiFire className="w-3 h-3" />
                {profile?.currentStreak ?? 0} day streak
              </Badge>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1">
                <HiSparkles className="w-3 h-3" />
                {profile?.badges?.length ?? 0} badges
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1">
                <HiAcademicCap className="w-3 h-3" />
                {profile?._count?.enrollments ?? 0} courses
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <HiArrowRightOnRectangle className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="bg-slate-900/50 border border-white/10">
          <TabsTrigger value="stats" className="gap-2">
            <HiChartBar className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <HiBookOpen className="w-4 h-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <HiSparkles className="w-4 h-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <HiCog className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <ProfileStats />
        </TabsContent>

        <TabsContent value="courses">
          <ProfileCourses enrollments={profile?.enrollments ?? []} />
        </TabsContent>

        <TabsContent value="badges">
          <ProfileBadges />
        </TabsContent>

        <TabsContent value="settings">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">
      <Skeleton className="h-64 w-full bg-slate-800 rounded-2xl mb-8" />
      <Skeleton className="h-12 w-64 bg-slate-800 mb-6" />
      <Skeleton className="h-96 w-full bg-slate-800 rounded-xl" />
    </div>
  );
}





