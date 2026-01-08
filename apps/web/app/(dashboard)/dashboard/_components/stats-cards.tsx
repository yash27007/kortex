"use client";

import { motion } from "motion/react";
import {
  HiTrophy,
  HiFire,
  HiBookOpen,
  HiAcademicCap,
  HiSparkles,
  HiArrowTrendingUp,
} from "react-icons/hi2";

interface StatsCardsProps {
  stats?: {
    totalXp: number;
    level: number;
    currentStreak: number;
    completedCourses: number;
    completedLessons: number;
    hoursLearned: number;
    weeklyXpGain: number;
    rank: number;
  } | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total XP",
      value: formatNumber(stats?.totalXp ?? 0),
      icon: HiTrophy,
      color: "amber",
      bgGradient: "from-amber-500/20 to-amber-600/10",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      change: stats?.weeklyXpGain ? `+${stats.weeklyXpGain} this week` : undefined,
    },
    {
      label: "Current Streak",
      value: `${stats?.currentStreak ?? 0} days`,
      icon: HiFire,
      color: "orange",
      bgGradient: "from-orange-500/20 to-orange-600/10",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400",
      badge: stats?.currentStreak && stats.currentStreak >= 7 ? "🔥" : undefined,
    },
    {
      label: "Level",
      value: stats?.level ?? 1,
      icon: HiSparkles,
      color: "violet",
      bgGradient: "from-amber-500/20 to-amber-600/10",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
    },
    {
      label: "Courses Completed",
      value: stats?.completedCourses ?? 0,
      icon: HiAcademicCap,
      color: "emerald",
      bgGradient: "from-emerald-500/20 to-emerald-600/10",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      label: "Lessons Completed",
      value: stats?.completedLessons ?? 0,
      icon: HiBookOpen,
      color: "blue",
      bgGradient: "from-blue-500/20 to-blue-600/10",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      label: "Leaderboard Rank",
      value: stats?.rank ? `#${stats.rank}` : "N/A",
      icon: HiArrowTrendingUp,
      color: "pink",
      bgGradient: "from-pink-500/20 to-pink-600/10",
      iconBg: "bg-pink-500/20",
      iconColor: "text-pink-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.bgGradient} border border-white/10 p-5`}
        >
          {/* Badge */}
          {card.badge && (
            <span className="absolute top-3 right-3 text-2xl">{card.badge}</span>
          )}

          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
          </div>

          {/* Value */}
          <div className="text-2xl font-bold text-white mb-1">{card.value}</div>

          {/* Label */}
          <div className="text-sm text-slate-400">{card.label}</div>

          {/* Change indicator */}
          {card.change && (
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <HiArrowTrendingUp className="w-3 h-3" />
              {card.change}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}





