"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HiSparkles, HiArrowRight, HiLockClosed } from "react-icons/hi2";

interface UserBadge {
  id: string;
  earnedAt: Date;
  badge: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
}

interface BadgesShowcaseProps {
  badges: UserBadge[];
}

// Sample locked badges to show progress
const lockedBadges = [
  { name: "Speed Learner", description: "Complete 10 lessons in one day", icon: "⚡" },
  { name: "Night Owl", description: "Study after midnight", icon: "🦉" },
  { name: "Perfectionist", description: "Get 100% on 5 quizzes", icon: "💯" },
];

export function BadgesShowcase({ badges }: BadgesShowcaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HiSparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Badges</h3>
          <span className="text-sm text-slate-500">({badges.length} earned)</span>
        </div>
        <Link
          href="/profile?tab=badges"
          className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
        >
          View all <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Badges Grid */}
      <div className="flex flex-wrap gap-3">
        {/* Earned badges */}
        {badges.slice(0, 6).map((userBadge, index) => (
          <motion.div
            key={userBadge.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1, type: "spring" }}
            className="group relative"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
              {userBadge.badge.imageUrl ? (
                <img
                  src={userBadge.badge.imageUrl}
                  alt={userBadge.badge.name}
                  className="w-10 h-10"
                />
              ) : (
                <span className="text-2xl">🏆</span>
              )}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
              <div className="text-sm font-medium text-white">{userBadge.badge.name}</div>
              <div className="text-xs text-slate-400">{userBadge.badge.description}</div>
            </div>
          </motion.div>
        ))}

        {/* Locked badges */}
        {lockedBadges.slice(0, Math.max(0, 6 - badges.length)).map((badge, index) => (
          <motion.div
            key={badge.name}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (badges.length + index) * 0.1 }}
            className="group relative"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center opacity-40 grayscale">
              <span className="text-2xl">{badge.icon}</span>
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl">
                <HiLockClosed className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
              <div className="text-sm font-medium text-white">{badge.name}</div>
              <div className="text-xs text-slate-400">{badge.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}





