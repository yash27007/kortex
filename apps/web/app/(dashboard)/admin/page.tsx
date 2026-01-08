"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  HiUsers,
  HiBookOpen,
  HiChartBar,
  HiCog,
  HiArrowTrendingUp,
  HiTrophy,
} from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const api = useTRPC();

  // Fetch admin stats
  const { data: stats, isLoading } = useQuery(api.admin.getStats.queryOptions(undefined, {
    staleTime: 1000 * 60,
  }));

  const quickLinks = [
    {
      label: "Manage Users",
      href: "/admin/users",
      icon: HiUsers,
      color: "violet",
      description: "View and manage user accounts",
    },
    {
      label: "Courses",
      href: "/admin/courses",
      icon: HiBookOpen,
      color: "amber",
      description: "Manage course content",
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: HiChartBar,
      color: "blue",
      description: "View platform analytics",
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: HiCog,
      color: "slate",
      description: "Configure platform settings",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">
          Manage users, courses, and platform settings.
        </p>
      </motion.header>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={HiUsers}
            change={stats?.newUsersThisWeek}
            color="violet"
          />
          <StatCard
            label="Active Courses"
            value={stats?.totalCourses ?? 0}
            icon={HiBookOpen}
            color="amber"
          />
          <StatCard
            label="Total XP Earned"
            value={formatNumber(stats?.totalXpEarned ?? 0)}
            icon={HiTrophy}
            color="emerald"
          />
          <StatCard
            label="Weekly Active Users"
            value={stats?.weeklyActiveUsers ?? 0}
            icon={HiArrowTrendingUp}
            color="blue"
          />
        </div>
      )}

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickLinks.map((link, index) => (
          <Link key={link.href} href={link.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-xl bg-slate-900/50 border border-white/10 hover:border-amber-500/30 transition-all group"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-${link.color}-500/20`}
              >
                <link.icon className={`w-6 h-6 text-${link.color}-400`} />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
                {link.label}
              </h3>
              <p className="text-sm text-slate-400 mt-1">{link.description}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  color: string;
}

function StatCard({ label, value, icon: Icon, change, color }: StatCardProps) {
  const colorClasses = {
    violet: "from-amber-500/20 to-amber-600/10 bg-amber-500/20 text-amber-400",
    amber: "from-amber-500/20 to-amber-600/10 bg-amber-500/20 text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-600/10 bg-emerald-500/20 text-emerald-400",
    blue: "from-blue-500/20 to-blue-600/10 bg-blue-500/20 text-blue-400",
  } as const;

  const classes = colorClasses[color as keyof typeof colorClasses] ?? colorClasses.violet;
  const [gradient, iconBg, iconColor] = classes.split(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} border border-white/10 p-5`}
    >
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {change !== undefined && change > 0 && (
        <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
          <HiArrowTrendingUp className="w-3 h-3" />
          +{change} this week
        </div>
      )}
    </motion.div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}





