"use client";

import { motion } from "motion/react";
import {
  HiTrophy,
  HiFire,
  HiBookOpen,
  HiAcademicCap,
  HiClock,
  HiChartBar,
} from "react-icons/hi2";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileStats() {
  const api = useTRPC();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery(api.user.getDashboardStats.queryOptions());

  // Fetch weekly analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery(api.user.getWeeklyAnalytics.queryOptions());

  const isLoading = statsLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total XP",
      value: (stats?.totalXp ?? 0).toLocaleString(),
      icon: HiTrophy,
      color: "amber",
      subtext: `+${stats?.weeklyXpGain ?? 0} this week`,
    },
    {
      label: "Current Streak",
      value: `${stats?.currentStreak ?? 0} days`,
      icon: HiFire,
      color: "orange",
    },
    {
      label: "Courses Completed",
      value: stats?.completedCourses ?? 0,
      icon: HiAcademicCap,
      color: "emerald",
    },
    {
      label: "Lessons Completed",
      value: stats?.completedLessons ?? 0,
      icon: HiBookOpen,
      color: "violet",
    },
    {
      label: "Hours Learned",
      value: stats?.hoursLearned ?? 0,
      icon: HiClock,
      color: "blue",
    },
    {
      label: "Leaderboard Rank",
      value: `#${stats?.rank ?? 0}`,
      icon: HiChartBar,
      color: "pink",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const colorClasses = {
            amber: "from-amber-500/20 to-amber-600/10 bg-amber-500/20 text-amber-400",
            orange: "from-orange-500/20 to-orange-600/10 bg-orange-500/20 text-orange-400",
            emerald: "from-emerald-500/20 to-emerald-600/10 bg-emerald-500/20 text-emerald-400",
            violet: "from-amber-500/20 to-amber-600/10 bg-amber-500/20 text-amber-400",
            blue: "from-blue-500/20 to-blue-600/10 bg-blue-500/20 text-blue-400",
            pink: "from-pink-500/20 to-pink-600/10 bg-pink-500/20 text-pink-400",
          } as const;

          const classes = colorClasses[card.color as keyof typeof colorClasses] ?? colorClasses.violet;
          const [gradient, iconBg, iconColor] = classes.split(" ");

          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl bg-gradient-to-br ${gradient} border border-white/10 p-5`}
            >
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-sm text-slate-400">{card.label}</div>
              {card.subtext && (
                <div className="text-xs text-emerald-400 mt-1">{card.subtext}</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
      >
        <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
          <HiChartBar className="w-5 h-5 text-amber-400" />
          Weekly Learning Activity
        </h3>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-amber-400">
              {analytics?.totalXp ?? 0}
            </div>
            <div className="text-xs text-slate-500">XP This Week</div>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-amber-400">
              {analytics?.totalLessons ?? 0}
            </div>
            <div className="text-xs text-slate-500">Lessons</div>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {analytics?.totalMinutes ?? 0}
            </div>
            <div className="text-xs text-slate-500">Minutes</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.daily ?? []}>
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
              <Bar dataKey="xp" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="XP" />
              <Bar dataKey="lessons" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Lessons" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}





