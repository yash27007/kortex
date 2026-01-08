"use client";

import { motion } from "motion/react";
import { HiSparkles, HiLockClosed } from "react-icons/hi2";
import { useTRPC, useQuery } from "@/server/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function ProfileBadges() {
  const api = useTRPC();

  // Fetch badges
  const { data: badges, isLoading } = useQuery(api.user.getBadges.queryOptions());

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-40 bg-slate-800 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Earned Badges */}
      <div>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <HiSparkles className="w-5 h-5 text-amber-400" />
          Earned Badges ({badges?.earned?.length ?? 0})
        </h3>

        {badges?.earned && badges.earned.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.earned.map((userBadge: any, index: number) => (
              <motion.div
                key={userBadge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                  {userBadge.badge.imageUrl ? (
                    <img
                      src={userBadge.badge.imageUrl}
                      alt={userBadge.badge.name}
                      className="w-12 h-12"
                    />
                  ) : (
                    <span className="text-3xl">🏆</span>
                  )}
                </div>
                <h4 className="font-semibold text-white mb-1">{userBadge.badge.name}</h4>
                <p className="text-xs text-slate-400 mb-2">{userBadge.badge.description}</p>
                <p className="text-xs text-amber-400">
                  Earned {format(new Date(userBadge.earnedAt), "MMM d, yyyy")}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/50 border border-white/10 rounded-xl">
            <HiSparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No badges earned yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Complete lessons and quizzes to earn badges!
            </p>
          </div>
        )}
      </div>

      {/* Locked Badges */}
      <div>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <HiLockClosed className="w-5 h-5 text-slate-400" />
          Available Badges ({badges?.available?.length ?? 0})
        </h3>

        {badges?.available && badges.available.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.available.map((badge: any, index: number) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center opacity-60 grayscale"
              >
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-slate-700/50 flex items-center justify-center">
                    {badge.imageUrl ? (
                      <img
                        src={badge.imageUrl}
                        alt={badge.name}
                        className="w-12 h-12 opacity-50"
                      />
                    ) : (
                      <span className="text-3xl opacity-50">🏆</span>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-full">
                    <HiLockClosed className="w-6 h-6 text-slate-500" />
                  </div>
                </div>
                <h4 className="font-semibold text-slate-400 mb-1">{badge.name}</h4>
                <p className="text-xs text-slate-500">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">All badges earned! 🎉</p>
        )}
      </div>
    </div>
  );
}





