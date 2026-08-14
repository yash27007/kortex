"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiTrophy, HiFire, HiSparkles, HiArrowUp } from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";

interface XPNotification {
  id: string;
  amount: number;
}

export function GamificationHUD() {
  const api = useTRPC();
  const [xpNotifications, setXpNotifications] = useState<XPNotification[]>([]);

  // Fetch user gamification stats
  const { data: stats } = useQuery(api.user.getGamificationStats.queryOptions(undefined, {
    staleTime: 1000 * 30, // 30 seconds
  }));

  // Listen for XP events (would connect to a real event system)
  useEffect(() => {
    const handleXPGain = (event: CustomEvent<{ amount: number }>) => {
      const id = `xp-${Date.now()}`;
      setXpNotifications((prev) => [...prev, { id, amount: event.detail.amount }]);

      // Remove after animation
      setTimeout(() => {
        setXpNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 2000);
    };

    window.addEventListener("xp-gained" as any, handleXPGain as any);
    return () => window.removeEventListener("xp-gained" as any, handleXPGain as any);
  }, []);

  return (
    // top-20 (not top-4) clears the global fixed Navbar (h-16) above this
    // route — being `fixed` itself, this ignores <main>'s pt-16 and needs
    // its own offset.
    <div className="fixed top-20 right-4 z-50 flex items-center gap-3">
      {/* XP Notifications */}
      <div className="absolute -left-20 top-0 w-20">
        <AnimatePresence>
          {xpNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="flex items-center gap-1 text-amber-400 font-bold text-lg"
            >
              <HiArrowUp className="w-4 h-4" />
              <span>+{notification.amount}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Streak Counter */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10"
      >
        <motion.div
          animate={{
            scale: stats?.currentStreak ? [1, 1.2, 1] : 1,
            rotate: stats?.currentStreak ? [0, 5, -5, 0] : 0,
          }}
          transition={{ duration: 0.5, repeat: stats?.currentStreak ? Infinity : 0, repeatDelay: 2 }}
        >
          <HiFire className={`w-5 h-5 ${stats?.currentStreak ? "text-orange-500" : "text-slate-500"}`} />
        </motion.div>
        <span className="text-sm font-semibold text-white">
          {stats?.currentStreak ?? 0}
        </span>
      </motion.div>

      {/* Level & XP */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 px-4 py-2 bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10"
      >
        {/* Level Badge */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-900">
              {stats?.level ?? 1}
            </span>
          </div>
          {/* Level ring progress */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-700"
            />
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={113.1} // 2 * π * 18
              strokeDashoffset={113.1 * (1 - (stats?.levelProgress ?? 0) / 100)}
              className="text-amber-500"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* XP Display */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <HiTrophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-white">
              {formatNumber(stats?.totalXp ?? 0)} XP
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {stats?.xpToNextLevel ?? 0} to Lvl {(stats?.level ?? 1) + 1}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// XP Animation component (for use after completing lessons)
export function XPGainAnimation({ amount }: { amount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 2, y: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [2, 1, 1, 0.8],
        y: [0, 0, -50, -100],
      }}
      transition={{ duration: 2, times: [0, 0.2, 0.7, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
    >
      <div className="flex items-center gap-2 text-5xl font-black">
        <HiSparkles className="text-amber-400" />
        <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          +{amount} XP
        </span>
      </div>
    </motion.div>
  );
}

// Helper to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

// Dispatch XP gain event (call from lesson completion)
export function dispatchXPGain(amount: number) {
  window.dispatchEvent(new CustomEvent("xp-gained", { detail: { amount } }));
}





