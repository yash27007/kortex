"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { HiChartBar } from "react-icons/hi2";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { format, subDays } from "date-fns";

export function LearningAnalytics() {
  const api = useTRPC();

  // Fetch weekly analytics
  const { data: analytics } = useQuery(api.user.getWeeklyAnalytics.queryOptions(undefined, {
    staleTime: 1000 * 60 * 5,
  }));

  // Generate chart data
  const chartData = useMemo(() => {
    if (analytics?.daily) {
      return analytics.daily;
    }

    // Default data for past 7 days
    return Array.from({ length: 7 }, (_, i) => ({
      date: format(subDays(new Date(), 6 - i), "EEE"),
      xp: 0,
      lessons: 0,
      minutes: 0,
    }));
  }, [analytics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HiChartBar className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Learning Activity</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-400">XP Earned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-400">Lessons</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {analytics?.totalXp ?? 0}
          </div>
          <div className="text-xs text-slate-500">XP This Week</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {analytics?.totalLessons ?? 0}
          </div>
          <div className="text-xs text-slate-500">Lessons Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {analytics?.totalMinutes ?? 0}
          </div>
          <div className="text-xs text-slate-500">Minutes Learned</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lessonsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area
              type="monotone"
              dataKey="xp"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#xpGradient)"
              name="XP"
            />
            <Area
              type="monotone"
              dataKey="lessons"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#lessonsGradient)"
              name="Lessons"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}





