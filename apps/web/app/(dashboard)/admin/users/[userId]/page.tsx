"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  HiArrowLeft,
  HiTrophy,
  HiFire,
  HiBookOpen,
  HiAcademicCap,
  HiSparkles,
  HiClock,
  HiEnvelope,
  HiCalendar,
} from "react-icons/hi2";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = use(params);
  const api = useTRPC();

  // Fetch user details
  const { data: user, isLoading } = useQuery(api.admin.getUserById.queryOptions(
    { userId },
    { staleTime: 1000 * 60 }
  ));

  // Fetch user activity
  const { data: activity } = useQuery(api.admin.getUserActivity.queryOptions(
    { userId },
    { staleTime: 1000 * 60 * 5 }
  ));

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">User not found</h2>
          <Link href="/admin/users" className="text-amber-400 hover:underline">
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  const COLORS = ["#8b5cf6", "#f59e0b", "#22c55e", "#3b82f6", "#ec4899"];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>

        {/* User Profile Card */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-slate-400">
                  {(user.firstName?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-2 text-slate-400 mt-1">
                <HiEnvelope className="w-4 h-4" />
                {user.email}
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                  <HiSparkles className="w-3 h-3 mr-1" />
                  Level {user.level}
                </Badge>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                  <HiTrophy className="w-3 h-3 mr-1" />
                  {user.totalXp.toLocaleString()} XP
                </Badge>
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                  <HiFire className="w-3 h-3 mr-1" />
                  {user.currentStreak} day streak
                </Badge>
                <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/30">
                  <HiCalendar className="w-3 h-3 mr-1" />
                  Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total XP"
            value={user.totalXp.toLocaleString()}
            icon={HiTrophy}
            color="amber"
          />
          <StatCard
            label="Current Streak"
            value={`${user.currentStreak} days`}
            icon={HiFire}
            color="orange"
          />
          <StatCard
            label="Courses Enrolled"
            value={user._count?.enrollments ?? 0}
            icon={HiBookOpen}
            color="violet"
          />
          <StatCard
            label="Lessons Completed"
            value={user._count?.lessonProgress ?? 0}
            icon={HiAcademicCap}
            color="emerald"
          />
        </div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-white/10 rounded-xl p-5"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <HiSparkles className="w-5 h-5 text-amber-400" />
            Badges Earned ({user.badges?.length ?? 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.badges?.slice(0, 8).map((userBadge: any) => (
              <div
                key={userBadge.id}
                className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center"
                title={userBadge.badge.name}
              >
                <span className="text-xl">🏆</span>
              </div>
            ))}
            {(!user.badges || user.badges.length === 0) && (
              <p className="text-slate-500 text-sm">No badges earned yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-slate-900/50 border border-white/10 rounded-xl p-6"
      >
        <h3 className="font-semibold text-white mb-4">Learning Activity (Last 30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activity?.daily ?? []}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#xpGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Course Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-slate-900/50 border border-white/10 rounded-xl p-6"
      >
        <h3 className="font-semibold text-white mb-4">Course Enrollments</h3>
        {user.enrollments?.length > 0 ? (
          <div className="space-y-4">
            {user.enrollments.map((enrollment: any) => (
              <div
                key={enrollment.id}
                className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
                  {enrollment.course.imageUrl ? (
                    <img
                      src={enrollment.course.imageUrl}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HiBookOpen className="w-6 h-6 text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">
                    {enrollment.course.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-slate-500">
                      {enrollment.completedLessons} lessons completed
                    </span>
                    <span className="text-sm text-amber-400">
                      +{enrollment.totalXpEarned} XP
                    </span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white">{enrollment.progressPercent}%</span>
                  </div>
                  <Progress value={enrollment.progressPercent} className="h-2 bg-slate-700" />
                </div>
                <Badge
                  className={
                    enrollment.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }
                >
                  {enrollment.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No course enrollments yet</p>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  const colorClasses = {
    amber: "from-amber-500/20 to-amber-600/10 bg-amber-500/20 text-amber-400",
    orange: "from-orange-500/20 to-orange-600/10 bg-orange-500/20 text-orange-400",
    violet: "from-amber-500/20 to-amber-600/10 bg-amber-500/20 text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-600/10 bg-emerald-500/20 text-emerald-400",
  } as const;

  const classes = colorClasses[color as keyof typeof colorClasses] ?? colorClasses.violet;
  const [gradient, iconBg, iconColor] = classes.split(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl bg-gradient-to-br ${gradient} border border-white/10 p-5`}
    >
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </motion.div>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="p-6 md:p-8">
      <Skeleton className="h-8 w-32 bg-slate-800 mb-4" />
      <Skeleton className="h-40 w-full bg-slate-800 rounded-xl mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full bg-slate-800 rounded-xl" />
    </div>
  );
}





