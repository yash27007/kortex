"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HiTrophy, HiArrowRight } from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";

export function LeaderboardPreview() {
  const api = useTRPC();

  // Fetch top 5 users
  const { data: leaderboard } = useQuery(api.user.getLeaderboard.queryOptions(
    { limit: 5 },
    { staleTime: 1000 * 60 * 5 }
  ));

  const rankColors = {
    1: "text-amber-400 bg-amber-500/20",
    2: "text-slate-300 bg-slate-500/20",
    3: "text-amber-600 bg-amber-600/20",
  };

  const rankEmojis = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiTrophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Leaderboard</h3>
        </div>
        <Link
          href="/leaderboard"
          className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
        >
          Full list <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {(leaderboard?.users ?? []).map((user, index) => {
          const rank = index + 1;
          const rankColor = rankColors[rank as keyof typeof rankColors];
          const emoji = rankEmojis[rank as keyof typeof rankEmojis];

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-2 rounded-lg ${user.isCurrentUser ? "bg-amber-500/10 border border-amber-500/30" : ""
                }`}
            >
              {/* Rank */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rankColor || "text-slate-400 bg-slate-700/50"
                  }`}
              >
                {emoji || rank}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                    {user.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>

              {/* Name & XP */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user.name}
                  {user.isCurrentUser && (
                    <span className="text-xs text-amber-400 ml-1">(You)</span>
                  )}
                </div>
                <div className="text-xs text-slate-500">Level {user.level}</div>
              </div>

              {/* XP */}
              <div className="text-sm font-semibold text-amber-400">
                {formatNumber(user.totalXp)} XP
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}





