"use client";

import { motion } from "motion/react";
import { HiCheckCircle, HiClock, HiBookOpen, HiFire } from "react-icons/hi2";
import { Progress } from "@/components/ui/progress";

interface DailyGoalsProps {
  stats?: {
    todayXp: number;
    todayLessons: number;
    todayMinutes: number;
    dailyXpGoal: number;
    dailyLessonsGoal: number;
    dailyMinutesGoal: number;
  } | null;
}

export function DailyGoals({ stats }: DailyGoalsProps) {
  const goals = [
    {
      label: "XP Goal",
      current: stats?.todayXp ?? 0,
      target: stats?.dailyXpGoal ?? 100,
      icon: HiFire,
      color: "amber",
    },
    {
      label: "Lessons",
      current: stats?.todayLessons ?? 0,
      target: stats?.dailyLessonsGoal ?? 3,
      icon: HiBookOpen,
      color: "violet",
    },
    {
      label: "Study Time",
      current: stats?.todayMinutes ?? 0,
      target: stats?.dailyMinutesGoal ?? 30,
      icon: HiClock,
      color: "blue",
      suffix: "min",
    },
  ];

  const allGoalsCompleted = goals.every((g) => g.current >= g.target);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Daily Goals</h3>
        {allGoalsCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-emerald-400 text-sm"
          >
            <HiCheckCircle className="w-4 h-4" />
            Complete!
          </motion.div>
        )}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal, index) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const isComplete = goal.current >= goal.target;

          const colorClasses = {
            amber: {
              icon: "text-amber-400 bg-amber-500/20",
              bar: "bg-amber-500",
            },
            violet: {
              icon: "text-amber-400 bg-amber-500/20",
              bar: "bg-amber-500",
            },
            blue: {
              icon: "text-blue-400 bg-blue-500/20",
              bar: "bg-blue-500",
            },
          };

          const colors = colorClasses[goal.color as keyof typeof colorClasses];

          return (
            <motion.div
              key={goal.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.icon}`}
                >
                  {isComplete ? (
                    <HiCheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <goal.icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{goal.label}</span>
                    <span className="text-sm text-slate-400">
                      {goal.current}
                      {goal.suffix && ` ${goal.suffix}`} / {goal.target}
                      {goal.suffix && ` ${goal.suffix}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-11">
                <Progress
                  value={progress}
                  className="h-2 bg-slate-800"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Motivational message */}
      <div className="mt-4 text-center text-sm text-slate-500">
        {allGoalsCompleted
          ? "🎉 Amazing! You've crushed all goals today!"
          : "Keep going! You're making great progress."}
      </div>
    </motion.div>
  );
}





