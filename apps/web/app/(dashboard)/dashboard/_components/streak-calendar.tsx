"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { HiFire, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  subMonths,
  addMonths,
  getDay,
  isBefore,
} from "date-fns";
import { useTRPC, useQuery } from "@/server/trpc/client";

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCalendar({ currentStreak, longestStreak }: StreakCalendarProps) {
  const api = useTRPC();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch activity data for the month
  const { data: activity } = useQuery(api.user.getActivityCalendar.queryOptions(
    {
      month: currentMonth.getMonth() + 1,
      year: currentMonth.getFullYear(),
    },
    { staleTime: 1000 * 60 * 5 }
  ));

  const activeDates = useMemo(() => {
    if (!activity?.dates) return new Set<string>();
    return new Set(activity.dates.map((d: string) => d));
  }, [activity]);

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding for first week
  const startPadding = getDay(monthStart);
  const paddingDays = Array(startPadding).fill(null);

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiFire className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-white">Streak Calendar</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevMonth}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <HiChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-sm text-slate-300 min-w-[100px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <HiChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Current:</span>
          <span className="text-orange-400 font-semibold">{currentStreak} days</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Best:</span>
          <span className="text-amber-400 font-semibold">{longestStreak} days</span>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-xs text-slate-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding days */}
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {/* Actual days */}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isActive = activeDates.has(dateStr);
          const isCurrentDay = isToday(day);
          const isPast = isBefore(day, new Date()) && !isCurrentDay;

          return (
            <motion.div
              key={dateStr}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Math.random() * 0.2 }}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm relative ${isActive
                ? "bg-orange-500/30 text-orange-300"
                : isCurrentDay
                  ? "bg-amber-500/20 text-amber-300 ring-2 ring-amber-500"
                  : isPast
                    ? "text-slate-600"
                    : "text-slate-500"
                }`}
            >
              {format(day, "d")}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 text-xs"
                >
                  🔥
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500/30" />
          <span>Active day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded ring-2 ring-amber-500" />
          <span>Today</span>
        </div>
      </div>
    </motion.div>
  );
}





