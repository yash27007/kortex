"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { HiChartBar, HiArrowLeft, HiUsers, HiBookOpen, HiTrophy, HiArrowTrendingUp } from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";

function useAdminAnalytics() {
  const api = useTRPC();
  return useQuery(api.admin.getAnalytics.queryOptions(undefined, { staleTime: 1000 * 60 * 5 }));
}

const COLORS = ['#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899'];

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <Skeleton className="h-96 w-full bg-slate-800 rounded-xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center text-slate-400">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <HiChartBar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
            <p className="text-slate-400">
              Comprehensive insights into platform performance
            </p>
          </div>
        </div>
      </motion.header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
            <HiUsers className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.users.total.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">
              +{data.users.newLast7Days} new this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Published Courses</CardTitle>
            <HiBookOpen className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.courses.published}</div>
            <p className="text-xs text-slate-500 mt-1">
              {data.courses.totalEnrollments.toLocaleString()} total enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total XP Earned</CardTitle>
            <HiTrophy className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data.learning.totalXpEarned.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data.learning.lessonsCompleted.toLocaleString()} lessons completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Users (7d)</CardTitle>
            <HiArrowTrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.users.activeLast7Days}</div>
            <p className="text-xs text-slate-500 mt-1">
              {data.users.activeLast30Days} active in last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Growth (Last 30 Days)</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: "Users" } }} className="h-[300px]">
              <BarChart data={data.users.dailyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* XP Distribution */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">XP Distribution</CardTitle>
            <CardDescription>User XP ranges across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: "Users" } }} className="h-[300px]">
              <PieChart>
                <Pie
                  data={data.learning.xpDistribution}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.range}: ${entry.count}`}
                >
                  {data.learning.xpDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Top Courses by Enrollment</CardTitle>
          <CardDescription>Most popular courses on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.courses.topCourses.length > 0 ? (
              data.courses.topCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{course.title}</div>
                      <div className="text-sm text-slate-500">{course.slug}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-400">
                      {course.enrollments.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">enrollments</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">No course data available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




