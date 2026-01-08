import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, baseProcedure } from '@/server/trpc/init';
import { TRPCError } from '@trpc/server';
import { subDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const userRouter = createTRPCRouter({
  // Get current user's profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      include: {
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
        },
        enrollments: {
          include: { course: true },
          orderBy: { lastAccessedAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            enrollments: true,
            lessonProgress: { where: { status: 'COMPLETED' } },
            badges: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User profile not found. Please complete onboarding.',
      });
    }

    return user;
  }),

  // Get user stats for dashboard
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      select: {
        totalXp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        _count: {
          select: {
            enrollments: { where: { status: 'COMPLETED' } },
            lessonProgress: { where: { status: 'COMPLETED' } },
            badges: true,
          },
        },
      },
    });

    if (!user) {
      return {
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        completedCourses: 0,
        completedLessons: 0,
        badgesEarned: 0,
      };
    }

    return {
      totalXp: user.totalXp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      completedCourses: user._count.enrollments,
      completedLessons: user._count.lessonProgress,
      badgesEarned: user._count.badges,
    };
  }),

  // Get gamification stats for HUD (level progress, etc.)
  getGamificationStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      select: {
        totalXp: true,
        level: true,
        currentStreak: true,
      },
    });

    if (!user) {
      return {
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        levelProgress: 0,
        xpToNextLevel: 1000,
      };
    }

    // Calculate XP thresholds for current and next level
    const { currentLevelXp, nextLevelXp } = getLevelThresholds(user.level);
    const xpInCurrentLevel = user.totalXp - currentLevelXp;
    const xpNeededForLevel = nextLevelXp - currentLevelXp;
    const levelProgress = Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);

    return {
      totalXp: user.totalXp,
      level: user.level,
      currentStreak: user.currentStreak,
      levelProgress,
      xpToNextLevel: nextLevelXp - user.totalXp,
    };
  }),

  // Add XP to user
  addXP: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        reason: z.enum([
          'LESSON_COMPLETE',
          'QUIZ_PASS',
          'QUIZ_PERFECT',
          'COURSE_COMPLETE',
          'BADGE_EARNED',
          'STREAK_BONUS',
          'DAILY_LOGIN',
        ]),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const newXP = user.totalXp + input.amount;
      const newLevel = calculateLevel(newXP);

      // Update user XP and level
      const updatedUser = await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          totalXp: newXP,
          level: newLevel,
          lastActiveAt: new Date(),
        },
      });

      return {
        xp: updatedUser.totalXp,
        level: updatedUser.level,
        leveledUp: newLevel > user.level,
      };
    }),

  // Get XP history
  getXPHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
        select: { id: true },
      });

      if (!user) {
        return { items: [], nextCursor: undefined };
      }

      // XP history model was removed from the schema; return an empty history for now.
      const items: never[] = [];
      const nextCursor: string | undefined = undefined;

      return { items, nextCursor };
    }),

  // Update email preferences
  updateEmailPreferences: protectedProcedure
    .input(
      z.object({
        studyReminders: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
        courseUpdates: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Email preferences have been removed from the schema; treat as a no-op.
      return { emailPreferences: null };
    }),

  // Get user badges
  getBadges: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      select: { id: true },
    });

    if (!user) {
      return { earned: [], available: [] };
    }

    const [earnedBadges, allBadges] = await Promise.all([
      ctx.prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      }),
      ctx.prisma.badge.findMany(),
    ]);

    const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badgeId));
    const availableBadges = allBadges.filter((b) => !earnedBadgeIds.has(b.id));

    return {
      earned: earnedBadges,
      available: availableBadges,
    };
  }),

  // Get dashboard stats
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      select: {
        id: true,
        totalXp: true,
        level: true,
        currentStreak: true,
      },
    });

    if (!user) {
      return null;
    }

    // Get lesson completions this week and today
    const weekAgo = subDays(new Date(), 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      completedCourses,
      completedLessons,
      weeklyLessons,
      todayLessons,
      rank,
    ] = await Promise.all([
      ctx.prisma.enrollment.count({
        where: { userId: user.id, status: 'COMPLETED' },
      }),
      ctx.prisma.lessonProgress.count({
        where: { userId: user.id, status: 'COMPLETED' },
      }),
      ctx.prisma.lessonProgress.findMany({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          completedAt: { gte: weekAgo },
        },
        include: { lesson: { select: { xpReward: true } } },
      }),
      ctx.prisma.lessonProgress.findMany({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          completedAt: { gte: today },
        },
        include: { lesson: { select: { xpReward: true, duration: true } } },
      }),
      ctx.prisma.user.count({
        where: { totalXp: { gt: user.totalXp } },
      }),
    ]);

    const weeklyXpGain = weeklyLessons.reduce((sum, lp) => sum + lp.lesson.xpReward, 0);
    const todayXp = todayLessons.reduce((sum, lp) => sum + lp.lesson.xpReward, 0);
    const todayMinutes = todayLessons.reduce((sum, lp) => sum + lp.lesson.duration, 0);

    return {
      totalXp: user.totalXp,
      level: user.level,
      currentStreak: user.currentStreak,
      completedCourses,
      completedLessons,
      hoursLearned: Math.round(completedLessons * 10 / 60), // Estimate
      weeklyXpGain,
      rank: rank + 1,
      todayXp,
      todayLessons: todayLessons.length,
      todayMinutes,
      dailyXpGoal: 100,
      dailyLessonsGoal: 3,
      dailyMinutesGoal: 30,
    };
  }),

  // Get activity calendar for streak visualization
  getActivityCalendar: protectedProcedure
    .input(z.object({
      month: z.number().min(1).max(12),
      year: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
        select: { id: true },
      });

      if (!user) {
        return { dates: [] };
      }

      const startDate = startOfMonth(new Date(input.year, input.month - 1));
      const endDate = endOfMonth(startDate);

      // Get lesson completions for the month
      const completions = await ctx.prisma.lessonProgress.findMany({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          completedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { completedAt: true },
      });

      // Get unique dates
      const dates = [...new Set(
        completions
          .filter(c => c.completedAt)
          .map(c => format(c.completedAt!, 'yyyy-MM-dd'))
      )];

      return { dates };
    }),

  // Get weekly analytics for chart
  getWeeklyAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { clerkId: ctx.userId },
      select: { id: true },
    });

    if (!user) {
      return null;
    }

    const weekAgo = subDays(new Date(), 7);

    const completions = await ctx.prisma.lessonProgress.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        completedAt: { gte: weekAgo },
      },
      include: {
        lesson: { select: { xpReward: true, duration: true } },
      },
    });

    // Aggregate by day
    const dailyData: Record<string, { xp: number; lessons: number; minutes: number }> = {};
    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), 6 - i), 'EEE');
      dailyData[date] = { xp: 0, lessons: 0, minutes: 0 };
    }

    for (const completion of completions) {
      if (completion.completedAt) {
        const date = format(completion.completedAt, 'EEE');
        if (dailyData[date]) {
          dailyData[date].xp += completion.lesson.xpReward;
          dailyData[date].lessons += 1;
          dailyData[date].minutes += completion.lesson.duration;
        }
      }
    }

    const totalXp = completions.reduce((sum, c) => sum + c.lesson.xpReward, 0);
    const totalMinutes = completions.reduce((sum, c) => sum + c.lesson.duration, 0);

    return {
      daily: Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data,
      })),
      totalXp,
      totalLessons: completions.length,
      totalMinutes,
    };
  }),

  // Get leaderboard
  getLeaderboard: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const currentUser = await ctx.prisma.user.findFirst({
        where: { clerkId: ctx.userId },
        select: { id: true },
      });

      const users = await ctx.prisma.user.findMany({
        take: input.limit,
        orderBy: { totalXp: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          totalXp: true,
          level: true,
        },
      });

      return {
        users: users.map(u => ({
          ...u,
          name: [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Anonymous',
          isCurrentUser: u.id === currentUser?.id,
        })),
      };
    }),
});

// Calculate level based on XP (exponential curve)
function calculateLevel(xp: number): number {
  // Each level requires more XP than the previous
  // Level 1: 0 XP, Level 2: 1000 XP, Level 3: 2500 XP, etc.
  const baseXP = 1000;
  const multiplier = 1.5;

  let level = 1;
  let requiredXP = 0;

  while (xp >= requiredXP) {
    level++;
    requiredXP += Math.floor(baseXP * Math.pow(multiplier, level - 2));
  }

  return level - 1;
}

// Get XP thresholds for a level
function getLevelThresholds(level: number): { currentLevelXp: number; nextLevelXp: number } {
  const baseXP = 1000;
  const multiplier = 1.5;

  let currentLevelXp = 0;
  for (let i = 1; i < level; i++) {
    currentLevelXp += Math.floor(baseXP * Math.pow(multiplier, i - 1));
  }

  const nextLevelXp = currentLevelXp + Math.floor(baseXP * Math.pow(multiplier, level - 1));

  return { currentLevelXp, nextLevelXp };
}
